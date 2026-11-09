import assert from 'node:assert/strict';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerAtomicEffects } from '../src/core/effects/atomic-effects.js';
import { ZoneManager } from '../src/core/zone-manager.js';
import { gameEvents } from '../src/core/event-bus.js';

// BUG I (audit v12.66) : le handler 'tutor' réellement actif est celui
// d'atomic-effects.js (enregistré sans garde registry.has, donc prioritaire
// -- installEffectDomains l'enregistre AVANT la version correcte, mais
// dormante, de search-aura-effects.js). Il manipulait directement
// lib.splice()/hand.push(), cassant l'identité canonique de l'objet déplacé
// (pas de nouveau uid/objectId comme l'exige un vrai changement de zone
// MTG, pas d'événement 'zoneChanged'/'librarySearched'). Démonic Tutor et
// tout tutor explicite (targetInfo._kind==='libraryCard') ou heuristique IA
// (meilleur CMC) sont concernés. Ce test vérifie que la carte qui atterrit
// en main est une IDENTITÉ NEUVE (via ZoneManager.move), pas le même objet
// physiquement déplacé d'un tableau à l'autre.

const registry = new EffectRegistry();
registerAtomicEffects(registry);

function baseState() {
  return {
    turnNumber: 1,
    player: {
      library: [
        { uid: 'lib_1', name: 'Demonic Tutor Fetch', cmc: 1 },
        { uid: 'lib_2', name: 'Black Lotus', cmc: 0 },
      ],
      hand: [], battlefield: [], graveyard: [], exile: [],
      life: 20,
    },
    ai: { library: [], hand: [], battlefield: [], graveyard: [], exile: [], life: 20 },
  };
}
const api = (state, zones) => ({
  log: () => {},
  shuffle: (arr) => arr,
  zones,
});

{
  // Ciblage explicite (Demonic Tutor : le joueur a choisi la carte en bibliothèque).
  const state = baseState();
  const zones = new ZoneManager({ state: () => state });
  const originalCard = state.player.library.find(c => c.uid === 'lib_2');

  let zoneChangedCount = 0;
  const unsub = gameEvents.on('zoneChanged', () => { zoneChangedCount++; });

  const ctx = { state, controllerKey: 'player', api: api(state, zones), targetInfo: { _kind: 'libraryCard', uid: 'lib_2' }, sourceCard: { name: 'Demonic Tutor' } };
  registry.resolve('tutor', ctx, {});

  unsub();

  assert.equal(state.player.hand.length, 1, 'BUG I : exactement une carte doit arriver en main.');
  const inHand = state.player.hand[0];
  assert.equal(inHand.name, 'Black Lotus', 'La bonne carte ciblée doit être celle mise en main.');
  assert.notEqual(inHand.uid, originalCard.uid, "BUG I : la carte déplacée en main doit recevoir une NOUVELLE identité (uid) via ZoneManager.move -- un simple splice/push conserve l'ancien uid, ce qui casse l'identité d'objet MTG.");
  assert.equal(inHand.previousUid, 'lib_2', "BUG I : ZoneManager.move doit tracer l'ancienne identité (previousUid) pour l'historique de zone.");
  assert.equal(zoneChangedCount, 1, "BUG I : un vrai changement de zone doit émettre 'zoneChanged' exactement une fois (jamais émis par l'ancien splice/push direct).");
  assert.ok(!state.player.library.some(c => c.uid === 'lib_2'), 'La carte doit avoir quitté la bibliothèque.');

  console.log('OK V12.72: tutor (atomic-effects.js, handler réellement actif) route via ZoneManager.move -- identité canonique préservée.');
}
