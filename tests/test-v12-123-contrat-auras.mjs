// V12.76 — CONTRAT D'AURA pour TOUTE aura certifiée (harnais tests/lib/scenario.mjs) :
//   1. lancée sur un hôte légal, elle arrive en jeu attachée à cet hôte ;
//   2. quand l'aura quitte le champ de bataille, l'hôte REDEVIENT exactement ce qu'il était (aucun effet résiduel) ;
//   3. quand l'hôte disparaît, l'aura va au cimetière ;
//   4. lancée sur un hôte illégal, elle est refusée et reste en main.
// Ce test a révélé 8 défauts dans des cartes certifiées : Fear, Web et les cinq Wards laissaient leur mot-clé à la créature après le départ de
// l'aura ; Firebreathing pouvait être posée sur un terrain ; Earthbind / Animate Wall retiraient un mot-clé pour toujours.
import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { auraContract } from './lib/scenario.mjs';

const live = (c) => c.effectStatus === 'implemented' || c.effectStatus === 'functional';
const isAura = (c) => /Aura/.test((c.subtype || '') + ' ' + (c.type || '')) || c.isAura;
// Options propres à certaines cartes : hôte adapté, effet UNIQUE qui persiste légitimement, attendus pendant l'attache.
const OPTIONS = {
  'Immolation': { host: 'Hill Giant' },                                   // +2/-2 tuerait un 2/2
  'Goblin Caves': { host: 'Mountain' },                                  // Enchanter : terrain (la Montagne de base est l'hôte qui donne le bonus)
  'Tangle Kelp': { residual: ['tapped'] },                              // V12.76 (G32) : « engagez la créature enchantée » à l'arrivée : effet unique qui reste après le départ de l'aura
  'Paralyze': { residual: ['tapped'] },                                  // « engagez la créature » : effet unique qui reste après le départ de l'aura
  'Animate Wall': { host: 'Wall of Stone' },
  'Feedback': { host: 'Circle of Protection: Red', hostKind: 'enchantment' },
  'Earthbind': { host: 'Serra Angel', then: [{ kw: ['host', 'flying', false] }] },   // le mot-clé retiré revient quand l'aura part
  'Fishliver Oil': { then: [{ kw: ['host', 'islandwalk', true] }] },
};
const auras = CARDS.filter((c) => isAura(c) && live(c));
let n = 0;
for (const c of auras) { try { auraContract(c.name, OPTIONS[c.name] || {}); } catch (e) { e.message = `[contrat d'aura] ${e.message}`; throw e; } n++; }
assert.ok(n >= 41, `au moins 41 auras certifiées auditées (${n})`);
console.log(`OK V12.76.123 : ${n} auras certifiées respectent le contrat d'aura (attache, aucun effet résiduel, hôte qui part, hôte illégal).`);
