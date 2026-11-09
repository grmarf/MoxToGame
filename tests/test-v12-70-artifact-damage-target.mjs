import assert from 'node:assert/strict';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerC88Effects } from '../src/core/effects/final-pass-effects.js';

// BUG F (audit v12.66) : StackController#pushTrigger (stack.js) fixe
// toujours item.target=null pour un déclencheur, donc ctx.targetInfo est
// systématiquement null au moment où artifactDamage résout -- le handler
// d'origine cherchait sa cible via ctx.targetInfo (toujours null) au lieu
// de ctx.sourceCard.attachedTo (Warp Artifact est une Aura ; sourceCard =
// le permanent Warp Artifact lui-même, dont .attachedTo pointe vers
// l'artefact enchanté). De plus, le texte réel de la carte ("L'artefact
// enchanté perd 1 PV par tour" -- comprendre : son contrôleur perd 1 PV)
// inflige la perte à un JOUEUR, pas à l'artefact (le handler d'origine
// écrivait sur damageMarked d'un permanent, jamais sur une vie de joueur).
// Avant ce correctif, Warp Artifact se déclenchait (trigger OK, mission
// antérieure) mais ne faisait jamais de dégât réel : ce test verrouille le
// dégât réel, pas seulement le déclenchement.

const registry = new EffectRegistry();
registerC88Effects(registry);

{
  const artifact = { uid: 'black_lotus', name: 'Black Lotus', type: 'Artifact' };
  const warpArtifact = { uid: 'warp', name: 'Warp Artifact', type: 'Enchantment', isAura: true, attachedTo: 'black_lotus' };

  // L'artefact enchanté est contrôlé par 'ai' ; Warp Artifact par 'player'
  // (aura adverse) -- la perte de vie doit viser 'ai', le contrôleur de
  // l'artefact, pas 'player' (contrôleur de l'aura).
  const state = {
    player: { battlefield: [warpArtifact], life: 20 },
    ai: { battlefield: [artifact], life: 20 },
  };

  let appliedTo = null;
  const ctx = {
    state,
    sourceCard: warpArtifact,
    controllerKey: 'player',
    api: {
      applyDamageToPlayer: (side, amount, opts) => { appliedTo = { side, amount }; state[side].life -= amount; return { amount, prevented: 0, loss: amount }; },
    },
  };

  registry.resolve('artifactDamage', ctx, { type: 'artifactDamage', amount: 1, target: 'enchanted' });

  assert.ok(appliedTo, "BUG F : artifactDamage doit résoudre une cible réelle via ctx.sourceCard.attachedTo (plus jamais via ctx.targetInfo, toujours null pour un trigger).");
  assert.equal(appliedTo.side, 'ai', "BUG F : la perte de vie doit viser le contrôleur de l'artefact enchanté ('ai'), pas le contrôleur de l'Aura.");
  assert.equal(appliedTo.amount, 1, 'BUG F : le montant doit être celui défini par le déclencheur (1).');
  assert.equal(state.ai.life, 19, "BUG F : la vie du contrôleur de l'artefact enchanté doit effectivement baisser (20 -> 19).");
  assert.equal(state.player.life, 20, "BUG F : la vie du contrôleur de l'Aura ne doit pas être affectée.");

  console.log('OK V12.70: artifactDamage (Warp Artifact) inflige une réelle perte de vie au contrôleur de l’artefact enchanté.');
}
