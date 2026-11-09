import { calculateCharacteristics } from '../src/core/continuous-effects.js';

const target = { uid:'t1', objectId:'ot1', name:'Target', type:'Creature', subtype:'Human', color:['W'], power:2, toughness:2, keywords:[], abilities:[] };
const depSource = { uid:'b', name:'B', controller:'player', static:{ type:'changeType', newType:'Artifact' } };
const dependentSource = { uid:'a', name:'A', controller:'player', static:{ type:'changeType', newType:'Creature', dependsOn:'B' } };
const state = { player:{ battlefield:[target, depSource, dependentSource] }, ai:{ battlefield:[] } };
const c = calculateCharacteristics(state,target);
if(c.type !== 'Creature') throw new Error(`Layer dependency ordering failed: ${c.type}`);

target.copyValues = { name:'Copied', type:'Artifact Creature', subtype:'Golem', color:['U'], power:5, toughness:5, keywords:['flying'], abilities:[] };
const copied = calculateCharacteristics(state,target);
if(copied.name!=='Copied' || copied.power!==5 || !copied.keywords.includes('flying')) throw new Error('Stored copy values were not applied in layer 1.');
console.log('OK: V12.1 layers + copy characteristics.');
