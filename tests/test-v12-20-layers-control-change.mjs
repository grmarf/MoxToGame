// V12.20 — Un effet continu relit-il dynamiquement le contrôleur après Control Magic ?
import { applyContinuousEffects, calculateCharacteristics } from '../src/core/continuous-effects.js';

const state = {
  player: { battlefield: [], life: 20 },
  ai: { battlefield: [], life: 20 }
};

const lord = { uid: 'lord', name: 'Zombie Lord', type: 'Creature', subtype: 'Zombie', controller: 'player', owner: 'player', power: 2, toughness: 2, keywords: [], static: { type: 'anthem', filterSubtype: 'Zombie', power: 1, toughness: 1, controllerFilter: 'you' } };
const zombie = { uid: 'zom', name: 'Zombie', type: 'Creature', subtype: 'Zombie', controller: 'player', owner: 'player', power: 1, toughness: 1, keywords: [], auraBuffs: [], tempBuffs: [] };

state.player.battlefield.push(lord, zombie);

applyContinuousEffects(state);
const pt1 = calculateCharacteristics(state, zombie);
console.log('PT avant changement:', pt1.power, pt1.toughness);
if (pt1.power !== 2 || pt1.toughness !== 2) {
  console.error(`FAIL: buff initial absent`);
  process.exit(1);
}

// Control Magic — le lord passe sous contrôle AI
lord.controller = 'ai';
state.ai.battlefield.push(lord);
state.player.battlefield = state.player.battlefield.filter(p => p.uid !== 'lord');

applyContinuousEffects(state);
const pt2 = calculateCharacteristics(state, zombie);
console.log('PT après changement:', pt2.power, pt2.toughness);

if (pt2.power !== 1 || pt2.toughness !== 1) {
  console.error(`BUG: l'effet anthem reste figé sur l'ancien contrôleur`);
  process.exit(1);
}

console.log(`PASS: l'effet continu relit le contrôleur dynamiquement`);
