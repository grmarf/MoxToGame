import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import { rngClock } from '../src/core/rng-clock-service.js';
import CARDS from '../src/data/cards-database.js';

// v12.73 — chantier 1 : Karma, Black Vise, Psionic Blast, Power Sink, défausses déterministes.

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const swamp = (o, i) => ({ uid: `sw_${o}_${i}`, name: 'Swamp', subtype: 'Swamp', type: 'Land', owner: o, controller: o, zone: 'battlefield', tapped: false });
const island = (o, i) => ({ uid: `is_${o}_${i}`, name: 'Island', subtype: 'Island', type: 'Land', owner: o, controller: o, zone: 'battlefield', tapped: false });
const lib = (p, n) => Array.from({ length: n }, (_, i) => land(p, i));
const bear = (o) => ({ uid: `bear_${o}`, name: 'Grizzly Bears', type: 'Creature', subtype: 'Bear', power: 2, toughness: 2, color: ['G'], owner: o, controller: o, zone: 'battlefield', cmc: 2, keywords: [] });
function newGame() {
  const g = new GameFacade().connect();
  g.state.player.library = lib('p', 12); g.state.ai.library = lib('a', 12);
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
const pass = (g, n = 2) => { for (let i = 0; i < n; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const drain = (g) => { for (let i = 0; i < 12 && (g.stack.items.length || g.choices.getPending()); i++) { const p = g.choices.getPending(); if (p) g.choices.resolve(p.max === 1 ? p.defaultValue : p.options.slice(0, p.min)); else pass(g, 1); } };
const mana = (g, side, m) => { g.state[side].mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ...m }; };
const total = (g, side) => Object.values(g.state[side].mana).reduce((a, b) => a + (b || 0), 0);
const shield = (g, side) => g.replacements.addPreventionShield(side, { amount: 99, persistent: true, scope: 'controllerAndCreatures' });
const enter = (g, name, side) => { const p = createPermanent({ ...card(name), owner: side, controller: side }); return g.zones.enterBattlefield(p, side, { controller: side, reason: 'test' }); };
function upkeepOf(g, side) {
  g.state.activePlayer = side; g.turnManager.activePlayer = side; g.state.priorityHolder = side;
  g.turnManager.gotoPhase('untap'); g.turnManager.nextPhase(); drain(g);
}

// ── A. Karma ────────────────────────────────────────────────────────────────
{
  const g = newGame();
  g.state.player.battlefield = [swamp('player', 1), swamp('player', 2), swamp('player', 3)];
  g.state.ai.battlefield = [swamp('ai', 1), swamp('ai', 2)];
  enter(g, 'Karma', 'player');
  upkeepOf(g, 'player');
  assert.equal(g.state.player.life, 17, 'Karma : 3 marais contrôlés -> 3 blessures à ce joueur (une seule fois).');
  assert.equal(g.state.ai.life, 20);
  upkeepOf(g, 'ai');
  assert.equal(g.state.ai.life, 18, "Karma frappe AUSSI l'entretien de l'adversaire : 2 marais -> 2 blessures.");
  console.log('OK V12.88.A1: Karma inflige des blessures = marais à chaque entretien de chaque joueur.');
}
{
  const g = newGame();
  g.state.player.battlefield = [swamp('player', 1), swamp('player', 2)];
  enter(g, 'Karma', 'player'); shield(g, 'player');
  upkeepOf(g, 'player');
  assert.equal(g.state.player.life, 20, 'Karma : ce sont des blessures (le bouclier de prévention les annule).');
  console.log('OK V12.88.A2: Karma passe par le chemin canonique des dégâts.');
}
{
  const g = newGame();
  enter(g, 'Karma', 'player');
  upkeepOf(g, 'player');
  assert.equal(g.state.player.life, 20, 'Karma sans marais : aucune blessure.');
  console.log('OK V12.88.A3: Karma sans marais ne fait rien.');
}

// ── B. Black Vise ───────────────────────────────────────────────────────────
{
  const g = newGame();
  enter(g, 'Black Vise', 'player');
  g.state.ai.hand = Array.from({ length: 7 }, (_, i) => land('ax', i));
  g.state.player.hand = Array.from({ length: 9 }, (_, i) => land('px', i));
  upkeepOf(g, 'ai');
  assert.equal(g.state.ai.life, 17, "Black Vise : main adverse 7 - 4 = 3 blessures à l'entretien de l'adversaire.");
  upkeepOf(g, 'player');
  assert.equal(g.state.player.life, 20, "Black Vise ne frappe pas l'entretien de son propre contrôleur.");
  console.log("OK V12.88.B1: Black Vise frappe l'adversaire (cartes en main - 4), pas son contrôleur.");
}
{
  const g = newGame();
  enter(g, 'Black Vise', 'player');
  g.state.ai.hand = Array.from({ length: 4 }, (_, i) => land('ax', i));
  upkeepOf(g, 'ai');
  assert.equal(g.state.ai.life, 20, 'Black Vise : main de 4 cartes -> X = 0, aucune blessure.');
  console.log('OK V12.88.B2: Black Vise ne descend jamais sous 0 blessure.');
}

// ── C. Psionic Blast : 4 blessures à la cible, 2 à soi-même (aucun gain de vie) ──
{
  const c = CARDS.find(x => x.name === 'Psionic Blast');
  assert.ok(!/gagnez/i.test(String(c.text_fr)), 'Le texte de Psionic Blast ne promet plus de gain de vie.');
  const g = newGame();
  const pb = card('Psionic Blast', { owner: 'player', controller: 'player' });
  g.state.player.hand = [pb]; mana(g, 'player', { U: 1, C: 2 });
  g.dispatch('CAST_SPELL', { card: pb, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player'); pass(g);
  assert.equal(g.state.ai.life, 16, 'Psionic Blast : 4 blessures à la cible.');
  assert.equal(g.state.player.life, 18, 'Psionic Blast : 2 blessures à son lanceur (et NON 4 PV gagnés).');
  console.log('OK V12.88.C1: Psionic Blast = 4 à la cible, 2 à soi.');
}
{
  const g = newGame();
  g.state.ai.battlefield = [bear('ai')]; shield(g, 'player');
  const pb = card('Psionic Blast', { owner: 'player', controller: 'player' });
  g.state.player.hand = [pb]; mana(g, 'player', { U: 1, C: 2 });
  g.dispatch('CAST_SPELL', { card: pb, target: { kind: 'permanent', id: 'bear_ai', uid: 'bear_ai' }, xValue: 0 }, 'player'); pass(g);
  assert.equal(g.state.ai.battlefield.some(p => p.uid === 'bear_ai'), false, 'La créature ciblée meurt (4 blessures).');
  assert.equal(g.state.player.life, 20, 'Les 2 blessures que le lanceur se fait passent par la prévention.');
  console.log('OK V12.88.C2: les blessures à soi-même respectent la prévention.');
}

// ── D. Power Sink ───────────────────────────────────────────────────────────
function powerSinkGame(playerMana) {
  const g = newGame();
  g.state.player.battlefield = [island('player', 1), island('player', 2)];
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; mana(g, 'player', { R: 1, ...playerMana });
  const ps = card('Power Sink', { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [ps]; mana(g, 'ai', { U: 3 });
  g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player');
  g.dispatch('CAST_SPELL', { card: ps, target: { kind: 'stackItem', id: g.stack.items.at(-1).id }, xValue: 2 }, 'ai');
  return g;
}
{
  assert.equal(CARDS.find(c => c.name === 'Power Sink').effectStatus, 'implemented', 'Power Sink est jouable (statut implemented).');
  const g = powerSinkGame({ C: 2 });
  pass(g, 2);
  assert.ok(g.choices.getPending(), 'Power Sink X=2 : choix payer / refuser.');
  g.choices.resolve('decline'); drain(g);
  assert.ok(g.state.player.battlefield.filter(p => /Land/.test(p.type)).every(p => p.tapped), "Refus : tous les terrains du joueur sont engagés.");
  assert.equal(total(g, 'player'), 0, 'Refus : la réserve de mana est vidée.');
  assert.equal(g.state.ai.life, 20, 'Refus : le sort est contrecarré.');
  console.log('OK V12.88.D1: Power Sink non payé -> terrains engagés + réserve vidée.');
}
{
  const g = powerSinkGame({ C: 2 });
  pass(g, 2);
  g.choices.resolve('pay'); drain(g);
  assert.ok(g.state.player.battlefield.filter(p => /Land/.test(p.type)).every(p => !p.tapped), 'Payé : les terrains restent dégagés.');
  assert.equal(g.state.ai.life, 17, 'Payé : le sort résout.');
  console.log('OK V12.88.D2: Power Sink payé -> aucun terrain engagé, le sort résout.');
}
{
  const g = powerSinkGame({});
  pass(g, 2); drain(g);
  assert.ok(g.state.player.battlefield.filter(p => /Land/.test(p.type)).every(p => p.tapped), 'Paiement impossible : terrains engagés aussi.');
  assert.equal(g.state.ai.life, 20, 'Paiement impossible : contrecarré.');
  console.log('OK V12.88.D3: Power Sink sans mana pour payer -> contrecarré et terrains engagés.');
}

// ── E. Défausses aléatoires déterministes (graine fixe) ─────────────────────
function mindTwistRun(seed) {
  rngClock.configure({ seed });
  const g = newGame();
  g.state.ai.hand = Array.from({ length: 6 }, (_, i) => land('ax', i));
  const mt = card('Mind Twist', { owner: 'player', controller: 'player' });
  g.state.player.hand = [mt]; mana(g, 'player', { B: 1, C: 2 });
  g.dispatch('CAST_SPELL', { card: mt, target: { kind: 'player', side: 'ai' }, xValue: 2 }, 'player'); pass(g);
  return g.state.ai.graveyard.map(c => c.name).sort().join(',');
}
try {
  const seen = new Set();
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const a = mindTwistRun(seed), b = mindTwistRun(seed);
    assert.equal(a, b, `Mind Twist avec la graine ${seed} doit défausser les mêmes cartes à chaque exécution.`);
    assert.equal(a.split(',').length, 2, 'Mind Twist X=2 défausse 2 cartes.');
    seen.add(a);
  }
  assert.ok(seen.size > 1, 'Des graines différentes donnent des défausses différentes (le hasard existe bien).');
  console.log('OK V12.88.E: Mind Twist est reproductible à graine fixe.');
} finally { rngClock.configure({ seed: null }); }
