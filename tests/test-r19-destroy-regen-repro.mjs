import assert from 'assert';
import { GameFacade } from '../src/core/game-facade.js';
const game = new GameFacade(); game.connect();
const wisp = { uid: 'w1', name: "Will-o'-the-Wisp", type: 'Creature', power: 1, toughness: 1, owner: 'ai', regenShield: true, damageMarked: 0 };
game.state.ai.battlefield = [wisp];
const spell = { uid: 's1', name: 'Terror', type: 'Instant', effect: { type: 'destroy' }, owner: 'player' };
game.state.player.hand = [spell];
game.state.activePlayer = 'player';
game.stack.pushSpell(spell, 'player', { kind: 'permanent', uid: 'w1' });
game.stack.resolveTop();
const stillOnBattlefield = game.state.ai.battlefield.some(p => p.uid === 'w1');
const inGraveyard = (game.state.ai.graveyard || []).some(p => p.name === "Will-o'-the-Wisp");
assert.ok(stillOnBattlefield && !inGraveyard,
  `BUG CONFIRME: destroy ignore regenShield (destroyPermanent dans stack.js ne vérifie pas ce champ, contrairement au chemin SBA dans state-based-actions.js). Toujours sur le champ: ${stillOnBattlefield}, au cimetière: ${inGraveyard}`);
console.log('Pas de bug: le bouclier de régénération a bien été respecté par destroy direct.');
