import assert from 'node:assert/strict';
import { CombatService } from '../src/core/combat.js';
import CARDS from '../src/data/cards-database.js';

// Goblin War Drums (texte réel, vérifié sur la carte : « Each creature you control
// cannot be blocked by only one creature. ») = menace pour TOUTES les créatures que
// vous contrôlez. L'ancienne donnée accordait « piétinement » aux seuls Gobelins,
// ce qui contredisait le texte.

const drums = CARDS.find(c => c.name === 'Goblin War Drums');
assert.equal(drums.effectStatus, 'implemented');
const perm = (side) => ({ ...structuredClone(drums), uid: `drums_${side}`, controller: side, owner: side, type: 'Enchantment' });
const creature = (uid, side, subtype = 'Bear') => ({ uid, name: uid, type: 'Creature', subtype, power: 2, toughness: 2, keywords: [], tapped: false, summoningSickness: false, damageMarked: 0, auraBuffs: [], tempBuffs: [], tempKeywords: [], controller: side, owner: side });
const attack = (state, attackers, side, blocks) => {
  const combat = new CombatService({ state: () => state });
  combat.begin();
  combat.confirmAttackers(attackers, side);
  return () => combat.assignBlockers(blocks);
};

// 1) Créature NON gobeline du contrôleur : un seul bloqueur est refusé, deux sont acceptés.
{
  const att = creature('att', 'ai');
  const mk = () => ({ activePlayer: 'ai', player: { battlefield: [creature('b1', 'player'), creature('b2', 'player')], life: 20 }, ai: { battlefield: [att, perm('ai')], life: 20 } });
  assert.throws(attack(mk(), [att], 'ai', { att: ['b1'] }), /au moins deux créatures/, 'Goblin War Drums : un seul bloqueur doit être refusé (créature non gobeline incluse).');
  const s2 = mk(); const a2 = s2.ai.battlefield[0];
  assert.doesNotThrow(attack(s2, [a2], 'ai', { att: ['b1', 'b2'] }), 'deux bloqueurs doivent être acceptés.');
  console.log('OK V12.76.114.1: menace accordée à une créature non gobeline (un bloqueur refusé, deux acceptés).');
}

// 2) Les créatures de l'ADVERSAIRE du contrôleur n'en profitent pas.
{
  const att = creature('att', 'player');
  const state = { activePlayer: 'player', player: { battlefield: [att], life: 20 }, ai: { battlefield: [creature('b1', 'ai'), perm('ai')], life: 20 } };
  assert.doesNotThrow(attack(state, [att], 'player', { att: ['b1'] }), 'les créatures adverses ne doivent pas avoir la menace.');
  console.log("OK V12.76.114.2: les créatures de l'adversaire ne reçoivent pas la menace.");
}
