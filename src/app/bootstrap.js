// @ts-check
import { gameEvents } from '../core/event-bus.js';
import { game } from '../core/game-facade.js';
import { effects } from '../core/effect-registry.js';
import { installEffects } from '../core/effects/index.js';
import CARDS from '../data/cards-database.js';
import { createGameUI } from '../ui/game-ui.js';
import { TurnUI } from '../ui/turn-ui.js';
import { installAIController } from './ai-controller.js';

export async function bootstrap() {
  installEffects(effects, window);
  window.CARDS = CARDS;

  game.connect();
  game.engine.loadDeck?.('player', CARDS);
  game.engine.loadDeck?.('ai', CARDS);

  // V11.0 — branche l'IA joueur 2 : sans cet appel, game.ai existe mais
  // n'est jamais consulté, et le tour de l'IA ne fait strictement rien.
  installAIController({ game, events: gameEvents });

  const ui = createGameUI({
    cards: CARDS,
    game,
    root: document.body,
  });

  const turnUI = new TurnUI({
    turnManager: game.turnManager,
    onNextPhase: () => game.dispatch('nextPhase'),
    onPassPriority: () => game.dispatch('passPriority'),
    getPriorityHolder: () => game.state?.priorityHolder ?? null,
    container: document.getElementById('turn-ui'),
  });

  gameEvents.on('commandDispatched', (evt) => {
    ui.render(evt.state || game.state);
    turnUI.render(game.turnManager.snapshot);
  });
  gameEvents.on('phaseChanged', () => {
    ui.render(game.state);
    turnUI.render(game.turnManager.snapshot);
  });
  gameEvents.on('log', (e) => ui.log(e.msg, e.side));
  gameEvents.on('engineReady', () => ui.render(game.state));

  window.MTG9 = Object.freeze({
    version: '11.1',
    cards: CARDS,
    game, events: gameEvents,
    dispatch: game.dispatch.bind(game),
    stack: game.stack, priority: game.priority, targeting: game.targeting,
    combat: game.combat, stateBasedActions: game.stateBasedActions,
    turnManager: game.turnManager, triggerEngine: game.triggerEngine,
    ai: game.ai, choices: game.choices, replacements: game.replacements, ui, turnUI,
  });

  gameEvents.emit({ type: 'engineReady', version: '11.1', mode: 'native' });
}
bootstrap().catch((err) => {
  console.error('MTG V11.1 bootstrap failed', err);
  const el = document.getElementById('fatal-error') || document.body.appendChild(document.createElement('pre'));
  el.id = 'fatal-error';
  el.textContent = `Erreur de démarrage MTG V11.1 : ${err.message}`;
});
