// V12.76 — Chantier 2, lot G2 : restrictions de combat (9 cartes).
// Ironclaw Orcs, Two-Headed Giant of Foriys, Lure, Moat, Caverns of Despair, Elven Riders, Giant Turtle,
// Tangle Kelp, Merseine. Tout est joué en partie réelle (GameFacade, CAST_SPELL, pile) avec les vraies cartes
// de la base ; le combat passe par CombatService, comme dans test-v12-95.
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
  g.state.turnNumber = 5;
  return g;
}
function put(g, side, name) {
  const p = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false };
  g.state[side].battlefield.push(p);
  return p;
}
function settle(g) { for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); }
function cast(g, name, host = null) {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(card); g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player';
  const payload = { card, xValue: 0 };
  if (host) payload.target = { kind: 'permanent', uid: host.uid, side: host.controller };
  g.dispatch('CAST_SPELL', payload, 'player');
  settle(g);
  return g.state.player.battlefield.find((p) => p.uid === card.uid) || null;
}
const chars = (g, p) => calculateCharacteristics(g.state, p);
const combatFor = (g) => { const c = new CombatService({ state: () => g.state, sba: g.stateBasedActions }); c.begin(); return c; };
const uids = (l) => l.map((p) => p.uid);
const atkIds = (g) => uids(combatFor(g).getValidAttackers('player'));

// ── 1. Données ───────────────────────────────────────────────────────────
const LOT = ['Ironclaw Orcs', 'Two-Headed Giant of Foriys', 'Lure', 'Moat', 'Caverns of Despair', 'Elven Riders', 'Giant Turtle', 'Tangle Kelp', 'Merseine'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 2. Ironclaw Orcs : ne bloque pas une créature de force 3 ou plus ────
{
  const g = newGame();
  const orcs = put(g, 'ai', 'Ironclaw Orcs');
  const big = put(g, 'player', 'Hill Giant'); const small = put(g, 'player', 'Goblin Digging Team'); // V12.76 (G32) : Oracle = « force 2 OU PLUS » ; la force 1 reste bloquable
  const combat = combatFor(g); combat.confirmAttackers([big, small], 'player');
  assert.ok(!uids(combat.getValidBlockers('ai', big)).includes(orcs.uid), 'Orcs : pas de blocage d\'une force 3');
  assert.ok(uids(combat.getValidBlockers('ai', small)).includes(orcs.uid), 'Orcs : bloque une force 1');
  assert.throws(() => combat.assignBlockers({ [big.uid]: [orcs.uid] }), /illégal/i);
  combat.assignBlockers({ [small.uid]: [orcs.uid] });
}
// la force est lue en EFFECTIF : un Goblin Digging Team pompé à 2 n'est plus bloquable par les Orcs
{
  const g = newGame();
  const orcs = put(g, 'ai', 'Ironclaw Orcs'); const ogre = put(g, 'player', 'Goblin Digging Team');
  ogre.tempBuffs = [{ power: 1, toughness: 0 }];
  const combat = combatFor(g); combat.confirmAttackers([ogre], 'player');
  assert.ok(!uids(combat.getValidBlockers('ai', ogre)).includes(orcs.uid), 'Orcs : force effective 2');
}

// ── 3. Two-Headed Giant : bloque une créature supplémentaire ────────────
{
  const g = newGame();
  const giant = put(g, 'ai', 'Two-Headed Giant of Foriys');
  const a1 = put(g, 'player', 'Gray Ogre'); const a2 = put(g, 'player', 'Grizzly Bears');
  const combat = combatFor(g); combat.confirmAttackers([a1, a2], 'player');
  combat.assignBlockers({ [a1.uid]: [giant.uid], [a2.uid]: [giant.uid] });
  combat.resolveDamage({ [giant.uid]: { [a1.uid]: 2, [a2.uid]: 2 } });
  assert.equal(a1.damageMarked, 2, 'Géant : 2 blessures au premier'); assert.equal(a2.damageMarked, 2, 'Géant : 2 blessures au second');
  assert.equal(giant.damageMarked, 4, 'Géant : subit les deux attaquants');
}
{
  const g = newGame();
  const ogre = put(g, 'ai', 'Gray Ogre');
  const a1 = put(g, 'player', 'Hill Giant'); const a2 = put(g, 'player', 'Grizzly Bears');
  const combat = combatFor(g); combat.confirmAttackers([a1, a2], 'player');
  assert.throws(() => combat.assignBlockers({ [a1.uid]: [ogre.uid], [a2.uid]: [ogre.uid] }), /qu’un seul/, 'témoin : une créature ordinaire ne double-bloque pas');
}
{
  const g = newGame();
  const giant = put(g, 'ai', 'Two-Headed Giant of Foriys');
  const a = [put(g, 'player', 'Gray Ogre'), put(g, 'player', 'Grizzly Bears'), put(g, 'player', 'Hill Giant')];
  const combat = combatFor(g); combat.confirmAttackers(a, 'player');
  assert.throws(() => combat.assignBlockers(Object.fromEntries(a.map((x) => [x.uid, [giant.uid]]))), /qu’un seul/, 'Géant : 2 blocages au maximum, pas 3');
}

// ── 4. Lure (Aura lancée pour de vrai) ──────────────────────────────────
{
  const g = newGame();
  const host = put(g, 'player', 'Hill Giant');
  const b1 = put(g, 'ai', 'Gray Ogre'); const b2 = put(g, 'ai', 'Grizzly Bears'); const tapped = put(g, 'ai', 'Savannah Lions'); tapped.tapped = true;
  const lure = cast(g, 'Lure', host);
  assert.ok(lure && lure.attachedTo === host.uid, 'Lure attachée');
  assert.ok(chars(g, host).keywords.includes('lure'), 'Lure : la créature enchantée porte la marque');
  const combat = combatFor(g); combat.confirmAttackers([host], 'player');
  assert.throws(() => combat.assignBlockers({ [host.uid]: [b1.uid] }), /toutes les créatures/, 'Lure : un seul bloqueur ne suffit pas');
  assert.throws(() => combat.assignBlockers({}), /toutes les créatures/, 'Lure : ne pas bloquer est illégal');
  combat.assignBlockers({ [host.uid]: [b1.uid, b2.uid] });
  assert.equal(combat.combat.blockers[host.uid].length, 2, 'Lure : tous les bloqueurs possibles bloquent (la créature engagée est exemptée)');
}
{ // témoin : sans Lure, aucune obligation
  const g = newGame(); const host = put(g, 'player', 'Hill Giant'); const b1 = put(g, 'ai', 'Gray Ogre'); put(g, 'ai', 'Grizzly Bears');
  const combat = combatFor(g); combat.confirmAttackers([host], 'player'); combat.assignBlockers({ [host.uid]: [b1.uid] });
}

// ── 5. Moat : sans le vol, on n'attaque pas ─────────────────────────────
{
  const g = newGame();
  const bear = put(g, 'player', 'Grizzly Bears'); const flyer = put(g, 'player', 'Air Elemental'); const oppBear = put(g, 'ai', 'Gray Ogre');
  assert.deepEqual(atkIds(g).sort(), [bear.uid, flyer.uid].sort(), 'avant Moat : tout le monde attaque');
  const moat = cast(g, 'Moat');
  assert.ok(moat, 'Moat résolu');
  assert.deepEqual(atkIds(g), [flyer.uid], 'Moat : seule la créature volante attaque');
  g.state.ai.battlefield.forEach((p) => { p.summoningSickness = false; });
  g.state.activePlayer = 'ai'; assert.deepEqual(uids(combatFor(g).getValidAttackers('ai')), [], 'Moat : vaut aussi pour l\'adversaire');
  g.state.activePlayer = 'player';
  const combat = combatFor(g); combat.confirmAttackers([bear, flyer], 'player');
  assert.deepEqual(uids(combat.combat.attackers), [flyer.uid], 'Moat : une déclaration illégale est ignorée');
  // Gravity Sphere retire le vol : plus personne n'attaque
  put(g, 'player', 'Gravity Sphere'); flyer.tapped = false;
  assert.deepEqual(atkIds(g), [], 'Moat + Gravity Sphere : le vol effectif est lu');
}

// ── 6. Caverns of Despair : 2 attaquants et 2 bloqueurs au plus ─────────
{
  const g = newGame();
  const a = [put(g, 'player', 'Gray Ogre'), put(g, 'player', 'Grizzly Bears'), put(g, 'player', 'Hill Giant')];
  const d = [put(g, 'ai', 'Scathe Zombies'), put(g, 'ai', 'Savannah Lions'), put(g, 'ai', 'Wall of Wood')];
  assert.ok(cast(g, 'Caverns of Despair'), 'Caverns résolu');
  let combat = combatFor(g);
  assert.throws(() => combat.toDeclareAttackers(a, 'player'), /Pas plus de 2 créatures ne peuvent attaquer/);
  combat = combatFor(g); combat.confirmAttackers([a[0], a[1]], 'player');
  assert.throws(() => combat.assignBlockers({ [a[0].uid]: [d[0].uid, d[1].uid], [a[1].uid]: [d[2].uid] }), /Pas plus de 2 créatures ne peuvent bloquer/);
  combat.assignBlockers({ [a[0].uid]: [d[0].uid], [a[1].uid]: [d[1].uid] });
}

// ── 7. Elven Riders : seulement volants et murs ─────────────────────────
{
  const g = newGame();
  const riders = put(g, 'player', 'Elven Riders');
  const ogre = put(g, 'ai', 'Gray Ogre'); const spider = put(g, 'ai', 'Giant Spider'); const wall = put(g, 'ai', 'Wall of Wood'); const flyer = put(g, 'ai', 'Air Elemental');
  const combat = combatFor(g); combat.confirmAttackers([riders], 'player');
  assert.deepEqual(uids(combat.getValidBlockers('ai', riders)).sort(), [wall.uid, flyer.uid].sort(), 'Riders : volant et mur seulement (ni ogre ni reach)');
  assert.throws(() => combat.assignBlockers({ [riders.uid]: [ogre.uid] }), /illégal/i);
  assert.throws(() => combat.assignBlockers({ [riders.uid]: [spider.uid] }), /illégal/i);
  combat.assignBlockers({ [riders.uid]: [wall.uid] });
}

// ── 8. Giant Turtle : pas deux tours de suite ───────────────────────────
{
  const g = newGame();
  const turtle = put(g, 'player', 'Giant Turtle');
  g.state.turnNumber = 5; assert.deepEqual(atkIds(g), [turtle.uid], 'tour 5 : peut attaquer');
  const c1 = combatFor(g); c1.confirmAttackers([turtle], 'player'); assert.equal(turtle.lastAttackedTurn, 5);
  turtle.tapped = false; g.state.turnNumber = 6; assert.deepEqual(atkIds(g), [turtle.uid], 'tour 6 (adverse) : le test ne s\'applique qu\'à SON tour précédent');
  g.state.turnNumber = 7; assert.deepEqual(atkIds(g), [], 'tour 7 : a attaqué à son dernier tour -> ne peut pas');
  g.state.turnNumber = 9; assert.deepEqual(atkIds(g), [turtle.uid], 'tour 9 : n\'a pas attaqué au tour 7 -> peut');
}

// ── 9. Tangle Kelp / Merseine : la créature enchantée n'attaque pas ─────
// V12.76 (G32) : Tangle Kelp n'interdit PAS d'attaquer (Oracle : engagée à l'arrivée, ne se dégage pas si elle a attaqué) : voir test-v12-143. Seule Merseine est vérifiée ici.
for (const aura of ['Merseine']) {
  const g = newGame();
  const host = put(g, 'player', 'Hill Giant'); const other = put(g, 'player', 'Gray Ogre');
  const a = cast(g, aura, host);
  assert.ok(a && a.attachedTo === host.uid, `${aura} attachée`);
  assert.deepEqual(atkIds(g), [other.uid], `${aura} : seule la créature enchantée est empêchée`);
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.uid !== a.uid);
  assert.deepEqual(atkIds(g).sort(), [host.uid, other.uid].sort(), `${aura} : plus d'Aura, elle attaque à nouveau`);
}
console.log('test-v12-104 OK');
