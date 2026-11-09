import { calculateCharacteristics } from '../src/core/continuous-effects.js';
const target={uid:'t',objectId:'ot',name:'Base',type:'Creature',subtype:'Human',color:['W'],power:2,toughness:2,keywords:[],abilities:[]};
const copier={uid:'c',name:'CopyEffect',controller:'player',static:{type:'copyValues',values:{name:'Golem',type:'Artifact Creature',subtype:'Golem',color:['U'],power:5,toughness:5,keywords:['flying'],abilities:[]}}};
const setP={uid:'p',name:'SetPower',controller:'player',static:{type:'setPowerToughness',power:7,toughness:7,dependsOn:'c'}};
const state={player:{battlefield:[target,copier,setP]},ai:{battlefield:[]}};
let c=calculateCharacteristics(state,target);
if(c.name!=='Golem'||c.type!=='Artifact Creature'||c.power!==7||c.toughness!==7||!c.keywords.includes('flying')) throw new Error(`Copy/layer result wrong: ${JSON.stringify(c)}`);
console.log('OK: V12.2 copy values feed layer 1 and later layers deterministically.');
