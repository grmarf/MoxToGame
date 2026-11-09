import assert from 'node:assert/strict';
import { ReplacementService } from '../src/core/replacement-effects.js';

const state = {
  player: { life: 20, prevention: [] },
  ai: { life: 20, prevention: [] },
};
const service = new ReplacementService({ state: () => state });
const source = { uid: 'source_1', objectId: 'object_1', type: 'Creature' };
state.player.prevention.push({ amount: 3, color: null, source, until: 'nextMatchingDamage', persistent: false });

const result = service.preventDamage('player', 2, null, { uid: source.uid, objectId: source.objectId, type: source.type }, {});
assert.equal(result.prevented, 2, 'une même identité de source doit matcher même si l’instance objet diffère');
assert.equal(result.remaining, 0);
console.log('OK V12.17: remplacement source matche par identité stable.');
