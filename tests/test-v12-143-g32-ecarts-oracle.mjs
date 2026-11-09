// V12.76 (G32) — Écarts relevés par la comparaison de TOUTE la base à l'export Scryfall (Oracle actuel) : cartes jouables dont l'effet ne suit pas l'Oracle.
// Ironclaw Orcs, Celestial Prism, Howling Mine, Iron Star + Crystal Rod/Ivory Cup/Throne of Bone/Wooden Sphere, Amrou Kithkin, Invisibility, Tangle Kelp, Dragon Whelp, Desert Nomads, Demonic Hordes, Pirate Ship, Argothian Pixies.
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

const tn = (g, n) => { g.state.turnNumber = n; g.turnManager.turnNumber = n; };
const at = (g, active, phase) => { g.state.activePlayer = active; g.turnManager.activePlayer = active; g.turnManager.gotoPhase(phase); g.state.phase = phase; g.state.priorityHolder = 'player'; g.turnManager.phaseStarted = false; };
const kws = (g, p) => calculateCharacteristics(g.state, live(g, p)).keywords;
const names = (list) => list.map((p) => p.name);
const blockers = (g, side, att) => names(g.combat.getValidBlockers(side, att));
const toEndStep = (g) => { for (let i = 0; i < 8 && g.state.phase !== 'endStep'; i++) { g.turnManager.nextPhase(); settle(g); } assert.equal(g.state.phase, 'endStep'); };

// ── Données : mots-clés et valeurs (relevés par le script contre Scryfall) ───────────────────────────────────────
for (const n of ['Pirate Ship', 'Demonic Hordes', 'Argothian Pixies']) assert.ok(!(by(n).keywords || []).includes('flying'), `${n} : pas de vol (Oracle)`);
assert.ok(!(by('Amrou Kithkin').keywords || []).includes('banding'), 'Amrou Kithkin : pas de bande (Oracle)');
assert.deepEqual((by('Desert Nomads').keywords || []).sort(), ['desertwalk', 'landwalk'], 'Desert Nomads : Desertwalk (pas de mountainwalk ni de protection bleue)'); assert.equal(by('Desert Nomads').static[0].type, 'preventDamageFromSubtype', 'et prévention des blessures des Déserts');
assert.equal(by('Celestial Prism').activated[0].cost, '{2}', 'Celestial Prism : {2}, {T} (Oracle)');
assert.equal(by('Ironclaw Orcs').static[0].power, 2, 'Ironclaw Orcs : force 2 ou plus (Oracle)');

// ── Ironclaw Orcs : ne peut pas bloquer les créatures de force 2 OU PLUS ──────────────────────────────────────────
{ const g = newGame(); const orcs = put(g, 'player', 'Ironclaw Orcs'); const two = put(g, 'ai', 'Grizzly Bears'); const one = put(g, 'ai', 'Goblin Digging Team'); const three = put(g, 'ai', 'Hill Giant');
  at(g, 'ai', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([two, one, three]); settle(g);
  assert.ok(!blockers(g, 'player', two).includes('Ironclaw Orcs'), 'force 2 : ne peut PAS bloquer'); assert.ok(!blockers(g, 'player', three).includes('Ironclaw Orcs'), 'force 3 : non plus'); assert.ok(blockers(g, 'player', one).includes('Ironclaw Orcs'), 'force 1 : peut bloquer'); void orcs; }

// ── Celestial Prism : {2}, {T} : un mana de la couleur de votre choix ────────────────────────────────────────────
{ const g = newGame(); const prism = put(g, 'player', 'Celestial Prism'); assert.throws(() => act(g, prism, 'player', {}, { ...EMPTY(), C: 1 }), /.+/, '1 seul mana : refusé');
  act(g, prism, 'player', {}, { ...EMPTY(), C: 2 }); const pe = g.choices.getPending(); assert.equal(pe?.type, 'manaColor', 'choix de la couleur'); g.choices.resolve('G'); settle(g);
  assert.deepEqual(g.state.player.mana, { ...EMPTY(), G: 1 }, '{2} payés, un mana de la couleur choisie'); assert.equal(live(g, prism).tapped, true); }

// ── Howling Mine : au début de la pioche de CHAQUE joueur, s'il est dégagé, CE joueur pioche une carte de plus ─────────────────────────────
const drawDelta = (g, side) => { upkeepOf(g, side); const h0 = g.state[side].hand.length; g.turnManager.nextPhase(); settle(g); assert.equal(g.state.phase, 'draw'); return g.state[side].hand.length - h0; };
{ const g = newGame(); tn(g, 5); put(g, 'player', 'Howling Mine'); assert.equal(drawDelta(g, 'ai'), 2, 'l\'ADVERSAIRE pioche 2 cartes à SON étape de pioche (Mine dégagée)'); }
{ const g = newGame(); tn(g, 5); put(g, 'player', 'Howling Mine'); at(g, 'ai', 'cleanup'); assert.equal(drawDelta(g, 'player'), 2, 'moi aussi à la mienne'); }
{ const g = newGame(); tn(g, 5); put(g, 'player', 'Howling Mine', { tapped: true }); assert.equal(drawDelta(g, 'ai'), 1, 'Mine ENGAGÉE : aucune carte supplémentaire'); }
{ const g = newGame(); tn(g, 5); put(g, 'ai', 'Howling Mine'); assert.equal(drawDelta(g, 'ai'), 2, 'Mine adverse : son contrôleur pioche aussi à son étape'); }
{ const g = newGame(); tn(g, 5); put(g, 'ai', 'Howling Mine'); at(g, 'ai', 'cleanup'); const h0 = g.state.ai.hand.length; assert.equal(drawDelta(g, 'player'), 2, 'la Mine adverse me fait piocher aussi'); assert.equal(g.state.ai.hand.length, h0, 'sans rien donner à son contrôleur à MON étape de pioche'); }

// ── Iron Star et ses quatre sœurs : « chaque fois qu'un joueur lance un sort [couleur], vous pouvez payer {1} ; si vous le faites, vous gagnez 1 PV » ──
const SISTERS = [['Iron Star', 'Lightning Bolt', { kind: 'player', side: 'ai' }, 'Giant Growth'], ['Crystal Rod', 'Ancestral Recall', { kind: 'player', side: 'ai' }, 'Lightning Bolt'],
  ['Ivory Cup', 'Holy Light', null, 'Lightning Bolt'], ['Throne of Bone', 'Dark Ritual', null, 'Lightning Bolt'], ['Wooden Sphere', 'Giant Growth', 'ai-creature', 'Lightning Bolt']];
for (const [art, good, tgt, wrong] of SISTERS) {
  assert.equal(by(art).effectStatus, 'implemented', `${art} : statut`);
  const mk = () => { const g = newGame(); const a = put(g, 'player', art); const gc = put(g, 'ai', 'Grizzly Bears'); g.state.player.mana = { ...EMPTY(), C: 1 }; return { g, a, gc }; };
  const target = (gc) => (tgt === 'ai-creature' ? pT(gc) : tgt);
  { const { g, gc } = mk(); const l0 = g.state.player.life; cast(g, good, target(gc), 0, 'ai'); const pe = g.choices.getPending(); assert.equal(pe?.type, 'payToGainLife', `${art} : question posée`); assert.equal(pe.controller, 'player', 'à son contrôleur'); assert.deepEqual(pe.options, ['pay', 'decline']);
    g.choices.resolve('pay'); settle(g); assert.equal(g.state.player.life, l0 + 1, `${art} : +1 PV`); assert.equal(g.state.player.mana.C, 0, '{1} payé'); }
  { const { g, gc } = mk(); const l0 = g.state.player.life; cast(g, good, target(gc), 0, 'ai'); g.choices.resolve('decline'); settle(g); assert.equal(g.state.player.life, l0, `${art} : refus`); assert.equal(g.state.player.mana.C, 1); }
  { const { g, gc } = mk(); cast(g, wrong, wrong === 'Lightning Bolt' ? { kind: 'player', side: 'ai' } : pT(gc), 0, 'ai'); assert.equal(g.choices.getPending(), null, `${art} : sort d'une AUTRE couleur : rien`); }
}
{ const g = newGame(); put(g, 'player', 'Iron Star'); const l0 = g.state.player.life; g.state.player.mana = { ...EMPTY(), C: 0 }; cast(g, 'Lightning Bolt', { kind: 'player', side: 'ai' }, 0, 'ai'); const pe = g.choices.getPending(); assert.deepEqual(pe?.options, ['decline'], 'sans {1} disponible : rien à payer'); g.choices.resolve('decline'); settle(g); assert.equal(g.state.player.life, l0); }
{ const g = newGame(); put(g, 'player', 'Iron Star'); const l0 = g.state.player.life; cast(g, 'Lightning Bolt', { kind: 'player', side: 'ai' }); assert.ok(g.choices.getPending(), 'mon PROPRE sort rouge déclenche aussi (« un joueur »)'); g.choices.resolve('decline'); settle(g); void l0; }

// ── Amrou Kithkin : ne peut pas être bloquée par une créature de force 3 OU PLUS ───────────────────────────────────────────
{ const g = newGame(); const am = put(g, 'player', 'Amrou Kithkin'); const big = put(g, 'ai', 'Hill Giant'); const small = put(g, 'ai', 'Grizzly Bears'); at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([am]); settle(g);
  const b = blockers(g, 'ai', am); assert.ok(!b.includes('Hill Giant'), 'force 3 : ne peut pas la bloquer'); assert.ok(b.includes('Grizzly Bears'), 'force 2 : peut'); void big; void small; }

// ── Invisibility : la créature enchantée ne peut pas être bloquée, excepté par des Murs ───────────────────────────────────────
{ const g = newGame(); const att = put(g, 'player', 'Grizzly Bears'); cast(g, 'Invisibility', pT(att)); put(g, 'ai', 'Hill Giant'); put(g, 'ai', 'Wall of Stone'); at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([live(g, att)]); settle(g);
  assert.deepEqual(blockers(g, 'ai', live(g, att)), ['Wall of Stone'], 'seuls les Murs peuvent bloquer'); }
{ const g = newGame(); const att = put(g, 'player', 'Grizzly Bears'); put(g, 'ai', 'Hill Giant'); at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([att]); settle(g); assert.ok(blockers(g, 'ai', att).includes('Hill Giant'), 'témoin : sans Aura, le Géant bloque'); }

// ── Tangle Kelp : engage la créature à l'arrivée ; ne se dégage pas si elle a attaqué lors du dernier tour de son contrôleur ─────────────────────────
{ const g = newGame(); tn(g, 5); const c = put(g, 'player', 'Grizzly Bears'); cast(g, 'Tangle Kelp', pT(c)); assert.equal(live(g, c).tapped, true, 'engagée à l\'arrivée de l\'Aura');
  upkeepOf(g, 'ai'); upkeepOf(g, 'player'); assert.equal(live(g, c).tapped, false, 'n\'a pas attaqué lors de son dernier tour : se dégage');
  g.turnManager.gotoPhase('main1'); g.state.phase = 'main1'; g.turnManager.beginCombat(); g.turnManager.declareAttackers([live(g, c)]); settle(g); assert.equal(live(g, c).tapped, true, 'elle attaque (s\'engage)');
  upkeepOf(g, 'ai'); upkeepOf(g, 'player'); assert.equal(live(g, c).tapped, true, 'A ATTAQUÉ lors de son dernier tour : NE se dégage PAS');
  upkeepOf(g, 'ai'); upkeepOf(g, 'player'); assert.equal(live(g, c).tapped, false, 'n\'a pas pu attaquer (engagée) : se dégage au tour suivant'); }
{ const g = newGame(); tn(g, 5); const c = put(g, 'player', 'Grizzly Bears'); assert.notEqual(String(by('Tangle Kelp').effect?.keyword).toLowerCase(), 'cantattack', 'plus de « ne peut pas attaquer »'); cast(g, 'Tangle Kelp', pT(c)); at(g, 'player', 'main1'); live(g, c).tapped = false; g.turnManager.beginCombat(); g.turnManager.declareAttackers([live(g, c)]); settle(g); assert.ok(g.combat.combat.attackers.length === 1, 'elle PEUT attaquer (Oracle)'); }

// Témoin : une créature ORDINAIRE qui a attaqué se dégage normalement à son tour suivant (Tangle Kelp ne concerne que la créature enchantée)
{ const g = newGame(); tn(g, 5); const c = put(g, 'player', 'Grizzly Bears'); const k = put(g, 'player', 'Grizzly Bears'); cast(g, 'Tangle Kelp', pT(k)); live(g, k).tapped = false; at(g, 'player', 'main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers([live(g, c), live(g, k)]); settle(g);
  upkeepOf(g, 'ai'); upkeepOf(g, 'player'); assert.equal(live(g, c).tapped, false, 'créature ordinaire : se dégage'); assert.equal(live(g, k).tapped, true, 'créature enchantée de Tangle Kelp : reste engagée'); }

// ── Dragon Whelp : {R} : +1/+0 ; activée 4 fois ou plus ce tour : sacrifiée à la prochaine étape de fin ─────────────────────────────────────────────
{ const g = newGame(); const w = put(g, 'player', 'Dragon Whelp'); for (let i = 0; i < 4; i++) act(g, w, 'player', {}, FULL); assert.equal(calculateCharacteristics(g.state, live(g, w)).power, 2 + 4, '+4/+0 (Whelp 2/3)'); assert.ok(has(g, w), 'encore là avant l\'étape de fin'); at(g, 'player', 'main2'); toEndStep(g); assert.ok(!has(g, w) && inGy(g, w), 'sacrifiée à l\'étape de fin (4 activations)'); }
{ const g = newGame(); const w = put(g, 'player', 'Dragon Whelp'); for (let i = 0; i < 3; i++) act(g, w, 'player', {}, FULL); at(g, 'player', 'main2'); toEndStep(g); assert.ok(has(g, w), '3 activations : épargnée'); }
{ const g = newGame(); const w = put(g, 'player', 'Dragon Whelp'); for (let i = 0; i < 3; i++) act(g, w, 'player', {}, FULL); g.state.turnNumber += 1; g.turnManager.turnNumber += 1; for (let i = 0; i < 3; i++) act(g, w, 'player', {}, FULL); at(g, 'player', 'main2'); toEndStep(g); assert.ok(has(g, w), '3 + 3 sur DEUX tours différents : le compte repart à zéro'); }

// ── Desert Nomads : prévenez toutes les blessures que lui infligent les Déserts ──────────────────────────────────────────────────────────────
{ const g = newGame(); const nom = put(g, 'ai', 'Desert Nomads'); const gr = put(g, 'ai', 'Grizzly Bears'); const desert = put(g, 'player', 'Desert'); g.replacements.applyDamageToPermanent(live(g, nom), 1, { source: live(g, desert) });
  assert.equal((live(g, nom).damageMarked || 0), 0, 'blessure de Désert prévenue'); g.replacements.applyDamageToPermanent(live(g, gr), 1, { source: live(g, desert) }); assert.equal(live(g, gr).damageMarked, 1, 'témoin : un Grizzly subit 1 blessure du Désert');
  g.replacements.applyDamageToPermanent(live(g, nom), 1, { source: put(g, 'player', 'Hill Giant') }); assert.equal(live(g, nom).damageMarked, 1, 'une blessure d\'une AUTRE source passe'); }

// ── Demonic Hordes : {T} : détruisez un terrain ciblé (la capacité manquait) ──────────────────────────────────────────────────────────────────────
{ const g = newGame(); const h = put(g, 'player', 'Demonic Hordes'); const land = put(g, 'ai', 'Mountain'); act(g, h, 'player', { target: pT(land) }); assert.ok(!has(g, land), 'terrain détruit'); assert.equal(live(g, h).tapped, true, 'Demonic Hordes s\'engage'); }
{ const g = newGame(); const h = put(g, 'player', 'Demonic Hordes'); const c = put(g, 'ai', 'Grizzly Bears'); assert.throws(() => act(g, h, 'player', { target: pT(c) }), /.+/, 'une créature n\'est pas une cible légale'); }

console.log('OK test-v12-143-g32-ecarts-oracle');
