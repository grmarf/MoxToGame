import { tapPermanent } from '../permanent-tap.js';
/**
 * V8.2 atomic effect implementations.
 * These handlers deliberately depend only on a small engine context supplied by the
 * compatibility adapter. They contain no DOM code.
 */
import { effectiveTypes, effectivePowerToughness, hasProtectionFromColors } from '../continuous-effects.js';
import { gameEvents } from '../event-bus.js';
import { rngClock } from '../rng-clock-service.js';

const amountOf = (effect, xValue) => effect.amount === 'X' ? (xValue || 0) : effect.amount;
const targetPermanent = (target, api) => {
  if (!target || target.kind !== 'permanent') return null;
  const uid = target.uid || target.perm?.uid || target.id;
  if (!uid) return target.perm || null;
  const resolved = api?.findPermanent?.(uid);
  return resolved || null;
};


// BUG H (audit v12.66) : les 4 contre-sorts (counterSpell/counterCMC/
// counterSpellColor/counterUnlessPay) poussaient directement le sort
// contrecarré dans le cimetière, alors que la résolution normale (stack.js)
// passe par zones.moveToGraveyard (identité, 'zoneChanged') avec repli sur
// un push si la carte n'est pas suivie par le ZoneManager. Chemin unique ici.
function putCounteredInGraveyard(ctx, removed) {
  const card = removed.source;
  const side = removed.controller;
  const zones = ctx.api?.zones;
  if (zones) {
    // v12.72 : un sort de la pile n'est dans aucune zone suivie -> place() (identité + zoneChanged).
    zones.place(card, 'graveyard', { toSide: card.owner || side, reason: 'countered' });
    return;
  }
  ctx.state[side].graveyard.push({ ...card, zone: 'graveyard', objectId: card.objectId || rngClock.uuid('obj') });
}

export function registerAtomicEffects(registry) {
  registry.register('damage', (ctx, effect) => {
    const { targetInfo, sourceCard, controllerKey, xValue, api } = ctx;
    const amount = amountOf(effect, xValue);
    const target = targetPermanent(targetInfo, api);
    if (target) {
      const side = api.findPermSide(target);
      const result = api.applyDamageToPermanent ? api.applyDamageToPermanent(target, amount, { color: sourceCard?.color?.[0] || null, source: sourceCard, meta:{ combat:!!ctx.combatDamage } }) : api.preventDamage(side, amount, sourceCard?.color?.[0] || null, sourceCard, {targetType:'permanent', targetController:target.controller || side, combat:!!ctx.combatDamage});
      const prevented = result.prevented !== undefined ? { remaining: result.amount, prevented: result.prevented } : result;
      api.log(`${sourceCard.name} inflige ${amount} blessures à ${target.name}.`, controllerKey);
      api.checkStateBasedDeaths();
    } else if (targetInfo?.kind === 'player') {
      const result = api.applyDamageToPlayer ? api.applyDamageToPlayer(targetInfo.side, amount, { color: sourceCard?.color?.[0] || null, source: sourceCard, meta:{ combat: !!ctx.combatDamage } }) : null;
      const prevented = result ? { remaining: result.amount, prevented: result.prevented } : api.preventDamage(targetInfo.side, amount, sourceCard?.color?.[0] || null, sourceCard, {targetType:'player', targetController:targetInfo.side, combat:!!ctx.combatDamage});
      if (!result) { const life = api.replaceDamageLifeLoss ? api.replaceDamageLifeLoss(targetInfo.side, prevented.remaining, { source: sourceCard, combat: !!ctx.combatDamage }) : { loss: prevented.remaining }; api.state[targetInfo.side].life -= life.loss; }
      api.log(`${sourceCard.name} inflige ${amount} blessures à ${targetInfo.side === 'player' ? 'vous' : "l'IA"}.`, controllerKey);
    }
    // V12.76 : blessures annexes de la même capacité (Orcish Artillery : 3 à son contrôleur ; Psionic Entity : 3 à elle-même).
    const n1 = Number(effect?.selfDamage || 0);
    if (n1 > 0 && api.applyDamageToPlayer) { api.applyDamageToPlayer(controllerKey, n1, { color: sourceCard?.color?.[0] || null, source: sourceCard, meta: { effect: 'selfDamage' } }); api.log(`${sourceCard.name} vous inflige ${n1} blessures.`, controllerKey); }
    const n2 = Number(effect?.sourceDamage || 0);
    if (n2 > 0 && sourceCard && api.findPermSide?.(sourceCard) && api.applyDamageToPermanent) { api.applyDamageToPermanent(sourceCard, n2, { color: sourceCard?.color?.[0] || null, source: sourceCard, meta: { effect: 'sourceDamage' } }); api.log(`${sourceCard.name} s'inflige ${n2} blessures.`, controllerKey); api.checkStateBasedDeaths(); }
  });

  registry.register('destroy', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (target) {
      // V12.75 : Crumble (le contrôleur de l'artefact gagne autant de PV que son coût converti) et Divine Offering
      // (le lanceur les gagne). Le coût converti et le contrôleur sont lus AVANT la destruction.
      const gain = effect?.gainLifeCmc ? Number(target.cmc || 0) : 0;
      const recipient = effect?.gainLifeCmc === 'controller' ? (target.controller || ctx.api.findPermSide(target)) : ctx.controllerKey;
      ctx.api.log(`${ctx.sourceCard.name} détruit ${target.name}.`, ctx.controllerKey);
      ctx.api.destroyPermanent(target, effect?.noRegen ? { noRegen: true } : {}); // V12.76 (G19) : Fissure (« It can't be regenerated »)
      if (gain > 0) {
        ctx.api.state[recipient].life += gain;
        ctx.api.log(`${recipient === 'player' ? 'Vous gagnez' : "L'IA gagne"} ${gain} PV.`, ctx.controllerKey);
      }
    }
  });

  // V12.76 (G16) : Blight — « détruisez-le » = le permanent ENCHANTÉ par la source (lu à la résolution, sans cible).
  registry.register('destroyEnchanted', (ctx) => {
    const aura = ctx.sourceCard; const host = aura?.attachedTo ? ctx.api.findPermanent(aura.attachedTo) : null;
    if (!host) return;
    ctx.api.log(`${aura.name} détruit ${host.name}.`, ctx.controllerKey);
    ctx.api.destroyPermanent(host);
  });

  registry.register('exile', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    const side = ctx.api.findPermSide(target);
    if (effect.lifegainFromPower) {
      const pt = ctx.api.effectivePT(target, side);
      ctx.api.state[side].life += Math.max(0, pt.power);
    }
    if (ctx.api.zones) ctx.api.zones.move(target, 'exile', { toSide: target.owner || side, reason: 'effectExile' });
    else { ctx.api.state[side].battlefield = ctx.api.state[side].battlefield.filter(p => p !== target); ctx.api.state[side].exile.push(target); }
    ctx.api.log(`${target.name} est exilé par ${ctx.sourceCard.name}.`, ctx.controllerKey);
  });

  registry.register('bounce', (ctx) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    const side = ctx.api.findPermSide(target);
    if (ctx.api.zones) ctx.api.zones.move(target, 'hand', { toSide: target.owner || side, reason: 'effectBounce' });
    else { ctx.api.state[side].battlefield = ctx.api.state[side].battlefield.filter(p => p !== target); ctx.api.state[side].hand.push(target); }
    ctx.api.log(`${target.name} retourne en main (${side === 'player' ? 'vous' : 'IA'}).`, ctx.controllerKey);
  });

  registry.register('draw', (ctx, effect) => {
    const amount = amountOf(effect, ctx.xValue);
    // V12.76 (G32) : `target: 'eventPlayer'` — « ce joueur pioche » (Howling Mine : le joueur dont c'est l'étape de pioche) ; sinon le contrôleur de la source.
    const who = effect.target === 'eventPlayer' && ctx.triggerEvent?.side ? ctx.triggerEvent.side : ctx.controllerKey;
    for (let i = 0; i < amount; i++) {
      if (ctx.api.drawCard) ctx.api.drawCard(who); else if (ctx.api.state[who].library.length > 0) ctx.api.state[who].hand.push(ctx.api.state[who].library.shift());
    }
    ctx.api.log(`${who === 'player' ? 'Vous piochez' : "L'IA pioche"} ${amount} carte(s).`, ctx.controllerKey);
  });

  registry.register('discard', (ctx, effect) => {
    const target = effect.target === 'opponent' ? ctx.api.opponentKey(ctx.controllerKey) : ctx.controllerKey;
    for (let i = 0; i < effect.amount && ctx.api.state[target].hand.length > 0; i++) {
      const idx = Math.floor(rngClock.random() * ctx.api.state[target].hand.length);
      const card = ctx.api.state[target].hand[idx];
      if (ctx.api.zones) { ctx.api.zones.ensureIdentity(card, { owner: target }); ctx.api.zones.move(card, 'graveyard', { toSide: card.owner || target, reason: 'effectDiscard' }); }
      else ctx.api.state[target].graveyard.push(ctx.api.state[target].hand.splice(idx, 1)[0]);
    }
    ctx.api.log(`${target === 'player' ? 'Vous défaussez' : "L'IA défausse"} ${effect.amount} carte(s).`, ctx.controllerKey);
  });

  // V12.76 (G19) : « Target player draws N cards » (Ancestral Recall N=3, Braingeyser N=X) — le joueur est CHOISI (soi ou l'adversaire).
  registry.register('drawTarget', (ctx, effect) => {
    const side = ctx.targetInfo?.kind === 'player' ? ctx.targetInfo.side : ctx.controllerKey;
    const amount = amountOf(effect, ctx.xValue);
    for (let i = 0; i < amount; i++) ctx.api.drawCard(side);
    ctx.api.log(`${ctx.sourceCard?.name || 'Effet'} : ${side === 'player' ? 'vous piochez' : "l'IA pioche"} ${amount} carte(s).`, ctx.controllerKey);
  });

  // V12.76 (G19) : « Target player discards X cards at random » (Mind Twist) — joueur ciblé.
  registry.register('discardRandomTarget', (ctx, effect) => {
    const side = ctx.targetInfo?.kind === 'player' ? ctx.targetInfo.side : ctx.controllerKey;
    discardRandomFrom(ctx, side, amountOf(effect, ctx.xValue));
  });

  function discardRandomFrom(ctx, target, amount) {
    for (let i = 0; i < amount; i++) {
      const hand = ctx.api.state[target].hand;
      if (hand.length === 0) break;
      const idx = Math.floor(rngClock.random() * hand.length);
      const card = hand[idx];
      if (ctx.api.zones) { ctx.api.zones.ensureIdentity(card, { owner: target }); ctx.api.zones.move(card, 'graveyard', { toSide: card.owner || target, reason: 'effectDiscardRandom' }); }
      else { hand.splice(idx, 1); ctx.api.state[target].graveyard.push(card); }
      ctx.api.log(`${target === 'player' ? 'Vous défaussez' : "L'IA défausse"} ${card.name} au hasard.`, ctx.controllerKey);
    }
  }

  registry.register('discardRandom', (ctx, effect) => {
    const amount = effect?.amount === 'X' ? (ctx.xValue || 0) : (effect?.amount || 1);
    const target = effect?.target === 'opponent' ? (ctx.controllerKey === 'player' ? 'ai' : 'player') : ctx.controllerKey;
    for (let i = 0; i < amount; i++) {
      const hand = ctx.api.state[target].hand;
      if (hand.length === 0) break;
      const idx = Math.floor(rngClock.random() * hand.length);
      const card = hand[idx];
      // v12.73 : chemin canonique unique (plus de repli splice+push qui contournait ZoneManager) ;
      // le repli direct ne sert que sans ZoneManager (harnais minimal).
      if (ctx.api.zones) { ctx.api.zones.ensureIdentity(card, { owner: target }); ctx.api.zones.move(card, 'graveyard', { toSide: card.owner || target, reason: 'effectDiscardRandom' }); }
      else { hand.splice(idx, 1); ctx.api.state[target].graveyard.push(card); }
      ctx.api.log(`${target === 'player' ? 'Vous défaussez' : "L'IA défausse"} ${card.name} au hasard.`, ctx.controllerKey);
    }
  });

  registry.register('gainLife', (ctx, effect) => {
    const amount = effect.amount === 'X' ? (ctx.xValue || 0) : effect.amount;
    const target = effect.target === 'self' ? ctx.controllerKey : (ctx.targetInfo?.side || ctx.controllerKey);
    ctx.api.state[target].life += amount;
    ctx.api.log(`${target === 'player' ? 'Vous gagnez' : "L'IA gagne"} ${amount} PV.`, ctx.controllerKey);
  });

  registry.register('pump', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    // BUG O (audit v12.69) : un pump porté par une Aura est permanent par
    // nature (dure tant que l'Aura reste attachée, règle 704.5m) -- il est
    // DÉJÀ appliqué en continu par calculateCharacteristics (layer 7,
    // auraSource) une fois la carte devenue permanent. L'appliquer AUSSI ici
    // comme buff temporaire (tempBuffs, jusqu'à la fin du tour) double le
    // bonus (Holy Strength +1/+2 devenait +2/+4) ET le fait à tort
    // disparaître en fin de tour alors que l'Aura reste attachée. Le flag
    // historique `permanentAura` (utilisé par Weakness/Blessing) reste
    // accepté, mais la vraie règle est structurelle : toute source Aura
    // l'est intrinsèquement, qu'on ait pensé ou non à poser le flag --
    // c'est justement ce qui manquait sur Holy Strength/Unholy Strength.
    const sourceIsAura = /\bAura\b/i.test(String(ctx.sourceCard?.type || '')) || /\bAura\b/i.test(String(ctx.sourceCard?.subtype || ''));
    if (effect.permanentAura || sourceIsAura) return;
    // V12.75 : Great Defender — +0/+X où X est le coût converti de la créature ciblée.
    // V12.75 : « X » accepté pour la force et l'endurance (Howl from Beyond +X/+0) ; avant, la chaîne "X"
    // donnait NaN dans les caractéristiques.
    const num = (v) => (v === 'X' ? Number(ctx.xValue || 0) : Number(v || 0));
    const toughness = effect.toughnessFrom === 'cmc' ? Number(target.cmc || 0) : num(effect.toughness);
    const power = num(effect.power);
    target.tempBuffs = target.tempBuffs || [];
    target.tempBuffs.push({ power, toughness });
    ctx.api.log(`${target.name} ${power >= 0 ? 'gagne' : 'perd'} ${Math.abs(power)}/${Math.abs(toughness)}.`, ctx.controllerKey);
  });

  // BUG (audit v12.69, Samite Healer) : 'preventDamage' était utilisé par une
  // carte certifiée "implemented" mais n'était enregistré nulle part comme
  // effet résolvable (seule la MÉTHODE INTERNE ctx.api.preventDamage
  // existait, appelée par d'autres handlers -- ce n'est pas la même chose
  // qu'un effet qu'un joueur peut choisir de lancer). Active/lance un
  // bouclier de prévention ciblé sur un joueur OU un permanent précis.
  registry.register('preventDamage', (ctx, effect) => {
    const { api, targetInfo, controllerKey } = ctx;
    const amount = Number(effect.amount || 0);
    if (!targetInfo) { api.log('Prévention sans cible : sans effet.', controllerKey); return; }
    if (targetInfo.kind === 'player' || targetInfo.side) {
      const side = targetInfo.side || targetInfo.kind;
      api.addPreventionShield(side, { amount, until: 'nextMatchingDamage' });
      api.log(`Bouclier de prévention (${amount}) posé sur ${side === 'player' ? 'vous' : "l'adversaire"}.`, controllerKey);
      return;
    }
    const target = targetPermanent(targetInfo, api);
    if (!target) { api.log('Cible illégale pour la prévention : sans effet.', controllerKey); return; }
    const side = api.findPermSide ? api.findPermSide(target) : target.controller;
    api.addPreventionShield(side, { amount, target, until: 'nextMatchingDamage' });
    api.log(`Bouclier de prévention (${amount}) posé sur ${target.name}.`, controllerKey);
  });

  registry.register('pumpSelf', (ctx, effect) => {
    // BUG (audit v12.69, Firebreathing) : une capacité activée d'Aura
    // ('{R} : ...') a pour source l'AURA elle-même (ctx.sourceCard), mais
    // 'pumpSelf' écrivait le buff sur l'Aura -- qui n'a pas de force propre
    // pertinente -- au lieu de la créature enchantée. calculateCharacteristics
    // lit tempBuffs sur la créature, jamais sur l'Aura : Firebreathing
    // s'activait sans jamais rien changer sur le terrain.
    const isAura = /\bAura\b/i.test(String(ctx.sourceCard?.type || '')) || /\bAura\b/i.test(String(ctx.sourceCard?.subtype || ''));
    const real = isAura && ctx.sourceCard.attachedTo ? (ctx.api.findPermanent(ctx.sourceCard.attachedTo) || ctx.sourceCard) : ctx.sourceCard;
    if (!real.tempBuffs) real.tempBuffs = [];
    real.tempBuffs.push({ power: effect.power, toughness: effect.toughness });
    if (effect.sacrificeAfter) { // V12.76 (G32) : Dragon Whelp — activée « quatre fois ou plus ce tour-ci » : sacrifiée à la prochaine étape de fin
      const t = ctx.api.state.turnNumber; real.pumpCount = real.pumpCount?.turn === t ? { turn: t, n: real.pumpCount.n + 1 } : { turn: t, n: 1 };
      if (real.pumpCount.n >= effect.sacrificeAfter && !real.pumpSacrificeScheduled?.[t]) {
        real.pumpSacrificeScheduled = { ...(real.pumpSacrificeScheduled || {}), [t]: true }; const st = ctx.api.state; st.delayedEffects = st.delayedEffects || [];
        st.delayedEffects.push({ at: 'nextEndStep', kind: 'sacrificeSelf', targetUid: real.uid, sourceName: real.name });
      }
    }
    ctx.api.log(`${real.name} gagne ${effect.power}/${effect.toughness} jusqu'à la fin du tour.`, ctx.controllerKey);
  });

  registry.register('destroyAllCreatures', (ctx) => {
    ctx.api.allPermanents().filter(p => p.type.includes('Creature')).forEach(p => { p.regenShield = false; ctx.api.destroyPermanent(p); });
    ctx.api.log('Toutes les créatures sont détruites.', 'system');
  });

  registry.register('destroyAllLands', (ctx, effect) => {
    let targets = ctx.api.allPermanents().filter(p => p.type.includes('Land'));
    if (effect?.filter) {
      targets = targets.filter(p => String(p.type || '').includes(effect.filter) || String(p.name || '').includes(effect.filter));
    }
    targets.forEach(p => ctx.api.destroyPermanent(p));
    ctx.api.log(`${effect?.filter ? effect.filter + 's' : 'Tous les terrains'} détruits.`, 'system');
  });

  registry.register('destroyAllEnchantments', (ctx) => {
    ctx.api.allPermanents().filter(p => p.type.includes('Enchantment')).forEach(p => ctx.api.destroyPermanent(p));
    ctx.api.log(`${ctx.sourceCard.name} détruit tous les enchantements.`, 'system');
  });

  registry.register('damageAllCreaturesAndPlayers', (ctx, effect) => damageAllFor(ctx, amountOf(effect, ctx.xValue), effect));
  function damageAllFor(ctx, amount, effect = {}) {
    const color = ctx.sourceCard?.color?.[0] || null;
    // v12.72 : chemin canonique unique (prévention, protection, remplacements) pour
    // les créatures comme pour les joueurs ; plus d'écriture directe de damageMarked/life.
    ctx.api.allPermanents().filter(p => p.type.includes('Creature')).filter(p => !(effect.exceptFlying && ctx.api.effectiveKeywords(p).includes('flying'))).forEach(p => {
      if (ctx.api.applyDamageToPermanent) {
        ctx.api.applyDamageToPermanent(p, amount, { color, source: ctx.sourceCard, meta: { effect: 'damageAllCreaturesAndPlayers' } });
      } else if (!hasProtectionFromColors(ctx.state, p, effectiveTypes(ctx.state, ctx.sourceCard).color)) {
        p.damageMarked = (p.damageMarked || 0) + amount;
      }
    });
    for (const side of ['player','ai']) {
      if (ctx.api.applyDamageToPlayer) ctx.api.applyDamageToPlayer(side, amount, { color, source: ctx.sourceCard, meta: { effect: 'damageAllCreaturesAndPlayers' } });
      else { const life = ctx.api.replaceDamageLifeLoss ? ctx.api.replaceDamageLifeLoss(side, amount, { source: ctx.sourceCard }) : { loss: amount }; ctx.api.state[side].life -= life.loss; }
    }
    ctx.api.log(`${ctx.sourceCard.name} inflige ${amount} blessure(s) à toutes les créatures et à chaque joueur.`, 'system');
    ctx.api.checkStateBasedDeaths();
  }

  registry.register('extraTurn', (ctx) => {
    ctx.api.state.extraTurnFor = ctx.controllerKey;
    // V12.76 (G24) : `extraTurnFor` n'était lu par PERSONNE (Time Walk ne donnait aucun tour) : le gestionnaire de tour consomme désormais cette file.
    ctx.api.state.extraTurnQueue = [...(ctx.api.state.extraTurnQueue || []), ctx.controllerKey];
    ctx.api.log(`${ctx.controllerKey === 'player' ? 'Vous prendrez' : "L'IA prendra"} un tour supplémentaire.`, ctx.controllerKey);
  });

  // BUG J (audit v12.66) : Timetwister ('wheel') déplaçait main/cimetière vers
  // la bibliothèque puis piochait 7 cartes par manipulation directe des
  // tableaux (push/pop), sans identité de changement de zone ni événements
  // 'zoneChanged'. Chaque déplacement passe désormais par ctx.api.zones.move ;
  // pioche dans une bibliothèque vide -> mustDraw (même règle que #runDraw).
  registry.register('wheel', (ctx) => {
    const zones = ctx.api.zones;
    const tracked = (card) => !!(zones && zones.find(card));
    for (const side of ['player', 'ai']) {
      const s = ctx.api.state[side];
      for (const card of [...s.hand, ...s.graveyard]) {
        if (tracked(card)) zones.move(card, 'library', { toSide: card.owner || side, reason: 'timetwister' });
        else { s.hand = s.hand.filter(c => c !== card); s.graveyard = s.graveyard.filter(c => c !== card); s.library.push(card); }
      }
      s.library = ctx.api.shuffle(s.library);
      for (let i = 0; i < 7; i++) {
        if (!s.library.length) { s.mustDraw = true; break; }
        const top = s.library[s.library.length - 1];
        if (tracked(top)) zones.move(top, 'hand', { toSide: side, reason: 'draw' });
        else s.hand.push(s.library.pop());
      }
    }
    ctx.api.log('Chaque joueur mélange sa main et son cimetière puis pioche 7 cartes.', 'system');
  });

  registry.register('mana', (ctx, effect) => {
    const amount = Number(effect.amount || 0);
    const addMana = (chosen, resumeCtx = ctx) => {
      if (!['W','U','B','R','G'].includes(chosen)) return null;
      const pool = resumeCtx.api.state[resumeCtx.controllerKey].mana;
      pool[chosen] = (pool[chosen] || 0) + amount;
      resumeCtx.api.log(`+${amount}{${chosen}} ajouté.`, resumeCtx.controllerKey);
      return chosen;
    };

    // "any" is a real player choice, not a mana-pool key. Suspend the
    // resolution when no synchronous chooser is available and resume it
    // through the same continuation mechanism used by chooseColor/searchLibrary.
    if (effect.color === 'any') {
      const chosen = ctx.api.choose(
        {
          type: 'manaColor',
          controller: ctx.controllerKey,
          options: ['W','U','B','R','G'],
          min: 1,
          max: 1,
          prompt: effect.prompt || 'Choisissez une couleur de mana.',
          defaultValue: 'W',
        },
        addMana
      );
      if (chosen != null) return addMana(chosen);
      return null;
    }

    // Fixed-color mana keeps the pre-existing synchronous behaviour.
    const pool = ctx.api.state[ctx.controllerKey].mana;
    pool[effect.color] = (pool[effect.color] || 0) + amount;
    ctx.api.log(`+${amount}{${effect.color}} ajouté.`, ctx.controllerKey);
    return effect.color;
  });

  registry.register('regenerateShield', (ctx) => {
    // Activated self-regeneration abilities do not carry an explicit target.
    // Resolve their source directly in that case; targeted spells continue
    // to resolve through targetInfo exactly as before.
    const srcIsAura = /\bAura\b/i.test(String(ctx.sourceCard?.type || '') + ' ' + String(ctx.sourceCard?.subtype || ''));
    const target = ctx.targetInfo
      ? targetPermanent(ctx.targetInfo, ctx.api)
      : (srcIsAura && ctx.sourceCard?.attachedTo ? (ctx.api.findPermanent(ctx.sourceCard.attachedTo) || null) : ctx.sourceCard); // aura : la créature ENCHANTÉE
    if (target) { target.regenShield = true; ctx.api.log(`${target.name} obtient un bouclier de régénération.`, ctx.controllerKey); }
  });

  registry.register('fog', (ctx) => {
    ctx.api.state.fogActive = true;
    ctx.api.log('Tous les dégâts de combat seront prévenus ce tour-ci.', ctx.controllerKey);
  });

  registry.register('tapTarget', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    const shouldTap = effect?.tap !== false;
    if (shouldTap) tapPermanent(ctx.state, target, { reason: 'effect' }); else target.tapped = false;
    ctx.api.log(`${target.name} est ${shouldTap ? 'engagé' : 'désengagé'} par ${ctx.sourceCard?.name || 'ability'}.`, ctx.controllerKey);
  });

  // V12.75 — « {1} : dégagez-le » (Brass Man), « {9} : dégagez le Colosse » : dégage la SOURCE (l'ancien tapOrUntap basculait une cible inexistante).
  // V12.76 (G11) : « mettez un marqueur de charge sur ce permanent » (Mana Batteries). Les marqueurs sont des objets { type } dans `counters`.
  registry.register('addCounter', (ctx, effect) => {
    const live = effect.target === 'enchanted' ? (ctx.sourceCard?.attachedTo ? ctx.api.findPermanent(ctx.sourceCard.attachedTo) : null) : ctx.api.findPermanent(ctx.sourceCard?.uid); if (!live || !effect.counter) return;
    live.counters = Array.isArray(live.counters) ? live.counters : [];
    const n = Math.max(1, Number(effect.amount ?? 1)); for (let i = 0; i < n; i++) live.counters.push({ type: effect.counter });
    ctx.api.log(`${live.name} : ${n} marqueur(s) ${effect.counter} (total ${live.counters.filter((c) => c.type === effect.counter).length}).`, ctx.controllerKey);
  });
  // V12.76 (harnais) : « Enchanter : créature / terrain / artefact / enchantement » pour une Aura dont tout le reste est en capacités ou déclencheurs.
  // L'effet lui-même ne fait rien ; il porte seulement la RESTRICTION DE CIBLE (sans lui, Firebreathing pouvait être posée sur un terrain).
  registry.register('enchant', () => {});
  registry.register('manaBonus', () => {}); // Wild Growth : lu par le chemin de mana (#applyManaBonusAuras), pas à la résolution
  registry.register('untapSelf', (ctx) => {
    const live = ctx.api.findPermanent(ctx.sourceCard.uid) || ctx.sourceCard;
    live.tapped = false; ctx.api.log(`${live.name} est dégagé.`, ctx.controllerKey);
  });
  // V12.75 — Coal Golem : « sacrifiez ce permanent. Ajoutez {R}{R}{R} » (le sacrifice ne peut pas être régénéré).
  registry.register('sacrificeSelfAddMana', (ctx, effect) => {
    const live = ctx.api.findPermanent(ctx.sourceCard.uid); if (!live) return;
    ctx.api.destroyPermanent(live, { noRegen: true });
    const pool = ctx.api.state[ctx.controllerKey].mana; pool[effect.color] = (pool[effect.color] || 0) + Number(effect.amount || 0);
    ctx.api.log(`${ctx.sourceCard.name} est sacrifié : +${effect.amount} {${effect.color}}.`, ctx.controllerKey);
  });
  // V12.75 — Urza's Avenger : « {1} : gagne une capacité AU CHOIX jusqu'à la fin du tour ».
  registry.register('chooseKeywordUntilEnd', (ctx, effect) => {
    const live = ctx.api.findPermanent(ctx.sourceCard.uid); if (!live) return null;
    const apply = (chosen) => {
      const kw = Array.isArray(chosen) ? chosen[0] : chosen; if (!kw || !(effect.options || []).includes(kw)) return null;
      live.tempKeywords = live.tempKeywords || []; if (!live.tempKeywords.includes(kw)) live.tempKeywords.push(kw);
      if (effect.selfPower || effect.selfToughness) { live.tempBuffs = live.tempBuffs || []; live.tempBuffs.push({ power: effect.selfPower || 0, toughness: effect.selfToughness || 0 }); } // V12.76 (G21) : Urza's Avenger (« gets -1/-1 and gains your choice of ... »)
      ctx.api.log(`${live.name} gagne ${kw} jusqu'à la fin du tour.`, ctx.controllerKey); return kw;
    };
    const chosen = ctx.api.choose({ type: 'chooseKeyword', controller: ctx.controllerKey, options: [...(effect.options || [])], min: 1, max: 1, prompt: 'Choisissez une capacité.' }, apply);
    if (chosen != null) return apply(chosen);
    return null;
  });

  // V12.76 (G21) : Tracker — « Tracker deals damage equal to its power to target creature. That creature deals damage equal to its power to Tracker. »
  registry.register('mutualPowerDamage', (ctx) => {
    const src = ctx.api.findPermanent(ctx.sourceCard.uid); const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!src || !target) return;
    const pw = (p) => Math.max(0, Number(effectivePowerToughness(ctx.state, p).power) || 0);
    const a = pw(src), b = pw(target); // forces lues AVANT tout dégât (les deux dégâts sont simultanés)
    const hit = (to, from, n) => { if (n > 0) ctx.api.applyDamageToPermanent(to, n, { color: effectiveTypes(ctx.state, from).color?.[0] || null, source: from, meta: { effect: 'mutualPowerDamage' } }); };
    hit(target, src, a); hit(src, target, b);
    ctx.api.log(`${src.name} et ${target.name} se blessent mutuellement (${a} / ${b}).`, ctx.controllerKey);
    ctx.api.checkStateBasedDeaths();
  });

  registry.register('tapOrUntap', (ctx) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (target) { if (target.tapped) target.tapped = false; else tapPermanent(ctx.state, target, { reason: 'effect' }); ctx.api.log(`${target.name} est ${target.tapped ? 'engagé' : 'dégagé'} par ${ctx.sourceCard.name}.`, ctx.controllerKey); }
  });

  registry.register('removeKeyword', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    const kw = effect.keyword;
    // V12.76 (harnais) : une AURA retire le mot-clé par la couche continue (tant qu'elle est attachée) ; le retirer AUSSI de `keywords` le
    // supprimait pour toujours, même après le départ de l'aura (Earthbind sur un volant, Animate Wall sur un mur).
    const srcIsAura = /\bAura\b/i.test(String(ctx.sourceCard?.type || '') + ' ' + String(ctx.sourceCard?.subtype || ''));
    if (target.keywords && !srcIsAura) {
      target.keywords = target.keywords.filter(k => k !== kw);
    }
    ctx.api.log(`${target.name} perd ${kw}.`, ctx.controllerKey);
  });

  registry.register('stealCreature', (ctx) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    const side = ctx.api.findPermSide(target);
    if (side === ctx.controllerKey) return;
    // Control Magic is an Aura: remember the continuous control grant on both
    // objects. The Aura itself gets its battlefield UID during finalization.
    ctx.sourceCard._controlGrantTargetUid = target.uid;
    ctx.sourceCard._controlGrantOriginalController = target.controller || target.owner || side;
    target._controlGrantedByAuraPending = true;
    target._controlGrantOriginalController = target.controller || target.owner || side;
    if (ctx.api.zones) ctx.api.zones.changeController(target, ctx.controllerKey, { reason: 'stealCreature' });
    else {
      target.controller = ctx.controllerKey;
      ctx.api.state[side].battlefield = ctx.api.state[side].battlefield.filter(p => p !== target);
      ctx.api.state[ctx.controllerKey].battlefield.push(target);
    }
    ctx.api.log(`${ctx.controllerKey === 'player' ? 'Vous prenez' : "L'IA prend"} le contrôle de ${target.name}.`, ctx.controllerKey);
  });

  registry.register('reanimate', (ctx, effect) => {
    if (ctx.targetInfo?.kind !== 'graveyardCard') return;
    const side = ctx.targetInfo.side;
    const card = ctx.targetInfo.card;
    if (ctx.api.zones) {
      ctx.api.zones.move(card, 'battlefield', { toSide: ctx.controllerKey, controller: ctx.controllerKey, reason: 'reanimate' });
    } else {
      ctx.api.state[side].graveyard = ctx.api.state[side].graveyard.filter(c => c !== card);
      const perm = ctx.api.makePermFromCard(card);
      perm.uid = ctx.api.uid();
      perm.auraBuffs.push({ power: effect.powerMod || 0, toughness: 0 });
      ctx.api.state[ctx.controllerKey].battlefield.push(perm);
    }
    ctx.api.log(`${card.name} est ramené sur le champ de bataille sous le contrôle de ${ctx.controllerKey === 'player' ? 'vous' : "l'IA"}.`, ctx.controllerKey);
  });

  registry.register('returnFromGraveyard', (ctx, effect) => {
    const gy = ctx.api.state[ctx.controllerKey].graveyard;
    if (!gy.length) return;
    let card = null;
    if (ctx.targetInfo?.kind === 'graveyardCard') {
      card = ctx.targetInfo.card;
    } else if (effect?.filter === 'Creature') {
      card = gy.find(c => String(c.type || '').includes('Creature'));
    } else {
      card = gy[0];
    }
    if (!card) return;
    // V12.75 : `destination: 'battlefield'` (Resurrection) remet la créature en jeu sous le contrôle du lanceur.
    const dest = effect?.destination === 'battlefield' ? 'battlefield' : 'hand';
    if (ctx.api.zones) ctx.api.zones.move(card, dest, { toSide: ctx.controllerKey, reason: 'returnFromGraveyard' });
    else {
      ctx.api.state[ctx.controllerKey].graveyard = ctx.api.state[ctx.controllerKey].graveyard.filter(c => c !== card);
      ctx.api.state[ctx.controllerKey][dest === 'battlefield' ? 'battlefield' : 'hand'].push(card);
    }
    ctx.api.log(dest === 'battlefield' ? `${card.name} revient en jeu.` : `${card.name} revient en main.`, ctx.controllerKey);
  });

  registry.register('addKeyword', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    // V12.76 (harnais) : une AURA accorde son mot-clé par la couche continue (tant qu'elle est attachée). L'écrire aussi dans tempKeywords le
    // faisait SURVIVRE au départ de l'aura (Fear, Web, Wards) : la créature gardait fear / reach / protection jusqu'à la fin du tour.
    const srcIsAura = /\bAura\b/i.test(String(ctx.sourceCard?.type || '') + ' ' + String(ctx.sourceCard?.subtype || ''));
    if (effect.permanentAura || srcIsAura) return;
    target.tempKeywords = target.tempKeywords || [];
    if (!target.tempKeywords.includes(effect.keyword)) target.tempKeywords.push(effect.keyword);
  });

  // V12.76 : « la créature ciblée perd le vol jusqu'à la fin du tour » (Radjan Spirit) — contrairement à `removeKeyword`, temporaire.
  registry.register('removeKeywordUntilEnd', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (!target) return;
    target.tempLostKeywords = target.tempLostKeywords || [];
    if (!target.tempLostKeywords.includes(effect.keyword)) target.tempLostKeywords.push(effect.keyword);
    ctx.api.log(`${target.name} perd ${effect.keyword} jusqu'à la fin du tour.`, ctx.controllerKey);
  });

  // V12.76 (G10) : « la créature ciblée perd toutes ses capacités de marche sur [terrain] / de bande jusqu'à la fin du tour » (Hammerheim, Tolaria).
  // La famille est évaluée à la RÉSOLUTION : une capacité acquise plus tard dans le tour n'est pas retirée.
  const FAMILIES = { landwalk: (k) => /walk$/i.test(k), banding: (k) => k === 'banding' || /^bandsWith/i.test(k) };
  registry.register('removeKeywordFamilyUntilEnd', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    const match = FAMILIES[effect.family];
    if (!target || !match) return;
    const lost = [...new Set(ctx.api.effectiveKeywords(target).filter(match))];
    target.tempLostKeywords = target.tempLostKeywords || [];
    for (const k of lost) if (!target.tempLostKeywords.includes(k)) target.tempLostKeywords.push(k);
    ctx.api.log(`${target.name} perd ${lost.length ? lost.join(', ') : 'rien'} jusqu'à la fin du tour (${ctx.sourceCard?.name}).`, ctx.controllerKey);
  });

  // V12.76 (G10) : « la créature ciblée perd, au choix, A ou B jusqu'à la fin du tour » (Urborg : initiative ou marche des marais).
  registry.register('removeChosenKeywordUntilEnd', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api); if (!target) return null;
    const apply = (chosen) => {
      const kw = Array.isArray(chosen) ? chosen[0] : chosen; if (!kw || !(effect.options || []).includes(kw)) return null;
      target.tempLostKeywords = target.tempLostKeywords || []; if (!target.tempLostKeywords.includes(kw)) target.tempLostKeywords.push(kw);
      ctx.api.log(`${target.name} perd ${kw} jusqu'à la fin du tour (${ctx.sourceCard?.name}).`, ctx.controllerKey); return kw;
    };
    const chosen = ctx.api.choose({ type: 'chooseKeyword', controller: ctx.controllerKey, options: [...(effect.options || [])], min: 1, max: 1, prompt: 'Choisissez la capacité que la créature perd.' }, apply);
    if (chosen != null) return apply(chosen);
    return null;
  });

  registry.register('addKeywordUntilEnd', (ctx, effect) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api) || (ctx.sourceCard?.uid ? ctx.sourceCard : null);
    if (!target) return;
    target.tempKeywords = target.tempKeywords || [];
    if (!target.tempKeywords.includes(effect.keyword)) target.tempKeywords.push(effect.keyword);
    ctx.api.log(`${target.name} gagne ${effect.keyword} jusqu'à la fin du tour.`, ctx.controllerKey);
  });

  registry.register('cantBlock', (ctx) => {
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (target) { target.cantBlockThisTurn = true; ctx.api.log(`${target.name} ne peut plus bloquer ce tour-ci.`, ctx.controllerKey); }
  });

  registry.register('drainLife', (ctx, effect) => {
    const amount = amountOf(effect, ctx.xValue);
    const target = targetPermanent(ctx.targetInfo, ctx.api);
    if (target) { target.damageMarked = (target.damageMarked || 0) + amount; ctx.api.checkStateBasedDeaths(); }
    else if (ctx.targetInfo?.kind === 'player') { if (ctx.api.applyDamageToPlayer) ctx.api.applyDamageToPlayer(ctx.targetInfo.side, amount, {color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard,meta:{effect:'drainLife'}}); else { const life = ctx.api.replaceDamageLifeLoss ? ctx.api.replaceDamageLifeLoss(ctx.targetInfo.side, amount, { source: ctx.sourceCard }) : { loss: amount }; ctx.api.state[ctx.targetInfo.side].life -= life.loss; } }
    ctx.api.state[ctx.controllerKey].life += amount;
    ctx.api.log(`${ctx.sourceCard.name} draine ${amount} PV.`, ctx.controllerKey);
  });


  // ============================================================
  // LOT E : Effets legacy migrés vers natif V8.16
  // ============================================================

  // ── Contre-sorts ──
  registry.register('counterSpell', (ctx, effect) => {
    const { controllerKey, sourceCard, api, targetInfo } = ctx;
    // BUG Q (v12.72) : le moteur normalise la cible en {kind:'stackItem'} (#normalizeTarget) ;
    // tester seulement `_kind` faisait répondre « pas de cible : sans effet » à Counterspell
    // et Remove Soul en partie réelle (même cause que le BUG N de counterUnlessPay).
    if (targetInfo && (targetInfo.kind === 'stackItem' || targetInfo._kind === 'stackItem')) {
      const removed = api.removeStackItem(targetInfo.id);
      if (removed) {
        putCounteredInGraveyard(ctx, removed);
        api.log(`${removed.source.name} est contrecarré par ${sourceCard.name} !`, controllerKey);
      } else {
        api.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey);
      }
    } else {
      api.log(`${sourceCard.name} n'a pas de cible : sans effet.`, controllerKey);
    }
  });

  registry.register('counterCMC', (ctx, effect) => {
    const { controllerKey, sourceCard, api, targetInfo, xValue } = ctx;
    if (targetInfo && (targetInfo.kind === 'stackItem' || targetInfo._kind === 'stackItem')) {
      // Cible normalisée : { kind, item, id } — la source est sous `item`, plus sous `source`.
      const targetItem = targetInfo.source ? targetInfo : (api.findStackItem?.(targetInfo.id) || targetInfo.item || targetInfo);
      const targetCmc = targetItem.source?.cmc || 0;
      const requiredCmc = effect.amount === 'X' ? (xValue || 0) : (effect.amount || 0);
      if (targetCmc !== requiredCmc) {
        api.log(`${sourceCard.name} : CMC de la cible (${targetCmc}) différent de ${requiredCmc}. Sans effet.`, controllerKey);
        return;
      }
      const removed = api.removeStackItem(targetInfo.id);
      if (removed) {
        putCounteredInGraveyard(ctx, removed);
        api.log(`${removed.source.name} est contrecarré par ${sourceCard.name} !`, controllerKey);
      } else {
        api.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey);
      }
    } else {
      api.log(`${sourceCard.name} n'a pas de cible : sans effet.`, controllerKey);
    }
  });

  registry.register('counterSpellColor', (ctx, effect) => {
    const { controllerKey, sourceCard, api, targetInfo } = ctx;
    if (targetInfo && (targetInfo.kind === 'stackItem' || targetInfo._kind === 'stackItem')) {
      const stackItem = targetInfo.item || targetInfo;
      const targetColors = stackItem.source?.color || [];
      const requiredColor = effect.color;
      if (requiredColor && !targetColors.includes(requiredColor)) {
        api.log(`${sourceCard.name} : la cible n'est pas de la couleur ${requiredColor}. Sans effet.`, controllerKey);
        return;
      }
      const removed = api.removeStackItem(targetInfo.id);
      if (removed) {
        putCounteredInGraveyard(ctx, removed);
        api.log(`${removed.source.name} est contrecarré par ${sourceCard.name} !`, controllerKey);
      } else {
        api.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey);
      }
    } else {
      api.log(`${sourceCard.name} n'a pas de cible : sans effet.`, controllerKey);
    }
  });

  registry.register('counterUnlessPay', (ctx, effect) => {
    const { state, controllerKey, sourceCard, api, targetInfo, xValue } = ctx;
    // BUG N (audit v12.68) : le moteur normalise la cible en {kind:'stackItem'}
    // (#normalizeTarget) ; ce handler ne testait que `_kind`, donc en partie
    // réelle Power Sink / Force Spike répondaient « pas de cible : sans effet »
    // et ne contrecarraient jamais rien.
    if (!(targetInfo && (targetInfo.kind === 'stackItem' || targetInfo._kind === 'stackItem'))) {
      api.log(`${sourceCard.name} n'a pas de cible : sans effet.`, controllerKey);
      return;
    }
    const initialTarget = api.findStackItem(targetInfo.id);
    if (!initialTarget) {
      api.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey);
      return;
    }
    const amount = effect.amount === 'X' ? (xValue || 0) : (effect.amount || 0);
    const targetController = initialTarget.controller;

    // Applique l'issue (payé / non payé). Rejoué à la reprise après un choix
    // différé : on relit alors la pile et le mana dans le contexte de reprise.
    const settle = (wantsToPay, rctx = ctx) => {
      const rApi = rctx.api;
      const target = rApi.findStackItem(targetInfo.id);
      if (!target) {
        rApi.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey);
        return { paid: false, countered: false };
      }
      const side = rctx.state[target.controller];
      const paid = amount <= 0 || (wantsToPay && rApi.totalMana(side.mana) >= amount);
      if (paid) {
        if (amount > 0) rApi.payGenericFromPool(side, amount);
        rApi.log(`${target.source.name} n'est pas contrecarré : le coût de ${amount} a été payé.`, controllerKey);
        return { paid: true, countered: false };
      }
      const removed = rApi.removeStackItem(targetInfo.id);
      if (removed) {
        putCounteredInGraveyard(rctx, removed);
        rApi.log(`${removed.source.name} est contrecarré par ${sourceCard.name} (coût non payé) !`, controllerKey);
      }
      // Power Sink : le joueur qui ne paie pas engage tous ses terrains produisant du mana et vide sa réserve.
      if (effect.tapLandsIfUnpaid) {
        for (const p of side.battlefield) if (String(p.type || '').includes('Land')) tapPermanent(rctx.state, p, { reason: 'effect', side: target.controller });
        for (const k of Object.keys(side.mana || {})) side.mana[k] = 0;
        rApi.log(`${sourceCard.name} : les terrains de ${target.controller === 'player' ? 'vous' : "l'IA"} sont engagés et la réserve de mana est vidée.`, controllerKey);
      }
      return { paid: false, countered: !!removed };
    };

    if (amount <= 0) return settle(true);
    // L'IA décide seule : elle paie dès qu'elle le peut.
    if (targetController === 'ai') return settle(true);

    // Joueur humain : rien n'est payé sans son accord (vrai choix ChoiceService).
    const canAfford = api.totalMana(state[targetController].mana) >= amount;
    if (!canAfford || typeof api.choose !== 'function') return settle(canAfford);
    const chosen = api.choose({
      type: 'counterUnlessPay',
      controller: targetController,
      options: ['pay', 'decline'],
      prompt: `${sourceCard.name} : payez ${amount} pour que ${initialTarget.source.name} ne soit pas contrecarré ?`,
      defaultValue: 'pay',
    }, (value, resumeCtx = ctx) => settle(value === 'pay', resumeCtx));
    if (chosen != null) return settle(chosen === 'pay');
    return null;
  });


  // ── Cartes ajoutées à l'audit (v12.68) ──
  // Wheel of Fortune : chaque joueur défausse sa main puis pioche N cartes.
  registry.register('discardHandDraw', (ctx, effect) => {
    const zones = ctx.api.zones;
    const n = Number(effect.amount || 7);
    for (const side of ['player', 'ai']) {
      const s = ctx.api.state[side];
      for (const card of [...s.hand]) {
        const done = zones && zones.find(card) ? (zones.moveToGraveyard(card, { toSide: card.owner || side, reason: 'discard' }), true) : false;
        if (!done) { s.hand = s.hand.filter(c => c !== card); s.graveyard.push({ ...card, zone: 'graveyard', objectId: card.objectId || rngClock.uuid('obj') }); }
      }
      for (let i = 0; i < n; i++) {
        if (!s.library.length) { s.mustDraw = true; break; }
        const top = s.library[s.library.length - 1];
        if (zones && zones.find(top)) zones.move(top, 'hand', { toSide: side, reason: 'draw' });
        else s.hand.push(s.library.pop());
      }
    }
    ctx.api.log(`${ctx.sourceCard?.name || 'Effet'} : chaque joueur défausse sa main puis pioche ${n} cartes.`, 'system');
  });

  // Syphon Soul : N blessures à chaque autre joueur ; le lanceur gagne autant de PV
  // que de blessures RÉELLEMENT infligées (après prévention/remplacement).
  registry.register('drainOpponents', (ctx, effect) => {
    const { controllerKey, api, sourceCard } = ctx;
    let dealt = 0;
    for (const side of ['player', 'ai']) {
      if (side === controllerKey) continue;
      const r = api.applyDamageToPlayer(side, Number(effect.amount || 0), { color: sourceCard?.color?.[0] || null, source: sourceCard, meta: { effect: 'drainOpponents' } });
      dealt += Number(r?.amount ?? 0);
    }
    if (dealt > 0) api.state[controllerKey].life += dealt;
    api.log(`${sourceCard?.name || 'Effet'} : ${dealt} blessure(s) infligée(s), ${dealt} PV gagnés.`, controllerKey);
  });

  // Mana Drain : contrecarre le sort ciblé ; au début de la prochaine phase
  // principale de son contrôleur, ajoute {C} égal au coût converti du sort.
  registry.register('counterSpellGainMana', (ctx, effect) => {
    const { controllerKey, sourceCard, api, targetInfo } = ctx;
    if (targetInfo && (targetInfo.kind === 'stackItem' || targetInfo._kind === 'stackItem')) {
      const removed = api.removeStackItem(targetInfo.id);
      if (removed) {
        putCounteredInGraveyard(ctx, removed);
        const cmc = Number(removed.source?.cmc ?? 0) + (removed.source?.xSpell ? Number(removed.xValue || 0) : 0);
        const s = api.state[controllerKey];
        s.delayedMana = [...(s.delayedMana || []), { amount: cmc, source: sourceCard?.name || 'Mana Drain' }];
        api.log(`${removed.source.name} est contrecarré par ${sourceCard.name} ! ${cmc} mana incolore à la prochaine phase principale.`, controllerKey);
        return;
      }
      api.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey);
      return;
    }
    api.log(`${sourceCard.name} n'a pas de cible : sans effet.`, controllerKey);
  });

  // ── Dégâts & destructions spécifiques ──
  registry.register('damageAndGain', (ctx, effect) => {
    const amount = effect.amount || 0;
    const { state, controllerKey, api, targetInfo, sourceCard } = ctx;
    if (targetInfo?.kind === 'player') {
      const side = targetInfo.side || targetInfo.id;
      const result = api.applyDamageToPlayer(side, amount, {
        color: sourceCard?.color?.[0] || null,
        source: sourceCard,
        meta: { effect: 'damageAndGain' },
      });
      const dealt = Number(result?.amount ?? amount);
      state[controllerKey].life += dealt;
      api.log(`${side === 'player' ? 'Vous' : "L'IA"} subit ${dealt} dégâts. Vous gagnez ${dealt} PV.`, controllerKey);
      return;
    }
    const target = targetPermanent(targetInfo, api);
    if (target) {
      // v12.72 : dégâts par le chemin canonique (la protection est gérée par
      // applyDamageToPermanent) ; le gain de vie suit les dégâts RÉELLEMENT infligés.
      if (api.applyDamageToPermanent) {
        const result = api.applyDamageToPermanent(target, amount, { color: sourceCard?.color?.[0] || null, source: sourceCard, meta: { effect: 'damageAndGain' } });
        const dealt = Number(result?.amount ?? amount);
        api.checkStateBasedDeaths();
        state[controllerKey].life += dealt;
        api.log(`${controllerKey === 'player' ? 'Vous' : "L'IA"} gagne ${dealt} PV.`, controllerKey);
        return;
      }
      if (hasProtectionFromColors(state, target, effectiveTypes(state, sourceCard).color)) {
        api.log(`${target.name} est protégée : blessures de ${sourceCard.name} prévenues.`, 'system');
        return;
      }
      target.damageMarked = (target.damageMarked || 0) + amount;
      api.checkStateBasedDeaths();
    }
    state[controllerKey].life += amount;
    api.log(`${controllerKey === 'player' ? 'Vous' : "L'IA"} gagne ${amount} PV.`, controllerKey);
  });

  // Psionic Blast : X blessures à la cible ET Y blessures à son lanceur (aucun gain de vie).
  // Si la cible n'est plus légale à la résolution, le sort n'a aucun effet (pas de blessures à soi).
  registry.register('damageAndSelfDamage', (ctx, effect) => {
    const { controllerKey, api, targetInfo, sourceCard } = ctx;
    const amount = effect.amount || 0, selfAmount = effect.selfAmount || 0;
    const opts = { color: sourceCard?.color?.[0] || null, source: sourceCard, meta: { effect: 'damageAndSelfDamage' } };
    if (targetInfo?.kind === 'player') {
      api.applyDamageToPlayer(targetInfo.side || targetInfo.id, amount, opts);
    } else {
      const target = targetPermanent(targetInfo, api);
      if (!target) { api.log(`${sourceCard.name} n'a plus de cible légale : sans effet.`, controllerKey); return; }
      api.applyDamageToPermanent(target, amount, opts);
      api.checkStateBasedDeaths();
    }
    if (selfAmount > 0) api.applyDamageToPlayer(controllerKey, selfAmount, opts);
    api.log(`${sourceCard.name} inflige ${amount} blessures à la cible et ${selfAmount} à ${controllerKey === 'player' ? 'vous' : "l'IA"}.`, controllerKey);
  });

  registry.register('damageToFliersAndPlayers', (ctx, effect) => {
    const { state, sourceCard, api, xValue } = ctx;
    const amount = effect.amount === 'X' ? (xValue || 0) : (effect.amount || 0);
    const allPerms = api.allPermanents();
    allPerms.forEach(p => {
      if (String(p.type || '').includes('Creature') && api.effectiveKeywords(p).includes('flying')) {
        if (api.applyDamageToPermanent) {
          api.applyDamageToPermanent(p, amount, { color: sourceCard?.color?.[0] || null, source: sourceCard, meta: { effect: 'damageToFliersAndPlayers' } });
          return;
        }
        if (hasProtectionFromColors(state, p, effectiveTypes(state, sourceCard).color)) return;
        p.damageMarked = (p.damageMarked || 0) + amount;
      }
    });
    for (const side of ['player','ai']) { if (ctx.api.applyDamageToPlayer) ctx.api.applyDamageToPlayer(side, amount, {color:ctx.sourceCard?.color?.[0]||null,source:ctx.sourceCard,meta:{effect:'damageAllCreaturesAndPlayers'}}); else { const life = ctx.api.replaceDamageLifeLoss ? ctx.api.replaceDamageLifeLoss(side, amount, { source: ctx.sourceCard }) : { loss: amount }; state[side].life -= life.loss; } }
    api.log(`${sourceCard.name} inflige ${amount} blessures aux créatures avec vol et à chaque joueur.`, 'system');
    api.checkStateBasedDeaths();
  });

  registry.register('destroyRandomPermanent', (ctx, effect) => {
    const { controllerKey, sourceCard, api } = ctx;
    const pool = api.allPermanents();
    if (pool.length > 0) {
      const target = pool[Math.floor(rngClock.random() * pool.length)];
      api.log(`${sourceCard.name} détruit ${target.name} au hasard.`, controllerKey);
      api.destroyPermanent(target);
    }
  });

  // V12.75 : Volcanic Eruption — « Détruisez X montagnes » : terrains de sous-type Montagne EFFECTIF (terrains doubles
  // compris), de n'importe quel contrôleur, choisis par le lanceur. L'ancienne version détruisait les X premières
  // montagnes trouvées (ordre du plateau) et ne reconnaissait que le sous-type exact « Mountain ».
  registry.register('destroyXMountains', (ctx, effect) => {
    const { controllerKey, sourceCard, api, xValue, state } = ctx;
    const amount = Math.max(0, effect.amount === 'X' ? (xValue || 0) : (effect.amount || 0));
    const isMountain = (p) => { const c = effectiveTypes(state, p); return /\bLand\b/i.test(String(c.type || '')) && String(c.subtype || '').toLowerCase().split(/\s+/).includes('mountain'); };
    const mountains = api.allPermanents().filter(isMountain);
    const k = Math.min(amount, mountains.length);
    const apply = (chosen) => {
      const picks = (Array.isArray(chosen) ? chosen : [chosen]).filter(Boolean);
      let n = 0;
      for (const pick of picks) { const live = api.allPermanents().find((p) => p.uid === pick.uid); if (live && isMountain(live) && n < k) { api.destroyPermanent(live); n++; } }
      api.log(`${sourceCard.name} détruit ${n} Montagne(s).`, controllerKey);
      if (effect.damageEach && n > 0) damageAllFor(ctx, n); // V12.76 (G21) : Volcanic Eruption — « damage to each creature and each player equal to the number of Mountains put into a graveyard this way »
      return n;
    };
    if (k === 0) { api.log(`${sourceCard.name} : aucune Montagne à détruire.`, controllerKey); return 0; }
    if (k === mountains.length) return apply(mountains); // pas de choix à faire : toutes sont détruites
    const chosen = api.choose({ type: 'chooseMountains', controller: controllerKey, options: mountains, min: k, max: k, prompt: `Choisissez ${k} Montagne(s) à détruire.` }, apply);
    if (chosen != null) return apply(chosen);
    return null;
  });

  registry.register('emptyManaPool', (ctx, effect) => {
    const { state, controllerKey, sourceCard, api } = ctx;
    const target = api.opponentKey(controllerKey);
    const emptied = api.totalMana(state[target].mana);
    for (const c in state[target].mana) state[target].mana[c] = 0;
    api.log(`${sourceCard.name} vide la réserve de mana adverse (${emptied} mana perdu).`, controllerKey);
  });

  registry.register('gainLifePerCreature', (ctx, effect) => {
    const { state, controllerKey, api } = ctx;
    const count = state[controllerKey].battlefield.filter(p => String(p.type || '').includes('Creature')).length;
    const gain = count * (effect.multiplier || 2);
    state[controllerKey].life += gain;
    api.log(`${controllerKey === 'player' ? 'Vous gagnez' : "L'IA gagne"} ${gain} PV (${effect.multiplier || 2} par créature contrôlée).`, controllerKey);
  });

  // ── Tutor (recherche en bibliothèque) ──
  // BUG I (audit v12.66) : ce handler ('tutor', enregistré ici SANS garde
  // registry.has) écrase silencieusement la version correcte de
  // search-aura-effects.js (qui, elle, se protège avec un `if
  // (!registry.has(type))` mais s'enregistre APRÈS dans installEffectDomains
  // -- donc jamais appelée). Le vrai défaut n'est pas le choix de carte
  // (logique de ciblage explicite vs heuristique IA meilleur CMC, conservée
  // ici volontairement, plus riche que search()) mais la manipulation
  // DIRECTE de lib.splice()/hand.push() qui casse l'identité canonique de
  // l'objet déplacé (pas de nouveau uid/objectId/zoneHistory, pas
  // d'événement 'zoneChanged') -- corrigé pour router via
  // ctx.api.zones.move(), comme tout autre changement de zone du moteur.
  registry.register('tutor', (ctx, effect) => {
    const { state, controllerKey, api, targetInfo, sourceCard } = ctx;
    const lib = state[controllerKey].library;
    let picked = null;
    if (targetInfo && targetInfo._kind === 'libraryCard') {
      picked = lib.find(c => c.uid === targetInfo.uid) || null;
      if (!picked) api.log(`${sourceCard.name} : carte non trouvée dans la bibliothèque.`, controllerKey);
    } else if (lib.length > 0) {
      picked = [...lib].sort((a, b) => (b.cmc || 0) - (a.cmc || 0))[0];
    } else {
      api.log(`${controllerKey === 'player' ? 'Vous ne trouvez' : "L'IA ne trouve"} rien.`, controllerKey);
    }
    if (picked) {
      const moved = api.zones
        ? api.zones.move(picked, 'hand', { toSide: controllerKey, controller: controllerKey, reason: 'tutor' })
        : (lib.splice(lib.indexOf(picked), 1), state[controllerKey].hand.push(picked), picked);
      api.log(`${controllerKey === 'player' ? 'Vous cherchez' : "L'IA cherche"} ${moved.name} et le met en main.`, controllerKey);
      gameEvents.emit({ type: 'librarySearched', side: controllerKey, card: moved, destination: 'hand' });
    }
    state[controllerKey].library = api.shuffle(state[controllerKey].library);
    api.log(`${controllerKey === 'player' ? 'Votre bibliothèque est' : "La bibliothèque de l'IA est"} mélangée.`, 'system');
  });

  return registry;
}
