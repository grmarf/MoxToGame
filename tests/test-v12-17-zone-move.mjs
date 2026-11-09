import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);

const game = new GameFacade();
game.connect();
const card = { ...(CARDS.find(c => c.name === 'Plains')) };
game.engine.loadDeck('player', [card], { draw: 0 });
game.turnManager.gotoPhase('draw');
game.state.activePlayer = 'player';
game.state.phase = 'draw';
game.state.priorityHolder = 'player';

const drawn = game.state.player.library.at(-1);
game.turnManager.runPhase();

assert.equal(game.state.player.hand.length, 1, 'la carte piochée doit entrer en main');
assert.equal(game.state.player.library.length, 0, 'la carte piochée doit quitter la bibliothèque');
assert.equal(game.state.player.hand[0].previousUid, drawn.uid, 'la nouvelle identité doit conserver le lien vers l’objet précédent');
assert.equal(game.state.player.hand[0].zone, 'hand');
console.log('OK V12.17: draw via ZoneManager conserve la carte et son identité.');

// Regression: discard must not remove the card before ZoneManager resolves it.
{
  const g = new GameFacade();
  g.connect();
  g.engine.loadDeck('player', [{ ...(CARDS.find(c => c.name === 'Plains')) }], { draw: 1 });
  const discarded = g.state.player.hand[0];
  g.stack.effects.resolve('discard', {
    state: g.state,
    controllerKey: 'player',
    sourceCard: discarded,
    api: { state: g.state, opponentKey: side => side === 'player' ? 'ai' : 'player', zones: g.zones, log() {} },
    xValue: 0,
  }, { type: 'discard', amount: 1 });
  assert.equal(g.state.player.hand.length, 0);
  assert.equal(g.state.player.graveyard.length, 1);
}

// Regression: stack API drawCard must resolve the top library object before moving it.
{
  const g = new GameFacade();
  g.connect();
  const ancestral = { ...(CARDS.find(c => c.name === 'Ancestral Recall')) };
  const library = [1,2,3].map(() => ({ ...(CARDS.find(c => c.name === 'Plains')) }));
  g.engine.loadDeck('player', library, { draw: 0 });
  const before = g.state.player.library.map(c => c.uid);
  const item = g.stack.pushSpell(ancestral, 'player', null, 0);
  g.stack.resolveTop();
  assert.equal(g.state.player.hand.length, 3);
  assert.deepEqual(g.state.player.hand.map(c => c.previousUid), before.slice(-3).reverse());
  assert.equal(g.state.player.library.length, 0);
  assert.equal(item.type, 'spell');
}

// Regression: cleanup hand-size discard must not pop the card before ZoneManager resolves it.
{
  const g = new GameFacade();
  g.connect();
  g.engine.loadDeck('player', Array.from({ length: 8 }, () => ({ ...(CARDS.find(c => c.name === 'Plains')) })), { draw: 8 });
  g.turnManager.gotoPhase('cleanup');
  g.state.activePlayer = 'player';
  g.state.phase = 'cleanup';
  g.state.priorityHolder = null;
  g.turnManager.runPhase();
  assert.equal(g.state.player.hand.length, 7);
  assert.equal(g.state.player.graveyard.length, 1);
}

// Regression: loadDeck must draw the requested count even when draw === deck size.
{
  const g = new GameFacade();
  g.connect();
  const deck = Array.from({ length: 8 }, () => ({ ...(CARDS.find(c => c.name === 'Plains')) }));
  g.engine.loadDeck('player', deck, { draw: 8 });
  assert.equal(g.state.player.hand.length, 8);
  assert.equal(g.state.player.library.length, 0);
}
