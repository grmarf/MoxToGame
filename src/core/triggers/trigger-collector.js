import { effectiveTypes, calculateCharacteristics } from '../continuous-effects.js';
/**
 * V8.5 — Triggered Ability Collector
 *
 * Converts canonical game events into stack-ready trigger objects.
 * A trigger source is a permanent/card with `abilities` or `triggers`.
 *
 * Supported trigger descriptors:
 *   { event: "creatureDied", effect: ... }
 *   { event: "spellCast", effect: ... }
 *   { event: "permanentEntered", effect: ... }
 *
 * `condition` may be a function(event, context) => boolean.
 * `createStackItem` may be supplied for advanced/custom stack integration.
 */
function sameStableIdentity(a, b, explicitId = null) {
  if (a === b) return true;
  const aIds = [a?.uid, a?.objectId, a?.id].filter(Boolean);
  const bIds = [b?.uid, b?.objectId, b?.id].filter(Boolean);
  if (explicitId && bIds.includes(explicitId)) return true;
  return aIds.some(id => bIds.includes(id));
}

/**
 * V12.59 (fix BUG-04) : correspondance générique par clé, au lieu d'un
 * switch sur un champ `condition.kind` qu'aucune carte du projet
 * n'utilise (audit exhaustif fait avant cette correction : seules les
 * clés sourceSelf, controllerUpkeep, targetType, enchantedSource sont
 * réellement présentes dans les définitions de cartes). Toutes les clés
 * présentes dans `condition` doivent être satisfaites (ET logique) ; une
 * condition qui ne porte aucune clé reconnue correspond toujours.
 */
function matchesCondition(condition, event, context) {
  // Compatibilité ascendante avec l'ancien format `kind` (conservé au cas
  // où un appelant l'utiliserait encore -- aucune carte du projet ne le
  // fait à ce jour, seul un test unitaire de non-régression le vérifie).
  if (condition.kind) {
    switch (condition.kind) {
      case "combatDamageToPlayer":
        if (!(event.damageKind === "combat" && event.targetType === "player")) return false;
        break;
      case "controllerUpkeep":
        if (event.side !== context.controller) return false;
        break;
      default:
        return false;
    }
  }

  if (condition.sourceSelf) {
    const actor = event.source ?? event.permanent;
    // Certains événements globaux (ex. upkeepStarted) ne portent aucune
    // référence d'acteur -- rien à comparer, la condition ne peut pas être
    // mise en défaut par cette clé sur ces événements-là. Le véritable
    // filtre pour ce cas est `controllerUpkeep`, vérifié séparément.
    if (actor && !sameStableIdentity(actor, context.source, event.sourceId)) return false;
  }

  // V12.76 (G12) : « si ce terrain est engagé » (terrains de stockage : marqueur à l'entretien seulement s'il est engagé).
  if (condition.sourceTapped === true && !context.source?.tapped) return false;

  if ("controllerUpkeep" in condition) {
    const isControllerUpkeep = event.side === context.controller;
    if (condition.controllerUpkeep === true && !isControllerUpkeep) return false;
    if (condition.controllerUpkeep === false && isControllerUpkeep) return false;
  }

  // V12.75 : « à l'entretien du contrôleur du permanent ENCHANTÉ » (Warp Artifact). L'ancienne condition
  // `controllerUpkeep: false` visait « l'adversaire du contrôleur de l'Aura » : aucun dégât si l'Aura
  // enchantait un artefact de son propre contrôleur.
  if (condition.enchantedControllerUpkeep) {
    const st = context.state; const attachedUid = context.source?.attachedTo;
    const host = st && attachedUid ? ['player', 'ai'].flatMap((sd) => (st[sd]?.battlefield || []).map((pm) => [sd, pm])).find(([, pm]) => pm.uid === attachedUid) : null;
    if (!host || event.side !== host[0]) return false;
  }

  // V12.76 (G20) : Haunting Wind — « chaque fois qu'un ARTEFACT devient engagé » / « capacité d'artefact activée SANS {T} dans son coût ».
  if (condition.permanentIsArtifact) {
    const perm = event.permanent;
    let isArt = /\bArtifact\b/i.test(String(perm?.type || ''));
    try { if (perm && context.state) isArt = /\bArtifact\b/i.test(String(effectiveTypes(context.state, perm).type || '')); } catch { /* repli sur le type imprimé */ }
    if (!isArt) return false;
  }
  if (condition.withoutTapCost && event.tapCost !== false) return false;

  // V12.76 (G16) : « à chaque fois que le permanent ENCHANTÉ devient engagé » (Psychic Venom, Blight...).
  if (condition.enchantedBecomesTapped) {
    const hostUid = context.source?.attachedTo;
    if (!hostUid || !event.permanent || !sameStableIdentity(event.permanent, { uid: hostUid })) return false;
  }

  // V12.76 (G32) : Howling Mine (« si cet artefact est dégagé ») et Iron Star & sœurs (« chaque fois qu'un joueur lance un sort [couleur] »).
  if (condition.sourceUntapped && context.source?.tapped) return false;
  if (condition.spellColor && !(event.card?.color || []).includes(condition.spellColor)) return false;
  // V12.76 (G30) : Erg Raiders — « au début de VOTRE étape de fin, s'il n'a pas attaqué ce tour, sauf s'il est arrivé / passé sous votre contrôle ce tour ».
  if (condition.controllerEndStep && event.activePlayer !== context.controller) return false;
  if (condition.sourceDidNotAttackThisTurn && context.source?.attackedTurn === context.state?.turnNumber) return false;
  if (condition.sourceNotUnderControlThisTurn) {
    const t = context.state?.turnNumber; const s = context.source;
    if ((s?.enteredTurn != null && s.enteredTurn >= t) || (s?.controlChangedTurn != null && s.controlChangedTurn >= t)) return false;
  }
  // V12.76 (G28) : « chaque fois que la créature enchantée bloque ou est bloquée par une créature [non-Mur | d'endurance <= N] » (Venom, Infinite Authority).
  if (condition.enchantedInBlock) {
    const hostUid = context.source?.attachedTo; if (!hostUid) return false;
    const other = event.attacker && sameStableIdentity(event.attacker, { uid: hostUid }) ? event.blocker : (event.blocker && sameStableIdentity(event.blocker, { uid: hostUid }) ? event.attacker : null);
    if (!other) return false;
    if (condition.otherNotSubtype && String(other.subtype || '').toLowerCase().split(/\s+/).includes(String(condition.otherNotSubtype).toLowerCase())) return false;
    if (condition.otherMaxToughness != null && !(calculateCharacteristics(context.state, other).toughness <= condition.otherMaxToughness)) return false;
  }
  // Farrel's Mantle : « chaque fois que la créature enchantée attaque et n'est pas bloquée ».
  if (condition.enchantedUnblocked) {
    const hostUid = context.source?.attachedTo; if (!hostUid || !event.attacker || !sameStableIdentity(event.attacker, { uid: hostUid })) return false;
  }
  // Backfire : « chaque fois que la créature enchantée VOUS (contrôleur de l'Aura) inflige des blessures ».
  if (condition.damagedYouByEnchanted) {
    const hostUid = context.source?.attachedTo; if (!hostUid || !event.source || !sameStableIdentity(event.source, { uid: hostUid })) return false;
    if (event.target !== context.controller || !(Number(event.amount) > 0)) return false;
  }

  if ("targetType" in condition && event.targetType !== condition.targetType) {
    return false;
  }

  if (condition.enchantedSource) {
    const diedPermanent = event.permanent;
    if (!diedPermanent || !context.source?.isAura) return false;
    // V12.60 : `context.source.attachedTo` peut avoir été réécrit par
    // zone-manager.js vers la NOUVELLE identité (cimetière) du permanent qui
    // vient de mourir (voir zone-manager.js#move(), synchronisation des
    // références externes). On accepte donc une correspondance sur l'ancienne
    // identité (event.permanent.uid) OU sur la nouvelle (event.graveyardUid).
    const matchesOldUid = diedPermanent.uid === context.source.attachedTo;
    const matchesNewUid = event.graveyardUid && event.graveyardUid === context.source.attachedTo;
    if (!matchesOldUid && !matchesNewUid) return false;
  }

  if (condition.controllerSelf && event.side !== context.controller) {
    return false;
  }

  return true;
}

export class TriggerCollector {
  constructor({ eventBus, stack, getGameState = () => null } = {}) {
    if (!eventBus) throw new Error("TriggerCollector requires an eventBus");
    this.eventBus = eventBus;
    this.stack = stack;
    this.getGameState = getGameState;
    this.registrations = new Map();
    this.unsubscribers = new Map();
  }

  registerSource(source, controller, descriptors = null) {
    const list = descriptors || [
      ...(Array.isArray(source?.triggers) ? source.triggers : []),
      ...(Array.isArray(source?.abilities) ? source.abilities.filter(a => a?.event) : []),
      ...(source?.upkeepTrigger ? [{ event: 'upkeepStarted', condition: { kind: 'controllerUpkeep', controllerSelf: true }, effect: source.upkeepTrigger }] : []),
    ];
    const normalized = list
      .filter(Boolean)
      .map(d => ({ ...d, source, controller }));

    this.registrations.set(source, normalized);

    return normalized;
  }

  unregisterSource(source) {
    this.registrations.delete(source);
  }

  /**
   * V12.75 : un permanent a QUITTÉ le champ de bataille. Ses déclencheurs ne doivent plus réagir aux événements futurs
   * (Black Vise ou The Rack détruits continuaient d'infliger des blessures), MAIS ils doivent encore voir l'événement de mort
   * qui vient de se produire dans la même résolution (Creature Bond : l'Aura est défaussée par les actions d'état AVANT
   * l'émission de `creatureDied`, et son déclencheur doit tout de même se produire : règle de « regard en arrière »).
   * On marque donc la source ; elle est retirée dès le premier événement qui n'est pas un événement de regard en arrière.
   */
  markSourceLeft(source) {
    const list = this.registrations.get(source); if (!list) return;
    for (const d of list) d.sourceLeft = true;
  }

  markSourceLeftByObjectId(objectId) {
    if (objectId == null) return;
    for (const [src, list] of this.registrations) if (src?.objectId === objectId) for (const d of list) d.sourceLeft = true;
  }

  #pruneLeft() {
    for (const [src, list] of [...this.registrations]) if (list.length && list.every((d) => d.sourceLeft)) this.registrations.delete(src);
  }

  clear() {
    for (const unsubscribe of this.unsubscribers.values()) unsubscribe();
    this.unsubscribers.clear();
    this.registrations.clear();
  }

  collect(event) {
    const triggers = [];
    const LOOKBACK = new Set(['creatureDied', 'permanentLeft', 'zoneChanged', 'leavesBattlefield']);
    if (!LOOKBACK.has(event.type)) this.#pruneLeft();

    for (const descriptors of this.registrations.values()) {
      for (const descriptor of descriptors) {
        if (descriptor.event !== event.type) continue;

        const context = {
          event,
          source: descriptor.source,
          controller: descriptor.controller,
          state: this.getGameState()
        };

        if (typeof descriptor.condition === "function" &&
            !descriptor.condition(event, context)) {
          continue;
        }

        if (descriptor.condition && typeof descriptor.condition === "object" &&
            !matchesCondition(descriptor.condition, event, context)) {
          continue;
        }

        triggers.push(this.#toStackItem(descriptor, context));
      }
    }

    return triggers;
  }

  collectAndPush(event) {
    // Kept for compatibility. TriggerEngine is the single owner of trigger
    // collection, APNAP ordering and stack insertion; pushing here would
    // create duplicate triggers.
    return this.collect(event);
  }

  #toStackItem(descriptor, context) {
    if (typeof descriptor.createStackItem === "function") {
      return descriptor.createStackItem(context);
    }

    return {
      type: "triggeredAbility",
      source: descriptor.source,
      controller: descriptor.controller,
      triggerEvent: context.event,
      effect: descriptor.effect,
      description: descriptor.description || null
    };
  }

  #subscribe(eventType) {
    if (!eventType || this.unsubscribers.has(eventType)) return;

    const unsubscribe = this.eventBus.on(eventType, event => {
      this.collectAndPush(event);
    });

    this.unsubscribers.set(eventType, unsubscribe);
  }

  #refreshSubscriptions() {
    const required = new Set();
    for (const descriptors of this.registrations.values()) {
      for (const d of descriptors) if (d.event) required.add(d.event);
    }

    for (const [event, unsubscribe] of this.unsubscribers) {
      if (!required.has(event)) {
        unsubscribe();
        this.unsubscribers.delete(event);
      }
    }

    for (const event of required) this.#subscribe(event);
  }
}
