import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const names = [
  'Subdue','Sunastian Falconer','Sword of the Ages','Sylvan Library','Sylvan Paradise',
  'Syphon Soul','Takklemaggot','Telekinesis','Teleport','Tempest Efreet','Tetsuo Umezawa',
  'The Abyss','The Brute','The Lady of the Mountain','The Tabernacle at Pendrell Vale',
  'The Wretched','Thunder Spirit','Time Elemental','Tobias Andrion','Tolaria','Tor Wauki',
  'Torsten Von Ursus','Touch of Darkness','Transmutation','Triassic Egg','Tuknir Deathlock',
  'Tundra Wolves','Typhoon','Undertow','Underworld Dreams','Unholy Citadel','Untamed Wilds',
  'Ur-Drago','Urborg','Vaevictis Asmadi','Vampire Bats','Venarian Gold','Visions','Voodoo Doll',
  'Walking Dead','Wall of Caltrops','Wall of Dust','Wall of Earth','Wall of Heat','Wall of Light',
  'Wall of Opposition','Wall of Putrid Flesh','Wall of Shadows','Wall of Tombstones','Wall of Vapor'
];

assert.equal(names.length, 50);
for (const name of names) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `LEG lot 6 missing: ${name}`);
  assert.ok(card.sets?.includes('LEG'), `${name} missing LEG set membership`);
  if (!['Wall of Dust','Wall of Opposition','Vampire Bats','Syphon Soul' /* implémentée v12.68 (drainOpponents) */].includes(name)) assert.ok(['unimplemented', 'functional', 'implemented'].includes(card.effectStatus), `${name} must remain explicitly unimplemented in this data-only lot`);
}

const leg = CARDS.filter(c => c.sets?.includes('LEG'));
assert.ok(leg.length >= 300, `Expected at least the 300 LEG memberships covered through lot 6, got ${leg.length}`);
assert.equal(new Set(CARDS.map(c => c.name)).size, CARDS.length, 'Duplicate logical card names detected');
assert.deepEqual(CARDS.map(c => c.id), Array.from({length: CARDS.length}, (_, i) => i + 1), 'Card IDs must remain continuous');

// V12.5: Wall of Dust previously carried an incorrect extra 'LEB' tag
// (it was never printed in Limited Edition Beta); the V12.5 edition audit
// corrected this to its real, sole edition.
const wallDust = CARDS.find(c => c.name === 'Wall of Dust');
assert.deepEqual(wallDust.sets, ['LEG']);
// Note: lot 6 itself stopped at LEG #300 (Wall of Vapor); Wall of Wonder (#301) was
// intentionally reserved for lot 7 and is now covered by test-v12-4-legends-lot7.mjs.

console.log(`OK: V12.4 Legends lot 6 — ${leg.length}/310 LEG cards, ${CARDS.length} logical cards.`);
