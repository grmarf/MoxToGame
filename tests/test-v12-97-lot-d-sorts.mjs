// V12.75 — Chantier 2, lot D : sorts à cible simple et destructions de masse filtrées.
// 14 cartes jouées en partie réelle (GameFacade : CAST_SPELL, pile, combat, actions d'état).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };

function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai');
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
const inZone = (g, side, zone, name) => g.state[side][zone].some((c) => c.name === name);
const permTarget = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
function mkCard(name, side) { return { ...by(name), uid: `${name}#${++seq}`, owner: side, controller: side }; }
function settle(g) { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); }
function cast(g, name, side = 'player', target = undefined) {
  const card = mkCard(name, side);
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: 0 }, side);
  settle(g);
  return card;
}
const castNoResolve = (g, name, side, target) => {
  const card = mkCard(name, side);
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: 0 }, side);
  return card;
};

// ── 1. Données ───────────────────────────────────────────────────────────
const LOT = ['Boomerang', 'Desert Twister', 'Resurrection', 'Holy Day', 'Darkness', 'Inferno', 'Flash Counter', 'Artifact Blast',
  'Cleanse', "Tivadar's Crusade", "Martyr's Cry", 'Tsunami', 'Acid Rain', 'Shatterstorm'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 2. Boomerang : tout permanent, retour dans la main de son PROPRIÉTAIRE ──
for (const [name, side] of [['Hill Giant', 'ai'], ['Plains', 'ai'], ['Sol Ring', 'player'], ['Holy Strength', 'player']]) {
  const g = newGame();
  const host = put(g, 'player', 'Grizzly Bears');
  const t = put(g, side, name, name === 'Holy Strength' ? { attachedTo: host.uid } : {});
  cast(g, 'Boomerang', 'player', permTarget(t));
  assert.ok(!has(g, t), `Boomerang : ${name} quitte le champ de bataille`);
  assert.ok(inZone(g, t.owner, 'hand', name), `Boomerang : ${name} retourne dans la main de son propriétaire`);
}
{
  // Boomerang n'est pas limité aux créatures (Unsummon l'est) et ne ratisse pas large.
  const g = newGame(); const a = put(g, 'ai', 'Hill Giant'); const b = put(g, 'ai', 'Serra Angel');
  cast(g, 'Boomerang', 'player', permTarget(a));
  assert.ok(has(g, b), 'une seule cible touchée');
}

// ── 3. Desert Twister : tout permanent ───────────────────────────────────
for (const name of ['Hill Giant', 'Mountain', 'Sol Ring']) {
  const g = newGame(); const t = put(g, 'ai', name); const witness = put(g, 'ai', 'Serra Angel');
  cast(g, 'Desert Twister', 'player', permTarget(t));
  assert.ok(!has(g, t) && inZone(g, 'ai', 'graveyard', name), `Desert Twister détruit ${name}`);
  assert.ok(has(g, witness), 'les autres permanents ne sont pas touchés');
}

// ── 4. Resurrection : créature de VOTRE cimetière, remise en jeu sous votre contrôle ──
{
  const g = newGame();
  const dead = { ...by('Serra Angel'), uid: 'dead1', owner: 'player', controller: 'player', zone: 'graveyard' };
  const spellInGy = { ...by('Lightning Bolt'), uid: 'bolt1', owner: 'player', zone: 'graveyard' };
  const foe = { ...by('Hill Giant'), uid: 'foeDead', owner: 'ai', controller: 'ai', zone: 'graveyard' };
  g.state.player.graveyard.push(dead, spellInGy); g.state.ai.graveyard.push(foe);
  assert.throws(() => cast(g, 'Resurrection', 'player', { kind: 'graveyardCard', uid: 'foeDead', card: foe }), /illégale|cible/i, 'cimetière adverse : cible illégale');
  g.state.player.hand.length = 0; g.state.player.graveyard = g.state.player.graveyard.filter((c) => c.name !== 'Resurrection');
  assert.throws(() => cast(g, 'Resurrection', 'player', { kind: 'graveyardCard', uid: 'bolt1', card: spellInGy }), /illégale|cible/i, 'carte non-créature : cible illégale');
  g.state.player.hand.length = 0;
  cast(g, 'Resurrection', 'player', { kind: 'graveyardCard', uid: 'dead1', card: dead });
  assert.ok(field(g, 'player').some((p) => p.name === 'Serra Angel'), 'Serra Angel revient sur le champ de bataille');
  assert.ok(!inZone(g, 'player', 'graveyard', 'Serra Angel'), 'et quitte le cimetière');
  assert.ok(!inZone(g, 'player', 'hand', 'Serra Angel'), 'elle n\'est pas en main (≠ Raise Dead)');
  const back = field(g, 'player').find((p) => p.name === 'Serra Angel');
  assert.deepEqual([calculateCharacteristics(g.state, back).power, calculateCharacteristics(g.state, back).toughness], [4, 4], 'caractéristiques normales');
}

// ── 5. Holy Day / Darkness : prévention de tous les dégâts de combat ──────
function unblockedHit(g, attacker) {
  g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([attacker], 'player');
  g.combat.assignBlockers({});
  const before = g.state.ai.life; g.combat.resolveDamage();
  return before - g.state.ai.life;
}
{
  const g = newGame(); const giant = put(g, 'player', 'Hill Giant');
  assert.equal(unblockedHit(g, giant), 3, 'témoin : sans sort, 3 dégâts');
}
for (const name of ['Holy Day', 'Darkness']) {
  const g = newGame(); const giant = put(g, 'player', 'Hill Giant');
  cast(g, name, name === 'Holy Day' ? 'player' : 'ai');
  assert.equal(unblockedHit(g, giant), 0, `${name} : aucun dégât de combat`);
  g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.();
  giant.tapped = false;
  assert.equal(unblockedHit(g, giant), 3, `${name} : l'effet cesse avec le tour`);
}

// ── 6. Inferno : 6 blessures à chaque créature et à chaque joueur ─────────
{
  const g = newGame();
  const angel = put(g, 'player', 'Serra Angel'); const giant = put(g, 'ai', 'Hill Giant');
  const prot = put(g, 'ai', 'Wall of Light'); // 1/5 : meurt à 6 aussi (endurance 5)
  const dragon = put(g, 'ai', 'Nicol Bolas');
  cast(g, 'Inferno', 'player');
  const bolas = calculateCharacteristics(g.state, dragon).toughness;
  assert.ok(!has(g, angel) && !has(g, giant) && !has(g, prot), 'créatures d\'endurance <= 6 détruites, des deux côtés');
  assert.equal(has(g, dragon), bolas > 6, `Nicol Bolas (endurance ${bolas}) ${bolas > 6 ? 'survit' : 'meurt'} à 6 blessures`);
  assert.equal(g.state.player.life, 14, 'vous perdez 6 PV'); assert.equal(g.state.ai.life, 14, 'l\'adversaire perd 6 PV');
}

// ── 7. Contre-sorts conditionnels ────────────────────────────────────────
function counterDuel(counterName, victimName, victimTarget) {
  const g = newGame(); put(g, 'player', 'Hill Giant'); put(g, 'ai', 'Hill Giant'); put(g, 'ai', 'Mountain');
  // L'actif (joueur) lance la victime en phase principale ; l'adversaire répond à vitesse d'éphémère.
  const victim = castNoResolve(g, victimName, 'player', victimTarget && victimTarget(g));
  const item = g.stack.items.find((it) => it.source?.uid === victim.uid);
  assert.ok(item, `${victimName} est sur la pile`);
  let threw = null;
  try { cast(g, counterName, 'ai', { kind: 'stackItem', id: item.id }); } catch (e) { threw = e; }
  return { g, victim, threw };
}
{
  const { g, victim, threw } = counterDuel('Flash Counter', 'Lightning Bolt', (g) => permTarget(field(g, 'ai')[0]));
  assert.equal(threw, null, 'Flash Counter peut cibler un éphémère');
  assert.ok(inZone(g, 'player', 'graveyard', 'Lightning Bolt'), 'Lightning Bolt contrecarré au cimetière');
  assert.ok(field(g, 'ai').some((p) => p.name === 'Hill Giant' && !(p.damageMarked > 0)), 'la cible de l\'éphémère (Hill Giant) n\'a subi aucune blessure');
}
{
  const { threw } = counterDuel('Flash Counter', 'Sinkhole', (g) => permTarget(field(g, 'ai').find((p) => /Land/.test(p.type)) || field(g, 'ai')[0]));
  assert.ok(threw, 'Flash Counter ne peut PAS cibler un rituel (Sinkhole)');
}
{
  const { threw } = counterDuel('Flash Counter', 'Grizzly Bears');
  assert.ok(threw, 'Flash Counter ne peut PAS cibler un sort de créature');
}
{
  const { g, threw } = counterDuel('Artifact Blast', 'Sol Ring');
  assert.equal(threw, null, 'Artifact Blast peut cibler un sort d\'artefact');
  assert.ok(inZone(g, 'player', 'graveyard', 'Sol Ring') && !field(g, 'player').some((p) => p.name === 'Sol Ring'), 'Sol Ring contrecarré, jamais en jeu');
}
{
  const { threw } = counterDuel('Artifact Blast', 'Lightning Bolt', (g) => permTarget(field(g, 'ai')[0]));
  assert.ok(threw, 'Artifact Blast ne peut PAS cibler un éphémère non-artefact');
}

// ── 8. Destructions de masse filtrées ────────────────────────────────────
const gone = (g, p) => !has(g, p);
{
  // Cleanse : toutes les créatures noires, des deux côtés ; pas les autres.
  const g = newGame();
  const myB = put(g, 'player', 'Scathe Zombies'); const foeB = put(g, 'ai', 'Hypnotic Specter'); const gold = put(g, 'ai', 'Dakkon Blackblade');
  const white = put(g, 'player', 'Savannah Lions'); const green = put(g, 'ai', 'Grizzly Bears');
  assert.ok(calculateCharacteristics(g.state, gold).color.includes('B'), 'Dakkon est (aussi) noir');
  cast(g, 'Cleanse', 'player');
  assert.ok(gone(g, myB) && gone(g, foeB) && gone(g, gold), 'Cleanse : toutes les créatures noires, y compris multicolores');
  assert.ok(has(g, white) && has(g, green), 'Cleanse : les autres couleurs survivent');
}
{
  const g = newGame();
  const gobs = ['Mons\'s Goblin Raiders', 'Goblin Hero'].map((n, i) => put(g, i ? 'ai' : 'player', n));
  const elf = put(g, 'player', 'Llanowar Elves'); const land = put(g, 'ai', 'Mountain');
  cast(g, "Tivadar's Crusade", 'player');
  assert.ok(gobs.every((p) => gone(g, p)), 'Tivadar\'s Crusade : tous les gobelins, des deux côtés');
  assert.ok(has(g, elf) && has(g, land), 'les non-gobelins survivent');
}
{
  // Martyr's Cry : EXIL des créatures blanches (ni cimetière, ni régénération).
  const g = newGame();
  const w1 = put(g, 'player', 'Savannah Lions'); const w2 = put(g, 'ai', 'Serra Angel', { regenShield: true }); const other = put(g, 'ai', 'Hill Giant');
  cast(g, "Martyr's Cry", 'player');
  assert.ok(gone(g, w1) && gone(g, w2), 'Martyr\'s Cry : créatures blanches parties');
  assert.ok(inZone(g, 'player', 'exile', 'Savannah Lions') && inZone(g, 'ai', 'exile', 'Serra Angel'), 'elles sont EXILÉES');
  assert.ok(!inZone(g, 'player', 'graveyard', 'Savannah Lions') && !inZone(g, 'ai', 'graveyard', 'Serra Angel'), 'pas au cimetière');
  assert.ok(has(g, other), 'non-blanche indemne');
}
{
  // Tsunami : toutes les Îles, y compris les terrains doubles de sous-type Île ; Acid Rain : toutes les Forêts.
  const g = newGame();
  const island = put(g, 'player', 'Island'); const tropical = put(g, 'ai', 'Tropical Island'); const forest = put(g, 'ai', 'Forest');
  const volcanic = put(g, 'player', 'Volcanic Island'); const mountain = put(g, 'player', 'Mountain'); const creature = put(g, 'ai', 'Hill Giant');
  cast(g, 'Tsunami', 'player');
  assert.ok(gone(g, island) && gone(g, tropical) && gone(g, volcanic), 'Tsunami : Island, Tropical Island et Volcanic Island détruites');
  assert.ok(has(g, forest) && has(g, mountain) && has(g, creature), 'Tsunami : Forêt, Montagne et créature indemnes');
}
{
  const g = newGame();
  const forest = put(g, 'player', 'Forest'); const tropical = put(g, 'ai', 'Tropical Island'); const island = put(g, 'ai', 'Island'); const plains = put(g, 'player', 'Plains');
  cast(g, 'Acid Rain', 'player');
  assert.ok(gone(g, forest) && gone(g, tropical), 'Acid Rain : Forest et Tropical Island détruites');
  assert.ok(has(g, island) && has(g, plains), 'Acid Rain : Île et Plaine indemnes');
}
{
  // Shatterstorm : tous les artefacts, sans régénération ; pas les terrains ni les créatures.
  const g = newGame();
  const ring = put(g, 'player', 'Sol Ring'); const mox = put(g, 'ai', 'Mox Pearl'); const land = put(g, 'ai', 'Plains'); const giant = put(g, 'player', 'Hill Giant');
  // Aucune créature-artefact réelle dans la base : on en fabrique une avec un bouclier de régénération.
  const golem = put(g, 'ai', 'Hill Giant', { type: 'Artifact Creature', regenShield: true });
  cast(g, 'Shatterstorm', 'player');
  assert.ok(gone(g, ring) && gone(g, mox), 'Shatterstorm : tous les artefacts détruits');
  assert.ok(gone(g, golem), 'Shatterstorm : un bouclier de régénération ne sauve pas (ils ne peuvent pas être régénérés)');
  assert.ok(has(g, land) && has(g, giant), 'terrain et créature non-artefact indemnes');
}

console.log(`OK V12.75 lot D : ${LOT.length} sorts certifiés en partie réelle (cibles, Resurrection, prévention, Inferno, contre-sorts conditionnels, destructions de masse filtrées).`);
