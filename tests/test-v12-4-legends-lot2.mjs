import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const LOT2 = ['Craw Giant', 'Crevasse', 'Crimson Kobolds', 'Crimson Manticore', 'Crookshank Kobolds', 'Cyclopean Mummy', "D'Avenant Archer", 'Dakkon Blackblade', 'Darkness', 'Deadfall', 'Demonic Torment', 'Devouring Deep', 'Disharmony', 'Divine Intervention', 'Divine Offering', 'Divine Transformation', 'Dream Coat', 'Durkwood Boars', 'Dwarven Song', 'Elder Land Wurm', 'Elder Spawn', 'Elven Riders', 'Emerald Dragonfly', 'Enchanted Being', 'Enchantment Alteration', 'Energy Tap', 'Equinox', 'Eternal Warrior', 'Eureka', 'Evil Eye of Orms-by-Gore', 'Fallen Angel', 'Falling Star', 'Feint', 'Field of Dreams', 'Fire Sprites', 'Firestorm Phoenix', 'Flash Counter', 'Flash Flood', 'Floral Spuzzem', 'Force Spike', 'Forethought Amulet', 'Fortified Area', 'Frost Giant', 'Gabriel Angelfire', 'Gaseous Form', 'Gauntlets of Chaos', 'Ghosts of the Damned', 'Giant Slug', 'Giant Strength', 'Giant Turtle'];
assert.equal(LOT2.length, 50);
assert.equal(new Set(CARDS.map(c => c.name)).size, CARDS.length, 'duplicate logical card names');
assert.deepEqual(CARDS.map(c => c.id), Array.from({length: CARDS.length}, (_, i) => i + 1), 'IDs must be continuous');
const leg = CARDS.filter(c => c.sets?.includes('LEG'));
assert.ok(leg.length >= 100, 'Legends coverage must expose at least 100 LEG memberships');
for (const name of LOT2) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `LEG lot 2 missing: ${name}`);
  assert.ok(card.sets.includes('LEG'), `${name} missing LEG set membership`);
  if (card.id >= 707) assert.ok(['unimplemented', 'functional', 'implemented'].includes(card.effectStatus));
}
console.log(`OK: V12.4 Legends lot 2 — ${leg.length}/150 LEG cards, ${CARDS.length} logical cards.`);
