import { tapPermanent } from '../permanent-tap.js';
import { effectiveTypes } from '../continuous-effects.js';
// V9.0 — fallback handlers for every effect descriptor present in the card database.
export function registerExtendedEffects(registry) {
  const reg = (type, fn) => { if (!registry.has(type)) registry.register(type, fn); };
  reg('unblockable', (ctx) => { const t = ctx.api?.findPermanent?.(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo); if (t) t.tempKeywords = [...new Set([...(t.tempKeywords || []), 'unblockable'])]; });
  reg('spiritLink', (ctx) => { const t = ctx.api?.findPermanent?.(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo); if (t) t.spiritLink = true; });
  // V12.19 (fix provisoire, PAS une correction complète) : pumpAttacking a été
  // retiré à tort lors du nettoyage v12.19 -- type unique, non dupliqué
  // ailleurs, utilisé par une carte réelle (Warrior's Charge, id 230, "Vos
  // créatures attaquantes +1/+0"). Son absence rendait la résolution du sort
  // un no-op totalement silencieux (stack.js:194 -- effects.has() échoue en
  // amont, aucune erreur levée, aucun log). Ce ré-enregistrement évite ce
  // no-op muet, MAIS NE RÉSOUT PAS LE FOND : l'état de combat
  // (CombatService#combat.attackers) n'est jamais exposé à `state` ni à
  // l'API construite pour la résolution de pile (#buildApi dans stack.js) --
  // aucun handler d'effet n'a de moyen fiable de savoir quelles créatures
  // attaquent au moment de la résolution. La condition p.attacking ci-dessous
  // est un espace réservé qui ne sera jamais vrai en l'état actuel du moteur.
  // À CORRIGER PAR KIMI : exposer l'état de combat courant (au minimum la
  // liste des uid attaquants) à travers ctx.state.combat ou ctx.api.combat,
  // puis remplacer la condition ci-dessous par une vérification réelle.
  // V12.75 : destruction (ou exil) de masse filtrés, sans cible : Cleanse (créatures noires), Tivadar's Crusade
  // (gobelins), Martyr's Cry (créatures blanches, exil), Tsunami / Acid Rain (îles / forêts), Shatterstorm
  // (artefacts, sans régénération). Les caractéristiques EFFECTIVES (couleur, sous-type) sont lues.
  reg('destroyAllMatching', (ctx, effect) => {
    const api = ctx.api;
    const wantType = effect.cardType ? String(effect.cardType).toLowerCase() : null;
    const wantSub = effect.subtype ? String(effect.subtype).toLowerCase() : null;
    const victims = api.allPermanents().filter((p) => {
      const c = effectiveTypes(ctx.state, p);
      if (wantType && !new RegExp(`\\b${wantType}\\b`, 'i').test(String(c.type || ''))) return false;
      // V12.76 : `cardTypes` (liste, « OU ») — Nevinyrral's Disk : tous les artefacts, créatures et enchantements.
      if (Array.isArray(effect.cardTypes) && !effect.cardTypes.some((t) => new RegExp(`\\b${String(t)}\\b`, 'i').test(String(c.type || '')))) return false;
      if (wantSub && !String(c.subtype || '').toLowerCase().split(/\s+/).includes(wantSub)) return false;
      if (effect.color && !(c.color || []).includes(effect.color)) return false;
      return true;
    });
    const exiledBy = {};
    for (const p of victims) {
      if (effect.exile) { exiledBy[p.controller] = (exiledBy[p.controller] || 0) + 1;
        const side = api.findPermSide ? api.findPermSide(p) : p.controller;
        if (api.zones) api.zones.move(p, 'exile', { toSide: p.owner || side, reason: 'effectExile' });
      } else {
        if (effect.noRegen) p.regenShield = false;
        api.destroyPermanent(p, effect.noRegen ? { noRegen: true } : {});
      }
    }
    if (effect.drawPerExiled) for (const sd of ['player', 'ai']) for (let i = 0; i < (exiledBy[sd] || 0); i++) { if (api.drawCard) api.drawCard(sd); } // V12.76 (G18) : Martyr's Cry (le contrôleur de chaque créature exilée pioche)
    api.log?.(`${ctx.sourceCard?.name || 'Effet'} : ${victims.length} permanent(s) ${effect.exile ? 'exilé(s)' : 'détruit(s)'}.`, 'system');
  });
  // V12.75 — lot E : sorts dont le montant dépend du plateau (nombre d'Îles, cartes en main, créatures blanches...).
  const countFor = (ctx, side, kind) => {
    const st = ctx.state; const mine = st[side].battlefield;
    const hasSub = (p, sub) => String(effectiveTypes(st, p).subtype || '').toLowerCase().split(/\s+/).includes(sub);
    switch (kind) {
      case 'island': return mine.filter((p) => /\bLand\b/i.test(String(effectiveTypes(st, p).type || '')) && hasSub(p, 'island')).length;
      case 'mountain': return mine.filter((p) => /\bLand\b/i.test(String(effectiveTypes(st, p).type || '')) && hasSub(p, 'mountain')).length;
      case 'cardsInHand': return st[side].hand.length;
      case 'whiteCreature': return mine.filter((p) => { const c = effectiveTypes(st, p); return /\bCreature\b/i.test(String(c.type || '')) && (c.color || []).includes('W'); }).length;
      default: return 0;
    }
  };
  const hitPlayer = (ctx, side, amount) => {
    const opts = { color: ctx.sourceCard?.color?.[0] || null, source: ctx.sourceCard, meta: { effect: 'damageByCount' } };
    if (ctx.api.applyDamageToPlayer) ctx.api.applyDamageToPlayer(side, amount, opts);
    else ctx.api.state[side].life -= amount;
  };
  // Cible : un joueur (Storm Seeker, Jovial Evil, Eternal Flame).
  reg('damageByCount', (ctx, effect) => {
    const t = ctx.targetInfo; if (t?.kind !== 'player') return;
    const countSide = effect.whose === 'caster' ? ctx.controllerKey : t.side;
    const amount = countFor(ctx, countSide, effect.count) * (effect.multiplier || 1);
    hitPlayer(ctx, t.side, amount);
    if (effect.selfDamageHalfRoundUp) hitPlayer(ctx, ctx.controllerKey, Math.ceil(amount / 2));
    ctx.api.log?.(`${ctx.sourceCard?.name || 'Effet'} inflige ${amount} blessures${effect.selfDamageHalfRoundUp ? ` (et ${Math.ceil(amount / 2)} à son lanceur)` : ''}.`, ctx.controllerKey);
    ctx.api.checkStateBasedDeaths?.();
  });
  // Sans cible : chaque adversaire (Typhoon).
  reg('damageEachOpponentByCount', (ctx, effect) => {
    const opp = ctx.controllerKey === 'player' ? 'ai' : 'player';
    const amount = countFor(ctx, effect.whose === 'caster' ? ctx.controllerKey : opp, effect.count) * (effect.multiplier || 1);
    hitPlayer(ctx, opp, amount);
    ctx.api.log?.(`${ctx.sourceCard?.name || 'Effet'} inflige ${amount} blessures à l'adversaire.`, ctx.controllerKey);
    ctx.api.checkStateBasedDeaths?.();
  });
  // Riptide : engagez toutes les créatures sans vol.
  reg('tapAllMatching', (ctx, effect) => {
    let n = 0;
    for (const p of ctx.api.allPermanents()) {
      if (!/\bCreature\b/i.test(String(effectiveTypes(ctx.state, p).type || ''))) continue;
      if (effect.withoutKeyword && ctx.api.effectiveKeywords(p).includes(effect.withoutKeyword)) continue;
      if (effect.color && !(effectiveTypes(ctx.state, p).color || []).includes(effect.color)) continue; // V12.76 (G18) : Riptide (créatures bleues)
      if (tapPermanent(ctx.state, p, { reason: 'effect' })) n++;
    }
    ctx.api.log?.(`${ctx.sourceCard?.name || 'Effet'} : ${n} créature(s) engagée(s).`, 'system');
  });
  // Sandstorm : N blessures à chaque créature attaquante.
  reg('damageAttackers', (ctx, effect) => {
    const attackers = new Set(ctx.api.combat?.attackers || []);
    for (const p of ctx.api.allPermanents()) {
      if (!attackers.has(p.uid)) continue;
      if (ctx.api.applyDamageToPermanent) ctx.api.applyDamageToPermanent(p, effect.amount || 1, { color: ctx.sourceCard?.color?.[0] || null, source: ctx.sourceCard, meta: { effect: 'damageAttackers' } });
    }
    ctx.api.checkStateBasedDeaths?.();
  });
  // Winds of Change : chaque joueur mélange sa main dans sa bibliothèque puis pioche autant de cartes.
  reg('shuffleHandRedraw', (ctx) => {
    const zones = ctx.api.zones;
    for (const side of ['player', 'ai']) {
      const s = ctx.state[side]; const n = s.hand.length;
      for (const card of [...s.hand]) {
        if (zones && zones.find(card)) zones.move(card, 'library', { toSide: card.owner || side, reason: 'shuffleHand' });
        else { s.hand = s.hand.filter((c) => c !== card); s.library.push(card); }
      }
      s.library = ctx.api.shuffle(s.library);
      for (let i = 0; i < n; i++) {
        if (!s.library.length) { s.mustDraw = true; break; }
        const top = s.library[s.library.length - 1];
        if (zones && zones.find(top)) zones.move(top, 'hand', { toSide: side, reason: 'draw' });
        else s.hand.push(s.library.pop());
      }
    }
    ctx.api.log?.(`${ctx.sourceCard?.name || 'Effet'} : chaque joueur remélange sa main et repioche.`, 'system');
  });
  // V12.75 : bonus/malus de masse jusqu'à la fin du tour, sans cible (Army of Allah, Morale, Piety, Shield Wall,
  // Hell Swarm, Marsh Gas, Holy Light). Le jeu de créatures touchées est figé à la résolution (tempBuffs posés
  // sur les permanents présents), comme l'exigent les règles.
  reg('massPump', (ctx, effect) => {
    const api = ctx.api; const me = ctx.controllerKey;
    const combat = api?.combat;
    const attackers = new Set(combat?.attackers || []);
    const blockers = new Set(Object.values(combat?.blockers || {}).flat());
    for (const p of (api?.allPermanents ? api.allPermanents() : [])) {
      if (!/Creature/i.test(String(p.type || ''))) continue;
      if (effect.scope === 'attacking' && !attackers.has(p.uid)) continue;
      if (effect.scope === 'blocking' && !blockers.has(p.uid)) continue;
      if (effect.scope === 'yours' && p.controller !== me) continue;
      if (effect.filterColor && !(p.color || []).includes(effect.filterColor)) continue;
      if (effect.filterNotColor && (effectiveTypes(ctx.state, p).color || p.color || []).includes(effect.filterNotColor)) continue; // V12.76 (G18) : Holy Light (non blanches)
      // V12.76 : « les AUTRES créatures Orc » (Orc General) — sous-type et exclusion de la source.
      if (effect.filterSubtype && !String(p.subtype || '').split(/\s+/).includes(effect.filterSubtype)) continue;
      if (effect.excludeSource && ctx.sourceCard?.uid && p.uid === ctx.sourceCard.uid) continue;
      p.tempBuffs = p.tempBuffs || [];
      p.tempBuffs.push({ power: effect.power ?? 0, toughness: effect.toughness ?? 0, untilEndOfTurn: true });
    }
    api?.log?.(`${ctx.sourceCard?.name || 'Effet'} : ${effect.power >= 0 ? '+' : ''}${effect.power ?? 0}/${effect.toughness >= 0 ? '+' : ''}${effect.toughness ?? 0} jusqu'à la fin du tour.`, me);
  });
  reg('pumpAttacking', (ctx, effect) => {
    const controller = ctx.controllerKey;
    const combat = ctx.api?.combat;
    const attackingUids = combat?.attackers || [];
    const perms = ctx.api?.allPermanents ? ctx.api.allPermanents() : (ctx.state?.[controller]?.battlefield || []);
    for (const p of perms) {
      if (p.owner !== controller && p.controller !== controller) continue;
      if (!attackingUids.includes(p.uid)) continue;
      p.tempBuffs = p.tempBuffs || [];
      p.tempBuffs.push({ power: effect?.power ?? 0, toughness: effect?.toughness ?? 0, untilEndOfTurn: true });
    }
  });
}

// ─────────────────────────────────────────────
// C1/C2/C3 — keyword and activated-ability primitives
// ─────────────────────────────────────────────
const __mtg92Target = (ctx) => {
  const t = ctx.targetInfo;
  if (t?.kind === 'permanent') return t.perm;
  if (t?.uid) return ctx.api.allPermanents().find(p => p.uid === t.uid) || null;
  return null;
};

export function registerC123Effects(registry) {
  const reg = (type, fn) => { if (!registry.has(type)) registry.register(type, fn); };
  reg('untapTarget', ctx => { const t=__mtg92Target(ctx); if(t)t.tapped=false; });
  reg('sacrifice', ctx => { const t=__mtg92Target(ctx); if(t)ctx.api.destroyPermanent(t); });
}
