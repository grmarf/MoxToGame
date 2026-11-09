import assert from 'node:assert/strict';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
installEffects(effects, globalThis); game.connect();

function mana(side){ game.state[side].mana={W:10,U:10,B:10,R:10,G:10,C:10}; }
function setup(){
  game.engine.loadDeck('player',CARDS.filter(c=>c.isBasic)); game.engine.loadDeck('ai',CARDS.filter(c=>c.isBasic));
  game.turnManager.gotoPhase('main1'); game.turnManager.activePlayer='player'; game.state.activePlayer='player'; game.state.priorityHolder='player';
  for(const s of ['player','ai']){ mana(s); game.state[s].battlefield=[]; game.state[s].graveyard=[]; game.state[s].hand=[]; }
}

// Effet de test inline : reproduit exactement ce qu'un handler d'effet réel
// (atomic-effects.js, complex-effects.js) fait quand il appelle
// ctx.api.checkStateBasedDeaths() après avoir modifié l'état directement.
effects.register('test_call_sba', (ctx) => { ctx.api.checkStateBasedDeaths(); });

// 1. checkStateBasedDeaths() doit réellement mettre au cimetière une créature
// dont les dégâts marqués égalent son endurance, IMMÉDIATEMENT à l'appel --
// sans attendre un autre point de contrôle SBA du moteur (pas de changement
// de phase, pas de passage de priorité entre les deux).
setup();
assert.ok(game.stack.sba, 'StackController doit recevoir une instance sba non nulle (injection game-facade.js)');

const bear={uid:'sba_bear',objectId:'sba_bear_obj',name:'Grizzly Bears',type:'Creature',power:2,toughness:2,owner:'player',controller:'player',keywords:[],color:['G'],tapped:false,summoningSickness:false,damageMarked:0,tempBuffs:[]};
game.state.player.battlefield=[bear];
bear.damageMarked = bear.toughness; // dégâts marqués = endurance -> doit mourir au prochain SBA

// pushSpell + resolveTop() est le vrai chemin de résolution : ctx.api est
// construit par #buildApi(state) (privé), donc c'est ici le SEUL moyen
// d'obtenir le vrai checkStateBasedDeaths tel qu'un handler d'effet réel le
// reçoit (atomic-effects.js / complex-effects.js).
game.stack.pushSpell({ name: 'TestCallSBA', effect: { type: 'test_call_sba' } }, 'player');
game.stack.resolveTop();

const stillThere = game.state.player.battlefield.some(p=>p.uid==='sba_bear');
const inGraveyard = game.state.player.graveyard.some(p=>p.previousUid==='sba_bear' || p.objectId==='sba_bear_obj' || p.previousObjectId==='sba_bear_obj');
assert.equal(stillThere, false, 'La créature avec dégâts marqués == endurance doit avoir quitté le champ de bataille immédiatement après checkStateBasedDeaths()');
assert.equal(inGraveyard, true, 'La créature doit être passée au cimetière immédiatement après checkStateBasedDeaths()');
console.log('OK V12.57.1: checkStateBasedDeaths() applique réellement les SBA immédiatement');

// 2. Non-régression : sans dégâts marqués, checkStateBasedDeaths() ne doit rien changer.
setup();
const bear2={uid:'sba_bear2',objectId:'sba_bear2_obj',name:'Grizzly Bears',type:'Creature',power:2,toughness:2,owner:'player',controller:'player',keywords:[],color:['G'],tapped:false,summoningSickness:false,damageMarked:0,tempBuffs:[]};
game.state.player.battlefield=[bear2];
game.stack.pushSpell({ name: 'TestCallSBA', effect: { type: 'test_call_sba' } }, 'player');
game.stack.resolveTop();
assert.equal(game.state.player.battlefield.some(p=>p.uid==='sba_bear2'), true, 'Une créature sans dégâts ne doit pas être affectée par checkStateBasedDeaths()');
console.log('OK V12.57.2: non-régression -- pas de mort injustifiée sans dégâts marqués');
