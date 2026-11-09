// @ts-check
/**
 * v12.74 — Invariants du moteur, vérifiables après CHAQUE action d'une partie (banc IA-vs-IA).
 * Chaque invariant renvoie des messages courts et stables (utilisés pour regrouper les violations).
 * Aucune dépendance au navigateur : ce module est purement du cœur.
 */
import { effectivePowerToughness } from '../core/continuous-effects.js';

const SIDES = ['player', 'ai'];
const ZONES = ['hand', 'library', 'battlefield', 'graveyard', 'exile'];
const isToken = (o) => !!(o?.token || o?.isToken || o?.isTokenPermanent);

/** Tous les objets visibles : { obj, side, zone } (la pile : side = contrôleur de l'élément, zone = 'stack'). */
export function allObjects(game) {
  const out = [];
  for (const side of SIDES) for (const zone of ZONES) for (const obj of game.state[side][zone] || []) out.push({ obj, side, zone });
  for (const item of game.stack.items) if (item.type === 'spell' && item.source) out.push({ obj: item.source, side: item.controller, zone: 'stack' });
  return out;
}

/**
 * @param {import('../core/game-facade.js').GameFacade} game
 * @param {{deckSize: {player:number, ai:number}, stable?: boolean}} ctx
 *   stable = vrai quand la pile est vide et qu'aucun choix n'est en attente (les actions d'état ont eu lieu).
 * @returns {string[]}
 */
export function checkInvariants(game, ctx) {
  const v = [];
  const state = game.state;
  const objs = allObjects(game);

  // I1 — conservation des cartes par propriétaire (hors jetons) : rien ne se perd, rien ne se duplique.
  if (!(game.subgames?.depth > 0)) {
    for (const side of SIDES) {
      const n = objs.filter(({ obj }) => obj.owner === side && !isToken(obj)).length;
      if (n !== ctx.deckSize[side]) v.push(`I1 conservation: ${side} possède ${n} cartes (deck de ${ctx.deckSize[side]})`);
    }
  }

  // I2 — identité unique : deux objets ne partagent jamais uid ni objectId.
  const seenUid = new Map(), seenObj = new Map();
  for (const { obj, zone } of objs) {
    if (obj.uid != null) { if (seenUid.has(obj.uid)) v.push(`I2 uid dupliqué: ${obj.name} (${seenUid.get(obj.uid)} / ${zone})`); else seenUid.set(obj.uid, zone); }
    if (obj.objectId != null) { if (seenObj.has(obj.objectId)) v.push(`I2 objectId dupliqué: ${obj.name}`); else seenObj.set(obj.objectId, zone); }
  }

  // I3 — le champ `zone` de l'objet correspond à la zone qui le contient.
  for (const { obj, zone } of objs) {
    if (obj.zone != null && obj.zone !== zone) v.push(`I3 zone incohérente: ${obj.name} marqué '${obj.zone}' mais dans '${zone}'`);
  }

  // I4 — un jeton n'existe que sur le champ de bataille.
  for (const { obj, zone } of objs) if (isToken(obj) && zone !== 'battlefield') v.push(`I4 jeton hors champ de bataille: ${obj.name} dans '${zone}'`);

  // I5 — contrôleur cohérent avec le tableau du champ de bataille.
  for (const side of SIDES) for (const p of state[side].battlefield) {
    if (p.controller !== side) v.push(`I5 contrôleur incohérent: ${p.name} sur le champ de ${side} mais controller='${p.controller}'`);
  }

  // I6 — grandeurs numériques saines.
  for (const side of SIDES) {
    const st = state[side];
    if (!Number.isFinite(st.life) || !Number.isInteger(st.life)) v.push(`I6 vie invalide pour ${side}: ${st.life}`);
    for (const [k, val] of Object.entries(st.mana || {})) if (!Number.isInteger(val) || val < 0) v.push(`I6 mana invalide pour ${side}: ${k}=${val}`);
    for (const p of st.battlefield) if (p.damageMarked != null && (!Number.isFinite(p.damageMarked) || p.damageMarked < 0)) v.push(`I6 dégâts marqués invalides: ${p.name}=${p.damageMarked}`);
  }

  // I7 — points d'état stables (pile vide, aucun choix) : les actions d'état ont été appliquées.
  if (ctx.stable) {
    for (const side of SIDES) {
      const st = state[side];
      if (st.life <= 0 && !st.hasLost) v.push(`I7 ${side} à ${st.life} PV sans avoir perdu`);
      for (const p of st.battlefield) {
        if (!/Creature/i.test(String(p.type || ''))) continue;
        let t; try { t = effectivePowerToughness(state, p).toughness; } catch { t = p.toughness; }
        if (Number.isFinite(t) && t <= 0) v.push(`I7 créature d'endurance ${t} toujours en jeu: ${p.name}`);
        else if (Number.isFinite(t) && (p.damageMarked || 0) >= t) v.push(`I7 créature létalement blessée toujours en jeu: ${p.name} (${p.damageMarked}/${t})`);
      }
    }
  }
  return v;
}
