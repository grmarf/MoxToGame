import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { ChoiceService } from '../src/core/choice-service.js';
import { StackController } from '../src/core/stack.js';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerUpkeepCostEffects } from '../src/core/effects/upkeep-cost-effects.js';
import { registerC81Effects } from '../src/core/effects/choice-effects.js';
import { registerC86C87Effects } from '../src/core/effects/token-historical-effects.js';

function card(name) {
  const found = CARDS.find(c => c.name === name);
  assert.ok(found, `Carte absente de la base: ${name}`);
  return found;
}

function makeHarness() {
  const state = {
    turnNumber: 1,
    activePlayer: 'player',
    player: { life: 20, hand: [], battlefield: [], graveyard: [], library: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } },
    ai: { life: 20, hand: [], battlefield: [], graveyard: [], library: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } },
  };
  const events = { emitted: [], emit(event) { this.emitted.push(event); } };
  const choices = new ChoiceService({ state: () => state, events });
  const effects = new EffectRegistry();
  registerUpkeepCostEffects(effects);
  registerC81Effects(effects);
  registerC86C87Effects(effects);
  const stack = new StackController({ state: () => state, effects, choiceService: choices });
  return { state, choices, effects, stack };
}

function pushUpkeep(h, source, effect) {
  const item = h.stack.pushAbility(source, effect, 'player');
  h.stack.resolveTop();
  return item;
}

// 1. Force of Nature: enough green mana must suspend for a human choice, then pay.
{
  const h = makeHarness();
  const source = { ...card('Force of Nature'), uid:'force-runtime', objectId:'force-obj', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source);
  h.state.player.mana.G = 6;
  pushUpkeep(h, source, { type:'payOrDamage', cost:'GGGG', damage:8 });
  assert.equal(h.choices.getPending()?.type, 'upkeepCost');
  assert.deepEqual(h.choices.getPending()?.options, ['pay', 'damage']);
  h.choices.resolve('pay');
  assert.equal(h.state.player.life, 20);
  assert.equal(h.state.player.mana.G, 2);
}

// 1b. A human choice is evaluated against fresh runtime state on resume.
{
  const h = makeHarness();
  const source = { ...card('Force of Nature'), uid:'force-fresh-state', objectId:'force-fresh-state-obj', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source);
  h.state.player.mana.G = 4;
  pushUpkeep(h, source, { type:'payOrDamage', cost:'GGGG', damage:8 });
  h.state.player.mana.G = 0;
  h.choices.resolve('pay');
  assert.equal(h.state.player.life, 12);
  assert.equal(h.state.player.mana.G, 0);
}

// 2. Force of Nature: insufficient mana offers only damage and applies it without touching mana.
{
  const h = makeHarness();
  const source = { ...card('Force of Nature'), uid:'force-poor', objectId:'force-poor-obj', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source);
  h.state.player.mana.G = 3;
  pushUpkeep(h, source, { type:'payOrDamage', cost:'GGGG', damage:8 });
  assert.deepEqual(h.choices.getPending()?.options, ['damage']);
  h.choices.resolve('damage');
  assert.equal(h.state.player.life, 12);
  assert.equal(h.state.player.mana.G, 3);
}

// 3. Phantasmal Forces: paying keeps the permanent and debits exactly one blue.
{
  const h = makeHarness();
  const source = { ...card('Phantasmal Forces'), uid:'phantasmal-runtime', objectId:'phantasmal-obj', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source);
  h.state.player.mana.U = 2;
  pushUpkeep(h, source, { type:'payOrSacrifice', cost:'U' });
  h.choices.resolve('pay');
  assert.ok(h.state.player.battlefield.includes(source));
  assert.equal(h.state.player.graveyard.length, 0);
  assert.equal(h.state.player.mana.U, 1);
}

// 4. Phantasmal Forces: without mana, the permanent is sacrificed.
{
  const h = makeHarness();
  const source = { ...card('Phantasmal Forces'), uid:'phantasmal-sac', objectId:'phantasmal-sac-obj', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source);
  pushUpkeep(h, source, { type:'payOrSacrifice', cost:'U' });
  assert.deepEqual(h.choices.getPending()?.options, ['sacrifice']);
  h.choices.resolve('sacrifice');
  assert.equal(h.state.player.battlefield.includes(source), false);
  assert.equal(h.state.player.graveyard.some(c => c.name === 'Phantasmal Forces'), true);
}

// 5. Demonic Hordes: enough mana allows paying and preserves the land.
{
  const h = makeHarness();
  const source = { ...card('Demonic Hordes'), uid:'hordes-runtime', objectId:'hordes-obj', zone:'battlefield', owner:'player', controller:'player' };
  const land = { name:'Forest', uid:'land-pay', objectId:'land-pay-obj', type:'Basic Land — Forest', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source, land);
  h.state.player.mana.B = 4;
  pushUpkeep(h, source, { type:'destroyLandOrPay', cost:'BBB' });
  h.choices.resolve('pay');
  assert.ok(h.state.player.battlefield.includes(land));
  assert.equal(h.state.player.mana.B, 1);
}

// 6. Demonic Hordes: insufficient mana must destroy a real land option.
{
  const h = makeHarness();
  const source = { ...card('Demonic Hordes'), uid:'hordes-poor', objectId:'hordes-poor-obj', zone:'battlefield', owner:'player', controller:'player' };
  const land = { name:'Forest', uid:'land-destroy', objectId:'land-destroy-obj', type:'Basic Land — Forest', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source, land);
  pushUpkeep(h, source, { type:'destroyLandOrPay', cost:'BBB' });
  assert.equal(h.choices.getPending()?.options.some(o => o?.uid === land.uid), true);
  h.choices.resolve(land);
  assert.equal(h.state.player.battlefield.includes(land), false);
  assert.equal(h.state.player.graveyard.some(c => c.uid === land.uid && c.name === 'Forest'), true);
}

// 7. chooseNumber : le handler générique reste fonctionnel (v12.45 a corrigé
// Mind Bomb pour utiliser un vrai modèle dédié à son texte Oracle réel —
// voir tests/test-v12-45-mindbomb-and-cleanup.mjs — donc ce handler générique
// n'est plus exercé par une carte réelle de la base pour l'instant ; ces
// sous-tests vérifient directement le mécanisme via un effet synthétique).
{
  const h = makeHarness();
  assert.equal(h.effects.has('chooseNumber'), true);
  const source = { name:'Synthetic ChooseNumber Source', uid:'synth-number-runtime', objectId:'synth-number-obj', zone:'stack', owner:'player', controller:'player', chosenNumber:null, effect:{type:'chooseNumber', min:0, max:7} };
  const item = h.stack.pushSpell(source, 'player');
  h.stack.resolveTop();
  assert.equal(h.choices.getPending()?.type, 'number');
  assert.deepEqual(h.choices.getPending()?.options, [0,1,2,3,4,5,6,7]);
  h.choices.resolve(3);
  assert.equal(source.chosenNumber, 3);
  assert.equal(h.stack._resolved.has(item.id), true);
}

// 7b. Invalid chooseNumber values are rejected without resuming.
{
  const h = makeHarness();
  const source = { name:'Synthetic ChooseNumber Source', uid:'synth-number-invalid', objectId:'synth-number-invalid-obj', zone:'stack', owner:'player', controller:'player', chosenNumber:null, effect:{type:'chooseNumber', min:0, max:7} };
  h.stack.pushSpell(source, 'player');
  h.stack.resolveTop();
  assert.throws(() => h.choices.resolve(8), /Choix invalide/);
  assert.equal(source.chosenNumber, null);
  assert.equal(h.choices.getPending()?.type, 'number');
}

// 7c. Synchronous chooser path applies the result immediately and does not create a pending choice.
{
  const h = makeHarness();
  h.choices.setChooser(choice => choice.type === 'number' ? 2 : 'pay');
  const source = { name:'Synthetic ChooseNumber Source', uid:'synth-number-sync', objectId:'synth-number-sync-obj', zone:'stack', owner:'player', controller:'player', chosenNumber:null, effect:{type:'chooseNumber', min:0, max:7} };
  const item = h.stack.pushSpell(source, 'player');
  h.stack.resolveTop();
  assert.equal(h.choices.getPending(), null);
  assert.equal(source.chosenNumber, 2);
  assert.equal(h.stack._resolved.has(item.id), true);
}

// 8. Lord of the Pit: the overriding sacrificeOrDamage remains active and functional.
{
  const h = makeHarness();
  const source = { name:'Lord of the Pit', uid:'lord-source', objectId:'lord-obj', zone:'battlefield', owner:'player', controller:'player' };
  const creature = { name:'Grizzly Bears', uid:'lord-bear', objectId:'lord-bear-obj', type:'Creature', zone:'battlefield', owner:'player', controller:'player' };
  h.state.player.battlefield.push(source, creature);
  const item = h.stack.pushAbility(source, { type:'sacrificeOrDamage', damage:7 }, 'player');
  h.stack.resolveTop();
  assert.equal(h.choices.getPending(), null);
  assert.equal(h.state.player.life, 20);
  assert.equal(h.state.player.battlefield.includes(creature), false);
  assert.equal(h.stack._resolved.has(item.id), true);
}

console.log('OK: V12.44 upkeep pay-or effects and chooseNumber scenarios.');
