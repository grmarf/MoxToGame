import assert from 'assert';
import fs from 'fs';

// Vérifier que reverseDamage est dans replacement (gagnant) et pas dans extended
const replCode = fs.readFileSync('./src/core/effects/replacement-card-effects.js', 'utf8');
const extCode = fs.readFileSync('./src/core/effects/extended-effects.js', 'utf8');

assert.ok(replCode.includes("reg('reverseDamage'"), 'P1: reverseDamage doit être dans replacement');
assert.ok(!extCode.includes("reg('reverseDamage'"), 'P1: reverseDamage ne doit plus être dans extended');
console.log('P1 reverseDamage PASS');
