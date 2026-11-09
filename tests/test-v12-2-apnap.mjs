import { orderTriggers } from '../src/core/stack/trigger-ordering.js';
const triggers=[{controller:'ai',id:'ai-1'},{controller:'player',id:'p-1'},{controller:'ai',id:'ai-2'},{controller:'player',id:'p-2'}];
const ordered=orderTriggers(triggers,'player');
if(ordered.map(x=>x.controller).join(',')!=='player,player,ai,ai') throw new Error(`APNAP ordering failed: ${ordered.map(x=>x.controller)}`);
const chosen=orderTriggers(triggers,'player',(batch)=>batch.reverse());
if(chosen.map(x=>x.id).join(',')!=='p-2,p-1,ai-2,ai-1') throw new Error(`Controller choice ordering failed: ${chosen.map(x=>x.id)}`);
console.log('OK: V12.2 APNAP trigger ordering + per-controller choice.');
