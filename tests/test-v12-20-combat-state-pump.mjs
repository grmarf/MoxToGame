// V12.20 — Fix architectural : l'état de combat est exposé à la pile
// et pumpAttacking ne cible que les créatures réellement attaquantes.
import { GameFacade } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';

if (!effects.has('damage')) installEffects(effects, typeof window !== 'undefined' ? window : globalThis);

const facade = new GameFacade();
facade.connect();
const state = facade.state;

// 3 créatures player, 1 créature AI
const c1 = { uid: 'c1', objectId: 'c1', name: 'Goblin A', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', tapped: false, keywords: [], tempBuffs: [], auraBuffs: [], damageMarked: 0 };
const c2 = { uid: 'c2', objectId: 'c2', name: 'Goblin B', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', tapped: false, keywords: [], tempBuffs: [], auraBuffs: [], damageMarked: 0 };
const c3 = { uid: 'c3', objectId: 'c3', name: 'Goblin C', type: 'Creature', power: 2, toughness: 2, owner: 'player', controller: 'player', tapped: false, keywords: [], tempBuffs: [], auraBuffs: [], damageMarked: 0 };
state.player.battlefield.push(c1, c2, c3);

const ai1 = { uid: 'a1', objectId: 'a1', name: 'AI Goblin', type: 'Creature', power: 1, toughness: 1, owner: 'ai', controller: 'ai', tapped: false, keywords: [], tempBuffs: [], auraBuffs: [], damageMarked: 0 };
state.ai.battlefield.push(ai1);

// Déclarer un vrai combat : c1 et c2 attaquent, c3 reste à l'arrière
facade.combat.begin();
facade.combat.confirmAttackers([c1, c2], 'player');

const warriorsCharge = {
  id: 230,
  name: "Warrior's Charge",
  cost: "{1}{R}",
  cmc: 2,
  color: ["R"],
  type: "Sorcery",
  effect: { type: 'pumpAttacking', power: 1, toughness: 0 }
};

facade.stack.pushSpell(warriorsCharge, 'player', null, 0);
facade.stack.resolveTop();

console.log('stack.combat exists:', !!facade.stack.combat);
console.log('stack.combat.combat exists:', !!(facade.stack.combat && facade.stack.combat.combat));
console.log('stack.combat.combat.attackers:', facade.stack.combat?.combat?.attackers?.map(a=>a.uid));
console.log('effects.has(pumpAttacking):', facade.stack.effects.has('pumpAttacking'));
const hasBuff = (p) => (p.tempBuffs || []).some(b => b.power === 1 && b.untilEndOfTurn);
const results = {
  c1_attacking: hasBuff(c1),
  c2_attacking: hasBuff(c2),
  c3_non_attacking: hasBuff(c3),
  ai1_opponent: hasBuff(ai1),
};

console.log('Results:', results);

if (!results.c1_attacking || !results.c2_attacking) {
  console.error(`FAIL: les créatures attaquantes n'ont pas reçu le buff`);
  process.exit(1);
}
if (results.c3_non_attacking) {
  console.error(`FAIL: une créature non attaquante a reçu le buff`);
  process.exit(1);
}
if (results.ai1_opponent) {
  console.error(`FAIL: une créature adverse a reçu le buff`);
  process.exit(1);
}

console.log(`PASS: pumpAttacking cible uniquement les attaquants du combat courant`);
