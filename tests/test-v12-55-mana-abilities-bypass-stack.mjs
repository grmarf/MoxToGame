import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';
const card=n=>CARDS.find(c=>c.name===n);
const setup=()=>{const g=new GameFacade().connect();g.state.phase='main1';g.state.priorityHolder='player';g.state.activePlayer='player';g.state.player.mana={W:10,U:10,B:10,R:10,G:10,C:10};g.state.ai.mana={W:0,U:0,B:0,R:0,G:0,C:0};return g};
const add=(g,n)=>{const p=createPermanent(card(n));p.controller='player';p.owner='player';g.state.player.battlefield.push(p);return p};

// Sol Ring: generic activated mana ability resolves immediately, with no stack item.
{ const g=setup(), p=add(g,'Sol Ring'); assert.equal(g.stack.size,0); g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0}); assert.equal(p.tapped,true); assert.equal(g.state.player.mana.C,12); assert.equal(g.stack.size,0); }

// Celestial Prism: chooser supplies a real color, still without a stack item.
{ const g=setup(), p=add(g,'Celestial Prism'); g.choices.setChooser(choice => 'U'); g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0}); assert.equal(g.state.player.mana.U,11); assert.equal(p.tapped,true); assert.equal(g.stack.size,0); assert.equal(g.choices.getPending(),null); }

// Existing tapAbility mana path remains immediate (Black Lotus).
{ const g=setup(), p=add(g,'Black Lotus'); g.choices.setChooser(choice => 'G'); g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0}); assert.equal(g.state.player.mana.G,13); assert.equal(p.tapped,true); assert.equal(g.stack.size,0); assert.equal(g.state.player.battlefield.includes(p),false); }

// Ordinary activated ability still uses the stack.
{ const g=setup(), p=add(g,'Frozen Shade'); g.state.player.mana.B=1; g.action('activateAbility',{permanent:p,controller:'player',abilityIndex:0}); assert.equal(g.stack.size,1); assert.equal(g.state.player.mana.B,0); }

console.log('OK V12.55: generic mana abilities bypass stack; tapAbility and ordinary ability regressions pass.');
