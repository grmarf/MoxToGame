import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const names = [
  'Wall of Wonder', 'Whirling Dervish', 'White Mana Battery', 'Willow Satyr',
  'Winds of Change', 'Winter Blast', 'Wolverine Pack', 'Wood Elemental',
  'Xira Arien', 'Zephyr Falcon'
];

assert.equal(names.length, 10);
for (const name of names) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `LEG lot 7 missing: ${name}`);
  assert.ok(card.sets?.includes('LEG'), `${name} missing LEG set membership`);
  assert.ok(['unimplemented', 'functional', 'implemented'].includes(card.effectStatus), `${name} must remain explicitly unimplemented in this data-only lot`);
}

const leg = CARDS.filter(c => c.sets?.includes('LEG'));
assert.equal(leg.length, 310, `Expected the full 310 unique LEG memberships after lot 7, got ${leg.length}`);
assert.equal(new Set(CARDS.map(c => c.name)).size, CARDS.length, 'Duplicate logical card names detected');
assert.deepEqual(CARDS.map(c => c.id), Array.from({length: CARDS.length}, (_, i) => i + 1), 'Card IDs must remain continuous');

console.log(`OK: V12.4 Legends lot 7 (final) — ${leg.length}/310 LEG cards, ${CARDS.length} logical cards. Legends coverage complete.`);
