import assert from 'node:assert/strict';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';

// BUG K (audit v12.66, découverte nouvelle) : permanent.chosenColor est
// écrit par changeColor/colorChange (complex-effects.js) et par la
// résolution de choix de couleur (choice-effects.js) -- utilisé
// concrètement par Purelace -- mais calculateCharacteristics ne le lisait
// JAMAIS : la couleur effective du permanent restait perpétuellement celle
// d'origine (permanent.color), rendant Purelace et tout futur effet de
// changement de couleur silencieusement no-op sur le jeu réel (protections,
// ciblage par couleur, etc. resteraient basés sur l'ancienne couleur).

const emptyState = { player: { battlefield: [] }, ai: { battlefield: [] } };

{
  const perm = { uid: 'p1', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, color: ['G'] };
  const before = calculateCharacteristics(emptyState, perm);
  assert.deepEqual(before.color, ['G'], 'Sans chosenColor, la couleur effective doit rester celle imprimée.');

  perm.chosenColor = 'U'; // Purelace : "devient bleue".
  const after = calculateCharacteristics(emptyState, perm);
  assert.deepEqual(after.color, ['U'], 'BUG K : chosenColor doit être lu par calculateCharacteristics et remplacer la couleur effective (G -> U).');
  assert.notDeepEqual(after.color, perm.color, "BUG K : la couleur effective doit différer de perm.color (l'objet original n'est pas muté, seule la couleur EFFECTIVE change) tant que chosenColor est actif.");

  console.log('OK V12.73: permanent.chosenColor (Purelace) est bien lu par calculateCharacteristics -- la couleur effective change réellement.');
}
