// V12.75 — Chantier 2, lot B : Auras simples (protection, vigilance, passage, +2/-2).
//
// Tout est joué en partie réelle (GameFacade, CAST_SPELL, pile, actions d'état) avec les vraies
// cartes de la base. Le test couvre aussi deux défauts moteur découverts en préparant ce lot :
//  (a) `addKeyword protection + color` produisait un mot-clé « protection » sans couleur : White Ward
//      (déjà certifiée) ne protégeait de rien ;
//  (b) la règle « Aura attachée à un objet illégal » ne reconnaissait aucune Aura de la base (type
//      Enchantment, sous-type Aura) : une Aura dont la créature mourait restait en jeu pour toujours.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { CombatService } from '../src/core/combat.js';
import { calculateCharacteristics, hasProtectionFromColors } from '../src/core/continuous-effects.js';
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
function put(g, side, name) {
  const p = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false };
  g.state[side].battlefield.push(p);
  return p;
}
function enchant(g, auraName, host) {
  const aura = { ...by(auraName), uid: `${auraName}#${++seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(aura); g.state.player.mana = { ...FULL };
  g.state.priorityHolder = 'player';
  g.dispatch('CAST_SPELL', { card: aura, target: { kind: 'permanent', uid: host.uid, side: host.controller }, xValue: 0 }, 'player');
  for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  return aura;
}
const chars = (g, p) => calculateCharacteristics(g.state, p);
const onField = (g, uid) => [...g.state.player.battlefield, ...g.state.ai.battlefield].some((p) => p.uid === uid);
const inGrave = (g, side, name) => g.state[side].graveyard.some((c) => c.name === name);
function combatFor(g) {
  const combat = new CombatService({ state: () => g.state, sba: g.stateBasedActions });
  combat.begin();
  return combat;
}

// ── 1. Données ───────────────────────────────────────────────────────────
const LOT = ['Black Ward', 'Blue Ward', 'Green Ward', 'Red Ward', 'Eternal Warrior', 'Burrowing', 'Immolation'];
for (const n of LOT) {
  const c = by(n);
  assert.equal(c.effectStatus, 'implemented', `${n} : statut`);
  assert.ok(c.effect && c.effect.type, `${n} : effet de données`);
  assert.equal(c.subtype, 'Aura', `${n} : sous-type Aura`);
}

// ── 2. Protection par Aura (White Ward inclus : défaut (a)) ──────────────
const WARDS = [['White Ward', 'W', 'Savannah Lions'], ['Black Ward', 'B', 'Scathe Zombies'], ['Blue Ward', 'U', 'Azure Drake'], ['Green Ward', 'G', 'Grizzly Bears'], ['Red Ward', 'R', 'Gray Ogre']];
const COLORS = ['W', 'U', 'B', 'R', 'G'];
for (const [ward, letter, sameColorCreature] of WARDS) {
  const g = newGame();
  const host = put(g, 'player', 'Hill Giant');
  enchant(g, ward, host);
  assert.ok(chars(g, host).keywords.includes('protection' + letter), `${ward} : protection${letter} attendue, obtenu ${chars(g, host).keywords}`);
  for (const c of COLORS) {
    assert.equal(hasProtectionFromColors(g.state, host, [c]), c === letter, `${ward} : protection contre ${c} doit valoir ${c === letter}`);
  }
  // Combat : l'attaquant enchanté ne peut pas être bloqué par une créature de la couleur concernée.
  g.state.activePlayer = 'player';
  const blocker = put(g, 'ai', sameColorCreature);
  const witness = put(g, 'ai', letter === 'R' ? 'Grizzly Bears' : 'Gray Ogre');
  assert.ok(chars(g, blocker).color.includes(letter), `${sameColorCreature} doit être de couleur ${letter}`);
  const combat = combatFor(g);
  combat.confirmAttackers([host], 'player');
  const names = combat.getValidBlockers('ai', host).map((p) => p.uid);
  assert.ok(!names.includes(blocker.uid), `${ward} : une créature ${letter} ne peut pas bloquer la créature protégée`);
  assert.ok(names.includes(witness.uid), `${ward} : témoin d'une autre couleur peut bloquer`);
}

// ── 3. Eternal Warrior : vigilance ───────────────────────────────────────
{
  const g = newGame();
  const host = put(g, 'player', 'Hill Giant'); const plain = put(g, 'player', 'Gray Ogre');
  enchant(g, 'Eternal Warrior', host);
  assert.ok(chars(g, host).keywords.includes('vigilance'), 'Eternal Warrior : vigilance');
  g.state.activePlayer = 'player';
  const combat = combatFor(g);
  combat.confirmAttackers([host, plain], 'player');
  assert.equal(host.tapped, false, 'la créature enchantée (vigilance) ne s\'engage pas en attaquant');
  assert.equal(plain.tapped, true, 'témoin : une créature sans vigilance s\'engage');
}

// ── 4. Burrowing : montagne-marche ───────────────────────────────────────
{
  const g = newGame();
  const host = put(g, 'player', 'Hill Giant');
  enchant(g, 'Burrowing', host);
  assert.ok(chars(g, host).keywords.includes('mountainwalk'), 'Burrowing : mountainwalk');
  g.state.activePlayer = 'player';
  const defender = put(g, 'ai', 'Gray Ogre'); const mountain = put(g, 'ai', 'Mountain');
  let combat = combatFor(g); combat.confirmAttackers([host], 'player');
  assert.deepEqual(combat.getValidBlockers('ai', host).map((p) => p.uid), [], 'imblocable face à une Montagne');
  g.state.ai.battlefield = g.state.ai.battlefield.filter((p) => p.uid !== mountain.uid);
  put(g, 'ai', 'Forest');
  host.tapped = false;
  combat = combatFor(g); combat.confirmAttackers([host], 'player');
  assert.deepEqual(combat.getValidBlockers('ai', host).map((p) => p.uid), [defender.uid], 'bloquable sans Montagne');
}

// ── 5. Immolation : +2/-2 et Aura orphelins (défaut (b)) ─────────────────
{
  const g = newGame();
  const giant = put(g, 'player', 'Hill Giant'); // 3/3
  const aura = enchant(g, 'Immolation', giant);
  assert.deepEqual([chars(g, giant).power, chars(g, giant).toughness], [5, 1], 'Hill Giant 3/3 + Immolation = 5/1');
  g.turnManager.gotoPhase('endStep'); g.turnManager.runPhase?.();
  assert.deepEqual([chars(g, giant).power, chars(g, giant).toughness], [5, 1], 'le bonus d\'une Aura ne disparaît pas en fin de tour');
  assert.ok(onField(g, aura.uid) && onField(g, giant.uid), 'les deux restent en jeu');
}
{
  const g = newGame();
  const bear = put(g, 'player', 'Grizzly Bears'); // 2/2 -> 4/0
  const aura = enchant(g, 'Immolation', bear);
  assert.ok(!onField(g, bear.uid), 'Grizzly Bears (2/2) + Immolation meurt : endurance 0');
  assert.ok(inGrave(g, 'player', 'Grizzly Bears'), 'Grizzly Bears au cimetière');
  assert.ok(!onField(g, aura.uid), 'l\'Aura orpheline ne reste pas en jeu');
  assert.ok(inGrave(g, 'player', 'Immolation'), 'Immolation au cimetière');
}
{
  // Défaut (b) sur une Aura déjà certifiée : Holy Strength sur une créature tuée par un Lightning Bolt.
  const g = newGame();
  const lions = put(g, 'player', 'Savannah Lions'); // 2/1
  const hs = enchant(g, 'Holy Strength', lions);      // 3/3
  const bolt = { ...by('Lightning Bolt'), uid: `bolt#${++seq}`, owner: 'ai', controller: 'ai' };
  g.state.ai.hand.push(bolt); g.state.ai.mana = { ...FULL }; g.state.activePlayer = 'ai'; g.state.priorityHolder = 'ai'; g.turnManager.activePlayer = 'ai';
  g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'permanent', uid: lions.uid, side: 'player' }, xValue: 0 }, 'ai');
  for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  assert.ok(!onField(g, lions.uid), 'Savannah Lions 3/3 meurt sous 3 blessures');
  assert.ok(!onField(g, hs.uid), 'Holy Strength, orpheline, quitte le champ de bataille');
  assert.ok(inGrave(g, 'player', 'Holy Strength'), 'Holy Strength au cimetière de son propriétaire');
}

console.log(`OK V12.75 lot B : ${LOT.length} Auras certifiées en partie réelle (protections W/U/B/R/G, vigilance, passage, +2/-2) ; Auras orphelines défaussées ; White Ward protège réellement.`);
