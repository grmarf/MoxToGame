import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';

const game = new GameFacade();
game.connect();

// The initial state is the non-priority untap step. One user advance must
// execute untap and stop at upkeep, not require a second click.
game.state.player.battlefield.push({ uid:'p1', name:'Test Land', tapped:true, controller:'player' });
game.state.ai.battlefield.push({ uid:'a1', name:'AI Land', tapped:true, controller:'ai' });

game.dispatch('nextPhase');
assert.equal(game.turnManager.phase, 'upkeep', 'Le bouton doit traverser automatiquement untap jusqu’à upkeep.');
assert.equal(game.state.player.battlefield[0].tapped, false, 'Untap doit être exécuté avant de quitter la phase.');
assert.equal(game.state.priorityHolder, 'player', 'La priorité doit être rendue au joueur à upkeep.');

// Cleanup must execute, roll into the next turn, execute its untap, then stop
// at the next upkeep.
game.turnManager.gotoPhase('cleanup');
game.state.phase = 'cleanup';
game.state.priorityHolder = null;
game.state.activePlayer = 'player';
game.turnManager.activePlayer = 'player';
game.dispatch('nextPhase');
assert.equal(game.turnManager.phase, 'upkeep', 'Cleanup doit enchaîner le nouvel untap automatiquement.');
assert.equal(game.turnManager.turnNumber, 2, 'Cleanup doit faire passer au tour suivant.');
assert.equal(game.state.priorityHolder, 'ai', 'Le joueur actif du tour 2 est l’IA.');

console.log('OK: phases sans priorité traversées automatiquement jusqu’à la prochaine fenêtre de décision.');
