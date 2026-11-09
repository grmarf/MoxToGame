// @ts-check
/**
 * @fileoverview MTG Beta V8.15 — State-Based Actions (SBA) Extended
 * Full CR 704 implementation including:
 * 704.5a: 0 life
 * 704.5b: draw from empty library
 * 704.5f: toughness <= 0
 * 704.5g: lethal damage
 * 704.5i: Planeswalker uniqueness
 * 704.5j: Legend rule
 * 704.5k: +1/+1 and -1/-1 counter annihilation
 * 704.5m: Poison (10+ counters = lose)
 * 704.5n: Aura illegal attachment
 * 704.5d: Token outside battlefield
 */

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Permanent} Permanent */

import { gameEvents } from './event-bus.js';
import { tapPermanent } from './permanent-tap.js';
import { calculateCharacteristics } from './continuous-effects.js';

/**
 * @typedef {Object} SBAEvent
 * @property {string} type
 * @property {Permanent} [permanent]
 * @property {string} [side]
 * @property {string} [reason]
 * @property {Object} [data]
 */

export class StateBasedActions {
  /**
   * @param {Object} [deps]
   * @param {Function} [deps.legacyCheck]
   */
  constructor({ legacyCheck, zones = null, choiceService = null } = {}) {
    this.legacyCheck = legacyCheck;
    this.zones = zones;
    this.choiceService = choiceService;
  }
  /**
   * Put a permanent into its owner's graveyard via ZoneManager if available,
   * otherwise fallback by uid (never by JS reference).
   */
  #putIntoGraveyard(perm, side, reason, events, state) {
    let movedObject = null;
    let lkToughness = null; // V12.76 (G20) : dernière endurance connue AVANT le déplacement (Creature Bond)
    try { lkToughness = calculateCharacteristics(state, perm).toughness; } catch { lkToughness = perm.toughness ?? null; }
    if (this.zones) {
      movedObject = this.zones.moveToGraveyard(perm, { toSide: perm.owner || side, reason: 'stateBasedAction' });
    } else {
      const uid = perm.uid;
      state[side].battlefield = state[side].battlefield.filter((p) => p.uid !== uid);
      state[side].graveyard.push(perm);
    }
    perm.destroyed = true;
    // V12.60 (fix découvert en corrigeant BUG-04) : `permanent` reste la
    // référence PRÉ-déplacement (comportement inchangé, pour ne rien casser
    // chez les autres auditeurs de cet événement). `graveyardUid` est ajouté
    // en plus : c'est la nouvelle identité attribuée par ZoneManager, celle
    // que zone-manager.js#move() utilise aussi pour réécrire `attachedTo`
    // des auras qui enchantaient ce permanent (voir zone-manager.js, "Bug 10
    // : préserver attachedTo et mettre à jour les références externes"). Sans
    // ce champ, une aura dont `attachedTo` a été réécrit vers la nouvelle
    // identité du cimetière ne peut plus être reconnue comme correspondant
    // au permanent mort par une condition `enchantedSource` qui ne compare
    // qu'à l'ancienne identité.
    events.push({ type: 'creatureDied', permanent: perm, graveyardUid: movedObject?.uid || null, side, reason, toughness: lkToughness });
  }


  /**
   * Run all applicable state-based actions.
   * V12.58 (fix AUDIT-15) : boucle jusqu'à stabilisation (règle 704.3) au lieu
   * d'un unique passage -- un passage peut créer une nouvelle condition de SBA
   * (ex. une aura détruite par la règle des légendes fait retomber l'endurance
   * effective d'une créature déjà examinée dans ce même appel).
   * @param {GameState} state
   * @returns {SBAEvent[]} events generated (tous passages confondus)
   */
  check(state) {
    const allEvents = [];
    const MAX_PASSES = 50;
    let pass = 0;
    let passEvents;
    do {
      passEvents = this.#runOnePass(state);
      passEvents.forEach((evt) => gameEvents.emit(evt));
      allEvents.push(...passEvents);
      pass++;
      if (pass >= MAX_PASSES) {
        console.warn(`StateBasedActions#check: plafond de sécurité atteint (${MAX_PASSES} passages) -- arrêt forcé de la boucle, vérifier une éventuelle boucle infinie.`);
        break;
      }
    } while (passEvents.length > 0);

    if (allEvents.length === 0 && this.legacyCheck) {
      this.legacyCheck();
    }

    return allEvents;
  }

  /**
   * Un seul passage de toutes les sous-vérifications SBA, sans émission
   * d'événements (l'émission est faite par check() après chaque passage).
   * @param {GameState} state
   * @returns {SBAEvent[]}
   */
  #runOnePass(state) {
    const events = [];
    events.push(...this.#checkPlayerLost(state));
    events.push(...this.#checkDrawFromEmptyLibrary(state));
    events.push(...this.#checkCreatureDeath(state));
    events.push(...this.#checkPlaneswalkerUniqueness(state));
    events.push(...this.#checkLegendRule(state));
    events.push(...this.#checkWorldRule(state));
    events.push(...this.#checkCounterAnnihilation(state));
    events.push(...this.#checkPoison(state));
    events.push(...this.#checkAurasAttachedToIllegal(state));
    events.push(...this.#checkControlAurasLeft(state));
    events.push(...this.#checkTokenInNonBattlefield(state));
    events.push(...this.#checkSacrificeUnlessControls(state));
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5a — Player at 0 or less life loses
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkPlayerLost(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      if (state[side].life <= 0 && !state[side].hasLost) {
        state[side].hasLost = true;
        events.push({ type: 'playerLost', side, reason: 'zeroOrLessLife' });
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5b — Draw from empty library
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkDrawFromEmptyLibrary(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      if (state[side].mustDraw && state[side].library.length === 0) {
        state[side].hasLost = true;
        events.push({ type: 'playerLost', side, reason: 'drawFromEmptyLibrary' });
        state[side].mustDraw = false;
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5f/g — Creature death
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  // V12.76 — « Quand vous ne contrôlez pas d'Île, sacrifiez ce permanent » (Pirate Ship) : déclencheur d'état traité comme action d'état.
  #checkSacrificeUnlessControls(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      for (const perm of [...state[side].battlefield]) {
        const st = [].concat(perm.static || []).find((e) => e && e.type === 'sacrificeUnlessControls');
        if (!st) continue;
        const has = state[side].battlefield.some((q) => String(calculateCharacteristics(state, q).subtype || '').split(/\s+/).includes(st.subtype));
        if (!has) this.#putIntoGraveyard(perm, side, 'sacrificeUnlessControls', events, state);
      }
    }
    return events;
  }

  #checkCreatureDeath(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      const toDestroy = [];
      for (const perm of state[side].battlefield) {
        if (!String(perm.type || '').includes('Creature')) continue;
        const effectiveToughness = this.#effectiveToughness(state, perm);
        if (effectiveToughness <= 0) {
          // 704.5f: regeneration cannot replace death from 0 or less toughness.
          toDestroy.push(perm);
        } else if ((perm.damageMarked || 0) >= effectiveToughness && !calculateCharacteristics(state, perm).keywords.includes('indestructible')) { // V12.76 (G27) : indestructible
          // 704.5g: regeneration may replace lethal damage.
          if (perm.regenShield) {
            perm.regenShield = false;
            perm.damageMarked = 0;
            tapPermanent(state, perm, { reason: 'regeneration', side });
            events.push({ type:'regenerationUsed', permanent:perm, side, reason:'regenerationShield' });
          } else {
            toDestroy.push(perm);
          }
        }
      }
      for (const perm of toDestroy) {
        this.#putIntoGraveyard(perm, side, perm.damageMarked > 0 ? 'lethalDamage' : 'zeroOrLessToughness', events, state);
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5i — Planeswalker uniqueness
  // If a player controls two or more Planeswalkers with the same
  // subtype, that player chooses one and the rest are put into
  // their owners' graveyards.
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkPlaneswalkerUniqueness(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      const pws = state[side].battlefield.filter((p) =>
        String(p.type || '').includes('Planeswalker')
      );
      const bySubtype = {};
      for (const pw of pws) {
        // subtype is stored in p.subtype or extracted from name
        const subtype = pw.subtype || pw.name;
        bySubtype[subtype] = (bySubtype[subtype] || []).concat(pw);
      }
      for (const [subtype, perms] of Object.entries(bySubtype)) {
        if (perms.length > 1) {
          const keep = this.choiceService?.request({
            type: 'planeswalker-choose',
            controller: side,
            prompt: `Choisissez un planeswalker ${subtype} à garder.`,
            options: perms,
            min: 1,
            max: 1,
            defaultValue: perms[0],
          }) || perms[0];
          const toDestroy = perms.filter(p => p !== keep);
          for (const perm of toDestroy) {
            this.#putIntoGraveyard(perm, side, `duplicate subtype ${subtype}`, events, state);
            events[events.length - 1].type = 'planeswalkerUniqueness';
          }
        }
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5j — Legend rule
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkLegendRule(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      // BUG L (audit v12.66) : le type était lu en statique (p.type) alors que
      // le reste des SBA passe par calculateCharacteristics. Un type modifié
      // par effet continu (calque 4 : légendaire perdu ou accordé) est donc
      // désormais respecté.
      const legends = state[side].battlefield.filter((p) =>
        String(calculateCharacteristics(state, p).type || '').includes('Legendary')
      );
      const byName = {};
      for (const l of legends) {
        byName[l.name] = (byName[l.name] || []).concat(l);
      }
      for (const [name, perms] of Object.entries(byName)) {
        if (perms.length > 1) {
          const keep = this.choiceService?.request({
            type: 'legend-choose',
            controller: side,
            prompt: `Choisissez une légende ${name} à garder.`,
            options: perms,
            min: 1,
            max: 1,
            defaultValue: perms[0],
          }) || perms[0];
          const toDestroy = perms.filter(p => p !== keep);
          for (const perm of toDestroy) {
            this.#putIntoGraveyard(perm, side, `duplicate ${name}`, events, state);
            events[events.length - 1].type = 'legendRule';
          }
        }
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // V12.76 (G17) — World rule (règle des Mondes, 704.5k de l'époque) : si plusieurs permanents ont le supertype World,
  // tous sauf celui qui l'est depuis le moins longtemps (le plus récent) vont au cimetière. Égalité parfaite : tous partent.
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkWorldRule(state) {
    const events = [];
    const worlds = [];
    for (const side of ['player', 'ai']) {
      for (const p of state[side].battlefield) {
        if (/\bWorld\b/.test(String(calculateCharacteristics(state, p).type || ''))) worlds.push({ p, side });
      }
    }
    if (worlds.length < 2) return events;
    const newest = Math.max(...worlds.map((w) => w.p.enterSeq || 0));
    const atNewest = worlds.filter((w) => (w.p.enterSeq || 0) === newest);
    for (const w of worlds) {
      if ((w.p.enterSeq || 0) === newest && atNewest.length === 1) continue;
      this.#putIntoGraveyard(w.p, w.side, 'world rule', events, state);
      events[events.length - 1].type = 'worldRule';
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5k — +1/+1 and -1/-1 counter annihilation
  // If a permanent has both +1/+1 and -1/-1 counters,
  // remove pairs until only one type remains.
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkCounterAnnihilation(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      for (const perm of state[side].battlefield) {
        if (!perm.counters) continue;
        const plus = perm.counters.filter((c) => c.type === '+1/+1').length;
        const minus = perm.counters.filter((c) => c.type === '-1/-1').length;
        const pairs = Math.min(plus, minus);
        if (pairs > 0) {
          // Remove pairs
          let removedPlus = 0;
          let removedMinus = 0;
          perm.counters = perm.counters.filter((c) => {
            if (c.type === '+1/+1' && removedPlus < pairs) {
              removedPlus++;
              return false;
            }
            if (c.type === '-1/-1' && removedMinus < pairs) {
              removedMinus++;
              return false;
            }
            return true;
          });
          events.push({
            type: 'counterAnnihilation',
            permanent: perm,
            side,
            data: { pairsRemoved: pairs },
          });
        }
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5m — Poison (10+ poison counters = lose)
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkPoison(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      const poison = state[side].poison || 0;
      if (poison >= 10) {
        state[side].hasLost = true;
        events.push({ type: 'playerLost', side, reason: 'poison' });
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5n — Aura attached to illegal object
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkAurasAttachedToIllegal(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      for (const perm of state[side].battlefield) {
        // V12.75 : une Aura de la base a type 'Enchantment' et sous-type 'Aura' (jamais 'Aura' dans type) ;
        // l'ancien test sur `type` seul ne reconnaissait aucune Aura, qui restaient en jeu orphelines.
        if (!(perm.isAura || /Aura/i.test(String(perm.type || '')) || /Aura/i.test(String(perm.subtype || '')))) continue;
        // Check if attached permanent still exists and is legal
        if (perm.attachedTo) {
          const allPerms = [...state.player.battlefield, ...state.ai.battlefield];
          const target = allPerms.find((p) => p.uid === perm.attachedTo);
          if (!target) {
            // Target left battlefield — put aura in graveyard
            this.#putIntoGraveyard(perm, side, 'targetLeftBattlefield', events, state);
            events[events.length - 1].type = 'auraDetached';
          } else {
            // V12.76 (G27) : Consecrate Land — une AUTRE Aura attachée à ce permanent est illégale (mise au cimetière par les actions d'état).
            const grants = (a) => { const e = a.effect; return e?.type === 'addKeyword' && [].concat(e.keywords || e.keyword || []).includes('cantbeenchantedbyotherauras'); };
            if (calculateCharacteristics(state, target).keywords.includes('cantbeenchantedbyotherauras')
                && allPerms.some((b) => b !== perm && b.attachedTo === target.uid && grants(b))) {
              this.#putIntoGraveyard(perm, side, 'auraIllegal', events, state);
              events[events.length - 1].type = 'auraDetached';
            }
          }
        }
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // Aura-granted control ends when the Aura leaves the battlefield.
  // Control changes are not zone changes, so restore the permanent in-place
  // rather than moving it through ZoneManager (which would change its UID).
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkControlAurasLeft(state) {
    const events = [];
    const all = [...state.player.battlefield, ...state.ai.battlefield];
    const auraUids = new Set(all.filter(p => p?.isAura && p?.controlledPermanentUid).map(p => p.uid));
    for (const side of ['player', 'ai']) {
      for (const perm of [...state[side].battlefield]) {
        const auraUid = perm.controlGrantedByAuraUid;
        if (!auraUid || auraUids.has(auraUid)) continue;
        const original = perm.controlGrantOriginalController || perm.owner;
        if (!original || !state[original]) continue;
        if (original !== side) {
          if (this.zones) this.zones.changeController(perm, original, { reason: 'controlGrantEnded' });
          else {
            const idx = state[side].battlefield.indexOf(perm);
            if (idx >= 0) state[side].battlefield.splice(idx, 1);
            state[original].battlefield.push(perm);
          }
        }
        perm.controller = original;
        delete perm.controlGrantedByAuraUid;
        delete perm.controlGrantOriginalController;
        events.push({ type: 'controlRestored', permanent: perm, side: original, reason: 'controlAuraLeftBattlefield' });
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // 704.5d — Token outside battlefield
  // ─────────────────────────────────────────────
  /** @param {GameState} state */
  #checkTokenInNonBattlefield(state) {
    const events = [];
    for (const side of ['player', 'ai']) {
      for (const zone of ['hand', 'graveyard', 'exile', 'library']) {
        // V12.76 : le marqueur réellement posé sur les jetons est `token` (et `isTokenPermanent`), jamais `isToken` :
        // l'ancien filtre ne retirait donc aucun jeton. Seul `creatureDied` en nettoyait certains, et pas tous les chemins de mort
        // (graine 807 du banc : un Soldat d'Icatian Town mort au combat restait au cimetière).
        const isTok = (c) => !!(c.token || c.isToken || c.isTokenPermanent);
        const tokens = state[side][zone].filter(isTok);
        if (tokens.length) {
          state[side][zone] = state[side][zone].filter((c) => !isTok(c));
          tokens.forEach((t) => {
            events.push({ type: 'tokenCeasedToExist', permanent: t, side });
          });
        }
      }
    }
    return events;
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  /** @param {Permanent} perm */
  #effectiveToughness(state, perm) {
    return calculateCharacteristics(state, perm).toughness;
  }
}
