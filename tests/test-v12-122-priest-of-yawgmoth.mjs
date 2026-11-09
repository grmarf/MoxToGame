// V12.76 — Priest of Yawgmoth (Oracle : « {T}, sacrifiez un artefact : ajoutez un nombre de {B} égal à la valeur de mana de l'artefact sacrifié »).
// Avant : « sacrifiez un artefact » prenait automatiquement le PREMIER artefact trouvé. Désormais vrai choix du joueur (le coût n'est payé qu'après son choix).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
const priest = by('Priest of Yawgmoth'); assert.equal(priest.effectStatus, 'implemented'); assert.ok(/\{B\}/.test(priest.text_fr));
const CMC = { 'Sol Ring': 1, 'Basalt Monolith': 3, 'Juggernaut': 4, 'Mox Pearl': 0, 'Black Lotus': 0 };
for (const [n, v] of Object.entries(CMC)) assert.equal(by(n).cmc, v, `${n} : valeur de mana`);
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY();
  return g;
}
function put(g, side, name, extra = {}) {
  const uid = `${name}#${++seq}`;
  const p = { ...structuredClone(by(name)), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
const get = (g, p) => ['player', 'ai'].map((s) => g.state[s].battlefield.find((x) => x.uid === p.uid)).find(Boolean);
const gone = (g, p) => !get(g, p);
const inGy = (g, p) => g.state[p.owner].graveyard.some((x) => x.name === p.name);
const total = (m) => Object.values(m).reduce((a, b) => a + b, 0);
const use = (g, pr, side = 'player', extra = {}) => { g.state.priorityHolder = side; g.action('activateAbility', { permanent: get(g, pr), controller: side, abilityIndex: 0, target: null, ...extra }); };
const ILLEGAL = /illégale|invalide/i;

// 1) Aucun artefact : activation refusée, rien n'est payé ; l'artefact de l'ADVERSAIRE ne compte pas.
{
  const g = newGame(); const p = put(g, 'player', 'Priest of Yawgmoth'); put(g, 'player', 'Plains');
  assert.throws(() => use(g, p), ILLEGAL); assert.ok(!get(g, p).tapped);
  put(g, 'ai', 'Juggernaut'); assert.throws(() => use(g, p), ILLEGAL, "l'artefact adverse ne peut pas être sacrifié"); assert.ok(!get(g, p).tapped);
  console.log("OK V12.76.122.1 : sans artefact à soi, activation refusée (l'artefact adverse ne compte pas).");
}
// 2) Un seul artefact : sacrifice automatique, autant de {B} que sa valeur de mana (artefact-créature compris).
for (const [name, v] of [['Sol Ring', 1], ['Basalt Monolith', 3], ['Juggernaut', 4]]) {
  const g = newGame(); const p = put(g, 'player', 'Priest of Yawgmoth'); const a = put(g, 'player', name);
  use(g, p); assert.equal(g.choices.getPending(), null, 'un seul candidat : aucun choix');
  assert.deepEqual(g.state.player.mana, { ...EMPTY(), B: v }, `${name} (valeur ${v}) -> ${v} {B}`); assert.ok(gone(g, a) && inGy(g, a), 'artefact sacrifié'); assert.ok(get(g, p).tapped, 'Priest engagé');
  assert.equal(total(g.state.ai.mana), 0);
}
// 3) Valeur de mana 0 : aucun mana, mais le coût est payé (artefact sacrifié, Priest engagé).
for (const name of ['Mox Pearl', 'Black Lotus']) {
  const g = newGame(); const p = put(g, 'player', 'Priest of Yawgmoth'); const a = put(g, 'player', name);
  use(g, p); assert.equal(total(g.state.player.mana), 0, `${name} : valeur 0 -> aucun mana`); assert.ok(gone(g, a) && inGy(g, a)); assert.ok(get(g, p).tapped);
}
console.log('OK V12.76.122.2 : un seul artefact -> sacrifice automatique, {B} = valeur de mana (1, 3, 4) ; valeur 0 -> aucun mana, coût payé.');
// 4) Plusieurs artefacts : VRAI choix parmi MES artefacts ; rien n'est payé avant la réponse ; réponse hors options refusée.
for (const pick of ['Sol Ring', 'Juggernaut', 'Mox Pearl']) {
  const g = newGame(); const p = put(g, 'player', 'Priest of Yawgmoth'); put(g, 'player', 'Plains');
  const arts = Object.fromEntries(['Sol Ring', 'Juggernaut', 'Mox Pearl'].map((n) => [n, put(g, 'player', n)])); const foreign = put(g, 'ai', 'Basalt Monolith');
  use(g, p); const pending = g.choices.getPending();
  assert.equal(pending?.type, 'sacrificeChoice'); assert.deepEqual(pending.options.map((o) => o.name).sort(), ['Juggernaut', 'Mox Pearl', 'Sol Ring'], 'seulement mes artefacts (ni le terrain, ni l\'artefact adverse)');
  assert.ok(!get(g, p).tapped && Object.values(arts).every((a) => !gone(g, a)) && total(g.state.player.mana) === 0, 'rien n\'est payé avant le choix');
  assert.throws(() => g.choices.resolve(foreign), /invalide/i, 'l\'artefact adverse est refusé'); assert.throws(() => g.choices.resolve(get(g, p)), /invalide/i, 'le Priest (non artefact) est refusé');
  g.choices.resolve(arts[pick]);
  assert.ok(gone(g, arts[pick]) && inGy(g, arts[pick]), `${pick} sacrifié`); for (const [n, a] of Object.entries(arts)) if (n !== pick) assert.ok(!gone(g, a), `${n} reste en jeu`);
  assert.equal(g.state.player.mana.B, CMC[pick]); assert.equal(total(g.state.player.mana), CMC[pick]); assert.ok(get(g, p).tapped); assert.equal(g.choices.getPending(), null);
}
console.log("OK V12.76.122.3 : plusieurs artefacts -> vrai choix parmi MES artefacts (coût payé après la réponse), hors options refusé, {B} = valeur du choisi.");
// 5) Choix explicite fourni à l'action (interface / IA) : aucun choix en attente.
{
  const g = newGame(); const p = put(g, 'player', 'Priest of Yawgmoth'); const a = put(g, 'player', 'Sol Ring'); const b = put(g, 'player', 'Juggernaut');
  use(g, p, 'player', { sacrifice: a }); assert.equal(g.choices.getPending(), null); assert.equal(g.state.player.mana.B, 1); assert.ok(gone(g, a) && !gone(g, b));
  console.log('OK V12.76.122.4 : choix explicite transmis à l\'action -> pas de question, bon artefact sacrifié.');
}
// 6) Engagé / avec le mal d'invocation : refusé ; côté IA : le mana va à l'IA, choix posé à l'IA.
{
  const g = newGame(); const p = put(g, 'player', 'Priest of Yawgmoth', { tapped: true }); put(g, 'player', 'Sol Ring'); assert.throws(() => use(g, p), ILLEGAL, 'engagé');
  const g2 = newGame(); const p2 = put(g2, 'player', 'Priest of Yawgmoth', { summoningSickness: true }); put(g2, 'player', 'Sol Ring'); assert.throws(() => use(g2, p2), ILLEGAL, "mal d'invocation");
  const g3 = newGame(); const ai = put(g3, 'ai', 'Priest of Yawgmoth'); const x = put(g3, 'ai', 'Sol Ring'); const y = put(g3, 'ai', 'Basalt Monolith'); put(g3, 'player', 'Juggernaut');
  use(g3, ai, 'ai'); assert.equal(g3.choices.getPending()?.controller, 'ai'); g3.choices.resolve(y);
  assert.equal(g3.state.ai.mana.B, 3); assert.equal(total(g3.state.player.mana), 0); assert.ok(gone(g3, y) && !gone(g3, x));
  console.log("OK V12.76.122.5 : engagé / mal d'invocation refusés ; côté IA : choix posé à l'IA, mana à l'IA.");
}
