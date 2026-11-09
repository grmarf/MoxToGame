import assert from 'assert';
import fs from 'fs';
const stackCode = fs.readFileSync('./src/core/stack.js', 'utf8');
assert.ok(!stackCode.includes('JSON.parse(JSON.stringify(item.source || {}))'), 'Bug 13: JSON.parse(JSON.stringify) supprimé de pushCopy');
assert.ok(stackCode.includes('deepClone(item.source || {})'), 'Bug 13: deepClone utilisé dans pushCopy');
console.log('Bug 13 PASS');
