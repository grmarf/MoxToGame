import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';

function setup() {
  const game = new GameFacade().connect();
  game.state.player.life = 3;
  game.state.ai.life = 20;
  return game;
}

// Cas 1 — payer exactement N PV : le coût est légal, le paiement amène à 0,
// puis les SBA font perdre le joueur.
{
  const game = setup();
  const cost = { life: 3 };

  assert.equal(
    game.costs.canPay('player', cost, { controller: 'player' }),
    true,
    'Un joueur à exactement N PV doit pouvoir payer un coût de N PV.'
  );

  game.costs.pay('player', cost, { controller: 'player' });
  assert.equal(game.state.player.life, 0, 'Le paiement doit amener les PV exactement à 0.');
  assert.equal(game.state.player.hasLost, false, 'Le paiement seul ne doit pas remplacer le contrôle SBA.');

  const events = game.stateBasedActions.check(game.state);
  assert.equal(game.state.player.hasLost, true, 'Les SBA doivent faire perdre un joueur à 0 PV.');
  assert.ok(
    events.some(e => e.type === 'playerLost' && e.side === 'player'),
    'Le contrôle SBA doit produire un événement playerLost pour le joueur à 0 PV.'
  );
}

// Cas 2 — non-régression : N-1 PV ne permet toujours pas de payer N PV.
{
  const game = setup();
  game.state.player.life = 2;
  const cost = { life: 3 };

  assert.equal(
    game.costs.canPay('player', cost, { controller: 'player' }),
    false,
    'Un joueur à N-1 PV ne doit pas pouvoir payer un coût de N PV.'
  );
  assert.equal(game.state.player.life, 2, 'Un paiement refusé ne doit pas modifier les PV.');
}

console.log('OK V12.61 — coût de vie exactement à 0 autorisé ; insuffisance toujours refusée.');
