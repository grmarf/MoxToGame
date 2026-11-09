import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => {
  const c = CARDS.find(c => c.name === name);
  assert.ok(c, `Carte absente de la base : ${name}`);
  return c;
};

function setup() {
  const g = new GameFacade().connect();
  g.turnManager.gotoPhase('main1');
  g.turnManager.activePlayer = 'player';
  g.state.phase = 'main1';
  g.state.activePlayer = 'player';
  g.state.priorityHolder = 'player';
  g.state.turnNumber = 1;
  g.turnManager.turnNumber = 1;
  for (const side of ['player', 'ai']) {
    g.state[side].life = 20;
    g.state[side].battlefield = [];
    g.state[side].hand = [];
    g.state[side].graveyard = [];
    g.state[side].mana = { W: 20, U: 20, B: 20, R: 20, G: 20, C: 20 };
  }
  return g;
}

function put(g, cardName, side, extra = {}) {
  const p = createPermanent(card(cardName));
  p.controller = side;
  p.owner = side;
  Object.assign(p, extra);
  g.state[side].battlefield.push(p);
  return p;
}

function resolve(g) {
  while (g.stack.size) g.dispatch('RESOLVE_STACK', {}, 'player');
}

// ── 1. Pestilence, vraie activation : protectionB doit prévenir le dégât. ──
{
  const g = setup();
  const pestilence = put(g, 'Pestilence', 'player');
  const protectedKnight = put(g, 'White Knight', 'ai');

  g.dispatch('ACTIVATE_ABILITY', {
    permanent: pestilence,
    abilityIndex: 0,
  }, 'player');
  resolve(g);

  assert.equal(protectedKnight.damageMarked, 0,
    'Pestilence (source noire) ne doit infliger aucun dégât à White Knight (protectionB).');
}

// ── 2. Pestilence, non-régression : sans protection, le dégât est marqué. ──
{
  const g = setup();
  const pestilence = put(g, 'Pestilence', 'player');
  const bear = put(g, 'Grizzly Bears', 'ai');

  g.dispatch('ACTIVATE_ABILITY', {
    permanent: pestilence,
    abilityIndex: 0,
  }, 'player');
  resolve(g);

  assert.equal(bear.damageMarked, 1,
    'Pestilence doit infliger 1 dégât à une créature sans protection.');
}

// ── 3. Hurricane réel : X=2, protectionG doit prévenir les dégâts aux flyers. ──
{
  const g = setup();
  const protectedAngel = put(g, 'Serra Angel', 'ai');
  protectedAngel.keywords.push('protectionG');

  const hurricane = card('Hurricane');
  g.state.player.hand = [hurricane];
  g.dispatch('CAST_SPELL', { card: hurricane, xValue: 2 }, 'player');
  resolve(g);

  assert.equal(protectedAngel.damageMarked, 0,
    'Hurricane (source verte) ne doit pas infliger de dégâts à Serra Angel (protectionG).');
}

// ── 4. Hurricane réel : un flyer sans protection doit subir X dégâts. ──
{
  const g = setup();
  const angel = put(g, 'Serra Angel', 'ai');

  const hurricane = card('Hurricane');
  g.state.player.hand = [hurricane];
  g.dispatch('CAST_SPELL', { card: hurricane, xValue: 2 }, 'player');
  resolve(g);

  assert.equal(angel.damageMarked, 2,
    'Hurricane doit infliger X=2 dégâts à une créature avec vol sans protection.');
}

console.log('OK V12.66: hasProtectionFromColors unifiée — Pestilence et Hurricane respectent protectionB/protectionG.');
