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

// On force manuellement une créature 3/3 vanille sur le champ de l'IA, déjà prête à attaquer.
game.state.ai.battlefield.push({
  uid: 'test_creature_1', name: 'Testeur Direct', type: 'Creature', power: 3, toughness: 3,
  tapped: false, summoningSickness: false, controller: 'ai', owner: 'ai', color: [],
});

gameEvents.on('log', (e) => console.log(`[log:${e.side}] ${e.msg}`));
gameEvents.on('combatDamageToPlayer', (e) => console.log(`[dégâts] ${e.amount} à ${e.target} par ${e.source?.name}`));

console.log('PV joueur avant :', game.state.player.life);

// Force le joueur actif à être l'IA, en phase declareAttackers, pour déclencher directement le combat.
game.turnManager.activePlayer = 'ai';
game.turnManager.gotoPhase('declareAttackers');
game.state.activePlayer = 'ai';
game.state.priorityHolder = 'ai';

const creature = game.state.ai.battlefield.find(p => p.uid === 'test_creature_1');
game.dispatch('declareAttackers', { attackers: [creature] }, 'ai');
console.log('Phase après déclaration :', game.turnManager.phase, '| combat.phase :', game.combat.combat?.phase);

// Le test est centré sur les blessures de combat ; le test V12 Priority/Stack
// couvre séparément les deux passes et la résolution.
game.turnManager.gotoPhase('declareBlockers');
game.state.priorityHolder = 'player';
console.log('Phase :', game.turnManager.phase);
game.dispatch('declareBlockers', { blockers: {} }, 'player');
game.turnManager.gotoPhase('combatDamage');
game.state.priorityHolder = 'ai';
game.turnManager.runPhase();
console.log('Phase :', game.turnManager.phase);

console.log('PV joueur après :', game.state.player.life);
if (game.state.player.life === 20 - 3) {
  console.log('OK : les dégâts de combat sont bien appliqués (20 -> 17).');
  process.exit(0);
} else {
  console.error('ÉCHEC : PV attendus = 17, obtenus =', game.state.player.life);
  process.exit(1);
}
