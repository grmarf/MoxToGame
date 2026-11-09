import assert from 'node:assert/strict';
import { ChoiceService } from '../src/core/choice-service.js';
import { StackController } from '../src/core/stack.js';
import { EffectRegistry } from '../src/core/effect-registry.js';

const state = {
  turnNumber: 1,
  activePlayer: 'player',
  player: { hand: [], battlefield: [], graveyard: [], library: [], mana: {} },
  ai: { hand: [], battlefield: [], graveyard: [], library: [], mana: {} },
};
const events = { emit() {} };
const choices = new ChoiceService({ state: () => state, events });
const effects = new EffectRegistry();
const trace = [];

effects.register('continuationProbe', (ctx, effect) => {
  trace.push('A');
  const chosen = ctx.api.choose({
    type: 'test', controller: 'player', options: ['X', 'Y'], min: 1, max: 1,
    prompt: 'Choix de test'
  }, (value, resumeCtx) => {
    trace.push(`B:${value}`);
    assert.equal(resumeCtx.state, state);
    state.player.chosen = value;
  });
  if (chosen !== null) trace.push(`unexpected:${chosen}`);
});

const stack = new StackController({ state: () => state, effects, choiceService: choices });
const source = { uid: 'source-1', name: 'Probe', type: 'Instant', zone: 'stack' };
stack.pushSpell(source, 'player', null, 0);
// Replace the generated effect with the deterministic probe used only by this test.
stack.top.effect = { type: 'continuationProbe' };
stack.top.effects = [stack.top.effect];

const first = stack.resolveTop();
assert.ok(first, 'stack item must be returned while suspended');
assert.deepEqual(trace, ['A'], 'the effect must pause before its continuation');
assert.equal(choices.getPending()?.type, 'test');
assert.equal(stack.size, 1, 'the suspended item remains represented on the stack');
assert.equal(state.player.chosen, undefined);

choices.resolve('X');
assert.deepEqual(trace, ['A', 'B:X'], 'the continuation must execute exactly once after the choice');
assert.equal(state.player.chosen, 'X');
assert.equal(choices.getPending(), null);
assert.equal(stack.size, 0, 'the suspended stack item must be finalized and removed after resume');
assert.equal(stack._resolved.has(first.id), true);

console.log('OK: V12.41 ChoiceService continuation — resolution pauses, UI choice resolves, continuation resumes exactly once.');
