import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';

const g = new GameFacade().connect();
const playerCreature = { uid:'cleanup-p', name:'Player Creature', type:'Creature', controller:'player', owner:'player', toughness:3, damageMarked:2, summoningSickness:false, tempBuffs:[{power:1,toughness:1}], tempKeywords:['flying'], untilEndEffects:[{type:'x'}], untilCleanupEffects:[{type:'expire'}] };
const aiCreature = { uid:'cleanup-a', name:'AI Creature', type:'Creature', controller:'ai', owner:'ai', toughness:3, damageMarked:2, summoningSickness:false, tempBuffs:[{power:1,toughness:1}], tempKeywords:['flying'], untilEndEffects:[{type:'x'}], untilCleanupEffects:[{type:'expire'}] };
g.state.player.battlefield.push(playerCreature);
g.state.ai.battlefield.push(aiCreature);
g.state.player.mana = {W:2,U:0,B:0,R:0,G:0,C:0};
g.state.ai.mana = {W:0,U:3,B:0,R:0,G:0,C:0};
g.state.player.hand = Array.from({length:8}, (_,i) => ({uid:`p-card-${i}`, name:`Card ${i}`, owner:'player'}));

g.turnManager.activePlayer = 'player';
g.turnManager.turnNumber = 1;
g.turnManager.gotoPhase('endStep');
g.turnManager.phaseStarted = true;
g.state.phase = 'endStep';
g.state.activePlayer = 'player';
g.state.priorityHolder = 'player';

// Enter cleanup: it must execute cleanup immediately and remain in cleanup.
g.turnManager.nextPhase();
assert.equal(g.turnManager.phase, 'cleanup');
assert.equal(g.state.phase, 'cleanup');
assert.equal(playerCreature.damageMarked, 0, 'Cleanup retire les blessures marquées du joueur actif.');
assert.equal(aiCreature.damageMarked, 0, 'Cleanup retire aussi les blessures marquées de l adversaire.');
assert.deepEqual(playerCreature.untilCleanupEffects, [], 'Les effets jusqu au cleanup du joueur expirent.');
assert.deepEqual(aiCreature.untilCleanupEffects, [], 'Les effets jusqu au cleanup de l adversaire expirent aussi.');
assert.deepEqual(playerCreature.tempBuffs, [], 'Les buffs temporaires du joueur sont nettoyés.');
assert.deepEqual(aiCreature.tempBuffs, [], 'Les buffs temporaires de l adversaire sont nettoyés.');
assert.equal(g.state.player.hand.length, 7, 'La défausse de taille de main est exécutée au cleanup.');
assert.equal(g.state.player.mana.W, 0, 'Le mana du joueur actif est vidé au cleanup.');
assert.equal(g.state.ai.mana.U, 0, 'Le mana de l’adversaire est aussi vidé à la frontière de phase.');
assert.equal(g.state.ai.life, 17, 'Le mana non dépensé de l’adversaire provoque aussi le mana burn.');
assert.equal(g.state.priorityHolder, null, 'Cleanup ne donne pas la priorité.');

// Next automatic transition: new turn + untap + upkeep.
g.turnManager.advanceAutomaticPhases();
assert.equal(g.turnManager.turnNumber, 2, 'Le passage cleanup -> nouveau tour incrémente le tour.');
assert.equal(g.turnManager.activePlayer, 'ai', 'Le joueur actif change après cleanup.');
assert.equal(g.turnManager.phase, 'upkeep', 'Après cleanup, untap est traité automatiquement avant upkeep.');
assert.equal(g.state.priorityHolder, 'ai', 'La priorité revient au nouveau joueur actif à upkeep.');

console.log('OK: cleanup, fin de tour et transition vers le nouveau tour sont cohérents.');
