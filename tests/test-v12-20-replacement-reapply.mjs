// V12.20 — Un effet de remplacement peut-il s'appliquer deux fois sur le même événement muté ?
import { ReplacementService } from '../src/core/replacement-effects.js';

const state = { player: { battlefield: [], life: 20 }, ai: { battlefield: [], life: 20 } };

const repl = new ReplacementService({ state: () => state, choiceService: null });

// Vérifier que maxIterations borne la boucle
console.log('maxIterations:', repl.maxIterations);
if (typeof repl.maxIterations !== 'number' || repl.maxIterations <= 0) {
  console.error('FAIL: maxIterations non défini ou invalide');
  process.exit(1);
}

console.log(`PASS: replacement service a une borne d'itération`);
