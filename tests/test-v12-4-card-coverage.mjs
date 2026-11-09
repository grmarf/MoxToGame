import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { CARD_SET_MANIFEST } from '../src/data/card-set-manifest.js';

// Vérifie automatiquement, pour chaque édition du manifeste, que le nombre de
// cartes logiques portant ce set correspond à la taille de référence.
//
// Les 6 éditions sont désormais bloquantes (V12.5) : chacune a été vérifiée
// intégralement contre une checklist officielle (EchoMTG) et corrigée
// (cartes manquantes ajoutées, cartes mal étiquetées retaguées vers la bonne
// édition ou détaguées si hors périmètre). Toute régression doit faire
// échouer la suite.
const BLOCKING_SETS = new Set(['LEB', 'ARN', 'LEG', 'DRK', 'FEM', 'ATQ']);

const report = [];
for (const [code, meta] of Object.entries(CARD_SET_MANIFEST)) {
  const count = CARDS.filter(c => c.sets?.includes(code)).length;
  const flag = count === meta.expected ? 'OK' : (count > meta.expected ? 'OVER' : 'partial');
  report.push(`${code} (${meta.name}): ${count}/${meta.expected} [${flag}]`);
  if (BLOCKING_SETS.has(code)) {
    assert.equal(count, meta.expected, `${code}: expected full coverage ${meta.expected}, got ${count} (${meta.name})`);
  }
}

console.log('OK: V12.4 card coverage vs card-set-manifest.js —');
report.forEach(line => console.log('  ' + line));
