import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';

installEffects(effects, globalThis);
game.connect();
game.engine.loadDeck('player', [{ name:'Test Instant', type:'Instant', cost:'', effect:{type:'noop'} }], { draw: 1 });
game.engine.loadDeck('ai', [], { draw: 0 });
game.turnManager.gotoPhase('main1');
game.state.activePlayer = 'player';
game.state.priorityHolder = 'player';

const card = game.state.player.hand[0];
console.log('Avant cast:', { stack: game.stack.size, priority: game.state.priorityHolder });
game.dispatch('castSpell', { card }, 'player');
if (game.stack.size !== 1 || game.state.priorityHolder !== 'ai') {
  console.error('ÉCHEC: le cast ne crée pas la fenêtre de réponse IA.'); process.exit(1);
}
console.log('Après cast:', { stack: game.stack.size, priority: game.state.priorityHolder });

game.dispatch('passPriority', {}, 'ai');
if (game.stack.size !== 1 || game.state.priorityHolder !== 'player') {
  console.error('ÉCHEC: le premier pass ne transfère pas la priorité.'); process.exit(1);
}
game.dispatch('passPriority', {}, 'player');
if (game.stack.size !== 0 || game.state.priorityHolder !== 'player') {
  console.error('ÉCHEC: deux passes ne résolvent pas le sommet puis ne rendent pas la priorité au joueur actif.'); process.exit(1);
}
console.log('OK: Priority/Stack V12 — cast → réponse → double pass → résolution.');
process.exit(0);
