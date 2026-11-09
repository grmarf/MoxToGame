// V12.76 — Harnais de scénarios (tests/lib/scenario.mjs) : lot pilote d'auras. Pour chaque carte : le CONTRAT D'AURA générique
// (attache, effets retirés quand l'aura part, l'hôte qui meurt, hôte illégal) + ses scénarios propres, joués en vraie partie.
import { run, auraContract, cardOf } from './lib/scenario.mjs';
import { SCENARIOS } from './scenarios/auras-lot1.mjs';

let n = 0;
for (const sc of SCENARIOS) {
  const c = cardOf(sc.card); if (c.effectStatus !== 'implemented') throw new Error(`${sc.card} : statut ${c.effectStatus}`);
  auraContract(sc.card, sc.contract || {});
  for (const r of sc.runs) run({ card: sc.card, ...r });
  n++; console.log(`OK V12.76.124 : ${sc.card} -- contrat d'aura + ${sc.runs.length} scénario(s).`);
}
console.log(`OK V12.76.124 : ${n} auras certifiées par le harnais.`);
