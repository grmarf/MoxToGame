import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const LOT1 = [
  'Abomination','Acid Rain','Active Volcano','Adun Oakenshield',"Adventurers' Guildhouse",
  'Aerathi Berserker','Aisling Leprechaun','Akron Legionnaire',"Al-abara's Carpet",'Alabaster Potion',
  "Alchor's Tomb","All Hallow's Eve",'Amrou Kithkin','Angelic Voices','Angus Mackenzie','Anti-Magic Aura',
  'Arboria','Arcades Sabboth','Arena of the Ancients','Avoid Fate','Axelrod Gunnarson','Ayesha Tanaka',
  'Azure Drake','Backdraft','Backfire','Barbary Apes','Barktooth Warbeard','Bartel Runeaxe','Beasts of Bogardan',
  'Black Mana Battery','Blazing Effigy','Blight','Blood Lust','Blue Mana Battery','Boomerang','Boris Devilboon','Brine Hag',
  'Bronze Horse','Carrion Ants','Cat Warriors','Cathedral of Serra','Caverns of Despair','Chain Lightning',
  'Chains of Mephistopheles','Chromium','Cleanse','Clergy of the Holy Nimbus','Cocoon','Concordant Crossroads','Cosmic Horror'
];

assert.equal(LOT1.length, 50);
assert.equal(new Set(CARDS.map(c => c.name)).size, CARDS.length, 'duplicate logical card names');
assert.deepEqual(CARDS.map(c => c.id), Array.from({length: CARDS.length}, (_, i) => i + 1), 'IDs must be continuous');
const leg = CARDS.filter(c => c.sets?.includes('LEG'));
assert.ok(leg.length >= 50, 'Legends coverage must expose at least 50 LEG memberships');
for (const name of LOT1) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `LEG lot 1 missing: ${name}`);
  assert.ok(card.sets.includes('LEG'), `${name} missing LEG set membership`);
  assert.ok(typeof card.cost === 'string', `${name}: missing cost`);
  assert.ok(typeof card.cmc === 'number', `${name}: missing cmc`);
  assert.ok(typeof card.type === 'string', `${name}: missing type`);
  assert.ok(typeof card.rarity === 'string', `${name}: missing rarity`);
  assert.ok(typeof card.text_fr === 'string', `${name}: missing text_fr`);
}
assert.deepEqual(CARDS.find(c => c.name === 'Amrou Kithkin').sets, ['LEG']);
assert.deepEqual(CARDS.find(c => c.name === 'Blood Lust').sets, ['LEG']);
// V12.5: Chain Lightning previously carried an incorrect extra 'LEB' tag
// (Chain Lightning was never printed in Limited Edition Beta); the V12.5
// edition audit corrected this to its real, sole edition.
assert.deepEqual(CARDS.find(c => c.name === 'Chain Lightning').sets, ['LEG']);
assert.equal(CARDS.find(c => c.name === 'Blood Lust').cost, '{1}{R}');
assert.equal(CARDS.find(c => c.name === 'Blood Lust').cmc, 2);
console.log(`OK: V12.4 Legends lot 1 — ${leg.length}/150 LEG cards, ${CARDS.length} logical cards.`);
