import assert from 'assert';
import fs from 'fs';
const neCode = fs.readFileSync('./src/core/native-engine.js', 'utf8');
assert.ok(neCode.includes("Cible joueur invalide"), 'Bug 12: validation side joueur présente');
console.log('Bug 12 PASS');
