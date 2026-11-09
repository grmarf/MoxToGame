import assert from 'node:assert/strict';
import { findTargetByKey, targetKey } from '../src/ui/target-selection.js';

const permanent = { kind: 'permanent', uid: 'perm-42', name: 'Grizzly Bears' };
const player = { kind: 'player', side: 'player', id: 'player' };
const ai = { kind: 'player', side: 'ai', id: 'ai' };
const stackItem = { kind: 'stackItem', id: 'stack-7', name: 'Lightning Bolt' };

assert.equal(targetKey(permanent), 'permanent:perm-42');
assert.equal(targetKey(player), 'player:player');
assert.equal(targetKey(ai), 'player:ai');
assert.equal(targetKey(stackItem), 'stack:stack-7');

const freshPermanent = { kind: 'permanent', uid: 'perm-42', name: 'Grizzly Bears', damageMarked: 2 };
const targets = [freshPermanent, ai, stackItem];
assert.strictEqual(findTargetByKey(targets, 'permanent:perm-42'), freshPermanent);
assert.strictEqual(findTargetByKey(targets, 'player:ai'), ai);
assert.strictEqual(findTargetByKey(targets, 'stack:stack-7'), stackItem);
assert.equal(findTargetByKey(targets, 'permanent:missing'), null);

console.log('V12.30 targeting helpers: PASS');
