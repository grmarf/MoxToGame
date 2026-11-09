// V12.75 — Chantier 2, lot F1 : 16 cartes qui portaient déjà des données mais AUCUN statut (donc injouables).
// Chaque carte est jouée en partie réelle, avec cas positifs ET négatifs.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };

function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 20 }, (_, i) => ({ ...by('Plains'), uid: `${p}F${i}`, owner: p }));
  g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
const put = (g, s, n, x = {}) => { const p = { ...by(n), uid: `${n}#${++seq}`, owner: s, controller: s, zone: 'battlefield', summoningSickness: false, tapped: false, ...x }; g.state[s].battlefield.push(p); return p; };
const field = (g, s) => g.state[s].battlefield;
// Une action refusée restaure l'état par copie profonde : les références d'objets prises avant deviennent périmées.
const cur = (g, p) => [...g.state.player.battlefield, ...g.state.ai.battlefield].find((x) => x.uid === p.uid);
const has = (g, p) => [...field(g, 'player'), ...field(g, 'ai')].some((x) => x.uid === p.uid);
const pt = (g, p) => { const c = calculateCharacteristics(g.state, p); return [c.power, c.toughness]; };
const kw = (g, p) => calculateCharacteristics(g.state, p).keywords;
const pT = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
function settle(g) { for (let i = 0; i < 8 && (g.stack.size > 0 || g.choices.getPending()); i++) { const pe = g.choices.getPending(); if (pe) { g.choices.resolve(pe.options?.[0] ?? []); continue; } g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); } }
function cast(g, n, side = 'player', target, x = 0) { if (!/Instant|Interrupt/.test(by(n).type)) { g.state.activePlayer = side; g.turnManager.activePlayer = side; } const card = { ...by(n), uid: `${n}@${++seq}`, owner: side, controller: side }; g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.dispatch('CAST_SPELL', { card, target, xValue: x }, side); settle(g); g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; return card; }
const act = (g, perm, target) => { g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: perm, abilityIndex: 0, ability: perm.activated[0], target }, 'player'); settle(g); };

const LOT = ['Braingeyser', 'Howl from Beyond', 'Hymn to Tourach', 'Fissure', 'Weakness', 'Giant Strength', 'Earthbind', 'Hidden Path',
  'Goblin King', 'Kird Ape', 'Keldon Warlord', 'Creature Bond', 'Guardian Angel', 'Verduran Enchantress', 'Royal Assassin', 'Northern Paladin'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// Braingeyser : pioche X
for (const x of [0, 1, 4]) { const g = newGame(); cast(g, 'Braingeyser', 'player', { kind: 'player', side: 'player' }, x); assert.equal(g.state.player.hand.length, x, `Braingeyser X=${x}`); assert.equal(g.state.ai.hand.length, 0); }

// Howl from Beyond : +X/+0 jusqu'à la fin du tour
{
  const g = newGame(); const h = put(g, 'player', 'Hill Giant');
  cast(g, 'Howl from Beyond', 'player', pT(h), 3);
  assert.deepEqual(pt(g, h), [6, 3], 'Howl X=3 : 3/3 -> 6/3');
  g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.(); g.turnManager.gotoPhase('main1'); g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  assert.deepEqual(pt(g, h), [3, 3], 'cesse en fin de tour');
}

// Hymn to Tourach : l'adversaire défausse deux cartes AU HASARD
{
  const g = newGame();
  ['Forest', 'Island', 'Swamp', 'Mountain'].forEach((n, i) => g.state.ai.hand.push({ ...by(n), uid: `ah${i}`, owner: 'ai' }));
  g.state.player.hand.push({ ...by('Forest'), uid: 'ph0', owner: 'player' });
  cast(g, 'Hymn to Tourach');
  assert.equal(g.state.ai.hand.length, 2, 'deux cartes défaussées'); assert.equal(g.state.ai.graveyard.filter((c) => c.name !== 'Hymn to Tourach').length, 2, 'au cimetière adverse');
  assert.equal(g.state.player.hand.length, 1, 'votre main intacte');
  const seen = new Set();
  for (let k = 0; k < 25; k++) { const g2 = newGame(); ['Forest', 'Island', 'Swamp', 'Mountain'].forEach((n, i) => g2.state.ai.hand.push({ ...by(n), uid: `ah${i}`, owner: 'ai' })); cast(g2, 'Hymn to Tourach'); seen.add(g2.state.ai.hand.map((c) => c.name).sort().join()); }
  assert.ok(seen.size >= 3, `défausse réellement aléatoire (${seen.size} issues différentes sur 25)`);
  const g3 = newGame(); g3.state.ai.hand.push({ ...by('Forest'), uid: 'only', owner: 'ai' }); cast(g3, 'Hymn to Tourach');
  assert.equal(g3.state.ai.hand.length, 0, 'main d\'une seule carte : elle est défaussée, sans erreur');
}

const kill = (g, p) => { cur(g, p).damageMarked = 99; g.stack.sba.check(g.state); }; // blessures létales (la régénération est permise, contrairement à Fissure)
// Fissure : détruit la créature OU le terrain ciblé (et seulement lui)
{
  const g = newGame(); const a = put(g, 'ai', 'Hill Giant'); const b = put(g, 'ai', 'Serra Angel'); const land = put(g, 'ai', 'Mountain');
  cast(g, 'Fissure', 'player', pT(a));
  assert.ok(!has(g, a) && has(g, b) && has(g, land), 'seule la cible meurt');
  cast(g, 'Fissure', 'player', pT(land)); assert.ok(!has(g, land), 'Oracle : « Destroy target creature or land » — un terrain est une cible légale et il est détruit');
}

// Weakness, Giant Strength : auras, bonus permanents
{
  const g = newGame(); const h = put(g, 'ai', 'Hill Giant');
  cast(g, 'Weakness', 'player', pT(h)); assert.deepEqual(pt(g, h), [1, 2], 'Weakness -2/-1');
  g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.(); g.turnManager.gotoPhase('main1'); g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  assert.deepEqual(pt(g, h), [1, 2], 'le malus d\'une Aura persiste après la fin du tour');
  const bears = put(g, 'ai', 'Grizzly Bears'); cast(g, 'Weakness', 'player', pT(bears));
  assert.deepEqual(pt(g, bears), [0, 1], 'Grizzly Bears 2/2 -> 0/1 : survit (endurance 1)');
  const lions = put(g, 'ai', 'Savannah Lions'); cast(g, 'Weakness', 'player', pT(lions)); // 2/1 -> 0/0
  assert.ok(!has(g, lions), 'Savannah Lions 2/1 -> 0/0 : meurt, l\'Aura part avec elle');
  assert.ok(![...field(g, 'player'), ...field(g, 'ai')].some((p) => p.attachedTo === lions.uid), 'aucune Aura ne reste attachée à une créature morte'); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Weakness'), 'l\'Aura orpheline est au cimetière de son propriétaire');
}
{
  const g = newGame(); const h = put(g, 'player', 'Hill Giant');
  cast(g, 'Giant Strength', 'player', pT(h)); assert.deepEqual(pt(g, h), [5, 5], 'Giant Strength +2/+2');
  g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.(); g.turnManager.gotoPhase('main1'); g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  assert.deepEqual(pt(g, h), [5, 5], 'persiste');
  cast(g, 'Giant Strength', 'player', pT(h)); assert.deepEqual(pt(g, h), [7, 7], 'deux Auras se cumulent');
}

// Earthbind : la créature enchantée perd le vol (les autres mots-clés restent)
{
  const g = newGame(); const a = put(g, 'ai', 'Serra Angel'); const b = put(g, 'ai', 'Azure Drake');
  assert.ok(kw(g, a).includes('flying') && kw(g, a).includes('vigilance'), 'témoin : Serra Angel vole et a la vigilance');
  cast(g, 'Earthbind', 'player', pT(a));
  assert.ok(!kw(g, a).includes('flying'), 'Serra Angel perd le vol'); assert.ok(kw(g, a).includes('vigilance'), 'elle garde la vigilance'); assert.ok(kw(g, b).includes('flying'), 'les autres volants gardent le vol');
  const grounded = put(g, 'player', 'Hill Giant'); g.state.activePlayer = 'ai'; g.combat.begin(); g.combat.confirmAttackers([a], 'ai');
  assert.ok(g.combat.getValidBlockers('player', a).some((p) => p.uid === grounded.uid), 'une créature au sol peut désormais la bloquer');
}

// Hidden Path : les créatures vertes ont la forêt-marche, de tous les contrôleurs
{
  const g = newGame(); const mine = put(g, 'player', 'Llanowar Elves'); const theirs = put(g, 'ai', 'Grizzly Bears'); const red = put(g, 'player', 'Hill Giant');
  assert.ok(!kw(g, mine).includes('forestwalk'), 'témoin : pas de forestwalk avant');
  put(g, 'player', 'Hidden Path');
  assert.ok(kw(g, mine).includes('forestwalk') && kw(g, theirs).includes('forestwalk'), 'vertes alliées et adverses : forestwalk'); assert.ok(!kw(g, red).includes('forestwalk'), 'créature rouge : non');
  put(g, 'ai', 'Forest'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([mine], 'player');
  const blocker = put(g, 'ai', 'Hill Giant');
  assert.deepEqual(g.combat.getValidBlockers('ai', mine), [], 'imblocable face à une Forêt');
}

// Goblin King : tous les gobelins (lui compris, adversaires compris) +1/+1 et montagne-marche
{
  const g = newGame(); const k = put(g, 'player', 'Goblin King'); const o = put(g, 'ai', 'Mons\'s Goblin Raiders'); const x = put(g, 'player', 'Hill Giant');
  assert.deepEqual(pt(g, k), [2, 2], 'le roi ne se bonifie PAS lui-même (Oracle : « Other Goblins »)'); assert.deepEqual(pt(g, o), [2, 2], 'gobelin adverse +1/+1');
  assert.ok(kw(g, o).includes('mountainwalk') && !kw(g, k).includes('mountainwalk'), 'montagne-marche pour les autres gobelins, pas pour le roi'); assert.deepEqual(pt(g, x), [3, 3], 'non-gobelin inchangé'); assert.ok(!kw(g, x).includes('mountainwalk'));
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.uid !== k.uid);
  assert.deepEqual(pt(g, o), [1, 1], 'le roi parti, le bonus disparaît');
}

// Kird Ape : +1/+2 tant que vous contrôlez une forêt (terrains doubles de sous-type Forêt compris, pas ceux de l'adversaire)
{
  const g = newGame(); const a = put(g, 'player', 'Kird Ape');
  assert.deepEqual(pt(g, a), [1, 1], 'sans forêt'); put(g, 'ai', 'Forest'); assert.deepEqual(pt(g, a), [1, 1], 'la forêt ADVERSE ne compte pas');
  const f = put(g, 'player', 'Forest'); assert.deepEqual(pt(g, a), [2, 3], 'avec une forêt');
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.uid !== f.uid); assert.deepEqual(pt(g, a), [1, 1], 'forêt partie : retour à 1/1');
  put(g, 'player', 'Tropical Island'); assert.deepEqual(pt(g, a), [2, 3], 'Tropical Island (sous-type Forêt) compte');
}

// Keldon Warlord : force et endurance = nombre de créatures que vous contrôlez (lui compris)
{
  const g = newGame(); const w = put(g, 'player', 'Keldon Warlord');
  assert.deepEqual(pt(g, w), [1, 1], 'seul : 1/1'); put(g, 'player', 'Hill Giant'); put(g, 'player', 'Llanowar Elves'); put(g, 'ai', 'Serra Angel'); put(g, 'player', 'Mountain');
  assert.deepEqual(pt(g, w), [3, 3], '3 créatures à vous (l\'adverse et le terrain ne comptent pas)');
}

// Creature Bond (Oracle) : quand la créature enchantée meurt, l'Aura inflige à son contrôleur des blessures égales à l'endurance de la créature
{
  const g = newGame(); const b = put(g, 'player', 'Grizzly Bears'); const other = put(g, 'player', 'Hill Giant');
  cast(g, 'Creature Bond', 'player', pT(b)); const life0 = g.state.player.life;
  cast(g, 'Fissure', 'ai', pT(other)); assert.equal(g.state.player.life, life0, 'mort d\'une créature NON enchantée : aucune blessure');
  cast(g, 'Fissure', 'ai', pT(b)); assert.ok(!has(g, b), 'la créature enchantée meurt'); assert.equal(g.state.player.life, life0 - 2, 'Grizzly Bears (endurance 2) : 2 blessures à son contrôleur');
}

// Guardian Angel : bouclier de régénération sur la créature ciblée
{
  const g = newGame(); const h = put(g, 'player', 'Hill Giant'); const o = put(g, 'player', 'Serra Angel');
  cast(g, 'Guardian Angel', 'player', pT(h), 0);
  cast(g, 'Fissure', 'ai', pT(o)); assert.ok(!has(g, o), 'témoin : une créature sans bouclier meurt');
  kill(g, h); assert.ok(has(g, h), 'la créature avec bouclier est régénérée au lieu de mourir'); assert.ok(cur(g, h).tapped, 'régénérée : engagée');
  kill(g, h); assert.ok(!has(g, h), 'le bouclier est consommé : la 2e destruction réussit');
  { const g2 = newGame(); const h2 = put(g2, 'player', 'Hill Giant'); cast(g2, 'Guardian Angel', 'player', pT(h2), 0); cast(g2, 'Fissure', 'ai', pT(h2)); assert.ok(!has(g2, h2), 'Fissure : « It can\'t be regenerated » — le bouclier ne sauve pas la créature'); }
}

// Verduran Enchantress : piochez en lançant un sort d'ENCHANTEMENT (le vôtre uniquement)
{
  const g = newGame(); const e = put(g, 'player', 'Verduran Enchantress'); const h = put(g, 'player', 'Hill Giant');
  cast(g, 'Giant Strength', 'player', pT(h)); assert.equal(g.state.player.hand.length, 1, 'enchantement lancé : une carte piochée');
  assert.equal(g.state.player.hand[0].zone, 'hand', 'la carte piochée est bien marquée « main » (régression du banc, graine 802 : elle restait marquée « library », invariant I3)');
  g.state.player.hand.length = 0; cast(g, 'Braingeyser', 'player', { kind: 'player', side: 'player' }, 0); assert.equal(g.state.player.hand.length, 0, 'sort non-enchantement : rien');
  g.state.player.hand.length = 0; const foe = put(g, 'ai', 'Hill Giant'); cast(g, 'Weakness', 'ai', pT(foe)); assert.equal(g.state.player.hand.length, 0, 'enchantement ADVERSE : rien');
  assert.ok(has(g, e));
}

// Royal Assassin : {T} : détruisez la créature ENGAGÉE ciblée
{
  const g = newGame(); const a = put(g, 'player', 'Royal Assassin'); const up = put(g, 'ai', 'Hill Giant'); const tp = put(g, 'ai', 'Serra Angel', { tapped: true });
  assert.throws(() => act(g, a, pT(up)), /illégale|cible/i, 'créature dégagée : cible illégale'); assert.ok(has(g, up) && !cur(g, a).tapped, 'rien payé, rien détruit');
  act(g, a, pT(tp)); assert.ok(!has(g, tp), 'créature engagée détruite'); assert.ok(cur(g, a).tapped, 'l\'Assassin s\'engage');
  assert.throws(() => act(g, a, pT(put(g, 'ai', 'Hill Giant', { tapped: true }))), /engag|priorité|Coût|illégale/i, 'déjà engagé : ne peut pas réactiver');
}

// Northern Paladin : {W}{W},{T} : détruisez le permanent NOIR ciblé
{
  const g = newGame(); const p = put(g, 'player', 'Northern Paladin'); const black = put(g, 'ai', 'Scathe Zombies'); const red = put(g, 'ai', 'Hill Giant'); const swamp = put(g, 'ai', 'Swamp');
  assert.throws(() => act(g, p, pT(red)), /illégale|cible/i, 'permanent rouge : illégal'); assert.throws(() => act(g, p, pT(swamp)), /illégale|cible/i, 'terrain (incolore) : illégal');
  assert.ok(has(g, red) && has(g, swamp) && !cur(g, p).tapped, 'rien payé');
  act(g, p, pT(black)); assert.ok(!has(g, black), 'créature noire détruite'); assert.ok(cur(g, p).tapped, 'le Paladin s\'engage (coût {T})');
  const g2 = newGame(); const p2 = put(g2, 'player', 'Northern Paladin'); const b2 = put(g2, 'ai', 'Scathe Zombies'); g2.state.player.mana = { W: 1, C: 0, U: 0, B: 0, R: 0, G: 0 };
  assert.throws(() => { g2.state.priorityHolder = 'player'; g2.dispatch('ACTIVATE_ABILITY', { permanent: p2, abilityIndex: 0, ability: p2.activated[0], target: pT(b2) }, 'player'); }, /illégale|invalide|mana|Coût/i, 'un seul {W} : coût {W}{W} impayable');
}

console.log(`OK V12.75 lot F1 : ${LOT.length} cartes sans statut certifiées en partie réelle (cas positifs et négatifs).`);
