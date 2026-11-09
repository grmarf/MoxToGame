import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';
import { ChoiceService } from '../src/core/choice-service.js';
import { StackController } from '../src/core/stack.js';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { ReplacementService } from '../src/core/replacement-effects.js';
import { registerUpkeepCostEffects } from '../src/core/effects/upkeep-cost-effects.js';
import { registerC81Effects } from '../src/core/effects/choice-effects.js';
import { registerC86C87Effects } from '../src/core/effects/token-historical-effects.js';

function card(name) {
  const found = CARDS.find(c => c.name === name);
  assert.ok(found, `Carte absente de la base: ${name}`);
  return found;
}

function makeHarness() {
  const state = {
    turnNumber: 1,
    activePlayer: 'player',
    player: { life: 20, hand: [], battlefield: [], graveyard: [], library: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } },
    ai: { life: 20, hand: [], battlefield: [], graveyard: [], library: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } },
  };
  const events = { emitted: [], emit(event) { this.emitted.push(event); } };
  const choices = new ChoiceService({ state: () => state, events });
  const replacements = new ReplacementService({ state: () => state, choiceService: choices });
  const effects = new EffectRegistry();
  registerUpkeepCostEffects(effects);
  registerC81Effects(effects);
  registerC86C87Effects(effects);
  const stack = new StackController({ state: () => state, effects, choiceService: choices, replacements });
  return { state, choices, effects, stack };
}

function makeHandCards(side, n, prefix) {
  return Array.from({ length: n }, (_, i) => ({ uid: `${prefix}-${side}-${i}`, name: `${prefix} ${i}`, type: 'Instant', zone: 'hand' }));
}

// 1. Mind Bomb : joueur A (5 cartes en main) défausse 3, joueur B (2 cartes) défausse ses 2.
{
  const h = makeHarness();
  h.state.player.hand = makeHandCards('player', 5, 'carte');
  h.state.ai.hand = makeHandCards('ai', 2, 'carte');
  const mindBomb = { ...card('Mind Bomb'), uid: 'mb-1', zone: 'stack' };
  const item = h.stack.pushSpell(mindBomb, 'player');
  h.stack.resolveTop();

  const playerPending = h.choices.getPending();
  assert.equal(playerPending.controller, 'player');
  assert.equal(playerPending.max, 3);
  const playerChoice = playerPending.options.slice(0, 3); // défausse 3 cartes
  h.choices.resolve(playerChoice);

  const aiPending = h.choices.getPending();
  assert.ok(aiPending, 'un second choix (IA) doit être en attente après la réponse du joueur');
  assert.equal(aiPending.controller, 'ai');
  assert.equal(aiPending.max, 2, 'la borne IA est limitée par sa main réelle (2 cartes), pas par le maximum de la carte (3)');
  const aiChoice = aiPending.options.slice(0, 2); // défausse ses 2 cartes
  h.choices.resolve(aiChoice);

  assert.equal(h.state.player.hand.length, 2, 'le joueur a bien défaussé 3 cartes sur 5');
  assert.equal(h.state.player.graveyard.length, 4, '3 cartes défaussées + Mind Bomb elle-même une fois résolue');
  assert.equal(h.state.ai.hand.length, 0, "l'IA a bien défaussé ses 2 cartes");
  assert.equal(h.state.ai.graveyard.length, 2);
  assert.equal(h.state.player.life, 20 - (3 - 3), 'joueur : 3 - 3 défaussées = 0 blessure');
  assert.equal(h.state.ai.life, 20 - (3 - 2), 'IA : 3 - 2 défaussées = 1 blessure');
  assert.ok(h.stack.isEmpty, 'la pile doit être vide une fois les deux choix résolus');
  console.log('OK: Mind Bomb — choix indépendants par joueur, défausse et blessures correctes.');
}

// 2. Mind Bomb : un joueur choisit de ne rien défausser -> subit le maximum de blessures.
{
  const h = makeHarness();
  h.state.player.hand = makeHandCards('player', 4, 'carte');
  h.state.ai.hand = makeHandCards('ai', 4, 'carte');
  const mindBomb = { ...card('Mind Bomb'), uid: 'mb-2', zone: 'stack' };
  h.stack.pushSpell(mindBomb, 'player');
  h.stack.resolveTop();
  h.choices.resolve([]); // joueur : 0 carte défaussée
  h.choices.resolve([]); // IA : 0 carte défaussée
  assert.equal(h.state.player.life, 20 - 3, '0 carte défaussée -> 3 blessures pleines');
  assert.equal(h.state.ai.life, 20 - 3);
  assert.equal(h.state.player.hand.length, 4, 'aucune carte défaussée');
  console.log('OK: Mind Bomb — refuser de défausser inflige le maximum de blessures.');
}

// 3. Mind Bomb : une valeur de choix invalide (plus de cartes que la main n'en contient) est rejetée.
{
  const h = makeHarness();
  h.state.player.hand = makeHandCards('player', 1, 'carte');
  h.state.ai.hand = makeHandCards('ai', 3, 'carte');
  const mindBomb = { ...card('Mind Bomb'), uid: 'mb-3', zone: 'stack' };
  h.stack.pushSpell(mindBomb, 'player');
  h.stack.resolveTop();
  const pending = h.choices.getPending();
  assert.equal(pending.max, 1, "la borne du joueur est limitée à sa vraie main (1 carte), pas au maximum de la carte (3)");
  assert.throws(
    () => h.choices.resolve(pending.options.concat(makeHandCards('player', 2, 'fantome'))),
    /Choix invalide/,
    'un choix dépassant la main réelle du joueur doit être rejeté, pas silencieusement tronqué'
  );
  console.log('OK: Mind Bomb — un choix hors bornes est rejeté par ChoiceService.');
}

// 4. Non-régression : sacrificeOrDamage (Lord of the Pit) inchangé, toujours géré par
// l'override de token-historical-effects.js (sacrifice la première créature trouvée
// ou inflige les dégâts s'il n'y en a pas), sans demander de choix supplémentaire.
{
  const h = makeHarness();
  const bear = { uid: 'bear-1', name: 'Grizzly Bears', type: 'Creature', battlefield: true };
  h.state.player.battlefield.push(bear);
  const source = { name: 'Lord of the Pit', uid: 'lotp-1' };
  const ctx = { state: h.state, controllerKey: 'player', sourceCard: source, api: h.stack.constructor ? null : null };
  // Utilise le vrai dispatch via le registre (comme les autres tests), pas un ctx fabriqué à la main :
  const item = h.stack.pushAbility(source, { type: 'sacrificeOrDamage', damage: 6 }, 'player');
  h.stack.resolveTop();
  assert.equal(h.choices.getPending(), null, "l'override token-historical ne pose pas de choix, comportement inchangé");
  assert.equal(h.state.player.battlefield.length, 0, 'la créature disponible a bien été sacrifiée automatiquement');
  assert.equal(h.state.player.life, 20, 'pas de blessures puisqu\'une créature était disponible à sacrifier');
  console.log('OK: sacrificeOrDamage (Lord of the Pit) — non-régression, override token-historical inchangé.');
}

// 5. Le handler sacrificeOrDamage corrigé de upkeep-cost-effects.js fonctionne de manière
// autonome (registre isolé, sans l'override de token-historical-effects.js) : il ne dépend
// plus de l'API inexistante ctx.api.decisions et pose bien un vrai choix au joueur.
{
  const state = {
    turnNumber: 1, activePlayer: 'player',
    player: { life: 20, battlefield: [{ uid: 'bear-2', name: 'Grizzly Bears', type: 'Creature' }], graveyard: [] },
    ai: { life: 20, battlefield: [], graveyard: [] },
  };
  const events = { emit() {} };
  const choices = new ChoiceService({ state: () => state, events });
  const effects = new EffectRegistry();
  registerUpkeepCostEffects(effects); // registre isolé : PAS de registerC86C87Effects ici
  const stack = new StackController({ state: () => state, effects, choiceService: choices });
  const source = { name: 'Carte Isolée Test', uid: 'iso-1' };
  stack.pushAbility(source, { type: 'sacrificeOrDamage', damage: 5 }, 'player');
  stack.resolveTop();

  const topPending = choices.getPending();
  assert.ok(topPending, 'le handler corrigé doit suspendre en attendant un choix humain');
  assert.equal(topPending.type, 'sacrificeOrDamage');
  assert.deepEqual(topPending.options, ['sacrifice', 'damage']);
  choices.resolve('sacrifice');

  const creaturePending = choices.getPending();
  assert.ok(creaturePending, 'un second choix (quelle créature) doit être en attente');
  assert.equal(creaturePending.type, 'chooseCreatureToSacrifice');
  choices.resolve(creaturePending.options[0]);

  assert.equal(state.player.battlefield.length, 0, 'la créature choisie a bien été sacrifiée');
  assert.equal(state.player.life, 20, 'aucune blessure : le joueur a choisi de sacrifier');
  console.log('OK: sacrificeOrDamage isolé — fonctionne sans dépendre de ctx.api.decisions (inexistant).');
}

// 6. Non-régression de la correction de StackController#resumeChoice : une suspension
// imbriquée (deuxième choix demandé depuis la continuation du premier) ne doit pas
// finaliser prématurément l'item de pile ni dupliquer la carte au cimetière.
{
  const h = makeHarness();
  h.state.player.hand = makeHandCards('player', 3, 'x');
  h.state.ai.hand = makeHandCards('ai', 3, 'x');
  const mindBomb = { ...card('Mind Bomb'), uid: 'mb-4', zone: 'stack' };
  h.stack.pushSpell(mindBomb, 'player');
  h.stack.resolveTop();
  h.choices.resolve([]); // 1er choix résolu -> ne doit PAS finaliser l'item tout de suite
  assert.equal(h.state.player.graveyard.filter(c => c.uid === 'mb-4').length, 0,
    "Mind Bomb ne doit pas encore être au cimetière : le second choix (IA) est toujours en attente");
  assert.ok(h.choices.getPending(), 'le second choix doit bien être en attente, pas perdu');
  h.choices.resolve([]); // 2e choix résolu -> finalisation réelle, une seule fois
  assert.equal(h.state.player.graveyard.filter(c => c.uid === 'mb-4').length, 1,
    'Mind Bomb doit apparaître exactement une fois au cimetière après la résolution complète');
  console.log('OK: StackController#resumeChoice — suspension imbriquée gérée sans finalisation prématurée ni doublon.');
}

console.log('OK: V12.45 Mind Bomb + nettoyage sacrificeOrDamage + correction suspension imbriquée.');
