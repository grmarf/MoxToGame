// V12.3 — C6: card-facing replacement & prevention rules.
// All prevention effects now flow through ReplacementService.addPreventionShield.
// The legacy global flag `combatDamagePreventedUntilCleanup` has been removed
// in favour of a canonical shield with combatOnly=true and until='cleanup'.
import { gameEvents } from '../event-bus.js';

const sides = ['player','ai'];
const isCreature = p => /(^|\s|—)Creature\b/i.test(String(p?.type || ''));
const isFlying = p => !!p?.flying || !!p?.keywords?.flying || /(^|[\s,])flying([\s,]|$)/i.test(String(p?.keywords || ''));

function allBattlefield(state) { return sides.flatMap(s => state[s]?.battlefield || []); }

export function registerC6Effects(registry) {
  const reg = (type, fn) => { if (!registry.has(type)) registry.register(type, fn); };

  // Circle of Protection cycle: creates a one-shot shield filtered by source color.
  reg('preventNextDamageFromColor', (ctx, effect) => {
    ctx.api.replacements?.addPreventionShield(ctx.controllerKey, {
      amount: Number(effect.amount || 999999),
      color: effect.color || null,
      source: null,
      scope: 'controller',
      once: true, // V12.76 (G31) : « la prochaine fois qu'une source … » : un seul événement
      until: 'nextMatchingDamage'
    });
  });

  // Artifact version: the database uses a fixed 2-damage shield.
  reg('preventNextTwoDamageFromArtifact', (ctx) => {
    ctx.api.replacements?.addPreventionShield(ctx.controllerKey, {
      amount: 2, sourceType: 'Artifact', scope: 'controller', until: 'nextMatchingDamage'
    });
  });
  // Circle of Protection: Artifacts — one-shot prevention for the next
  // damage dealt by an artifact source this turn.
  reg('preventNextDamageFromArtifact', (ctx) => {
    ctx.api.replacements?.addPreventionShield(ctx.controllerKey, {
      amount: 999999,
      sourceType: 'Artifact',
      scope: 'controller',
      once: true, // V12.76 (G31)
      until: 'nextMatchingDamage'
    });
  });

  // Fog: combat-only prevention shield applied globally to both sides.
  // V12.3 — migrated from global flag to canonical shield.
  reg('preventCombatDamage', (ctx) => {
    for (const side of sides) {
      ctx.api.replacements?.addPreventionShield(side, {
        amount: 999999,
        scope: 'controllerAndCreatures',
        combatOnly: true,
        until: 'cleanup'
      });
    }
  });

  // Reverse Damage: prevent damage to controller and creatures controlled by them
  // for the current turn, then gain life equal to damage prevented.
  // V12.75 : « La prochaine fois qu'une source DE VOTRE CHOIX devrait vous blesser ce tour-ci, prévenez ces blessures.
  // Vous gagnez autant de points de vie. » : source choisie à la résolution, un seul événement, vous seulement
  // (l'ancienne version protégeait tout le tour contre toutes les sources, vous ET vos créatures).
  reg('reverseDamage', (ctx) => {
    const s = ctx.controllerKey; const api = ctx.api;
    const own = ctx.sourceCard?.uid;
    const sources = [
      ...api.allPermanents().map((p) => ({ uid: p.uid, name: p.name })),
      ...(api.stackItems?.() || []).filter((it) => it.type === 'spell' && it.source?.uid && it.source.uid !== own).map((it) => ({ uid: it.source.uid, name: it.source.name })),
    ];
    const apply = (chosen) => {
      const pick = Array.isArray(chosen) ? chosen[0] : chosen; if (!pick) return null;
      api.replacements?.addPreventionShield(s, { amount: 999999, source: { uid: pick.uid }, requireSource: true, scope: 'playerOnly', until: 'cleanup', once: true, gainLife: true });
      api.log?.(`Reverse Damage : la prochaine blessure de ${pick.name} contre ${s === 'player' ? 'vous' : "l'IA"} sera prévenue (et convertie en points de vie).`, s);
      return pick;
    };
    if (!sources.length) return null;
    const chosen = api.choose({ type: 'chooseSource', controller: s, options: sources, min: 1, max: 1, prompt: 'Choisissez une source de blessures.' }, apply);
    if (chosen != null) return apply(chosen);
    return null;
  });

  // Island Sanctuary: non-flying creatures cannot deal combat damage to its controller.
  reg('preventDamageFromNonFlying', (ctx) => {
    const controller = ctx.controllerKey;
    ctx.api.replacements?.addPreventionShield(controller, {
      amount: 999999,
      sourceType: 'Creature',
      nonFlyingOnly: true,
      combatOnly: true,
      scope: 'controller',
      persistent: true
    });
  });

  // V12.76 (G31) : Conservator — « prévenez les 2 prochaines blessures qui vous seraient infligées ce tour-ci » (VOUS seulement, pas vos créatures).
  reg('preventDamageToYou', (ctx, effect) => {
    ctx.api.replacements?.addPreventionShield(ctx.controllerKey, { amount: Number(effect.amount || 1), scope: 'playerOnly', until: 'nextMatchingDamage' });
    ctx.api.log?.(`${ctx.sourceCard?.name} : les ${effect.amount} prochaines blessures qui vous seraient infligées ce tour-ci sont prévenues.`, ctx.controllerKey);
  });

  // V12.76 (G31) : Forcefield — « la prochaine fois qu'une créature NON BLOQUÉE de votre choix devrait vous infliger des blessures de combat ce tour-ci, prévenez-en tout sauf 1 ».
  // La source est choisie à la résolution parmi les attaquantes non bloquées qui vous attaquent ; bouclier à usage unique, combat seulement, sur le joueur seulement.
  reg('forcefield', (ctx) => {
    const api = ctx.api; const me = ctx.controllerKey; const cb = api.combat; if (!cb || cb.defendingSide !== me) return null;
    const options = (cb.attackers || []).filter((uid) => !(cb.blockers?.[uid] || []).length).map((uid) => api.findPermanent(uid)).filter(Boolean).map((p) => ({ uid: p.uid, name: p.name }));
    if (!options.length) { api.log?.(`${ctx.sourceCard?.name} : aucune créature non bloquée ne vous attaque.`, me); return null; }
    const apply = (chosen) => {
      const pick = Array.isArray(chosen) ? chosen[0] : chosen; if (!pick) return null;
      api.replacements?.addPreventionShield(me, { amount: 999999, source: { uid: pick.uid }, requireSource: true, scope: 'playerOnly', combatOnly: true, leave: 1, once: true, until: 'nextMatchingDamage' });
      api.log?.(`${ctx.sourceCard?.name} : les blessures de combat de ${pick.name} contre vous seront réduites à 1.`, me); return pick;
    };
    const chosen = api.choose({ type: 'chooseSource', controller: me, options, min: 1, max: 1, prompt: `${ctx.sourceCard?.name} : quelle créature non bloquée ?` }, apply);
    return chosen != null ? apply(chosen) : null;
  });

  // V12.76 (G31) : Maze of Ith — « dégagez l'attaquante ciblée ; prévenez ce tour-ci toutes les blessures de combat qui lui sont infligées et qu'elle inflige » (mots-clés temporaires, G26).
  reg('mazeOfIth', (ctx) => {
    const t = ctx.api.findPermanent?.(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo); if (!t) return;
    t.tapped = false; t.tempKeywords = [...new Set([...(t.tempKeywords || []), 'nocombatdamagedealt', 'nocombatdamagereceived'])];
    ctx.api.log?.(`${ctx.sourceCard?.name} : ${t.name} est dégagée ; aucune blessure de combat ne lui est infligée ni ne sera infligée par elle ce tour-ci.`, ctx.controllerKey);
  });

  // Static protection helper used by White Ward and similar cards.
  // V12.3 — kept as marker; full 702.16 semantics are Phase-2 work.
  reg('addProtection', (ctx, effect) => {
    const target = ctx.api.findPermanent?.(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo);
    if (!target) return;
    target.protectionFrom = Array.from(new Set([...(target.protectionFrom || []), effect.color].filter(Boolean)));
  });

  // Generic regeneration shield remains compatible with the SBA implementation.
  reg('regenerateShield', (ctx) => {
    const target = ctx.api.findPermanent?.(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo);
    if (target) target.regenShield = true;
  });
}

export function installC6EventRules() {
  gameEvents.on('cleanupStarted', ({state}) => {
    if (!state) return;
    // V12.3 — global flag removed; shields with until='cleanup' are purged
    // by the existing prevention-filter logic in ReplacementService.
    for (const side of sides) {
      const shields = Array.isArray(state[side].prevention) ? state[side].prevention : [];
      state[side].prevention = shields.filter(s => s.persistent || s.until !== 'cleanup');
    }
  });
}
