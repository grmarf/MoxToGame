import assert from 'assert';
import { ZoneManager } from '../src/core/zone-manager.js';
import { StateBasedActions } from '../src/core/state-based-actions.js';

const state = {
  player: {
    battlefield: [
      { name: 'Bear', type: 'Creature', toughness: 0, damageMarked: 0, uid: 'bear1', objectId: 'obj_bear1', owner: 'player' }
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

const zones = new ZoneManager({ state: () => state });
const sba = new StateBasedActions({ zones });

sba.check(state);

assert.strictEqual(state.player.battlefield.length, 0, 'Le battlefield doit être vide');
assert.strictEqual(state.player.graveyard.length, 1, 'Le cimetière doit contenir 1 carte');
const inGrave = state.player.graveyard[0];
assert.ok(inGrave.zoneHistory, 'zoneHistory doit exister');
assert.ok(Array.isArray(inGrave.zoneHistory), 'zoneHistory doit être un tableau');
assert.strictEqual(inGrave.zoneHistory.length, 1, 'zoneHistory doit avoir 1 entrée');
assert.strictEqual(inGrave.zoneHistory[0].from, 'battlefield', 'from doit être battlefield');
assert.strictEqual(inGrave.zoneHistory[0].to, 'graveyard', 'to doit être graveyard');
assert.ok(inGrave.objectId !== 'obj_bear1', 'L\'objectId doit être nouveau');
assert.ok(inGrave.uid !== 'bear1', 'L\'uid doit être nouveau');
console.log('OK: R-ZONE-01 — changement de zone via SBA génère zoneHistory et nouvelle identité.');
