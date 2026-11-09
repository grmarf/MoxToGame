// V12.75 — Chantier 2, lot F2a : 8 cartes sans statut dont le comportement a été vérifié en partie réelle, puis certifiées.
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

const LOT = ['Hypnotic Specter', 'Phantasmal Forces', 'Warp Artifact', "Tawnos's Wand", 'Purelace', 'Blaze of Glory', 'Spell Blast', 'Fork'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Hypnotic Specter ─────────────────────────────────────────────────────
{
  const g = newGame(); const s = play(g, 'player', 'Hypnotic Specter'); handOf(g, 'ai', ['Forest', 'Island', 'Swamp']);
  attack(g, [s], 'player', {}); g.combat.resolveDamage(); settle(g);
  assert.equal(g.state.ai.life, 18, 'les 2 blessures passent'); assert.equal(g.state.ai.hand.length, 2, 'une carte défaussée'); assert.equal(g.state.ai.graveyard.length, 1, 'au cimetière adverse');
}
{ const g = newGame(); const s = play(g, 'player', 'Hypnotic Specter'); const b = put(g, 'ai', 'Azure Drake'); handOf(g, 'ai', ['Forest', 'Island']);
  attack(g, [s], 'player', { [s.uid]: [b.uid] }); g.combat.resolveDamage(); settle(g); assert.equal(g.state.ai.hand.length, 2, 'bloqué par une créature : aucune blessure au joueur, aucune défausse'); }
{ const seen = new Set(); for (let k = 0; k < 20; k++) { const g = newGame(); const s = play(g, 'player', 'Hypnotic Specter'); handOf(g, 'ai', ['Forest', 'Island', 'Swamp', 'Mountain']); attack(g, [s], 'player', {}); g.combat.resolveDamage(); settle(g); seen.add(g.state.ai.hand.map((c) => c.name).sort().join()); }
  assert.ok(seen.size >= 3, `défausse aléatoire (${seen.size} issues sur 20)`); }
{ const g = newGame(); const s = play(g, 'player', 'Hypnotic Specter'); attack(g, [s], 'player', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.ai.life, 18, 'main vide : aucune erreur'); }
{ const g = newGame(); const s = play(g, 'ai', 'Hypnotic Specter'); handOf(g, 'player', ['Forest', 'Island', 'Swamp']);
  attack(g, [s], 'ai', {}); g.combat.resolveDamage(); const pend = g.choices.getPending(); settle(g);
  assert.ok(!pend, 'le joueur victime ne CHOISIT pas la carte (« au hasard »)'); assert.equal(g.state.player.hand.length, 2, 'une carte défaussée'); }

{ // « Chaque fois que LE SPECTRE inflige des blessures » : une AUTRE créature qui frappe ne déclenche rien.
  const g = newGame(); play(g, 'player', 'Hypnotic Specter'); const giant = put(g, 'player', 'Hill Giant'); handOf(g, 'ai', ['Forest', 'Island']);
  attack(g, [giant], 'player', {}); g.combat.resolveDamage(); settle(g);
  assert.equal(g.state.ai.life, 17, 'le Géant touche'); assert.equal(g.state.ai.hand.length, 2, 'un Spectre inactif ne réagit pas aux blessures d\'une autre créature'); }
{ // Spectre ADVERSE inactif : les blessures de ma propre créature ne me font rien défausser.
  const g = newGame(); play(g, 'ai', 'Hypnotic Specter'); const giant = put(g, 'player', 'Hill Giant'); handOf(g, 'ai', ['Forest', 'Island']);
  attack(g, [giant], 'player', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.ai.hand.length, 2, 'même un Spectre adverse ne se déclenche pas sur les blessures d\'une autre source'); }

// ── Phantasmal Forces ────────────────────────────────────────────────────
const upkeepChoice = (what) => (pe) => (pe.options.includes(what) ? what : pe.options.find((o) => o !== (what === 'pay' ? 'sacrifice' : 'pay')) ?? pe.options[0]);
{ const g = newGame(); const p = play(g, 'player', 'Phantasmal Forces'); assert.deepEqual(pt(g, p), [4, 1], '4/1'); assert.ok(calculateCharacteristics(g.state, p).keywords.includes('flying'), 'vol');
  drive(g, 'player', 'upkeep'); assert.ok(!has(g, p), 'aucun {U} disponible : sacrifiée'); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Phantasmal Forces'), 'au cimetière'); }
{ const g = newGame(); const p = play(g, 'player', 'Phantasmal Forces'); zero(g); driveTo(g, 'player', 'upkeep'); g.state.player.mana = { ...ZERO, U: 2 }; settle(g, upkeepChoice('pay'));
  assert.ok(has(g, p), 'payé : reste en jeu'); assert.equal(g.state.player.mana.U, 1, 'un seul {U} dépensé'); }
{ const g = newGame(); const p = play(g, 'player', 'Phantasmal Forces'); zero(g); driveTo(g, 'player', 'upkeep'); g.state.player.mana = { ...ZERO, U: 2 }; settle(g, upkeepChoice('sacrifice'));
  assert.ok(!has(g, p), 'refus de payer : sacrifiée'); assert.equal(g.state.player.mana.U, 2, 'aucun mana dépensé'); }
{ const g = newGame(); const p = play(g, 'player', 'Phantasmal Forces'); zero(g); driveTo(g, 'player', 'upkeep'); g.state.player.mana = { ...ZERO, R: 3 }; settle(g, upkeepChoice('pay'));
  assert.ok(!has(g, p), 'du mana rouge ne paie pas {U}'); }
{ const g = newGame(); const p = play(g, 'player', 'Phantasmal Forces'); drive(g, 'ai', 'upkeep'); assert.ok(has(g, p), 'aucun déclencheur à l\'entretien ADVERSE'); }

// ── Warp Artifact ────────────────────────────────────────────────────────
{ const g = newGame(); const a = play(g, 'ai', 'Sol Ring'); play(g, 'player', 'Warp Artifact', pT(a)); g.state.ai.life = 20; g.state.player.life = 20;
  drive(g, 'ai', 'upkeep'); assert.equal(g.state.ai.life, 19, 'le contrôleur de l\'artefact perd 1 PV'); assert.equal(g.state.player.life, 20, 'pas le propriétaire de l\'Aura'); }
{ const g = newGame(); const a = play(g, 'ai', 'Sol Ring'); play(g, 'player', 'Warp Artifact', pT(a)); g.state.ai.life = 20; g.state.player.life = 20;
  drive(g, 'player', 'upkeep'); assert.equal(g.state.ai.life, 20, 'pas à l\'entretien de l\'autre joueur'); assert.equal(g.state.player.life, 20); }
{ const g = newGame(); const a = play(g, 'player', 'Sol Ring'); play(g, 'player', 'Warp Artifact', pT(a)); g.state.player.life = 20; g.state.ai.life = 20;
  drive(g, 'player', 'upkeep'); assert.equal(g.state.player.life, 19, 'artefact PROPRE : le lanceur perd 1 PV à son entretien'); assert.equal(g.state.ai.life, 20); }
{ const g = newGame(); const a = play(g, 'ai', 'Sol Ring'); play(g, 'player', 'Warp Artifact', pT(a)); g.state.ai.life = 20;
  drive(g, 'ai', 'upkeep'); drive(g, 'player', 'upkeep'); drive(g, 'ai', 'upkeep'); assert.equal(g.state.ai.life, 18, 'un PV par entretien : cumulatif'); }
{ const g = newGame(); const a = play(g, 'ai', 'Sol Ring'); play(g, 'player', 'Warp Artifact', pT(a)); cast(g, 'Shatter', 'player', pT(a)); g.state.ai.life = 20;
  drive(g, 'ai', 'upkeep'); assert.equal(g.state.ai.life, 20, 'artefact détruit : plus de dégâts'); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Warp Artifact'), 'l\'Aura orpheline est au cimetière'); }
{ const g = newGame(); const c = put(g, 'ai', 'Hill Giant'); assert.ok(throws(() => cast(g, 'Warp Artifact', 'player', pT(c))), 'une créature n\'est pas un artefact : cible illégale'); }

// ── Tawnos's Wand ────────────────────────────────────────────────────────
const blockers = (g, a, side = 'ai') => g.combat.getValidBlockers(side, a).map((p) => p.uid);
// V12.76 (G21) : Tawnos's Wand est désormais une capacité activée ({2},{T} : « target creature with power 2 or less can't be blocked this turn ») — scénarios dans test-v12-132.

// ── Purelace ─────────────────────────────────────────────────────────────
{ const g = newGame(); const d = put(g, 'ai', 'Dakkon Blackblade'); assert.ok(colors(g, d).length >= 2, 'témoin : multicolore'); cast(g, 'Purelace', 'player', pT(d)); assert.equal(colors(g, d), 'W', 'devient blanche SEULE'); }
{ const g = newGame(); const a = put(g, 'ai', 'Sol Ring'); cast(g, 'Purelace', 'player', pT(a)); assert.equal(colors(g, a), 'W', 'un artefact incolore devient blanc'); }
{ const g = newGame(); const h = put(g, 'ai', 'Hill Giant'); const o = put(g, 'ai', 'Grizzly Bears'); cast(g, 'Purelace', 'player', pT(h)); assert.equal(colors(g, h), 'W'); assert.equal(colors(g, o), 'G', 'les autres permanents ne changent pas'); cleanup(g); assert.equal(colors(g, h), 'W', 'le changement dure après la fin du tour'); }
{ const g = newGame(); const h = put(g, 'ai', 'Hill Giant'); cast(g, 'Purelace', 'player', pT(h)); cast(g, "Martyr's Cry", 'player'); assert.ok(!has(g, h), 'devenue blanche, elle est exilée par Martyr\'s Cry'); }

// ── Blaze of Glory ───────────────────────────────────────────────────────
function blazeBoard(tappedElves = false) {
  const g = newGame(); const a = put(g, 'player', 'Hill Giant'); const b1 = put(g, 'ai', 'Grizzly Bears'); const b2 = put(g, 'ai', 'Llanowar Elves', { tapped: tappedElves });
  g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([a], 'player'); return { g, a, b1, b2 };
}
{ const { g, a, b1, b2 } = blazeBoard(); cast(g, 'Blaze of Glory', 'player', pT(a)); assert.deepEqual(pt(g, cur(g, a)), [4, 4], '+1/+1');
  assert.throws(() => g.combat.assignBlockers({ [a.uid]: [b1.uid] }), /toutes les créatures/, 'un seul bloqueur alors que deux peuvent : refusé');
  g.combat.assignBlockers({ [a.uid]: [b1.uid, b2.uid] }); }
{ const { g, a, b1 } = blazeBoard(true); cast(g, 'Blaze of Glory', 'player', pT(a)); g.combat.assignBlockers({ [a.uid]: [b1.uid] }); assert.ok(true, 'un bloqueur engagé n\'est pas requis'); }
{ const { g, a, b1, b2 } = blazeBoard(); cast(g, 'Blaze of Glory', 'player', pT(a)); g.combat.assignBlockers({ [a.uid]: [b1.uid, b2.uid] }); g.combat.resolveDamage(); settle(g);
  assert.ok(!has(g, b1) && !has(g, b2), '4 blessures réparties : les deux bloqueurs meurent'); }
{ const { g, a, b1, b2 } = blazeBoard(); g.combat.assignBlockers({ [a.uid]: [b1.uid] }); assert.ok(true, 'témoin : sans Blaze, un seul bloqueur est accepté'); }
{ const g = newGame(); const a = put(g, 'player', 'Hill Giant'); const idle = put(g, 'player', 'Grizzly Bears'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([a], 'player');
  assert.ok(throws(() => cast(g, 'Blaze of Glory', 'player', pT(idle))), 'cible non attaquante : illégale'); }
{ const { g, a } = blazeBoard(); cast(g, 'Blaze of Glory', 'player', pT(a)); cleanup(g); assert.deepEqual(pt(g, cur(g, a)), [3, 3], '+1/+1 cesse en fin de tour'); }

// ── Spell Blast ──────────────────────────────────────────────────────────
function blastDuel(x, victim, vt) {
  const g = newGame(); put(g, 'player', 'Hill Giant'); const foe = put(g, 'ai', 'Hill Giant'); put(g, 'ai', 'Mountain');
  const v = { ...by(victim), uid: `v${++seq}`, owner: 'player', controller: 'player' }; g.state.player.hand.push(v); g.state.player.mana = { ...FULL }; g.state.activePlayer = 'player'; g.state.priorityHolder = 'player';
  g.dispatch('CAST_SPELL', { card: v, target: vt && vt(foe), xValue: 0 }, 'player');
  const it = g.stack.items.find((i) => i.source?.uid === v.uid); assert.ok(it, 'la victime est sur la pile');
  cast(g, 'Spell Blast', 'ai', { kind: 'stackItem', id: it.id }, x); return { g, foe };
}
{ const { g, foe } = blastDuel(1, 'Lightning Bolt', pT); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Lightning Bolt'), 'X = 1 = coût converti : contrecarré'); assert.ok(has(g, foe) && !(cur(g, foe).damageMarked > 0), 'la cible de l\'éclair est intacte'); }
for (const x of [0, 2, 3]) { const { g, foe } = blastDuel(x, 'Lightning Bolt', pT); assert.ok(!has(g, foe), `X = ${x} ≠ coût converti 1 : le sort N'est PAS contrecarré (Hill Giant 3/3 meurt)`); }
{ const { g } = blastDuel(4, 'Hill Giant'); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Hill Giant') && !field(g, 'player').some((p) => p.name === 'Hill Giant' && p.uid.startsWith('Hill Giant@')), 'X = 4 contre un sort de créature de coût 4 : contrecarré'); }
{ const g = newGame(); const h = put(g, 'player', 'Hill Giant'); assert.ok(throws(() => cast(g, 'Spell Blast', 'ai', pT(h), 0)), 'un permanent n\'est pas un sort'); }

// ── Fork ─────────────────────────────────────────────────────────────────
function forkDuel(victim, vt) {
  const g = newGame(); const t = put(g, 'ai', 'Hill Giant'); const t2 = put(g, 'ai', 'Serra Angel');
  const v = { ...by(victim), uid: `f${++seq}`, owner: 'player', controller: 'player' }; g.state.player.hand.push(v); g.state.player.mana = { ...FULL }; g.state.activePlayer = 'player'; g.state.priorityHolder = 'player';
  g.dispatch('CAST_SPELL', { card: v, target: vt(t), xValue: 0 }, 'player');
  const it = g.stack.items.find((i) => i.source?.uid === v.uid); assert.ok(it, 'la victime est sur la pile');
  cast(g, 'Fork', 'player', { kind: 'stackItem', id: it.id }); return { g, t, t2 };
}
{ const { g, t } = forkDuel('Lightning Bolt', pT); assert.ok(!has(g, t), 'Hill Giant 3/3 meurt (3 + 3 blessures, ou une copie sur une autre cible)');
  assert.equal(g.state.player.graveyard.filter((c) => c.name === 'Lightning Bolt').length, 1, 'un seul Lightning Bolt au cimetière : la COPIE n\'est pas une carte'); }
{ const { g, t } = forkDuel('Fissure', pT); assert.ok(!has(g, t), 'copie d\'un RITUEL (Fissure) : la cible meurt'); }
{ const g = newGame(); const v = { ...by('Hill Giant'), uid: 'fh', owner: 'player', controller: 'player' }; g.state.player.hand.push(v); g.state.player.mana = { ...FULL }; g.state.activePlayer = 'player'; g.dispatch('CAST_SPELL', { card: v, xValue: 0 }, 'player');
  const it = g.stack.items.find((i) => i.source?.uid === 'fh'); assert.ok(throws(() => cast(g, 'Fork', 'player', { kind: 'stackItem', id: it.id })), 'un sort de créature n\'est pas une cible légale'); }
{ const g = newGame(); const h = put(g, 'ai', 'Hill Giant'); assert.ok(throws(() => cast(g, 'Fork', 'player', pT(h))), 'un permanent n\'est pas un sort'); }

console.log(`OK V12.75 lot F2a : ${LOT.length} cartes sans statut certifiées après vérification en partie réelle (cas positifs et négatifs).`);
