// V12.75 — Chantier 2, lot E : sorts dont le montant dépend du plateau (X, nombre de terrains, cartes en main...).
// 13 cartes jouées en partie réelle (GameFacade : CAST_SPELL, pile, combat, choix, actions d'état).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
const LIB = 20;

function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: LIB }, (_, i) => ({ ...by('Plains'), uid: `${p}F${i}`, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai');
  g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
function put(g, side, name, extra = {}) {
  const p = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, ...extra };
  g.state[side].battlefield.push(p);
  return p;
}
const field = (g, side) => g.state[side].battlefield;
const has = (g, p) => [...field(g, 'player'), ...field(g, 'ai')].some((x) => x.uid === p.uid);
const pt = (g, p) => { const c = calculateCharacteristics(g.state, p); return [c.power, c.toughness]; };
const permTarget = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
const playerTarget = (side) => ({ kind: 'player', side, id: side });
function settle(g) {
  for (let i = 0; i < 8 && (g.stack.size > 0 || g.choices.getPending()); i++) {
    if (g.choices.getPending()) { const pend = g.choices.getPending(); g.choices.resolve(pend.options?.[0] ?? []); continue; }
    g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  }
}
function cast(g, name, side = 'player', target = undefined, xValue = 0) {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side;
  g.dispatch('CAST_SPELL', { card, target, xValue }, side);
  settle(g);
  return card;
}

// ── 1. Données ───────────────────────────────────────────────────────────
const LOT = ['Typhoon', 'Storm Seeker', 'Jovial Evil', 'Eternal Flame', 'Riptide', 'Sandstorm', 'Crumble', 'Divine Offering',
  'Winds of Change', 'Earthquake', 'Great Defender', 'Icatian Town', 'Untamed Wilds'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 2. Typhoon : autant de blessures que d'Îles contrôlées par l'ADVERSAIRE ──
{
  const g = newGame();
  put(g, 'ai', 'Island'); put(g, 'ai', 'Island'); put(g, 'ai', 'Tropical Island'); put(g, 'ai', 'Volcanic Island'); // 4 Îles (doubles comprises)
  put(g, 'ai', 'Forest'); put(g, 'ai', 'Mountain');
  put(g, 'player', 'Island'); put(g, 'player', 'Island'); put(g, 'player', 'Island'); // les vôtres ne comptent pas
  cast(g, 'Typhoon');
  assert.equal(g.state.ai.life, 16, 'Typhoon : 4 Îles adverses = 4 blessures');
  assert.equal(g.state.player.life, 20, 'vous ne subissez rien');
}
{
  const g = newGame(); put(g, 'ai', 'Forest'); put(g, 'player', 'Island');
  cast(g, 'Typhoon');
  assert.equal(g.state.ai.life, 20, 'Typhoon : aucune Île adverse = 0 blessure');
}

// ── 3. Storm Seeker : cartes dans la main du joueur CIBLÉ ────────────────
for (const side of ['ai', 'player']) {
  const g = newGame();
  const handOf = (s, n) => { for (let i = 0; i < n; i++) g.state[s].hand.push({ ...by('Plains'), uid: `h${s}${i}`, owner: s }); };
  handOf('ai', 5); handOf('player', 2);
  const expected = side === 'ai' ? 5 : 2; // le sort lui-même a quitté votre main en étant lancé
  cast(g, 'Storm Seeker', 'player', playerTarget(side));
  assert.equal(g.state[side].life, 20 - expected, `Storm Seeker sur ${side} : ${expected} blessures (taille de sa main)`);
  assert.equal(g.state[side === 'ai' ? 'player' : 'ai'].life, 20, 'l\'autre joueur n\'est pas touché');
}

// ── 4. Jovial Evil : le DOUBLE des créatures blanches de l'adversaire ciblé ──
{
  const g = newGame();
  put(g, 'ai', 'Savannah Lions'); put(g, 'ai', 'Serra Angel'); put(g, 'ai', 'Hill Giant'); put(g, 'ai', 'Plains');
  put(g, 'player', 'Savannah Lions'); // la vôtre ne compte pas
  cast(g, 'Jovial Evil', 'player', playerTarget('ai'));
  assert.equal(g.state.ai.life, 16, 'Jovial Evil : 2 créatures blanches = 4 blessures');
}
{
  const g = newGame(); put(g, 'player', 'Savannah Lions');
  assert.throws(() => cast(g, 'Jovial Evil', 'player', playerTarget('player')), /illégale|cible/i, 'Jovial Evil ne peut viser que l\'adversaire');
}

// ── 5. Eternal Flame : X = VOS Montagnes ; X à l'adversaire, la moitié (arrondie au supérieur) à vous ──
for (const [mountains, foe, self] of [[3, 3, 2], [4, 4, 2], [1, 1, 1], [5, 5, 3]]) {
  const g = newGame();
  const lands = ['Mountain', 'Mountain', 'Mountain', 'Volcanic Island', 'Mountain'].slice(0, mountains);
  lands.forEach((n) => put(g, 'player', n));
  put(g, 'ai', 'Mountain'); put(g, 'ai', 'Mountain'); // les siennes ne comptent pas
  cast(g, 'Eternal Flame', 'player', playerTarget('ai'));
  assert.equal(g.state.ai.life, 20 - foe, `Eternal Flame (${mountains} Montagnes) : ${foe} blessures à l'adversaire`);
  assert.equal(g.state.player.life, 20 - self, `Eternal Flame (${mountains} Montagnes) : ${self} blessures à vous (moitié arrondie au supérieur)`);
}
{
  const g = newGame(); put(g, 'player', 'Mountain');
  assert.throws(() => cast(g, 'Eternal Flame', 'player', playerTarget('player')), /illégale|cible/i, 'Eternal Flame ne peut viser que l\'adversaire');
}

// ── 6. Riptide : engagez toutes les créatures BLEUES (Oracle : « Tap all blue creatures ») ───
{
  const g = newGame();
  const mine = put(g, 'player', 'Hill Giant'); const flyer = put(g, 'player', 'Serra Angel');
  const foe = put(g, 'ai', 'Grizzly Bears'); const foeFlyer = put(g, 'ai', 'Azure Drake'); const land = put(g, 'ai', 'Plains');
  cast(g, 'Riptide', 'ai');
  assert.ok(foeFlyer.tapped, 'Riptide : la créature bleue (Azure Drake) est engagée');
  assert.ok(!mine.tapped && !foe.tapped && !flyer.tapped, 'Riptide : les créatures non bleues ne sont pas touchées (même sans vol)');
  assert.ok(!land.tapped, 'Riptide : les terrains ne sont pas touchés');
}

// ── 7. Sandstorm : 1 blessure à chaque créature ATTAQUANTE ───────────────
{
  const g = newGame();
  const elf = put(g, 'player', 'Llanowar Elves'); const giant = put(g, 'player', 'Hill Giant'); const idle = put(g, 'player', 'Grizzly Bears');
  const foe = put(g, 'ai', 'Hill Giant');
  g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([elf, giant], 'player');
  cast(g, 'Sandstorm', 'ai');
  assert.ok(!has(g, elf), 'Sandstorm : l\'attaquant 1/1 meurt');
  assert.equal(giant.damageMarked || 0, 1, 'Sandstorm : l\'attaquant 3/3 reçoit 1 blessure');
  assert.equal(idle.damageMarked || 0, 0, 'Sandstorm : une créature qui n\'attaque pas n\'est pas touchée');
  assert.equal(foe.damageMarked || 0, 0, 'Sandstorm : les créatures adverses non attaquantes non plus');
}

// ── 8. Crumble / Divine Offering : destruction + vie égale au coût converti ──
const bigArtifact = CARDS.filter((c) => /^Artifact$/.test(c.type) && c.cmc >= 3).sort((a, b) => b.cmc - a.cmc)[0];
assert.ok(bigArtifact, 'un artefact de coût >= 3 existe dans la base');
for (const [spell, caster, owner, gainer] of [['Crumble', 'player', 'ai', 'ai'], ['Crumble', 'player', 'player', 'player'], ['Divine Offering', 'player', 'ai', 'player'], ['Divine Offering', 'ai', 'player', 'ai']]) {
  const g = newGame();
  const art = put(g, owner, bigArtifact.name);
  g.state[caster].life = 10; g.state[owner].life = 10;
  const other = gainer === 'player' ? 'ai' : 'player';
  g.state[other].life = 10; g.state[gainer].life = 10;
  cast(g, spell, caster, permTarget(art));
  assert.ok(!has(g, art), `${spell} : ${bigArtifact.name} détruit`);
  assert.equal(g.state[gainer].life, 10 + bigArtifact.cmc, `${spell} (artefact de ${owner}, lancé par ${caster}) : ${gainer} gagne ${bigArtifact.cmc} PV (coût converti)`);
  assert.equal(g.state[other].life, 10, `${spell} : l'autre joueur ne gagne rien`);
}
{
  const g = newGame(); const hill = put(g, 'ai', 'Hill Giant');
  assert.throws(() => cast(g, 'Crumble', 'player', permTarget(hill)), /illégale|cible/i, 'Crumble ne peut viser qu\'un artefact');
}

// ── 9. Winds of Change : chaque joueur remélange sa main et repioche autant ──
// Le moteur donne une nouvelle identité à une carte à chaque changement de zone (règle 400.7) : la conservation
// se vérifie donc par les NOMS (cartes toutes distinctes des « Plains » de remplissage), pas par les identifiants.
{
  const g = newGame();
  const giveNamed = (s, names) => names.forEach((n, i) => g.state[s].hand.push({ ...by(n), uid: `${s}w${i}`, owner: s }));
  giveNamed('player', ['Forest', 'Island', 'Swamp']); giveNamed('ai', ['Mountain', 'Forest', 'Island', 'Swamp', 'Mountain']);
  cast(g, 'Winds of Change');
  const nonFiller = (side) => [...g.state[side].hand, ...g.state[side].library].map((c) => c.name).filter((n) => n !== 'Plains').sort();
  assert.equal(g.state.player.hand.length, 3, 'vous repiochez autant de cartes que vous en aviez (3)');
  assert.equal(g.state.ai.hand.length, 5, 'l\'adversaire repioche autant (5)');
  assert.deepEqual(nonFiller('player'), ['Forest', 'Island', 'Swamp'], 'vos 3 cartes sont conservées (en main ou en bibliothèque), rien créé ni perdu');
  assert.deepEqual(nonFiller('ai'), ['Forest', 'Island', 'Mountain', 'Mountain', 'Swamp'], 'les 5 cartes de l\'adversaire sont conservées');
  assert.equal(g.state.player.library.length, LIB, 'taille de votre bibliothèque inchangée (3 mélangées, 3 piochées)');
  assert.equal(g.state.ai.library.length, LIB, 'taille de la bibliothèque adverse inchangée');
}
{
  // Sur de nombreuses tentatives, la main change réellement (la main de départ ne revient pas à l'identique à chaque fois).
  let changed = 0;
  for (let k = 0; k < 12; k++) {
    const g = newGame();
    ['Forest', 'Island', 'Swamp'].forEach((n, i) => g.state.player.hand.push({ ...by(n), uid: `pw${i}`, owner: 'player' }));
    cast(g, 'Winds of Change');
    if (g.state.player.hand.map((c) => c.name).sort().join() !== 'Forest,Island,Swamp') changed++;
  }
  assert.ok(changed >= 8, `la main est réellement remélangée dans la bibliothèque (changée ${changed}/12 fois)`);
}
{
  // Main vide : aucune pioche, aucune erreur.
  const g = newGame(); cast(g, 'Winds of Change');
  assert.equal(g.state.player.hand.length, 0); assert.equal(g.state.ai.hand.length, 0);
}

// ── 10. Earthquake : X blessures à chaque créature SANS vol et à chaque joueur ──
for (const x of [0, 3]) {
  const g = newGame();
  const giant = put(g, 'player', 'Hill Giant'); const angel = put(g, 'player', 'Serra Angel'); const foeBear = put(g, 'ai', 'Grizzly Bears'); const foeDrake = put(g, 'ai', 'Azure Drake');
  cast(g, 'Earthquake', 'player', undefined, x);
  assert.equal(g.state.player.life, 20 - x, `Earthquake X=${x} : vous perdez ${x} PV`); assert.equal(g.state.ai.life, 20 - x, `Earthquake X=${x} : l'adversaire perd ${x} PV`);
  assert.equal(has(g, giant), x < 3, `Earthquake X=${x} : Hill Giant 3/3 ${x < 3 ? 'survit' : 'meurt'}`);
  assert.equal(has(g, foeBear), x < 2, `Earthquake X=${x} : Grizzly Bears ${x < 2 ? 'survit' : 'meurt'}`);
  assert.ok(has(g, angel) && has(g, foeDrake), `Earthquake X=${x} : les créatures avec vol ne sont jamais touchées`);
  assert.equal(angel.damageMarked || 0, 0); assert.equal(foeDrake.damageMarked || 0, 0);
}

// ── 11. Great Defender : +0/+X, X = coût converti de la créature ciblée ──
{
  const g = newGame();
  const lions = put(g, 'player', 'Savannah Lions'); const giant = put(g, 'player', 'Hill Giant');
  cast(g, 'Great Defender', 'player', permTarget(lions));
  assert.deepEqual(pt(g, lions), [2, 1 + by('Savannah Lions').cmc], `Savannah Lions (coût ${by('Savannah Lions').cmc}) : +0/+${by('Savannah Lions').cmc}`);
  cast(g, 'Great Defender', 'player', permTarget(giant));
  assert.deepEqual(pt(g, giant), [3, 3 + by('Hill Giant').cmc], `Hill Giant (coût ${by('Hill Giant').cmc}) : +0/+${by('Hill Giant').cmc}`);
  assert.equal(pt(g, giant)[0], 3, 'la force n\'est pas modifiée');
  g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.();
  assert.deepEqual(pt(g, giant), [3, 3], 'le bonus cesse à la fin du tour');
}

// ── 12. Icatian Town : quatre jetons Soldat 1/1 blancs ────────────────────
{
  const g = newGame();
  cast(g, 'Icatian Town');
  const soldiers = field(g, 'player').filter((p) => p.token);
  assert.equal(soldiers.length, 4, 'quatre jetons');
  for (const t of soldiers) {
    assert.deepEqual(pt(g, t), [1, 1], 'jeton 1/1'); assert.ok(calculateCharacteristics(g.state, t).color.includes('W'), 'jeton blanc');
    assert.ok(/Soldier/i.test(String(calculateCharacteristics(g.state, t).subtype)), 'jeton Soldat'); assert.equal(t.controller, 'player', 'sous votre contrôle');
  }
  assert.equal(field(g, 'ai').length, 0, 'rien côté adversaire');
  // Régression (lot G) : les jetons étaient typés « createToken » (le type d'EFFET) : ni créatures, ni capables d'attaquer ou de bloquer.
  for (const t of soldiers) { assert.ok(/Creature/.test(calculateCharacteristics(g.state, t).type), 'un jeton Soldat est une créature'); t.summoningSickness = false; }
  g.state.activePlayer = 'player'; g.combat.begin(); assert.ok(soldiers.every((t) => g.combat.getValidAttackers('player').some((p) => p.uid === t.uid)), 'les quatre jetons peuvent attaquer');
}

// ── 13. Untamed Wilds : un terrain de BASE de la bibliothèque, en jeu (pas en main), puis mélange ──
{
  const g = newGame();
  const lib = g.state.player.library;
  lib.push({ ...by('Forest'), uid: 'libForest', owner: 'player' }, { ...by('Karakas'), uid: 'libKarakas', owner: 'player' },
    { ...by('Tropical Island'), uid: 'libTropical', owner: 'player' }, { ...by('Hill Giant'), uid: 'libGiant', owner: 'player' });
  const seen = [];
  const card = { ...by('Untamed Wilds'), uid: `uw#${++seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(card); g.state.player.mana = { ...FULL };
  g.dispatch('CAST_SPELL', { card, xValue: 0 }, 'player');
  for (let i = 0; i < 8 && (g.stack.size > 0 || g.choices.getPending()); i++) {
    const pend = g.choices.getPending();
    if (pend) { seen.push(...pend.options.map((c) => c.name)); const pick = pend.options.find((c) => c.uid === 'libForest') || pend.options[0]; g.choices.resolve(pick); continue; }
    g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  }
  if (seen.length) {
    assert.ok(seen.every((n) => ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'].includes(n)), `seuls des terrains de base sont proposés (vu : ${[...new Set(seen)]})`);
    assert.ok(!seen.includes('Karakas') && !seen.includes('Tropical Island') && !seen.includes('Hill Giant'), 'ni terrain spécial, ni créature');
  }
  const gained = field(g, 'player').filter((p) => /Land/.test(p.type));
  assert.equal(gained.length, 1, 'un seul terrain arrive en jeu');
  assert.ok(['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'].includes(gained[0].name), 'c\'est un terrain de base');
  assert.ok(!g.state.player.hand.some((c) => c.name === gained[0].name), 'il n\'est pas en main');
  assert.ok(!gained[0].tapped, 'il entre dégagé');
  assert.ok(g.state.player.library.some((c) => c.uid === 'libKarakas') && g.state.player.library.some((c) => c.uid === 'libGiant'), 'les cartes non choisies restent en bibliothèque');
}

console.log(`OK V12.75 lot E : ${LOT.length} sorts calculés certifiés en partie réelle (Îles, main, créatures blanches, Montagnes, X, coût converti, jetons, terrain de base).`);
