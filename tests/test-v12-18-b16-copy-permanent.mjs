import assert from 'assert';
import { snapshotCopy } from '../src/core/layers/copy-effects.js';
assert.strictEqual(snapshotCopy(null), null, 'Bug 16: snapshotCopy null retourne null');
console.log('Bug 16 PASS');
