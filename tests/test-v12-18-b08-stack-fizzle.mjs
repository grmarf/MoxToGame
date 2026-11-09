import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const spell = { uid: 's1', name: 'Lightning Bolt', type: 'Instant', effect: { type: 'damage', amount: 3 }, owner: 'player' };
game.state.player.hand = [spell]; game.state.activePlayer = 'player';
game.stack.pushSpell(spell, 'player', { kind: 'player', side: 'ai' });
game.stack.resolveTop();
assert.ok(game.state.player.graveyard.some(c => c.name === 'Lightning Bolt'), 'Bug 8: sort au cimetière');
console.log('Bug 8 PASS');
