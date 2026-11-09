import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { TurnPhase } from '../src/core/turn/turn-manager.js';
import CARDS from '../src/data/cards-database.js';

// Audit v12.68 : quatre cartes qui ne faisaient rien (ou n'étaient pas
// jouables) sont désormais implémentées et vérifiées par le VRAI chemin de jeu
// (CAST_SPELL -> pile -> priorité -> résolution).

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const lib = (p, n) => Array.from({ length: n }, (_, i) => land(p, i));
function newGame() {
  const g = new GameFacade().connect();
  g.state.player.library = lib('p', 12); g.state.ai.library = lib('a', 12);
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
const pass = (g, n = 2) => { for (let i = 0; i < n; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const mana = (g, side, m) => { g.state[side].mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ...m }; };

// Statuts : ces cartes sont désormais certifiées jouables.
for (const n of ['Wheel of Fortune', 'Force Spike', 'Syphon Soul', 'Mana Drain']) {
  assert.equal(CARDS.find(c => c.name === n).effectStatus, 'implemented', `${n} doit être certifiée implemented.`);
}

// 1. Wheel of Fortune : mains défaussées (cimetière), 7 nouvelles cartes chacun.
{
  const g = newGame();
  const wheel = card('Wheel of Fortune', { owner: 'player', controller: 'player' });
  g.state.player.hand = [wheel, land('px', 1), land('px', 2)];
  g.state.ai.hand = [land('ax', 1)];
  mana(g, 'player', { R: 3 });
  g.dispatch('CAST_SPELL', { card: wheel, target: null, xValue: 0 }, 'player');
  pass(g);
  assert.equal(g.state.player.hand.length, 7, 'Wheel : le lanceur pioche 7 cartes.');
  assert.equal(g.state.ai.hand.length, 7, "Wheel : l'adversaire pioche 7 cartes.");
  assert.equal(g.state.player.graveyard.length, 3, 'Wheel : 2 cartes défaussées + Wheel elle-même au cimetière du lanceur.');
  assert.equal(g.state.ai.graveyard.length, 1, "Wheel : la main de l'adversaire est défaussée.");
  console.log('OK V12.79.1: Wheel of Fortune défausse les mains et fait piocher 7 cartes à chacun.');
}

// 2. Syphon Soul : 2 blessures à l'adversaire, le lanceur gagne 2 PV.
{
  const g = newGame();
  const s = card('Syphon Soul', { owner: 'player', controller: 'player' });
  g.state.player.hand = [s]; mana(g, 'player', { B: 1, C: 2 });
  g.state.player.life = 15; g.state.ai.life = 20;
  g.dispatch('CAST_SPELL', { card: s, target: null, xValue: 0 }, 'player');
  pass(g);
  assert.equal(g.state.ai.life, 18, "Syphon Soul : 2 blessures à l'adversaire.");
  assert.equal(g.state.player.life, 17, 'Syphon Soul : le lanceur gagne autant de PV que de blessures infligées.');
  console.log('OK V12.79.2: Syphon Soul inflige 2 blessures et fait gagner 2 PV.');
}

// Aide : le joueur lance un sort, l'IA répond avec un contresort ciblant l'objet de pile.
function castThenRespond(g, spellName, spellMana, counterName, aiMana) {
  const spell = card(spellName, { owner: 'player', controller: 'player' });
  g.state.player.hand = [spell]; mana(g, 'player', spellMana);
  const counter = card(counterName, { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [counter]; mana(g, 'ai', aiMana);
  g.dispatch('CAST_SPELL', { card: spell, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player');
  const item = g.stack.items[g.stack.items.length - 1];
  assert.equal(g.state.priorityHolder, 'ai', "L'IA doit avoir la priorité pour répondre.");
  g.dispatch('CAST_SPELL', { card: counter, target: { kind: 'stackItem', id: item.id }, xValue: 0 }, 'ai');
  return { spell, counter, item };
}

// 3. Force Spike : contrecarre si le lanceur ne peut pas payer {1}, sinon non.
{
  const g = newGame();
  const { spell } = castThenRespond(g, 'Lightning Bolt', { R: 1 }, 'Force Spike', { U: 1 });
  pass(g);
  assert.equal(g.state.player.graveyard.some(c => c.name === spell.name), true, 'Force Spike : le sort non payé finit au cimetière.');
  assert.equal(g.state.ai.life, 20, 'Force Spike : le sort contrecarré ne fait rien.');
  console.log('OK V12.79.3a: Force Spike contrecarre un sort dont le lanceur ne peut pas payer {1}.');
}
{
  const g = newGame();
  const { } = castThenRespond(g, 'Lightning Bolt', { R: 1, C: 1 }, 'Force Spike', { U: 1 });
  pass(g);
  // v12.71 : le joueur choisit lui-même de payer (plus de paiement automatique).
  assert.ok(g.choices.getPending(), 'Force Spike : le joueur doit recevoir un choix payer/refuser.');
  g.choices.resolve('pay');
  pass(g);
  assert.equal(g.state.ai.life, 17, 'Force Spike : si {1} est payé, le sort résout (3 dégâts).');
  console.log('OK V12.79.3b: Force Spike ne contrecarre pas si {1} est payé.');
}

// 4. Mana Drain : contrecarre + {C} égal au cmc à la prochaine phase principale de l'IA.
{
  const g = newGame();
  const { spell } = castThenRespond(g, 'Lightning Bolt', { R: 1 }, 'Mana Drain', { U: 2 });
  pass(g);
  assert.equal(g.state.ai.life, 20, 'Mana Drain : le sort est contrecarré.');
  assert.equal(g.state.ai.delayedMana?.[0]?.amount, 1, 'Mana Drain : mana différé = cmc du sort contrecarré (1).');
  assert.equal(g.state.ai.mana.C || 0, 0, "Le mana n'arrive PAS immédiatement.");
  // Prochaine phase principale de l'IA : on force son tour et son entrée en main1.
  g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai';
  g.turnManager.gotoPhase(TurnPhase.MAIN1); g.turnManager.runPhase();
  assert.equal(g.state.ai.mana.C, 1, 'Mana Drain : {C} ajouté au début de la prochaine phase principale.');
  assert.equal(g.state.ai.delayedMana.length, 0, 'Le mana différé est consommé une seule fois.');
  console.log('OK V12.79.4: Mana Drain contrecarre et ajoute {C} égal au cmc à la prochaine phase principale.');
}
