import assert from 'node:assert/strict';
import { CombatService } from '../src/core/combat.js';

// BUG D (audit v12.66) : combat.js#hasKeyword déléguait à hasKeyword(p,k) de
// keywords.js, qui ne lit que p.keywords/p.tempKeywords sans jamais recevoir
// `state` -- donc aveugle à un mot-clé accordé par une Aura ou un effet
// statique. #canBlock utilisait déjà #keywords(p) (state-aware, via
// effectiveKeywords/calculateCharacteristics) pour vol/portée/etc., mais
// vigilance/menace/piétinement passaient par #hasKeyword, incohérent avec
// le reste du moteur. Ce test vérifie vigilance ET menace accordées
// uniquement par une Aura (pas de mot-clé natif sur la créature).

function creature({ uid, name, side, power = 2, toughness = 2, keywords = [] }) {
  return {
    uid, name, type: 'Creature', power, toughness, keywords,
    tapped: false, summoningSickness: false, damageMarked: 0,
    auraBuffs: [], tempBuffs: [], tempKeywords: [],
    controller: side, owner: side,
  };
}
function auraGranting(uid, attachedTo, side, keyword) {
  return { uid, name: `Aura ${keyword}`, type: 'Enchantment — Aura', controller: side, owner: side, isAura: true, attachedTo, auraEffect: { type: 'addKeyword', keyword } };
}

// 1) Vigilance accordée par Aura -- l'attaquant ne doit PAS s'engager.
{
  const attacker = creature({ uid: 'att_vig', name: 'Attaquant enchanté', side: 'player' });
  const aura = auraGranting('aura_vig', 'att_vig', 'player', 'vigilance');
  const state = {
    activePlayer: 'player',
    player: { battlefield: [attacker, aura], life: 20 },
    ai: { battlefield: [], life: 20 },
  };
  const combat = new CombatService({ state: () => state });
  combat.begin();
  combat.confirmAttackers([attacker], 'player');
  assert.equal(attacker.tapped, false, "BUG D : une créature avec vigilance accordée par une Aura ne doit pas s'engager en attaquant.");
  console.log('OK V12.69.1: vigilance accordée par Aura respectée par confirmAttackers (combat.js).');
}

// 2) Menace accordée par Aura -- un seul bloqueur doit être refusé.
{
  const attacker = creature({ uid: 'att_menace', name: 'Attaquant menaçant', side: 'ai' });
  const aura = auraGranting('aura_menace', 'att_menace', 'ai', 'menace');
  const blocker = creature({ uid: 'blk1', name: 'Bloqueur solo', side: 'player' });
  const state = {
    activePlayer: 'ai',
    player: { battlefield: [blocker], life: 20 },
    ai: { battlefield: [attacker, aura], life: 20 },
  };
  const combat = new CombatService({ state: () => state });
  combat.begin();
  combat.confirmAttackers([attacker], 'ai');
  assert.throws(
    () => combat.assignBlockers({ att_menace: ['blk1'] }),
    /au moins deux créatures/,
    'BUG D : la menace accordée par une Aura doit exiger au moins deux bloqueurs.'
  );
  console.log('OK V12.69.2: menace accordée par Aura respectée par assignBlockers (combat.js).');
}
