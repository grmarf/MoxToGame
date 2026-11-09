// V12.76 — Harnais de scénarios : auras, lot 2 (contrat d'aura + scénarios propres, vraie partie).
import { run, auraContract, cardOf } from './lib/scenario.mjs';
import { SCENARIOS } from './scenarios/auras-lot2.mjs';

let n = 0;
for (const sc of SCENARIOS) {
  const c = cardOf(sc.card); if (c.effectStatus !== 'implemented') throw new Error(`${sc.card} : statut ${c.effectStatus}`);
  auraContract(sc.card, sc.contract || {});
  for (const r of sc.runs) run({ card: sc.card, ...r });
  n++; console.log(`OK V12.76.125 : ${sc.card} -- contrat d'aura + ${sc.runs.length} scénario(s).`);
}
console.log(`OK V12.76.125 : ${n} auras certifiées par le harnais (lot 2).`);
