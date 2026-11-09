import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// R-613-02: a continuous copy with except:['power'] must not overwrite the
// copiable power. The stored copy snapshot represents a 5/5 creature, while
// the copier itself is a 2/2. The exception must preserve 2 power.
const target = {
  uid: 'copy-target', name: 'Copier', controller: 'player',
  type: 'Creature', subtype: 'Bear', color: ['G'],
  power: 2, toughness: 2, keywords: [], abilities: [],
  copyValues: {
    name: 'Copied Golem', type: 'Artifact Creature', subtype: 'Golem',
    color: ['U'], power: 5, toughness: 5, keywords: ['flying'], abilities: []
  },
  copyExcept: ['power']
};

const state = { player: { battlefield: [target] }, ai: { battlefield: [] } };
const c = calculateCharacteristics(state, target);

if (c.power !== 2) {
  throw new Error(`R-613-02 reproduced: copyExcept:['power'] was ignored; expected power 2, got ${c.power}`);
}
if (c.toughness !== 5 || c.type !== 'Artifact Creature' || c.subtype !== 'Golem') {
  throw new Error(`R-613-02 copy baseline unexpectedly wrong: ${JSON.stringify(c)}`);
}

console.log('OK: R-613-02 copyExcept preserves the copier power.');
