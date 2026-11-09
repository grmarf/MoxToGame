import assert from 'assert';
import fs from 'fs';
const neCode = fs.readFileSync('./src/core/native-engine.js', 'utf8');
assert.ok(neCode.includes('x.objectId === p?.objectId || x === p'), 'Bug 7: tolérance objectId et référence directe');
console.log('Bug 7 PASS');
