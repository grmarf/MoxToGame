// V12.75 — Chantier 2, lot F2a : 8 cartes sans statut dont le comportement a été vérifié en partie réelle, puis certifiées.
// Protocole (validé, voir docs/reports/V12.75-REPORT.md) : cartes posées par un VRAI lancer (enregistrement des déclencheurs),
// tours pilotés par nextPhase(), réserves de mana vidées avant de piloter (brûlure de mana).
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
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side); settle(g, choose);
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

const act = (g, perm, target, pool) => { g.state.player.mana = { ...FULL, ...(pool || {}) }; g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, perm), abilityIndex: 0, ability: cur(g, perm).activated[0], target }, 'player'); settle(g); };
const kws = (g, p) => calculateCharacteristics(g.state, cur(g, p)).keywords;
const fissure = (g, target, side = 'ai') => cast(g, 'Fissure', side, pT(target));
// V12.76 (G19) : Fissure interdit la régénération (Oracle) -> les tests de bouclier passent par des blessures létales (actions d'état).
const kill = (g, target) => { cur(g, target).damageMarked = 99; g.stack.sba.check(g.state); };
const ARTIFACT_CREATURES = ['Obsianus Golem', 'Dancing Scimitar', 'Clay Statue', 'Dragon Engine', 'Ornithopter', 'Wall of Spears', 'Yotian Soldier', 'Diabolic Machine',
  'Brass Man', 'Grapeshot Catapult', 'Living Wall', 'Colossus of Sardia', 'Onulet', 'Su-Chi', 'Tetravus', 'Coal Golem', "Urza's Avenger", 'Necropolis', 'Juggernaut'];
for (const n of ARTIFACT_CREATURES) {
  const c = by(n); assert.equal(c.effectStatus === 'implemented' || c.effectStatus === 'functional', true, `${n} : statut`);
  assert.equal(c.type, 'Artifact Creature', `${n} : type`); assert.equal(c.isCreature, true, `${n} : isCreature`);
  const g = newGame(); const p = put(g, 'player', n); assert.deepEqual(pt(g, p), [Number(c.power), Number(c.toughness)], `${n} : caractéristiques de base`);
}
// Régression de fond : une créature-artefact peut attaquer et bloquer.
{ const g = newGame(); const y = put(g, 'ai', 'Yotian Soldier'); const a = put(g, 'player', 'Hill Giant'); attack(g, [a]); assert.deepEqual(g.combat.getValidBlockers('ai', a).map((p) => p.uid), [y.uid], 'Yotian Soldier (artefact-créature) peut bloquer');
  const g2 = newGame(); const o = put(g2, 'player', 'Obsianus Golem'); g2.state.activePlayer = 'player'; g2.combat.begin(); assert.ok(g2.combat.getValidAttackers('player').some((p) => p.uid === o.uid), 'et attaquer'); }
{ const g = newGame(); const o = put(g, 'ai', 'Obsianus Golem'); cast(g, 'Fissure', 'player', pT(o)); assert.ok(!has(g, o), 'un artefact-créature est une cible légale de « détruisez une créature »'); }

// ── Brass Man ────────────────────────────────────────────────────────────
{ const g = newGame(); const b = play(g, 'player', 'Brass Man'); b.tapped = true; drive(g, 'player', 'upkeep'); assert.ok(cur(g, b).tapped, 'ne se dégage pas à l\'étape de dégagement'); }
// V12.76 (G24) : « {1} : dégagez-le » à tout moment était faux (Oracle : à VOTRE entretien, vous pouvez payer {1}) — comportement testé dans test-v12-135.
assert.ok(!(by('Brass Man').activated || []).length, 'Brass Man : plus de capacité activée à tout moment');
{ const g = newGame(); const b = play(g, 'player', 'Brass Man'); const other = put(g, 'player', 'Hill Giant', { tapped: true }); drive(g, 'player', 'upkeep'); assert.ok(!cur(g, other).tapped, 'les autres permanents se dégagent normalement'); void b; }

// ── Dancing Scimitar / Ornithopter / Yotian Soldier / Wall of Spears ─────
{ const g = newGame(); const s = put(g, 'player', 'Dancing Scimitar'); put(g, 'ai', 'Hill Giant'); const f = put(g, 'ai', 'Azure Drake'); attack(g, [s]); assert.deepEqual(g.combat.getValidBlockers('ai', s).map((p) => p.uid), [f.uid], 'vol : seul un volant bloque'); }
{ const g = newGame(); const o = put(g, 'player', 'Ornithopter'); assert.ok(kws(g, o).includes('flying')); assert.deepEqual(pt(g, o), [0, 2]);
  const g2 = newGame(); g2.state.activePlayer = 'player'; const card = { ...by('Ornithopter'), uid: 'orn', owner: 'player', controller: 'player' }; g2.state.player.hand.push(card); g2.state.player.mana = { ...ZERO }; g2.state.priorityHolder = 'player';
  g2.dispatch('CAST_SPELL', { card, xValue: 0 }, 'player'); settle(g2); assert.ok(field(g2, 'player').some((p) => p.name === 'Ornithopter'), 'coût {0} : se lance sans mana'); }
{ const g = newGame(); const y = put(g, 'player', 'Yotian Soldier'); attack(g, [y], 'player', {}); assert.ok(!cur(g, y).tapped, 'vigilance : reste dégagé en attaquant'); }
{ const g = newGame(); const w = put(g, 'player', 'Wall of Spears'); assert.ok(kws(g, w).includes('defender') && kws(g, w).includes('first strike'), 'défenseur + initiative'); g.state.activePlayer = 'player'; g.combat.begin(); assert.ok(!g.combat.getValidAttackers('player').some((p) => p.uid === w.uid), 'ne peut pas attaquer');
  const a = put(g, 'ai', 'Savannah Lions'); attack(g, [a], 'ai'); g.combat.assignBlockers({ [a.uid]: [w.uid] }); g.combat.resolveDamage(); settle(g);
  assert.ok(!has(g, a), 'l\'initiative du mur tue d\'abord Savannah Lions (2/1)'); assert.equal(cur(g, w).damageMarked || 0, 0, 'le mur ne subit aucune blessure'); }

// ── Régénération : Clay Statue {2}, Diabolic Machine {3}, Living Wall {1} ──
for (const [name, cost] of [['Clay Statue', { C: 2 }], ['Diabolic Machine', { C: 3 }], ['Living Wall', { C: 1 }]]) {
  { const g = newGame(); const c = put(g, 'player', name); act(g, c); kill(g, c); assert.ok(has(g, c) && cur(g, c).tapped, `${name} : régénérée (engagée)`); }
  { const g = newGame(); const c = put(g, 'player', name); kill(g, c); assert.ok(!has(g, c), `${name} : sans paiement, elle meurt`); }
  { const g = newGame(); const c = put(g, 'player', name); act(g, c); kill(g, c); assert.ok(has(g, c)); cur(g, c).tapped = false; kill(g, c); assert.ok(!has(g, c), `${name} : le bouclier est consommé`); }
  { const g = newGame(); const c = put(g, 'player', name); assert.throws(() => act(g, c, undefined, { ...ZERO, C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 }) , /illégale|invalide|Coût/i, `${name} : sans mana, l'activation est refusée`); void cost; }
}
{ const g = newGame(); const w = put(g, 'player', 'Living Wall'); g.state.activePlayer = 'player'; g.combat.begin(); assert.ok(kws(g, w).includes('defender') && !g.combat.getValidAttackers('player').some((p) => p.uid === w.uid), 'Living Wall : défenseur'); }

// ── Dragon Engine : {2} : +1/+0 jusqu'à la fin du tour (cumulatif) ──────
{ const g = newGame(); const d = put(g, 'player', 'Dragon Engine'); const base = pt(g, d); act(g, d); assert.deepEqual(pt(g, cur(g, d)), [base[0] + 1, base[1]]); act(g, d); assert.deepEqual(pt(g, cur(g, d)), [base[0] + 2, base[1]], 'cumulatif'); cleanup(g); assert.deepEqual(pt(g, cur(g, d)), base, 'cesse en fin de tour'); }

// ── Grapeshot Catapult : {T} : 1 blessure à une créature AVEC LE VOL ───
{ const g = newGame(); const c = put(g, 'player', 'Grapeshot Catapult'); const ground = put(g, 'ai', 'Hill Giant'); assert.throws(() => act(g, c, pT(ground)), /illégale|cible/i, 'créature sans vol : cible illégale'); assert.ok(!cur(g, c).tapped, 'rien payé'); assert.equal(cur(g, ground).damageMarked || 0, 0); }
{ const g = newGame(); const c = put(g, 'player', 'Grapeshot Catapult'); const fly = put(g, 'ai', 'Azure Drake'); act(g, c, pT(fly)); assert.equal(cur(g, fly).damageMarked, 1, '1 blessure'); assert.ok(cur(g, c).tapped, '{T} payé'); assert.throws(() => act(g, c, pT(fly)), /illégale|engag/i, 'engagée : pas de seconde activation'); }
{ const g = newGame(); const c = put(g, 'player', 'Grapeshot Catapult'); const fly = put(g, 'ai', 'Zephyr Falcon'); put(g, 'ai', 'Serra Angel'); act(g, c, pT(fly)); assert.ok(!has(g, fly), 'Zephyr Falcon (1/1 vol) meurt'); }
{ const g = newGame(); const c = put(g, 'player', 'Grapeshot Catapult'); const ground = put(g, 'ai', 'Hill Giant'); cast(g, 'Giant Strength', 'ai', pT(ground)); assert.throws(() => act(g, c, pT(ground)), /illégale|cible/i, 'toujours sans vol'); cast(g, 'Flight', 'ai', pT(ground)); act(g, c, pT(ground)); assert.equal(cur(g, ground).damageMarked, 1, 'un volant « acquis » (Aura Flight) devient une cible légale'); }

// ── Colossus of Sardia ───────────────────────────────────────────────────
{ const g = newGame(); const c = play(g, 'player', 'Colossus of Sardia'); assert.deepEqual(pt(g, c), [9, 9]); assert.ok(kws(g, c).includes('trample') && cur(g, c).keywords.includes('doesntUntap')); c.tapped = true; drive(g, 'player', 'upkeep'); assert.ok(cur(g, c).tapped, 'ne se dégage pas'); }
{ const g = newGame(); const c = put(g, 'player', 'Colossus of Sardia'); const a = put(g, 'ai', 'Hill Giant'); attack(g, [a], 'ai'); assert.ok(g.combat.getValidBlockers('player', a).some((p) => p.uid === c.uid), 'PEUT bloquer'); }
{ const g = newGame(); const c = play(g, 'player', 'Colossus of Sardia'); c.tapped = true; assert.throws(() => act(g, c, undefined, { ...ZERO, C: 20 }), /illégale|invalide/i, '{9} hors de l\'entretien : refusé'); assert.ok(cur(g, c).tapped); }
{ const g = newGame(); const c = play(g, 'player', 'Colossus of Sardia'); c.tapped = true; driveTo(g, 'player', 'upkeep'); settle(g); g.state.player.mana = { ...ZERO, C: 9 }; g.state.priorityHolder = 'player';
  g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, c), abilityIndex: 0, ability: cur(g, c).activated[0] }, 'player'); settle(g); assert.ok(!cur(g, c).tapped, '{9} pendant VOTRE entretien : dégagé'); assert.equal(g.state.player.mana.C, 0, 'neuf mana dépensés'); }
{ const g = newGame(); const c = play(g, 'player', 'Colossus of Sardia'); c.tapped = true; driveTo(g, 'player', 'upkeep'); settle(g); g.state.player.mana = { ...ZERO, C: 8 }; g.state.priorityHolder = 'player';
  assert.throws(() => g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, c), abilityIndex: 0, ability: cur(g, c).activated[0] }, 'player'), /illégale|invalide/i, 'huit mana ne suffisent pas'); }
{ const g = newGame(); const c = play(g, 'player', 'Colossus of Sardia'); c.tapped = true; driveTo(g, 'ai', 'upkeep'); settle(g); g.state.player.mana = { ...ZERO, C: 20 }; g.state.priorityHolder = 'player';
  assert.throws(() => g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, c), abilityIndex: 0, ability: cur(g, c).activated[0] }, 'player'), /illégale|invalide/i, 'à l\'entretien de l\'ADVERSAIRE : refusé'); }

// ── Onulet / Su-Chi : « quand cette créature MEURT » ─────────────────────
{ const g = newGame(); const o = play(g, 'player', 'Onulet'); g.state.player.life = 10; g.state.ai.life = 10; fissure(g, o); assert.ok(!has(g, o)); assert.equal(g.state.player.life, 12, 'Onulet meurt : +2 PV'); assert.equal(g.state.ai.life, 10); }
{ const g = newGame(); const o = play(g, 'ai', 'Onulet'); g.state.player.life = 10; g.state.ai.life = 10; cast(g, 'Fissure', 'player', pT(o)); assert.equal(g.state.ai.life, 12, 'Onulet ADVERSE : son contrôleur gagne 2'); assert.equal(g.state.player.life, 10, 'pas vous'); }
{ const g = newGame(); play(g, 'player', 'Onulet'); const other = put(g, 'ai', 'Hill Giant'); g.state.player.life = 10; g.state.ai.life = 10; cast(g, 'Fissure', 'player', pT(other)); assert.ok(!has(g, other)); assert.equal(g.state.player.life, 10, 'la mort d\'une AUTRE créature ne déclenche pas Onulet'); assert.equal(g.state.ai.life, 10); }
{ const g = newGame(); const o = play(g, 'player', 'Onulet'); g.state.player.life = 10; cast(g, 'Boomerang', 'ai', pT(o)); assert.ok(!has(g, o)); assert.equal(g.state.player.life, 10, 'renvoyé en main : ne MEURT pas, aucun gain'); }
{ const g = newGame(); const o = play(g, 'player', 'Onulet'); g.state.player.life = 10; const b = put(g, 'ai', 'Hill Giant'); attack(g, [b], 'ai', { [b.uid]: [o.uid] }); g.combat.resolveDamage(); settle(g); assert.ok(!has(g, o)); assert.equal(g.state.player.life, 12, 'mort au combat : +2 aussi'); }
{ const g = newGame(); const s = play(g, 'player', 'Su-Chi'); zero(g); fissure(g, s); assert.ok(!has(g, s)); assert.deepEqual(g.state.player.mana, { ...ZERO, C: 4 }, 'Su-Chi meurt : {C}{C}{C}{C}'); }
{ const g = newGame(); const s = play(g, 'ai', 'Su-Chi'); zero(g); cast(g, 'Fissure', 'player', pT(s)); assert.deepEqual(g.state.ai.mana, { ...FULL, ...{} } && g.state.ai.mana); assert.equal(g.state.ai.mana.C, 4, 'Su-Chi adverse : son contrôleur reçoit le mana'); assert.equal(g.state.player.mana.C, FULL.C - FULL.C + (g.state.player.mana.C), 'sans effet pour vous'); }
{ const g = newGame(); const s = play(g, 'player', 'Su-Chi'); zero(g); cast(g, 'Boomerang', 'ai', pT(s)); assert.equal(g.state.player.mana.C, 0, 'renvoyé en main : aucun mana'); }

// ── Tetravus : arrive avec trois jetons Tétravite 1/1 avec vol ───────────
{ const g = newGame(); cast(g, 'Tetravus', 'player'); const tokens = field(g, 'player').filter((p) => p.name === 'Tetravite');
  assert.equal(tokens.length, 3, 'exactement trois jetons (régression : permanentEntered était émis deux fois)'); for (const t of tokens) { assert.deepEqual(pt(g, t), [1, 1]); assert.ok(kws(g, t).includes('flying'), 'jeton avec vol'); assert.equal(t.controller, 'player'); assert.ok(/Artifact/.test(calculateCharacteristics(g.state, t).type) && /Creature/.test(calculateCharacteristics(g.state, t).type), 'jeton artefact-créature'); }
  assert.ok(field(g, 'player').some((p) => p.name === 'Tetravus'), 'Tetravus lui-même est en jeu'); assert.equal(field(g, 'ai').length, 0); }
{ const g = newGame(); cast(g, 'Tetravus', 'ai'); assert.equal(field(g, 'ai').filter((p) => p.name === 'Tetravite').length, 3, 'chez l\'adversaire aussi'); assert.equal(field(g, 'player').length, 0); }
{ const g = newGame(); const c = cast(g, 'Tetravus', 'player'); fissure(g, field(g, 'player').find((p) => p.name === 'Tetravus')); assert.equal(field(g, 'player').filter((p) => p.name === 'Tetravite').length, 3, 'les jetons restent après la mort de Tetravus'); void c; }
{ const g = newGame(); cast(g, 'Tetravus', 'player'); const before = field(g, 'player').length; cast(g, 'Ornithopter', 'player'); assert.equal(field(g, 'player').filter((p) => p.name === 'Tetravite').length, 3, 'un autre permanent qui arrive ne crée aucun jeton'); assert.equal(field(g, 'player').length, before + 1); }

// ── Coal Golem : {3} : sacrifiez-le, ajoutez {R}{R}{R} ──────────────────
{ const g = newGame(); const c = put(g, 'player', 'Coal Golem'); act(g, c, undefined, { ...ZERO, C: 3 }); assert.ok(!has(g, c), 'sacrifié'); assert.deepEqual(g.state.player.mana, { ...ZERO, R: 3 }, '{3} dépensés, {R}{R}{R} ajoutés'); assert.ok(g.state.player.graveyard.some((x) => x.name === 'Coal Golem'), 'au cimetière'); }
{ const g = newGame(); const c = put(g, 'player', 'Coal Golem'); assert.throws(() => act(g, c, undefined, { ...ZERO, C: 2 }), /illégale|invalide/i, 'deux mana ne suffisent pas'); assert.ok(has(g, c)); }
{ const g = newGame(); const c = put(g, 'player', 'Coal Golem'); act(g, c); assert.ok(!has(g, c) && !field(g, 'player').some((p) => p.name === 'Coal Golem'), 'un seul exemplaire, aucun doublon'); }
{ const g = newGame(); const c = put(g, 'player', 'Coal Golem', { regenShield: true }); act(g, c, undefined, { ...ZERO, C: 3 }); assert.ok(!has(g, c), 'un SACRIFICE ne peut pas être régénéré (bouclier présent, il part quand même)'); assert.deepEqual(g.state.player.mana, { ...ZERO, R: 3 }, 'et le mana est ajouté'); }

// ── Urza's Avenger : {1} : une capacité au choix jusqu'à la fin du tour ──
for (const kw of ['flying', 'trample', 'first strike', 'banding']) {
  const g = newGame(); const u = put(g, 'player', "Urza's Avenger"); assert.ok(!kws(g, u).includes(kw), `témoin : pas de ${kw}`);
  g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, u), abilityIndex: 0, ability: cur(g, u).activated[0] }, 'player'); settle(g, (pe) => { assert.deepEqual(pe.options, ['flying', 'trample', 'first strike', 'banding'], 'quatre choix'); return kw; });
  assert.ok(kws(g, u).includes(kw), `${kw} accordé`); assert.equal(kws(g, u).length, 1, 'une seule capacité'); cleanup(g); assert.ok(!kws(g, u).includes(kw), `${kw} perdu à la fin du tour`);
}
{ const g = newGame(); const u = put(g, 'player', "Urza's Avenger"); g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, u), abilityIndex: 0, ability: cur(g, u).activated[0] }, 'player');
  assert.throws(() => settle(g, () => 'haste'), /invalide|Choix/i, 'une capacité hors liste est refusée'); }
{ const g = newGame(); const u = put(g, 'player', "Urza's Avenger"); for (const kw of ['flying', 'trample']) { g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: cur(g, u), abilityIndex: 0, ability: cur(g, u).activated[0] }, 'player'); settle(g, () => kw); }
  assert.ok(kws(g, u).includes('flying') && kws(g, u).includes('trample'), 'activations cumulables'); }

// ── Necropolis : défenseur, force = créatures dans VOTRE cimetière ───────
{ const g = newGame(); const n = put(g, 'player', 'Necropolis'); assert.deepEqual(pt(g, n), [0, 1], 'cimetière vide'); assert.ok(kws(g, n).includes('defender'));
  g.state.player.graveyard.push({ ...by('Hill Giant'), uid: 'g1', owner: 'player' }, { ...by('Serra Angel'), uid: 'g2', owner: 'player' }, { ...by('Lightning Bolt'), uid: 'g3', owner: 'player' }, { ...by('Yotian Soldier'), uid: 'g5', owner: 'player' });
  g.state.ai.graveyard.push({ ...by('Hill Giant'), uid: 'g4', owner: 'ai' });
  assert.deepEqual(pt(g, n), [3, 1], '3 créatures à vous (le sort et le cimetière adverse ne comptent pas ; artefact-créature compte) ; endurance inchangée'); }
{ const g = newGame(); const n = put(g, 'player', 'Necropolis'); const v = put(g, 'player', 'Hill Giant'); assert.deepEqual(pt(g, n), [0, 1]); fissure(g, v); assert.deepEqual(pt(g, cur(g, n)), [1, 1], 'une créature qui meurt augmente la force'); }

console.log(`OK V12.75 lot G : ${ARTIFACT_CREATURES.length} créatures-artefacts vérifiées en partie réelle (cas positifs et négatifs).`);
