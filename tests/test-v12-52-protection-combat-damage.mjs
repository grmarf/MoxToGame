// V12.52 — protection re-check at combat-damage application time.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';

function setup() {
  const g = new GameFacade().connect();
  g.state.activePlayer = 'player';
  g.state.phase = 'main1';
  g.state.priorityHolder = 'player';
  g.state.turnNumber = 1;
  g.turnManager.turnNumber = 1;
  g.turnManager.activePlayer = 'player';
  return g;
}

function add(g, side, definition) {
  const p = createPermanent({ uid: `${side}-${definition.name}-${Math.random()}`, ...definition });
  p.controller = side;
  p.owner = side;
  p.summoningSickness = false;
  p.damageMarked = 0;
  g.state[side].battlefield.push(p);
  return p;
}

// 1. A blocker legally declares first, then gains protection before combat damage.
// Protection must be re-checked when damage is actually applied.
{
  const g = setup();
  const attacker = add(g, 'player', { name: 'Red Attacker', type: 'Creature', isCreature: true, power: 2, toughness: 2, color: ['R'], keywords: [] });
  const blocker = add(g, 'ai', { name: 'Protection Bear', type: 'Creature', isCreature: true, power: 2, toughness: 2, color: ['G'], keywords: [] });

  g.combat.begin();
  g.combat.confirmAttackers([attacker], 'player');
  g.combat.assignBlockers({ [attacker.uid]: [blocker.uid] });
  assert.equal(g.combat.combat.blockers[attacker.uid][0].uid, blocker.uid);

  // Protection is gained after blocker declaration, so #canBlock cannot be
  // the mechanism that makes this damage disappear.
  blocker.keywords.push('protectionRed');
  assert.equal(blocker.damageMarked, 0);
  const events = g.combat.resolveDamage();

  assert.equal(blocker.damageMarked, 0, 'protection prevents combat damage after blockers are declared');
  assert.ok(events.some(e => e.type === 'combatDamagePrevented' && e.targetId === undefined), 'a prevention event is emitted for the protected blocker');
}

// 2. No protection: the same real combat path still marks damage normally.
{
  const g = setup();
  const attacker = add(g, 'player', { name: 'Red Attacker', type: 'Creature', isCreature: true, power: 2, toughness: 2, color: ['R'], keywords: [] });
  const blocker = add(g, 'ai', { name: 'Normal Bear', type: 'Creature', isCreature: true, power: 2, toughness: 2, color: ['G'], keywords: [] });

  g.combat.begin();
  g.combat.confirmAttackers([attacker], 'player');
  g.combat.assignBlockers({ [attacker.uid]: [blocker.uid] });
  const events = g.combat.resolveDamage();

  assert.equal(blocker.damageMarked, 2, 'unprotected blocker still receives combat damage');
  assert.ok(events.some(e => e.type === 'combatDamageToCreature' && e.targetId === blocker.uid && e.amount === 2));
}

// 3. The canonical non-combat permanent-damage path also respects protection.
{
  const g = setup();
  const target = add(g, 'ai', { name: 'Protected Target', type: 'Creature', isCreature: true, power: 2, toughness: 2, color: ['G'], keywords: ['protectionRed'] });
  const source = { uid: 'red-source', name: 'Red Source', type: 'Creature', color: ['R'] };
  const result = g.replacements.applyDamageToPermanent(target, 2, { color: 'R', source, meta: { effect: 'test-noncombat' } });
  assert.equal(result.amount, 0);
  assert.equal(target.damageMarked, 0, 'canonical non-combat permanent damage also respects protection');
}

// 4. Attack legality remains the existing responsibility of CombatService.
{
  const g = setup();
  const attacker = add(g, 'player', { name: 'Fresh Creature', type: 'Creature', isCreature: true, power: 2, toughness: 2, color: ['R'], keywords: [] });
  attacker.summoningSickness = true;
  g.combat.begin();
  g.combat.confirmAttackers([attacker], 'player');
  assert.equal(g.combat.combat.attackers.length, 0, 'summoning-sick creature still cannot attack');
}

console.log('OK V12.52: protection re-checkée au moment des dégâts de combat + non-combat + non-régression attaque.');
