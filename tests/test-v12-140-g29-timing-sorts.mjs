// V12.76 (G29) — M1 : restrictions de timing des SORTS (« Lancez ce sort uniquement… ») + Reset, Teleport, Rapid Fire, Berserk, Siren's Call (corrigée).
// Oracle : Siren's Call vérifié (Scryfall LEB n°78 : destruction des non-Mur qui n'ont pas attaqué, ignorant les créatures non contrôlées depuis le début du tour) ; Reset, Teleport, Rapid Fire, Berserk : texte de la base au format Oracle (à confirmer sur fiche).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, objectId: `${p}FO${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai'); g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY(); return g;
}
const put = (g, side, name, extra = {}) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, ...extra }; g.state[side].battlefield.push(p); g.triggerEngine?.syncBattlefield?.(g.state); return p; };
const pT = (p) => ({ kind: 'permanent', uid: p.uid });
const live = (g, p) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((q) => q.uid === p.uid);
const has = (g, p) => !!live(g, p);
const inGy = (g, p) => g.state[p.owner].graveyard.some((c) => c.name === p.name);
function cast(g, name, target, x = 0, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side);
  for (let i = 0; i < 6 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; g.state[side].mana = EMPTY(); return card;
}
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const act = (g, p, side = 'player', extra = {}, mana = FULL) => { g.state.priorityHolder = side; g.state[side].mana = { ...mana }; g.action('activateAbility', { permanent: live(g, p), controller: side, abilityIndex: 0, ...extra }); settle(g); };
const advanceUntil = (g, pred, max = 90) => { for (let i = 0; i < max && !pred(); i++) { g.turnManager.nextPhase(); if (!pred()) settle(g); } assert.ok(pred(), `condition non atteinte (phase ${g.state.phase}, tour de ${g.state.activePlayer})`); };
const upkeepOf = (g, side) => { const t = g.state.turnNumber; advanceUntil(g, () => g.state.turnNumber !== t && g.state.activePlayer === side && g.state.phase === 'upkeep'); };
const order = (g, n = 3) => { const out = []; for (let i = 0; i < 80 && out.length < n; i++) { g.turnManager.nextPhase(); if (g.state.phase === 'upkeep') out.push(g.state.activePlayer); } return out; };

import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import { isCastTimingLegal } from '../src/core/spell-timing.js';

for (const n of ['Reset', 'Teleport', 'Rapid Fire', 'Berserk', "Siren's Call"]) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const PHASES = ['untap', 'upkeep', 'draw', 'main1', 'combatBegin', 'declareAttackers', 'declareBlockers', 'combatDamage', 'combatEnd', 'main2', 'endStep', 'cleanup'];

// ── M1 : table de légalité EXHAUSTIVE (12 phases × tour du lanceur / tour adverse) ─────────────────────────────
// `flags` : [bloqueursDéclarés, blessuresCommencées]. Phases « simples » : liste de phases légales quels que soient les drapeaux ; fenêtres fusionnées du moteur : explicites.
const upTo = (ph) => PHASES.slice(0, PHASES.indexOf(ph) + 1);
const EXPECT = {
  beforeDamage: (ph, o) => PHASES.indexOf(ph) < PHASES.indexOf('combatDamage') || (ph === 'combatDamage' && !o.dmg),
  beforeBlockers: (ph, o) => upTo('declareAttackers').includes(ph) || (ph === 'declareBlockers' && !o.blk),
  duringCombatBeforeBlockers: (ph, o) => ['combatBegin', 'declareAttackers'].includes(ph) || (ph === 'declareBlockers' && !o.blk),
  declareAttackers: (ph, o) => ph === 'declareAttackers' || (ph === 'declareBlockers' && !o.blk),
  declareBlockers: (ph, o) => (ph === 'combatDamage' && !o.dmg) || (ph === 'declareBlockers' && o.blk),
  afterCombat: (ph) => ['combatEnd', 'main2', 'endStep', 'cleanup'].includes(ph),
  opponentTurnAfterUpkeep: (ph, o) => !o.own && PHASES.indexOf(ph) > PHASES.indexOf('upkeep'),
  opponentBeforeAttackers: (ph, o) => !o.own && PHASES.indexOf(ph) < PHASES.indexOf('declareAttackers'),
};
let checked = 0;
for (const [timing, fn] of Object.entries(EXPECT)) for (const own of [true, false]) for (const ph of PHASES) for (const blk of [false, true]) for (const dmg of [false, true]) {
  const state = { phase: ph, activePlayer: own ? 'player' : 'ai', blockersDeclared: blk, damageStarted: dmg };
  assert.equal(isCastTimingLegal(timing, state, 'player'), !!fn(ph, { own, blk, dmg }), `${timing} @ ${ph} (${own ? 'mon' : 'son'} tour, bloqueurs ${blk ? 'déclarés' : 'non'}, blessures ${dmg ? 'commencées' : 'non'})`); checked++;
}
assert.equal(checked, 8 * 2 * 12 * 2 * 2, 'toute la table a été vérifiée');
assert.equal(isCastTimingLegal(undefined, { phase: 'main2', activePlayer: 'player' }, 'player'), true, 'sans restriction : toujours légal');
assert.equal(isCastTimingLegal('inconnu', { phase: 'main2', activePlayer: 'player' }, 'player'), true, 'valeur inconnue : pas de blocage silencieux');

// ── Moteur : un sort hors fenêtre est REFUSÉ au lancement (rien n'est payé), dans la fenêtre il est accepté ───────────────────
const at = (g, active, phase) => { g.state.activePlayer = active; g.turnManager.activePlayer = active; g.turnManager.gotoPhase(phase); g.state.phase = phase; g.state.priorityHolder = 'player'; g.turnManager.phaseStarted = false; };
function castAt(g, name, target, mana = FULL) {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: 'player', controller: 'player' }; g.state.player.hand.push(card); g.state.player.mana = { ...mana }; g.state.priorityHolder = 'player';
  g.dispatch('CAST_SPELL', { card, target }, 'player'); settle(g); return card;
}
const refused = (g, name, target) => { const m = { ...FULL }; const hand0 = g.state.player.hand.length; assert.throws(() => castAt(g, name, target, m), /ne peut être lancé|uniquement/i, `${name} : refusé hors fenêtre`); void hand0; };
const pt = (g, p) => { const c = calculateCharacteristics(g.state, live(g, p)); return [c.power, c.toughness]; };
const kws = (g, p) => calculateCharacteristics(g.state, live(g, p)).keywords;

// Reset : pendant le tour d'un adversaire, après son entretien : dégagez mes terrains
{ const g = newGame(); const l1 = put(g, 'player', 'Forest', { tapped: true }); const l2 = put(g, 'player', 'Island', { tapped: true }); const foe = put(g, 'ai', 'Forest', { tapped: true });
  at(g, 'player', 'main1'); refused(g, 'Reset', null); assert.equal(live(g, l1).tapped, true, 'mon tour : refusé, rien dégagé'); at(g, 'ai', 'upkeep'); refused(g, 'Reset', null);
  at(g, 'ai', 'main1'); castAt(g, 'Reset', null, { ...EMPTY(), U: 2 }); assert.equal(live(g, l1).tapped, false, 'tour adverse après l\'entretien : mes terrains se dégagent'); assert.equal(live(g, l2).tapped, false); assert.equal(live(g, foe).tapped, true, 'pas ceux de l\'adversaire'); }

// Teleport : pendant la déclaration des attaquants : la créature ciblée ne peut pas être bloquée ce tour
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); at(g, 'player', 'main1'); refused(g, 'Teleport', pT(gr)); assert.ok(has(g, gr)); } // (un lancer refusé restaure l'état : partie distincte pour la suite)
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); const blocker = put(g, 'ai', 'Hill Giant'); at(g, 'player', 'main1');
  g.turnManager.gotoPhase('main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([gr]); settle(g); assert.equal(g.state.phase, 'declareBlockers', 'ce moteur : après la déclaration, fenêtre « bloqueurs pas encore déclarés »');
  assert.ok(g.combat.getValidBlockers('ai', gr).map((p) => p.name).includes('Hill Giant'), 'témoin : le Géant pouvait bloquer'); castAt(g, 'Teleport', pT(gr), { ...EMPTY(), U: 3 });
  assert.deepEqual(g.combat.getValidBlockers('ai', gr).map((p) => p.name), [], 'Teleport : plus aucun bloqueur légal'); void blocker; }

// Rapid Fire : avant les bloqueurs : initiative ; sauvagerie 2 si elle n'en a pas
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); at(g, 'player', 'combatEnd'); refused(g, 'Rapid Fire', pT(gr)); at(g, 'player', 'main1'); castAt(g, 'Rapid Fire', pT(gr), { ...EMPTY(), W: 1, C: 3 });
  assert.ok(kws(g, gr).includes('first strike'), 'initiative'); assert.ok(kws(g, gr).includes('rampage2'), 'sauvagerie 2 (elle n\'en avait pas)'); }
{ const g = newGame(); const rb = put(g, 'player', 'Aerathi Berserker'); const have = kws(g, rb).find((k) => /^rampage\d+$/.test(k)); assert.ok(have, `témoin : Aerathi Berserker a déjà la sauvagerie (${have})`); at(g, 'player', 'main1'); castAt(g, 'Rapid Fire', pT(rb), { ...EMPTY(), W: 1, C: 3 });
  assert.ok(kws(g, rb).includes(have), 'sa propre sauvagerie est conservée'); assert.ok(!kws(g, rb).includes('rampage2') || have === 'rampage2', 'pas de sauvagerie 2 en plus'); }
// … en combat réel : un 2/2 avec initiative tue le 2/2 bloqueur SANS subir de blessures
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); const foe = put(g, 'ai', 'Grizzly Bears'); at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([gr]); settle(g);
  castAt(g, 'Rapid Fire', pT(gr), { ...EMPTY(), W: 1, C: 3 }); g.turnManager.declareBlockers({ [gr.uid]: [foe.uid] }); settle(g); g.turnManager.runPhase(); settle(g);
  assert.ok(!has(g, foe), 'le bloqueur meurt'); assert.ok(has(g, gr) && (live(g, gr).damageMarked || 0) === 0, 'l\'attaquant est en vie et n\'a subi AUCUNE blessure (frappe en premier)'); }

// Berserk : avant les blessures de combat : piétinement et +X/+0 (X = sa force) ; détruite à la prochaine étape finale si elle a attaqué ce tour
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); at(g, 'player', 'combatDamage'); g.turnManager.phaseStarted = true; refused(g, 'Berserk', pT(gr)); g.turnManager.phaseStarted = false; at(g, 'player', 'main1'); castAt(g, 'Berserk', pT(gr), { ...EMPTY(), G: 1 });
  assert.deepEqual(pt(g, gr), [4, 2], '+X/+0 avec X = sa force (2) : 4/2'); assert.ok(kws(g, gr).includes('trample'), 'piétinement'); }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); const l0 = g.state.ai.life; at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([gr]); settle(g);
  castAt(g, 'Berserk', pT(gr), { ...EMPTY(), G: 1 }); g.turnManager.declareBlockers({}); settle(g); g.turnManager.runPhase(); settle(g); assert.equal(g.state.ai.life, l0 - 4, '4 blessures de combat');
  assert.ok(has(g, gr), 'encore en jeu avant l\'étape finale'); g.turnManager.nextPhase(); settle(g); g.turnManager.nextPhase(); settle(g); g.turnManager.nextPhase(); settle(g); assert.equal(g.state.phase, 'endStep'); assert.ok(!has(g, gr), 'détruite à la prochaine étape finale (elle a attaqué)'); }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); at(g, 'player', 'main1'); castAt(g, 'Berserk', pT(gr), { ...EMPTY(), G: 1 }); g.turnManager.gotoPhase('endStep'); g.state.phase = 'endStep'; g.stack.runDelayed('nextEndStep'); assert.ok(has(g, gr), 'elle n\'a PAS attaqué : elle survit'); }

{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); const big = put(g, 'ai', 'Hill Giant'); const l0 = g.state.ai.life; at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([gr]); settle(g);
  g.turnManager.declareBlockers({ [gr.uid]: [big.uid] }); settle(g); assert.equal(g.state.phase, 'combatDamage'); assert.equal(g.turnManager.phaseStarted, false, 'bloqueurs déclarés, blessures PAS encore infligées');
  castAt(g, 'Berserk', pT(gr), { ...EMPTY(), G: 1 }); g.turnManager.runPhase(); settle(g); assert.ok(!has(g, big), '4 blessures : le Géant (3) meurt'); assert.equal(g.state.ai.life, l0 - 1, 'piétinement : 1 blessure excédentaire au joueur'); }

// Siren's Call : pendant le tour d'un adversaire, avant les attaquants ; ses créatures attaquent ; fin de tour : destruction des non-Mur qui n'ont pas attaqué
const siren = () => { const g = newGame(); const tapped = put(g, 'ai', 'Hill Giant', { tapped: true, enteredTurn: 1 }); const wall = put(g, 'ai', 'Wall of Stone', { enteredTurn: 1 }); const att = put(g, 'ai', 'Grizzly Bears', { enteredTurn: 1 }); g.state.turnNumber = 5; g.turnManager.turnNumber = 5; return { g, tapped, wall, att }; };
{ const { g } = siren(); at(g, 'player', 'main1'); refused(g, "Siren's Call", null); at(g, 'ai', 'declareAttackers'); refused(g, "Siren's Call", null); }
{ const { g, tapped, wall, att } = siren(); at(g, 'ai', 'main1'); const fresh = put(g, 'ai', 'Scathe Zombies', { enteredTurn: 5 }); const freshTapped = put(g, 'ai', 'Scathe Zombies', { enteredTurn: 5, tapped: true }); castAt(g, "Siren's Call", null, { ...EMPTY(), U: 1 });
  assert.equal(live(g, att).mustAttack, true, 'ses créatures doivent attaquer'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([att, fresh].filter((p) => !p.tapped)); settle(g); g.turnManager.declareBlockers({}); settle(g); g.turnManager.runPhase(); settle(g);
  g.turnManager.nextPhase(); settle(g); g.turnManager.nextPhase(); settle(g); g.turnManager.nextPhase(); settle(g); assert.equal(g.state.phase, 'endStep');
  assert.ok(!has(g, tapped), 'Hill Giant engagé : n\'a pas attaqué (illégal de le faire) : détruit (ruling 2009)'); assert.ok(has(g, wall), 'un MUR n\'est pas détruit'); assert.ok(has(g, att), 'la créature qui a attaqué survit'); assert.ok(has(g, fresh), 'attaque : survit'); assert.ok(has(g, freshTapped), 'arrivée CE tour et n\'a pas attaqué (engagée) : IGNORÉE (« non contrôlée depuis le début du tour »)'); }

console.log('OK test-v12-140-g29-timing-sorts');
