import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const spell = { uid: 's1', name: 'Bogus', type: 'Sorcery', effect: { type: 'nonExistentEffectType', amount: 99 }, owner: 'player' };
game.stack.pushSpell(spell, 'player', null);
game.stack.resolveTop();
assert.ok(game.state.player.graveyard.some(c => c.name === 'Bogus'), 'Bug 15: sort avec effet inconnu au cimetière');
console.log('Bug 15 PASS');
