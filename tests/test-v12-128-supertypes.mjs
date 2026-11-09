// V12.76 (G17) — supertypes issus de la relecture Scryfall : Legendary (30 puis 61 en G32), World (7 puis 12 en G32), indicateur de couleur rouge (Kobolds) ;
// règle de la légende et règle des Mondes en vraie partie ; Karakas certifiée avec de VRAIES créatures légendaires.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
const LEGENDARY = ['Barktooth Warbeard', 'Hammerheim', 'Hunding Gjornersen', 'Jacques le Vert', 'Jasmine Boreal', 'Jedit Ojanen', 'Jerrard of the Closed Fist', 'Kasimir the Lone Wolf', 'Lady Caleria', 'Lady Orca', 'Marhault Elsdragon', 'Ramirez DePietro', 'Ramses Overdark', 'Riven Turnbull', 'Sir Shandlar of Eberyn', 'Sivitri Scarzam', 'Sunastian Falconer', 'The Lady of the Mountain', 'Tobias Andrion', 'Tolaria', 'Tor Wauki', 'Torsten Von Ursus', 'Tuknir Deathlock', 'Urborg', 'Dakkon Blackblade', 'Gabriel Angelfire', 'Gosta Dirk', 'Gwendlyn Di Corci', 'Halfdane', 'Hazezon Tamar'];
// V12.76 (G32) : relecture COMPLÈTE contre l'export Scryfall (liste Perplexity de G17 : 31 Légendaires et 6 Mondes manquaient, et Invoke Prejudice n'est PAS un Monde).
const WORLD = ['Caverns of Despair', 'Concordant Crossroads', 'Gravity Sphere', 'Living Plane', 'Field of Dreams', 'In the Eye of Chaos', ...["Nether Void", "The Abyss", "Land's Edge", "Storm World", "Arboria", "Revelation"]];
const LEGENDARY_G32 = ["Adun Oakenshield", "Angus Mackenzie", "Arcades Sabboth", "Axelrod Gunnarson", "Ayesha Tanaka", "Bartel Runeaxe", "Boris Devilboon", "Chromium", "Johan", "Kei Takahashi", "Lady Evangela", "Livonya Silone", "Lord Magnus", "Nebuchadnezzar", "Nicol Bolas", "Palladia-Mors", "Pavel Maliki", "Princess Lucrezia", "Ragnar", "Rasputin Dreamweaver", "Rohgahh of Kher Keep", "Rubinia Soulsinger", "Sol'kanar the Swamp King", "Stangg", "Tetsuo Umezawa", "Ur-Drago", "Vaevictis Asmadi", "Xira Arien", "Karakas", "Pendelhaven", "The Tabernacle at Pendrell Vale"];
for (const n of LEGENDARY_G32) assert.match(by(n).type, /^Legendary (Creature|Land)$/, `${n} : type « ${by(n).type} » (G32)`);
assert.equal(by('Invoke Prejudice').type, 'Enchantment', 'Invoke Prejudice n\'est pas un Monde (Oracle)');
assert.equal(by('Kobolds of Kher Keep').color[0], 'R', 'Kobolds of Kher Keep : rouge (Oracle)');
for (const n of LEGENDARY) assert.match(by(n).type, /^Legendary (Creature|Land)$/, `${n} : type « ${by(n).type} »`);
for (const n of WORLD) assert.equal(by(n).type, 'World Enchantment', `${n} : type`);
for (const n of ['Crimson Kobolds', 'Crookshank Kobolds']) assert.deepEqual(by(n).color, ['R'], `${n} : indicateur de couleur rouge`);
assert.equal(by('Caverns of Despair').static[0].type, 'attackLimit', 'le champ statique de Caverns n\'a pas été touché par la donnée de type');
assert.equal(by('Karakas').effectStatus, 'implemented', 'Karakas certifiée : la base porte des créatures légendaires');
console.log(`OK V12.76.128 : ${LEGENDARY.length} légendaires, ${WORLD.length} Mondes, 2 Kobolds rouges (données).`);

let seq = 0; const FULL = { C: 20, W: 20, U: 20, B: 20, R: 20, G: 20 };
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; g.state.turnNumber = 5; g.turnManager.turnNumber = 5;
  return g;
}
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
function cast(g, name, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.dispatch('CAST_SPELL', { card, xValue: 0 }, side); settle(g);
}
const onBf = (g, name) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).filter((p) => p.name === name).length;
const inGy = (g, name, side) => g.state[side].graveyard.filter((p) => p.name === name).length;

// ── Règle de la légende (déjà en place) : deux Jedit Ojanen chez le même joueur -> une seule reste ─────────
{
  const g = newGame(); cast(g, 'Jedit Ojanen'); assert.equal(onBf(g, 'Jedit Ojanen'), 1);
  cast(g, 'Jedit Ojanen'); assert.equal(onBf(g, 'Jedit Ojanen'), 1, 'règle de la légende : un seul exemplaire reste'); assert.equal(inGy(g, 'Jedit Ojanen', 'player'), 1);
  const g2 = newGame(); cast(g2, 'Grizzly Bears'); cast(g2, 'Grizzly Bears'); assert.equal(onBf(g2, 'Grizzly Bears'), 2, 'contrôle : une créature non légendaire n\'est pas touchée');
  console.log('OK V12.76.128 : règle de la légende en vraie partie (vraie carte Jedit Ojanen).');
}
// ── Règle des Mondes : le PLUS RÉCENT reste, quel que soit le joueur ───────────────────────────────────
{
  const g = newGame(); cast(g, 'Caverns of Despair'); assert.equal(onBf(g, 'Caverns of Despair'), 1);
  cast(g, 'Gravity Sphere'); assert.equal(onBf(g, 'Caverns of Despair'), 0, 'le Monde plus ancien part'); assert.equal(onBf(g, 'Gravity Sphere'), 1, 'le plus récent reste'); assert.equal(inGy(g, 'Caverns of Despair', 'player'), 1);
  cast(g, 'Caverns of Despair', 'ai'); assert.equal(onBf(g, 'Gravity Sphere'), 0, 'valable aussi entre joueurs : le Monde de l\'adversaire, plus récent, reste'); assert.equal(onBf(g, 'Caverns of Despair'), 1);
  const g2 = newGame(); cast(g2, 'Gravity Sphere'); cast(g2, 'Grizzly Bears'); assert.equal(onBf(g2, 'Gravity Sphere'), 1, 'un seul Monde : rien ne part');
  cast(g2, 'Living Plane'); cast(g2, 'Concordant Crossroads'); assert.equal(onBf(g2, 'Concordant Crossroads'), 1); assert.equal(onBf(g2, 'Living Plane') + onBf(g2, 'Gravity Sphere'), 0, 'trois Mondes de suite : seul le dernier reste');
  console.log('OK V12.76.128 : règle des Mondes en vraie partie (plus récent, entre joueurs, un seul Monde intact).');
}
// ── Indicateur de couleur : les Kobolds (coût 0) sont rouges ───────────────────────────────────────────
{
  const g = newGame(); cast(g, 'Crimson Kobolds'); const k = g.state.player.battlefield.find((p) => p.name === 'Crimson Kobolds');
  assert.ok(k, 'Crimson Kobolds en jeu'); assert.deepEqual(calculateCharacteristics(g.state, k).color, ['R'], 'créature rouge');
  console.log('OK V12.76.128 : Kobolds rouges lus par les couches.');
}
// ── Karakas avec de VRAIES créatures légendaires (plus de carte synthétique) ───────────────────────────
{
  const g = newGame(); cast(g, 'Jedit Ojanen', 'ai'); cast(g, 'Grizzly Bears', 'ai'); g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player';
  const k = { ...structuredClone(by('Karakas')), uid: 'Karakas#1', objectId: 'Karakas#1', owner: 'player', controller: 'player', zone: 'battlefield', tapped: false, enteredTurn: 1, summoningSickness: false };
  g.state.player.battlefield.push(k);
  const jedit = g.state.ai.battlefield.find((p) => p.name === 'Jedit Ojanen'), bears = g.state.ai.battlefield.find((p) => p.name === 'Grizzly Bears');
  const act = (t) => { g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: k, controller: 'player', abilityIndex: 0, target: { kind: 'permanent', uid: t.uid } }); };
  assert.throws(() => act(bears), /illégale/i, 'une créature non légendaire est refusée');
  k.tapped = false; act(jedit); settle(g);
  assert.equal(onBf(g, 'Jedit Ojanen'), 0, 'Jedit Ojanen quitte le champ de bataille'); assert.equal(g.state.ai.hand.filter((p) => p.name === 'Jedit Ojanen').length, 1, 'dans la main de son propriétaire');
  console.log('OK V12.76.128 : Karakas renvoie une VRAIE légende, refuse une créature ordinaire.');
}
