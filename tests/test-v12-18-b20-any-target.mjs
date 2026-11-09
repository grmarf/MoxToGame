import assert from 'assert';
import fs from 'fs';
const neCode = fs.readFileSync('./src/core/native-engine.js', 'utf8');
assert.ok(neCode.includes("case 'anyTarget':"), 'Bug 20: anyTarget présent');
assert.ok(neCode.includes('...players'), 'Bug 20: anyTarget inclut les joueurs');
console.log('Bug 20 PASS');
