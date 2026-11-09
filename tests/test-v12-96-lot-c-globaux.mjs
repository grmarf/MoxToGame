// V12.75 — Chantier 2, lot C : seigneurs, enchantements globaux, négation du passage, sorts de masse.
// 16 cartes jouées en partie réelle (GameFacade : CAST_SPELL, pile, combat, caractéristiques calculées).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
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
  return g;
}
function put(g, side, name, { sick = false } = {}) {
  const p = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: sick, tapped: false };
  g.state[side].battlefield.push(p);
  return p;
}
const ch = (g, p) => calculateCharacteristics(g.state, p);
const pt = (g, p) => { const c = ch(g, p); return [c.power, c.toughness]; };
const alive = (g, p) => [...g.state.player.battlefield, ...g.state.ai.battlefield].some((x) => x.uid === p.uid);
function cast(g, name, side = 'player') {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL };
  g.state.priorityHolder = side;
  g.dispatch('CAST_SPELL', { card, xValue: 0 }, side);
  for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  return card;
}
const attackWith = (g, atts, side = 'player') => { g.state.activePlayer = side; g.combat.begin(); g.combat.confirmAttackers(atts, side); };
const blockersOf = (g, att, side = 'ai') => g.combat.getValidBlockers(side, att).map((p) => p.uid);

// ── 1. Données ───────────────────────────────────────────────────────────
const LOT = ['Lord of Atlantis', 'Jacques le Vert', 'Concordant Crossroads', 'Gravity Sphere', 'Great Wall', 'Undertow', 'Quagmire', 'Crevasse', 'Deadfall',
  'Army of Allah', 'Morale', 'Piety', 'Shield Wall', 'Hell Swarm', 'Marsh Gas', 'Holy Light'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 2. Lord of Atlantis : tous les ondins, tous contrôleurs, lui compris ──
{
  const g = newGame();
  const lord = put(g, 'player', 'Lord of Atlantis'); const mine = put(g, 'player', 'Merfolk of the Pearl Trident');
  const theirs = put(g, 'ai', 'Merfolk of the Pearl Trident'); const other = put(g, 'player', 'Hill Giant');
  assert.deepEqual(pt(g, lord), [2, 2], 'le seigneur ne se bonifie PAS lui-même (Oracle : « Other Merfolk »)'); assert.ok(!ch(g, lord).keywords.includes('islandwalk'), 'ni la traversée des îles');
  assert.deepEqual(pt(g, mine), [2, 2], 'ondin allié +1/+1');
  assert.deepEqual(pt(g, theirs), [2, 2], 'ondin adverse +1/+1 aussi');
  assert.deepEqual(pt(g, other), [3, 3], 'non-ondin inchangé');
  assert.ok(ch(g, mine).keywords.includes('islandwalk') && ch(g, theirs).keywords.includes('islandwalk'), 'traversée des îles pour les ondins');
  assert.ok(!ch(g, other).keywords.includes('islandwalk'), 'pas de traversée pour les non-ondins');
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.uid !== lord.uid);
  assert.deepEqual(pt(g, mine), [1, 1], 'le seigneur parti, le bonus disparaît');
}

// ── 3. Jacques le Vert : vos créatures vertes +0/+2 (lui compris), pas celles de l'adversaire ──
{
  const g = newGame();
  const jacques = put(g, 'player', 'Jacques le Vert'); const elves = put(g, 'player', 'Llanowar Elves');
  const enemyElves = put(g, 'ai', 'Llanowar Elves'); const giant = put(g, 'player', 'Hill Giant');
  assert.deepEqual(pt(g, jacques), [3, 4], 'Jacques est vert : 3/2 -> 3/4');
  assert.deepEqual(pt(g, elves), [1, 3], 'elfe allié 1/1 -> 1/3');
  assert.deepEqual(pt(g, enemyElves), [1, 1], 'elfe adverse inchangé (« que vous contrôlez »)');
  assert.deepEqual(pt(g, giant), [3, 3], 'créature rouge inchangée');
}

// ── 4. Concordant Crossroads : célérité pour toutes les créatures ────────
{
  const g = newGame();
  const fresh = put(g, 'player', 'Hill Giant', { sick: true });
  g.state.activePlayer = 'player'; g.combat.begin();
  assert.ok(!g.combat.getValidAttackers('player').some((p) => p.uid === fresh.uid), 'témoin : sans le Carrefour, le mal d\'invocation interdit d\'attaquer');
  put(g, 'player', 'Concordant Crossroads');
  assert.ok(ch(g, fresh).keywords.includes('haste'), 'célérité accordée');
  assert.ok(g.combat.getValidAttackers('player').some((p) => p.uid === fresh.uid), 'avec le Carrefour, la créature fraîchement arrivée peut attaquer');
}

// ── 5. Gravity Sphere : toutes les créatures perdent le vol ──────────────
{
  const g = newGame();
  const angel = put(g, 'player', 'Serra Angel'); const giant = put(g, 'ai', 'Hill Giant');
  attackWith(g, [angel]);
  assert.deepEqual(blockersOf(g, angel), [], 'témoin : un volant n\'est pas bloquable au sol');
  put(g, 'ai', 'Gravity Sphere');
  assert.ok(!ch(g, angel).keywords.includes('flying'), 'le Sphère de gravité retire le vol');
  assert.deepEqual(blockersOf(g, angel), [giant.uid], 'sans le vol, la créature au sol peut bloquer');
}

// ── 6. Négation du passage : cinq enchantements, un par terrain ──────────
const WALKS = [['Great Wall', 'Righteous Avengers', 'Plains', 'plainswalk'], ['Undertow', 'Segovian Leviathan', 'Island', 'islandwalk'],
  ['Quagmire', 'Bog Wraith', 'Swamp', 'swampwalk'], ['Crevasse', 'Mountain Yeti', 'Mountain', 'mountainwalk'], ['Deadfall', 'Cat Warriors', 'Forest', 'forestwalk']];
for (const [ench, walker, land, kw] of WALKS) {
  for (const enchantOwner of ['player', 'ai']) {
    const g = newGame();
    const w = put(g, 'player', walker); const blocker = put(g, 'ai', 'Hill Giant'); put(g, 'ai', land);
    assert.ok(ch(g, w).keywords.includes(kw), `${walker} a ${kw}`);
    attackWith(g, [w]);
    assert.deepEqual(blockersOf(g, w), [], `témoin ${walker} : imblocable face à ${land} sans ${ench}`);
    put(g, enchantOwner, ench);
    assert.deepEqual(blockersOf(g, w), [blocker.uid], `${ench} (contrôlé par ${enchantOwner}) : ${walker} devient bloquable`);
    // Un passage d'une autre famille n'est pas touché.
    const otherKw = WALKS.find(([e]) => e !== ench);
    const other = put(g, 'player', otherKw[1]); put(g, 'ai', otherKw[2]);
    g.combat.begin(); g.combat.confirmAttackers([other], 'player');
    assert.ok(!blockersOf(g, other).includes(blocker.uid), `${ench} ne négocie pas ${otherKw[3]} (${otherKw[1]} reste imblocable)`);
  }
}

// ── 7. Sorts de masse jusqu'à la fin du tour ─────────────────────────────
const endTurn = (g) => { g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.(); };
function combatBoard() {
  const g = newGame();
  const att = put(g, 'player', 'Hill Giant'); const idle = put(g, 'player', 'Scathe Zombies');
  const blk = put(g, 'ai', 'Llanowar Elves'); const bystander = put(g, 'ai', 'Merfolk of the Pearl Trident');
  attackWith(g, [att]);
  g.combat.assignBlockers({ [att.uid]: [blk.uid] });
  return { g, att, idle, blk, bystander };
}
{
  const { g, att, idle, blk, bystander } = combatBoard();
  cast(g, 'Army of Allah');
  assert.deepEqual(pt(g, att), [5, 3], 'Army of Allah : attaquant +2/+0 (Oracle : « Attacking creatures get +2/+0 »)');
  assert.deepEqual(pt(g, bystander), [1, 1], 'ondin adverse non touché');
  assert.deepEqual(pt(g, idle), [2, 2]); assert.deepEqual(pt(g, blk), [1, 1]);
  endTurn(g);
  assert.deepEqual(pt(g, att), [3, 3], 'le bonus cesse en fin de tour');
}
{
  const { g, att, idle } = combatBoard();
  cast(g, 'Morale');
  assert.deepEqual(pt(g, att), [4, 4], 'Morale : attaquant +1/+1'); assert.deepEqual(pt(g, idle), [2, 2], 'créature qui n\'attaque pas : inchangée');
}
{
  const { g, att, blk, bystander } = combatBoard();
  cast(g, 'Piety', 'ai');
  assert.deepEqual(pt(g, blk), [1, 4], 'Piety : bloqueur +0/+3'); assert.deepEqual(pt(g, bystander), [1, 1], 'créature non bloqueuse : inchangée');
  assert.deepEqual(pt(g, att), [3, 3], 'l\'attaquant n\'est pas touché');
}
{
  const { g, att, idle, blk } = combatBoard();
  cast(g, 'Shield Wall');
  assert.deepEqual(pt(g, att), [3, 5], 'Shield Wall : vos créatures +0/+2'); assert.deepEqual(pt(g, idle), [2, 4], 'toutes les vôtres');
  assert.deepEqual(pt(g, blk), [1, 1], 'celles de l\'adversaire : inchangées');
}
{
  const { g, att, idle, blk } = combatBoard();
  cast(g, 'Hell Swarm');
  assert.deepEqual(pt(g, att), [2, 3], 'Hell Swarm : -1/-0 sur toutes');
  assert.deepEqual(pt(g, idle), [1, 2]); assert.deepEqual(pt(g, blk), [0, 1]);
}
{
  const { g, att, blk } = combatBoard();
  cast(g, 'Marsh Gas');
  assert.deepEqual(pt(g, att), [1, 3], 'Marsh Gas : -2/-0 sur toutes'); assert.deepEqual(pt(g, blk), [-1, 1], 'la force peut passer sous 0');
}
{
  const { g, att, idle, blk } = combatBoard();
  const lightning = put(g, 'ai', 'Bog Rats'); // 1/1 noire
  const white = put(g, 'player', 'Savannah Lions'); // 2/1 blanche
  cast(g, 'Holy Light');
  assert.ok(!alive(g, lightning), 'Holy Light : une créature noire 1/1 meurt');
  assert.deepEqual(pt(g, idle), [1, 1], 'Scathe Zombies (noire) 2/2 -> 1/1');
  assert.deepEqual(pt(g, att), [2, 2], 'Oracle : « Nonwhite creatures get -1/-1 » — la créature rouge 3/3 devient 2/2 (avant : « noires » à tort)');
  assert.ok(!alive(g, blk), 'la créature verte 1/1 (non blanche) meurt aussi');
  assert.ok(alive(g, white) && pt(g, white)[0] === 2 && pt(g, white)[1] === 1, 'la créature BLANCHE n\'est pas touchée');
}
{
  // Un sort de masse ne touche pas une créature arrivée APRÈS sa résolution.
  const { g } = combatBoard();
  cast(g, 'Shield Wall');
  const late = put(g, 'player', 'Hill Giant');
  assert.deepEqual(pt(g, late), [3, 3], 'créature arrivée après la résolution : non touchée');
}

// ── 8. Régression du banc (graine 347) : `static` objet ou liste, combat contre un attaquant de force <= 1 ──
// #hasStaticUnblockableIfLowPower supposait `static` toujours en liste ; un enchantement à `static` objet
// (Great Wall, Gravity Sphere...) faisait lever « s.static?.some is not a function » dès qu'une créature de
// force <= 1 attaquait, soit 11 échecs d'action IA dans le banc.
{
  const g = newGame();
  const elf = put(g, 'player', 'Llanowar Elves'); const blocker = put(g, 'ai', 'Hill Giant');
  put(g, 'ai', 'Great Wall'); put(g, 'player', 'Gravity Sphere');
  attackWith(g, [elf]);
  assert.deepEqual(blockersOf(g, elf), [blocker.uid], 'attaquant 1/1 : le calcul des blocages ne doit pas lever d\'exception avec des static objet');
}

console.log(`OK V12.75 lot C : ${LOT.length} cartes certifiées en partie réelle (seigneurs, enchantements globaux, négation du passage x5, sorts de masse x7).`);
