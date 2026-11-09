import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { isCardPlayable, PLAYABLE_EFFECT_STATUSES } from '../src/core/card-playability.js';

// V12.27 — card playability is an explicit, centralized database status.
assert.deepEqual(
  [...PLAYABLE_EFFECT_STATUSES].sort(),
  ['functional', 'implemented'],
  'Only certified effect statuses belong to the playable pool'
);

const plains = CARDS.find(c => c.name === 'Plains');
assert.ok(plains, 'Plains must exist');
assert.equal(plains.effectStatus, 'functional');
assert.equal(isCardPlayable(plains), true, 'Basic land should be playable');

const savannahLions = CARDS.find(c => c.name === 'Savannah Lions');
assert.ok(savannahLions, 'Savannah Lions must exist');
assert.equal(savannahLions.effectStatus, 'functional');
assert.equal(isCardPlayable(savannahLions), true, 'Functional vanilla creature should be playable');

const lightningBolt = CARDS.find(c => c.name === 'Lightning Bolt');
assert.ok(lightningBolt, 'Lightning Bolt must exist');
assert.equal(lightningBolt.effectStatus, 'implemented');
assert.equal(isCardPlayable(lightningBolt), true, 'Implemented effect card should be playable');

// V12.76 : l'exemple n'est plus une carte NOMMÉE (Svyelunite Temple a été certifiée au lot G5, et chaque lot en retire une) :
// on prend n'importe quelle carte encore `unimplemented`, ce qui rend ce test insensible à l'avancement du chantier.
const unimplementedCard = CARDS.find(c => c.effectStatus === 'unimplemented');
assert.ok(unimplementedCard, 'Au moins une carte unimplemented doit exister');
assert.equal(isCardPlayable(unimplementedCard), false, 'Unimplemented card must not be playable');

const missingStatus = CARDS.find(c => c.effectStatus == null);
assert.ok(missingStatus, 'Database should contain at least one card without effectStatus for this regression guard');
assert.equal(isCardPlayable(missingStatus), false, 'Missing status must not be inferred as playable');

assert.equal(isCardPlayable(null), false);
assert.equal(isCardPlayable(undefined), false);
assert.equal(isCardPlayable({ effectStatus: 'unknown' }), false);

console.log('OK: V12.27 card playability predicate — certified statuses only.');
