import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);
game.connect();

function findCard(name) { return CARDS.find(c => c.name === name); }

function setupGame() {
  game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
  game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));
  game.turnManager.gotoPhase('main1');
  game.turnManager.activePlayer = 'player';
  game.state.activePlayer = 'player';
  game.state.priorityHolder = 'player';
}

function giveMana(side) {
  game.state[side].mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
}

function resolveStack() {
  const ctrl = game.state.priorityHolder;
  const opp = ctrl === 'player' ? 'ai' : 'player';
  game.dispatch('PASS_PRIORITY', {}, ctrl);
  if (game.stack.size > 0) {
    game.dispatch('PASS_PRIORITY', {}, opp);
  }
}

setupGame();
giveMana('player');
const growth = findCard('Giant Growth');
const bear = { uid: 'test_bear', name: 'Grizzly Bears', power: 2, toughness: 2, type: 'Creature', controller: 'player', owner: 'player', tapped: false, summoningSickness: false, keywords: [], color: ['G'], tempBuffs: [] };
game.state.player.battlefield = [bear];
game.state.player.hand = [growth];

console.log('Bear avant:', JSON.stringify(game.state.player.battlefield[0]));

game.dispatch('CAST_SPELL', { card: growth, target: { kind: 'permanent', perm: bear } }, 'player');

console.log('Stack:', JSON.stringify(game.stack.items.map(i => ({ effect: i.effect, target: i.target }))));

resolveStack();

console.log('Bear après:', JSON.stringify(game.state.player.battlefield[0]));
console.log('Battlefield:', game.state.player.battlefield.length);
