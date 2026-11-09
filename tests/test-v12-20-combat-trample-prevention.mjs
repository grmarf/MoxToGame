// V12.20 — Trample + 2 bloqueurs, l'un a prévention : le surplus est-il correct ?
import { CombatService } from '../src/core/combat.js';

const state = {
  activePlayer: 'player',
  player: {
    battlefield: [
      { uid: 'atk', name: 'Trampler', type: 'Creature', power: 5, toughness: 5, tapped: false, keywords: ['trample'], damageMarked: 0, tempBuffs: [], auraBuffs: [] }
    ],
    life: 20
  },
  ai: {
    battlefield: [
      { uid: 'blk1', name: 'Blocker1', type: 'Creature', power: 1, toughness: 1, tapped: false, keywords: [], damageMarked: 0, tempBuffs: [], auraBuffs: [] },
      { uid: 'blk2', name: 'Blocker2', type: 'Creature', power: 1, toughness: 1, tapped: false, keywords: [], damageMarked: 0, tempBuffs: [], auraBuffs: [] }
    ],
    life: 20,
    prevention: [{ amount: 10, scope: 'any', until: 'nextMatchingDamage' }]
  }
};

const combat = new CombatService({ state: () => state, sba: null, replacements: {
  preventDamage: (side, amount, color, source, meta) => {
    if (meta?.targetType === 'permanent') {
      const shield = state.ai.prevention?.[0];
      if (shield && shield.amount >= amount) {
        shield.amount -= amount;
        return { prevented: amount, remaining: 0 };
      }
    }
    return { prevented: 0, remaining: amount };
  },
  applyDamageToPlayer: (side, amount) => { state[side].life -= amount; },
  replaceDamageLifeLoss: (side, amount) => ({ replaced: false, loss: amount })
} });

combat.begin();
combat.confirmAttackers([state.player.battlefield[0]], 'player');
combat.assignBlockers({ atk: ['blk1', 'blk2'] });
const events = combat.resolveDamage();

const playerDamageEvent = events.find(e => e.type === 'combatDamageToPlayer' && e.excess);
const blk1Damage = events.find(e => e.type === 'combatDamageToCreature' && e.targetId === 'blk1');
const blk2Damage = events.find(e => e.type === 'combatDamageToCreature' && e.targetId === 'blk2');

console.log('Excess trample event:', playerDamageEvent);
console.log('blk1 damage event:', blk1Damage);
console.log('blk2 damage event:', blk2Damage);

// Attaquant 5, 2 bloqueurs 1/1 -> lethal total 2 -> surplus 3
if (!playerDamageEvent || playerDamageEvent.amount !== 3) {
  console.error(`FAIL: surplus trample incorrect (attendu 3)`);
  process.exit(1);
}

console.log(`PASS: trample assigne correctement le surplus indépendamment de la prévention`);
