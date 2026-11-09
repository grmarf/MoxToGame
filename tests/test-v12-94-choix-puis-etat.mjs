import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

// V12.75 — Les actions d'état doivent s'appliquer APRÈS la continuation d'un choix.
// Mind Bomb inflige ses blessures dans la continuation du choix de défausse : le chemin
// `choices.resolve(...)` (UI et banc IA-vs-IA) ne repassait jamais par dispatch(), donc un
// joueur tombé à 0 PV restait en jeu sans avoir perdu (violation I7 du banc, graine 317).
const card = (name, extra = {}) => ({ ...CARDS.find((c) => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p });
const lib = (p, n) => Array.from({ length: n }, (_, i) => land(p, i));
function newGame() {
  const g = new GameFacade().connect();
  g.state.player.library = lib('player', 12); g.state.ai.library = lib('ai', 12);
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
const pass = (g, n = 2) => { for (let i = 0; i < n; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };

for (const [who, other] of [['player', 'ai'], ['ai', 'player']]) {
  const g = newGame();
  g.state[who].life = 3;
  // Des cartes en main : sinon aucun choix de défausse n'est posé et la continuation n'est jamais exercée.
  g.state[other].hand = [land(other, 90), land(other, 91)];
  const bomb = card('Mind Bomb', { owner: who, controller: who });
  g.state[who].hand = [bomb, land(who, 92), land(who, 93)]; g.state[who].mana = { W: 0, U: 2, B: 0, R: 0, G: 0, C: 0 };
  g.state.activePlayer = who; g.state.priorityHolder = who; g.turnManager.activePlayer = who;
  g.dispatch('CAST_SPELL', { card: bomb, xValue: 0 }, who);
  for (let i = 0; i < 4 && g.stack.items.length && !g.choices.getPending(); i++) pass(g, 1);
  // Chacun répond « aucune défaillance » : 3 blessures chacun, le joueur à 3 PV tombe à 0.
  let guard = 0;
  while (g.choices.getPending() && guard++ < 4) g.choices.resolve([]);
  assert.ok(guard > 0, 'un choix de défausse doit avoir été posé (sinon le test n\'exerce rien)');
  assert.ok(g.state[who].life <= 0, `${who} doit être tombé à 0 PV ou moins (vie=${g.state[who].life})`);
  assert.equal(!!g.state[who].hasLost, true, `${who} à ${g.state[who].life} PV doit avoir perdu dès la fin du choix`);
}
console.log('OK V12.94: les actions d\'état s\'appliquent après la continuation d\'un choix (Mind Bomb à 3 PV).');
