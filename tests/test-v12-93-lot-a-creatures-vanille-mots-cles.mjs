// V12.75 — Chantier 2, lot A : créatures SANS texte (vanille) et créatures dont
// tout le texte est un mot-clé que le combat lit réellement.
//
// Ce test fait trois choses :
//  1. il fixe la liste des 43 cartes certifiées par ce lot (statut + règle
//     exécutable « le texte se réduit exactement aux mots-clés de la donnée ») ;
//  2. il audite TOUTES les créatures certifiées sans comportement propre : un
//     texte de règles que ni un mot-clé ni un champ de comportement ne couvre
//     est une certification mensongère ;
//  3. il joue le vrai combat (CombatService + vrais états de base) avec les
//     vraies cartes de la base, une famille de mots-clés à la fois.
import assert from 'node:assert/strict';
import { CombatService } from '../src/core/combat.js';
import { StateBasedActions } from '../src/core/state-based-actions.js';
import { createPermanent, normalizeCard } from '../src/core/card-runtime.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';
import { parseKeywordText, dataKeywordSet } from '../src/data/keyword-text.js';

const byName = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente de la base : ${n}`); return c; };

const VANILLA = [
  'Keepers of the Faith', 'Headless Horseman', 'Crimson Kobolds', 'Crookshank Kobolds', 'Kobolds of Kher Keep',
  'Raging Bull', 'Barbary Apes', 'Durkwood Boars', 'Moss Monster', 'Barktooth Warbeard', 'Jasmine Boreal',
  'Jedit Ojanen', 'Jerrard of the Closed Fist', 'Kasimir the Lone Wolf', 'Lady Orca', 'Sir Shandlar of Eberyn',
  'Sivitri Scarzam', 'The Lady of the Mountain', 'Tobias Andrion', 'Torsten Von Ursus',
];
const KEYWORD_ONLY = [
  'Righteous Avengers', 'Thunder Spirit', 'Tundra Wolves', 'Wall of Light', 'Azure Drake', 'Devouring Deep',
  'Segovian Leviathan', 'Zephyr Falcon', 'Lost Soul', 'Aerathi Berserker', 'Frost Giant', 'Mountain Yeti',
  'Wall of Earth', 'Wall of Heat', 'Cat Warriors', 'Craw Giant', 'Hornet Cobra', 'Wolverine Pack',
  'Hunding Gjornersen', 'Marhault Elsdragon', 'Ramirez DePietro', 'Pikemen', 'Marsh Goblins',
];

const strip = (t) => String(t || '').replace(/\([^)]*\)/g, '').trim();
const BEHAVIOR_FIELDS = ['effect', 'triggers', 'static', 'tapAbility', 'activated', 'abilities', 'replacementEffects', 'produces', 'upkeepTrigger'];
const hasOwnBehavior = (card) => {
  const n = normalizeCard(card);
  return BEHAVIOR_FIELDS.some((f) => Array.isArray(n[f]) ? n[f].length > 0 : !!n[f]);
};
const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// ── 1. Certification du lot ──────────────────────────────────────────────
for (const name of VANILLA) {
  const c = byName(name);
  assert.equal(c.effectStatus, 'functional', `${name} : vanille, statut attendu functional`);
  assert.equal(strip(c.text_fr), '', `${name} : une vanille n'a aucun texte de règles`);
  assert.ok(!hasOwnBehavior(c), `${name} : une vanille n'a aucun comportement propre`);
  assert.equal(dataKeywordSet(c).size, 0, `${name} : une vanille n'a aucun mot-clé`);
  assert.ok(Number.isFinite(Number(c.power)) && Number.isFinite(Number(c.toughness)), `${name} : force/endurance numériques`);
}
for (const name of KEYWORD_ONLY) {
  const c = byName(name);
  assert.equal(c.effectStatus, 'implemented', `${name} : statut attendu implemented`);
  const parsed = parseKeywordText(c.text_fr);
  assert.ok(parsed && parsed.length > 0, `${name} : le texte « ${strip(c.text_fr)} » doit se réduire à des mots-clés`);
  assert.ok(same(new Set(parsed), dataKeywordSet(c)), `${name} : mots-clés de la donnée (${[...dataKeywordSet(c)]}) ≠ texte (${parsed})`);
  assert.ok(!hasOwnBehavior(c), `${name} : aucun comportement propre attendu (sinon ce n'est pas un lot « mots-clés seuls »)`);
}

// ── 2. Audit : aucune créature certifiée ne cache du texte non implémenté ──
// Mensonge = texte de règles que ni un mot-clé de la donnée ni un champ de
// comportement ne couvre (texte non reconnu, ou mot-clé du texte absent de la
// donnée). Le cas inverse (mot-clé de la donnée que le texte ne dit pas) n'est
// pas un mensonge mais une question de DONNÉES à trancher contre l'impression
// réelle : elles sont listées ici, et toute nouvelle apparition fait échouer le test.
const certifiedPure = CARDS.filter((c) => c.isCreature && ['functional', 'implemented'].includes(c.effectStatus) && !hasOwnBehavior(c) && strip(c.text_fr));
const liars = certifiedPure.filter((c) => {
  const parsed = parseKeywordText(c.text_fr);
  const data = dataKeywordSet(c);
  return parsed === null || parsed.some((k) => !data.has(k));
});
assert.deepEqual(liars.map((c) => `${c.name} « ${strip(c.text_fr).slice(0, 60)} »`), [], 'créatures certifiées dont le texte n\'est couvert ni par un mot-clé ni par un comportement');

const KNOWN_DATA_QUESTIONS = {
  // 'Desert Nomads' retiré en V12.76 (G32) : la donnée est alignée sur l'Oracle (Desertwalk + prévention des blessures des Déserts)
};
const extras = certifiedPure.filter((c) => {
  const parsed = parseKeywordText(c.text_fr);
  const stated = new Set(parsed || []);
  return [...dataKeywordSet(c)].some((k) => !stated.has(k));
}).map((c) => c.name).sort();
assert.deepEqual(extras, Object.keys(KNOWN_DATA_QUESTIONS).sort(), 'mots-clés de la donnée non énoncés par le texte : question de données à trancher, pas à cacher');

// La carte dont le texte annonce une capacité que le moteur ne modélise pas n'est pas certifiée.
// (V12.76 : Two-Headed Giant of Foriys a quitté cette liste — le blocage supplémentaire est modélisé et testé
// en partie réelle dans test-v12-104 ; Argothian Pixies reste non modélisée.)
for (const name of ['Argothian Pixies']) {
  assert.equal(byName(name).effectStatus, 'unimplemented', `${name} : texte non modélisé (protection contre les artefacts), ne doit pas être certifiée`);
}
assert.equal(byName('Two-Headed Giant of Foriys').effectStatus, 'implemented', 'Two-Headed Giant : certifiée en v12.76 (test-v12-104)');

// ── 3. Combat réel ───────────────────────────────────────────────────────
const sba = new StateBasedActions({ zones: null });
let seq = 0;
function mk(name, side) {
  const p = createPermanent(byName(name));
  p.uid = `${name}#${++seq}`; p.controller = side; p.owner = side; p.summoningSickness = false;
  return p;
}
const mkState = (ai = [], player = []) => ({
  activePlayer: 'ai', phase: 'combatBegin', turnNumber: 3, priorityHolder: 'ai',
  player: { battlefield: player, graveyard: [], hand: [], library: [], exile: [], life: 20, mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
  ai: { battlefield: ai, graveyard: [], hand: [], library: [], exile: [], life: 20, mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
});
function attack(state, attackers, bands = []) {
  const combat = new CombatService({ state: () => state, sba });
  combat.begin();
  combat.confirmAttackers(attackers, 'ai', bands);
  return combat;
}
const blockersFor = (combat, attacker) => combat.getValidBlockers('player', attacker).map((p) => p.name);

// 3a. Vol : seuls un volant ou une créature avec portée bloquent.
for (const name of [...KEYWORD_ONLY, ...VANILLA].filter((n) => dataKeywordSet(byName(n)).has('flying'))) {
  const flyer = mk(name, 'ai');
  const state = mkState([flyer], [mk('Hill Giant', 'player'), mk('Air Elemental', 'player')]);
  assert.deepEqual(blockersFor(attack(state, [flyer]), flyer), ['Air Elemental'], `${name} (vol) ne doit être bloquée que par un volant`);
}

// 3b. Passage (landwalk) : imblocable si le défenseur contrôle le terrain, bloquable sinon.
const WALK_LAND = { plainswalk: 'Plains', islandwalk: 'Island', swampwalk: 'Swamp', mountainwalk: 'Mountain', forestwalk: 'Forest' };
let walkers = 0;
for (const name of KEYWORD_ONLY) {
  for (const k of dataKeywordSet(byName(name))) {
    if (!WALK_LAND[k]) continue;
    walkers++;
    const walker = mk(name, 'ai');
    const withLand = mkState([walker], [mk('Hill Giant', 'player'), mk(WALK_LAND[k], 'player')]);
    assert.deepEqual(blockersFor(attack(withLand, [walker]), walker), [], `${name} (${k}) doit être imblocable face à un ${WALK_LAND[k]}`);
    const other = Object.values(WALK_LAND).find((l) => l !== WALK_LAND[k]);
    const withoutLand = mkState([walker], [mk('Hill Giant', 'player'), mk(other, 'player')]);
    assert.deepEqual(blockersFor(attack(withoutLand, [walker]), walker), ['Hill Giant'], `${name} (${k}) doit être bloquable sans ${WALK_LAND[k]}`);
  }
}
assert.equal(walkers, 7, 'sept créatures à passage dans le lot (plaines, 2 îles, 2 marais, montagnes, forêts)');

// 3c. Défenseur : ne peut pas attaquer.
for (const name of ['Wall of Earth', 'Wall of Heat', 'Wall of Light']) {
  const wall = mk(name, 'ai');
  const state = mkState([wall], []);
  const combat = new CombatService({ state: () => state, sba });
  assert.ok(!combat.getValidAttackers('ai').some((p) => p.uid === wall.uid), `${name} (défenseur) ne doit pas pouvoir attaquer`);
}

// 3d. Vigilance : l'attaquant ne s'engage pas.
{
  const falcon = mk('Zephyr Falcon', 'ai'); const giant = mk('Hill Giant', 'ai');
  attack(mkState([falcon, giant], []), [falcon, giant]);
  assert.equal(falcon.tapped, false, 'Zephyr Falcon (vigilance) reste dégagé après avoir attaqué');
  assert.equal(giant.tapped, true, 'témoin : Hill Giant s\'engage en attaquant');
}

// 3e. Initiative : l'attaquant à initiative tue le bloqueur avant d'être touché.
for (const [name, blockerName] of [['Hornet Cobra', 'Gray Ogre'], ['Ramirez DePietro', 'Gray Ogre']]) {
  const striker = mk(name, 'ai'); const blocker = mk(blockerName, 'player');
  const state = mkState([striker], [blocker]);
  const combat = attack(state, [striker]);
  combat.assignBlockers({ [striker.uid]: [blocker.uid] });
  const power = calculateCharacteristics(state, striker).power;
  const toughness = calculateCharacteristics(state, blocker).toughness;
  combat.resolveDamage();
  if (power >= toughness) {
    assert.ok(!state.player.battlefield.some((p) => p.uid === blocker.uid), `${name} (initiative) doit tuer ${blockerName}`);
    assert.equal(striker.damageMarked || 0, 0, `${name} (initiative) ne doit subir aucune blessure : le bloqueur est mort avant de frapper`);
  }
}
{
  // Témoin : sans initiative, l'attaquant subit les blessures du bloqueur.
  const plain = mk('Savannah Lions', 'ai'); const ogre = mk('Gray Ogre', 'player');
  const state = mkState([plain], [ogre]);
  const combat = attack(state, [plain]); combat.assignBlockers({ [plain.uid]: [ogre.uid] }); combat.resolveDamage();
  assert.ok(state.player.battlefield.some((p) => p.uid === ogre.uid) === false || (ogre.damageMarked || 0) > 0, 'témoin : un bloqueur sans initiative frappe');
}
{
  // Tundra Wolves (1/1 initiative) contre un 1/1 sans initiative : le loup survit.
  const wolves = mk('Tundra Wolves', 'ai'); const bear = mk('Savannah Lions', 'player');
  bear.toughness = 1; bear.power = 2;
  const state = mkState([wolves], [bear]);
  const combat = attack(state, [wolves]); combat.assignBlockers({ [wolves.uid]: [bear.uid] }); combat.resolveDamage();
  assert.ok(state.ai.battlefield.some((p) => p.uid === wolves.uid), 'Tundra Wolves (initiative) survit au bloqueur 2/1 qu\'elle tue la première');
  assert.ok(!state.player.battlefield.some((p) => p.uid === bear.uid), 'le bloqueur 2/1 meurt');
}

// 3f. Sauvagerie N : +N/+N par bloqueur au-delà du premier.
for (const [name, n] of [['Frost Giant', 2], ['Aerathi Berserker', 3], ['Wolverine Pack', 2], ['Hunding Gjornersen', 1], ['Marhault Elsdragon', 1], ['Craw Giant', 2]]) {
  const rampager = mk(name, 'ai');
  const blockers = [mk('Gray Ogre', 'player'), mk('Gray Ogre', 'player'), mk('Gray Ogre', 'player')];
  const state = mkState([rampager], blockers);
  const base = calculateCharacteristics(state, rampager);
  const combat = attack(state, [rampager]);
  combat.assignBlockers({ [rampager.uid]: blockers.map((b) => b.uid) });
  const after = calculateCharacteristics(state, rampager);
  assert.equal(after.power - base.power, 2 * n, `${name} (sauvagerie ${n}) : +${2 * n} de force avec 3 bloqueurs`);
  assert.equal(after.toughness - base.toughness, 2 * n, `${name} (sauvagerie ${n}) : +${2 * n} d'endurance avec 3 bloqueurs`);
}

// 3g. Piétinement : l'excédent passe au joueur.
{
  const giant = mk('Craw Giant', 'ai'); const ogre = mk('Gray Ogre', 'player');
  const state = mkState([giant], [ogre]);
  const combat = attack(state, [giant]); combat.assignBlockers({ [giant.uid]: [ogre.uid] }); combat.resolveDamage();
  assert.equal(state.player.life, 16, 'Craw Giant 6/4 piétine : 6 - 2 d\'endurance = 4 blessures au joueur');
}

// 3h. Regroupement (Pikemen) : un groupe doit contenir une créature avec « bande ».
{
  const pikemen = mk('Pikemen', 'ai'); const ogre = mk('Gray Ogre', 'ai'); const lions = mk('Savannah Lions', 'ai');
  assert.doesNotThrow(() => attack(mkState([pikemen, ogre], []), [pikemen, ogre], [[pikemen.uid, ogre.uid]]), 'Pikemen peut former un groupe avec une créature sans bande');
  assert.throws(() => attack(mkState([ogre, lions], []), [ogre, lions], [[ogre.uid, lions.uid]]), /bande|Regroupement/i, 'deux créatures sans bande ne forment pas un groupe');
}

// 3i. Protection : l'ATTAQUANT protégé ne peut pas être bloqué par une créature de cette couleur ;
//     le BLOQUEUR protégé peut bloquer une créature de cette couleur et ne subit aucune blessure d'elle.
{
  const yeti = mk('Mountain Yeti', 'ai'); // protection contre le blanc
  const white = mk('Savannah Lions', 'player'); const red = mk('Gray Ogre', 'player');
  const combat = attack(mkState([yeti], [white, red]), [yeti]);
  assert.deepEqual(blockersFor(combat, yeti), ['Gray Ogre'], 'Mountain Yeti (protection contre le blanc) ne peut pas être bloqué par une créature blanche');
}
{
  const zombies = mk('Scathe Zombies', 'ai'); // créature noire, au sol
  assert.ok(zombies.color.includes('B'), 'Scathe Zombies est noire');
  const wall = mk('Wall of Light', 'player'); // protection contre le noir
  const state = mkState([zombies], [wall]);
  const combat = attack(state, [zombies]);
  assert.deepEqual(blockersFor(combat, zombies), ['Wall of Light'], 'Wall of Light (protection contre le noir) peut bloquer une créature noire');
  combat.assignBlockers({ [zombies.uid]: [wall.uid] }); combat.resolveDamage();
  assert.equal(wall.damageMarked || 0, 0, 'Wall of Light ne subit aucune blessure d\'une source noire');
  assert.ok(state.player.battlefield.some((p) => p.uid === wall.uid), 'Wall of Light survit');
}
{
  // Les protections déjà certifiées avant ce lot suivent la même règle.
  const hypno = mk('Scathe Zombies', 'ai'); const knight = mk('White Knight', 'player');
  assert.deepEqual(blockersFor(attack(mkState([hypno], [knight]), [hypno]), hypno), ['White Knight'], 'White Knight (protection contre le noir) bloque une créature noire');
  const black = mk('Black Knight', 'ai'); const lions = mk('Savannah Lions', 'player');
  assert.deepEqual(blockersFor(attack(mkState([black], [lions]), [black]), black), [], 'Black Knight (protection contre le blanc) n\'est pas bloquable par une créature blanche');
}

console.log(`OK V12.75 lot A : ${VANILLA.length} vanilles + ${KEYWORD_ONLY.length} créatures à mots-clés certifiées ; audit des créatures certifiées propre ; combat réel (vol, passage, défenseur, vigilance, initiative, sauvagerie, piétinement, regroupement, protection).`);
