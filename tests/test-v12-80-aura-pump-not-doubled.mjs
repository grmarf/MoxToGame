import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

// BUG O (audit v12.69) : le pump porté par une Aura ("+X/+Y" permanent tant
// qu'elle reste attachée) était appliqué DEUX fois : une fois comme buff
// temporaire (tempBuffs, jusqu'à la fin du tour) par le handler 'pump' au
// moment où le sort résout, et une seconde fois en continu par
// calculateCharacteristics (layer 7, via auraEffect une fois la carte
// devenue permanente). Holy Strength (+1/+2) devenait +2/+4, et le bonus
// disparaissait à tort en fin de tour alors que l'Aura restait attachée.

const RICH = { W: 9, U: 9, B: 9, R: 9, G: 9, C: 9 };
const bear = (side, uid) => ({ uid, name: 'Grizzly Bears', type: 'Creature', subtype: 'Bear', power: 2, toughness: 2, color: ['G'], keywords: [], owner: side, controller: side, tapped: false, summoningSickness: false, damageMarked: 0, counters: [], auraBuffs: [], tempBuffs: [] });
function freshGame() {
  const g = new GameFacade().connect();
  g.state.player.library = []; g.state.ai.library = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.player.mana = { ...RICH };
  return g;
}
const drain = (g) => { for (let i = 0; i < 6 && g.stack.items.length; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };

for (const [name, dp, dt] of [['Holy Strength', 1, 2], ['Unholy Strength', 2, 1]]) {
  const g = freshGame();
  const me = bear('player', 'me'); g.state.player.battlefield.push(me);
  const card = { ...CARDS.find(c => c.name === name), uid: 'c_' + name, owner: 'player', controller: 'player' };
  g.state.player.hand = [card];
  g.dispatch('CAST_SPELL', { card, target: { kind: 'permanent', perm: me, uid: 'me', name: me.name }, xValue: 0 }, 'player');
  drain(g);
  const chars = calculateCharacteristics(g.state, g.state.player.battlefield.find(p => p.uid === 'me'));
  assert.equal(chars.power, 2 + dp, `BUG O (${name}) : +${dp}/+${dt} doit s'appliquer UNE seule fois (force).`);
  assert.equal(chars.toughness, 2 + dt, `BUG O (${name}) : +${dp}/+${dt} doit s'appliquer UNE seule fois (endurance).`);
  // Le bonus doit survivre à la fin du tour, contrairement à un vrai pump temporaire.
  g.turnManager.gotoPhase('endStep'); g.turnManager.runPhase?.();
  const afterEot = calculateCharacteristics(g.state, g.state.player.battlefield.find(p => p.uid === 'me'));
  assert.equal(afterEot.power, 2 + dp, `BUG O (${name}) : le bonus d'une Aura attachée doit survivre à la fin du tour.`);
  console.log(`OK V12.80: ${name} applique son bonus une seule fois et le conserve après la fin du tour.`);
}
