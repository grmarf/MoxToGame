import { withWindow } from './lib/timing.mjs';
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';
import { createPermanent } from '../src/core/card-runtime.js';
import { matchesTargetRestriction } from '../src/core/native-engine.js';

const EFFECT_TARGETS = [
  'anyCard', 'anyPermanent', 'anyTarget', 'artifact', 'artifactOrEnchantment',
  'attackingCreature', 'creature', 'creatureCardInGraveyard', 'creatureOrLand', // V12.76 (G19) : Fissure
 
  'creatureCardInOwnGraveyard', 'enchantment', 'land', 'opponent', // ('enchantedCreature' retiré en V12.76 G32 : Invisibility utilise désormais un mot-clé d'Aura)
  'opponentsArtifact', // V12.76 (G24) : Relic Bind
  'permanent', 'permanentOrSpell', // V12.75 : 'opponentsCreatures' retiré — Siren's Call n'a plus de cible (forceAttackAll)
  'player', 'self', 'spellOnStack',
];

const actualTargets = [...new Set(CARDS.map(c => c.effect?.target).filter(Boolean))].sort();
const expectedTargets = [...new Set(EFFECT_TARGETS)].sort();
assert.deepEqual(actualTargets, expectedTargets, 'V12.63: inventaire effect.target inattendu');

function findCard(name) {
  const card = CARDS.find(c => c.name === name);
  assert.ok(card, `Carte absente: ${name}`);
  return card;
}

function freshGame() {
  const game = new GameFacade().connect();
  for (const side of ['player', 'ai']) {
    game.state[side].life = 100;
    for (const color of ['W', 'U', 'B', 'R', 'G', 'C']) game.state[side].mana[color] = 50;
  }
  game.state.activePlayer = 'player';
  game.state.priorityHolder = 'player';
  game.turnManager.activePlayer = 'player';
  game.turnManager.phase = 'main1';
  return game;
}

function perm(cardName, side = 'ai') {
  const p = createPermanent(findCard(cardName));
  p.controller = side;
  p.owner = side;
  p.summoningSickness = false;
  return p;
}

function putPermanent(game, p) {
  game.state[p.controller || 'ai'].battlefield.push(p);
  return p;
}

function cast(game, cardName, target, controller = 'player', xValue = 1) {
  const card = findCard(cardName);
  game.engine.giveResponderPriority(controller);
  game.state[controller].hand.push(card);
  return withWindow({ turnManager: game.engine.turnManager, state: game.state }, card, controller, () => game.engine.action('cast', { card, controller, target, x: xValue })); // V12.76 (G29) : fenêtre de timing légale
}

function assertIllegal(fn, label) {
  assert.throws(fn, /Cible illégale\./, label);
}

// ── Explicit restriction categories, always using a real database card. ──
{
  const game = freshGame();
  const creature = putPermanent(game, perm('Grizzly Bears'));
  assert.doesNotThrow(() => cast(game, 'Holy Strength', { kind: 'permanent', uid: creature.uid }), 'creature: bonne cible acceptée');
  const badGame = freshGame();
  const land = putPermanent(badGame, perm('Plains'));
  assertIllegal(() => cast(badGame, 'Holy Strength', { kind: 'permanent', uid: land.uid }), 'creature: terrain rejeté');
}

{
  const game = freshGame();
  const land = putPermanent(game, perm('Plains'));
  assert.doesNotThrow(() => cast(game, 'Sinkhole', { kind: 'permanent', uid: land.uid }), 'land: terrain accepté');
  const badGame = freshGame();
  const creature = putPermanent(badGame, perm('Grizzly Bears'));
  assertIllegal(() => cast(badGame, 'Sinkhole', { kind: 'permanent', uid: creature.uid }), 'land: créature rejetée');
}

{
  const game = freshGame();
  const artifact = putPermanent(game, perm('Sol Ring'));
  assert.doesNotThrow(() => cast(game, 'Shatter', { kind: 'permanent', uid: artifact.uid }), 'artifact: artefact accepté');
  const badGame = freshGame();
  const creature = putPermanent(badGame, perm('Grizzly Bears'));
  assertIllegal(() => cast(badGame, 'Shatter', { kind: 'permanent', uid: creature.uid }), 'artifact: créature rejetée');
}

{
  const game = freshGame();
  const creature = putPermanent(game, perm('Grizzly Bears'));
  const land = putPermanent(game, perm('Plains'));
  assert.doesNotThrow(() => cast(game, 'Twiddle', { kind: 'permanent', uid: creature.uid }), 'anyPermanent: créature acceptée');
  assert.doesNotThrow(() => cast(game, 'Twiddle', { kind: 'permanent', uid: land.uid }), 'anyPermanent: terrain accepté');
}

{
  const game = freshGame();
  const creature = putPermanent(game, perm('Grizzly Bears'));
  assert.doesNotThrow(() => cast(game, 'Purelace', { kind: 'permanent', uid: creature.uid }), 'permanent: créature acceptée');
  const land = putPermanent(game, perm('Plains'));
  assert.doesNotThrow(() => cast(game, 'Purelace', { kind: 'permanent', uid: land.uid }), 'permanent: terrain accepté');
}

// attackingCreature — real card, real combat state.
{
  const game = freshGame();
  const attacker = putPermanent(game, perm('Grizzly Bears', 'player'));
  game.combat.confirmAttackers([attacker], 'player');
  assert.doesNotThrow(() => cast(game, 'Blaze of Glory', { kind: 'permanent', uid: attacker.uid }), 'attackingCreature: attaquante acceptée');

  const badGame = freshGame();
  const nonAttacker = putPermanent(badGame, perm('Grizzly Bears', 'player'));
  assertIllegal(() => cast(badGame, 'Blaze of Glory', { kind: 'permanent', uid: nonAttacker.uid }), 'attackingCreature: créature non attaquante rejetée');
}

// attackingOrBlockingCreature — real implemented ability, both combat roles.
{
  const game = freshGame();
  const attacker = putPermanent(game, perm('Grizzly Bears', 'ai'));
  const blocker = putPermanent(game, perm('Grizzly Bears', 'player'));
  const source = putPermanent(game, perm('Crimson Manticore', 'player'));
  game.state.activePlayer = 'ai';
  game.turnManager.activePlayer = 'ai';
  game.combat.confirmAttackers([attacker], 'ai');
  game.combat.assignBlockers({ [attacker.uid]: [blocker.uid] });
  game.state.priorityHolder = 'player';
  assert.doesNotThrow(() => game.engine.action('activateAbility', {
    permanent: source,
    controller: 'player',
    abilityIndex: 0,
    target: { kind: 'permanent', uid: attacker.uid },
  }), 'attackingOrBlockingCreature: attaquante acceptée');

  const game2 = freshGame();
  const attacker2 = putPermanent(game2, perm('Grizzly Bears', 'ai'));
  const blocker2 = putPermanent(game2, perm('Grizzly Bears', 'player'));
  const source2 = putPermanent(game2, perm('Crimson Manticore', 'player'));
  game2.state.activePlayer = 'ai';
  game2.turnManager.activePlayer = 'ai';
  game2.combat.confirmAttackers([attacker2], 'ai');
  game2.combat.assignBlockers({ [attacker2.uid]: [blocker2.uid] });
  game2.state.priorityHolder = 'player';
  assert.doesNotThrow(() => game2.engine.action('activateAbility', {
    permanent: source2,
    controller: 'player',
    abilityIndex: 0,
    target: { kind: 'permanent', uid: blocker2.uid },
  }), 'attackingOrBlockingCreature: bloqueuse acceptée');

  const badGame = freshGame();
  const badLand = putPermanent(badGame, perm('Plains', 'ai'));
  const badSource = putPermanent(badGame, perm('Crimson Manticore', 'player'));
  badGame.state.priorityHolder = 'player';
  assertIllegal(() => badGame.engine.action('activateAbility', {
    permanent: badSource,
    controller: 'player',
    abilityIndex: 0,
    target: { kind: 'permanent', uid: badLand.uid },
  }), 'attackingOrBlockingCreature: terrain rejeté');
}

// Effective characteristics: target validation must use the Layer-4 result,
// not the printed type. This synthetic continuous effect only exercises the
// characteristic pipeline; no card definition is changed.
{
  const game = freshGame();
  const rawCreature = putPermanent(game, perm('Grizzly Bears'));
  // The synthetic type effect is attached only after the baseline checks.
  // This assertion proves the matcher reads calculateCharacteristics rather than
  // matcher reads calculateCharacteristics rather than perm.type directly.
  assert.equal(matchesTargetRestriction(game.state, rawCreature, 'creature'), true);
  assert.equal(matchesTargetRestriction(game.state, rawCreature, 'land'), false);
  rawCreature.static = { type: 'changeType', newType: 'Artifact' };
  assert.equal(matchesTargetRestriction(game.state, rawCreature, 'artifact'), true);
  assert.equal(matchesTargetRestriction(game.state, rawCreature, 'creature'), false);
}

// ── Global regression: every implemented/functional card with effect.target. ──
const coveredCards = CARDS.filter(c => ['implemented', 'functional'].includes(c.effectStatus) && c.effect?.target);
const verifiedNames = [];

for (const card of coveredCards) {
  const game = freshGame();
  const target = card.effect.target;

  let targetInfo;
  switch (target) {
    case 'creature':
    case 'creatureOrLand': // V12.76 (G19) : Fissure (créature ou terrain) — cas « créature » ici ; le cas « terrain » est dans test-v12-130
    case 'enchantedCreature': {
      // v12.74 : `colorRestriction` (Blue / Red Elemental Blast) est désormais appliqué : on prépare une
      // créature de la couleur exigée (Hill Giant rouge, Sea Serpent bleu).
      const needed = card.effect.colorRestriction;
      // V12.76 (harnais) : `requireSubtype` « Wall » (Animate Wall : « Enchanter : mur ») -> on prépare un Mur.
      const name = card.effect.requireSubtype === 'Wall' ? 'Wall of Stone' : needed === 'R' ? 'Hill Giant' : needed === 'U' ? 'Sea Serpent' : 'Grizzly Bears';
      const p = putPermanent(game, perm(name, 'ai'));
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'land': {
      // V12.76 : `requireSubtype` (Goblin Caves : « Montagne ») — on prépare un terrain du sous-type exigé.
      const p = putPermanent(game, perm(card.effect.requireSubtype || 'Plains', 'ai'));
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'opponentsArtifact': // V12.76 (G24) : Relic Bind (artefact que contrôle l'adversaire)
    case 'artifact': {
      const p = putPermanent(game, perm('Sol Ring', 'ai'));
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'enchantment': { // V12.76 (harnais) : Feedback (« Enchanter : enchantement »)
      const p = putPermanent(game, perm('Circle of Protection: Red', 'ai'));
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'artifactOrEnchantment': {
      const p = putPermanent(game, perm('Sol Ring', 'ai'));
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'attackingCreature': {
      // V12.75 : Blaze of Glory (instantané) vise une créature ATTAQUANTE ; on déclare donc une attaque avant de lancer.
      const p = putPermanent(game, perm('Grizzly Bears', 'player'));
      game.state.activePlayer = 'player';
      game.turnManager.activePlayer = 'player';
      game.combat.confirmAttackers([p], 'player');
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'anyPermanent':
    case 'permanent': {
      const p = putPermanent(game, perm('Grizzly Bears', 'ai'));
      targetInfo = { kind: 'permanent', uid: p.uid };
      break;
    }
    case 'anyTarget': {
      targetInfo = { kind: 'player', side: 'ai', id: 'ai' };
      break;
    }
    case 'player': {
      targetInfo = { kind: 'player', side: 'ai', id: 'ai' };
      break;
    }
    case 'self': {
      targetInfo = { kind: 'player', side: 'player', id: 'player' };
      break;
    }
    case 'opponent': {
      targetInfo = { kind: 'player', side: 'ai', id: 'ai' };
      break;
    }
    case 'spellOnStack': {
      game.stack.pushSpell(findCard('Lightning Bolt'), 'ai');
      targetInfo = { kind: 'stackItem', id: game.stack.top.id };
      break;
    }
    case 'anyCard': {
      const c = { ...findCard('Grizzly Bears'), uid: `library-${card.id}`, objectId: `obj-${card.id}`, zone: 'library' };
      game.state.ai.library.push(c);
      targetInfo = { kind: 'libraryCard', uid: c.uid };
      break;
    }
    case 'creatureCardInOwnGraveyard':
    case 'creatureCardInGraveyard': {
      const c = { ...findCard('Grizzly Bears'), uid: `gy-${card.id}`, objectId: `gyobj-${card.id}`, zone: 'graveyard' };
      game.state.player.graveyard.push(c);
      targetInfo = { kind: 'graveyardCard', uid: c.uid };
      break;
    }
    default:
      throw new Error(`Global regression: cible non préparée: ${target} (${card.name})`);
  }

  game.state.player.hand.push(card);
  assert.doesNotThrow(
    () => withWindow({ turnManager: game.engine.turnManager, state: game.state }, card, 'player', () => game.engine.action('cast', { card, controller: 'player', target: targetInfo, x: 1 })), // V12.76 (G29)
    `Global regression: cible légale refusée pour ${card.name} [${target}]`
  );
  verifiedNames.push(`${card.name} [${target}]`);
}

console.log('  cartes ciblées couvertes :', coveredCards.length);
assert.equal(coveredCards.length, 116, 'Global regression: nombre de cartes implemented/functional ciblées inattendu (+3 du lot G29 v12.76 : Teleport, Rapid Fire, Berserk ; +5 du lot G28 v12.76 : Venom, Infinite Authority, Farrel\'s Mantle, Backfire, Power Leak ; +3 du lot G27 v12.76 : Consecrate Land, Farmstead, Goblin Shrine ; +7 du lot G26 v12.76 : Gaseous Form, Demonic Torment, Seeker, Brainwash, Artifact Ward, Spirit Shackle, Spectral Cloak ; +2 du lot G24 v12.76 : Artifact Possession, Relic Bind ; 39 + Lure, Tangle Kelp, Merseine du lot G2 v12.76 + Goblin Caves du lot G3 v12.76 + Inquisition du lot G4 v12.76 + Force Spike + Mana Drain v12.68 + Power Sink v12.73 + 7 Auras du lot B v12.75 + Boomerang, Desert Twister, Resurrection du lot D v12.75 + Storm Seeker, Jovial Evil, Eternal Flame, Crumble, Divine Offering, Great Defender du lot E v12.75 + Howl from Beyond, Fissure, Weakness, Giant Strength, Earthbind, Creature Bond, Guardian Angel, Royal Assassin, Northern Paladin du lot F1 v12.75 + Blaze of Glory, Purelace, Spell Blast, Warp Artifact du lot F2a v12.75 + Drain Power, Natural Selection du lot F2b v12.75 + Spirit Link du lot F3 v12.75) + 15 Auras du harnais v12.76 (Curse Artifact, Divine Transformation, Wild Growth, Firebreathing, Fishliver Oil, Animate Wall, Wanderlust, Cursed Land, Erosion, Feedback, Holy Armor, Blessing, The Brute, Regeneration, Unstable Mutation) + 2 Auras du lot G16 v12.76 (Psychic Venom, Blight)');

console.log('OK V12.63: inventaire effect.target exhaustif:', actualTargets.join(', '));
console.log('OK V12.63: restrictions creature/land/artifact/anyPermanent/permanent/attackingCreature/attackingOrBlockingCreature validées.');
console.log(`OK V12.63: régression globale — ${verifiedNames.length} cartes implemented/functional vérifiées individuellement.`);
for (const name of verifiedNames) console.log(`  - ${name}`);
