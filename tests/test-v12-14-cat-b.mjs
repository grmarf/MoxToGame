import assert from 'assert';
import CARDS from '../src/data/cards-database.js';
import { createPermanent } from '../src/core/card-runtime.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';

installEffects(effects, globalThis);

function findCard(name) { return CARDS.find(c => c.name === name); }
function makePerm(name, ctrl) {
  const c = findCard(name);
  assert.ok(c, `${name} existe`);
  const p = createPermanent(c);
  p.controller = ctrl; p.owner = ctrl; return p;
}

// B28: Argothian Pixies a flying
assert.ok(!makePerm('Argothian Pixies', 'player').keywords.includes('flying'), 'B28: Argothian Pixies ne vole PAS (V12.76 G32 : Oracle)');

// B29: Bog Rats a swampwalk
{ const br = makePerm('Bog Rats', 'player'); assert.ok(!br.keywords.includes('swampwalk'), 'B29: Bog Rats n\'a pas de marécage-marche (Oracle)'); assert.ok([].concat(br.static || []).some((e) => e.type === 'cantBeBlockedBySubtype' && e.subtype === 'Wall'), 'B29: Bog Rats ne peut pas être bloqué par des Murs'); }

// B30: Carnivorous Plant a forestwalk
assert.ok(!makePerm('Carnivorous Plant', 'player').keywords.includes('forestwalk') && makePerm('Carnivorous Plant', 'player').keywords.includes('defender'), 'B30: Carnivorous Plant : défenseur seul (Oracle)');

// B31: Desert Nomads a mountainwalk + protectionU
const dn = makePerm('Desert Nomads', 'player');
assert.ok(dn.keywords.includes('desertwalk') && !dn.keywords.includes('mountainwalk'), 'B31a: Desert Nomads desertwalk (V12.76 G32 : Oracle, plus de mountainwalk)');
assert.ok(!dn.keywords.includes('protectionU') && dn.static[0].type === 'preventDamageFromSubtype', 'B31b: Desert Nomads prévient les blessures des Déserts (plus de protectionU)');

// B32: Land Leeches a forestwalk
assert.ok(!makePerm('Land Leeches', 'player').keywords.includes('forestwalk') && makePerm('Land Leeches', 'player').keywords.includes('firstStrike'), 'B32: Land Leeches : initiative seule (Oracle)');

// B33: Air Elemental a flying (pas banding)
const ae = makePerm('Air Elemental', 'player');
assert.ok(ae.keywords.includes('flying'), 'B33a: Air Elemental flying');
assert.ok(!ae.keywords.includes('banding'), 'B33b: Air Elemental pas banding');

// B34: Marsh Goblins a swampwalk
assert.ok(makePerm('Marsh Goblins', 'player').keywords.includes('swampwalk'), 'B34: Marsh Goblins swampwalk');

// B35: Nether Shadow a haste
assert.ok(makePerm('Nether Shadow', 'player').keywords.includes('haste'), 'B35: Nether Shadow haste');

console.log('OK: Catégorie B — 35 cartes (27+8) vérifiées.');
