import assert from 'node:assert/strict';
import { ChoiceService } from '../src/core/choice-service.js';
import { StackController } from '../src/core/stack.js';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerC81Effects } from '../src/core/effects/choice-effects.js';

const state = {
  turnNumber: 1,
  activePlayer: 'player',
  player: { hand: [], battlefield: [], graveyard: [], library: [], mana: {} },
  ai: { hand: [], battlefield: [], graveyard: [], library: [], mana: {} },
};
const events = { emitted: [], emit(event) { this.emitted.push(event); } };
const choices = new ChoiceService({ state: () => state, events });
const effects = new EffectRegistry();
registerC81Effects(effects);
const stack = new StackController({ state: () => state, effects, choiceService: choices });
const source = { uid: 'source-color', objectId: 'obj-source-color', name: 'Test Color Source', type: 'Artifact', zone: 'stack', chosenColor: null };
const item = stack.pushSpell(source, 'player');
item.effect = { type: 'chooseColor' };
item.effects = [item.effect];

stack.resolveTop();
assert.equal(choices.getPending()?.type, 'color');
assert.equal(source.chosenColor, null);
assert.equal(stack.size, 1);
assert.equal(stack._resolved.has(item.id), false);

assert.throws(() => choices.resolve('X'), /Choix invalide/);
assert.equal(choices.getPending()?.type, 'color');
assert.equal(source.chosenColor, null);

choices.resolve('G');
assert.equal(source.chosenColor, 'G');
assert.equal(choices.getPending(), null);
assert.equal(stack.size, 0);
assert.equal(stack._resolved.has(item.id), true);

// Verify all canonical colors through fresh independent resolutions.
for (const color of ['W','U','B','R','G']) {
  const fresh = { uid: `source-${color}`, objectId: `obj-${color}`, name: 'Color Source', type: 'Artifact', zone: 'stack', chosenColor: null };
  const next = stack.pushSpell(fresh, 'player');
  next.effect = { type: 'chooseColor' };
  next.effects = [next.effect];
  stack.resolveTop();
  assert.equal(choices.getPending()?.type, 'color');
  choices.resolve(color);
  assert.equal(fresh.chosenColor, color);
  assert.equal(stack._resolved.has(next.id), true);
}

console.log('OK: V12.43 chooseColor continuation — real chooseColor effect pauses, rejects invalid values, resumes with W/U/B/R/G, and finalizes once.');
