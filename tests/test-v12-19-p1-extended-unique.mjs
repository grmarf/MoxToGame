import assert from 'assert';
import fs from 'fs';

// Vérifier que extended-effects.js contient uniquement les handlers uniques
const extCode = fs.readFileSync('./src/core/effects/extended-effects.js', 'utf8');

// Vérifier que spiritLink est présent et utilise findPermanent (pas targetInfo)
assert.ok(extCode.includes("reg('spiritLink'"), 'P1: spiritLink doit être présent dans extended');
assert.ok(extCode.includes('findPermanent'), 'P1: extended doit utiliser findPermanent pour résoudre les cibles');
assert.ok(!extCode.includes("reg('damage'"), 'P1: damage ne doit plus être dans extended (doublon supprimé)');
assert.ok(!extCode.includes("reg('destroy'"), 'P1: destroy ne doit plus être dans extended (doublon supprimé)');
assert.ok(!extCode.includes("reg('pump'"), 'P1: pump ne doit plus être dans extended (doublon supprimé)');

// Vérifier l'ordre dans index.js
const idxCode = fs.readFileSync('./src/core/effects/index.js', 'utf8');
const extPos = idxCode.indexOf('registerExtendedEffects');
const c123Pos = idxCode.indexOf('registerC123Effects');
const atomicPos = idxCode.indexOf('registerAtomicEffects');
assert.ok(extPos > atomicPos, 'P1: extended doit être après atomic');
assert.ok(c123Pos > extPos, 'P1: C123 doit être après extended (dernier)');

console.log('P1 extended unique PASS');
