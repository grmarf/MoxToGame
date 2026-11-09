import assert from 'node:assert/strict';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerAtomicEffects } from '../src/core/effects/atomic-effects.js';
import { ZoneManager } from '../src/core/zone-manager.js';

// BUG H (audit v12.66) : les 4 contre-sorts poussaient le sort contrecarré
// directement dans le cimetière (graveyard.push), en contournant le chemin
// canonique (zones.moveToGraveyard). Ce test vérifie, pour les 4 handlers,
// que le sort finit exactement une fois au cimetière de son propriétaire,
// avec une identité (objectId) et zone='graveyard'.

const registry = new EffectRegistry();
registerAtomicEffects(registry);
const mk = () => ({ turnNumber: 1,
  player: { life: 20, library: [], hand: [], battlefield: [], graveyard: [], exile: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } },
  ai: { life: 20, library: [], hand: [], battlefield: [], graveyard: [], exile: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } } });

const cases = [
  ['counterSpell', {}, { cmc: 2, color: ['R'] }],
  ['counterCMC', { amount: 2 }, { cmc: 2, color: ['R'] }],
  ['counterSpellColor', { color: 'R' }, { cmc: 2, color: ['R'] }],
  ['counterUnlessPay', { amount: 3 }, { cmc: 2, color: ['R'] }],
];
for (const [type, effect, spellProps] of cases) {
  const state = mk();
  const zones = new ZoneManager({ state: () => state });
  const spell = { uid: 'sp1', name: 'Lightning Bolt', ...spellProps };
  let stack = [{ id: 'it1', controller: 'ai', source: spell }];
  const api = {
    log() {}, zones,
    removeStackItem: (id) => { const i = stack.findIndex(x => x.id === id); return i < 0 ? null : stack.splice(i, 1)[0]; },
    findStackItem: (id) => stack.find(x => x.id === id) || null,
    totalMana: () => 0, payGenericFromPool() {},
  };
  const ctx = { state, controllerKey: 'player', sourceCard: { name: 'Contre-sort test' }, api,
    targetInfo: { _kind: 'stackItem', kind: 'stackItem', id: 'it1', source: spell }, xValue: 0 };
  registry.resolve(type, ctx, { type, ...effect });
  const gy = state.ai.graveyard;
  assert.equal(gy.length, 1, `BUG H (${type}) : le sort contrecarré doit finir exactement une fois au cimetière.`);
  assert.equal(gy[0].name, 'Lightning Bolt');
  assert.ok(gy[0].objectId, `BUG H (${type}) : le sort contrecarré doit avoir une identité (objectId).`);
  assert.equal(gy[0].zone, 'graveyard', `BUG H (${type}) : zone doit valoir 'graveyard'.`);
  assert.equal(stack.length, 0, 'Le sort doit avoir quitté la pile.');
  console.log(`OK V12.75: ${type} -> cimetière via chemin canonique unique.`);
}
