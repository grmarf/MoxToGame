import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';

const g = new GameFacade().connect();
const attacker = { uid:'atk39', name:'Attacker', type:'Creature', power:3, toughness:3, controller:'player', owner:'player', tapped:false, summoningSickness:false, cantAttack:false, attacksDisabled:false, keywords:[] };
const blocker = { uid:'blk39', name:'Blocker', type:'Creature', power:2, toughness:2, controller:'ai', owner:'ai', tapped:false, cantBlock:false, cantBlockThisTurn:false, keywords:[] };
g.state.player.battlefield.push(attacker);
g.state.ai.battlefield.push(blocker);
g.state.activePlayer='player';
g.turnManager.activePlayer='player';
g.turnManager.gotoPhase('combatBegin');
g.turnManager.phaseStarted=false;
g.turnManager.runPhase();
g.turnManager.runPhase();
assert.equal(g.turnManager.phase, 'declareAttackers');
assert.equal(g.combat.currentPhase, 'declareAttackers');

g.turnManager.declareAttackers([attacker]);
assert.equal(g.turnManager.phase, 'declareBlockers');
assert.equal(g.combat.currentPhase, 'declareBlockers');
assert.equal(g.state.priorityHolder, 'ai');

// No damage is resolved while merely declaring blockers.
g.turnManager.declareBlockers({ [attacker.uid]: [blocker.uid] });
assert.equal(g.turnManager.phase, 'combatDamage');
assert.equal(g.combat.currentPhase, 'combatDamage');
assert.equal(g.state.player.life, 20);
assert.equal(g.state.ai.life, 20);
assert.equal(g.turnManager.phaseStarted, false);

// Processing combatDamage resolves exactly once.
g.turnManager.runPhase();
assert.equal(g.state.player.life, 20);
assert.equal(g.state.ai.life, 20);
assert.equal(attacker.damageMarked, 2);
assert.equal(g.turnManager.phaseStarted, true);

console.log('OK: v12.39 combat phase transitions stay aligned; blocker declaration does not resolve damage early.');
