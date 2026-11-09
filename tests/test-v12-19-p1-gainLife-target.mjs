import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
game.state.player.life = 20; game.state.ai.life = 20;
const spell = { uid: 's1', name: 'Heal Opponent', type: 'Sorcery', effect: { type: 'gainLife', amount: 5, target: 'opponent' }, owner: 'player' };
game.stack.pushSpell(spell, 'player', { kind: 'player', side: 'ai' });
game.stack.resolveTop();
assert.strictEqual(game.state.ai.life, 25, 'gainLife doit cibler l adversaire quand target=opponent');
console.log('P1 gainLife PASS');
