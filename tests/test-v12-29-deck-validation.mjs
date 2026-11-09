import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { isCardPlayable } from '../src/core/card-playability.js';
import { validateDeck } from '../src/core/deck-builder.js';

const plains = CARDS.find(c => c.name === 'Plains' && isCardPlayable(c));
const playable = CARDS.find(c => isCardPlayable(c) && !c.isBasic);
const unplayable = CARDS.find(c => !isCardPlayable(c));
assert.ok(plains, 'A playable Plains fixture is required');
assert.ok(playable, 'A playable non-basic fixture is required');
assert.ok(unplayable, 'An unplayable fixture is required');

const validDeck = Array.from({ length: 40 }, (_, i) => i % 5 === 0 ? { ...playable } : { ...plains });
let result = validateDeck(validDeck);
assert.equal(result.valid, true);
assert.deepEqual(result.errors, []);
assert.equal(result.size, 40);

result = validateDeck(Array.from({ length: 39 }, () => ({ ...plains })));
assert.equal(result.valid, false);
assert.match(result.errors[0], /au moins 40/);

result = validateDeck(Array.from({ length: 61 }, () => ({ ...plains })));
assert.equal(result.valid, false);
assert.match(result.errors[0], /plus de 60/);

result = validateDeck([...validDeck.slice(0, 39), { ...unplayable }]);
assert.equal(result.valid, false);
assert.equal(result.unplayable, 1);
assert.ok(result.errors.some(e => /pas.*certifiées jouables/.test(e)));

result = validateDeck([...validDeck.slice(0, 39), null]);
assert.equal(result.valid, false);
assert.equal(result.invalidReferences, 1);
assert.equal(result.unplayable, 1);

result = validateDeck(Array.from({ length: 40 }, () => ({ ...plains })), { minSize: 40, maxSize: 60 });
assert.equal(result.valid, true);

console.log('OK: V12.29 deck validation enforces the playable startup boundary.');
