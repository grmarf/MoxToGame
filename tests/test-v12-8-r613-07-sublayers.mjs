import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// Regression contract for the existing 7a -> 7b -> 7c -> 7d order.
// 7a dynamic PT sets 2/2 (two creatures controlled), 7b sets 4/5,
// 7c adds +1/+2, then 7d switches -> final 7/5.
const target = {
  uid:'t7', name:'Layer7Target', controller:'player', type:'Creature', subtype:'Bear',
  color:['G'], power:1, toughness:1, keywords:[], abilities:[]
};
const dynamic = {
  uid:'dyn7', name:'Dynamic', controller:'player',
  static:{ type:'dynamicPT', powerSource:'creatureCount', per:1, controller:'self' }
};
const set = {
  uid:'set7', name:'Set', controller:'player',
  static:{ type:'setPowerToughness', power:4, toughness:5, controllerFilter:'any' }
};
const modify = {
  uid:'mod7', name:'Modify', controller:'player',
  static:{ type:'modifyPowerToughness', power:1, toughness:2, controllerFilter:'any' }
};
const swap = {
  uid:'swap7', name:'Switch', controller:'player',
  static:{ type:'switchPowerToughness', controllerFilter:'any' }
};
const state = { player:{ battlefield:[target,dynamic,set,modify,swap] }, ai:{ battlefield:[] } };
const c = calculateCharacteristics(state,target);
if (c.power !== 7 || c.toughness !== 5) {
  throw new Error(`R-613 layer 7 sublayer order changed: expected 7/5, got ${c.power}/${c.toughness}`);
}
console.log('OK: R-613 layer 7 preserves 7a -> 7b -> 7c -> 7d order.');
