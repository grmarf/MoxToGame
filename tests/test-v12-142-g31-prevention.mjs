// V12.76 (G31) — M13 : prévention de blessures. Corrige l'infrastructure (un bouclier ne disparaît plus au moindre autre événement de blessures ; purge au nettoyage) et ajoute Forcefield, Conservator, Oasis, Combat Medic, Kei Takahashi, Maze of Ith.
// Oracle vérifié : Forcefield (Beta n°244), Conservator (Beta n°238 / 4ED / Alpha). Oasis, Combat Medic, Kei Takahashi, Maze of Ith : texte de la base concordant avec l'Oracle connu (à confirmer sur fiche).
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

for (const n of ['Forcefield', 'Conservator', 'Oasis', 'Combat Medic', 'Kei Takahashi', 'Maze of Ith']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const at = (g, active, phase) => { g.state.activePlayer = active; g.turnManager.activePlayer = active; g.turnManager.gotoPhase(phase); g.state.phase = phase; g.state.priorityHolder = 'player'; g.turnManager.phaseStarted = false; };
const dmg = (g, p) => (live(g, p) ? live(g, p).damageMarked || 0 : -1);
const bolt = (g, target, side = 'ai') => cast(g, 'Lightning Bolt', target, 0, side);
const use = (g, p, extra = {}, mana = EMPTY()) => { g.state.priorityHolder = 'player'; g.state.player.mana = { ...mana }; g.action('activateAbility', { permanent: live(g, p), controller: 'player', abilityIndex: 0, ...extra }); settle(g); };
const total = (g, side) => g.state[side].life;

// ── Infrastructure : un bouclier posé sur UNE créature survit aux blessures d'une AUTRE créature, et expire au nettoyage ─────
{ const g = newGame(); const a = put(g, 'player', 'Craw Wurm'); const b = put(g, 'player', 'Craw Wurm'); g.replacements.addPreventionShield('player', { amount: 1, target: a, until: 'nextMatchingDamage' });
  bolt(g, pT(b)); assert.equal(dmg(g, b), 3, 'l\'autre créature subit tout'); assert.equal(g.state.player.prevention.length, 1, 'le bouclier de A SURVIT aux blessures de B (ancien défaut : il disparaissait)');
  bolt(g, pT(a)); assert.equal(dmg(g, a), 2, 'A : 1 blessure prévenue sur 3'); assert.equal(g.state.player.prevention.length, 0, 'bouclier épuisé : retiré'); bolt(g, pT(a)); assert.ok(!has(g, a), 'plus de bouclier : la 2e blessure de 3 tue A (2 + 3 >= 4)'); }
{ const g = newGame(); g.replacements.addPreventionShield('player', { amount: 1, until: 'nextMatchingDamage' }); assert.equal(g.state.player.prevention.length, 1); g.turnManager.gotoPhase('endStep'); g.state.phase = 'endStep'; g.turnManager.nextPhase(); settle(g);
  assert.equal(g.state.phase, 'cleanup'); assert.equal(g.state.player.prevention.length, 0, 'un bouclier « ce tour-ci » est purgé au nettoyage (ancien défaut : il restait toute la partie)'); }
// Circle of Protection : UNE seule fois (« la prochaine fois »), même si une autre source blesse entre-temps
{ const g = newGame(); const cp = put(g, 'player', 'Circle of Protection: Red'); const red = put(g, 'ai', 'Hill Giant'); const l0 = total(g, 'player'); act(g, cp, 'player', { target: null }, FULL);
  bolt(g, { kind: 'player', side: 'player' }); assert.equal(total(g, 'player'), l0, 'la 1re source rouge (Éclair) : prévenu'); bolt(g, { kind: 'player', side: 'player' }); assert.equal(total(g, 'player'), l0 - 3, 'la 2e : plus de bouclier (« la prochaine fois » = une seule)'); void red; }

// ── Conservator : {3}, {T} : prévenez les 2 prochaines blessures qui vous seraient infligées ce tour-ci ──────────────────────────
{ const g = newGame(); const cons = put(g, 'player', 'Conservator'); const l0 = total(g, 'player'); const gi = put(g, 'player', 'Craw Wurm');
  assert.throws(() => use(g, cons, {}, { ...EMPTY(), C: 2 }), /.+/, '{3} requis'); use(g, cons, {}, { ...EMPTY(), C: 3 }); assert.equal(live(g, cons).tapped, true, 'engage Conservator');
  bolt(g, pT(gi)); assert.equal(dmg(g, gi), 3, 'ne protège PAS mes créatures (« vous » seulement)'); bolt(g, { kind: 'player', side: 'player' }); assert.equal(total(g, 'player'), l0 - 1, '2 des 3 blessures prévenues'); bolt(g, { kind: 'player', side: 'player' }); assert.equal(total(g, 'player'), l0 - 4, 'bouclier épuisé'); }
{ const g = newGame(); const cons = put(g, 'player', 'Conservator', { tapped: true }); assert.throws(() => use(g, cons, {}, { ...EMPTY(), C: 3 }), /.+/, 'déjà engagé : impossible'); }

// ── Oasis / Kei Takahashi / Combat Medic : prévention des N prochaines blessures d'une cible ───────────────────────────────────
{ const g = newGame(); const oasis = put(g, 'player', 'Oasis'); const gi = put(g, 'player', 'Hill Giant'); assert.throws(() => use(g, oasis, { target: { kind: 'player', side: 'player' } }), /illégale|.+/, 'créature seulement');
  use(g, oasis, { target: pT(gi) }); assert.equal(live(g, oasis).tapped, true); bolt(g, pT(gi)); assert.equal(dmg(g, gi), 2, 'Oasis : 1 blessure prévenue sur 3'); }
{ const g = newGame(); const kei = put(g, 'player', 'Kei Takahashi'); const gi = put(g, 'player', 'Hill Giant'); use(g, kei, { target: pT(gi) }); bolt(g, pT(gi)); assert.equal(dmg(g, gi), 1, 'Kei : 2 blessures prévenues sur 3'); }
{ const g = newGame(); const med = put(g, 'player', 'Combat Medic'); const l0 = total(g, 'player'); const gi = put(g, 'ai', 'Hill Giant'); use(g, med, { target: { kind: 'player', side: 'player' } }, { ...EMPTY(), W: 1, C: 1 }); bolt(g, { kind: 'player', side: 'player' }); assert.equal(total(g, 'player'), l0 - 2, 'Combat Medic sur MOI : 1 prévenue sur 3');
  use(g, med, { target: pT(gi) }, { ...EMPTY(), W: 1, C: 1 }); bolt(g, pT(gi), 'player'); assert.equal(dmg(g, gi), 2, 'ou sur une créature (même adverse) : 1 prévenue'); assert.equal(live(g, med).tapped, false, 'ne s\'engage pas : {1}{W} seulement'); }

// ── Forcefield : {1} : la prochaine fois qu'une créature NON BLOQUÉE de votre choix devrait vous infliger des blessures de combat, prévenez-en tout sauf 1 ───────────────
const ffGame = () => { const g = newGame(); const ff = put(g, 'player', 'Forcefield'); const giant = put(g, 'ai', 'Hill Giant'); const bears = put(g, 'ai', 'Grizzly Bears'); const wall = put(g, 'player', 'Wall of Stone'); return { g, ff, giant, bears, wall }; };
function toBlockers(g, atts, blocks = {}) { at(g, 'ai', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers(atts); settle(g); g.turnManager.declareBlockers(blocks); settle(g); assert.equal(g.state.phase, 'combatDamage'); assert.equal(g.turnManager.phaseStarted, false); }
{ const { g, ff, giant, bears } = ffGame(); const l0 = total(g, 'player'); toBlockers(g, [giant, bears]); use(g, ff, {}, { ...EMPTY(), C: 1 }); const pe = g.choices.getPending(); assert.ok(pe, 'choix de la source'); assert.equal(pe.controller, 'player');
  assert.deepEqual(pe.options.map((o) => o.uid).sort(), [giant.uid, bears.uid].sort(), 'les créatures non bloquées'); g.choices.resolve(pe.options.find((o) => o.uid === giant.uid)); settle(g); g.turnManager.runPhase(); settle(g);
  assert.equal(total(g, 'player'), l0 - (1 + 2), 'Hill Giant : 3 -> 1 ; Grizzly Bears : 2 (non choisi)'); }
{ const { g, ff, giant, bears, wall } = ffGame(); toBlockers(g, [giant, bears], { [giant.uid]: [wall.uid] }); use(g, ff, {}, { ...EMPTY(), C: 1 }); const pe = g.choices.getPending(); assert.deepEqual(pe?.options.map((o) => o.uid), [bears.uid], 'une créature BLOQUÉE n\'est pas proposée'); }
{ const { g, ff, giant, bears } = ffGame(); const l0 = total(g, 'player'); toBlockers(g, [giant, bears]); use(g, ff, {}, { ...EMPTY(), C: 1 }); g.choices.resolve(g.choices.getPending().options.find((o) => o.uid === giant.uid)); settle(g);
  use(g, ff, {}, { ...EMPTY(), C: 1 }); g.choices.resolve(g.choices.getPending().options.find((o) => o.uid === bears.uid)); settle(g); g.turnManager.runPhase(); settle(g); assert.equal(total(g, 'player'), l0 - 2, 'deux activations, deux sources : 1 + 1'); }
{ const { g, ff, giant } = ffGame(); const l0 = total(g, 'player'); toBlockers(g, [giant]); assert.throws(() => use(g, ff, {}, EMPTY()), /.+/, '{1} requis'); void l0; }
{ const { g, ff, giant } = ffGame(); const a0 = g.state.player.life; toBlockers(g, [giant]); use(g, ff, {}, { ...EMPTY(), C: 1 }); g.choices.resolve(g.choices.getPending().options[0]); settle(g); const hp = total(g, 'player'); bolt(g, { kind: 'player', side: 'player' }); assert.equal(total(g, 'player'), hp - 3, 'ne protège QUE des blessures de combat de cette créature (un Éclair passe)'); void a0; }
// « La prochaine fois » : une SEULE réduction, même si la même source blesse ensuite une seconde fois ce tour-ci
{ const { g, ff, giant } = ffGame(); toBlockers(g, [giant]); use(g, ff, {}, { ...EMPTY(), C: 1 }); g.choices.resolve(g.choices.getPending().options[0]); settle(g); const l0 = total(g, 'player');
  g.replacements.applyDamageToPlayer('player', 3, { source: live(g, giant), meta: { combat: true } }); assert.equal(total(g, 'player'), l0 - 1, '1re blessure de combat : 3 -> 1');
  g.replacements.applyDamageToPlayer('player', 3, { source: live(g, giant), meta: { combat: true } }); assert.equal(total(g, 'player'), l0 - 1 - 3, '2e blessure de la même source : bouclier consommé, 3 pleines'); }
{ const { g, ff } = ffGame(); at(g, 'ai', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([]); settle(g); g.turnManager.declareBlockers({}); settle(g); use(g, ff, {}, { ...EMPTY(), C: 1 }); assert.equal(g.choices.getPending(), null, 'aucun attaquant non bloqué : rien à choisir'); }

// ── Maze of Ith : {T} : dégagez l'attaquante ciblée ; prévenez les blessures de combat qui LUI sont infligées et qu'ELLE inflige ce tour-ci ───────────────────
{ const g = newGame(); const maze = put(g, 'player', 'Maze of Ith'); const att = put(g, 'ai', 'Hill Giant'); const blk = put(g, 'player', 'Grizzly Bears'); const l0 = total(g, 'player');
  at(g, 'ai', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([att]); settle(g); assert.equal(live(g, att).tapped, true, 'l\'attaquante est engagée'); use(g, maze, { target: pT(att) });
  assert.equal(live(g, att).tapped, false, 'dégagée'); assert.equal(live(g, maze).tapped, true); g.turnManager.declareBlockers({ [att.uid]: [blk.uid] }); settle(g); g.turnManager.runPhase(); settle(g);
  assert.equal(dmg(g, blk), 0, 'elle n\'inflige AUCUNE blessure de combat'); assert.equal(dmg(g, att), 0, 'et n\'en subit aucune'); assert.equal(total(g, 'player'), l0); }
{ const g = newGame(); const maze = put(g, 'player', 'Maze of Ith'); const att = put(g, 'ai', 'Hill Giant'); const l0 = total(g, 'player'); at(g, 'ai', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([att]); settle(g); use(g, maze, { target: pT(att) });
  g.turnManager.declareBlockers({}); settle(g); g.turnManager.runPhase(); settle(g); assert.equal(total(g, 'player'), l0, 'non bloquée : aucune blessure au joueur'); }
{ const g = newGame(); const maze = put(g, 'player', 'Maze of Ith'); const idle = put(g, 'ai', 'Hill Giant'); at(g, 'ai', 'main1'); assert.throws(() => use(g, maze, { target: pT(idle) }), /illégale|.+/, 'seule une créature ATTAQUANTE est une cible légale'); }
{ const g = newGame(); const maze = put(g, 'player', 'Maze of Ith'); const att = put(g, 'ai', 'Hill Giant'); at(g, 'ai', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([att]); settle(g); use(g, maze, { target: pT(att) });
  g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; g.turnManager.runPhase(); assert.ok(!calculateCharacteristics(g.state, live(g, att)).keywords.includes('nocombatdamagedealt'), 'expire à la fin du tour'); }

console.log('OK test-v12-142-g31-prevention');
