// V12.20 — Une créature qui perd double strike entre les deux salves ne doit pas infliger la deuxième.
import { CombatService } from '../src/core/combat.js';

const state = {
  activePlayer: 'player',
  player: {
    battlefield: [
      { uid: 'ds', name: 'DoubleStriker', type: 'Creature', power: 2, toughness: 2, tapped: false, keywords: ['double strike'], damageMarked: 0, tempBuffs: [], auraBuffs: [] }
    ],
    life: 20
  },
  ai: {
    battlefield: [
      { uid: 'blk', name: 'Blocker', type: 'Creature', power: 0, toughness: 5, tapped: false, keywords: [], damageMarked: 0, tempBuffs: [], auraBuffs: [] }
    ],
    life: 20
  }
};

let sbaCalled = 0;
const sba = {
  check: (st) => {
    sbaCalled++;
    if (sbaCalled === 1) {
      state.player.battlefield[0].keywords = [];
    }
  }
};

const combat = new CombatService({ state: () => state, sba, replacements: null });

combat.begin();
combat.confirmAttackers([state.player.battlefield[0]], 'player');
combat.assignBlockers({ ds: ['blk'] });
const events = combat.resolveDamage();

const hits = events.filter(e => e.type === 'combatDamageToCreature' && e.sourceId === 'ds');
console.log('SBA calls:', sbaCalled);
console.log('Total hits by DoubleStriker:', hits.length, 'amounts:', hits.map(h => h.amount));

// La première salve doit avoir lieu (2 dégâts).
// Après perte de double strike, la deuxième salve ne doit PAS avoir lieu.
if (hits.length > 1) {
  console.error(`BUG: la créature a infligé une deuxième salve après avoir perdu double strike`);
  process.exit(1);
}

console.log(`PASS: créature sans double strike ni first strike n'inflige pas la seconde salve`);
