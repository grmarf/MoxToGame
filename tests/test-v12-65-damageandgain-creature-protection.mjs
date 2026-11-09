import assert from 'node:assert/strict';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
installEffects(effects, globalThis); game.connect();
// v12.73 : Psionic Blast inflige désormais 4 à la cible et 2 à son lanceur (effet damageAndSelfDamage).
// Le handler générique `damageAndGain` (X dégâts + gain de vie) reste couvert ici avec une carte
// synthétique reprenant l'ancienne définition (aucune carte réelle ne l'utilise plus).
const card = name => name === 'Psionic Blast'
  ? { ...CARDS.find(c => c.name === name), effect: { type: 'damageAndGain', amount: 4, gain: 4, target: 'anyTarget' } }
  : CARDS.find(c => c.name === name);
function mana(side) { game.state[side].mana = { W: 10, U: 10, B: 10, R: 10, G: 10, C: 10 }; }
function setup() {
  game.turnManager.gotoPhase('main1'); game.turnManager.activePlayer = 'player'; game.state.activePlayer = 'player'; game.state.priorityHolder = 'player';
  for (const s of ['player', 'ai']) { mana(s); game.state[s].battlefield = []; game.state[s].graveyard = []; game.state[s].hand = []; game.state[s].life = 20; }
}
function resolve() { while (game.stack.size) { const p = game.state.priorityHolder; game.dispatch('PASS_PRIORITY', {}, p); if (game.stack.size) { const q = p === 'player' ? 'ai' : 'player'; game.dispatch('PASS_PRIORITY', {}, q); } } }

// BUG-02 (suite) : le handler `damageAndGain` (Psionic Blast, seule carte à
// l'utiliser) avait sa branche "cible joueur" déjà correctement câblée sur
// `applyDamageToPlayer` (fix trouvé déjà présent, auteur non identifié dans
// les rapports). Sa branche "cible créature", en revanche, ne vérifie
// toujours pas la protection contre la couleur de la source avant
// d'appliquer les dégâts marqués -- contrairement à ses effets voisins
// `damageAllCreaturesAndPlayers` et `damageToFliersAndPlayers`, qui le font
// déjà correctement via `hasProtectionFromColors` + `effectiveTypes`.

// 1. Une créature SANS protection subit bien les dégâts (cas nominal).
setup();
const bear = { uid: 'q_bear1', objectId: 'q_bear1_obj', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'ai', controller: 'ai', keywords: [], color: ['G'], tapped: false, summoningSickness: false, damageMarked: 0, tempBuffs: [] };
game.state.ai.battlefield = [bear];
const blast1 = card('Psionic Blast');
game.state.player.hand = [blast1];
game.dispatch('CAST_SPELL', { card: blast1, target: { kind: 'permanent', uid: bear.uid } }, 'player');
resolve();
assert.equal(bear.damageMarked, 4, 'Sans protection, la créature doit subir les 4 dégâts de Psionic Blast.');
console.log('OK V12.65.1: damageAndGain inflige bien les dégâts sur une créature sans protection.');

// 2. Une créature AVEC protection contre le bleu (couleur de Psionic Blast)
// ne doit subir AUCUN dégât marqué.
setup();
const protectedBear = { uid: 'q_bear2', objectId: 'q_bear2_obj', name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, owner: 'ai', controller: 'ai', keywords: ['protectionU'], color: ['G'], tapped: false, summoningSickness: false, damageMarked: 0, tempBuffs: [] };
game.state.ai.battlefield = [protectedBear];
const blast2 = card('Psionic Blast');
game.state.player.hand = [blast2];
game.dispatch('CAST_SPELL', { card: blast2, target: { kind: 'permanent', uid: protectedBear.uid } }, 'player');
resolve();
assert.equal(protectedBear.damageMarked, 0, 'Une créature avec protection contre le bleu ne doit subir aucun dégât de Psionic Blast.');
console.log('OK V12.65.2: damageAndGain respecte la protection contre la couleur de la source sur une créature.');
