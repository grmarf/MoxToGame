// V12.76 (G21) — alignement Oracle : Staff of Zegon, Svyelunite Priest, Tunnel, Tawnos's Wand, Urza's Avenger, Tracker, Ruins of Trokair,
// Scarwood Hag, Warp Artifact, Volcanic Eruption (+ vérification des terrains d'Urza, déjà conformes). Parties réelles.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 }); const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 20 }, (_, i) => ({ uid: `${p}F${i}`, objectId: `${p}FO${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai'); g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; return g;
}
const put = (g, side, name) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false }; g.state[side].battlefield.push(p); g.triggerEngine?.syncBattlefield?.(g.state); return p; };
const live = (g, p) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((q) => q.uid === p.uid);
const has = (g, p) => !!live(g, p);
const ch = (g, p) => calculateCharacteristics(g.state, live(g, p));
const pt = (g, p) => { const c = ch(g, p); return `${c.power}/${c.toughness}`; };
const pT = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
const settle = (g, choose) => { for (let i = 0; i < 10 && (g.stack.size > 0 || g.choices.getPending()); i++) { const pe = g.choices.getPending(); if (pe) { g.choices.resolve(choose ? choose(pe) : (pe.options?.[0] ?? [])); continue; } g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); } };
const act = (g, p, { target = null, idx = 0, mana = FULL, side = 'player', choose } = {}) => { g.state.priorityHolder = side; g.state[side].mana = { ...EMPTY(), ...mana }; g.action('activateAbility', { permanent: live(g, p), controller: side, abilityIndex: idx, target }); settle(g, choose); };
function cast(g, name, target, x = 0, side = 'player', choose) {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side); settle(g, choose);
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; return card;
}
const endTurn = (g) => { for (let i = 0; i < 14 && g.state.phase !== 'cleanup'; i++) g.turnManager.nextPhase(); assert.equal(g.state.phase, 'cleanup'); };
const PICK = (pe) => (pe.options || []).slice(0, pe.min ?? 1);
const ILLEGAL = /illégale|cible|Mana|insuffisant|invalide/i;

const LOT = ['Staff of Zegon', 'Svyelunite Priest', 'Tunnel', "Tawnos's Wand", "Urza's Avenger", 'Tracker', 'Ruins of Trokair', 'Scarwood Hag', 'Warp Artifact', 'Volcanic Eruption'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Staff of Zegon : {3},{T} : la créature ciblée gagne -2/-0 jusqu'à la fin du tour (elle n'est PAS engagée) ──
{ const g = newGame(); const staff = put(g, 'player', 'Staff of Zegon'); const t = put(g, 'ai', 'Hill Giant');
  assert.throws(() => act(g, staff, { target: pT(t), mana: { C: 2 } }), ILLEGAL, '{3} exigé');
  act(g, staff, { target: pT(t), mana: { C: 3 } }); assert.equal(pt(g, t), '1/3', '3/3 -> 1/3'); assert.ok(!live(g, t).tapped, 'la cible n\'est pas engagée'); assert.ok(live(g, staff).tapped, 'le bâton s\'engage ({T} dans le coût)');
  assert.throws(() => act(g, staff, { target: pT(t), mana: { C: 3 } }), ILLEGAL, 'pas deux fois : déjà engagé');
  endTurn(g); assert.equal(pt(g, t), '3/3', 'fin du tour : effet terminé'); }
// ── Svyelunite Priest : {U}{U},{T}, pendant VOTRE entretien ─────────────────────────────────────────────
{ const g = newGame(); const sp = put(g, 'player', 'Svyelunite Priest'); const t = put(g, 'player', 'Grizzly Bears'); g.state.phase = 'upkeep';
  assert.throws(() => act(g, sp, { target: pT(t), mana: { C: 1 } }), ILLEGAL, '{1} ne suffit plus');
  assert.throws(() => act(g, sp, { target: pT(t), mana: { U: 1, C: 1 } }), ILLEGAL, '{U}{U} exige deux mana bleus');
  act(g, sp, { target: pT(t), mana: { U: 2 } }); assert.ok(ch(g, t).keywords.includes('shroud'), 'linceul'); }
// ── Tunnel : « Destroy target Wall. It can't be regenerated. » ──────────────────────────────────────────
{ const g = newGame(); const w = put(g, 'ai', 'Wall of Stone'); const h = put(g, 'ai', 'Hill Giant'); cast(g, 'Tunnel', pT(w)); assert.ok(!has(g, w), 'le Mur est détruit'); assert.ok(has(g, h), 'rien d\'autre'); }
{ const g = newGame(); const w = put(g, 'ai', 'Wall of Stone'); w.regenShield = true; cast(g, 'Tunnel', pT(w)); assert.ok(!has(g, w), 'bouclier de régénération sans effet'); }
{ const g = newGame(); const h = put(g, 'ai', 'Hill Giant'); try { cast(g, 'Tunnel', pT(h)); } catch { /* refusé à la cible */ } assert.ok(has(g, h), 'une créature qui n\'est pas un Mur n\'est pas détruite'); }
// ── Tawnos's Wand : {2},{T} : créature de force ≤ 2 imblocable ce tour-ci ───────────────────────────────
const blockers = (g, a, side = 'ai') => g.combat.getValidBlockers(side, a).map((p) => p.uid);
{ const g = newGame(); const wand = put(g, 'player', "Tawnos's Wand"); const a = put(g, 'player', 'Savannah Lions'); const b = put(g, 'ai', 'Grizzly Bears');
  act(g, wand, { target: pT(a), mana: { C: 2 } }); g.combat.begin(); g.combat.confirmAttackers([live(g, a)], 'player'); assert.deepEqual(blockers(g, live(g, a)), [], 'force 2 : imblocable'); void b; }
{ const g = newGame(); const wand = put(g, 'player', "Tawnos's Wand"); const a = put(g, 'player', 'Hill Giant'); assert.throws(() => act(g, wand, { target: pT(a), mana: { C: 2 } }), ILLEGAL, 'force 3 : cible illégale'); }
{ const g = newGame(); const wand = put(g, 'player', "Tawnos's Wand"); const a = put(g, 'player', 'Llanowar Elves'); cast(g, 'Giant Strength', pT(a)); assert.throws(() => act(g, wand, { target: pT(a), mana: { C: 2 } }), ILLEGAL, 'force 1 + 2 = 3 : illégale (force EFFECTIVE)'); }
{ const g = newGame(); const wand = put(g, 'player', "Tawnos's Wand"); const a = put(g, 'player', 'Llanowar Elves'); const b = put(g, 'ai', 'Grizzly Bears');
  act(g, wand, { target: pT(a), mana: { C: 2 } }); endTurn(g); g.combat.begin(); g.combat.confirmAttackers([live(g, a)], 'player'); assert.deepEqual(blockers(g, live(g, a)), [b.uid], 'le tour suivant : bloquable'); }
{ const g = newGame(); const wand = put(g, 'player', "Tawnos's Wand"); const a = put(g, 'player', 'Llanowar Elves'); const b = put(g, 'ai', 'Grizzly Bears'); g.combat.begin(); g.combat.confirmAttackers([live(g, a)], 'player');
  assert.deepEqual(blockers(g, live(g, a)), [b.uid], 'sans activation : l\'ancienne règle statique « force 1 imblocable » n\'existe plus'); void wand; }
// ── Urza's Avenger : {0} : -1/-1 et une capacité au choix ──────────────────────────────────────────────
{ const g = newGame(); const u = put(g, 'player', "Urza's Avenger"); const p0 = pt(g, u); assert.equal(p0, '4/4');
  act(g, u, { mana: {}, choose: () => 'flying' }); assert.equal(pt(g, u), '3/3', '{0} : -1/-1'); assert.ok(ch(g, u).keywords.includes('flying'));
  act(g, u, { mana: {}, choose: () => 'trample' }); assert.equal(pt(g, u), '2/2', 'cumulable'); assert.ok(ch(g, u).keywords.includes('trample'));
  endTurn(g); assert.equal(pt(g, u), '4/4', 'fin du tour : rétabli'); }
// ── Tracker : {G}{G},{T} : dégâts mutuels égaux aux forces ─────────────────────────────────────────────
{ const g = newGame(); const tr = put(g, 'player', 'Tracker'); const t = put(g, 'ai', 'Grizzly Bears');
  assert.throws(() => act(g, tr, { target: pT(t), mana: { G: 1 } }), ILLEGAL, '{G}{G} exigé');
  act(g, tr, { target: pT(t), mana: { G: 2 } }); assert.ok(!has(g, t), 'Grizzly Bears 2/2 subit 2 : meurt'); assert.ok(!has(g, tr), 'Tracker 2/2 subit 2 (force du Grizzly) : meurt aussi'); }
{ const g = newGame(); const tr = put(g, 'player', 'Tracker'); const h = put(g, 'ai', 'Hill Giant'); act(g, tr, { target: pT(h), mana: { G: 2 } });
  assert.ok(has(g, h) && live(g, h).damageMarked === 2, 'Hill Giant 3/3 subit 2 (force de Tracker) et survit'); assert.ok(!has(g, tr), 'Tracker subit 3 (force du géant) : meurt'); }
{ const g = newGame(); const tr = put(g, 'player', 'Tracker'); cast(g, 'Giant Growth', pT(tr)); const h = put(g, 'ai', 'Hill Giant'); act(g, tr, { target: pT(h), mana: { G: 2 } });
  assert.ok(!has(g, h), 'force EFFECTIVE de Tracker (2+3 = 5) : le géant meurt'); assert.ok(has(g, tr) && live(g, tr).damageMarked === 3, 'Tracker 5/5 subit 3 et survit'); }
{ const g = newGame(); const tr = put(g, 'player', 'Tracker'); const w = put(g, 'ai', 'Wall of Wood'); act(g, tr, { target: pT(w), mana: { G: 2 } });
  assert.equal(live(g, w).damageMarked, Number(by('Tracker').power), 'le Mur subit la force de Tracker'); assert.equal(live(g, tr).damageMarked || 0, 0, 'force 0 : Tracker ne subit rien'); assert.ok(live(g, tr).tapped); }
// ── Ruins of Trokair : arrive engagé ; {T} : {W} ; {T}, sacrifice : {W}{W} ─────────────────────────────
{ const g = newGame(); const r = put(g, 'player', 'Ruins of Trokair');
  g.action('tapMana', { permanent: live(g, r), controller: 'player', color: 'W' }); settle(g); assert.equal(g.state.player.mana.W, 1, '{T} : un seul {W}'); assert.ok(live(g, r).tapped); assert.ok(has(g, r), 'sans sacrifice'); }
{ const g = newGame(); const r = put(g, 'player', 'Ruins of Trokair'); g.state.player.mana = EMPTY(); g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: live(g, r), controller: 'player', abilityIndex: 0 }); settle(g);
  assert.equal(g.state.player.mana.W, 2, '{T}, sacrifice : {W}{W}'); assert.ok(!has(g, r), 'sacrifié'); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Ruins of Trokair')); }
assert.equal(by('Ruins of Trokair').entersTapped, true, 'Ruins of Trokair arrive engagé (donnée ; le jeu du terrain est couvert par test-v12-108)');
// ── Scarwood Hag : {G}{G}{G}{G},{T} : gagne forestwalk ; {T} : perd forestwalk jusqu'à la fin du tour ───
{ const g = newGame(); const hag = put(g, 'player', 'Scarwood Hag'); const cat = put(g, 'ai', 'Cat Warriors'); assert.ok(ch(g, cat).keywords.includes('forestwalk'));
  act(g, hag, { target: pT(cat), idx: 1, mana: {} }); assert.ok(!ch(g, cat).keywords.includes('forestwalk'), 'perd forestwalk'); assert.ok(live(g, hag).tapped);
  endTurn(g); assert.ok(ch(g, cat).keywords.includes('forestwalk'), 'fin du tour : la retrouve'); }
{ const g = newGame(); const hag = put(g, 'player', 'Scarwood Hag'); const t = put(g, 'player', 'Hill Giant'); assert.throws(() => act(g, hag, { target: pT(t), idx: 0, mana: { G: 3 } }), ILLEGAL, '{G}{G}{G}{G} exigé'); act(g, hag, { target: pT(t), idx: 0, mana: { G: 4 } }); assert.ok(ch(g, t).keywords.includes('forestwalk')); }
// ── Warp Artifact : 1 blessure au CONTRÔLEUR de l'artefact enchanté, à son entretien ───────────────────
{ const g = newGame(); const mine = put(g, 'player', 'Sol Ring'); cast(g, 'Warp Artifact', pT(mine)); const l0 = g.state.player.life;
  g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY(); // la brûlure de mana existe : vider les réserves avant d'avancer les phases
  const other = 'ai'; g.state.activePlayer = other; g.turnManager.activePlayer = other; g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup';
  for (let i = 0; i < 30; i++) { g.turnManager.nextPhase(); g.state.phase = g.turnManager.phase; if (['untap', 'upkeep', 'draw'].includes(g.turnManager.phase)) g.turnManager.advanceAutomaticPhases?.(1); if (g.turnManager.phase === 'upkeep' && g.turnManager.activePlayer === 'player') break; }
  settle(g);
  assert.equal(g.state.player.life, l0 - 1, 'mon artefact enchanté : je perds 1 PV à mon entretien (Aura posée par moi)'); }
// Warp Artifact inflige de vraies BLESSURES (et non une perte de PV) : Ali from Cairo les remplace (« reduces it to 1 instead »)
{ const g = newGame(); assert.equal(by('Ali from Cairo').effectStatus, 'implemented'); put(g, 'player', 'Ali from Cairo'); const mine = put(g, 'player', 'Sol Ring'); cast(g, 'Warp Artifact', pT(mine)); g.state.player.life = 1;
  g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY(); const other = 'ai'; g.state.activePlayer = other; g.turnManager.activePlayer = other; g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup';
  for (let i = 0; i < 30; i++) { g.turnManager.nextPhase(); g.state.phase = g.turnManager.phase; if (['untap', 'upkeep', 'draw'].includes(g.turnManager.phase)) g.turnManager.advanceAutomaticPhases?.(1); if (g.turnManager.phase === 'upkeep' && g.turnManager.activePlayer === 'player') break; }
  settle(g); assert.equal(g.state.player.life, 1, 'blessure remplacée par Ali from Cairo : je reste à 1 PV (une simple perte de PV m\'aurait tué)'); }
// ── Volcanic Eruption : détruit X Montagnes ; blessures à chaque créature et joueur = nombre détruit ────
{ const g = newGame(); put(g, 'player', 'Mountain'); put(g, 'ai', 'Mountain'); put(g, 'ai', 'Mountain'); const giant = put(g, 'ai', 'Hill Giant'); const bears = put(g, 'player', 'Grizzly Bears'); const lp = g.state.player.life, la = g.state.ai.life;
  cast(g, 'Volcanic Eruption', undefined, 2, 'player', PICK); const left = ['player', 'ai'].flatMap((s) => g.state[s].battlefield).filter((p) => p.name === 'Mountain').length;
  assert.equal(left, 1, '2 Montagnes détruites sur 3'); assert.ok(has(g, giant) && live(g, giant).damageMarked === 2, 'Hill Giant 3/3 subit 2 et survit'); assert.ok(!has(g, bears), 'Grizzly Bears 2/2 subit 2 et meurt');
  assert.equal(g.state.player.life, lp - 2); assert.equal(g.state.ai.life, la - 2); }
{ const g = newGame(); put(g, 'ai', 'Mountain'); const lp = g.state.player.life; cast(g, 'Volcanic Eruption', undefined, 4, 'player', PICK); assert.equal(g.state.player.life, lp - 1, 'X=4 mais une seule Montagne : 1 blessure (nombre RÉELLEMENT détruit)'); }
{ const g = newGame(); put(g, 'ai', 'Mountain'); const lp = g.state.player.life; cast(g, 'Volcanic Eruption', undefined, 0, 'player', PICK); assert.equal(g.state.player.life, lp, 'X=0 : rien'); }
// ── Terrains d'Urza (déjà conformes ; la relecture signalait seulement la notation {C}) ─────────────────
{ const g = newGame(); const mine = put(g, 'player', "Urza's Mine"); g.action('tapMana', { permanent: live(g, mine), controller: 'player', color: 'C' }); settle(g); assert.equal(g.state.player.mana.C, 1, 'Mine seule : {C}'); }
{ const g = newGame(); const m = put(g, 'player', "Urza's Mine"); put(g, 'player', "Urza's Power Plant"); const t = put(g, 'player', "Urza's Tower");
  g.state.player.mana = EMPTY(); g.action('tapMana', { permanent: live(g, m), controller: 'player', color: 'C' }); settle(g); assert.equal(g.state.player.mana.C, 2, 'Mine avec les trois : {C}{C}');
  g.state.player.mana = EMPTY(); g.action('tapMana', { permanent: live(g, t), controller: 'player', color: 'C' }); settle(g); assert.equal(g.state.player.mana.C, 3, 'Tour avec les trois : {C}{C}{C}'); }
console.log(`OK V12.76.132 : ${LOT.length} cartes alignées sur l'Oracle (G21) + terrains d'Urza vérifiés, en partie réelle.`);
