import assert from 'assert';
import { CombatService } from '../src/core/combat.js';
import { StateBasedActions } from '../src/core/state-based-actions.js';

function makeState() {
  return {
    player: {
      battlefield: [], graveyard: [], hand: [], library: [], exile: [],
      life: 20, mana: {W:0,U:0,B:0,R:0,G:0,C:0},
    },
    ai: {
      battlefield: [], graveyard: [], hand: [], library: [], exile: [],
      life: 20, mana: {W:0,U:0,B:0,R:0,G:0,C:0},
    },
    activePlayer: 'ai',
    phase: 'combatBegin',
    priorityHolder: 'ai',
    turnNumber: 1,
  };
}

const sba = new StateBasedActions({ zones: null });

// --- R-TEST-01b-1 : mustBeBlocked = « doit être bloquée par TOUTES les créatures qui peuvent » ---
// V12.75 : règle corrigée selon le texte de Blaze of Glory (« doit être bloquée par toutes »). L'ancienne version
// de ce test affirmait qu'un attaquant `mustBeBlocked` ne pouvait être bloqué QUE par une créature `mustBlock`
// (stub #isMandatoryBlocker), ce qui rendait Blaze of Glory inutilisable : plus aucune créature ordinaire ne
// pouvait bloquer, et le contrôle « toutes doivent bloquer » restait vide. Le drapeau n'interdit jamais un
// blocage : il OBLIGE chaque créature capable de bloquer à le faire.
// SCÉNARIO A : un bloqueur ordinaire peut (et doit) bloquer ; avec deux bloqueurs capables, un seul est refusé.
{
  const mk = (uid, side) => ({ name: uid, type: 'Creature', power: 1, toughness: 1, uid, keywords: [], summoningSickness: false, tapped: false, cantBlock: false, cantBlockThisTurn: false, controller: side });
  const attacker = () => ({ name: 'Giant', type: 'Creature', power: 5, toughness: 5, uid: 'g1', mustBeBlocked: true, summoningSickness: false, tapped: false, cantAttack: false, attacksDisabled: false, controller: 'ai' });
  { // un seul bloqueur capable : accepté
    const state = makeState(); const combat = new CombatService({ state: () => state, sba });
    state.ai.battlefield.push(attacker()); state.player.battlefield.push(mk('s1', 'player'));
    combat.begin(); combat.confirmAttackers([state.ai.battlefield[0]], 'ai'); combat.assignBlockers({ g1: ['s1'] });
    assert.strictEqual(combat.currentPhase, 'combatDamage', 'un bloqueur ordinaire peut bloquer un attaquant mustBeBlocked');
  }
  { // deux bloqueurs capables, un seul déclaré : refusé
    const state = makeState(); const combat = new CombatService({ state: () => state, sba });
    state.ai.battlefield.push(attacker()); state.player.battlefield.push(mk('s1', 'player'), mk('s2', 'player'));
    combat.begin(); combat.confirmAttackers([state.ai.battlefield[0]], 'ai');
    assert.throws(() => combat.assignBlockers({ g1: ['s1'] }), /toutes les créatures/, 'deux créatures peuvent bloquer : les deux doivent le faire');
    combat.assignBlockers({ g1: ['s1', 's2'] });
    assert.strictEqual(combat.currentPhase, 'combatDamage', 'les deux bloqueurs déclarés : accepté');
  }
  { // un bloqueur engagé n'est pas « capable » : il n'est pas requis
    const state = makeState(); const combat = new CombatService({ state: () => state, sba });
    state.ai.battlefield.push(attacker()); state.player.battlefield.push(mk('s1', 'player'), { ...mk('s2', 'player'), tapped: true });
    combat.begin(); combat.confirmAttackers([state.ai.battlefield[0]], 'ai'); combat.assignBlockers({ g1: ['s1'] });
    assert.strictEqual(combat.currentPhase, 'combatDamage', 'le bloqueur engagé n\'est pas requis');
  }
}

// SCÉNARIO B : un SEUL bloqueur avec mustBlock sur le champ de bataille.
// Ce bloqueur doit être accepté.
{
  const state = makeState();
  const combat = new CombatService({ state: () => state, sba });
  const mustBeBlocked = {
    name: 'Giant', type: 'Creature', power: 5, toughness: 5, uid: 'g1',
    mustBeBlocked: true, summoningSickness: false, tapped: false,
    cantAttack: false, attacksDisabled: false, controller: 'ai'
  };
  const mandatoryBlocker = {
    name: 'Defender', type: 'Creature', power: 2, toughness: 4, uid: 'd1',
    keywords: ['mustBlock'], summoningSickness: false, tapped: false,
    cantBlock: false, cantBlockThisTurn: false, controller: 'player'
  };

  state.ai.battlefield.push(mustBeBlocked);
  state.player.battlefield.push(mandatoryBlocker);

  combat.begin();
  combat.confirmAttackers([mustBeBlocked], 'ai');
  combat.assignBlockers({ g1: ['d1'] });
  assert.strictEqual(combat.currentPhase, 'combatDamage', 'mustBlock doit pouvoir bloquer mustBeBlocked');
}

// --- R-TEST-01b-2 : protection multiple couleurs ---
// V12.75 : règle corrigée (702.16, « B » de DEBT). La protection de l'ATTAQUANT
// interdit à une créature de cette couleur de le bloquer ; la protection d'un
// BLOQUEUR ne l'empêche jamais de bloquer (elle lui évite seulement les
// blessures de cette couleur). L'ancienne version de ce test affirmait
// l'inverse (un bloqueur « protectionW » ne pouvait pas bloquer une source
// blanche), ce qui était la règle lue à l'envers.
const mkCreature = (uid, side, color, keywords = []) => ({
  name: uid, type: 'Creature', power: 2, toughness: 3, uid, color, keywords,
  summoningSickness: false, tapped: false, cantAttack: false, attacksDisabled: false,
  cantBlock: false, cantBlockThisTurn: false, controller: side,
});
{
  // Attaquant protégé contre le blanc et le bleu.
  const state = makeState();
  const combat = new CombatService({ state: () => state, sba });
  const paladin = mkCreature('p1', 'ai', ['R'], ['protectionW', 'protectionU']);
  const whiteBlocker = mkCreature('w1', 'player', ['W']);
  const blueBlocker = mkCreature('u1', 'player', ['U']);
  const redBlocker = mkCreature('r1', 'player', ['R']);
  state.ai.battlefield.push(paladin);
  state.player.battlefield.push(whiteBlocker, blueBlocker, redBlocker);

  combat.begin();
  combat.confirmAttackers([paladin], 'ai');
  assert.throws(() => combat.assignBlockers({ p1: ['w1'] }), 'un attaquant protectionW ne peut pas être bloqué par une créature blanche');

  paladin.tapped = false; // l'attaque précédente l'a engagé
  combat.begin();
  combat.confirmAttackers([paladin], 'ai');
  assert.throws(() => combat.assignBlockers({ p1: ['u1'] }), 'un attaquant protectionU ne peut pas être bloqué par une créature bleue');

  paladin.tapped = false;
  combat.begin();
  combat.confirmAttackers([paladin], 'ai');
  combat.assignBlockers({ p1: ['r1'] });
  assert.strictEqual(combat.currentPhase, 'combatDamage', 'Sans protection rouge, le blocage par une créature rouge est autorisé');
}
{
  // Bloqueur protégé : il PEUT bloquer une source de la couleur dont il est protégé.
  const state = makeState();
  const combat = new CombatService({ state: () => state, sba });
  const paladin = mkCreature('p2', 'player', ['R'], ['protectionW', 'protectionU']);
  const whiteAttacker = mkCreature('c1', 'ai', ['W']);
  state.player.battlefield.push(paladin);
  state.ai.battlefield.push(whiteAttacker);
  combat.begin();
  combat.confirmAttackers([whiteAttacker], 'ai');
  combat.assignBlockers({ c1: ['p2'] });
  assert.strictEqual(combat.currentPhase, 'combatDamage', 'un bloqueur protectionW peut bloquer une créature blanche');
}

console.log('OK: R-TEST-01b — mustBeBlocked/isMandatoryBlocker + protection multiple couleurs.');
