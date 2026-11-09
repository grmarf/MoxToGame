import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const spell = { uid: 's1', name: 'Giant Growth', type: 'Instant', effect: { type: 'pumpSelf', power: 3, toughness: 3 }, owner: 'player' };
game.stack.pushSpell(spell, 'player', null);
game.stack.resolveTop();
const cardInGy = game.state.player.graveyard.find(c => c.uid === 's1');
assert.ok(cardInGy.tempBuffs && cardInGy.tempBuffs.length === 1, 'Bug 19: tempBuffs initialisé');
console.log('Bug 19 PASS');
