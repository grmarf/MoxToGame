import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => CARDS.find(c => c.name === name);
const setup = () => {
  const game = new GameFacade().connect();
  game.state.phase = 'main1';
  game.state.priorityHolder = 'player';
  game.state.activePlayer = 'player';
  game.state.player.mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  return game;
};
const add = (g, name, side = 'player') => {
  const p = createPermanent(card(name));
  p.controller = side;
  p.owner = side;
  // Batch 2 predates the explicit 302.6 enforcement; its fixtures model
  // established permanents so tests focus on their individual effects.
  p.summoningSickness = false;
  g.state[side].battlefield.push(p);
  return p;
};
const resolve = g => g.dispatch('resolveStack', {}, 'player');
const activate = (g, p, abilityIndex = 0, target = null) => {
  g.action('activateAbility', { permanent: p, controller: 'player', abilityIndex, target });
  resolve(g);
};
const noMana = g => { g.state.player.mana = {W:0,U:0,B:0,R:0,G:0,C:0}; };
const assertNoMana = (g,p,i=0) => { noMana(g); assert.throws(() => g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:i})); };
const destroy = (g,p) => { const s={name:'Test Destroy',type:'Instant',effect:{type:'destroy'},sets:[]}; g.stack.pushSpell(s,'player',{kind:'permanent',uid:p.uid}); g.stack.resolveTop(); };

// 1 Drudge-like self-regeneration is deliberately NOT implemented here:
// the existing regenerateShield handler requires an explicit target and the
// activation model has no implicit-self target. This batch therefore stays
// within effects that resolve correctly through the existing API.

// 1 Dragon Engine
{
  const g=setup(), p=add(g,'Dragon Engine'); g.state.player.mana.C=2; activate(g,p);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:0}); assertNoMana(g,p);
}
// 2 Carrion Ants
{
  const g=setup(), p=add(g,'Carrion Ants'); g.state.player.mana.C=1; activate(g,p);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:1}); assertNoMana(g,p);
}
// 3 Goblin Flotilla
{
  const g=setup(), p=add(g,'Goblin Flotilla'); assert.ok(p.keywords.includes('islandwalk'));
  g.state.player.mana.R=1; activate(g,p); assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:1}); assertNoMana(g,p);
}
// 4 Flying Carpet
{
  const g=setup(), p=add(g,'Flying Carpet'), t=add(g,'Grizzly Bears'); g.state.player.mana.C=2;
  activate(g,p,0,{kind:'permanent',uid:t.uid}); assert.equal(p.tapped,true); assert.ok(t.tempKeywords.includes('flying'));
  assert.throws(()=>g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0,target:{kind:'permanent',uid:t.uid}}));
}
// 5 Staff of Zegon
{
  const g=setup(), p=add(g,'Staff of Zegon'), t=add(g,'Grizzly Bears'); g.state.player.mana.C=3;
  activate(g,p,0,{kind:'permanent',uid:t.uid}); assert.equal(p.tapped,true,'{T} dans le coût'); assert.equal(t.tapped,false,'Oracle : -2/-0, la cible n\'est PAS engagée'); assert.ok(t.tempBuffs.some((b)=>b.power===-2&&b.toughness===0),'-2/-0 jusqu\'à la fin du tour'); assertNoMana(g,p);
}
// 6 Fountain of Youth
{
  const g=setup(), p=add(g,'Fountain of Youth'), before=g.state.player.life; g.state.player.mana.C=2;
  activate(g,p); assert.equal(g.state.player.life,before+1); assert.equal(p.tapped,true);
  assert.throws(()=>g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0}));
}
// 7 Order of Leitbur — first strike
{
  const g=setup(), p=add(g,'Order of Leitbur'); g.state.player.mana.W=1; activate(g,p,0);
  assert.ok(p.tempKeywords.includes('first strike')); assertNoMana(g,p,0);
}
// 8 Order of Leitbur — +1/+0
{
  const g=setup(), p=add(g,'Order of Leitbur'); g.state.player.mana.W=2; activate(g,p,1);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:0}); assertNoMana(g,p,1);
}
// 9 Order of the Ebon Hand — first strike
{
  const g=setup(), p=add(g,'Order of the Ebon Hand'); g.state.player.mana.B=1; activate(g,p,0);
  assert.ok(p.tempKeywords.includes('first strike')); assertNoMana(g,p,0);
}
// 10 Order of the Ebon Hand — +1/+0
{
  const g=setup(), p=add(g,'Order of the Ebon Hand'); g.state.player.mana.B=2; activate(g,p,1);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:0}); assertNoMana(g,p,1);
}
// 11 Wall of Opposition
{
  const g=setup(), p=add(g,'Wall of Opposition'); g.state.player.mana.C=1; activate(g,p);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:0}); assertNoMana(g,p);
}
// 12 Killer Bees
{
  const g=setup(), p=add(g,'Killer Bees'); g.state.player.mana.G=1; activate(g,p);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:1}); assertNoMana(g,p);
}
// 13 Tracker — Oracle : {G}{G},{T} : dégâts égaux à sa force à la cible, qui lui rend des dégâts égaux à SA force
{
  const g=setup(), p=add(g,'Tracker'), t=add(g,'Grizzly Bears'); g.state.player.mana.G=2;
  activate(g,p,0,{kind:'permanent',uid:t.uid}); assert.equal(t.damageMarked,2,'Tracker (force 2) blesse la cible de 2'); assert.equal(p.damageMarked,2,'la cible (force 2) blesse Tracker de 2'); assert.equal(p.tapped,true); assertNoMana(g,p);
}
// 14 Pavel Maliki
{
  const g=setup(), p=add(g,'Pavel Maliki'); g.state.player.mana.B=1; g.state.player.mana.R=1; activate(g,p);
  assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:0}); assertNoMana(g,p);
}
// 15 Nettling Imp — real must-attack flag
{
  const g=setup(), p=add(g,'Nettling Imp'), t=add(g,'Grizzly Bears','ai');
  // V12.76 (G30) : Oracle = « {T} : … Ne l'activez que pendant un tour adverse, avant la déclaration des attaquants » (plus de coût de mana) ; détail dans test-v12-141.
  g.state.activePlayer='ai'; g.turnManager.activePlayer='ai'; g.turnManager.gotoPhase('main1'); g.state.phase='main1'; g.state.priorityHolder='player';
  activate(g,p,0,{kind:'permanent',uid:t.uid}); assert.equal(t.mustAttack,true); assert.equal(p.tapped,true); assertNoMana(g,p);
}
// 16 Wyluli Wolf — target creature gets +1/+1.
{
  const g=setup(), p=add(g,'Wyluli Wolf'), t=add(g,'Grizzly Bears');
  g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0,target:{kind:'permanent',uid:t.uid}}); resolve(g);
  assert.deepEqual(t.tempBuffs.at(-1),{power:1,toughness:1}); assert.equal(p.tapped,true);
}
// 17 Ghosts of the Damned — target creature gets -1/-0.
{
  const g=setup(), p=add(g,'Ghosts of the Damned'), t=add(g,'Grizzly Bears');
  g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0,target:{kind:'permanent',uid:t.uid}}); resolve(g);
  assert.deepEqual(t.tempBuffs.at(-1),{power:-1,toughness:0}); assert.equal(p.tapped,true);
}
// 17 Crimson Manticore — valid attacking/blocking creature target; source taps
{
  const g=setup(), p=add(g,'Crimson Manticore'), t=add(g,'Grizzly Bears','ai');
  t.summoningSickness=false;
  g.state.activePlayer='ai'; g.turnManager.activePlayer='ai';
  g.combat.confirmAttackers([t], 'ai');
  g.state.priorityHolder='player';
  g.state.player.mana.R=1;
  activate(g,p,0,{kind:'permanent',uid:t.uid}); assert.equal(t.damageMarked,1); assert.equal(p.tapped,true);
  noMana(g); assert.throws(()=>g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0,target:{kind:'permanent',uid:t.uid}}));
}

// Database assertions: all 15 cards are certified and use only existing effects.
for (const n of ['Dragon Engine','Carrion Ants','Goblin Flotilla','Flying Carpet','Staff of Zegon','Fountain of Youth','Order of Leitbur','Order of the Ebon Hand','Wall of Opposition','Killer Bees','Tracker','Pavel Maliki','Nettling Imp','Wyluli Wolf','Ghosts of the Damned','Crimson Manticore']) {
  assert.equal(card(n).effectStatus,'implemented',`${n} must be certified`);
}
console.log('OK V12.46: batch 2 — 16 cartes certifiées, 18 capacités testées E2E, cas limites inclus.');
