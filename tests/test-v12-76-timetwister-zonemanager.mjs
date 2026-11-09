import assert from 'node:assert/strict';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerAtomicEffects } from '../src/core/effects/atomic-effects.js';
import { ZoneManager } from '../src/core/zone-manager.js';
import { gameEvents } from '../src/core/event-bus.js';

// BUG J (audit v12.66) : Timetwister ('wheel') déplaçait main/cimetière vers
// la bibliothèque puis piochait 7 cartes par push/pop direct : les cartes
// gardaient leur ancienne identité et aucun 'zoneChanged' n'était émis. Ce
// test vérifie que, pour des cartes identifiées, chaque carte déplacée reçoit
// une nouvelle identité et que les 7 pioches sont de vrais changements de zone.

const registry = new EffectRegistry();
registerAtomicEffects(registry);
const mkSide = (p, nHand, nGrave, nLib) => ({
  life: 20, battlefield: [], exile: [],
  hand: Array.from({ length: nHand }, (_, i) => ({ uid: `${p}h${i}`, name: `${p}-hand-${i}` })),
  graveyard: Array.from({ length: nGrave }, (_, i) => ({ uid: `${p}g${i}`, name: `${p}-grave-${i}` })),
  library: Array.from({ length: nLib }, (_, i) => ({ uid: `${p}l${i}`, name: `${p}-lib-${i}` })),
});
const state = { turnNumber: 1, player: mkSide('p', 2, 1, 10), ai: mkSide('a', 1, 2, 10) };
const zones = new ZoneManager({ state: () => state });
const oldUids = new Set(['ph0','ph1','pg0','ah0','ag0','ag1']);
let zoneChanged = 0;
const unsub = gameEvents.on('zoneChanged', () => { zoneChanged++; });

registry.resolve('wheel', { state, controllerKey: 'player', sourceCard: { name: 'Timetwister' },
  api: { state, zones, log() {}, shuffle: (a) => a } }, { type: 'wheel' });
unsub();

for (const side of ['player', 'ai']) {
  assert.equal(state[side].hand.length, 7, `BUG J : ${side} doit avoir 7 cartes en main.`);
  assert.equal(state[side].graveyard.length, 0, `${side} : cimetière vidé.`);
  assert.equal(state[side].library.length, side === 'player' ? 6 : 6, `${side} : 10 + main + cimetière - 7 = 6.`);
}
const everyCard = ['player', 'ai'].flatMap(side => [...state[side].hand, ...state[side].library, ...state[side].graveyard]);
const stale = everyCard.filter(c => oldUids.has(c.uid));
assert.equal(stale.length, 0, 'BUG J : aucune carte recyclée (main+cimetière) ne doit garder son ancienne identité (uid).');
assert.equal(everyCard.length, 3 + 3 + 20, 'Aucune carte ne doit être perdue ni dupliquée (26 au total).');
assert.ok(zoneChanged >= 6 + 14, `BUG J : chaque déplacement doit émettre 'zoneChanged' (6 recyclages + 14 pioches), reçu ${zoneChanged}.`);
console.log('OK V12.76: Timetwister route main/cimetière/pioche via ZoneManager (identité + zoneChanged).');
