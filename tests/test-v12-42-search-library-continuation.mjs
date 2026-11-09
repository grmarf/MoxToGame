import assert from 'node:assert/strict';
import { ChoiceService } from '../src/core/choice-service.js';
import { StackController } from '../src/core/stack.js';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerC81Effects } from '../src/core/effects/choice-effects.js';
import { gameEvents } from '../src/core/event-bus.js';

const state = {
  turnNumber: 1,
  activePlayer: 'player',
  player: {
    hand: [], battlefield: [], graveyard: [],
    library: [
      { uid: 'lib-a', id: 100, name: 'Forest', type: 'Basic Land', zone: 'library' },
      { uid: 'lib-b', id: 101, name: 'Island', type: 'Basic Land', zone: 'library' },
    ],
    mana: {},
  },
  ai: { hand: [], battlefield: [], graveyard: [], library: [], mana: {} },
};

const events = { emitted: [], emit(event) { this.emitted.push(event); } };
const choices = new ChoiceService({ state: () => state, events });
let searchEvents = 0;
const offSearch = gameEvents.on('librarySearched', () => { searchEvents++; });
const effects = new EffectRegistry();
registerC81Effects(effects);

const stack = new StackController({ state: () => state, effects, choiceService: choices });
const source = {
  uid: 'lamp-runtime', objectId: 'lamp-object', name: "Aladdin's Lamp",
  type: 'Artifact', zone: 'stack', effect: { type: 'searchLibrary' },
};
const item = stack.pushSpell(source, 'player');

const first = stack.resolveTop();
assert.equal(first, item);
assert.equal(stack.size, 1, 'the resolving spell must remain on the stack while waiting');
assert.equal(choices.getPending()?.type, 'libraryCard');
assert.equal(state.player.library.length, 2, 'library must not change before the choice');
assert.equal(state.player.hand.length, 0, 'hand must not change before the choice');

// Simulate a UI returning a fresh object carrying the same runtime UID.
choices.resolve({ ...state.player.library[1] });

assert.equal(stack.size, 0, 'the suspended stack item must be finalized after the choice');
assert.equal(state.player.hand.length, 1);
assert.equal(state.player.hand[0].uid, 'lib-b');
assert.equal(state.player.library.length, 1);
assert.equal(state.player.library[0].uid, 'lib-a');
assert.equal(state.player.hand[0].zone, 'hand');
assert.equal(choices.getPending(), null);
assert.equal(stack._resolved.has(item.id), true);
assert.equal(searchEvents, 1);
offSearch();

console.log('OK: V12.42 searchLibrary continuation — real effect pauses, resolves a runtime card by UID, moves it to hand and finalizes once.');
