import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

// R-TURN-01: entering DRAW must execute the draw before the phase becomes
// observable to listeners and before priority is exposed.
{
  const g = new GameFacade().connect();
  const card = { ...(CARDS.find(c => c.name === 'Plains')) };
  g.engine.loadDeck('player', [card], { draw: 0 });
  g.state.player.hand = [];
  g.turnManager.gotoPhase('upkeep');
  g.turnManager.phaseStarted = true;
  g.state.phase = 'upkeep';
  g.state.priorityHolder = 'player';

  let observed = null;
  const { gameEvents } = await import('../src/core/event-bus.js');
  gameEvents.on('phaseChanged', e => {
    if (e.phase === 'draw') observed = { hand: g.state.player.hand.length, library: g.state.player.library.length, phase: g.turnManager.phase };
  });

  g.turnManager.runPhase(); // enter DRAW and execute its turn-based action
  assert.equal(g.turnManager.phase, 'draw');
  assert.equal(g.state.player.hand.length, 1);
  assert.equal(g.state.player.library.length, 0);
  assert.deepEqual(observed, { hand: 1, library: 0, phase: 'draw' });
  assert.equal(g.state.priorityHolder, 'player');
}

// R-TURN-02: entering combat subphases keeps TurnManager and CombatService
// aligned before observers can act.
{
  const g = new GameFacade().connect();
  g.turnManager.gotoPhase('combatBegin');
  g.turnManager.phaseStarted = false;
  g.turnManager.runPhase();
  assert.equal(g.turnManager.phase, 'combatBegin');
  assert.equal(g.combat.currentPhase, 'beginCombat');

  g.turnManager.runPhase();
  assert.equal(g.turnManager.phase, 'declareAttackers');
  assert.equal(g.combat.currentPhase, 'declareAttackers');

  g.turnManager.declareAttackers([]);
  assert.equal(g.combat.currentPhase, 'declareBlockers');
}

console.log('OK: R-TURN-01/R-TURN-02 phase entry actions and combat phase alignment.');
