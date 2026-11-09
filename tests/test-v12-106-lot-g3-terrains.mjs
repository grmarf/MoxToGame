// V12.76 — Chantier 2, lot G3 : cartes « terrains » (8 cartes).
// Fastbond, Worms of the Earth, Living Lands, Kormus Bell, Living Plane, Angry Mob, Blood Moon, Goblin Caves.
// Tout est joué en partie réelle (GameFacade, CAST_SPELL, playLand, tapMana, CombatService) avec les vraies cartes.
// Couvre aussi le défaut `dynamicPT` : la force définie par une capacité d'une carte (Nightmare, Plague Rats...) s'imposait
// à TOUTES les créatures, et `controller: 'all'` était ignoré.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { CombatService } from '../src/core/combat.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const FULL = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai');
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5;
  return g;
}
function put(g, side, name, extra = {}) {
  const p = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
function settle(g) { for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); }
function cast(g, name, host = null) {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(card); g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player';
  const payload = { card, xValue: 0 };
  if (host) payload.target = { kind: 'permanent', uid: host.uid, side: host.controller };
  try { g.dispatch('CAST_SPELL', payload, 'player'); settle(g); } catch (e) { return { error: e.message }; }
  return g.state.player.battlefield.find((p) => p.uid === card.uid) || null;
}
const chars = (g, p) => calculateCharacteristics(g.state, p);
const pt = (g, p) => { const c = chars(g, p); return `${c.power}/${c.toughness}`; };
const isCreature = (g, p) => /Creature/.test(chars(g, p).type);
function playLand(g, side, name) {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  try { g.action('playLand', { card, controller: side }); } catch { /* refus attendu dans certains cas */ }
  return g.state[side].battlefield.some((p) => p.name === name && p.uid !== card.uid && false) || g.state[side].battlefield.find((p) => p.name === name && p.playedThisTurn) || null;
}
const landCount = (g, side) => g.state[side].battlefield.filter((p) => /Land/.test(p.type)).length;
const combatFor = (g) => { const c = new CombatService({ state: () => g.state, sba: g.stateBasedActions }); c.begin(); return c; };
const untap = (g, p) => { const live = g.state[p.controller].battlefield.find((x) => x.uid === p.uid); assert.ok(live, `${p.name} introuvable`); live.tapped = false; };
const attackers = (g, side = 'player') => combatFor(g).getValidAttackers(side).map((p) => p.uid);

// ── 1. Données ───────────────────────────────────────────────────────────
const LOT = ['Fastbond', 'Worms of the Earth', 'Living Lands', 'Kormus Bell', 'Living Plane', 'Angry Mob', 'Blood Moon', 'Goblin Caves'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 2. Worms of the Earth ───────────────────────────────────────────────
{
  const g = newGame();
  assert.ok(playLand(g, 'player', 'Forest'), 'témoin : sans Worms, un terrain se joue');
  const g2 = newGame();
  assert.ok(cast(g2, 'Worms of the Earth'), 'Worms résolu');
  assert.equal(playLand(g2, 'player', 'Forest'), null, 'Worms : le joueur ne joue pas de terrain');
  assert.equal(landCount(g2, 'player'), 0);
  assert.equal(playLand(g2, 'ai', 'Forest'), null, 'Worms : l\'adversaire non plus');
  g2.state.player.battlefield = g2.state.player.battlefield.filter((p) => p.name !== 'Worms of the Earth');
  g2.state.player.landsPlayedThisTurn = 0;
  assert.ok(playLand(g2, 'player', 'Forest'), 'Worms parti : on rejoue');
}

// ── 3. Fastbond ─────────────────────────────────────────────────────────
{
  const g = newGame();
  assert.ok(playLand(g, 'player', 'Forest')); assert.equal(playLand(g, 'player', 'Island'), null, 'témoin : un seul terrain sans Fastbond');
  const f = newGame(); assert.ok(cast(f, 'Fastbond'), 'Fastbond résolu');
  const life0 = f.state.player.life;
  playLand(f, 'player', 'Forest'); assert.equal(f.state.player.life, life0, 'premier terrain : aucune blessure');
  playLand(f, 'player', 'Island'); playLand(f, 'player', 'Swamp');
  assert.equal(landCount(f, 'player'), 3, 'Fastbond : plusieurs terrains dans le même tour');
  assert.equal(f.state.player.life, life0 - 2, 'Fastbond : 1 blessure par terrain au-delà du premier');
  // le Fastbond de l'adversaire ne profite pas au joueur
  const h = newGame(); put(h, 'ai', 'Fastbond');
  assert.ok(playLand(h, 'player', 'Forest')); assert.equal(playLand(h, 'player', 'Island'), null, 'Fastbond adverse : sans effet pour moi');
}

// ── 4. Living Lands / Kormus Bell / Living Plane ────────────────────────
{
  const g = newGame();
  const f1 = put(g, 'player', 'Forest'); const f2 = put(g, 'ai', 'Forest'); const sw = put(g, 'player', 'Swamp'); const bear = put(g, 'player', 'Hill Giant');
  assert.ok(cast(g, 'Living Lands'), 'Living Lands résolu');
  for (const f of [f1, f2]) { assert.equal(pt(g, f), '1/1', 'forêt 1/1 (Oracle : « All Forests are 1/1 creatures that are still lands »)'); assert.ok(isCreature(g, f), 'forêt créature'); assert.ok(/Land/.test(chars(g, f).type), 'elle reste un terrain'); assert.ok(/Basic/.test(chars(g, f).type), 'et reste basique'); }
  assert.ok(!isCreature(g, sw), 'marais : non touché'); assert.equal(pt(g, bear), '3/3', 'vraie créature : non touchée');
  assert.ok(attackers(g).includes(f1.uid), 'forêt en jeu depuis plus d\'un tour : peut attaquer');
  f1.enteredTurn = g.state.turnNumber; assert.ok(!attackers(g).includes(f1.uid), 'forêt arrivée CE tour : mal d\'invocation');
  g.state.player.mana = { C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 }; untap(g, f1);
  g.action('tapMana', { permanent: f1, controller: 'player', color: 'G' }); assert.equal(g.state.player.mana.G, 1, 'la forêt animée produit toujours du mana');
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.name !== 'Living Lands');
  assert.ok(!isCreature(g, f1) && !isCreature(g, f2), 'Living Lands parti : plus de créature');
}
{
  const g = newGame(); const sw = put(g, 'ai', 'Swamp'); const fo = put(g, 'player', 'Forest');
  assert.ok(cast(g, 'Kormus Bell'), 'Kormus Bell résolu');
  assert.equal(pt(g, sw), '1/1'); assert.ok(isCreature(g, sw)); assert.ok(!isCreature(g, fo), 'Kormus Bell : marais seulement');
}
{
  const g = newGame(); const sw = put(g, 'ai', 'Swamp'); const fo = put(g, 'player', 'Forest'); const sea = put(g, 'player', 'Underground Sea');
  assert.ok(cast(g, 'Living Plane'), 'Living Plane résolu');
  for (const l of [sw, fo, sea]) { assert.equal(pt(g, l), '1/1', `${l.name} 1/1`); assert.ok(isCreature(g, l)); assert.ok(/Land/.test(chars(g, l).type)); }
}

// ── 5. Angry Mob + régression dynamicPT ─────────────────────────────────
{
  const g = newGame();
  const mob = put(g, 'player', 'Angry Mob'); const giant = put(g, 'player', 'Hill Giant');
  put(g, 'player', 'Swamp'); put(g, 'player', 'Swamp');           // MES marais ne comptent pas
  put(g, 'ai', 'Swamp'); put(g, 'ai', 'Swamp'); put(g, 'ai', 'Swamp'); put(g, 'ai', 'Forest');
  assert.equal(pt(g, mob), '5/5', 'mon tour : 2 + 3 marais adverses');
  assert.equal(pt(g, giant), '3/3', 'une autre créature n\'est pas touchée');
  g.state.activePlayer = 'ai'; assert.equal(pt(g, mob), '2/2', 'tour adverse : 2/2');
  g.state.activePlayer = 'player'; g.state.ai.battlefield = g.state.ai.battlefield.filter((p) => p.name !== 'Swamp');
  assert.equal(pt(g, mob), '2/2', 'plus de marais adverse : 2/2');
}
{ // Nightmare ne définit que SA force
  const g = newGame(); const nm = put(g, 'player', 'Nightmare'); put(g, 'player', 'Swamp'); put(g, 'player', 'Swamp'); put(g, 'player', 'Swamp');
  const giant = put(g, 'ai', 'Hill Giant'); const ogre = put(g, 'player', 'Gray Ogre');
  assert.equal(pt(g, nm), '3/3'); assert.equal(pt(g, giant), '3/3', 'Hill Giant adverse intact'); assert.equal(pt(g, ogre), '2/2', 'Gray Ogre intact');
  put(g, 'player', 'Swamp'); assert.equal(pt(g, nm), '4/4'); assert.equal(pt(g, giant), '3/3'); assert.equal(pt(g, ogre), '2/2');
}
{ // Plague Rats : « controller: all » — les deux camps comptent
  const g = newGame(); const r1 = put(g, 'player', 'Plague Rats'); const r2 = put(g, 'ai', 'Plague Rats'); const giant = put(g, 'player', 'Hill Giant');
  assert.equal(pt(g, r1), '2/2', 'Plague Rats : 2 rats en jeu (un par camp)'); assert.equal(pt(g, r2), '2/2'); assert.equal(pt(g, giant), '3/3');
  put(g, 'ai', 'Plague Rats'); assert.equal(pt(g, r1), '3/3', 'troisième rat, côté adverse');
}

// ── 6. Blood Moon ───────────────────────────────────────────────────────
{
  const g = newGame();
  const sea = put(g, 'player', 'Underground Sea'); const island = put(g, 'player', 'Island'); const aiSea = put(g, 'ai', 'Underground Sea'); const mtn = put(g, 'player', 'Mountain');
  g.state.player.mana = { C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 };
  g.action('tapMana', { permanent: sea, controller: 'player', color: 'U' }); assert.equal(g.state.player.mana.U, 1, 'avant Blood Moon : le double terrain produit U');
  untap(g, sea); g.state.player.mana = { C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 };
  assert.ok(cast(g, 'Blood Moon'), 'Blood Moon résolu'); g.state.player.mana = { C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 };
  for (const l of [sea, aiSea]) assert.equal(chars(g, l).subtype, 'Mountain', `${l.name} devient Montagne`);
  assert.equal(chars(g, island).subtype, 'Island', 'terrain de base : intact');
  assert.throws(() => g.action('tapMana', { permanent: sea, controller: 'player', color: 'U' }), /invalide/i, 'Blood Moon : plus de mana bleu');
  g.action('tapMana', { permanent: sea, controller: 'player', color: 'R' }); assert.equal(g.state.player.mana.R, 1, 'Blood Moon : le terrain produit R');
  g.action('tapMana', { permanent: island, controller: 'player', color: 'U' }); assert.equal(g.state.player.mana.U, 1, 'l\'Île de base produit toujours U');
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.name !== 'Blood Moon'); untap(g, sea);
  g.state.player.mana = { C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 };
  g.action('tapMana', { permanent: sea, controller: 'player', color: 'B' }); assert.equal(g.state.player.mana.B, 1, 'Blood Moon parti : production rendue');
}

// ── 7. Goblin Caves ─────────────────────────────────────────────────────
// V12.76 (G23) : l'ancienne version (Montagne enchantée = {R}{R}, Forêt illégale) était fausse : Oracle = « Enchanter : terrain ;
// tant que le terrain enchanté est une Montagne de base, les créatures Gobelin gagnent +0/+2 ». Détail dans test-v12-134.
{
  const g = newGame(); const mtn = put(g, 'player', 'Mountain'); const forest = put(g, 'player', 'Forest');
  const caves = cast(g, 'Goblin Caves', mtn);
  assert.ok(caves && caves.attachedTo === mtn.uid, 'Goblin Caves attachée à la Montagne');
  g.state.player.mana = { C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 };
  g.action('tapMana', { permanent: mtn, controller: 'player', color: 'R' }); assert.equal(g.state.player.mana.R, 1, 'Montagne enchantée : {R} seulement (plus de doublement de mana)');
  const caves2 = cast(g, 'Goblin Caves', forest);
  assert.ok(caves2 && caves2.attachedTo === forest.uid, 'Goblin Caves : une Forêt est une cible légale (Enchanter : terrain)');
}
console.log('test-v12-106 OK');
