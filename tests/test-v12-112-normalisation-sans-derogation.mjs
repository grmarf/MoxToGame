import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeCard } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

// V12.76 (unification) : le comportement d'une carte vit UNIQUEMENT dans
// src/data/cards-database.js. Ce test verrouille deux choses :
//  1. plus aucune dérogation « if (name === '…') » dans le moteur, l'app, la sim ou l'UI
//     (seule exception connue et déclarée : Ali from Cairo dans replacement-effects.js) ;
//  2. normalizeCard est STABLE : re-normaliser une carte déjà normalisée (ce que fait
//     createPermanent) ne change rien -- l'ancien code dupliquait par exemple le static
//     de Goblin War Drums à chaque passage.

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p); } })(path.join(ROOT, 'src'));

const BY_NAME = /(?:\.name|\bn|\bname|cardName)\s*===?\s*['"][^'"]+['"]/;
const hits = [];
for (const f of files) {
  if (f.endsWith(path.join('data', 'cards-database.js'))) continue;
  fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => { if (BY_NAME.test(l)) hits.push(`${path.relative(ROOT, f).split(path.sep).join('/')}:${i + 1}`); });
}
const ALLOWED = ['src/core/replacement-effects.js'];
const unexpected = hits.filter(h => !ALLOWED.some(a => h.startsWith(a + ':')));
assert.deepEqual(unexpected, [], `Dérogation(s) par nom de carte dans le moteur : ${unexpected.join(', ')} -- décrire la carte dans src/data/cards-database.js à la place.`);

const strip = o => Array.isArray(o) ? o.map(strip) : (o && typeof o === 'object') ? Object.fromEntries(Object.keys(o).sort().filter(k => !k.startsWith('__')).map(k => [k, strip(o[k])])) : o;
const unstable = CARDS.filter(c => JSON.stringify(strip(normalizeCard(structuredClone(c)))) !== JSON.stringify(strip(c)));
assert.deepEqual(unstable.map(c => c.name), [], `normalizeCard instable (changerait au 2e passage) : ${unstable.map(c => c.name).join(', ')}`);

console.log(`OK V12.76: aucune dérogation par nom (${hits.length} exception déclarée), normalisation stable sur ${CARDS.length} cartes.`);
