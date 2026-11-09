import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => CARDS.find(c => c.name === name);
const setup = () => {
  const game = new GameFacade().connect();
  game.state.phase = 'main1';
  game.state.priorityHolder = 'player';
  game.state.activePlayer = 'player';
  return game;
};

// 1. Celestial Prism: real activated ability -> real mana-color choice.
{
  const game = setup();
  game.state.player.mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  game.state.player.battlefield.push(createPermanent(card('Celestial Prism')));
  const prism = game.state.player.battlefield[0];
  game.state.player.mana.W = 2; // V12.76 (G32) : Oracle = {2}, {T}
  game.choices.setChooser(null);

  game.action('activateAbility', { permanent: prism, controller: 'player', abilityIndex: 0 });
  assert.equal(game.state.player.mana.W, 0, 'Celestial Prism must pay {2} on activation');
  assert.equal(prism.tapped, true, 'Celestial Prism must tap on activation');
  assert.equal(game.stack.size, 0, 'Celestial Prism mana ability must bypass the stack');
  const pending = game.choices.getPending();
  assert.ok(pending, 'Celestial Prism resolution must request a real choice');
  assert.equal(pending.type, 'manaColor');
  assert.deepEqual(pending.options, ['W','U','B','R','G']);
  assert.equal(game.state.player.mana.any, undefined, 'mana.any must not exist while choice is pending');

  game.choices.resolve('U');
  assert.equal(game.state.player.mana.U, 1, 'chosen U must be added to the mana pool');
  assert.equal(game.state.player.mana.any, undefined, 'mana.any must never be created');
  assert.equal(game.stack.size, 0, 'resumed ability must finalize exactly once');
}

// 2. Fixed-color mana handler remains synchronous (Dark Ritual).
{
  const game = setup();
  game.state.player.mana.B = 1;
  game.state.player.hand.push(card('Dark Ritual'));
  game.action('cast', { card: game.state.player.hand[0], controller: 'player' });
  game.dispatch('resolveStack', {}, 'player');
  assert.equal(game.state.player.mana.B, 3, 'fixed-color mana must still resolve without a choice');
  assert.equal(game.state.player.mana.any, undefined);
  assert.equal(game.choices.getPending(), null);
}

// 3. Circle of Protection: Black: {1} is paid, black damage is prevented once,
// and a differently colored source is unaffected.
{
  const game = setup();
  game.state.player.prevention = [];
  const circleCard = card('Circle of Protection: Black');
  const circle = createPermanent(circleCard);
  game.state.player.battlefield.push(circle);
  game.state.player.mana.W = 1;
  const before = game.state.player.life;

  game.action('activateAbility', { permanent: circle, controller: 'player', abilityIndex: 0 });
  assert.equal(game.state.player.mana.W, 0, 'Circle must pay generic {1} from available mana');
  game.dispatch('resolveStack', {}, 'player');
  assert.equal(game.state.player.prevention.length, 1, 'Circle activation must create one prevention shield');
  assert.equal(game.state.player.prevention[0].color, 'B');

  const blackSource = { name: 'Black Source', type: 'Instant', color: ['B'], cost: '', effect: { type: 'damage', amount: 3, target: 'player' }, sets: [] };
  game.state.priorityHolder = 'player';
  game.state.player.hand.push(blackSource);
  game.action('cast', { card: game.state.player.hand[0], controller: 'player', target: { kind: 'player', side: 'player' } });
  game.dispatch('resolveStack', {}, 'player');
  assert.equal(game.state.player.life, before, 'next black source damage must be prevented');
  assert.equal(game.state.player.prevention.length, 0, 'one-shot Circle shield must be consumed');

  const redSource = { name: 'Red Source', type: 'Instant', color: ['R'], cost: '', effect: { type: 'damage', amount: 2, target: 'player' }, sets: [] };
  game.state.priorityHolder = 'player';
  game.state.player.hand.push(redSource);
  game.action('cast', { card: game.state.player.hand[0], controller: 'player', target: { kind: 'player', side: 'player' } });
  game.dispatch('resolveStack', {}, 'player');
  assert.equal(game.state.player.life, before - 2, 'red source damage must not be affected by black Circle');
}

// Database-level confirmation: all five color Circles use the generic {1}
// activation cost; the artifact variant uses its distinct real {2} activation cost.
for (const color of ['Black','Blue','Green','Red','White']) {
  const c = card(`Circle of Protection: ${color}`);
  assert.equal(c.activated[0].cost, '{1}', `${c.name} must cost {1}`);
}
assert.equal(card('Circle of Protection: Artifacts').activated[0].cost, '{2}', 'artifact Circle must use its real {2} activation cost');
assert.equal(card('Circle of Protection: Artifacts').effectStatus, 'implemented');

console.log('OK V12.45: activated mana choice + fixed mana + Circle of Protection Black E2E');
