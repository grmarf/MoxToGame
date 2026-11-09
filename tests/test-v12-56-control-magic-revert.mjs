import assert from 'node:assert/strict';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
installEffects(effects, globalThis); game.connect();
const card = name => CARDS.find(c => c.name === name);
function mana(side){ game.state[side].mana={W:10,U:10,B:10,R:10,G:10,C:10}; }
function setup(){
  game.engine.loadDeck('player',CARDS.filter(c=>c.isBasic)); game.engine.loadDeck('ai',CARDS.filter(c=>c.isBasic));
  game.turnManager.gotoPhase('main1'); game.turnManager.activePlayer='player'; game.state.activePlayer='player'; game.state.priorityHolder='player';
  for(const s of ['player','ai']){ mana(s); game.state[s].battlefield=[]; game.state[s].graveyard=[]; game.state[s].hand=[]; }
}
function resolve(){ while(game.stack.size){ const p=game.state.priorityHolder; game.dispatch('PASS_PRIORITY',{},p); if(game.stack.size){ const q=p==='player'?'ai':'player'; game.dispatch('PASS_PRIORITY',{},q); } } }
function putPermanent(side,p){ game.state[side].battlefield=[p]; }

// 1. Control Magic: aura leaves -> stolen creature returns to owner, identity preserved.
setup();
const bear={uid:'cm_bear',objectId:'cm_bear_obj',name:'Grizzly Bears',type:'Creature',power:2,toughness:2,owner:'ai',controller:'ai',keywords:[],color:['G'],tapped:false,summoningSickness:false,tempBuffs:[]};
putPermanent('ai',bear);
const cm=card('Control Magic'); game.state.player.hand=[cm];
game.dispatch('CAST_SPELL',{card:cm,target:{kind:'permanent',perm:bear,uid:bear.uid}},'player'); resolve();
const stolen=game.state.player.battlefield.find(p=>p.uid==='cm_bear'); const aura=game.state.player.battlefield.find(p=>p.name==='Control Magic');
assert.ok(stolen && aura); assert.equal(stolen.controller,'player'); assert.equal(aura.attachedTo,stolen.uid); assert.equal(aura.controlledPermanentUid,stolen.uid); assert.equal(stolen.controlGrantedByAuraUid,aura.uid);
const disenchant=card('Disenchant'); game.state.player.hand=[disenchant]; game.dispatch('CAST_SPELL',{card:disenchant,target:{kind:'permanent',perm:aura,uid:aura.uid}},'player'); resolve();
const restored=game.state.ai.battlefield.find(p=>p.uid==='cm_bear'); assert.ok(restored); assert.equal(restored.controller,'ai'); assert.equal(restored.objectId,'cm_bear_obj'); assert.equal(game.state.player.battlefield.some(p=>p.uid==='cm_bear'),false);
console.log('OK V12.56.1: Control Magic revert');

// 2. Steal Artifact: aura leaves -> artifact returns to owner.
setup();
const ring={uid:'sa_ring',objectId:'sa_ring_obj',name:"Sol Ring",type:'Artifact',owner:'ai',controller:'ai',keywords:[],color:[],tapped:false}; putPermanent('ai',ring);
const sa=card('Steal Artifact'); game.state.player.hand=[sa]; game.dispatch('CAST_SPELL',{card:sa,target:{kind:'permanent',perm:ring,uid:ring.uid}},'player'); resolve();
const stolenRing=game.state.player.battlefield.find(p=>p.uid==='sa_ring'); const saAura=game.state.player.battlefield.find(p=>p.name==='Steal Artifact'); assert.ok(stolenRing && saAura); assert.equal(stolenRing.controller,'player'); assert.equal(saAura.controlledPermanentUid,stolenRing.uid);
const dis=card('Disenchant'); game.state.player.hand=[dis]; game.dispatch('CAST_SPELL',{card:dis,target:{kind:'permanent',perm:saAura,uid:saAura.uid}},'player'); resolve();
const restoredRing=game.state.ai.battlefield.find(p=>p.uid==='sa_ring'); assert.ok(restoredRing); assert.equal(restoredRing.controller,'ai');
console.log('OK V12.56.2: Steal Artifact revert');

// 3. Existing stealCreatureUntilEnd mechanism remains independent; synthetic dispatch because no base card uses it.
setup();
const bear2={uid:'th_bear',name:'Grizzly Bears',type:'Creature',power:2,toughness:2,owner:'ai',controller:'ai',keywords:[],color:['G'],tapped:false,summoningSickness:false}; putPermanent('ai',bear2);
const synthetic={name:'Threaten-style test',cost:'{R}',cmc:1,color:['R'],type:'Instant',effect:{type:'stealCreatureUntilEnd',target:'creature'},isPermanent:false};
game.state.player.hand=[synthetic]; game.dispatch('CAST_SPELL',{card:synthetic,target:{kind:'permanent',perm:bear2,uid:bear2.uid}},'player'); resolve();
const tempStolen=game.state.player.battlefield.find(p=>p.uid==='th_bear'); assert.ok(tempStolen); assert.equal(tempStolen.controller,'player'); assert.equal(tempStolen.stolenUntilEnd,true); assert.equal(tempStolen.controlGrantedByAuraUid,undefined);
console.log('OK V12.56.3: stealCreatureUntilEnd remains separate');

// 4. Stolen creature destroyed while aura remains -> owner graveyard.
setup();
const bear3={uid:'dead_bear',name:'Grizzly Bears',type:'Creature',power:2,toughness:2,owner:'ai',controller:'ai',keywords:[],color:['G'],tapped:false,summoningSickness:false}; putPermanent('ai',bear3);
const cm2=card('Control Magic'); game.state.player.hand=[cm2]; game.dispatch('CAST_SPELL',{card:cm2,target:{kind:'permanent',perm:bear3,uid:bear3.uid}},'player'); resolve();
const stolen3=game.state.player.battlefield.find(p=>p.uid==='dead_bear'); const aura3=game.state.player.battlefield.find(p=>p.name==='Control Magic');
game.state.player.hand=[card('Terror')]; game.dispatch('CAST_SPELL',{card:card('Terror'),target:{kind:'permanent',perm:stolen3,uid:stolen3.uid}},'player'); resolve();
assert.equal(game.state.player.battlefield.some(p=>p.uid==='dead_bear'),false); assert.ok(game.state.ai.graveyard.some(p=>p.name==='Grizzly Bears')); assert.ok(game.state.player.graveyard.every(p=>p.name!=='Grizzly Bears'));
console.log('OK V12.56.4: stolen creature dies in owner graveyard');

// 5. Combat: while aura remains, stolen creature can attack for new controller.
setup();
const bear4={uid:'atk_bear',name:'Grizzly Bears',type:'Creature',power:2,toughness:2,owner:'ai',controller:'ai',keywords:[],color:['G'],tapped:false,summoningSickness:false}; putPermanent('ai',bear4);
const cm3=card('Control Magic'); game.state.player.hand=[cm3]; game.dispatch('CAST_SPELL',{card:cm3,target:{kind:'permanent',perm:bear4,uid:bear4.uid}},'player'); resolve();
game.turnManager.gotoPhase('declareAttackers'); game.turnManager.activePlayer='player'; game.state.activePlayer='player'; game.state.priorityHolder='player';
const attacking=game.state.player.battlefield.find(p=>p.uid==='atk_bear');
game.dispatch('DECLARE_ATTACKERS',{attackers:[attacking]},'player');
const attackingAfter=game.state.player.battlefield.find(p=>p.uid==='atk_bear'); assert.ok(attackingAfter?.tapped===true && game.combat.combat?.attackers?.some?.(p=>p?.uid==='atk_bear'));
console.log('OK V12.56.5: stolen creature can attack under new controller');
