// V12.25 — Câblage Desertwalk + RampageN.
import { CombatService } from '../src/core/combat.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import { clearUntilCleanup } from '../src/core/turn/turn-rules.js';

function creature({ uid, name, side, power = 2, toughness = 2, keywords = [] }) {
  return {
    uid, name, type: 'Creature', power, toughness, keywords,
    tapped: false, summoningSickness: false, damageMarked: 0,
    auraBuffs: [], tempBuffs: [], tempKeywords: [],
    controller: side, owner: side
  };
}

function land(uid, subtype, side) {
  return { uid, name: subtype, type: 'Land', subtype, controller: side, owner: side };
}

// --- Phase A: Desertwalk ---
{
  const desertNomads = creature({ uid: 'desert-nomads', name: 'Desert Nomads', side: 'player', keywords: ['desertwalk'] });
  const blocker = creature({ uid: 'desert-blocker', name: 'Blocker', side: 'ai' });
  const desert = land('desert', 'Desert', 'ai');
  const state = {
    activePlayer: 'player',
    player: { battlefield: [desertNomads], life: 20 },
    ai: { battlefield: [blocker, desert], life: 20 }
  };
  const combat = new CombatService({ state: () => state });
  combat.begin();
  combat.confirmAttackers([desertNomads], 'player');

  let rejected = false;
  try { combat.assignBlockers({ 'desert-nomads': ['desert-blocker'] }); }
  catch (e) { rejected = /Blocage illégal/.test(e.message); }
  if (!rejected) {
    console.error('FAIL: Desert Nomads devrait être imblocable par un contrôleur de Desert.');
    process.exit(1);
  }
  console.log('PASS: Desertwalk interdit le blocage lorsqu’un Desert est contrôlé.');
}

// --- Phase B: Rampage N — one blocker => no bonus ---
{
  const attacker = creature({ uid: 'rampage-1', name: 'Rampage Creature', side: 'player', power: 2, toughness: 2, keywords: ['rampage2'] });
  const blocker = creature({ uid: 'blocker-1', name: 'Blocker', side: 'ai', power: 1, toughness: 4 });
  const state = {
    activePlayer: 'player',
    player: { battlefield: [attacker], life: 20 },
    ai: { battlefield: [blocker], life: 20 }
  };
  const combat = new CombatService({ state: () => state });
  combat.begin();
  combat.confirmAttackers([attacker], 'player');
  combat.assignBlockers({ 'rampage-1': ['blocker-1'] });

  const pt = calculateCharacteristics(state, attacker);
  if (pt.power !== 2 || pt.toughness !== 2 || attacker.tempBuffs.length !== 0) {
    console.error(`FAIL: rampage2 avec 1 bloqueur ne doit donner aucun bonus (PT=${pt.power}/${pt.toughness}).`);
    process.exit(1);
  }
  console.log('PASS: rampage2 avec un seul bloqueur ne donne aucun bonus.');
}

// --- Phase B: Rampage N — three blockers => +4/+4 ---
{
  const attacker = creature({ uid: 'rampage-3', name: 'Rampage Creature', side: 'player', power: 2, toughness: 2, keywords: ['rampage2'] });
  const blockers = [1, 2, 3].map(i => creature({ uid: `blocker-${i}`, name: `Blocker ${i}`, side: 'ai', power: 0, toughness: 5 }));
  const state = {
    activePlayer: 'player',
    player: { battlefield: [attacker], life: 20 },
    ai: { battlefield: blockers, life: 20 }
  };
  const combat = new CombatService({ state: () => state });
  combat.begin();
  combat.confirmAttackers([attacker], 'player');
  combat.assignBlockers({ 'rampage-3': blockers.map(b => b.uid) });

  const pt = calculateCharacteristics(state, attacker);
  if (pt.power !== 6 || pt.toughness !== 6) {
    console.error(`FAIL: rampage2 avec 3 bloqueurs devrait donner +4/+4 (PT=6/6, obtenu ${pt.power}/${pt.toughness}).`);
    process.exit(1);
  }
  if (attacker.tempBuffs.length !== 1 || attacker.tempBuffs[0].power !== 4 || attacker.tempBuffs[0].toughness !== 4) {
    console.error(`FAIL: bonus rampage attendu {power:4,toughness:4}, obtenu ${JSON.stringify(attacker.tempBuffs)}.`);
    process.exit(1);
  }
  console.log('PASS: rampage2 avec trois bloqueurs donne +4/+4.');

  // --- Fin du tour : le bonus temporaire doit disparaître ---
  clearUntilCleanup(state.player);
  const ptNextTurn = calculateCharacteristics(state, attacker);
  if (attacker.tempBuffs.length !== 0 || ptNextTurn.power !== 2 || ptNextTurn.toughness !== 2) {
    console.error(`FAIL: le bonus de rampage ne disparaît pas au cleanup (PT=${ptNextTurn.power}/${ptNextTurn.toughness}, buffs=${JSON.stringify(attacker.tempBuffs)}).`);
    process.exit(1);
  }
  console.log('PASS: le bonus de rampage disparaît au cleanup de fin de tour.');
}

console.log('V12.25 rampage/desertwalk: PASS');
