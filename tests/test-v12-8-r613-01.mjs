import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// R-613-01: same-layer dependency must run A before B.
// A changes the target's color to red (layer 5).
// B changes the target's color to blue, but only when the target is red (layer 5).
// Battlefield order deliberately puts B before A so the dependency graph must
// override the incidental collection order.
const target = {
  uid: 'target', name: 'Target', controller: 'player',
  type: 'Creature', subtype: 'Bear', color: ['G'],
  power: 2, toughness: 2, keywords: [], abilities: []
};

const sourceB = {
  uid: 'B', name: 'BlueIfRed', controller: 'player',
  static: { type: 'changeColor', color: 'U', filterColor: 'R', controllerFilter: 'any' }
};

const sourceA = {
  uid: 'A', name: 'MakeRed', controller: 'player',
  static: { type: 'changeColor', color: 'R', controllerFilter: 'any' }
};

const state = {
  player: { battlefield: [target, sourceB, sourceA] },
  ai: { battlefield: [] }
};

const c = calculateCharacteristics(state, target);
if (c.color.length !== 1 || c.color[0] !== 'U') {
  throw new Error(`R-613-01 reproduced: expected final color U after A -> B, got ${JSON.stringify(c.color)}`);
}

console.log('OK: R-613-01 same-layer color dependency resolves A before B.');
