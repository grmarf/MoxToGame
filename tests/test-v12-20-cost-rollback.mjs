// V12.20 — Vérification : un paiement partiel laisse-t-il des ressources dépensées ?
import { CostService } from '../src/core/costs/cost-system.js';

const state = {
  player: {
    mana: { W: 2, U: 0, B: 0, R: 0, G: 0, C: 0, generic: 0 },
    battlefield: [
      { uid: 'p1', name: 'Creature', tapped: false },
      { uid: 'p2', name: 'Creature', tapped: false }
    ],
    hand: [{ uid: 'h1', name: 'Card' }],
    life: 20
  }
};

const costs = new CostService({ getState: () => state, choose: null, zones: null });

// Cas 1 : canPay échoue -> pay ne doit pas être appelé (il lance une exception)
const manaBefore = JSON.stringify(state.player.mana);
let ok1 = false;
let threw = false;
try {
  ok1 = costs.pay('player', { mana: '{3}{W}', sacrifice: true }, { permanent: state.player.battlefield[0] });
} catch (e) {
  threw = true;
}
const manaAfterFail = JSON.stringify(state.player.mana);

console.log('threw:', threw, '| mana unchanged:', manaBefore === manaAfterFail);
if (!threw || manaBefore !== manaAfterFail) {
  console.error('BUG: ressource modifiée malgré canPay=false');
  process.exit(1);
}

// Cas 2 : canPay passe, paiement atomique simple
const ok2 = costs.pay('player', { mana: '{W}', tap: true }, { permanent: state.player.battlefield[0] });
console.log('Simple pay result:', ok2, '| creature tapped:', state.player.battlefield[0].tapped, '| mana W:', state.player.mana.W);
if (!ok2 || !state.player.battlefield[0].tapped || state.player.mana.W !== 1) {
  console.error('BUG: paiement atomique simple incohérent');
  process.exit(1);
}

console.log('PASS: cost system conserve la cohérence atomique en usage canonique');
