import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// Same-layer 4 dependency: A changes subtype to Elf; B changes type only if
// the target is an Elf. Battlefield order deliberately puts B before A.
const target = { uid:'t4', name:'Target4', controller:'player', type:'Creature', subtype:'Human', color:['G'], power:1, toughness:1, keywords:[], abilities:[] };
const sourceB = { uid:'B4', name:'ArtifactIfElf', controller:'player', static:{ type:'changeType', newType:'Artifact Creature', filterSubtype:'Elf', controllerFilter:'any' } };
const sourceA = { uid:'A4', name:'MakeElf', controller:'player', static:{ type:'changeType', newType:'Creature', subtype:'Elf', controllerFilter:'any' } };
const state = { player:{ battlefield:[target,sourceB,sourceA] }, ai:{ battlefield:[] } };
const c = calculateCharacteristics(state,target);
if (c.type !== 'Artifact Creature' || c.subtype !== 'Elf') throw new Error(`R-613-01 layer 4 failed: ${JSON.stringify(c)}`);
console.log('OK: R-613-01 layer 4 dependency resolves A before B.');
