// V12.76 (G22) — City of Shadows (The Dark). Oracle (Scryfall DRK #116) :
//   {T}, exilez une créature que vous contrôlez : mettez un marqueur de stockage sur City of Shadows.
//   {T} : ajoutez {C} pour chaque marqueur de stockage sur City of Shadows (les marqueurs ne sont PAS retirés).
// Parties réelles : activation par le moteur, pile, coût d'exil avec vrai choix, mana sans retrait de marqueur.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
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
function put(g, side, name, extra = {}) {
  const uid = `${name}#${++seq}`;
  const p = { ...structuredClone(by(name)), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
const live = (g, p) => g.state[p.controller].battlefield.find((x) => x.uid === p.uid);
const storage = (g, p) => (live(g, p)?.counters || []).filter((c) => c.type === 'storage').length;
const inExile = (g, p) => g.state[p.owner].exile.some((x) => x.name === p.name);
const inGy = (g, p) => g.state[p.owner].graveyard.some((x) => x.name === p.name);
const settle = (g, choose) => { for (let i = 0; i < 10 && (g.stack.size > 0 || g.choices.getPending()); i++) { const pe = g.choices.getPending(); if (pe) { g.choices.resolve(choose ? choose(pe) : (pe.options?.[0] ?? [])); continue; } g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); } };
const act = (g, p, abilityIndex, extra = {}) => { g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: live(g, p) || p, controller: 'player', abilityIndex, target: null, ...extra }); };

assert.equal(by('City of Shadows').effectStatus, 'implemented', 'statut');
assert.doesNotMatch(by('City of Shadows').text_fr, /sacrifiez/i, 'le texte français ne doit plus dire « sacrifiez » (Oracle : exilez)');

// ── 1) Exil d'une créature (un seul candidat : automatique) -> marqueur via la pile ─────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows'); const bear = put(g, 'player', 'Grizzly Bears');
  act(g, city, 0); settle(g);
  assert.ok(inExile(g, bear), 'la créature est exilée (PAS au cimetière)');
  assert.ok(!inGy(g, bear), 'pas de passage par le cimetière');
  assert.equal(storage(g, city), 1, 'un marqueur de stockage');
  assert.equal(live(g, city).tapped, true, 'le terrain est engagé (coût {T})');
}

// ── 2) Sans créature : illégal, rien n'est payé ──────────────────────────────────────────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows');
  assert.throws(() => act(g, city, 0), /illégale|impossible|invalide/i);
  assert.equal(live(g, city).tapped, false, 'rien d\'engagé après un refus');
  assert.equal(storage(g, city), 0);
}

// ── 3) Une créature de l'ADVERSAIRE n'est pas un coût possible ──────────────────────────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows'); const foe = put(g, 'ai', 'Grizzly Bears');
  assert.throws(() => act(g, city, 0), /illégale|impossible|invalide/i);
  assert.ok(g.state.ai.battlefield.some((x) => x.uid === foe.uid), 'la créature adverse est intacte');
}

// ── 4) Plusieurs créatures : vrai choix du joueur, la bonne est exilée ───────────────────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows'); const a = put(g, 'player', 'Grizzly Bears'); const b = put(g, 'player', 'Hill Giant');
  act(g, city, 0, { sacrificeUid: b.uid }); settle(g);
  assert.ok(inExile(g, b), 'Hill Giant (choisi) est exilé');
  assert.ok(g.state.player.battlefield.some((x) => x.uid === a.uid), 'Grizzly Bears (non choisi) reste en jeu');
  assert.equal(storage(g, city), 1);
}

// ── 4b) Vrai choix : question en attente, le joueur désigne la SECONDE créature ─────────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows'); const a = put(g, 'player', 'Grizzly Bears'); const b = put(g, 'player', 'Hill Giant');
  g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: live(g, city), controller: 'player', abilityIndex: 0, target: null });
  const pe = g.choices.getPending();
  assert.ok(pe, 'une question est posée au joueur (deux créatures admissibles)');
  assert.deepEqual(pe.options.map((o) => o.uid).sort(), [a.uid, b.uid].sort(), 'les deux créatures sont proposées');
  assert.equal(live(g, city).tapped, false, 'rien n\'est payé tant que le joueur n\'a pas répondu');
  g.choices.resolve(pe.options.find((o) => o.uid === b.uid)); settle(g);
  assert.ok(inExile(g, b), 'la créature DÉSIGNÉE est exilée');
  assert.ok(g.state.player.battlefield.some((x) => x.uid === a.uid), 'l\'autre reste en jeu');
  assert.equal(storage(g, city), 1);
}

// ── 5) Mana : {C} par marqueur, marqueurs CONSERVÉS, aucun mana à 0 marqueur ─────────────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows', { counters: [{ type: 'storage' }, { type: 'storage' }, { type: 'storage' }] });
  act(g, city, 1);
  assert.equal(g.state.player.mana.C, 3, '3 marqueurs -> {C}{C}{C}');
  assert.equal(storage(g, city), 3, 'les marqueurs ne sont pas retirés');
  assert.equal(live(g, city).tapped, true);
}
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows');
  act(g, city, 1);
  assert.equal(g.state.player.mana.C, 0, '0 marqueur -> aucun mana');
  assert.equal(live(g, city).tapped, true, 'activée quand même (coût payé)');
}

// ── 6) La capacité de mana ne passe pas par la pile ; l'exil, si ───────────────────────────────────────────
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows', { counters: [{ type: 'storage' }] }); put(g, 'player', 'Grizzly Bears');
  act(g, city, 1);
  assert.equal(g.stack.size, 0, 'mana : pas de pile');
}
{
  const g = newGame(); const city = put(g, 'player', 'City of Shadows'); put(g, 'player', 'Grizzly Bears');
  act(g, city, 0);
  assert.equal(g.stack.size, 1, 'exil + marqueur : capacité sur la pile');
}

console.log('OK test-v12-133-g22-city-of-shadows');
