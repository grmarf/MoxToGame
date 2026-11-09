import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
game.state.priorityHolder = 'ai';
assert.throws(() => game.priority.pass('player'), /priorité/, 'Bug 17: pass sans priorité rejeté');
console.log('Bug 17 PASS');
