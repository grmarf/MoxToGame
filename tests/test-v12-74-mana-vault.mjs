import assert from 'node:assert/strict';
import { TurnManager, TurnPhase } from '../src/core/turn/turn-manager.js';
import { createPermanent } from '../src/core/card-runtime.js';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerUpkeepCostEffects } from '../src/core/effects/upkeep-cost-effects.js';
import CARDS from '../src/data/cards-database.js';

// BUG A (audit v12.66) : tapAbility.doesntUntap / upkeepDamage de Mana Vault
// n'étaient lus par aucun mécanisme du moteur, et le paiement optionnel {4}
// à l'entretien n'existait pas. Ce test verrouille les 3 volets :
//  1. étape de dégagement : Mana Vault reste engagée ;
//  2. entretien : payToUntap paie {4} et dégage (ou refuse proprement) ;
//  3. étape de pioche : 1 blessure si elle est toujours engagée.

const vaultCard = CARDS.find(c => c.name === 'Mana Vault');
const newState = () => ({
  turnNumber: 1, activePlayer: 'player',
  player: { life: 20, library: [{ uid: 'l1', name: 'X', cmc: 0 }], hand: [], battlefield: [], graveyard: [], exile: [], mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
  ai: { life: 20, library: [], hand: [], battlefield: [], graveyard: [], exile: [], mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
});
const makeTM = (state) => new TurnManager({ state: () => state, sba: { check() {} }, combat: {}, startingPlayer: 'player' });
const addVault = (state, tapped) => {
  const v = createPermanent({ ...vaultCard, owner: 'player', controller: 'player' });
  v.tapped = tapped;
  state.player.battlefield.push(v);
  return v;
};

// 0. Normalisation : le déclencheur d'entretien est bien présent.
{
  const v = createPermanent({ ...vaultCard, owner: 'player', controller: 'player' });
  const trig = v.triggers.find(t => t.event === 'upkeepStarted');
  assert.ok(trig, 'Mana Vault doit porter un déclencheur upkeepStarted.');
  assert.equal(trig.effect.type, 'payToUntap');
  assert.equal(trig.effect.cost, '{4}');
  console.log('OK V12.74.0: Mana Vault porte le déclencheur payToUntap {4}.');
}

// 1. Dégagement : reste engagée.
{
  const state = newState();
  const v = addVault(state, true);
  const tm = makeTM(state);
  tm.gotoPhase(TurnPhase.UNTAP);
  tm.runPhase();
  assert.equal(v.tapped, true, "BUG A : Mana Vault ne doit pas se dégager à l'étape de dégagement.");
  console.log("OK V12.74.1: Mana Vault ne se dégage pas à l'étape de dégagement.");
}

// 2. Entretien : payer {4} dégage, sinon reste engagée.
{
  const registry = new EffectRegistry();
  registerUpkeepCostEffects(registry);
  const run = (mana) => {
    const state = newState();
    state.player.mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: mana };
    const v = addVault(state, true);
    const ctx = {
      state, controllerKey: 'player', sourceCard: v,
      api: { state, log() {}, findPermanent: (uid) => state.player.battlefield.find(p => p.uid === uid) || null, choose: ({ options }) => options[0] },
    };
    registry.resolve('payToUntap', ctx, { type: 'payToUntap', cost: '{4}' });
    return { v, state };
  };
  const rich = run(5);
  assert.equal(rich.v.tapped, false, 'BUG A : payer {4} doit dégager Mana Vault.');
  assert.equal(rich.state.player.mana.C, 1, 'Les 4 mana doivent avoir été dépensés (5 -> 1).');
  const poor = run(3);
  assert.equal(poor.v.tapped, true, 'Sans {4} disponibles, Mana Vault reste engagée.');
  assert.equal(poor.state.player.mana.C, 3, 'Aucun mana ne doit être dépensé si le paiement est impossible.');
  console.log('OK V12.74.2: payToUntap paie {4} et dégage, ou refuse proprement.');
}

// 3. Pioche : 1 blessure si toujours engagée, aucune si dégagée.
{
  const state = newState();
  addVault(state, true);
  const tm = makeTM(state);
  tm.gotoPhase(TurnPhase.DRAW);
  tm.runPhase();
  assert.equal(state.player.life, 19, "BUG A : Mana Vault engagée doit infliger 1 blessure à l'étape de pioche.");

  const state2 = newState();
  addVault(state2, false);
  const tm2 = makeTM(state2);
  tm2.gotoPhase(TurnPhase.DRAW);
  tm2.runPhase();
  assert.equal(state2.player.life, 20, 'Mana Vault dégagée ne doit infliger aucune blessure.');
  console.log("OK V12.74.3: 1 blessure à la pioche si Mana Vault est engagée, 0 sinon.");
}
