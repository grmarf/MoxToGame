import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

// v12.71 (point 1 du plan) : counterUnlessPay (Force Spike, Power Sink) ne
// paie plus AUTOMATIQUEMENT pour le joueur humain. Le joueur reçoit un vrai
// choix ('pay' / 'decline') via ChoiceService ; la résolution du contresort
// reste suspendue tant qu'il n'a pas répondu. L'IA continue de décider seule.

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
const total = (g, side) => Object.values(g.state[side].mana).reduce((a, b) => a + (b || 0), 0);

// Le JOUEUR lance Lightning Bolt sur l'IA ; l'IA répond (Force Spike / Power Sink).
function aiCounters(g, counterName, playerMana, aiMana, xValue = 0) {
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; mana(g, 'player', playerMana);
  const counter = card(counterName, { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [counter]; mana(g, 'ai', aiMana);
  g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player');
  const item = g.stack.items[g.stack.items.length - 1];
  assert.equal(g.state.priorityHolder, 'ai');
  g.dispatch('CAST_SPELL', { card: counter, target: { kind: 'stackItem', id: item.id }, xValue }, 'ai');
  return { bolt };
}

// 1. Force Spike, le joueur PEUT payer : un choix est posé, rien n'est décidé d'office.
{
  const g = newGame();
  const { bolt } = aiCounters(g, 'Force Spike', { R: 1, C: 1 }, { U: 1 });
  pass(g, 2);
  const pending = g.choices.getPending();
  assert.ok(pending, 'Le joueur doit recevoir un vrai choix (pay/decline), pas un paiement automatique.');
  assert.equal(pending.controller, 'player', 'Le choix appartient au contrôleur du sort ciblé.');
  assert.deepEqual([...pending.options].sort(), ['decline', 'pay']);
  assert.equal(total(g, 'player'), 1, "Rien n'est payé tant que le joueur n'a pas choisi.");
  assert.equal(g.state.player.graveyard.some(c => c.name === bolt.name), false, "Le sort n'est pas contrecarré avant la réponse.");
  g.choices.resolve('pay');
  assert.equal(total(g, 'player'), 0, 'Payer : {1} est prélevé.');
  assert.equal(g.state.player.graveyard.some(c => c.name === bolt.name), false, 'Payer : le sort reste sur la pile.');
  assert.equal(g.choices.getPending(), null);
  pass(g, 2);
  assert.equal(g.state.ai.life, 17, 'Payer : Lightning Bolt résout ensuite (3 dégâts).');
  console.log('OK V12.84.1: Force Spike pose un choix ; payer laisse le sort résoudre.');
}

// 2. Le joueur refuse alors qu'il pouvait payer : sort contrecarré, mana conservé.
{
  const g = newGame();
  const { bolt } = aiCounters(g, 'Force Spike', { R: 1, C: 1 }, { U: 1 });
  pass(g, 2);
  assert.ok(g.choices.getPending());
  g.choices.resolve('decline');
  assert.equal(total(g, 'player'), 1, 'Refuser : le mana flottant est conservé.');
  assert.equal(g.state.player.graveyard.some(c => c.name === bolt.name), true, 'Refuser : le sort finit au cimetière.');
  pass(g, 2);
  assert.equal(g.state.ai.life, 20, 'Refuser : Lightning Bolt ne fait rien.');
  console.log('OK V12.84.2: refuser de payer contrecarre le sort sans toucher au mana.');
}

// 3. Le joueur NE PEUT PAS payer : pas de choix inutile, contrecarré directement.
{
  const g = newGame();
  const { bolt } = aiCounters(g, 'Force Spike', { R: 1 }, { U: 1 });
  pass(g, 2);
  assert.equal(g.choices.getPending(), null, 'Aucun choix quand le paiement est impossible.');
  assert.equal(g.state.player.graveyard.some(c => c.name === bolt.name), true);
  console.log('OK V12.84.3: paiement impossible -> contrecarré sans choix.');
}

// 4. Power Sink X=2 : choix posé, le montant payé est X.
{
  const g = newGame();
  aiCounters(g, 'Power Sink', { R: 1, C: 3 }, { U: 3 }, 2);
  pass(g, 2);
  const pending = g.choices.getPending();
  assert.ok(pending, 'Power Sink : le joueur doit choisir.');
  assert.match(String(pending.prompt), /2/, 'Le prompt annonce le montant X=2.');
  g.choices.resolve('pay');
  assert.equal(total(g, 'player'), 1, 'Power Sink : X=2 prélevé sur 3 mana flottant.');
  console.log('OK V12.84.4: Power Sink pose un choix et prélève exactement X.');
}

// 5. Le JOUEUR lance Force Spike sur un sort de l'IA : l'IA décide seule (pas de choix humain).
{
  const g = newGame();
  const bolt = card('Lightning Bolt', { owner: 'ai', controller: 'ai' });
  g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; g.state.priorityHolder = 'ai';
  g.state.ai.hand = [bolt]; mana(g, 'ai', { R: 1 });
  g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'player' }, xValue: 0 }, 'ai');
  const item = g.stack.items[g.stack.items.length - 1];
  const spike = card('Force Spike', { owner: 'player', controller: 'player' });
  g.state.player.hand = [spike]; mana(g, 'player', { U: 1 });
  g.dispatch('CAST_SPELL', { card: spike, target: { kind: 'stackItem', id: item.id }, xValue: 0 }, 'player');
  pass(g, 2);
  assert.equal(g.choices.getPending(), null, "L'IA n'est jamais interrogée via l'UI.");
  assert.equal(g.state.ai.graveyard.some(c => c.name === bolt.name), true, "IA sans mana : son sort est contrecarré.");
  console.log("OK V12.84.5: l'IA décide seule.");
}
