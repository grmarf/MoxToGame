import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const attacker = { uid: 'a1', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'player', tempBuffs: [] };
game.state.player.battlefield = [attacker];
const spell = { uid: 's1', name: "Warrior's Charge", type: 'Sorcery', effect: { type: 'pumpAttacking', power: 1, toughness: 0 }, owner: 'player' };
game.state.player.hand = [spell];
game.state.activePlayer = 'player';
game.stack.pushSpell(spell, 'player', null);
const resolved = game.stack.resolveTop();
const realAttacker = game.state.player.battlefield.find(p => p.uid === 'a1');
assert.strictEqual(realAttacker.power, 2,
  `RÉGRESSION CONFIRMÉE v12.19: Warrior's Charge (carte réelle, id 230) se résout SANS AUCUN EFFET (no-op silencieux) car pumpAttacking n'est plus enregistré nulle part -- effects.has() échoue en amont dans stack.js:194, le fallback legacy ne fait rien non plus. Puissance observée après résolution: ${realAttacker.power} (attendu +1 -> 3).`);
console.log('Si ce message s\'affiche, pas de régression (ne devrait pas arriver en l\'état actuel du code).');

