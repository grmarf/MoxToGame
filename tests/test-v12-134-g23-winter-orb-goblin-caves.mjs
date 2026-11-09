// V12.76 (G23) — Winter Orb (« tant que cet artefact est dégagé ») et Goblin Caves (Enchanter : terrain ; +0/+2 aux Gobelins si le terrain est une Montagne DE BASE).
// Oracle : Scryfall DRK n°64 (Goblin Caves) ; Winter Orb : texte de la relecture. Parties réelles, tours pilotés par nextPhase().
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

for (const n of ['Winter Orb', 'Goblin Caves']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const ENG = /illégale|cible|invalide|Cible/i;

// ── Winter Orb : « tant que cet artefact est dégagé » ──────────────────────────────────────────────────────
function board(orbSide, orbTapped) {
  const g = newGame(); const orb = play(g, orbSide, 'Winter Orb'); if (orbTapped) cur(g, orb).tapped = true;
  const mk = (s) => ({ lands: [1, 2, 3].map(() => put(g, s, 'Forest', { tapped: true })), creature: put(g, s, 'Hill Giant', { tapped: true }) });
  return { g, orb, mine: mk('player'), theirs: mk('ai') };
}
const nLands = (g, b) => b.lands.filter((x) => !cur(g, x).tapped).length;
for (const orbSide of ['player', 'ai']) for (const active of ['player', 'ai']) {
  { const { g, mine, theirs } = board(orbSide, false); drive(g, active, 'upkeep'); const b = active === 'player' ? mine : theirs;
    assert.equal(nLands(g, b), 1, `Orbe dégagé (à ${orbSide}), étape de ${active} : UN seul terrain se dégage`); assert.equal(!cur(g, b.creature).tapped, true, 'les créatures se dégagent normalement'); }
  { const { g, mine, theirs, orb } = board(orbSide, true); drive(g, active, 'upkeep'); const b = active === 'player' ? mine : theirs;
    assert.equal(nLands(g, b), 3, `Orbe ENGAGÉ (à ${orbSide}), étape de ${active} : les 3 terrains se dégagent`);
    assert.equal(cur(g, orb).tapped, active !== orbSide, 'l\'Orbe ne se dégage que pendant l\'étape de SON contrôleur'); }
}
// Un Orbe dégagé en cours de tour (par son contrôleur) pèse de nouveau à l'étape suivante.
{ const { g, mine, orb } = board('ai', true); drive(g, 'player', 'upkeep'); assert.equal(nLands(g, mine), 3, 'témoin : Orbe engagé, tout se dégage'); cur(g, orb).tapped = false; mine.lands.forEach((l) => { cur(g, l).tapped = true; }); drive(g, 'player', 'upkeep'); assert.equal(nLands(g, mine), 1, 'Orbe redevenu dégagé : un seul terrain'); }

// ── Goblin Caves ──────────────────────────────────────────────────────────────────────────────────────────
const gobMine = () => 'Goblin Digging Team', gobTheirs = () => 'Marsh Goblins';
function caveGame(hostName, hostSide = 'player', extra = () => {}) {
  const g = newGame(); extra(g); const host = put(g, hostSide, hostName);
  const mg = put(g, 'player', gobMine()); const tg = put(g, 'ai', gobTheirs()); const gi = put(g, 'player', 'Hill Giant');
  const base = { mg: pt(g, cur(g, mg)), tg: pt(g, cur(g, tg)), gi: pt(g, cur(g, gi)) };
  const caves = play(g, 'player', 'Goblin Caves', pT(host));
  return { g, host, caves, mg, tg, gi, base };
}
const bonus = (g, o) => ({ mg: pt(g, cur(g, o.mg)).map((v, i) => v - o.base.mg[i]), tg: pt(g, cur(g, o.tg)).map((v, i) => v - o.base.tg[i]), gi: pt(g, cur(g, o.gi)).map((v, i) => v - o.base.gi[i]) });
// Montagne de base à soi : TOUS les Gobelins (les siens ET ceux de l'adversaire) +0/+2, rien pour les autres
{ const o = caveGame('Mountain', 'player'); assert.equal(cur(o.g, o.caves).attachedTo, o.host.uid, 'Goblin Caves attachée à la Montagne');
  assert.deepEqual(bonus(o.g, o), { mg: [0, 2], tg: [0, 2], gi: [0, 0] }, 'Montagne de base : Gobelins des DEUX camps +0/+2, Géant inchangé'); }
// Montagne de l'ADVERSAIRE : fonctionne aussi (ruling 2004)
{ const o = caveGame('Mountain', 'ai'); assert.deepEqual(bonus(o.g, o), { mg: [0, 2], tg: [0, 2], gi: [0, 0] }, 'Montagne adverse : même effet'); }
// « Enchanter : terrain » — une Forêt est une cible LÉGALE, mais sans bonus
{ const o = caveGame('Forest', 'player'); assert.equal(cur(o.g, o.caves)?.attachedTo, o.host.uid, 'Forêt : cible légale (Oracle : Enchanter : terrain)');
  assert.deepEqual(bonus(o.g, o), { mg: [0, 0], tg: [0, 0], gi: [0, 0] }, 'Forêt : aucun bonus'); }
// Un terrain NON DE BASE devenu Montagne (Blood Moon) n'est pas une « Montagne de base » : aucun bonus
{ const o = caveGame('Strip Mine', 'player', (g) => { play(g, 'ai', 'Blood Moon'); }); assert.equal(cur(o.g, o.caves)?.attachedTo, o.host.uid, 'Strip Mine enchantée');
  assert.deepEqual(bonus(o.g, o), { mg: [0, 0], tg: [0, 0], gi: [0, 0] }, 'terrain non de base (Blood Moon) : pas une Montagne de base'); }
// Terrain non de base AYANT le sous-type Montagne (Badlands, Plateau, Taiga, Volcanic Island) : pas une Montagne de base -> aucun bonus
for (const land of ['Badlands', 'Plateau', 'Taiga', 'Volcanic Island']) { const o = caveGame(land, 'player'); assert.equal(cur(o.g, o.caves)?.attachedTo, o.host.uid, `${land} enchanté`);
  assert.deepEqual(bonus(o.g, o), { mg: [0, 0], tg: [0, 0], gi: [0, 0] }, `${land} a le sous-type Montagne mais n'est pas de base : aucun bonus`); }
// La cible doit être un terrain
{ const g = newGame(); const hg = put(g, 'player', 'Hill Giant'); const before = field(g, 'player').length; let err = null; try { cast(g, 'Goblin Caves', 'player', pT(hg)); } catch (e) { err = e; }
  assert.ok(err || !field(g, 'player').some((p) => p.name === 'Goblin Caves' && p.attachedTo === hg.uid), 'une créature n\'est pas une cible légale'); void before; }
// Le bonus disparaît avec l'Aura ET avec la Montagne
{ const o = caveGame('Mountain', 'player'); cast(o.g, 'Stone Rain', 'player', pT(o.host)); assert.ok(!has(o.g, o.host), 'Montagne détruite');
  assert.deepEqual(bonus(o.g, o), { mg: [0, 0], tg: [0, 0], gi: [0, 0] }, 'Montagne détruite : plus de bonus'); }
{ const o = caveGame('Mountain', 'player'); cast(o.g, 'Disenchant', 'player', pT(cur(o.g, o.caves))); assert.ok(!has(o.g, o.caves), 'Aura détruite');
  assert.deepEqual(bonus(o.g, o), { mg: [0, 0], tg: [0, 0], gi: [0, 0] }, 'Aura détruite : plus de bonus'); }
// Deux Goblin Caves se cumulent
{ const o = caveGame('Mountain', 'player'); const mtn2 = put(o.g, 'player', 'Mountain'); play(o.g, 'player', 'Goblin Caves', pT(mtn2));
  assert.deepEqual(bonus(o.g, o).mg, [0, 4], 'deux Caves : +0/+4'); }

console.log('OK test-v12-134-g23-winter-orb-goblin-caves');
