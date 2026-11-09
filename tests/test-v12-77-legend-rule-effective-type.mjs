import assert from 'node:assert/strict';
import { StateBasedActions } from '../src/core/state-based-actions.js';

// BUG L (audit v12.66) : la règle des légendes (704.5j) lisait p.type en
// statique alors que les autres SBA passent par calculateCharacteristics.
// Une créature dont le type effectif n'est plus « Legendary » (effet de
// calque 4) était donc quand même détruite comme doublon.

const mkLegend = (uid) => ({ uid, name: 'Kismet Legend', type: 'Legendary Creature', subtype: 'Elf', power: 2, toughness: 2, color: ['G'], keywords: [], counters: [], auraBuffs: [], tempBuffs: [], owner: 'player', controller: 'player', damageMarked: 0 });
const mkState = (extra = []) => ({ turnNumber: 1,
  player: { life: 20, library: [], hand: [], graveyard: [], exile: [], battlefield: [mkLegend('L1'), mkLegend('L2'), ...extra] },
  ai: { life: 20, library: [], hand: [], graveyard: [], exile: [], battlefield: [] } });
const sba = new StateBasedActions({ legacyCheck: null });

// Témoin : deux légendes identiques -> une seule survit.
{
  const state = mkState();
  sba.check(state);
  assert.equal(state.player.battlefield.length, 1, 'Témoin : la règle des légendes doit éliminer un doublon.');
  assert.equal(state.player.graveyard.length, 1);
  console.log('OK V12.77.1: deux légendes identiques -> un doublon éliminé.');
}

// Cas L : une Aura fait perdre « Legendary » à L2 (changeType calque 4) -> aucun doublon légendaire.
{
  const aura = { uid: 'A1', name: 'Type Shifter', type: 'Enchantment — Aura', isAura: true, attachedTo: 'L2', auraEffect: { type: 'changeType', newType: 'Creature' }, owner: 'player', controller: 'player', counters: [], auraBuffs: [], tempBuffs: [] };
  const state = mkState([aura]);
  sba.check(state);
  const survivors = state.player.battlefield.filter(p => p.name === 'Kismet Legend').length;
  assert.equal(survivors, 2, "BUG L : une créature qui n'est plus légendaire (type effectif) ne doit pas être éliminée par la règle des légendes.");
  console.log('OK V12.77.2: type effectif non-légendaire respecté par la règle des légendes.');
}
