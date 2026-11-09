import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const token = { uid: 't1', name: 'Soldier', type: 'Creature', power: 1, toughness: 1, isToken: true, owner: 'player' };
game.zones.enterBattlefield(token, 'player');
assert.strictEqual(game.state.player.battlefield[0].damageMarked, 0, 'Bug 11: damageMarked = 0');
console.log('Bug 11 PASS');
