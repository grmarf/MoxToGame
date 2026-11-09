import assert from 'assert';
import fs from 'fs';

// Vérifier que fling est dans complex-effects.js (gagnant) et pas dans extended
const complexCode = fs.readFileSync('./src/core/effects/complex-effects.js', 'utf8');
const extCode = fs.readFileSync('./src/core/effects/extended-effects.js', 'utf8');

assert.ok(complexCode.includes("reg('fling'"), 'P1: fling doit être dans complex-effects.js');
assert.ok(!extCode.includes("reg('fling'"), 'P1: fling ne doit plus être dans extended (doublon supprimé)');
assert.ok(complexCode.includes('calculateCharacteristics'), 'P1: fling complex doit utiliser calculateCharacteristics');
console.log('P1 fling PASS');
