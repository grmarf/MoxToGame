// V12.64 — protection must use the source's effective Layer-5 color.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import { effectiveTypes } from '../src/core/continuous-effects.js';

function setup(protectionKeyword) {
  const g = new GameFacade().connect();
  g.state.activePlayer = 'player';
  g.state.phase = 'main1';
  g.state.priorityHolder = 'player';
  g.state.turnNumber = 1;
  g.turnManager.turnNumber = 1;
  g.turnManager.activePlayer = 'player';

  const attacker = createPermanent({
    uid: 'attacker', name: 'Red Attacker', type: 'Creature', isCreature: true,
    power: 2, toughness: 2, color: ['R'], keywords: [], controller: 'player', owner: 'player'
  });
  attacker.summoningSickness = false;
  attacker.damageMarked = 0;

  const colorChanger = createPermanent({
    uid: 'changer', name: 'Layer 5 Color Changer', type: 'Enchantment',
    static: { type: 'changeColor', color: 'U', controllerFilter: 'any' },
    controller: 'player', owner: 'player'
  });

  const blocker = createPermanent({
    uid: 'blocker', name: 'Protection Creature', type: 'Creature', isCreature: true,
    power: 2, toughness: 2, color: ['G'], keywords: [],
    controller: 'ai', owner: 'ai'
  });
  blocker.summoningSickness = false;
  blocker.damageMarked = 0;

  g.state.player.battlefield = [attacker, colorChanger];
  g.state.ai.battlefield = [blocker];
  return { g, attacker, blocker, colorChanger, protectionKeyword };
}

// 1. Static red source becomes effectively blue in Layer 5. Protection from
// blue must therefore prevent its combat damage.
{
  const { g, attacker, blocker, protectionKeyword } = setup('protectionBlue');
  assert.deepEqual(effectiveTypes(g.state, attacker).color, ['U']);

  g.combat.begin();
  g.combat.confirmAttackers([attacker], 'player');
  g.combat.assignBlockers({ [attacker.uid]: [blocker.uid] });
  blocker.keywords.push(protectionKeyword);
  const events = g.combat.resolveDamage();

  assert.equal(blocker.damageMarked, 0, 'protection from effective blue must prevent damage');
  assert.ok(events.some(e => e.type === 'combatDamagePrevented'), 'prevention event expected');
}

// 2. Protection from the printed/static red color must NOT prevent damage once
// the source is effectively blue.
{
  const { g, attacker, blocker, protectionKeyword } = setup('protectionRed');
  assert.deepEqual(effectiveTypes(g.state, attacker).color, ['U']);

  g.combat.begin();
  g.combat.confirmAttackers([attacker], 'player');
  g.combat.assignBlockers({ [attacker.uid]: [blocker.uid] });
  blocker.keywords.push(protectionKeyword);
  g.combat.resolveDamage();

  assert.equal(blocker.damageMarked, 2, 'protection from stale printed red must not prevent blue damage');
}

// 3. The canonical permanent-damage path uses the same effective source color.
{
  const { g, attacker, blocker, protectionKeyword } = setup('protectionBlue');
  blocker.keywords.push(protectionKeyword);
  const result = g.replacements.applyDamageToPermanent(blocker, 2, {
    source: attacker,
    meta: { effect: 'test-effective-source-color' }
  });
  assert.equal(result.amount, 0, 'effective blue protection must prevent canonical permanent damage');
  assert.equal(blocker.damageMarked, 0);
}

console.log('OK V12.64: effective source color respected by combat and canonical permanent damage.');
