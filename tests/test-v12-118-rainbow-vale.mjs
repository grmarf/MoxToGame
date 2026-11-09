// V12.76 — Rainbow Vale (texte officiel : « {T} : ajoutez un mana de la couleur de votre choix. Un adversaire prend le contrôle de
// Rainbow Vale au début de la prochaine étape de fin. »). Parties réelles avec vraie progression des phases (nextPhase).
// Règles vérifiées : le contrôle change seulement si le terrain a été engagé POUR DU MANA ; l'état « engagé » est conservé ; ce n'est pas
// une entrée sur le champ de bataille (pas de landfall) ; une activation pendant l'étape de fin attend l'étape de fin SUIVANTE ;
// chaque activation crée son propre déclencheur différé ; le bénéficiaire est l'adversaire de celui qui a ACTIVÉ.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { gameEvents } from '../src/core/event-bus.js';
import { serializeState, deserializeState } from '../src/core/serialization.js';
import CARDS from '../src/data/cards-database.js';

const vale = CARDS.find((c) => c.name === 'Rainbow Vale');
assert.equal(vale.effectStatus, 'implemented');
const COLORS = ['W', 'U', 'B', 'R', 'G'];
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY();
  return g;
}
function put(g, side) {
  const uid = `Vale#${++seq}`;
  const p = { ...structuredClone(vale), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1 };
  g.state[side].battlefield.push(p); return p;
}
const where = (g, p) => ['player', 'ai'].find((s) => g.state[s].battlefield.some((x) => x.uid === p.uid)) || null;
const get = (g, p) => g.state[where(g, p)]?.battlefield.find((x) => x.uid === p.uid);
function tapForMana(g, p, side, color = 'G') {
  g.state.priorityHolder = side;
  g.action('activateAbility', { permanent: get(g, p), controller: side, abilityIndex: 0, target: null });
  g.choices.resolve(color);
}
const step = (g) => { g.turnManager.nextPhase(); for (let k = 0; k < 6 && g.stack.size > 0; k++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const toEndStep = (g, { skipCurrent = false } = {}) => { if (skipCurrent) step(g); for (let i = 0; i < 60 && g.state.phase !== 'endStep'; i++) step(g); assert.equal(g.state.phase, 'endStep'); };
const entered = []; const off = gameEvents.on('permanentEntered', (e) => entered.push(e));

// 1) Tapé pour du mana pendant mon tour : il reste à moi jusqu'à l'étape de fin, puis passe à l'adversaire, engagé, même identité.
{
  const g = newGame(); const v = put(g, 'player');
  tapForMana(g, v, 'player', 'G');
  assert.equal(g.state.player.mana.G, 1); assert.equal(where(g, v), 'player', 'pas de changement avant l\'étape de fin'); assert.ok(get(g, v).tapped);
  for (let i = 0; i < 60 && g.state.phase !== 'endStep'; i++) { assert.equal(where(g, v), 'player', `toujours à moi en phase ${g.state.phase}`); step(g); }
  assert.equal(g.state.phase, 'endStep');
  const before = entered.length;
  assert.equal(where(g, v), 'ai', "l'adversaire en prend le contrôle au début de l'étape de fin");
  assert.equal(get(g, v).controller, 'ai'); assert.equal(get(g, v).owner, 'player', 'le propriétaire ne change pas');
  assert.equal(get(g, v).uid, v.uid, 'même objet'); assert.ok(get(g, v).tapped, "l'état engagé est conservé");
  assert.equal(entered.length, before, 'ce n\'est pas une entrée sur le champ de bataille (pas de landfall)');
  assert.deepEqual(g.state.delayedControl, [], 'la liste différée est vidée');
  console.log("OK V12.76.118.1 : tapé pour du mana -> contrôle à l'adversaire au début de l'étape de fin (engagé, même objet, sans landfall).");
}
// 2) Jamais tapé pour du mana : aucun changement de contrôle, même après un tour complet et le suivant.
{
  const g = newGame(); const v = put(g, 'player');
  toEndStep(g); assert.equal(where(g, v), 'player'); toEndStep(g, { skipCurrent: true }); assert.equal(where(g, v), 'player', 'toujours à moi après deux étapes de fin');
  console.log('OK V12.76.118.2 : pas de mana tiré -> pas de changement de contrôle.');
}
// 3) Activée PENDANT l'étape de fin : elle attend l'étape de fin SUIVANTE (celle du tour adverse).
{
  const g = newGame(); const v = put(g, 'player');
  toEndStep(g); tapForMana(g, v, 'player', 'U');
  assert.equal(where(g, v), 'player', 'pas de transfert immédiat'); assert.deepEqual(g.state.delayedControl.map((d) => d.to), ['ai']);
  step(g); // nettoyage
  for (let i = 0; i < 60 && !(g.state.phase === 'main1' && g.state.activePlayer === 'ai'); i++) step(g);
  assert.equal(g.state.activePlayer, 'ai'); assert.equal(where(g, v), 'player', "toujours à moi pendant le tour de l'adversaire avant son étape de fin");
  toEndStep(g); assert.equal(where(g, v), 'ai', "transfert à l'étape de fin suivante");
  console.log("OK V12.76.118.3 : activée pendant l'étape de fin -> transfert à l'étape de fin suivante.");
}
// 4) Tapée pendant le tour ADVERSE : « la prochaine étape de fin » est la sienne.
{
  const g = newGame(); const v = put(g, 'player');
  g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; g.turnManager.gotoPhase('main1');
  tapForMana(g, v, 'player', 'R'); toEndStep(g);
  assert.equal(g.state.activePlayer, 'ai'); assert.equal(where(g, v), 'ai', "transfert à l'étape de fin du tour adverse");
  console.log("OK V12.76.118.4 : tapée pendant le tour adverse -> transfert à SA prochaine étape de fin.");
}
// 5) Deux activations dans le même tour (dégagée entre-temps) : deux déclencheurs, mais « un adversaire » = celui de l'ACTIVATEUR -> pas d'aller-retour.
{
  const g = newGame(); const v = put(g, 'player');
  tapForMana(g, v, 'player', 'G'); get(g, v).tapped = false; tapForMana(g, v, 'player', 'G');
  assert.equal(g.state.player.mana.G, 2); assert.equal(g.state.delayedControl.length, 2);
  toEndStep(g); assert.equal(where(g, v), 'ai', 'reste chez l\'adversaire (pas de retour)'); assert.deepEqual(g.state.delayedControl, []);
  console.log('OK V12.76.118.5 : deux activations -> deux déclencheurs, contrôle stable chez l\'adversaire.');
}
// 6) Disparu avant l'étape de fin : rien ne se passe, pas d'erreur.
{
  const g = newGame(); const v = put(g, 'player'); tapForMana(g, v, 'player', 'G');
  g.zones.moveToGraveyard(get(g, v)); assert.equal(where(g, v), null);
  toEndStep(g); assert.equal(where(g, v), null, 'ne revient pas'); assert.deepEqual(g.state.delayedControl, []);
  console.log("OK V12.76.118.6 : terrain détruit avant l'étape de fin -> aucun effet, aucune erreur.");
}
// 7) Symétrie : le Rainbow Vale de l'IA (tapé par l'IA) passe au joueur humain.
{
  const g = newGame(); const v = put(g, 'ai'); g.state.ai.mana = EMPTY();
  tapForMana(g, v, 'ai', 'B'); assert.equal(g.state.ai.mana.B, 1);
  toEndStep(g); assert.equal(where(g, v), 'player', "l'adversaire de l'IA (le joueur) en prend le contrôle");
  console.log("OK V12.76.118.7 : côté IA symétrique.");
}
// 8) Les cinq couleurs sont proposées (pas l'incolore), 1 seul mana, déjà engagé = refusé, et la liste différée survit à la sérialisation.
for (const color of COLORS) {
  const g = newGame(); const v = put(g, 'player');
  g.action('activateAbility', { permanent: get(g, v), controller: 'player', abilityIndex: 0, target: null });
  assert.deepEqual(g.choices.getPending().options, COLORS); assert.throws(() => g.choices.resolve('C'), /invalide/i);
  g.choices.resolve(color); assert.equal(g.state.player.mana[color], 1); assert.equal(Object.values(g.state.player.mana).reduce((a, b) => a + b, 0), 1);
  assert.throws(() => g.action('activateAbility', { permanent: get(g, v), controller: 'player', abilityIndex: 0, target: null }), /illégale|invalide/i, 'déjà engagé');
  if (color === 'G') assert.deepEqual(deserializeState(serializeState(g.state)).delayedControl, [{ uid: v.uid, to: 'ai', source: 'Rainbow Vale' }], 'sérialisation');
}
off();
console.log('OK V12.76.118.8 : cinq couleurs, 1 mana, pas de réactivation engagé, état sérialisable.');
