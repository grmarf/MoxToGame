import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
import { installAIController } from '../src/app/ai-controller.js';

installEffects(effects, globalThis);
game.connect();
game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));
installAIController({ game, events: gameEvents });

let aiActionsAfterLoss = 0;
let sawPlayerLostEvent = false;
gameEvents.on('playerLost', (e) => { console.log(`[playerLost] ${e.side} (${e.reason})`); sawPlayerLostEvent = true; });
gameEvents.on('commandDispatched', (evt) => {
  if (evt.command.source === 'ai' && sawPlayerLostEvent) aiActionsAfterLoss++;
});

// Simule la défaite du joueur humain (vie à 0), comme le fait le bouton "Abandonner".
game.state.player.life = 0;
game.turnManager.activePlayer = 'ai';
game.turnManager.gotoPhase('main1');
game.stateBasedActions.check(game.state); // déclenche playerLost

console.log('player.hasLost =', game.state.player.hasLost);

// On force malgré tout un événement phaseChanged, comme si le tour continuait,
// pour vérifier que le contrôleur IA refuse bien d'agir.
gameEvents.emit({ type: 'phaseChanged', phase: 'main1', turn: game.turnManager.turnNumber, activePlayer: 'ai', priorityAvailable: true });

setTimeout(() => {
  console.log('Actions IA dispatchées après la défaite du joueur :', aiActionsAfterLoss);
  if (!game.state.player.hasLost) { console.error('ÉCHEC : hasLost non positionné.'); process.exit(1); }
  if (aiActionsAfterLoss > 0) { console.error('ÉCHEC : l\'IA a continué à agir après la fin de la partie.'); process.exit(1); }
  console.log('OK : la partie est bien terminée et l\'IA ne fait plus rien.');
  process.exit(0);
}, 2000);
