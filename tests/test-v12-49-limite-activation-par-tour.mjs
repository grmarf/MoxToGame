import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => CARDS.find(c => c.name === name);
const setup = () => {
  const g = new GameFacade().connect();
  g.turnManager.gotoPhase('main1');
  g.turnManager.activePlayer = 'player';
  g.state.phase = 'main1';
  g.state.activePlayer = 'player';
  g.state.priorityHolder = 'player';
  g.state.turnNumber = 1;
  g.turnManager.turnNumber = 1;
  g.state.player.mana = {W:20,U:20,B:20,R:20,G:20,C:20};
  g.state.ai.mana = {W:20,U:20,B:20,R:20,G:20,C:20};
  return g;
};
const add = (g, name, side='player') => {
  const p = createPermanent({...card(name)});
  p.controller = side;
  p.owner = side;
  g.state[side].battlefield.push(p);
  return p;
};
const resolve = g => g.dispatch('resolveStack', {}, 'player');
const activate = (g, p, i=0) => {
  g.dispatch('ACTIVATE_ABILITY', { permanent:p, abilityIndex:i }, 'player');
  resolve(g);
};
const givePlayerPriority = g => { g.state.priorityHolder = 'player'; };

// 1. Vampire Bats: exactly two activations per turn.
{
  const g = setup();
  const p = add(g, 'Vampire Bats');
  assert.equal(card('Vampire Bats').activated[0].maxPerTurn, 2);
  activate(g, p);
  givePlayerPriority(g);
  activate(g, p);
  assert.equal(p.tempBuffs.length, 2);
  givePlayerPriority(g);
  assert.throws(
    () => g.dispatch('ACTIVATE_ABILITY', { permanent:p, abilityIndex:0 }, 'player'),
    /Capacité activée illégale\./
  );
}

// 2. The same permanent is usable again on its controller's next turn.
{
  const g = setup();
  const p = add(g, 'Vampire Bats');
  activate(g, p);
  givePlayerPriority(g);
  activate(g, p);
  assert.equal(Object.values(p.activationUsesThisTurn).reduce((a,b)=>a+b,0), 2);

  // Move to cleanup, then begin the next turn. The turn manager resets only
  // the permanents controlled by the new active player.
  g.turnManager.gotoPhase('endStep');
  g.turnManager.phaseStarted = true;
  g.state.phase = 'endStep';
  g.turnManager.nextPhase(); // cleanup
  g.turnManager.advanceAutomaticPhases(); // opponent's upkeep
  assert.equal(g.turnManager.activePlayer, 'ai');

  // Finish the opponent's turn, then begin the player's next turn. The reset
  // must happen for permanents controlled by the new active player.
  g.turnManager.gotoPhase('endStep');
  g.turnManager.phaseStarted = true;
  g.state.phase = 'endStep';
  g.turnManager.nextPhase(); // cleanup
  g.turnManager.advanceAutomaticPhases(); // player's next turn
  assert.equal(g.turnManager.activePlayer, 'player');
  assert.equal(Object.keys(p.activationUsesThisTurn).length, 0);
  g.state.priorityHolder = 'player';
  g.state.player.mana.B = 20;
  activate(g, p);
  assert.equal(p.tempBuffs.length, 1);
}

// 3. Fire Drake: exactly one activation per turn.
{
  const g = setup();
  const p = add(g, 'Fire Drake');
  assert.equal(card('Fire Drake').activated[0].maxPerTurn, 1);
  activate(g, p);
  givePlayerPriority(g);
  assert.throws(
    () => g.dispatch('ACTIVATE_ABILITY', { permanent:p, abilityIndex:0 }, 'player'),
    /Capacité activée illégale\./
  );
}

// 4. Existing activated abilities without maxPerTurn remain repeatable.
{
  const g = setup();
  const p = add(g, 'Frozen Shade');
  assert.equal(card('Frozen Shade').activated[0].maxPerTurn, undefined);
  activate(g, p);
  givePlayerPriority(g);
  activate(g, p);
  givePlayerPriority(g);
  activate(g, p);
  assert.equal(p.tempBuffs.length, 3);
}

for (const name of ['Vampire Bats','Fire Drake']) {
  assert.equal(card(name).effectStatus, 'implemented');
  assert.ok(Array.isArray(card(name).activated) && card(name).activated.length === 1);
}

console.log('OK V12.49: limites d’activation par tour — Vampire Bats 2, Fire Drake 1, reset de tour et non-régression certifiés E2E.');
