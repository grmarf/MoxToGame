import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);
game.connect();

function findCard(name) { return CARDS.find(c => c.name === name); }

// Setup: give player Lightning Bolt and mana
const bolt = findCard('Lightning Bolt');
game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));

// Put bolt in hand and give mana
game.state.player.hand = [bolt];
game.state.player.mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
game.state.ai.life = 20;

// Set main phase and priority
game.turnManager.gotoPhase('main1');
game.turnManager.activePlayer = 'player';
game.state.activePlayer = 'player';
game.state.priorityHolder = 'player';

console.log('PV IA avant:', game.state.ai.life);

// Cast Lightning Bolt targeting AI
game.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' } }, 'player');

console.log('Stack size after cast:', game.stack.size);
console.log('Priority holder:', game.state.priorityHolder);

// Pass priority from AI (responder), then from player (caster) to resolve
game.dispatch('PASS_PRIORITY', {}, 'ai');
game.dispatch('PASS_PRIORITY', {}, 'player');

console.log('PV IA après:', game.state.ai.life);
console.log('Stack size after resolve:', game.stack.size);

if (game.state.ai.life === 17) {
  console.log('OK E2E: Lightning Bolt 20 -> 17');
  process.exit(0);
} else {
  console.error('ÉCHEC: PV attendus = 17, obtenus =', game.state.ai.life);
  process.exit(1);
}
