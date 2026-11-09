import assert from 'assert';
import { CombatService } from '../src/core/combat.js';
import { StateBasedActions } from '../src/core/state-based-actions.js';
import { ZoneManager } from '../src/core/zone-manager.js';

const state = {
  player: {
    battlefield: [],
    graveyard: [], hand: [], library: [], exile: [],
    life: 20, mana: {W:0,U:0,B:0,R:0,G:0,C:0},
  },
  ai: {
    battlefield: [],
    graveyard: [], hand: [], library: [], exile: [],
    life: 20, mana: {W:0,U:0,B:0,R:0,G:0,C:0},
  },
  activePlayer: 'ai',
  phase: 'combatBegin',
  priorityHolder: 'ai',
  turnNumber: 1,
};

const zones = new ZoneManager({ state: () => state });
const sba = new StateBasedActions({ zones });
const combat = new CombatService({ state: () => state, sba });

// ── E1: Menace nécessite 2 bloqueurs ──
const menaceAttacker = { name: 'Menacer', type: 'Creature', power: 3, toughness: 3, uid: 'm1', keywords: ['menace'], summoningSickness: false, tapped: false, cantAttack: false, attacksDisabled: false, controller: 'ai' };
const blocker1 = { name: 'Blocker1', type: 'Creature', power: 1, toughness: 1, uid: 'bl1', summoningSickness: false, tapped: false, cantBlock: false, cantBlockThisTurn: false, controller: 'player' };
const blocker2 = { name: 'Blocker2', type: 'Creature', power: 1, toughness: 1, uid: 'bl2', summoningSickness: false, tapped: false, cantBlock: false, cantBlockThisTurn: false, controller: 'player' };

state.ai.battlefield.push(menaceAttacker);
state.player.battlefield.push(blocker1, blocker2);

combat.begin();
combat.confirmAttackers([menaceAttacker], 'ai');

// Un seul bloqueur sur menace doit lever une erreur
let threw = false;
try { combat.assignBlockers({ m1: ['bl1'] }); } catch (e) { threw = true; }
assert.ok(threw, 'Menace doit exiger au moins 2 bloqueurs');

// Deux bloqueurs doivent être acceptés
combat.assignBlockers({ m1: ['bl1', 'bl2'] });
assert.strictEqual(combat.currentPhase, 'combatDamage', 'Phase doit passer à combatDamage avec 2 bloqueurs');

// ── E2: Unblockable ne peut pas être bloqué ──
combat.end();
combat.begin();
const unblockable = { name: 'Ghost', type: 'Creature', power: 2, toughness: 2, uid: 'g1', keywords: ['unblockable'], summoningSickness: false, tapped: false, cantAttack: false, attacksDisabled: false, controller: 'ai' };
state.ai.battlefield.push(unblockable);
combat.confirmAttackers([unblockable], 'ai');

threw = false;
try { combat.assignBlockers({ g1: ['bl1'] }); } catch (e) { threw = true; }
assert.ok(threw, 'Unblockable ne doit pas pouvoir être bloqué');

console.log('OK: Phase E — menace et unblockable testés.');
