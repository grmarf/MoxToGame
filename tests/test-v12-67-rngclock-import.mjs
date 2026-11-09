import assert from 'node:assert/strict';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerC81Effects } from '../src/core/effects/choice-effects.js';

// BUG E (audit v12.66) : `rngClock` était utilisé dans choice-effects.js
// (randomDiscard, coinFlip) sans jamais être importé -> ReferenceError
// garanti dès résolution. Cassait Hypnotic Specter (et tout effet de
// défausse/pile-ou-face aléatoire) dès que le handler était appelé.
// Ce test appelle directement le handler enregistré, sans passer par le
// trigger engine, pour isoler précisément la ligne fautive
// (`rngClock.random()`), comme la note méthodologique de
// test-v12-59 le fait pour les triggers.

const registry = new EffectRegistry();
registerC81Effects(registry);
const randomDiscard = (ctx, effect) => registry.resolve('randomDiscard', ctx, effect);

{
  // ctx minimal : une main de 3 cartes côté 'ai', ctx.api.discardCard capturé.
  const discarded = [];
  const ctx = {
    controllerKey: 'player',
    state: { ai: { hand: [{ uid: 'c1' }, { uid: 'c2' }, { uid: 'c3' }] } },
    api: { discardCard: (side, index) => discarded.push({ side, index }) },
  };

  // Avant le correctif, cet appel levait `ReferenceError: rngClock is not defined`.
  assert.doesNotThrow(
    () => randomDiscard(ctx, { target: 'opponent', amount: 1 }),
    'randomDiscard ne doit pas lever de ReferenceError sur rngClock.'
  );
  assert.equal(discarded.length, 1, 'randomDiscard doit défausser exactement 1 carte.');
  assert.equal(discarded[0].side, 'ai', 'randomDiscard doit cibler le côté adverse (target: opponent).');
  assert.ok(discarded[0].index >= 0 && discarded[0].index < 3, "L'index défaussé doit être valide dans la main.");
  console.log('OK V12.67: randomDiscard (choice-effects.js) résout sans ReferenceError — rngClock correctement importé.');
}
