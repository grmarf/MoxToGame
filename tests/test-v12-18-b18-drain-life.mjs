import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const spell = { uid: 's1', name: 'Drain Life', type: 'Sorcery', effect: { type: 'drainLife', amount: 2 }, owner: 'player' };
game.stack.pushSpell(spell, 'player', null);
assert.doesNotThrow(() => game.stack.resolveTop(), 'Bug 18: drainLife sans cible ne plante pas');
console.log('Bug 18 PASS');
