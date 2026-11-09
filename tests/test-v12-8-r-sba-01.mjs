import assert from 'assert';
import { StateBasedActions } from '../src/core/state-based-actions.js';

const mockState = {
  player: {
    battlefield: [
      { name: 'Jace Beleren', type: 'Planeswalker', subtype: 'Jace', uid: 'p1', owner: 'player', toughness: 3, damageMarked: 0 },
      { name: 'Jace, the Mind Sculptor', type: 'Planeswalker', subtype: 'Jace', uid: 'p2', owner: 'player', toughness: 3, damageMarked: 0 },
      { name: 'Karona', type: 'Legendary Creature', uid: 'l1', owner: 'player', toughness: 5, damageMarked: 0 },
      { name: 'Karona', type: 'Legendary Creature', uid: 'l2', owner: 'player', toughness: 5, damageMarked: 0 },
    ],
    graveyard: [],
    hand: [],
    library: [],
    exile: [],
    life: 20,
    mana: {W:0,U:0,B:0,R:0,G:0,C:0},
  },
  ai: {
    battlefield: [],
    graveyard: [],
    hand: [],
    library: [],
    exile: [],
    life: 20,
    mana: {W:0,U:0,B:0,R:0,G:0,C:0},
  },
};

const choices = [];
const choiceService = {
  request: (spec) => {
    choices.push(spec);
    return spec.options[0];
  }
};

const sba = new StateBasedActions({ zones: null, choiceService });
sba.check(mockState);

assert.strictEqual(choices.length, 2, 'Deux choix doivent être sollicités (planeswalker + legende)');
assert.ok(choices.some(c => c.type === 'planeswalker-choose'), 'Choix planeswalker manquant');
assert.ok(choices.some(c => c.type === 'legend-choose'), 'Choix legende manquant');
assert.strictEqual(mockState.player.battlefield.length, 2, 'Deux permanents doivent rester');
assert.strictEqual(mockState.player.graveyard.length, 2, 'Deux permanents doivent être détruits');
console.log('OK: R-SBA-01 — planeswalker + legende demandent un choix au contrôleur.');
