import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);
game.connect();

function findCard(name) { return CARDS.find(c => c.name === name); }

const growth = findCard('Giant Growth');
const bear = { uid: 'test_bear', name: 'Grizzly Bears', power: 2, toughness: 2, type: 'Creature', controller: 'player', owner: 'player', tapped: false, summoningSickness: false, keywords: [], color: ['G'], tempBuffs: [] };

game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));

game.state.player.battlefield = [bear];
game.state.player.hand = [growth];
game.state.player.mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
game.turnManager.gotoPhase('main1');
game.turnManager.activePlayer = 'player';
game.state.activePlayer = 'player';
game.state.priorityHolder = 'player';

console.log('Avant cast: battlefield=', game.state.player.battlefield.length, 'bear=', JSON.stringify(game.state.player.battlefield[0]?.uid));

game.dispatch('CAST_SPELL', { card: growth, target: { kind: 'permanent', perm: bear } }, 'player');

console.log('Après cast: stack=', game.stack.size, 'priority=', game.state.priorityHolder);
console.log('Stack item target:', JSON.stringify(game.stack.items[0]?.target));

// Pass priority from AI (responder)
game.dispatch('PASS_PRIORITY', {}, 'ai');
console.log('Après pass AI: stack=', game.stack.size, 'priority=', game.state.priorityHolder);

// Pass priority from player (caster)
game.dispatch('PASS_PRIORITY', {}, 'player');
console.log('Après pass player: stack=', game.stack.size, 'priority=', game.state.priorityHolder);

console.log('Après resolve: battlefield=', game.state.player.battlefield.length);
if (game.state.player.battlefield.length > 0) {
  console.log('Bear après:', JSON.stringify(game.state.player.battlefield[0]));
}
