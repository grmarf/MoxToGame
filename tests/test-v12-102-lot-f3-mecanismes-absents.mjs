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

const LOT = ['Gloom', 'Lifeforce', 'Smoke', 'Stasis', 'Winter Orb', 'Ivory Tower', 'The Rack', 'Spirit Link', 'Juggernaut'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Gloom : surcoût des sorts d'une couleur, pour TOUS les joueurs ──
// V12.76 (G24) : Lifeforce n'a JAMAIS été un surcoût (Oracle : « {G}{G} : contrez un sort noir ») ; sa section est dans test-v12-135.
function tryCast(g, name, side, pool) {
  const card = { ...by(name), uid: `tc${++seq}`, owner: side, controller: side };
  g.state.activePlayer = side; g.turnManager.activePlayer = side; g.turnManager.gotoPhase('main1'); g.state.phase = 'main1'; g.state.priorityHolder = side;
  g.state[side].hand.push(card); g.state[side].mana = { ...ZERO, ...pool };
  try { g.dispatch('CAST_SPELL', { card, xValue: 0 }, side); settle(g); return { ok: true, left: { ...g.state[side].mana } }; } catch { return { ok: false }; }
}
for (const [ench, colorSpell, extra, otherSpell, otherPool] of [['Gloom', 'Savannah Lions', 3, 'Scathe Zombies', { B: 1, C: 2 }]]) {
  const base = by(colorSpell).cost; const letter = ench === 'Gloom' ? 'W' : 'B'; const basePool = ench === 'Gloom' ? { W: 1 } : { B: 1, C: 2 };
  { const g = newGame(); assert.ok(tryCast(g, colorSpell, 'player', basePool).ok, `témoin : ${colorSpell} (${base}) se lance au prix normal`); }
  { const g = newGame(); play(g, 'ai', ench); assert.equal(tryCast(g, colorSpell, 'player', basePool).ok, false, `${ench} : ${colorSpell} ne se lance plus au prix normal`);
    const r = tryCast(g, colorSpell, 'player', { ...basePool, C: (basePool.C || 0) + extra - 1 }); assert.equal(r.ok, false, `${ench} : un mana de moins que le surcoût de ${extra} : refusé`);
    const r2 = tryCast(g, colorSpell, 'player', { ...basePool, C: (basePool.C || 0) + extra }); assert.ok(r2.ok, `${ench} : prix normal + ${extra} : accepté`); assert.deepEqual(r2.left, ZERO, 'tout le mana est dépensé (ni plus ni moins)'); }
  { const g = newGame(); play(g, 'ai', ench); assert.ok(tryCast(g, otherSpell, 'player', otherPool).ok, `${ench} : un sort d'une autre couleur n'est pas touché`); assert.ok(tryCast(g, 'Sol Ring', 'player', { C: 1 }).ok, `${ench} : un artefact incolore non plus`); }
  { const g = newGame(); play(g, 'player', ench); const colored = letter === 'W' ? 'Savannah Lions' : 'Scathe Zombies'; assert.equal(tryCast(g, colored, 'ai', basePool).ok, false, `${ench} : touche aussi les sorts de l'ADVERSAIRE du contrôleur... et du contrôleur lui-même`); }
  { const g = newGame(); play(g, 'ai', ench); play(g, 'ai', ench); assert.equal(tryCast(g, colorSpell, 'player', { ...basePool, C: (basePool.C || 0) + extra }).ok, false, 'deux exemplaires se cumulent'); assert.ok(tryCast(g, colorSpell, 'player', { ...basePool, C: (basePool.C || 0) + 2 * extra }).ok, 'surcoût doublé payé'); }
  { const g = newGame(); const e = play(g, 'ai', ench); cast(g, 'Desert Twister', 'player', pT(e)); assert.ok(!has(g, e)); assert.ok(tryCast(g, colorSpell, 'player', basePool).ok, `${ench} détruit : prix normal`); }
}
{ const g = newGame(); play(g, 'ai', 'Gloom'); const dak = tryCast(g, 'Dakkon Blackblade', 'player', { W: 1, U: 1, B: 1, C: 5 }); void dak; // Dakkon : multicolore, contient du blanc
  const g2 = newGame(); play(g2, 'ai', 'Gloom'); const base = by('Dakkon Blackblade').cmc; assert.equal(tryCast(g2, 'Dakkon Blackblade', 'player', { W: 1, U: 1, B: 1, C: base - 3 }).ok, false, 'un sort multicolore dont une couleur est blanche paie le surcoût'); }

// canPay (utilisé par l'IA et l'interface pour juger qu'un sort est payable) applique le MÊME surcoût que le paiement.
{ const g = newGame(); const card = { ...by('Savannah Lions'), uid: `cp${++seq}`, owner: 'player', controller: 'player' };
  const pool = () => { g.state.player.mana = { ...ZERO, W: 1 }; return g.engine.costService.canPay('player', card.cost, { controller: 'player', xValue: 0, card }); };
  assert.equal(pool(), true, 'témoin : {W} suffit pour Savannah Lions'); play(g, 'ai', 'Gloom'); g.state.player.mana = { ...ZERO, W: 1 };
  assert.equal(g.engine.costService.canPay('player', card.cost, { controller: 'player', xValue: 0, card }), false, 'canPay refuse avec Gloom en jeu');
  g.state.player.mana = { ...ZERO, W: 1, C: 3 }; assert.equal(g.engine.costService.canPay('player', card.cost, { controller: 'player', xValue: 0, card }), true, 'canPay accepte avec le surcoût payé'); }

// ── Smoke / Stasis / Winter Orb : étape de dégagement ───────────────────
function untapBoard(withCard, owner = 'ai') {
  const g = newGame(); if (withCard) play(g, owner, withCard);
  const mk = (s) => ({ creature: put(g, s, 'Hill Giant', { tapped: true }), lands: [1, 2, 3].map(() => put(g, s, 'Forest', { tapped: true })), art: put(g, s, 'Sol Ring', { tapped: true }) });
  const mine = mk('player'), theirs = mk('ai'); return { g, mine, theirs };
}
const untapped = (g, b) => ({ c: !cur(g, b.creature).tapped, l: b.lands.filter((x) => !cur(g, x).tapped).length, a: !cur(g, b.art).tapped });
for (const side of ['player', 'ai']) { const { g, mine, theirs } = untapBoard(null); drive(g, side, 'upkeep'); const u = untapped(g, side === 'player' ? mine : theirs); assert.deepEqual(u, { c: true, l: 3, a: true }, `témoin ${side} : tout se dégage`); }
for (const side of ['player', 'ai']) { const { g, mine, theirs } = untapBoard('Smoke'); drive(g, side, 'upkeep'); const b = side === 'player' ? mine : theirs; const o = side === 'player' ? theirs : mine;
  assert.deepEqual(untapped(g, b), { c: false, l: 3, a: true }, `Smoke : les créatures de ${side} ne se dégagent pas, terrains et artefacts si`); assert.deepEqual(untapped(g, o), { c: false, l: 0, a: false }, 'le joueur non actif ne dégage rien'); }
{ const { g, mine } = untapBoard('Smoke'); const smoke = [...field(g, 'ai')].find((p) => p.name === 'Smoke'); cast(g, 'Desert Twister', 'player', pT(smoke)); drive(g, 'player', 'upkeep'); assert.equal(untapped(g, mine).c, true, 'Smoke détruit : la créature se dégage'); }
for (const side of ['player', 'ai']) { const { g, mine, theirs } = untapBoard('Stasis'); drive(g, side, 'upkeep'); const b = side === 'player' ? mine : theirs; assert.deepEqual(untapped(g, b), { c: false, l: 0, a: false }, `Stasis : ${side} ne dégage RIEN (phase sautée)`); }
for (const side of ['player', 'ai']) { const { g, mine, theirs } = untapBoard('Winter Orb'); drive(g, side, 'upkeep'); const b = side === 'player' ? mine : theirs; assert.deepEqual(untapped(g, b), { c: true, l: 1, a: true }, `Winter Orb : ${side} ne dégage qu'UN terrain ; créature et artefact se dégagent normalement`); }
{ const { g, mine } = untapBoard('Winter Orb', 'player'); drive(g, 'player', 'upkeep'); assert.equal(untapped(g, mine).l, 1, 'même contrôlé par le joueur actif'); }
{ const { g, mine } = untapBoard('Winter Orb'); const orb = [...field(g, 'ai')].find((p) => p.name === 'Winter Orb'); cast(g, 'Shatter', 'player', pT(orb)); drive(g, 'player', 'upkeep'); assert.equal(untapped(g, mine).l, 3, 'Orbe détruit : tous les terrains se dégagent'); }

// ── Ivory Tower : à VOTRE entretien, X PV = cartes en main - 4 ───────────
for (const [hand, gain] of [[7, 3], [5, 1], [4, 0], [1, 0], [0, 0]]) {
  const g = newGame(); play(g, 'player', 'Ivory Tower'); handOf(g, 'player', Array(hand).fill('Forest')); g.state.player.life = 10; g.state.ai.life = 10; drive(g, 'player', 'upkeep');
  assert.equal(g.state.player.life, 10 + gain, `main de ${hand} : +${gain} PV (jamais négatif)`); assert.equal(g.state.ai.life, 10);
}
{ const g = newGame(); play(g, 'player', 'Ivory Tower'); handOf(g, 'player', Array(7).fill('Forest')); handOf(g, 'ai', Array(7).fill('Forest')); g.state.player.life = 10; g.state.ai.life = 10; drive(g, 'ai', 'upkeep'); assert.equal(g.state.player.life, 10, 'pas à l\'entretien de l\'adversaire'); assert.equal(g.state.ai.life, 10); }
{ const g = newGame(); play(g, 'ai', 'Ivory Tower'); handOf(g, 'ai', Array(6).fill('Forest')); g.state.ai.life = 10; drive(g, 'ai', 'upkeep'); assert.equal(g.state.ai.life, 12, 'la Tour adverse profite à son contrôleur'); }

// ── The Rack : à l'entretien de l'ADVERSAIRE, 3 - cartes en main blessures ──
for (const [hand, dmg] of [[0, 3], [1, 2], [2, 1], [3, 0], [6, 0]]) {
  const g = newGame(); play(g, 'player', 'The Rack'); handOf(g, 'ai', Array(hand).fill('Forest')); g.state.ai.life = 10; g.state.player.life = 10; drive(g, 'ai', 'upkeep');
  assert.equal(g.state.ai.life, 10 - dmg, `main adverse de ${hand} : ${dmg} blessure(s) (jamais négatif)`); assert.equal(g.state.player.life, 10);
}
{ const g = newGame(); play(g, 'player', 'The Rack'); g.state.ai.life = 10; g.state.player.life = 10; drive(g, 'player', 'upkeep'); assert.equal(g.state.player.life, 10, 'rien à VOTRE propre entretien'); assert.equal(g.state.ai.life, 10); }
{ const g = newGame(); play(g, 'ai', 'The Rack'); g.state.player.life = 10; drive(g, 'player', 'upkeep'); assert.equal(g.state.player.life, 7, 'Chevalet adverse : vous subissez 3 - main (main vide : 3)'); }
{ const g = newGame(); const rack = play(g, 'player', 'The Rack'); cast(g, 'Shatter', 'ai', pT(rack)); g.state.ai.life = 10; drive(g, 'ai', 'upkeep'); assert.equal(g.state.ai.life, 10, 'Chevalet détruit : plus de blessures'); }

// ── Spirit Link : la créature enchantée inflige des blessures -> le contrôleur de l'AURA gagne autant ──
function linked(onSide, attackerSide) {
  const g = newGame(); const giant = put(g, onSide, 'Hill Giant'); play(g, 'player', 'Spirit Link', pT(giant)); g.state.player.life = 10; g.state.ai.life = 10; return { g, giant: cur(g, giant) };
}
{ const { g, giant } = linked('player'); attack(g, [giant], 'player', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 13, 'attaquant non bloqué : +3'); assert.equal(g.state.ai.life, 7); }
{ const { g, giant } = linked('player'); const b = put(g, 'ai', 'Grizzly Bears'); attack(g, [giant], 'player', { [giant.uid]: [b.uid] }); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 13, 'blessures infligées à un BLOQUEUR : +3 aussi'); }
{ const { g, giant } = linked('ai'); attack(g, [giant], 'ai', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 10, 'Aura sur une créature ADVERSE : blessures subies -3, gain +3 pour le propriétaire de l\'Aura'); }
{ const { g, giant } = linked('player'); cast(g, 'Holy Day', 'player'); attack(g, [giant], 'player', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 10, 'blessures prévenues : aucun gain'); }
{ const { g, giant } = linked('player'); const other = put(g, 'player', 'Grizzly Bears'); attack(g, [other], 'player', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 10, 'les blessures d\'une AUTRE créature ne comptent pas'); }
{ const { g, giant } = linked('player'); const aura = [...field(g, 'player')].find((p) => p.name === 'Spirit Link'); cast(g, 'Disenchant', 'ai', pT(aura)); assert.ok(!has(g, aura), 'Aura détruite'); attack(g, [giant], 'player', {}); g.combat.resolveDamage(); settle(g); assert.equal(g.state.player.life, 10, 'Aura partie : plus de gain'); }
{ const g = newGame(); const s = put(g, 'player', 'Prodigal Sorcerer'); play(g, 'player', 'Spirit Link', pT(s)); g.state.player.life = 10; g.state.player.mana = { ...ZERO };
  const ability = cur(g, s); g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: ability, abilityIndex: 0, ability: ability.activated[0], target: { kind: 'player', side: 'ai', id: 'ai' } }, 'player'); settle(g);
  assert.equal(g.state.player.life, 11, 'les blessures d\'une CAPACITÉ de la créature comptent aussi (Prodigal Sorcerer : 1)'); }

// ── Juggernaut : ne peut pas être bloqué par des murs ; doit attaquer ─────
{ const g = newGame(); const j = put(g, 'player', 'Juggernaut'); const walls = ['Wall of Light', 'Wall of Earth', 'Wall of Heat'].map((n) => put(g, 'ai', n)); const bears = put(g, 'ai', 'Grizzly Bears'); attack(g, [j]);
  assert.deepEqual(g.combat.getValidBlockers('ai', j).map((p) => p.uid), [bears.uid], 'aucun mur ne peut bloquer ; une créature ordinaire si'); void walls; }
{ const g = newGame(); const j = put(g, 'player', 'Juggernaut'); const w = put(g, 'ai', 'Wall of Light'); attack(g, [j]); assert.deepEqual(g.combat.getValidBlockers('ai', j), [], 'seul un mur en défense : imblocable');
  assert.ok(throws(() => g.combat.assignBlockers({ [j.uid]: [w.uid] })), 'déclarer un mur comme bloqueur : refusé'); }
{ const g = newGame(); const j = put(g, 'player', 'Juggernaut'); g.state.activePlayer = 'player'; g.combat.begin(); assert.throws(() => g.combat.confirmAttackers([], 'player'), /doit attaquer/, 'doit attaquer à chaque tour'); g.combat.confirmAttackers([j], 'player'); }
{ const g = newGame(); const mw = put(g, 'player', 'Wall of Light'); const bears = put(g, 'ai', 'Grizzly Bears'); attack(g, [bears], 'ai'); assert.deepEqual(g.combat.getValidBlockers('player', bears).map((p) => p.uid), [mw.uid], 'les murs bloquent normalement les autres créatures'); }
{ const g = newGame(); const j = put(g, 'ai', 'Juggernaut'); const w = put(g, 'player', 'Wall of Earth'); const bears = put(g, 'player', 'Grizzly Bears'); attack(g, [j], 'ai'); assert.deepEqual(g.combat.getValidBlockers('player', j).map((p) => p.uid), [bears.uid], 'valable aussi pour le Juggernaut adverse'); void w; }

console.log(`OK V12.75 lot F3 : ${LOT.length} cartes aux mécanismes absents du moteur, désormais certifiées en partie réelle (cas positifs et négatifs).`);
