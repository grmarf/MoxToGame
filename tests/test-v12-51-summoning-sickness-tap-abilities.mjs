import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => CARDS.find(c => c.name === name);
const setup = () => {
  const g = new GameFacade().connect();
  g.turnManager.gotoPhase('main1');
  g.turnManager.activePlayer = 'player';
  g.state.phase = 'main1';
  g.state.activePlayer = 'player';
  g.state.priorityHolder = 'player';
  g.state.turnNumber = 1;
  g.turnManager.turnNumber = 1;
  g.state.player.mana = {W:20,U:20,B:20,R:20,G:20,C:20};
  g.state.ai.mana = {W:20,U:20,B:20,R:20,G:20,C:20};
  return g;
};
const add = (g, definition, side='player') => {
  const p = createPermanent({...definition});
  p.controller = side;
  p.owner = side;
  p.enteredTurn = g.turnManager.turnNumber;
  g.state[side].battlefield.push(p);
  return p;
};
const activate = (g, p, i=0) => g.dispatch('ACTIVATE_ABILITY', { permanent:p, abilityIndex:i }, 'player');

// 1. A summoning-sick creature with a real {T} mana ability cannot activate it.
{
  const g = setup();
  const p = add(g, {
    name:'Test Mana Creature', type:'Creature', isCreature:true, power:1, toughness:1, color:['G'],
    tapAbility:{produces:'G'}
  });
  assert.equal(p.summoningSickness, true);
  assert.throws(() => activate(g,p), /Capacité activée illégale\./);
  assert.equal(p.tapped, false);
  assert.equal(g.state.player.mana.G, 20);
}

// 2. After the creature's controller gets the next turn, cleanup has removed sickness.
{
  const g = setup();
  const p = add(g, {
    name:'Test Mana Creature', type:'Creature', isCreature:true, power:1, toughness:1, color:['G'],
    tapAbility:{produces:'G'}
  });
  // Exercise the existing cleanup hook, then advance through the opponent's
  // turn until this creature's controller gets priority again.
  p.enteredTurn = 0;
  g.turnManager.gotoPhase('cleanup');
  g.turnManager.runPhase();
  assert.equal(p.summoningSickness, false);
  g.turnManager.gotoPhase('endStep');
  g.turnManager.phaseStarted = true;
  g.state.phase = 'endStep';
  g.turnManager.nextPhase();
  g.turnManager.advanceAutomaticPhases();
  assert.equal(g.turnManager.activePlayer, 'ai');
  g.turnManager.gotoPhase('endStep');
  g.turnManager.phaseStarted = true;
  g.state.phase = 'endStep';
  g.turnManager.nextPhase();
  g.turnManager.advanceAutomaticPhases();
  assert.equal(g.turnManager.activePlayer, 'player');
  g.state.player.mana.G = 20;
  g.state.priorityHolder = 'player';
  activate(g,p);
  assert.equal(p.tapped, true);
  assert.equal(g.state.player.mana.G, 21);
}

// 3. A creature with printed haste may activate immediately.
{
  const g = setup();
  const p = add(g, {
    name:'Hasty Mana Creature', type:'Creature', isCreature:true, color:['R'],
    keywords:['haste'], tapAbility:{produces:'R'}
  });
  assert.equal(p.summoningSickness, false);
  activate(g,p);
  assert.equal(p.tapped, true);
  assert.equal(g.state.player.mana.R, 21);
}

// 4. Temporary haste granted by a continuous effect is recognized by effectiveKeywords.
{
  const g = setup();
  const p = add(g, {
    name:'Temporarily Hasty Mana Creature', type:'Creature', isCreature:true, color:['G'],
    tapAbility:{produces:'G'}
  });
  const hasteSource = add(g, {
    name:'Synthetic Haste Source', type:'Enchantment', isPermanent:true,
    static:{type:'addKeyword', keyword:'haste', onlyCreatures:true}
  });
  assert.equal(p.summoningSickness, true);
  assert.ok(g.engine.getAbilityOptions(p,'player').length >= 1, 'la capacité devient légale grâce à la hâte effective');
  activate(g,p);
  assert.equal(p.tapped, true);
  assert.equal(g.state.player.mana.G, 21);
  assert.ok(hasteSource);
}

// 5. A land's {T} mana ability remains legal despite entering this turn.
{
  const g = setup();
  const p = add(g, card('Forest'));
  assert.equal(p.summoningSickness, false);
  g.action('tapMana', {permanent:p, controller:'player', color:'G'});
  assert.equal(p.tapped, true);
  assert.equal(g.state.player.mana.G, 21);
}

// 6. Attack legality remains unchanged: a summoning-sick creature still cannot attack.
{
  const g = setup();
  const p = add(g, {
    name:'Test Attacker', type:'Creature', isCreature:true, power:2, toughness:2,
    color:['G']
  });
  assert.equal(p.summoningSickness, true);
  g.dispatch('DECLARE_ATTACKERS', {attackers:[p]}, 'player');
  assert.equal(g.combat.combat.attackers.length, 0);
  assert.equal(p.tapped, false);
}

console.log('OK V12.51: maladie d’invocation — {T} créature, reset, haste, haste effective, terrains et attaque non-régressés.');
