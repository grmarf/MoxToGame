import assert from 'assert';
import fs from 'fs';
const combatCode = fs.readFileSync('./src/core/combat.js', 'utf8');
assert.ok(!combatCode.includes('battlefield.includes(attacker)'), 'Bug 6: includes(attacker) supprimé');
assert.ok(!combatCode.includes('battlefield.includes(blocker)'), 'Bug 6: includes(blocker) supprimé');
assert.ok(combatCode.includes('p.uid === attacker.uid'), 'Bug 6: comparaison par uid présente');
assert.ok(combatCode.includes('p.uid === blocker.uid'), 'Bug 6: comparaison par uid présente');
console.log('Bug 6 PASS');
