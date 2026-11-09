import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';

installEffects(effects, globalThis);
game.connect();
game.turnManager.activePlayer = 'ai';
game.turnManager.gotoPhase('main1');
game.state.activePlayer = 'ai';
game.state.priorityHolder = 'ai';
const card = { name:'Sort 1B', type:'Sorcery', cost:'1B', cmc:2, effect:{type:'noop'} };
game.state.ai.hand = [card];
game.state.ai.mana = {W:0,U:2,B:0,R:0,G:0,C:0};
if (game.costs.canPay('ai', card.cost, {controller:'ai', card, xValue:0})) {
  console.error('ÉCHEC: 1B ne doit pas être payable avec seulement UU.'); process.exit(1);
}
game.state.ai.mana = {W:0,U:1,B:1,R:0,G:0,C:0};
if (!game.costs.canPay('ai', card.cost, {controller:'ai', card, xValue:0})) {
  console.error('ÉCHEC: 1B doit être payable avec UB.'); process.exit(1);
}
const move = game.ai.chooseAction();
if (move?.action !== 'castSpell' || move?.data?.card !== card) {
  console.error('ÉCHEC: l’IA n’utilise pas le CostService canonique pour détecter le sort payable.'); process.exit(1);
}
console.log('OK: CostService V12 — coûts colorés respectés par le moteur et l’IA.');
process.exit(0);
