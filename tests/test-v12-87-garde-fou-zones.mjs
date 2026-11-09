import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';
import { instrumentState, violations } from './lib/zone-guard.mjs';

// v12.72 — garde-fou : les scénarios ci-dessous (sort résolu, contrecarré, Control Magic,
// Mind Bomb) tournent sous surveillance ; toute écriture de zone hors ZoneManager est une
// violation. v12.73 : PLUS AUCUNE tolérance (le lancement d'un sort et la pose d'un terrain passent
// aussi par ZoneManager.remove).

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const lib = (p, n) => Array.from({ length: n }, (_, i) => land(p, i));
const bear = (o) => ({ uid: `bear_${o}`, name: 'Grizzly Bears', type: 'Creature', subtype: 'Bear', power: 2, toughness: 2, color: ['G'], owner: o, controller: o, zone: 'battlefield', cmc: 2, keywords: [] });
function newGame() {
  const g = new GameFacade().connect();
  g.state.player.library = lib('p', 12); g.state.ai.library = lib('a', 12);
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  instrumentState(g.state);
  return g;
}
const pass = (g, n = 2) => { for (let i = 0; i < n; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const mana = (g, side, m) => { g.state[side].mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ...m }; };

function scenarioBolt(counter) {
  const g = newGame();
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; mana(g, 'player', { R: 1 });
  if (counter) { const cs = card('Counterspell', { owner: 'ai', controller: 'ai' }); g.state.ai.hand = [cs]; mana(g, 'ai', { U: 2 });
    g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player');
    g.dispatch('CAST_SPELL', { card: cs, target: { kind: 'stackItem', id: g.stack.items.at(-1).id }, xValue: 0 }, 'ai');
    for (let i = 0; i < 6 && g.stack.items.length; i++) pass(g, 1);
  } else { g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player'); pass(g); }
}
function scenarioControlMagic() {
  const g = newGame();
  g.state.ai.battlefield = [bear('ai')];
  const cm = card('Control Magic', { owner: 'player', controller: 'player' });
  g.state.player.hand = [cm]; mana(g, 'player', { U: 4 });
  g.dispatch('CAST_SPELL', { card: cm, target: { kind: 'permanent', id: 'bear_ai', uid: 'bear_ai' }, xValue: 0 }, 'player'); pass(g);
}
function scenarioMindBomb() {
  const g = newGame();
  const mb = card('Mind Bomb', { owner: 'player', controller: 'player' });
  g.state.player.hand = [mb, land('px', 1), land('px', 2), land('px', 3)]; g.state.ai.hand = [land('ax', 1)];
  mana(g, 'player', { U: 3 });
  g.dispatch('CAST_SPELL', { card: mb, target: null, xValue: 0 }, 'player'); pass(g);
  for (let n = 0; g.choices.getPending() && n < 6; n++) { const p = g.choices.getPending(); g.choices.resolve(p.options.slice(0, p.max)); pass(g, 1); }
}
function scenarioPlayLand() {
  const g = newGame();
  const forest = card('Forest', { owner: 'player', controller: 'player' });
  g.state.player.hand = [forest];
  g.engine.action('playLand', { card: forest, controller: 'player' });
}
function scenarioMindTwist() {
  const g = newGame();
  g.state.ai.hand = Array.from({ length: 5 }, (_, i) => land('ax', i));
  const mt = card('Mind Twist', { owner: 'player', controller: 'player' });
  g.state.player.hand = [mt]; mana(g, 'player', { B: 1, C: 2 });
  g.dispatch('CAST_SPELL', { card: mt, target: { kind: 'player', side: 'ai' }, xValue: 2 }, 'player'); pass(g);
}
scenarioBolt(false); scenarioBolt(true); scenarioControlMagic(); scenarioMindBomb(); scenarioPlayLand(); scenarioMindTwist();

const bad = [...violations.entries()];
assert.deepEqual(bad, [], 'Écritures de zone hors ZoneManager :\n' + bad.map(([k, v]) => `  ${v}x ${k}`).join('\n'));
console.log(`OK V12.87: aucune écriture de zone hors ZoneManager (0 tolérance).`);
