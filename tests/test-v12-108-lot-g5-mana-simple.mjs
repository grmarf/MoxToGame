// V12.76 — Chantier 2, lot G5 : mana simple (13 cartes) + primitive « arrive engagé » (`entersTapped`).
// Test PARAMÉTRÉ : un tableau « carte -> ce que sa capacité de mana doit produire / coûter / provoquer », joué en partie réelle
// (activation par le moteur, pool de mana, sacrifice, blessures canoniques, pose d'un terrain par playLand).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  g.state.player.library = Array.from({ length: 15 }, (_, i) => ({ uid: `F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: 'player' }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY();
  return g;
}
function put(g, name, extra = {}) {
  const uid = `${name}#${++seq}`; // objectId distinct : le moteur retrouve une carte par uid OU objectId
  const p = { ...by(name), uid, objectId: uid, owner: 'player', controller: 'player', zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state.player.battlefield.push(p); return p;
}
const live = (g, p) => g.state.player.battlefield.find((x) => x.uid === p.uid);
const inPlay = (g, p) => !!live(g, p);
const act = (g, p, i = 0) => g.action('activateAbility', { permanent: live(g, p), controller: 'player', abilityIndex: i });
function playLand(g, name) {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(card); g.state.priorityHolder = 'player'; g.state.player.landsPlayedThisTurn = 0;
  g.action('playLand', { card, controller: 'player' });
  const p = g.state.player.battlefield.find((x) => x.name === name && x.zone === 'battlefield' && !x._seen);
  assert.ok(p, `${name} posé`); p._seen = true; return p;
}

// ── Tableau : capacité de mana ACTIVÉE (index 0) ─────────────────────────
//   pool : mana disponible avant ; gain : variation attendue du pool ; sacrifice : la carte quitte le jeu ; life : variation de vie
const TABLE = [
  { name: 'Princess Lucrezia',      pool: {},        gain: { U: 1 } },
  { name: 'Riven Turnbull',         pool: {},        gain: { B: 1 } },
  { name: 'Sisters of the Flame',   pool: {},        gain: { R: 1 } },
  { name: 'Sunastian Falconer',     pool: {},        gain: { C: 2 } },
  { name: 'Apprentice Wizard',      pool: { U: 1 },  gain: { U: -1, C: 3 }, needs: { U: 1 } },
  { name: 'Fire Sprites',           pool: { G: 1 },  gain: { G: -1, R: 1 }, needs: { G: 1 }, keeps: 'flying' },
  { name: 'Elves of Deep Shadow',   pool: {},        gain: { B: 1 }, life: -1 },
  { name: 'Basal Thrull',           pool: {},        gain: { B: 2 }, sacrifice: true },
  { name: 'Dwarven Ruins',          pool: {},        gain: { R: 2 }, sacrifice: true, land: true },
  { name: 'Ebon Stronghold',        pool: {},        gain: { B: 2 }, sacrifice: true, land: true },
  { name: 'Svyelunite Temple',      pool: {},        gain: { U: 2 }, sacrifice: true, land: true },
  { name: 'Havenwood Battleground', pool: {},        gain: { G: 2 }, sacrifice: true, land: true },
  { name: 'Ruins of Trokair',       pool: {},        gain: { W: 2 }, land: true, sacrifice: true, onlyActivated: true }, // Oracle : {T}, sacrifice : {W}{W} (et {T} : {W} par la capacité de mana du terrain)
];
for (const n of TABLE.map((t) => t.name)) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

for (const row of TABLE) {
  const g = newGame(); const p = put(g, row.name);
  g.state.player.mana = { ...EMPTY(), ...row.pool }; const life0 = g.state.player.life;
  act(g, p);
  const got = g.state.player.mana;
  for (const c of Object.keys(EMPTY())) assert.equal(got[c], (row.pool[c] || 0) + (row.gain[c] || 0), `${row.name} : mana ${c}`);
  assert.equal(g.state.player.life, life0 + (row.life || 0), `${row.name} : vie`);
  if (row.sacrifice) { assert.ok(!inPlay(g, p), `${row.name} : sacrifiée`); assert.ok(g.state.player.graveyard.some((x) => x.name === row.name), `${row.name} : au cimetière`); }
  else assert.ok(live(g, p).tapped, `${row.name} : engagée`);
  if (row.keeps) assert.ok(by(row.name).keywords.includes(row.keeps), `${row.name} : garde ${row.keeps}`);
  // coût de mana exigé
  if (row.needs) { const h = newGame(); const q = put(h, row.name); assert.throws(() => act(h, q), /illégale|Mana|insuffisant/i, `${row.name} : refusée sans le mana du coût`); }
  // déjà engagée / sacrifiée : pas deux fois
  if (!row.sacrifice) { g.state.player.mana = { ...EMPTY(), ...row.pool }; g.state.priorityHolder = 'player'; assert.throws(() => act(g, p), /illégale/i, `${row.name} : pas deux fois`); }
  // mal d'invocation d'une créature
  if (/Creature/.test(by(row.name).type)) { const h = newGame(); const q = put(h, row.name, { summoningSickness: true }); h.state.player.mana = { ...EMPTY(), ...row.pool }; assert.throws(() => act(h, q), /illégale/i, `${row.name} : mal d'invocation`); }
}

// ── Mana « de base » des créatures à `tapAbility` (même chemin que Llanowar Elves) via tapMana ──
for (const [name, color] of [['Princess Lucrezia', 'U'], ['Riven Turnbull', 'B'], ['Sisters of the Flame', 'R']]) {
  const g = newGame(); const p = put(g, name);
  g.action('tapMana', { permanent: live(g, p), controller: 'player', color }); assert.equal(g.state.player.mana[color], 1, `${name} : tapMana`);
}

// ── Primitive « arrive engagé » ─────────────────────────────────────────
for (const name of ['Dwarven Ruins', 'Ebon Stronghold', 'Svyelunite Temple', 'Havenwood Battleground', 'Ruins of Trokair']) {
  const g = newGame(); const p = playLand(g, name);
  assert.equal(p.tapped, true, `${name} : arrive engagé`);
  assert.throws(() => act(g, p), /illégale/i, `${name} : inutilisable le tour où il arrive`);
  live(g, p).tapped = false; g.state.priorityHolder = 'player';   // « étape de dégagement » suivante (live : une action refusée restaure l'état, `p` serait périmé)
  act(g, p); assert.ok(Object.values(g.state.player.mana).some((v) => v >= 1), `${name} : utilisable une fois dégagé`);
}
{ // l'autre chemin d'entrée : une carte DÉJÀ dans une zone suivie (main, cimetière...) mise sur le champ de bataille par le gestionnaire de zones
  for (const zone of ['hand', 'graveyard']) {
    const g = newGame(); const card = { ...by('Ebon Stronghold'), uid: `ES#${++seq}`, objectId: `ES#${seq}`, owner: 'player', controller: 'player', zone };
    g.state.player[zone].push(card);
    const entered = g.zones.enterBattlefield(card, 'player', { controller: 'player', reason: 'test' });
    assert.equal(entered.tapped, true, `Ebon Stronghold venant de ${zone} : arrive engagé`);
    const f = newGame(); const forest = { ...by('Forest'), uid: `FO#${++seq}`, objectId: `FO#${seq}`, owner: 'player', controller: 'player', zone };
    f.state.player[zone].push(forest); assert.ok(!f.zones.enterBattlefield(forest, 'player', { controller: 'player', reason: 'test' }).tapped, `Forêt venant de ${zone} : dégagée`);
  }
}
{ // témoin : un terrain ordinaire arrive dégagé
  const g = newGame(); const p = playLand(g, 'Forest'); assert.equal(p.tapped, false, 'Forêt : arrive dégagée');
}
{ // le mana de base des terrains-sacrifice (produces) : 1 mana via tapMana, et le terrain reste
  const g = newGame(); const p = put(g, 'Dwarven Ruins');
  g.action('tapMana', { permanent: live(g, p), controller: 'player', color: 'R' });
  assert.equal(g.state.player.mana.R, 1, 'Dwarven Ruins : {T} -> {R}'); assert.ok(inPlay(g, p), 'Dwarven Ruins : reste en jeu');
}
{ // Elves of Deep Shadow : la blessure passe par le pipeline canonique (Ali la plafonne à 1 PV)
  const g = newGame(); put(g, 'Ali from Cairo'); const e = put(g, 'Elves of Deep Shadow'); g.state.player.life = 1;
  act(g, e); assert.equal(g.state.player.life, 1, 'Elves + Ali : la vie reste à 1'); assert.equal(g.state.player.mana.B, 1);
}
{ // Le sacrifice vise la carte SOURCE, même si d'autres permanents sont arrivés avant elle (défaut du moteur : `sacrifice: true` sacrifiait
  // le premier permanent du champ de bataille ; ce test, avec la carte seule en jeu, ne pouvait pas le voir).
  for (const name of ['Basal Thrull', 'Dwarven Ruins', 'Ebon Stronghold', 'Svyelunite Temple', 'Havenwood Battleground']) {
    const g = newGame(); const first = put(g, 'Forest'); const second = put(g, 'Mountain'); const src = put(g, name); const bear = put(g, 'Sunastian Falconer');
    act(g, src);
    assert.ok(!inPlay(g, src), `${name} : la carte source est sacrifiée`);
    assert.ok(inPlay(g, first) && inPlay(g, second) && inPlay(g, bear), `${name} : les permanents posés avant ne sont pas sacrifiés`);
  }
}
console.log('test-v12-108 OK');
