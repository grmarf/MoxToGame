import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
const ids=CARDS.map(c=>c.id), names=CARDS.map(c=>c.name);
assert.equal(new Set(ids).size,ids.length);
assert.deepEqual(ids,Array.from({length:ids.length},(_,i)=>i+1));
assert.equal(new Set(names).size,names.length);
assert.ok(CARDS.every(c=>Array.isArray(c.sets)));
// Note (V12.5): a card MAY legitimately have sets=[] — this marks a card kept
// in the pool that does not belong to any of the project's 6 in-scope
// editions (e.g. Rancor, Flash, generic basic lands). This replaced an
// earlier, stricter assertion once the V12.5 edition audit stripped
// incorrect edition tags from ~60 such cards instead of deleting them.
for(const [name,set] of [['City in a Bottle','ARN'],['Dandân','ARN'],['Eye for an Eye','ARN'],['Artifact Possession','ATQ'],["Urza's Miter",'ATQ']]) assert.ok(CARDS.some(c=>c.name===name&&c.sets.includes(set)),`${name} missing`);
console.log(`OK: V12.3.1 database — ${CARDS.length} logical cards, unique/continuous IDs, no duplicate names.`);
