// V12.76 — Copper Tablet (texte réel : « Au début de l'entretien de chaque joueur, elle inflige 1 blessure à ce joueur »).
// Avant : `damage` avec target:'controller' n'infligeait RIEN (la carte était « implemented » avec un test qui ne vérifiait que la présence du déclencheur).
// Ici : vraie progression de tour (nextPhase), les deux entretiens, quel que soit le contrôleur de la Tablette.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const tablet = CARDS.find((c) => c.name === 'Copper Tablet');
assert.equal(tablet.effectStatus, 'implemented');
for (const side of ['player', 'ai']) {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.turnNumber = 3; g.turnManager.turnNumber = 3;
  const perm = { ...structuredClone(tablet), uid: 'ct', objectId: 'ct', owner: side, controller: side, zone: 'battlefield', enteredTurn: 1 };
  g.state[side].battlefield.push(perm); g.triggerCollector.registerSource(perm, side); // enregistrement des déclencheurs, comme à l'entrée réelle en jeu
  const lives = []; let upkeeps = 0;
  for (let i = 0; i < 60 && upkeeps < 4; i++) {
    g.turnManager.nextPhase();
    for (let k = 0; k < 6 && g.stack.size > 0; k++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
    if (g.state.phase === 'upkeep') { upkeeps++; lives.push([g.state.activePlayer, g.state.player.life, g.state.ai.life]); }
  }
  assert.equal(upkeeps, 4, `${side} : 4 entretiens observés`);
  // Chaque entretien : SEUL le joueur dont c'est l'entretien perd 1 PV.
  const expect = (first) => { const o = first === 'player' ? 'ai' : 'player'; return [[first, first === 'player' ? 19 : 20, first === 'player' ? 20 : 19], [o, 19, 19], [first, first === 'player' ? 18 : 19, first === 'player' ? 19 : 18], [o, 18, 18]]; };
  assert.deepEqual(lives, expect(lives[0][0]), `${side} : ${JSON.stringify(lives)}`);
  console.log(`OK V12.76.116 (Tablette contrôlée par ${side}) : 1 blessure au joueur dont c'est l'entretien, à chacun de ses entretiens (${JSON.stringify(lives)}).`);
}
