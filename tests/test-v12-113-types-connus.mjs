import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import CARDS from '../src/data/cards-database.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';

// V12.76 : « type d'effet inconnu » = effet silencieusement sans effet
// (resolveInlineEffect renvoie null sans erreur si le type n'est pas enregistré).
// Pour toute carte dont effectStatus n'est PAS « unimplemented », chaque type
// d'effet doit être soit enregistré dans le registre, soit lu ailleurs dans le moteur
// (liste CONSOMMES_AILLEURS, vérifiée par présence du littéral) ; chaque type
// statique doit apparaître dans le code du moteur.
// DETTE_CONNUE = cartes sans statut dont un type n'a toujours pas de handler :
// le test échoue aussi si une carte de cette liste est corrigée (il faut alors l'en retirer).

installEffects(effects, {});
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const code = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) code.push(fs.readFileSync(p, 'utf8')); } })(path.join(ROOT, 'src', 'core'));
const CODE = code.join('\n');
const inCode = t => new RegExp(`['"\`]${t}['"\`]`).test(CODE);

const CONSOMMES_AILLEURS = ['grantKeyword', 'drawOnDeath', 'manaMultiplier'];
const DETTE_CONNUE = {
  // V12.76 (G27) : Consecrate Land et Farmstead retirées de la dette (leurs données `grantManaAbility` étaient fausses ; cartes désormais implémentées).
  'Sleight of Mind': 'colorChangeWord', 'Candelabra of Tawnos': 'untapX', 'Millstone': 'mill',
  'Orgg': 'attackRestriction (static)',
};

const effTypes = (c) => {
  const out = new Set();
  const walk = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk); if (typeof o.type === 'string') out.add(o.type); Object.values(o).forEach(walk); };
  walk(c.effect); (c.triggers || []).forEach(t => walk(t.effect)); (c.activated || []).forEach(a => walk(a.effect)); walk(c.auraEffect); walk(c.upkeepTrigger);
  return out;
};
const problems = {};
for (const c of CARDS) {
  if (c.effectStatus === 'unimplemented') continue;
  const bad = [];
  for (const t of effTypes(c)) if (!effects.has(t) && !CONSOMMES_AILLEURS.includes(t)) bad.push(t);
  // `damage` ne lit qu'une cible explicite : target 'self'/'controller'/'you' n'inflige RIEN (Copper Tablet, Bottle of Suleiman l'ont subi).
  const noop = []; const scan = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(scan); if (o.type === 'damage' && ['self', 'controller', 'you', 'selfPlayer'].includes(o.target)) noop.push(o.target); Object.values(o).forEach(scan); };
  scan(c.effect); (c.triggers || []).forEach(t => scan(t.effect)); (c.activated || []).forEach(a => scan(a.effect)); scan(c.upkeepTrigger);
  noop.forEach(t => bad.push(`damage target:'${t}' (aucun effet)`));
  for (const s of [].concat(c.static || [])) if (s?.type && !inCode(s.type)) bad.push(`${s.type} (static)`);
  if (bad.length) problems[c.name] = bad.join(', ');
}
for (const n of CONSOMMES_AILLEURS) assert.ok(inCode(n), `CONSOMMES_AILLEURS : « ${n} » n'apparaît plus dans le moteur -- la retirer de la liste.`);
const nouveaux = Object.keys(problems).filter(n => !(n in DETTE_CONNUE));
assert.deepEqual(nouveaux.map(n => `${n} : ${problems[n]}`), [], 'Carte(s) non-unimplemented dont un type est sans handler (effet silencieux).');
const regles = Object.keys(DETTE_CONNUE).filter(n => !(n in problems));
assert.deepEqual(regles, [], `Dette corrigée, retirer de DETTE_CONNUE : ${regles.join(', ')}`);

console.log(`OK V12.76: tous les types d'effet/statiques des cartes jouables ont un handler (${Object.keys(DETTE_CONNUE).length} cartes sans statut en dette connue).`);
