// V12.76 — Chantier 2, lot G10 : terrains à seconde capacité (8 cartes).
// Strip Mine, Library of Alexandria, Pendelhaven, Karakas, Desert, Hammerheim, Tolaria, Urborg.
// Parties réelles : mana par le chemin natif (tapMana), seconde capacité par activateAbility (cibles, phases, conditions, sacrifice),
// résolution par la pile, effets lus par calculateCharacteristics / effectiveKeywords, fin de tour par la vraie progression des phases.
// NB : la base de données ne porte AUCUN supertype « Légendaire » (voir rapport) ; Karakas est donc testée avec une créature légendaire SYNTHÉTIQUE.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics, effectiveKeywords } from '../src/core/continuous-effects.js';
import { normalizeKeyword } from '../src/core/keywords.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
const ILLEGAL = /illégale|invalide|engagé/i;
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY();
  return g;
}
function put(g, side, name, extra = {}, base = null) {
  const uid = `${name}#${++seq}`;
  const p = { ...structuredClone(base || by(name)), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
const where = (g, p) => ['player', 'ai'].find((s) => g.state[s].battlefield.some((x) => x.uid === p.uid)) || null;
const get = (g, p) => g.state[where(g, p)]?.battlefield.find((x) => x.uid === p.uid);
// (le ZoneManager peut renouveler l'uid au changement de zone : on identifie par le nom, les zones de test étant vides au départ)
const inGy = (g, p) => g.state[p.owner].graveyard.some((x) => x.name === p.name);
const inHand = (g, p, side) => g.state[side].hand.some((x) => x.name === p.name);
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const tgt = (p) => ({ kind: 'permanent', uid: p.uid });
const second = (g, land, target = null, side = 'player') => { g.state.priorityHolder = side; g.action('activateAbility', { permanent: get(g, land) || land, controller: side, abilityIndex: 0, target }); };
const mana = (g, land, side = 'player') => { g.state.priorityHolder = side; g.action('tapMana', { permanent: get(g, land), controller: side }); };
const chars = (g, p) => calculateCharacteristics(g.state, get(g, p));
const kws = (g, p) => effectiveKeywords(g.state, get(g, p));
const totalMana = (m) => Object.values(m).reduce((a, b) => a + b, 0);
const LOT = ['Strip Mine', 'Library of Alexandria', 'Pendelhaven', 'Karakas', 'Desert', 'Hammerheim', 'Tolaria', 'Urborg'];
for (const n of LOT.filter((x) => x !== 'Karakas')) { const st = by(n).effectStatus; assert.ok(st === 'implemented', `${n} : statut ${st}`); }
// Karakas : mécanique prête et testée ci-dessous, mais elle ne peut être certifiée que lorsque la base porte le supertype « Légendaire »
// sur au moins une créature (aujourd'hui aucune : elle n'aurait aucune cible en partie réelle).
const baseHasLegendaryCreature = CARDS.some((c) => /Creature/.test(c.type) && /Legendary/.test(c.type));
assert.equal(by('Karakas').effectStatus === 'implemented', baseHasLegendaryCreature, "Karakas ne doit être « implemented » que si la base contient des créatures légendaires (et inversement)");
const nextTurn = (g) => { const t = g.state.turnNumber; for (let i = 0; i < 60 && g.state.turnNumber === t; i++) { g.turnManager.nextPhase(); for (let k = 0; k < 6 && g.stack.size > 0; k++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); } assert.notEqual(g.state.turnNumber, t); };
const LEGEND = () => ({ ...structuredClone(by('Jedit Ojanen')), type: 'Legendary Creature' });
function combatWith(g, attacker, attackerSide) {
  g.state.activePlayer = attackerSide; g.turnManager.activePlayer = attackerSide; g.state.phase = 'declareAttackers';
  g.combat.begin(); g.combat.confirmAttackers([get(g, attacker)], attackerSide);
}

// ── A) Pour chacune : le mana natif existe, et UNE seule des deux capacités par tour (les deux demandent {T}) ──
const MANA = { 'Strip Mine': 'C', 'Library of Alexandria': 'C', 'Pendelhaven': 'G', 'Karakas': 'W', 'Desert': 'C', 'Hammerheim': 'R', 'Tolaria': 'U', 'Urborg': 'B' };
const SETUP = {
  'Strip Mine':            (g) => ({ target: tgt(put(g, 'ai', 'Plains')) }),
  'Library of Alexandria': (g) => { g.state.player.hand = Array.from({ length: 7 }, (_, i) => ({ uid: `h${i}`, name: 'Island', type: 'Land', cmc: 0, owner: 'player' })); return { target: null }; },
  'Pendelhaven':           (g) => ({ target: tgt(put(g, 'ai', 'Benalish Hero')) }),
  'Karakas':               (g) => ({ target: tgt(put(g, 'ai', 'Jedit Ojanen', {}, LEGEND())) }),
  'Desert':                (g) => { const a = put(g, 'ai', 'Benalish Hero'); combatWith(g, a, 'ai'); g.state.phase = 'combatEnd'; return { target: tgt(a) }; },
  'Hammerheim':            (g) => ({ target: tgt(put(g, 'ai', 'Grizzly Bears')) }),
  'Tolaria':               (g) => { g.state.phase = 'upkeep'; return { target: tgt(put(g, 'ai', 'Benalish Hero')) }; },
  'Urborg':                (g) => ({ target: tgt(put(g, 'ai', 'Grizzly Bears')) }),
};
for (const name of LOT) {
  { // mana d'abord -> la seconde est refusée (engagé)
    const g = newGame(); const land = put(g, 'player', name); const { target } = SETUP[name](g);
    mana(g, land); assert.equal(g.state.player.mana[MANA[name]], 1, `${name} : 1 mana ${MANA[name]}`); assert.equal(totalMana(g.state.player.mana), 1);
    assert.ok(get(g, land).tapped); assert.throws(() => second(g, land, target), ILLEGAL, `${name} : engagé pour du mana, la seconde capacité est refusée`);
  }
  { // seconde d'abord -> le mana est refusé (engagé)
    const g = newGame(); const land = put(g, 'player', name); const { target } = SETUP[name](g);
    second(g, land, target); settle(g); if (name === 'Urborg') g.choices.resolve('firstStrike');
    assert.ok(get(g, land)?.tapped || inGy(g, land), `${name} : engagé (ou sacrifié)`);
    if (name !== 'Strip Mine') assert.throws(() => mana(g, land), ILLEGAL, `${name} : la seconde capacité a engagé le terrain, plus de mana`);
  }
}
console.log('OK V12.76.119.1 : 8 terrains -- mana natif correct, une seule capacité par tour (les deux exigent {T}).');

// ── B) Strip Mine : sacrifice au paiement, détruit un terrain (le mien aussi), refuse un non-terrain ──────────
{
  const g = newGame(); const sm = put(g, 'player', 'Strip Mine'); const plains = put(g, 'ai', 'Plains');
  second(g, sm, tgt(plains));
  assert.equal(where(g, sm), null, 'sacrifiée au paiement du coût (avant la résolution)'); assert.ok(inGy(g, sm)); assert.equal(where(g, plains), 'ai', 'pas encore détruit : la capacité est sur la pile');
  settle(g); assert.equal(where(g, plains), null, 'terrain détruit'); assert.ok(inGy(g, plains));
  const g2 = newGame(); const sm2 = put(g2, 'player', 'Strip Mine'); const bears = put(g2, 'ai', 'Grizzly Bears');
  assert.throws(() => second(g2, sm2, tgt(bears)), /illégale/i, 'un non-terrain est refusé'); assert.equal(where(g2, sm2), 'player', 'Strip Mine intacte après un refus');
  const g3 = newGame(); const sm3 = put(g3, 'player', 'Strip Mine'); const mine = put(g3, 'player', 'Plains');
  second(g3, sm3, tgt(mine)); settle(g3); assert.equal(where(g3, mine), null, 'peut détruire un de MES terrains');
  const g4 = newGame(); const sm4 = put(g4, 'ai', 'Strip Mine'); g4.state.ai.mana = EMPTY(); const pl = put(g4, 'player', 'Forest');
  second(g4, sm4, tgt(pl), 'ai'); settle(g4); assert.equal(where(g4, pl), null, "Strip Mine de l'IA"); assert.ok(inGy(g4, sm4));
  console.log("OK V12.76.119.2 : Strip Mine -- sacrifiée au coût, détruit tout terrain (le mien, celui de l'IA), refuse un non-terrain.");
}

// ── C) Library of Alexandria : exactement sept cartes en main (0..10), pioche UNE carte ──────────────────────
for (let n = 0; n <= 10; n++) {
  const g = newGame(); const lib = put(g, 'player', 'Library of Alexandria');
  g.state.player.hand = Array.from({ length: n }, (_, i) => ({ uid: `h${i}`, name: 'Island', type: 'Land', cmc: 0, owner: 'player' }));
  const libBefore = g.state.player.library.length;
  if (n === 7) { second(g, lib); settle(g); assert.equal(g.state.player.hand.length, 8, 'pioche exactement une carte'); assert.equal(g.state.player.library.length, libBefore - 1); assert.ok(get(g, lib).tapped); }
  else { assert.throws(() => second(g, lib), ILLEGAL, `${n} cartes en main : refusé`); assert.equal(g.state.player.hand.length, n); assert.ok(!get(g, lib).tapped); mana(g, lib); assert.equal(g.state.player.mana.C, 1, 'le mana reste disponible quelle que soit la main'); }
}
console.log("OK V12.76.119.3 : Library of Alexandria -- seulement avec exactement 7 cartes en main (0 à 10 testés), pioche une carte, mana toujours disponible.");

// ── D) Pendelhaven : +1/+2 à une créature 1/1 (la mienne ou adverse), jamais à une autre ; s'efface en fin de tour ──
{
  const g = newGame(); const pen = put(g, 'player', 'Pendelhaven'); const hero = put(g, 'ai', 'Benalish Hero'); const bears = put(g, 'ai', 'Grizzly Bears'); const bird = put(g, 'ai', 'Birds of Paradise');
  for (const bad of [bears, bird]) assert.throws(() => second(g, pen, tgt(bad)), /illégale/i, `${bad.name} (${chars(g, bad).power}/${chars(g, bad).toughness}) n'est pas une 1/1`);
  second(g, pen, tgt(hero)); settle(g);
  assert.deepEqual([chars(g, hero).power, chars(g, hero).toughness], [2, 3], '1/1 -> 2/3');
  nextTurn(g); assert.deepEqual([chars(g, hero).power, chars(g, hero).toughness], [1, 1], 'redevient 1/1 en fin de tour');
  const g2 = newGame(); const pen2 = put(g2, 'player', 'Pendelhaven'); const mine = put(g2, 'player', 'Mesa Pegasus');
  second(g2, pen2, tgt(mine)); settle(g2); assert.deepEqual([chars(g2, mine).power, chars(g2, mine).toughness], [2, 3], 'ma propre 1/1');
  // Revalidation à la résolution : la cible n'est plus 1/1 -> rien ne se passe (mais la capacité a été payée).
  const g3 = newGame(); const pen3 = put(g3, 'player', 'Pendelhaven'); const h3 = put(g3, 'ai', 'Benalish Hero');
  second(g3, pen3, tgt(h3)); get(g3, h3).tempBuffs = [{ power: 1, toughness: 1 }]; settle(g3);
  assert.deepEqual([chars(g3, h3).power, chars(g3, h3).toughness], [2, 2], 'devenue 2/2 en réponse : pas de +1/+2 (cible illégale)'); assert.ok(get(g3, pen3).tapped);
  console.log("OK V12.76.119.4 : Pendelhaven -- +1/+2 aux seules 1/1 (miennes ou adverses), expire en fin de tour, cible revalidée à la résolution.");
}

// ── E) Karakas : renvoie une créature LÉGENDAIRE dans la main de son PROPRIÉTAIRE ; refuse les autres ─────────
{
  const g = newGame(); const k = put(g, 'player', 'Karakas'); const bears = put(g, 'ai', 'Grizzly Bears'); const legend = put(g, 'ai', 'Jedit Ojanen', {}, LEGEND());
  assert.throws(() => second(g, k, tgt(bears)), /illégale/i, 'une créature non légendaire est refusée');
  second(g, k, tgt(legend)); settle(g); assert.equal(where(g, legend), null); assert.ok(inHand(g, legend, 'ai'), 'dans la main de son propriétaire (l\'IA)');
  const g2 = newGame(); const k2 = put(g2, 'player', 'Karakas'); const stolen = put(g2, 'ai', 'Jedit Ojanen', { owner: 'player' }, LEGEND());
  second(g2, k2, tgt(stolen)); settle(g2); assert.ok(inHand(g2, stolen, 'player'), "créature légendaire volée : retourne chez son PROPRIÉTAIRE, pas son contrôleur");
  const g3 = newGame(); const k3 = put(g3, 'player', 'Karakas'); const mine = put(g3, 'player', 'Jedit Ojanen', {}, LEGEND());
  second(g3, k3, tgt(mine)); settle(g3); assert.ok(inHand(g3, mine, 'player'), 'je peux sauver ma propre légende');
  console.log("OK V12.76.119.5 : Karakas -- renvoie une créature légendaire chez son propriétaire, refuse les autres (testée avec une légendaire synthétique).");
}

// ── F) Desert : 1 blessure à une créature ATTAQUANTE, seulement à l'étape de fin de combat ────────────────────
{
  const run = (phase, setup) => { const g = newGame(); const d = put(g, 'player', 'Desert'); const a = put(g, 'ai', 'Benalish Hero'); const other = put(g, 'ai', 'Grizzly Bears'); combatWith(g, a, 'ai'); g.state.phase = phase; return { g, d, a, other }; };
  for (const phase of ['declareAttackers', 'declareBlockers', 'combatDamage', 'main2', 'endStep']) { const { g, d, a } = run(phase); assert.throws(() => second(g, d, tgt(a)), ILLEGAL, `Desert refusée en phase ${phase}`); }
  { const { g, d, a, other } = run('combatEnd');
    assert.throws(() => second(g, d, tgt(other)), /illégale/i, 'une créature qui n\'attaque pas est refusée');
    second(g, d, tgt(a)); settle(g); assert.equal(where(g, a), null, '1 blessure tue la 1/1 attaquante'); assert.ok(inGy(g, a)); }
  { const g = newGame(); const d = put(g, 'player', 'Desert'); const b = put(g, 'ai', 'Grizzly Bears'); combatWith(g, b, 'ai'); g.state.phase = 'combatEnd';
    second(g, d, tgt(b)); settle(g); assert.equal(get(g, b).damageMarked, 1, '2/2 : 1 blessure, survit'); }
  { const g = newGame(); const d = put(g, 'player', 'Desert'); const a = put(g, 'ai', 'Benalish Hero'); combatWith(g, a, 'ai'); g.state.phase = 'combatEnd';
    second(g, d, tgt(a)); g.combat.combat.attackers = []; settle(g); assert.equal(where(g, a), 'ai', 'retirée du combat en réponse : la cible est devenue illégale, aucune blessure'); assert.equal(get(g, a).damageMarked || 0, 0); }
  { const g = newGame(); const d = put(g, 'ai', 'Desert'); g.state.ai.mana = EMPTY(); const a = put(g, 'player', 'Benalish Hero'); combatWith(g, a, 'player'); g.state.phase = 'combatEnd';
    second(g, d, tgt(a), 'ai'); settle(g); assert.equal(where(g, a), null, 'Desert de l\'IA contre mon attaquante'); }
  console.log("OK V12.76.119.6 : Desert -- seulement en fin de combat, attaquantes uniquement, 1 blessure, cible revalidée, côté IA.");
}

// ── G) Hammerheim : perd TOUTES les marches (famille évaluée à la résolution) ; test bout en bout en combat ────
{
  const g = newGame(); const h = put(g, 'player', 'Hammerheim'); const dn = put(g, 'ai', 'Desert Nomads');
  const before = kws(g, dn); assert.ok(before.includes('desertwalk') && before.includes('landwalk'), `avant : ${before}`);
  second(g, h, tgt(dn)); settle(g); const after = kws(g, dn);
  assert.ok(!after.some((k) => /walk$/i.test(k)), `plus aucune marche : ${after}`); assert.equal(g.state.ai.battlefield.find((p) => p.name === 'Desert Nomads').static[0].type, 'preventDamageFromSubtype', 'les autres capacités sont conservées');
  nextTurn(g); const later = kws(g, dn); assert.ok(later.includes('desertwalk'), 'les marches reviennent en fin de tour');
  // Bout en bout : une créature avec marche des montagnes contre un joueur qui contrôle une Montagne est inblocable ; plus après Hammerheim.
  const build = () => { const g = newGame(); const h = put(g, 'ai', 'Hammerheim'); g.state.ai.mana = EMPTY(); put(g, 'player', 'Mountain'); const blocker = put(g, 'player', 'Grizzly Bears'); const att = put(g, 'ai', 'Grizzly Bears', { keywords: ['mountainwalk'] }); return { g, h, att, blocker }; };
  { const { g, att, blocker } = build(); combatWith(g, att, 'ai'); assert.throws(() => g.combat.assignBlockers({ [att.uid]: [blocker.uid] }), undefined, 'marche des montagnes : inblocable'); }
  { const { g, h, att, blocker } = build(); second(g, h, tgt(att), 'ai'); settle(g); combatWith(g, att, 'ai'); assert.doesNotThrow(() => g.combat.assignBlockers({ [att.uid]: [blocker.uid] }), 'après Hammerheim : blocable'); }
  // Une marche acquise APRÈS la résolution n'est pas retirée.
  const g2 = newGame(); const h2 = put(g2, 'player', 'Hammerheim'); const c2 = put(g2, 'ai', 'Bog Wraith'); second(g2, h2, tgt(c2)); settle(g2); get(g2, c2).tempKeywords = ['islandwalk']; assert.ok(kws(g2, c2).includes('islandwalk'), 'marche acquise plus tard : conservée');
  console.log("OK V12.76.119.7 : Hammerheim -- toute la famille des marches retirée jusqu'à la fin du tour, effet réel en combat.");
}

// ── H) Tolaria : retire la bande, seulement pendant une étape d'entretien (de n'importe quel joueur) ──────────
{
  for (const [phase, active, ok] of [['upkeep', 'player', true], ['upkeep', 'ai', true], ['draw', 'player', false], ['main1', 'player', false], ['combatBegin', 'ai', false], ['endStep', 'player', false]]) {
    const g = newGame(); const t = put(g, 'player', 'Tolaria'); const hero = put(g, 'ai', 'Benalish Hero'); g.state.phase = phase; g.state.activePlayer = active;
    if (!ok) { assert.throws(() => second(g, t, tgt(hero)), ILLEGAL, `Tolaria refusée en ${phase} (tour de ${active})`); continue; }
    assert.ok(kws(g, hero).includes('banding')); second(g, t, tgt(hero)); settle(g);
    assert.ok(!kws(g, hero).includes('banding'), `bande retirée (entretien de ${active})`);
    const mp = put(g, 'ai', 'Mesa Pegasus'); assert.ok(kws(g, mp).includes('flying'));
  }
  const g = newGame(); const t = put(g, 'player', 'Tolaria'); const mp = put(g, 'ai', 'Mesa Pegasus'); g.state.phase = 'upkeep'; second(g, t, tgt(mp)); settle(g);
  assert.ok(!kws(g, mp).includes('banding') && kws(g, mp).includes('flying'), 'le vol est conservé, seule la bande part');
  nextTurn(g); assert.ok(kws(g, mp).includes('banding'), 'la bande revient en fin de tour');
  console.log("OK V12.76.119.8 : Tolaria -- retire la bande, uniquement pendant un entretien (le mien ou celui de l'adversaire), le reste est conservé.");
}

// ── I) Urborg : vrai CHOIX entre l'initiative et la marche des marais ; une seule perdue ─────────────────────
for (const [choice, kept] of [['firstStrike', 'swampwalk'], ['swampwalk', 'firstStrike']]) {
  const g = newGame(); const u = put(g, 'player', 'Urborg'); const c = put(g, 'ai', 'Grizzly Bears', { keywords: ['firstStrike', 'swampwalk', 'flying'] });
  second(g, u, tgt(c)); settle(g); const p = g.choices.getPending(); assert.equal(p?.type, 'chooseKeyword'); assert.deepEqual(p.options, ['firstStrike', 'swampwalk']);
  assert.throws(() => g.choices.resolve('flying'), /invalide/i, 'une option non proposée est refusée');
  g.choices.resolve(choice); const k = kws(g, c);
  assert.ok(!k.includes(normalizeKeyword(choice)), `${choice} perdue`); assert.ok(k.includes(normalizeKeyword(kept)) && k.includes('flying'), `${kept} et le vol conservés (${k})`);
  nextTurn(g); assert.ok(kws(g, c).includes(normalizeKeyword(choice)), 'revient en fin de tour');
}
console.log("OK V12.76.119.9 : Urborg -- choix réel initiative / marche des marais, une seule capacité perdue jusqu'à la fin du tour.");
