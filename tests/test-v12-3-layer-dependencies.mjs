import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// Scenario: inferred dependency.
// A changes target to Artifact (Layer 4).
// B gives +1/+1 to Artifacts (Layer 7), with NO explicit dependsOn.
// Without inference, B applies before A -> target is not Artifact yet -> no buff.
// With inference, A applies before B -> target becomes Artifact -> gets buff.

const target = {
  uid: 't1', objectId: 'ot1', name: 'Bear', type: 'Creature', subtype: 'Bear',
  color: ['G'], power: 2, toughness: 2, keywords: [], abilities: []
};

const sourceA = {
  uid: 'a', name: 'TypeChanger', controller: 'player',
  static: { type: 'changeType', newType: 'Artifact Creature', controllerFilter: 'any' }
};

const sourceB = {
  uid: 'b', name: 'ArtifactAnthem', controller: 'player',
  static: { type: 'anthem', power: 1, toughness: 1, filterType: 'Artifact', controllerFilter: 'any' }
  // NO explicit dependsOn
};

const state = {
  player: { battlefield: [target, sourceA, sourceB] },
  ai: { battlefield: [] }
};

const c = calculateCharacteristics(state, target);
if (c.type !== 'Artifact Creature') throw new Error(`Layer 4 failed: ${c.type}`);
if (c.power !== 3) throw new Error(`Inferred dependency failed: expected power 3 (2+1), got ${c.power}. ` +
  `If you see 2, the engine did not infer that the anthem depends on the type change.`);

console.log('OK: V12.3 layer dependencies inferred from real characteristics.');
