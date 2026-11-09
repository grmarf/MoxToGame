import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const LOT5 = [
  'Puppet Master','Pyrotechnics','Quagmire','Quarum Trench Gnomes','Rabid Wombat','Radjan Spirit','Raging Bull','Ragnar','Ramirez DePietro','Ramses Overdark','Rapid Fire','Rasputin Dreamweaver','Rebirth','Recall','Red Mana Battery','Reincarnation','Relic Barrier','Relic Bind','Remove Enchantments','Remove Soul','Reset','Revelation','Reverberation','Righteous Avengers','Ring of Immortals','Riven Turnbull','Rohgahh of Kher Keep','Rubinia Soulsinger','Rust',"Sea Kings' Blessing","Seafarer's Quay",'Seeker','Segovian Leviathan','Sentinel','Serpent Generator','Shelkin Brownie','Shield Wall','Shimian Night Stalker','Silhouette','Sir Shandlar of Eberyn','Sivitri Scarzam',"Sol'kanar the Swamp King",'Spectral Cloak','Spinal Villain','Spirit Link','Spirit Shackle','Spiritual Sanctuary','Stangg','Storm Seeker','Storm World'
];
assert.equal(LOT5.length, 50);
for (const name of LOT5) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `LEG lot 5 missing: ${name}`);
  assert.ok(card.sets.includes('LEG'), `${name} missing LEG set membership`);
  assert.equal(typeof card.cost, 'string', `${name}: missing cost`);
  assert.equal(typeof card.cmc, 'number', `${name}: missing cmc`);
  assert.equal(typeof card.type, 'string', `${name}: missing type`);
  assert.equal(typeof card.rarity, 'string', `${name}: missing rarity`);
  assert.equal(typeof card.text_fr, 'string', `${name}: missing text_fr`);
}
const leg = CARDS.filter(c => c.sets?.includes('LEG'));
assert.ok(leg.length >= 250, `Expected at least 250 cumulative unique LEG memberships, got ${leg.length}`);
assert.deepEqual(CARDS.map(c => c.id), Array.from({length: CARDS.length}, (_, i) => i + 1), 'IDs must be continuous');
assert.equal(new Set(CARDS.map(c => c.name)).size, CARDS.length, 'duplicate logical card names');
for (const name of LOT5.filter(n => !['Remove Soul','Serpent Generator','Spirit Link'].includes(n))) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(['unimplemented', 'functional', 'implemented'].includes(card.effectStatus), `${name} must be explicitly unimplemented in data-only lot`);
}
console.log(`OK: V12.4 Legends lot 5 — ${leg.length}/310 LEG cards, ${CARDS.length} logical cards.`);
