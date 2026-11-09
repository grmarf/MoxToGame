// V12 — smoke test déterministe du contrôleur IA + fenêtre de priorité.
import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
import { installAIController } from '../src/app/ai-controller.js';

installEffects(effects, globalThis);
game.connect();
const island = { ...(CARDS.find(c => c.name === 'Island') || CARDS.find(c => c.isBasic)) };
game.engine.loadDeck('player', [], { draw: 0 });
game.engine.loadDeck('ai', [island], { draw: 1 });
game.turnManager.activePlayer = 'ai';
game.turnManager.gotoPhase('main1');
game.state.activePlayer = 'ai';
game.state.priorityHolder = 'ai';

let landsPlayed = 0;
gameEvents.on('landPlayed', e => { if (e.controller === 'ai') landsPlayed++; });
installAIController({ game, events: gameEvents });

gameEvents.emit({ type:'phaseChanged', phase:'main1', turn:1, activePlayer:'ai', priorityAvailable:true });

await new Promise(resolve => setTimeout(resolve, 1400));
console.log('Terrains IA joués :', landsPlayed);
console.log('Priorité après action IA :', game.state.priorityHolder);
if (landsPlayed !== 1) { console.error('ÉCHEC : l’IA n’a pas joué son terrain.'); process.exit(1); }
if (!['ai','player'].includes(game.state.priorityHolder)) { console.error('ÉCHEC : priorité incohérente.'); process.exit(1); }
console.log('OK : contrôleur IA V12 — action réelle et priorité cohérente.');
process.exit(0);
