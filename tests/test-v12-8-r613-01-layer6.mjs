import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// Same-layer 6 dependency: A grants flying; B grants shroud only if the
// target has flying. Battlefield order deliberately puts B before A.
const target = { uid:'t6', name:'Target6', controller:'player', type:'Creature', subtype:'Bird', color:['W'], power:1, toughness:1, keywords:[], abilities:[] };
const sourceB = { uid:'B6', name:'ShroudIfFlying', controller:'player', static:{ type:'grantKeyword', keyword:'shroud', filterKeyword:'flying', controllerFilter:'any' } };
const sourceA = { uid:'A6', name:'GrantFlying', controller:'player', static:{ type:'grantKeyword', keyword:'flying', controllerFilter:'any' } };
const state = { player:{ battlefield:[target,sourceB,sourceA] }, ai:{ battlefield:[] } };
const c = calculateCharacteristics(state,target);
if (!c.keywords.includes('flying') || !c.keywords.includes('shroud')) throw new Error(`R-613-01 layer 6 failed: ${JSON.stringify(c.keywords)}`);
console.log('OK: R-613-01 layer 6 dependency resolves A before B.');
