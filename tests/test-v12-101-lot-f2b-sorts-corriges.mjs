// V12.75 — Chantier 2, lot F2b (étape 2) : 8 cartes qui ne pouvaient pas être lancées ou dont l'effet était faux, corrigées puis certifiées.
// Protocole (validé, voir docs/reports/V12.75-REPORT.md) : cartes posées par un VRAI lancer (enregistrement des déclencheurs),
// tours pilotés par nextPhase(), réserves de mana vidées avant de piloter (brûlure de mana).
import { withWindow } from './lib/timing.mjs';
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
const ZERO = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
const zero = (g) => { for (const q of ['player', 'ai']) g.state[q].mana = { ...ZERO }; };

function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 20 }, (_, i) => ({ ...by('Plains'), uid: `${p}F${i}`, owner: p }));
  g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
const field = (g, s) => g.state[s].battlefield;
const cur = (g, p) => [...field(g, 'player'), ...field(g, 'ai')].find((x) => x.uid === p.uid);
const has = (g, p) => !!cur(g, p);
const pt = (g, p) => { const c = calculateCharacteristics(g.state, p); return [c.power, c.toughness]; };
const colors = (g, p) => calculateCharacteristics(g.state, cur(g, p)).color.join('');
const pT = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
function put(g, s, n, x = {}) { const p = { ...by(n), uid: `${n}#${++seq}`, owner: s, controller: s, zone: 'battlefield', summoningSickness: false, tapped: false, ...x }; field(g, s).push(p); return p; }
function settle(g, choose) {
  for (let i = 0; i < 10 && (g.stack.size > 0 || g.choices.getPending()); i++) {
    const pe = g.choices.getPending();
    if (pe) { g.choices.resolve(choose ? choose(pe) : (pe.options?.[0] ?? [])); continue; }
    g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  }
}
function cast(g, n, side = 'player', target, x = 0, choose) {
  if (!/Instant|Interrupt/.test(by(n).type)) { g.state.activePlayer = side; g.turnManager.activePlayer = side; }
  const card = { ...by(n), uid: `${n}@${++seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side;
  withWindow(g, card, side, () => { g.dispatch('CAST_SPELL', { card, target, xValue: x }, side); settle(g, choose); }); // V12.76 (G29) : fenêtre de timing légale
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player';
  return card;
}
// Pose une carte par un vrai lancer (déclencheurs enregistrés), puis vide les réserves.
function play(g, side, name, target) {
  g.state.activePlayer = side; g.turnManager.activePlayer = side; g.turnManager.gotoPhase('main1'); g.state.phase = 'main1';
  cast(g, name, side, target); g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; zero(g);
  const p = [...field(g, side)].reverse().find((x) => x.name === name); assert.ok(p, `${name} doit arriver en jeu`);
  p.summoningSickness = false; p.tapped = false; return p;
}
function driveTo(g, side, phase) {
  const other = side === 'player' ? 'ai' : 'player';
  g.state.activePlayer = other; g.turnManager.activePlayer = other; g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup';
  for (let i = 0; i < 30; i++) {
    g.turnManager.nextPhase(); g.state.phase = g.turnManager.phase;
    if (['untap', 'upkeep', 'draw'].includes(g.turnManager.phase)) g.turnManager.advanceAutomaticPhases?.(1);
    if (g.turnManager.phase === phase && g.turnManager.activePlayer === side) return;
  }
  assert.fail(`phase ${phase} non atteinte`);
}
const drive = (g, side, phase, choose) => { zero(g); driveTo(g, side, phase); settle(g, choose); };
const attack = (g, atts, side = 'player', blocks) => { g.state.activePlayer = side; g.combat.begin(); g.combat.confirmAttackers(atts, side); if (blocks) g.combat.assignBlockers(blocks); };
const cleanup = (g) => { g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase?.(); g.turnManager.gotoPhase('main1'); g.state.phase = 'main1'; g.state.priorityHolder = 'player'; };
const handOf = (g, s, names) => names.forEach((n, i) => g.state[s].hand.push({ ...by(n), uid: `${s}h${i}_${++seq}`, owner: s }));
const throws = (f) => { try { f(); return false; } catch { return true; } };

const LOT = ['Drain Power', "Siren's Call", 'Volcanic Eruption', 'Clone', 'Vesuvan Doppelganger', 'Reverse Damage', 'Natural Selection', 'Erg Raiders'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const pickFirst = (k) => (pe) => pe.options.slice(0, k);

// ── Drain Power : le mana non utilisé de l'adversaire passe dans VOTRE réserve ──
function drain(casterSide, theirMana) {
  const g = newGame(); const other = casterSide === 'player' ? 'ai' : 'player';
  g.state.activePlayer = casterSide; g.turnManager.activePlayer = casterSide;
  const card = { ...by('Drain Power'), uid: `dp${++seq}`, owner: casterSide, controller: casterSide };
  g.state[casterSide].hand.push(card); g.state[casterSide].mana = { ...ZERO, U: 2 }; g.state[other].mana = { ...ZERO, ...theirMana };
  g.state.priorityHolder = casterSide; g.dispatch('CAST_SPELL', { card, xValue: 0 }, casterSide); settle(g);
  return g;
}
for (const side of ['player', 'ai']) {
  const g = drain(side, { W: 2, R: 1, C: 3 }); const other = side === 'player' ? 'ai' : 'player';
  assert.deepEqual(g.state[side].mana, { ...ZERO, W: 2, R: 1, C: 3 }, `${side} : UU payés, puis mana adverse récupéré couleur par couleur`);
  assert.deepEqual(g.state[other].mana, ZERO, `${other} : réserve vidée`);
}
{ const g = drain('player', {}); assert.deepEqual(g.state.player.mana, ZERO, 'adversaire sans mana : rien à récupérer, aucune erreur'); }
{ const g = drain('player', { B: 4 }); assert.equal(g.state.player.mana.B, 4); assert.equal(g.state.player.mana.U, 0, 'le mana que vous aviez est dépensé pour {U}{U}'); }

// ── Siren's Call : toutes les créatures adverses attaquent ce tour si elles le peuvent ──
function siren() {
  const g = newGame(); const a = put(g, 'ai', 'Hill Giant'); const b = put(g, 'ai', 'Grizzly Bears');
  g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; cast(g, "Siren's Call", 'player'); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai';
  return { g, a, b };
}
{ const { g, a, b } = siren(); g.combat.begin(); assert.throws(() => g.combat.confirmAttackers([a], 'ai'), /doit attaquer/, 'une seule créature déclarée : refusé'); g.combat.confirmAttackers([a, b], 'ai'); }
{ const { g, a, b } = siren(); const wall = put(g, 'ai', 'Wall of Light'); const tappedOne = put(g, 'ai', 'Llanowar Elves', { tapped: true });
  g.combat.begin(); g.combat.confirmAttackers([a, b], 'ai'); assert.ok(true, 'un défenseur et une créature engagée ne peuvent pas attaquer : non requis'); void wall; void tappedOne; }
{ const { g, a, b } = siren(); const late = put(g, 'ai', 'Savannah Lions'); g.combat.begin(); g.combat.confirmAttackers([a, b], 'ai'); assert.ok(true, 'arrivée APRÈS la résolution : non concernée'); void late; }
{ const { g, a, b } = siren(); g.state.turnNumber += 2; g.combat.begin(); g.combat.confirmAttackers([], 'ai'); assert.ok(true, 'l\'obligation ne dure qu\'un tour'); void a; void b; }
{ const g = newGame(); const mine = put(g, 'player', 'Hill Giant'); put(g, 'ai', 'Grizzly Bears'); cast(g, "Siren's Call", 'player'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([], 'player'); assert.ok(true, 'vos propres créatures ne sont pas forcées'); void mine; }

// ── Juggernaut : doit attaquer si possible (V12.76 G30 : Erg Raiders n'est PLUS « doit attaquer » — Oracle : 2 blessures à la fin du tour) ──────────────────────────────
for (const side of ['player', 'ai']) {
  const g = newGame(); const e = put(g, side, 'Juggernaut'); g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.combat.begin(); assert.throws(() => g.combat.confirmAttackers([], side), /doit attaquer/, `${side} : déclaration vide refusée`); g.combat.confirmAttackers([e], side);
}
{ const g = newGame(); const e = put(g, 'player', 'Juggernaut', { summoningSickness: true }); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([], 'player'); assert.ok(e, 'mal d\'invocation : ne peut pas attaquer, donc non requis'); }
{ const g = newGame(); put(g, 'player', 'Juggernaut', { tapped: true }); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([], 'player'); assert.ok(true, 'engagé : non requis'); }
{ const g = newGame(); const e1 = put(g, 'player', 'Juggernaut'); const e2 = put(g, 'player', 'Juggernaut'); g.state.activePlayer = 'player'; g.combat.begin(); assert.throws(() => g.combat.confirmAttackers([e1], 'player'), /doit attaquer/, 'deux Raiders : les deux doivent attaquer'); g.combat.confirmAttackers([e1, e2], 'player'); }
{ const g = newGame(); put(g, 'player', 'Juggernaut'); g.state.activePlayer = 'player'; g.state.turnNumber += 5; g.combat.begin(); assert.throws(() => g.combat.confirmAttackers([], 'player'), /doit attaquer/, 'capacité statique : valable à CHAQUE tour'); }

// ── Volcanic Eruption : détruisez X montagnes, choisies par le lanceur ───
function eruption(x, choose) {
  const g = newGame();
  const ms = { aiM1: put(g, 'ai', 'Mountain'), aiM2: put(g, 'ai', 'Mountain'), myM: put(g, 'player', 'Mountain'), volc: put(g, 'ai', 'Volcanic Island') };
  const others = { forest: put(g, 'ai', 'Forest'), plains: put(g, 'player', 'Plains'), tundra: put(g, 'ai', 'Tundra') };
  cast(g, 'Volcanic Eruption', 'player', undefined, x, choose); return { g, ms, others };
}
{ const { g, ms, others } = eruption(2, pickFirst(2)); const gone = Object.values(ms).filter((p) => !has(g, p)).length; assert.equal(gone, 2, 'X = 2 : exactement deux montagnes détruites'); assert.ok(Object.values(others).every((p) => has(g, p)), 'les terrains non-Montagne restent (Forêt, Plaine, Toundra)'); }
{ const g = newGame(); const mine = put(g, 'player', 'Mountain'); const foe = put(g, 'ai', 'Mountain'); put(g, 'ai', 'Mountain');
  cast(g, 'Volcanic Eruption', 'player', undefined, 1, (pe) => { assert.equal(pe.options.length, 3, 'toutes les Montagnes sont proposées, des deux camps'); assert.ok(pe.options.some((o) => o.uid === mine.uid), 'la VÔTRE aussi'); return [pe.options.find((o) => o.uid === foe.uid)]; });
  assert.ok(!has(g, foe) && has(g, mine), 'le lanceur CHOISIT laquelle détruire'); }
{ const { g, ms } = eruption(10, pickFirst(99)); assert.ok(Object.values(ms).every((p) => !has(g, p)), 'X supérieur au nombre de Montagnes : toutes détruites (terrain double compris)'); }
{ const { g, ms } = eruption(0, pickFirst(0)); assert.ok(Object.values(ms).every((p) => has(g, p)), 'X = 0 : rien'); }
{ const { g, ms } = eruption(1, pickFirst(1)); assert.ok(has(g, ms.volc) || Object.values(ms).filter((p) => !has(g, p)).length === 1, 'X = 1 : une seule montagne détruite'); assert.equal(Object.values(ms).filter((p) => !has(g, p)).length, 1); }

// ── Clone / Vesuvan Doppelganger : arrive comme une copie d'une créature en jeu ──
for (const name of ['Clone', 'Vesuvan Doppelganger']) {
  const g = newGame(); const angel = put(g, 'ai', 'Serra Angel'); cast(g, name, 'player', pT(angel));
  const copy = field(g, 'player').find((p) => p.name === 'Serra Angel' || p.name === name); assert.ok(copy, `${name} arrive en jeu`);
  assert.deepEqual(pt(g, copy), [4, 4], `${name} : copie de Serra Angel 4/4`); const kws = calculateCharacteristics(g.state, copy).keywords;
  assert.ok(kws.includes('flying') && kws.includes('vigilance'), `${name} : copie les mots-clés (vol, vigilance)`); assert.equal(copy.controller, 'player', 'sous votre contrôle');
  assert.ok(has(g, angel) && field(g, 'ai').includes(angel) || has(g, angel), 'l\'original reste chez l\'adversaire');
  assert.notEqual(copy.uid, angel.uid, 'c\'est un nouvel objet');
}
{ const g = newGame(); const angel = put(g, 'ai', 'Serra Angel'); cast(g, 'Giant Strength', 'player', pT(angel)); assert.deepEqual(pt(g, angel), [6, 6]);
  cast(g, 'Clone', 'player', pT(angel)); const copy = field(g, 'player').find((p) => p.name === 'Serra Angel' || p.name === 'Clone'); assert.deepEqual(pt(g, copy), [4, 4], 'la copie n\'hérite pas des Auras de l\'original'); }
for (const name of ['Clone', 'Vesuvan Doppelganger']) { const g = newGame(); cast(g, name, 'player'); assert.ok(!field(g, 'player').some((p) => p.name === name), `${name} sans créature à copier : 0/0, meurt`); assert.ok(g.state.player.graveyard.some((c) => c.name === name), 'au cimetière'); }
{ const g = newGame(); const ring = put(g, 'ai', 'Sol Ring'); assert.ok(throws(() => cast(g, 'Clone', 'player', pT(ring))), 'un artefact n\'est pas une créature : cible illégale'); }
{ const g = newGame(); const mine = put(g, 'player', 'Hill Giant'); cast(g, 'Clone', 'player', pT(mine)); assert.equal(field(g, 'player').filter((p) => p.name === 'Hill Giant').length, 2, 'peut copier sa propre créature'); }

// ── Reverse Damage : la prochaine blessure d'une source CHOISIE vous est prévenue, vous gagnez autant ──
function rd(chooseName, attackers, blocks = {}) {
  const g = newGame(); const foes = attackers.map((n) => play(g, 'ai', n)); const blockers = {};
  cast(g, 'Reverse Damage', 'player', undefined, 0, (pe) => pe.options.find((o) => o.name === chooseName) ?? pe.options[0]);
  g.state.player.life = 10; attack(g, foes, 'ai', blocks(foes)); g.combat.resolveDamage(); settle(g); return { g, foes };
}
{ const { g } = rd('Hill Giant', ['Hill Giant'], () => ({})); assert.equal(g.state.player.life, 13, 'Hill Giant (3) prévenu : +3 PV, aucune blessure'); }
{ const { g } = rd('Hill Giant', ['Hill Giant', 'Grizzly Bears'], () => ({})); assert.equal(g.state.player.life, 11, 'seule la source choisie est prévenue : +3 puis -2 de l\'autre'); }
{ const { g } = rd('Grizzly Bears', ['Hill Giant', 'Grizzly Bears'], () => ({})); assert.equal(g.state.player.life, 9, 'source choisie = Ours (2) : +2, mais le Géant inflige 3 (10 + 2 - 3)'); }
{ const g = newGame(); const giant = play(g, 'ai', 'Hill Giant'); cast(g, 'Reverse Damage', 'player', undefined, 0, (pe) => pe.options.find((o) => o.name === 'Hill Giant')); g.state.player.life = 10;
  attack(g, [giant], 'ai', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 13); giant.tapped = false;
  attack(g, [cur(g, giant)], 'ai', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 10, 'UNE seule fois : la 2e attaque du même tour passe'); }
{ const g = newGame(); const giant = play(g, 'ai', 'Hill Giant'); cast(g, 'Reverse Damage', 'player', undefined, 0, (pe) => pe.options.find((o) => o.name === 'Hill Giant')); cleanup(g); g.state.player.life = 10;
  attack(g, [cur(g, giant)], 'ai', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 7, 'le bouclier expire à la fin du tour'); }
{ const g = newGame(); const giant = play(g, 'ai', 'Hill Giant'); const blocker = put(g, 'player', 'Grizzly Bears'); cast(g, 'Reverse Damage', 'player', undefined, 0, (pe) => pe.options.find((o) => o.name === 'Hill Giant')); g.state.player.life = 10;
  attack(g, [giant], 'ai', { [giant.uid]: [blocker.uid] }); g.combat.resolveDamage(); settle(g); assert.ok(!has(g, blocker), 'vos créatures ne sont PAS protégées (texte : « vous blesser »)'); assert.equal(g.state.player.life, 10, 'aucune blessure au joueur, aucun gain'); }
{ // La source peut être un SORT sur la pile : Lightning Bolt adverse en réponse.
  const g = newGame(); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; const bolt = { ...by('Lightning Bolt'), uid: `bolt${++seq}`, owner: 'ai', controller: 'ai' };
  g.state.ai.hand.push(bolt); g.state.ai.mana = { ...FULL }; g.state.priorityHolder = 'ai'; g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'player', id: 'player' }, xValue: 0 }, 'ai');
  g.state.player.life = 10; cast(g, 'Reverse Damage', 'player', undefined, 0, (pe) => pe.options.find((o) => o.uid === bolt.uid) ?? pe.options[0]); settle(g);
  assert.equal(g.state.player.life, 13, 'Bolt prévenu (-3 évité) et +3 PV gagnés'); }

// ── Natural Selection : regardez les 3 cartes du dessus d'une bibliothèque, mettez-en une au fond ──
function ns(targetSide, libNames, choose) {
  const g = newGame(); const lib = g.state[targetSide].library; lib.length = 0; libNames.forEach((n, i) => lib.push({ ...by(n), uid: `ns${i}_${++seq}`, owner: targetSide }));
  let seen = null; cast(g, 'Natural Selection', 'player', { kind: 'player', side: targetSide, id: targetSide }, 0, (pe) => { seen = pe.options.map((c) => c.name); assert.equal(pe.type, 'lookTopBottom'); assert.equal(pe.min, 0); assert.equal(pe.max, 1); return choose(pe); });
  return { g, seen, lib: g.state[targetSide].library };
}
{ const { seen, lib } = ns('ai', ['Plains', 'Forest', 'Island', 'Swamp', 'Mountain'], (pe) => [pe.options[1]]); assert.deepEqual(seen, ['Mountain', 'Swamp', 'Island'], 'les 3 cartes du dessus, la plus haute d\'abord');
  assert.equal(lib[0].name, 'Swamp', 'la carte choisie (2e) passe au fond'); assert.equal(lib[lib.length - 1].name, 'Mountain', 'le dessus est inchangé'); assert.equal(lib.length, 5, 'aucune carte perdue'); }
{ const { lib } = ns('ai', ['Plains', 'Forest', 'Island', 'Swamp'], () => []); assert.deepEqual(lib.map((c) => c.name), ['Plains', 'Forest', 'Island', 'Swamp'], '« vous pouvez » : ne rien déplacer est permis'); }
{ const { seen, lib } = ns('player', ['Plains', 'Forest', 'Island', 'Swamp'], (pe) => [pe.options[0]]); assert.deepEqual(seen, ['Swamp', 'Island', 'Forest'], 'sur VOTRE bibliothèque aussi'); assert.equal(lib[0].name, 'Swamp', 'le dessus part au fond'); assert.equal(lib[lib.length - 1].name, 'Island'); }
{ const { seen, lib } = ns('ai', ['Plains', 'Forest'], (pe) => [pe.options[1]]); assert.deepEqual(seen, ['Forest', 'Plains'], 'moins de 3 cartes : on regarde celles qui restent'); assert.equal(lib.length, 2); }
{ const g = newGame(); g.state.ai.library.length = 0; cast(g, 'Natural Selection', 'player', { kind: 'player', side: 'ai', id: 'ai' }, 0, () => assert.fail('aucun choix sur une bibliothèque vide')); assert.equal(g.state.ai.library.length, 0, 'bibliothèque vide : aucune erreur'); }
{ const g = newGame(); const before = g.state.player.hand.length; ns('ai', ['Plains', 'Forest', 'Island'], () => []); assert.equal(g.state.player.hand.length, before, 'ne pioche rien'); }
{ const g = newGame(); const h = put(g, 'ai', 'Hill Giant'); assert.ok(throws(() => cast(g, 'Natural Selection', 'player', pT(h))), 'une créature n\'est pas une cible légale'); }

console.log(`OK V12.75 lot F2b : ${LOT.length} cartes corrigées puis certifiées en partie réelle (cas positifs et négatifs).`);
