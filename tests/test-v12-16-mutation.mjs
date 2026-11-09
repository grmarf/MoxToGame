import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);
game.connect();

function findCard(name) { return CARDS.find(c => c.name === name); }

function setupGame() {
  game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
  game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));
  game.turnManager.gotoPhase('main1');
  game.turnManager.activePlayer = 'player';
  game.state.activePlayer = 'player';
  game.state.priorityHolder = 'player';
}

function giveMana(side) {
  game.state[side].mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
}

function resolveStack() {
  const ctrl = game.state.priorityHolder;
  const opp = ctrl === 'player' ? 'ai' : 'player';
  game.dispatch('PASS_PRIORITY', {}, ctrl);
  if (game.stack.size > 0) {
    game.dispatch('PASS_PRIORITY', {}, opp);
  }
}

// ── M2: Healing Salve amount 3 -> 5 ──
{
  setupGame();
  giveMana('player');
  const salve = findCard('Healing Salve');
  const originalAmount = salve.effect.amount;
  // Mutation
  salve.effect.amount = 5;
  game.state.player.hand = [salve];
  game.state.player.life = 10;
  game.dispatch('CAST_SPELL', { card: salve }, 'player');
  resolveStack();
  const expected = 15;
  if (game.state.player.life !== expected) {
    console.error(`M2 MUTATION ÉCHEC: PV=${game.state.player.life}, attendu ${expected}`);
    salve.effect.amount = originalAmount;
    process.exit(1);
  }
  console.log(`M2 MUTATION OK: Healing Salve amount=${salve.effect.amount} -> PV=${game.state.player.life}`);
  salve.effect.amount = originalAmount;
}

// Vérification restauration
{
  setupGame();
  giveMana('player');
  const salve = findCard('Healing Salve');
  game.state.player.hand = [salve];
  game.state.player.life = 10;
  game.dispatch('CAST_SPELL', { card: salve }, 'player');
  resolveStack();
  if (game.state.player.life !== 13) {
    console.error(`M2 RESTAURATION ÉCHEC: PV=${game.state.player.life}, attendu 13`);
    process.exit(1);
  }
  console.log('M2 RESTAURATION OK: Healing Salve 10 -> 13');
}

// ── M5: Icy Manipulator tap: true -> false ──
{
  setupGame();
  giveMana('player');
  const icy = { ...findCard('Icy Manipulator'), uid: 'icy_mut', objectId: 'icy_mut_obj' };
  const targetPerm = { uid: 'm5_tgt', name: 'Gray Ogre', power: 2, toughness: 2, type: 'Creature', controller: 'ai', owner: 'ai', tapped: false, summoningSickness: false, keywords: [], color: ['R'], tempBuffs: [] };
  game.state.ai.battlefield = [targetPerm];
  game.state.player.battlefield = [icy];
  game.state.player.hand = [];

  // Mutation: inverser l'effet tap
  const originalEffect = icy.activated[0].effect;
  icy.activated[0].effect = { type: 'tapTarget', tap: false }; // ne devrait pas engager

  game.dispatch('ACTIVATE_ABILITY', { permanent: icy, abilityIndex: 0, ability: icy.activated[0], target: { kind: 'permanent', perm: targetPerm, uid: targetPerm.uid } }, 'player');
  resolveStack();

  const resolved = game.state.ai.battlefield.find(p => p.uid === targetPerm.uid);
  if (resolved?.tapped) {
    console.error('M5 MUTATION ÉCHEC: cible engagée malgré tap=false');
    icy.activated[0].effect = originalEffect;
    process.exit(1);
  }
  console.log('M5 MUTATION OK: Icy Manipulator tap=false ne engage pas');
  icy.activated[0].effect = originalEffect;
}

// Vérification restauration
{
  setupGame();
  giveMana('player');
  const icy = { ...findCard('Icy Manipulator'), uid: 'icy_mut', objectId: 'icy_mut_obj' };
  const targetPerm = { uid: 'm5_tgt2', name: 'Gray Ogre', power: 2, toughness: 2, type: 'Creature', controller: 'ai', owner: 'ai', tapped: false, summoningSickness: false, keywords: [], color: ['R'], tempBuffs: [] };
  game.state.ai.battlefield = [targetPerm];
  game.state.player.battlefield = [icy];
  game.state.player.hand = [];
  game.dispatch('ACTIVATE_ABILITY', { permanent: icy, abilityIndex: 0, ability: icy.activated[0], target: { kind: 'permanent', perm: targetPerm, uid: targetPerm.uid } }, 'player');
  resolveStack();
  const resolved = game.state.ai.battlefield.find(p => p.uid === targetPerm.uid);
  if (!resolved?.tapped) {
    console.error('M5 RESTAURATION ÉCHEC: cible non engagée');
    process.exit(1);
  }
  console.log('M5 RESTAURATION OK: Icy Manipulator engage cible');
}

console.log('\nOK MUTATIONS V12.16: M2 + M5 vérifiés.');
