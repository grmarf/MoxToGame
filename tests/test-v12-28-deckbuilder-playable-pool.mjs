import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { isCardPlayable } from '../src/core/card-playability.js';
import { getPlayableCards, buildRandomPlayableDeck } from '../src/core/deck-builder.js';

const playable = getPlayableCards(CARDS);
assert.ok(playable.length > 0, 'The certified playable pool must not be empty');
assert.ok(playable.every(isCardPlayable), 'Playable pool must contain only certified cards');
assert.equal(playable.length, CARDS.filter(isCardPlayable).length, 'Playable pool must match the central predicate');

const randomDeck = buildRandomPlayableDeck(CARDS, { size: 60, basicCount: 24, rng: () => 0 });
assert.equal(randomDeck.length, 60, 'Random deck must contain exactly 60 cards');
assert.equal(randomDeck.filter(c => c.isBasic).length, 24, 'Random deck must contain the guaranteed 24 basic lands');
assert.ok(randomDeck.every(isCardPlayable), 'Random deck must contain only playable cards');
assert.ok(randomDeck.slice(24).every(c => !c.isBasic), 'Random deck filler must be non-basic playable cards');

const unplayable = CARDS.find(c => !isCardPlayable(c));
assert.ok(unplayable, 'Regression fixture requires an unplayable card');
const filtered = getPlayableCards([unplayable, CARDS.find(isCardPlayable)]);
assert.equal(filtered.length, 1, 'Unplayable cards must be excluded from deckbuilder pool');
assert.equal(filtered[0], CARDS.find(isCardPlayable));

assert.throws(
  () => buildRandomPlayableDeck([CARDS.find(c => c.isBasic && isCardPlayable(c))], { size: 2, basicCount: 1, rng: () => 0 }),
  /Aucune carte non-terrain jouable/,
  'Random deck must fail explicitly when the playable non-basic pool is empty'
);

console.log('OK: V12.28 deckbuilder uses only the certified playable pool.');
