import assert from 'node:assert/strict';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
installEffects(effects, globalThis); game.connect();
const card = name => CARDS.find(c => c.name === name);
function mana(side) { game.state[side].mana = { W: 10, U: 10, B: 10, R: 10, G: 10, C: 10 }; }
function setup() {
  game.engine.loadDeck('player', CARDS.filter(c => c.isBasic)); game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));
  game.turnManager.gotoPhase('main1'); game.turnManager.activePlayer = 'player'; game.state.activePlayer = 'player'; game.state.priorityHolder = 'player';
  for (const s of ['player', 'ai']) { mana(s); game.state[s].battlefield = []; game.state[s].graveyard = []; game.state[s].hand = []; game.state[s].library = []; }
}
function resolve() { while (game.stack.size) { const p = game.state.priorityHolder; game.dispatch('PASS_PRIORITY', {}, p); if (game.stack.size) { const q = p === 'player' ? 'ai' : 'player'; game.dispatch('PASS_PRIORITY', {}, q); } } }
function putPermanent(side, p) { game.state[side].battlefield = [p]; }

// Bug découvert en corrigeant BUG-04 (Prompt P) : Creature Bond possédait TROIS
// mécanismes concurrents pour "piochez une carte" :
// 1. Le système de trigger moderne (TriggerCollector, corrigé et testé en V12.59) --
//    correct, vérifie enchantedSource.
// 2. `reg('drawOnDeath', ...)` dans l'EffectRegistry -- traité à tort comme
//    l'effet de RÉSOLUTION IMMÉDIATE du sort lui-même (resolveTop() voit
//    `item.effect.type==='drawOnDeath'` déjà enregistré et l'exécute
//    immédiatement au moment du lancer, AVANT même que l'enchantement ne soit
//    attaché) -- Creature Bond piochait une carte dès qu'on le lançait, ce qui
//    ne correspond à aucun Oracle réel de la carte.
// 3. Un gestionnaire legacy `installC7EventRules` (complex-effects.js) sur
//    l'événement `creatureDied`, qui piochait pour le contrôleur de TOUT
//    permanent ayant `effect.type==='drawOnDeath'` dès qu'UNE créature meurt,
//    sans vérifier laquelle ni le lien d'enchantement.

// 1. Lancer Creature Bond ne doit PAS piocher de carte immédiatement.
setup();
const bear = { uid: 'bond_bear', objectId: 'bond_bear_obj', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', keywords: [], color: ['G'], tapped: false, summoningSickness: false, damageMarked: 0, tempBuffs: [] };
putPermanent('player', bear);
game.state.player.library = [{ ...card('Forest'), uid: 'lib1', objectId: 'lib1obj' }];
const bond = card('Creature Bond');
game.state.player.hand = [bond];
game.dispatch('CAST_SPELL', { card: bond, target: { kind: 'permanent', perm: bear, uid: bear.uid } }, 'player');
resolve();
assert.equal(game.state.player.hand.length, 0, "Lancer Creature Bond ne doit pas piocher de carte immédiatement (aucune pioche au lancer dans l'Oracle réel).");
const bondPerm = game.state.player.battlefield.find(p => p.name === 'Creature Bond');
assert.ok(bondPerm?.isAura && bondPerm.attachedTo === bear.uid, "Creature Bond doit tout de même être correctement attaché à la créature ciblée.");
console.log('OK V12.60.1: Creature Bond ne pioche plus immédiatement au lancer.');

// 2. Une AUTRE créature (non enchantée par Creature Bond) meurt : le
// mécanisme legacy ne doit plus piocher à tort.
setup();
const enchanted = { uid: 'bond_bear2', objectId: 'bond_bear2_obj', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', keywords: [], color: ['G'], tapped: false, summoningSickness: false, damageMarked: 0, tempBuffs: [] };
const otherCreature = { uid: 'other_bear', objectId: 'other_bear_obj', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', keywords: [], color: ['G'], tapped: false, summoningSickness: false, damageMarked: 0, tempBuffs: [] };
const bondAura = { uid: 'bond_aura', objectId: 'bond_aura_obj', name: 'Creature Bond', type: 'Enchantment', subtype: 'Aura', owner: 'player', controller: 'player', keywords: [], color: ['U'], tapped: false, isAura: true, attachedTo: 'bond_bear2', effect: { type: 'drawOnDeath', target: 'creature', amount: 1 }, triggers: [{ event: 'creatureDied', condition: { enchantedSource: true }, effect: { type: 'draw', amount: 1 } }] };
game.state.player.battlefield = [enchanted, otherCreature, bondAura];
game.state.player.library = [{ ...card('Forest'), uid: 'lib2', objectId: 'lib2obj' }];
game.state.player.hand = [];
game.triggerEngine.syncBattlefield(game.state);
otherCreature.damageMarked = otherCreature.toughness;
game.stateBasedActions.check(game.state);
while (!game.stack.isEmpty) game.stack.resolveTop();
assert.equal(game.state.player.hand.length, 0, 'Creature Bond ne doit pas piocher quand une autre créature meurt.');
console.log('OK V12.60.2: le mécanisme legacy ne pioche plus à tort sur la mort d\'une autre créature.');

// 3. Non-régression : la créature réellement enchantée meurt -> exactement
// UNE pioche (pas deux, malgré les deux mécanismes historiquement en place).
setup();
const enchanted2 = { uid: 'bond_bear3', objectId: 'bond_bear3_obj', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', keywords: [], color: ['G'], tapped: false, summoningSickness: false, damageMarked: 0, tempBuffs: [] };
const bondAura2 = { uid: 'bond_aura2', objectId: 'bond_aura2_obj', name: 'Creature Bond', type: 'Enchantment', subtype: 'Aura', owner: 'player', controller: 'player', keywords: [], color: ['U'], tapped: false, isAura: true, attachedTo: 'bond_bear3', effect: { type: 'drawOnDeath', target: 'creature', amount: 1 }, triggers: [{ event: 'creatureDied', condition: { enchantedSource: true }, effect: { type: 'draw', amount: 1 } }] };
game.state.player.battlefield = [enchanted2, bondAura2];
game.state.player.library = [{ ...card('Forest'), uid: 'lib3', objectId: 'lib3obj' }, { ...card('Forest'), uid: 'lib4', objectId: 'lib4obj' }];
game.state.player.hand = [];
game.triggerEngine.syncBattlefield(game.state);
enchanted2.damageMarked = enchanted2.toughness;
game.stateBasedActions.check(game.state);
while (!game.stack.isEmpty) game.stack.resolveTop();
assert.equal(game.state.player.hand.length, 1, "Creature Bond doit piocher EXACTEMENT une carte quand la créature qu'il enchante meurt (pas zéro, pas deux).");
console.log('OK V12.60.3: exactement une pioche quand la bonne créature meurt (non-régression).');
