// V12.76 (G19) — « Target player » (Ancestral Recall, Braingeyser, Mind Twist) et Fissure (créature OU terrain, sans régénération).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 20 }, (_, i) => ({ uid: `${p}F${i}`, objectId: `${p}FO${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai'); g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; return g;
}
const put = (g, side, name) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false }; g.state[side].battlefield.push(p); return p; };
const pT = (p) => ({ kind: 'permanent', uid: p.uid });
const PL = (side) => ({ kind: 'player', side, id: side });
function cast(g, name, target, x = 0, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side);
  for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  return card;
}
const hand = (g, s) => g.state[s].hand.length;
const has = (g, p) => ['player', 'ai'].some((s) => g.state[s].battlefield.some((q) => q.uid === p.uid));

for (const n of ['Ancestral Recall', 'Braingeyser', 'Mind Twist', 'Fissure']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Ancestral Recall : le joueur CHOISI pioche 3 (soi ou l'adversaire) ──────────────────────────────────
{ const g = newGame(); cast(g, 'Ancestral Recall', PL('player')); assert.equal(hand(g, 'player'), 3, 'soi : +3'); assert.equal(hand(g, 'ai'), 0); }
{ const g = newGame(); cast(g, 'Ancestral Recall', PL('ai')); assert.equal(hand(g, 'ai'), 3, 'l\'adversaire ciblé pioche 3'); assert.equal(hand(g, 'player'), 0, 'et pas le lanceur'); }
assert.throws(() => { const g = newGame(); cast(g, 'Ancestral Recall', undefined); }, /cible/i, 'sans cible : refusé (une cible est requise)');
// ── Braingeyser : X cartes pour le joueur ciblé ─────────────────────────────────────────────────────────
for (const x of [0, 2, 5]) {
  { const g = newGame(); cast(g, 'Braingeyser', PL('player'), x); assert.equal(hand(g, 'player'), x, `soi X=${x}`); assert.equal(hand(g, 'ai'), 0); }
  { const g = newGame(); cast(g, 'Braingeyser', PL('ai'), x); assert.equal(hand(g, 'ai'), x, `adversaire X=${x}`); assert.equal(hand(g, 'player'), 0); }
}
// ── Mind Twist : le joueur ciblé défausse X cartes AU HASARD (soi-même aussi, c'est légal) ──────────────
{ const g = newGame(); g.state.ai.hand = ['A', 'B', 'C', 'D'].map((n, i) => ({ uid: `h${i}`, objectId: `ho${i}`, name: n, type: 'Land', owner: 'ai' }));
  cast(g, 'Mind Twist', PL('ai'), 3); assert.equal(hand(g, 'ai'), 1, 'X=3 : il en reste 1'); assert.equal(g.state.ai.graveyard.length, 3, 'au cimetière'); }
{ const g = newGame(); g.state.player.hand = ['A', 'B', 'C'].map((n, i) => ({ uid: `p${i}`, objectId: `po${i}`, name: n, type: 'Land', owner: 'player' }));
  cast(g, 'Mind Twist', PL('player'), 2); assert.equal(hand(g, 'player'), 1, 'sur soi-même : 3 - 2 = 1 (la carte lancée n\'est plus en main)'); assert.equal(hand(g, 'ai'), 0); }
{ const g = newGame(); g.state.ai.hand = [{ uid: 'x', objectId: 'xo', name: 'A', type: 'Land', owner: 'ai' }]; cast(g, 'Mind Twist', PL('ai'), 5); assert.equal(hand(g, 'ai'), 0, 'main vide : s\'arrête sans erreur'); }
// ── Options de cible : soi d'abord pour piocher, l'adversaire d'abord pour défausser (choix par défaut de l'IA, non modifiée) ─
{ const g = newGame(); const opt = (side, name) => g.engine.getValidTargets(by(name).effect.type, side, [], by(name).effect);
  const o1 = opt('ai', 'Ancestral Recall'), o2 = opt('ai', 'Mind Twist'), o3 = opt('player', 'Mind Twist'), o4 = opt('player', 'Braingeyser');
  const side = (o) => o[0].side || o[0].id;
  assert.equal(o1.length, 2, 'deux joueurs possibles'); assert.equal(side(o1), 'ai', 'l\'IA qui pioche se cible elle-même en premier'); assert.equal(side(o2), 'player', 'l\'IA qui défausse cible le joueur en premier');
  assert.equal(side(o3), 'ai', 'le joueur qui défausse : l\'adversaire en premier'); assert.equal(side(o4), 'player', 'le joueur qui pioche : soi en premier');
}
// ── Fissure : créature OU terrain ; « It can't be regenerated » ─────────────────────────────────────────
{ const g = newGame(); const land = put(g, 'ai', 'Mountain'); const c = put(g, 'ai', 'Hill Giant'); cast(g, 'Fissure', pT(land)); assert.ok(!has(g, land), 'un terrain est détruit'); assert.ok(has(g, c), 'et rien d\'autre'); }
{ const g = newGame(); const c = put(g, 'ai', 'Hill Giant'); cast(g, 'Fissure', pT(c)); assert.ok(!has(g, c), 'une créature aussi'); }
assert.throws(() => { const g = newGame(); const art = put(g, 'ai', 'Sol Ring'); cast(g, 'Fissure', pT(art)); }, /illégale|cible/i, 'un artefact (non créature, non terrain) est refusé');
{ const g = newGame(); const c = put(g, 'player', 'Hill Giant'); cast(g, 'Guardian Angel', pT(c), 0); cast(g, 'Fissure', pT(c), 0, 'ai'); assert.ok(!has(g, c), 'bouclier de régénération : Fissure passe quand même'); }
console.log('OK V12.76.130 : cibles de joueur (Ancestral Recall, Braingeyser, Mind Twist) et Fissure (créature ou terrain, sans régénération) en partie réelle.');
