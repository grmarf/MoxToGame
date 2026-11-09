import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

// v12.73 : Psionic Blast inflige désormais 4 à la cible et 2 à son lanceur (effet damageAndSelfDamage).
// Le handler générique `damageAndGain` (X dégâts + gain de vie) reste couvert ici avec une carte
// synthétique reprenant l'ancienne définition (aucune carte réelle ne l'utilise plus).
const card = name => name === 'Psionic Blast'
  ? { ...CARDS.find(c => c.name === name), effect: { type: 'damageAndGain', amount: 4, gain: 4, target: 'anyTarget' } }
  : CARDS.find(c => c.name === name);

function setup() {
  const game = new GameFacade().connect();
  game.turnManager.gotoPhase('main1');
  game.turnManager.activePlayer = 'player';
  game.state.phase = 'main1';
  game.state.activePlayer = 'player';
  game.state.priorityHolder = 'player';
  game.state.player.mana = { W: 20, U: 20, B: 20, R: 20, G: 20, C: 20 };
  game.state.ai.mana = { W: 20, U: 20, B: 20, R: 20, G: 20, C: 20 };
  return game;
}

function resolve(game) {
  game.dispatch('resolveStack', {}, 'player');
}

// BUG-02: Psionic Blast is the real database caller of damageAndGain.
// The project database models it as 4 damage to the target + 4 life to its
// controller; this test isolates the BUG-02 requirement: if those 4 damage
// are prevented, the corresponding gain must not be awarded.
const psionicBlast = card('Psionic Blast');
assert.ok(psionicBlast, 'Psionic Blast must exist in cards-database.js');
assert.equal(psionicBlast.effect?.type, 'damageAndGain');
assert.equal(psionicBlast.effect?.amount, 4);
assert.equal(psionicBlast.effect?.gain, 4);
assert.equal(psionicBlast.effect?.target, 'anyTarget');

const game = setup();
game.state.player.hand = [psionicBlast];
game.state.ai.life = 20;
game.state.player.life = 20;

// Active one-shot blue-damage prevention shield, equivalent to an activated
// Circle of Protection: Blue shield but installed directly to keep this test
// focused on the damageAndGain -> ReplacementService path.
game.state.ai.prevention = [{
  amount: 4,
  color: 'U',
  source: null,
  sourceType: null,
  scope: 'controller',
  nonFlyingOnly: false,
  combatOnly: false,
  until: 'nextMatchingDamage',
  persistent: false,
  gainLife: false,
}];

const playerLifeBefore = game.state.player.life;
const aiLifeBefore = game.state.ai.life;

game.dispatch('CAST_SPELL', {
  card: psionicBlast,
  target: { kind: 'player', side: 'ai' },
}, 'player');
resolve(game);

assert.equal(game.state.ai.life, aiLifeBefore, 'Les 4 blessures bleues doivent être entièrement prévenues');
assert.equal(
  game.state.player.life,
  playerLifeBefore,
  'Le contrôleur ne doit pas gagner les 4 PV correspondant aux blessures entièrement prévenues',
);
assert.equal(game.state.ai.prevention.length, 0, 'Le bouclier one-shot doit être consommé');

console.log('OK V12.60 BUG-02: damageAndGain passe par ReplacementService et le gain suit les dégâts réellement infligés');
