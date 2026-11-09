import assert from 'node:assert/strict';
import { ChoiceService } from '../src/core/choice-service.js';

const events = [];
const bus = { emit: e => events.push(e) };
const choices = new ChoiceService({ state: () => ({}), events: bus });

const result = choices.request({
  type: 'color', controller: 'player', prompt: 'Choisissez une couleur.',
  options: ['W', 'U', 'B'], min: 1, max: 1, defaultValue: 'W'
});
assert.equal(result, null);
assert.equal(choices.getPending()?.type, 'color');
assert.equal(events.at(-1).type, 'choiceRequested');
assert.equal(events.at(-1).choice.id, choices.getPending().id);

assert.throws(() => choices.resolve('G'), /Choix invalide/);
assert.equal(choices.getPending()?.id, events.at(-1).choice.id);

assert.equal(choices.resolve('U'), 'U');
assert.equal(choices.getPending(), null);
assert.equal(events.at(-1).type, 'choiceResolved');
assert.equal(events.at(-1).value, 'U');

choices.request({ type:'cards', controller:'player', options:[{uid:'a',name:'A'},{uid:'b',name:'B'}], min:1, max:2 });
assert.throws(() => choices.resolve([{uid:'z'}]), /Choix invalide/);
assert.deepEqual(choices.resolve([{uid:'a'}]).map(x => x.uid), ['a']);

choices.request({ type:'number', controller:'player', options:[1,2,3], min:1, max:1 });
choices.clear('player-cancel');
assert.equal(choices.getPending(), null);
assert.equal(events.at(-1).type, 'choiceCleared');
assert.equal(events.at(-1).reason, 'player-cancel');

console.log('OK V12.31 ChoiceService — pending, validation, stable object options, resolve/clear events.');
