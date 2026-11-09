import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

// BUG M (audit) -- Shahrazad :
//  M1. impossible à lancer : 'startSubgame' n'était pas dans la liste des effets
//      sans cible -> « Une cible est requise. » ;
//  M2. le sous-jeu ne se terminait jamais : SubgameManager.finish() n'était
//      appelé nulle part ; une défaite dans le sous-jeu était lue comme la fin de
//      la PARTIE PRINCIPALE ;
//  M3. règle de vie : le perdant PERD la moitié de ses PV arrondie au supérieur
//      (13 PV -> 6), l'ancien code laissait ceil(13/2)=7 ;
//  M4. Shahrazad elle-même disparaissait (ni pile, ni main, ni cimetière) ;
//  M5. sous-jeu nul : personne ne perd de vie.

const lib = (p, n) => Array.from({ length: n }, (_, i) => ({ uid: `${p}${i}`, name: `${p}Card${i}`, cmc: 0, type: 'Land', owner: p === 'p' ? 'player' : 'ai' }));
function start({ aiLife = 20, playerLife = 20 } = {}) {
  const g = new GameFacade().connect();
  const shz = { ...CARDS.find(c => c.name === 'Shahrazad'), uid: 'shz1', owner: 'player', controller: 'player' };
  g.state.player.library = lib('p', 10); g.state.ai.library = lib('a', 10);
  g.state.player.hand = [shz, { uid: 'keep', name: 'HandKeeper', type: 'Land', owner: 'player' }];
  g.state.player.life = playerLife; g.state.ai.life = aiLife;
  g.state.player.mana = { W: 5, U: 0, B: 0, R: 0, G: 0, C: 0 };
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.dispatch('CAST_SPELL', { card: shz, target: null, xValue: 0 }, 'player'); // M1 : ne doit pas lever
  for (let i = 0; i < 2; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  return g;
}

// M1 + démarrage : sous-jeu actif, bibliothèques seules, 20 PV chacun.
{
  const g = start({ aiLife: 13 });
  assert.equal(g.subgames.active, true, 'Le sous-jeu doit démarrer.');
  assert.equal(g.state.player.hand.length, 0, 'Sous-jeu : mains vides (rule 724.2, seules les bibliothèques y entrent).');
  assert.equal(g.state.player.library.length, 10);
  assert.equal(g.state.ai.life, 20, 'Sous-jeu : 20 PV chacun.');
  console.log('OK V12.78.1: Shahrazad se lance sans cible et démarre un sous-jeu isolé.');

  // M2 + M3 + M4 : l'IA perd le sous-jeu -> retour à la partie principale.
  g.state.ai.life = 0;
  g.dispatch('NEXT_PHASE', {}, g.state.activePlayer);
  assert.equal(g.subgames.active, false, 'BUG M2 : le sous-jeu doit se terminer quand un joueur y perd.');
  assert.equal(g.state.subgame, undefined, "L'état courant doit être la partie principale.");
  assert.equal(g.state.player.hasLost || g.state.ai.hasLost, false, 'BUG M2 : la partie principale ne doit pas être terminée.');
  assert.equal(g.state.ai.life, 6, 'BUG M3 : le perdant perd la moitié de ses PV arrondie au supérieur (13 -> 6).');
  assert.equal(g.state.player.life, 20, 'Le gagnant ne perd rien.');
  assert.deepEqual(g.state.player.hand.map(c => c.name), ['HandKeeper'], 'La main de la partie principale est restituée.');
  assert.equal(g.state.player.library.length, 10, 'Les bibliothèques principales sont restituées.');
  assert.deepEqual(g.state.player.graveyard.map(c => c.name), ['Shahrazad'], 'BUG M4 : Shahrazad doit finir au cimetière de son propriétaire.');
  assert.equal(g.stack.items.length, 0, 'La pile est vide.');
  console.log('OK V12.78.2: défaite dans le sous-jeu -> retour à la partie principale, PV du perdant divisés (13->6), Shahrazad au cimetière.');
}

// M2 (côté joueur) : c'est le joueur qui perd le sous-jeu, y compris par pioche impossible.
{
  const g = start({ playerLife: 9 });
  g.state.player.mustDraw = true; g.state.player.library = [];
  g.dispatch('NEXT_PHASE', {}, g.state.activePlayer);
  assert.equal(g.subgames.active, false, 'Perdre par pioche en bibliothèque vide dans le sous-jeu termine le sous-jeu.');
  assert.equal(g.state.player.life, 4, '9 PV : perd ceil(9/2)=5 -> 4.');
  assert.equal(g.state.player.hasLost, false);
  console.log('OK V12.78.3: défaite par pioche vide dans le sous-jeu gérée (9 -> 4 PV).');
}

// M5 : sous-jeu nul.
{
  const g = start({ aiLife: 15, playerLife: 11 });
  g.state.player.life = 0; g.state.ai.life = 0;
  g.dispatch('NEXT_PHASE', {}, g.state.activePlayer);
  assert.equal(g.subgames.active, false);
  assert.equal(g.state.player.life, 11, 'BUG M5 : sous-jeu nul, personne ne perd de PV.');
  assert.equal(g.state.ai.life, 15);
  assert.equal(g.state.subgameResult.draw, true);
  console.log('OK V12.78.4: sous-jeu nul -> aucune perte de vie.');
}
