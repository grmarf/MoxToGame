import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { phaseAllowsPriority } from '../src/core/turn/turn-rules.js';

function setupAt(phase) {
  const g = new GameFacade().connect();
  g.turnManager.gotoPhase(phase);
  g.turnManager.phaseStarted = true;
  g.state.phase = phase;
  g.state.activePlayer = 'player';
  g.state.priorityHolder = 'player';
  return g;
}

// P0 regression: two passes with an empty stack may enter a no-priority phase
// (e.g. cleanup), and that phase must not expose priority.
{
  const g = setupAt('endStep');
  g.priority.pass('player');
  assert.equal(g.state.priorityHolder, 'ai');
  g.priority.pass('ai');
  assert.equal(g.turnManager.phase, 'cleanup');
  assert.equal(phaseAllowsPriority(g.turnManager.phase), false);
  assert.equal(g.state.priorityHolder, null, 'cleanup must not expose priority');
  assert.equal(g.turnManager.priorityPlayer, null);
}

// Regression: after advancing into combatBegin, which DOES allow priority,
// the active player must receive it.
{
  const g = setupAt('main1');
  g.priority.pass('player');
  g.priority.pass('ai');
  assert.equal(g.turnManager.phase, 'combatBegin');
  assert.equal(phaseAllowsPriority(g.turnManager.phase), true);
  assert.equal(g.state.priorityHolder, 'player');
}

// Regression: a no-priority phase must be usable by the automatic phase
// advancement path immediately after the empty-stack double pass.
{
  const g = setupAt('endStep');
  g.priority.pass('player');
  g.priority.pass('ai');
  assert.equal(g.state.priorityHolder, null);
  g.turnManager.advanceAutomaticPhases();
  assert.equal(g.turnManager.phase, 'upkeep');
  assert.equal(g.state.priorityHolder, 'ai');
}

console.log('OK: empty-stack double-pass preserves priority invariants across phase transitions.');
