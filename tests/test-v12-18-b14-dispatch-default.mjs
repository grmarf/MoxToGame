import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
assert.throws(() => game.dispatch('UNKNOWN_COMMAND_XYZZY', {}, 'player'), /inconnue|Unknown/, 'Bug 14: commande inconnue rejetée');
console.log('Bug 14 PASS');
