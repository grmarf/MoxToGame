import assert from 'assert';
import { rngClock } from '../src/core/rng-clock-service.js';

// --- Test déterministe avec graine fixe ---
rngClock.configure({ seed: 42, useLogicalClock: true });

const deck = [{name:'A'},{name:'B'},{name:'C'},{name:'D'},{name:'E'}];
const shuffled1 = rngClock.shuffle(deck);
const ids1 = [
  rngClock.uuid('obj'),
  rngClock.uuid('perm'),
  rngClock.now(),
];

// Réinitialiser avec la même graine
rngClock.configure({ seed: 42, useLogicalClock: true });
const shuffled2 = rngClock.shuffle([...deck]);
const ids2 = [
  rngClock.uuid('obj'),
  rngClock.uuid('perm'),
  rngClock.now(),
];

assert.deepStrictEqual(
  shuffled1.map(c => c.name),
  shuffled2.map(c => c.name),
  'Même graine doit produire le même mélange'
);
assert.deepStrictEqual(ids1, ids2, 'Même graine doit produire les mêmes UUIDs et timestamps');

// --- Test non-déterministe par défaut ---
rngClock.configure({ seed: null, useLogicalClock: false });
const shuffled3 = rngClock.shuffle([...deck]);
const id3 = rngClock.uuid('obj');
const now3 = rngClock.now();

// On ne peut pas tester la non-déterminisme de façon sûre sans risque de flaky test,
// mais on vérifie que le service est bien revenu au mode par défaut
assert.strictEqual(rngClock._seed, null, 'Par défaut seed doit être null');
assert.strictEqual(rngClock._useLogicalClock, false, 'Par défaut useLogicalClock doit être false');
assert.ok(now3 > 1700000000000, 'Date.now() doit retourner un timestamp réaliste');

console.log('OK: R-DET-01 — RNG/Clock déterministe avec graine fixe, non-déterministe par défaut.');
