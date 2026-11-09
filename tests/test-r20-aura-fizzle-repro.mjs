import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const bear = { uid: 'bear1', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'ai', damageMarked: 0 };
const aura = { uid: 'aura1', name: 'Test Aura', type: 'Enchantment - Aura', owner: 'player', attachedTo: 'bear1' };
game.state.ai.battlefield = [bear];
game.state.player.battlefield = [aura];
// La créature enchantée meurt par dégâts létaux (passe par ZoneManager -> nouvel uid)
bear.damageMarked = 2;
game.stateBasedActions.check(game.state);
const auraStillOnBattlefield = game.state.player.battlefield.some(p => p.uid === 'aura1');
const auraInGraveyard = (game.state.player.graveyard || []).some(p => p.name === 'Test Aura');
assert.ok(!auraStillOnBattlefield && auraInGraveyard,
  `BUG: l'aura reste accrochée à une créature morte au lieu de fizzle. Toujours sur le champ: ${auraStillOnBattlefield}, au cimetière: ${auraInGraveyard}`);
console.log('OK: aura correctement envoyée au cimetière quand sa cible meurt (fizzle SBA respecté)');
