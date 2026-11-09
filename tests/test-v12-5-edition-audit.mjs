import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

// V12.5 — audit complet des 6 éditions contre des checklists officielles
// (EchoMTG). Verrouille les corrections effectuées : retagging des cartes
// mal étiquetées, suppression du doublon Dandan/Dandân, et absence de tags
// d'édition sur les cartes hors périmètre (ex: Rancor, Flash, Millstone
// avant correction, etc.).

// Cartes qui étaient incorrectement taguées LEB alors qu'elles appartiennent
// à une autre des 6 éditions du projet — doivent maintenant porter le bon tag
// et ne plus porter LEB.
const RETAGGED = {
  'Ball Lightning': 'DRK', 'Chain Lightning': 'LEG', 'Dancing Scimitar': 'ARN',
  'Detonate': 'ATQ', 'Erg Raiders': 'ARN', 'Erhnam Djinn': 'ARN',
  'Hurkyl\'s Recall': 'ATQ', 'Ivory Tower': 'ATQ', 'Kird Ape': 'ARN',
  'Millstone': 'ATQ', 'Orcish Spy': 'FEM', 'Sage of Lat-Nam': 'ATQ',
  'Serendib Efreet': 'ARN', 'Su-Chi': 'ATQ', 'The Rack': 'ATQ',
  'Titania\'s Song': 'ATQ', 'Word of Binding': 'DRK',
};
for (const [name, correctSet] of Object.entries(RETAGGED)) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `${name} should still exist in the database`);
  assert.ok(card.sets?.includes(correctSet), `${name} should be tagged ${correctSet}`);
  assert.ok(!card.sets?.includes('LEB'), `${name} should no longer carry the incorrect LEB tag`);
}

// Cartes réellement hors du périmètre des 6 éditions du projet — ne doivent
// porter aucun des 6 tags d'édition (le tag LEB erroné a été retiré, la carte
// elle-même est conservée).
const OUT_OF_SCOPE = ['Rancor', 'Flash', 'Grove of the Burnwillows', 'Pox', 'Forest', 'Island', 'Mountain', 'Plains', 'Swamp'];
const SIX_SETS = ['LEB', 'ARN', 'LEG', 'DRK', 'FEM', 'ATQ'];
for (const name of OUT_OF_SCOPE) {
  const card = CARDS.find(c => c.name === name);
  if (card) {
    const hasSixTag = (card.sets || []).some(s => SIX_SETS.includes(s));
    assert.equal(hasSixTag, false, `${name} should not carry any of the 6 in-scope edition tags`);
  }
}

// Le doublon Dandan/Dandân (V12.3.1) est résolu : une seule entrée, avec le
// nom officiellement accentué.
const dandanEntries = CARDS.filter(c => c.name === 'Dandan' || c.name === 'Dandân');
assert.equal(dandanEntries.length, 1, 'Dandan/Dandân duplicate must be merged into a single entry');
assert.equal(dandanEntries[0].name, 'Dandân', 'Canonical name should use the official accented spelling');

assert.equal(new Set(CARDS.map(c => c.name)).size, CARDS.length, 'Duplicate logical card names detected');
assert.deepEqual(CARDS.map(c => c.id), Array.from({length: CARDS.length}, (_, i) => i + 1), 'Card IDs must remain continuous');

console.log(`OK: V12.5 edition audit — ${CARDS.length} logical cards, retagging and dedup verified.`);
