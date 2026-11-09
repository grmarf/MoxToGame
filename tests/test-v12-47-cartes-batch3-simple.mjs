import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';
const card=n=>CARDS.find(c=>c.name===n);
const setup=()=>{const g=new GameFacade().connect();g.turnManager.gotoPhase('main1');g.turnManager.activePlayer='player';g.state.phase='main1';g.state.priorityHolder='player';g.state.activePlayer='player';g.state.player.mana={W:20,U:20,B:20,R:20,G:20,C:20};g.state.ai.mana={W:20,U:20,B:20,R:20,G:20,C:20};return g};
const add=(g,n,side='player',extra={})=>{const p=createPermanent({...card(n),...extra});p.controller=side;p.owner=side;g.state[side].battlefield.push(p);return p};
const resolve=g=>g.dispatch('resolveStack',{},'player');
const cast=(g,n,target=null,xValue=0)=>{const c=card(n);g.state.player.hand=[c];g.dispatch('CAST_SPELL',{card:c,target,xValue},'player');resolve(g);};
const activate=(g,p,i=0,target=null)=>{g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:i,target});resolve(g)};
// 1 Death Ward
{const g=setup(),t=add(g,'Grizzly Bears','ai');cast(g,'Death Ward',{kind:'permanent',uid:t.uid});assert.equal(t.regenShield,true);assert.equal(g.state.player.mana.W,19);}
// 2 Psionic Blast
{const g=setup(),t=add(g,'Grizzly Bears','ai');const before=g.state.ai.life;cast(g,'Psionic Blast',{kind:'player',side:'ai'});assert.equal(g.state.ai.life,before-4);assert.equal(g.state.player.life,18);/* v12.73 : 2 blessures à soi, pas de gain */}
// 3 Stream of Life targets opponent, not silently self
{const g=setup();g.state.player.life=10;g.state.ai.life=10;g.state.player.hand=[card('Stream of Life')];g.dispatch('CAST_SPELL',{card:card('Stream of Life'),controller:'player',target:{kind:'player',side:'ai'},xValue:5});resolve(g);assert.equal(g.state.ai.life,15);assert.equal(g.state.player.life,10);}
// 4 Flashfires only Plains
{const g=setup();add(g,'Plains','ai');add(g,'Island','ai');cast(g,'Flashfires');assert.equal(g.state.ai.battlefield.filter(p=>p.name==='Plains').length,0);assert.equal(g.state.ai.battlefield.filter(p=>p.name==='Island').length,1);}
// 5 Stone Rain target land
{const g=setup(),t=add(g,'Forest','ai');cast(g,'Stone Rain',{kind:'permanent',uid:t.uid});assert.equal(g.state.ai.battlefield.some(p=>p.uid===t.uid),false);}
// 6 Ice Storm target land
{const g=setup(),t=add(g,'Island','ai');cast(g,'Ice Storm',{kind:'permanent',uid:t.uid});assert.equal(g.state.ai.battlefield.some(p=>p.uid===t.uid),false);}
// 7 Hurricane hits flying creatures and both players
{const g=setup();const f=add(g,'Grizzly Bears','ai');f.keywords=['flying'];g.state.player.life=20;g.state.ai.life=20;cast(g,'Hurricane',null,2);assert.equal(f.damageMarked,2);assert.equal(g.state.player.life,18);assert.equal(g.state.ai.life,18);}
// 8 Mind Twist discards X random cards from opponent
{const g=setup();g.state.ai.hand=[{name:'A'},{name:'B'},{name:'C'}];cast(g,'Mind Twist',{kind:'player',side:'ai'},2);assert.equal(g.state.ai.hand.length,1);}
// 9 Frozen Shade activated
{const g=setup(),p=add(g,'Frozen Shade');g.state.player.mana.B=1;activate(g,p);assert.deepEqual(p.tempBuffs.at(-1),{power:1,toughness:1});assert.equal(g.state.player.mana.B,0);}
// 11 Nightmare dynamic P/T from Swamps
{const g=setup();const sw1=add(g,'Swamp');const sw2=add(g,'Swamp');const n=add(g,'Nightmare');assert.equal(calculateCharacteristics(g.state,n).power,2);assert.equal(calculateCharacteristics(g.state,n).toughness,2);g.state.player.battlefield=g.state.player.battlefield.filter(p=>p.uid!==sw1.uid);assert.equal(calculateCharacteristics(g.state,n).power,1);assert.equal(calculateCharacteristics(g.state,n).toughness,1);}
// 12 Plague Rats counts all Plague Rats
{const g=setup();const a=add(g,'Plague Rats'),b=add(g,'Plague Rats');assert.equal(calculateCharacteristics(g.state,a).power,2);assert.equal(calculateCharacteristics(g.state,a).toughness,2);assert.equal(calculateCharacteristics(g.state,b).power,2);assert.equal(calculateCharacteristics(g.state,b).toughness,2);}
// 13 Evil Presence changes land type
{const g=setup(),t=add(g,'Forest','ai');cast(g,'Evil Presence',{kind:'permanent',uid:t.uid});assert.equal(t.subtype,'Swamp');}
// 14 Fear grants keyword
{const g=setup(),t=add(g,'Grizzly Bears','ai');cast(g,'Fear',{kind:'permanent',uid:t.uid});assert.ok(calculateCharacteristics(g.state,t).keywords.includes('fear'));} // V12.76 : une Aura accorde son mot-clé par la couche continue (plus par tempKeywords, qui survivait au départ de l'aura : test-v12-123)
// 16 Paralyze marks target as unable to untap / paralyzed
{const g=setup(),t=add(g,'Grizzly Bears','ai');cast(g,'Paralyze',{kind:'permanent',uid:t.uid});assert.ok(t.paralyzed || t.paralyze || t.untapLocked || t.noUntap);}
// 10 Iron Star : V12.76 (G32) — Oracle = « chaque fois qu'un joueur lance un sort rouge, vous pouvez payer {1} ; si vous le faites, gagnez 1 PV » (déclencheur, plus de prévention) ; comportement dans test-v12-143.
{const g=setup(),p=add(g,'Iron Star');assert.ok(!(p.activated||[]).length);assert.ok(p.triggers.some(t=>t.event==='spellCast'&&t.condition.spellColor==='R'&&t.effect.type==='payToGainLife'));}
// 11-15 Circles: each prevents one matching-color source only
for (const [name,color] of [['Circle of Protection: Black','B'],['Circle of Protection: Blue','U'],['Circle of Protection: Green','G'],['Circle of Protection: Red','R'],['Circle of Protection: White','W']]) {
  const g=setup(),p=add(g,name);g.state.player.mana.C=1;activate(g,p);const before=g.state.player.life;g.state.priorityHolder='player';const src={name:'Matching Source',type:'Instant',color:[color],cost:'',effect:{type:'damage',amount:3,target:'player'},sets:[]};g.state.player.hand=[src];g.dispatch('CAST_SPELL',{card:src,target:{kind:'player',side:'player'}},'player');resolve(g);assert.equal(g.state.player.life,before);assert.equal(g.state.player.prevention.length,0);
  g.state.priorityHolder='player';const other=color==='R'?'B':'R';const src2={name:'Other Source',type:'Instant',color:[other],cost:'',effect:{type:'damage',amount:2,target:'player'},sets:[]};g.state.player.hand=[src2];g.dispatch('CAST_SPELL',{card:src2,target:{kind:'player',side:'player'}},'player');resolve(g);assert.equal(g.state.player.life,before-2);
}
for(const n of ['Death Ward','Psionic Blast','Stream of Life','Flashfires','Stone Rain','Ice Storm','Hurricane','Mind Twist','Frozen Shade','Nightmare','Plague Rats','Evil Presence','Fear','Paralyze','Iron Star','Circle of Protection: Black','Circle of Protection: Blue','Circle of Protection: Green','Circle of Protection: Red','Circle of Protection: White']) assert.equal(card(n).effectStatus,'implemented');
console.log('OK V12.47: batch 3 — 20 cartes certifiées et testées E2E.');
