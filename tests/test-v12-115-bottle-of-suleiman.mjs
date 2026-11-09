// V12.76 — Bottle of Suleiman (texte réel : « {1}, sacrifiez la Bouteille : lancez une pièce. Si vous gagnez, créez un jeton
// de créature-artefact Djinn 5/5 incolore avec le vol. Si vous perdez, elle vous inflige 5 blessures. »).
// Avant : la face portait `type: "Creature"` à la place de `createToken` (clé en double héritée) -> la branche ne faisait rien,
// le sacrifice manquait, et les branches de coinFlip s'exécutaient toujours pour le côté « player » même si l'IA contrôlait la source.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { rngClock } from '../src/core/rng-clock-service.js';
import CARDS from '../src/data/cards-database.js';

const bottle = CARDS.find((c) => c.name === 'Bottle of Suleiman');
assert.equal(bottle.effectStatus, 'implemented');
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY();
  return g;
}
function put(g, side) {
  const uid = `Bottle#${++seq}`;
  const p = { ...structuredClone(bottle), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1 };
  g.state[side].battlefield.push(p); return p;
}
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
function activate(g, p, side) {
  g.state.priorityHolder = side;
  g.action('activateAbility', { permanent: g.state[side].battlefield.find((x) => x.uid === p.uid), controller: side, abilityIndex: 0, target: null });
  settle(g);
}
const realRandom = rngClock.random.bind(rngClock);
const force = (v) => { rngClock.random = () => v; };
const restore = () => { delete rngClock.random; };
const djinns = (g, side) => g.state[side].battlefield.filter((p) => p.token && p.name === 'Djinn');
const bottleGone = (g, side, p) => !g.state[side].battlefield.some((x) => x.uid === p.uid) && g.state[side].graveyard.some((x) => x.name === 'Bottle of Suleiman');

for (const side of ['player', 'ai']) {
  const other = side === 'player' ? 'ai' : 'player';
  // 1) Gagné : un Djinn 5/5 incolore, artefact-créature, volant, au bon contrôleur ; la Bouteille est sacrifiée ; aucune blessure.
  {
    const g = newGame(); const b = put(g, side); g.state[side].mana = { ...EMPTY(), C: 1 };
    force(0.25); try { activate(g, b, side); } finally { restore(); }
    const d = djinns(g, side);
    assert.equal(d.length, 1, `${side} : exactement un Djinn`);
    assert.equal(djinns(g, other).length, 0, `${side} : rien pour l'autre camp`);
    assert.ok(/Artifact/.test(d[0].type) && /Creature/.test(d[0].type), `${side} : artefact-créature (${d[0].type})`);
    assert.equal(d[0].isCreature, true); assert.equal(d[0].power, 5); assert.equal(d[0].toughness, 5);
    assert.deepEqual(d[0].color, [], 'incolore'); assert.ok(d[0].keywords.includes('flying'), 'vol'); assert.equal(d[0].subtype, 'Djinn');
    assert.ok(bottleGone(g, side, b), `${side} : la Bouteille est sacrifiée`);
    assert.equal(g.state[side].life, 20, `${side} : aucune blessure en cas de gain`);
    console.log(`OK V12.76.115.1 (${side}) : pièce gagnée -> Djinn 5/5 artefact-créature incolore volant, Bouteille sacrifiée.`);
  }
  // 2) Perdu : 5 blessures AU CONTRÔLEUR (pas à l'autre camp), pas de jeton ; la Bouteille est quand même sacrifiée (coût).
  {
    const g = newGame(); const b = put(g, side); g.state[side].mana = { ...EMPTY(), C: 1 };
    force(0.75); try { activate(g, b, side); } finally { restore(); }
    assert.equal(g.state[side].life, 15, `${side} : 5 blessures`); assert.equal(g.state[other].life, 20, `${side} : l'autre camp est intact`);
    assert.equal(djinns(g, side).length + djinns(g, other).length, 0, 'aucun jeton');
    assert.ok(bottleGone(g, side, b), `${side} : sacrifiée même en cas de défaite (coût)`);
    console.log(`OK V12.76.115.2 (${side}) : pièce perdue -> 5 blessures au contrôleur, Bouteille sacrifiée.`);
  }
}
// 3) Bornes : 0.4999… = gagné, 0.5 = perdu (50/50 exact).
for (const [v, win] of [[0.4999999, true], [0.5, false]]) {
  const g = newGame(); const b = put(g, 'player'); g.state.player.mana = { ...EMPTY(), C: 1 };
  force(v); try { activate(g, b, 'player'); } finally { restore(); }
  assert.equal(djinns(g, 'player').length === 1, win, `valeur ${v}`);
}
console.log('OK V12.76.115.3 : seuil de la pièce à 0,5.');
// 4) Sans mana : activation refusée, Bouteille intacte.
{
  const g = newGame(); const b = put(g, 'player'); g.state.player.mana = EMPTY();
  assert.throws(() => activate(g, b, 'player'), /illégale|mana|payer/i);
  assert.ok(g.state.player.battlefield.some((x) => x.uid === b.uid), 'Bouteille intacte');
  console.log('OK V12.76.115.4 : sans {1}, activation refusée.');
}
// 5) Tirage réel 50/50 (graines 1..200 par le vrai générateur) : ni biaisé vers gagner, ni vers perdre.
{
  let wins = 0; const N = 200;
  for (let s = 1; s <= N; s++) {
    rngClock.configure({ seed: s });
    const g = newGame(); const b = put(g, 'player'); g.state.player.mana = { ...EMPTY(), C: 1 };
    activate(g, b, 'player');
    const won = djinns(g, 'player').length === 1; const lost = g.state.player.life === 15;
    assert.ok(won !== lost, `graine ${s} : exactement une issue`); if (won) wins++;
  }
  rngClock.configure({ seed: null });
  assert.ok(wins >= 70 && wins <= 130, `gagné ${wins}/${N} : hors de la fourchette 50/50`);
  console.log(`OK V12.76.115.5 : ${wins}/${N} gagnés sur 200 graines (50/50).`);
}
