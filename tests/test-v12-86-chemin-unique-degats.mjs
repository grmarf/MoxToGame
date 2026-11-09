import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

// v12.72 — chemin unique pour les DÉGÂTS. Tout dégât à un joueur ou à une créature doit
// traverser ReplacementService (boucliers de prévention, protection, remplacements).
// Contournements réels corrigés : dégâts d'entretien (Force of Nature), Pestilence
// (damageAllCreaturesAndPlayers), Hurricane (damageToFliersAndPlayers) et Psionic Blast
// (damageAndGain) sur créatures : ils écrivaient `damageMarked` / `life` à la main.
// Méthode : un bouclier de prévention géant est posé ; si le dégât passe par le chemin
// canonique, il n'a AUCUN effet ; sinon la créature ou le joueur est touché.

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const lib = (p, n) => Array.from({ length: n }, (_, i) => land(p, i));
const flier = (o) => ({ uid: `fly_${o}`, name: 'Serra Angel', type: 'Creature', subtype: 'Angel', power: 4, toughness: 4, color: ['W'], owner: o, controller: o, zone: 'battlefield', cmc: 5, keywords: ['flying'] });
const bear = (o) => ({ uid: `bear_${o}`, name: 'Grizzly Bears', type: 'Creature', subtype: 'Bear', power: 2, toughness: 2, color: ['G'], owner: o, controller: o, zone: 'battlefield', cmc: 2, keywords: [] });
function newGame() {
  const g = new GameFacade().connect();
  g.state.player.library = lib('p', 12); g.state.ai.library = lib('a', 12);
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  return g;
}
const pass = (g, n = 2) => { for (let i = 0; i < n; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const mana = (g, side, m) => { g.state[side].mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ...m }; };
const shield = (g, side) => g.replacements.addPreventionShield(side, { amount: 99, persistent: true, scope: 'controllerAndCreatures' });
const perm = (g, side, uid) => g.state[side].battlefield.find(p => p.uid === uid);

// 1. Hurricane (X=2) : joueurs ET créatures volantes protégés par le bouclier.
{
  const g = newGame();
  g.state.ai.battlefield = [flier('ai')]; shield(g, 'ai');
  const h = card('Hurricane', { owner: 'player', controller: 'player' });
  g.state.player.hand = [h]; mana(g, 'player', { G: 3 });
  g.dispatch('CAST_SPELL', { card: h, target: null, xValue: 2 }, 'player');
  pass(g);
  assert.equal(g.state.ai.life, 20, 'Hurricane : le joueur protégé ne perd rien.');
  assert.ok(perm(g, 'ai', 'fly_ai'), 'Hurricane : la créature protégée est toujours en jeu.');
  assert.equal(perm(g, 'ai', 'fly_ai').damageMarked || 0, 0, 'Hurricane : la créature protégée ne reçoit aucun dégât.');
  console.log('OK V12.86.1: Hurricane respecte la prévention sur les créatures.');
}
// 1b. Sans bouclier : la créature reçoit bien les dégâts (garde-fou contre un test trivial).
{
  const g = newGame();
  g.state.ai.battlefield = [flier('ai')];
  const h = card('Hurricane', { owner: 'player', controller: 'player' });
  g.state.player.hand = [h]; mana(g, 'player', { G: 3 });
  g.dispatch('CAST_SPELL', { card: h, target: null, xValue: 2 }, 'player');
  pass(g);
  assert.equal(g.state.ai.life, 18, 'Hurricane sans bouclier : 2 dégâts au joueur.');
  assert.equal(perm(g, 'ai', 'fly_ai').damageMarked, 2, 'Hurricane sans bouclier : 2 dégâts marqués.');
  console.log('OK V12.86.1b: Hurricane inflige normalement sans prévention.');
}

// 2. Psionic Blast sur une créature protégée : aucun dégât marqué.
{
  const g = newGame();
  g.state.ai.battlefield = [bear('ai')]; shield(g, 'ai');
  const p = card('Psionic Blast', { owner: 'player', controller: 'player' });
  g.state.player.hand = [p]; mana(g, 'player', { U: 1, C: 2 });
  g.dispatch('CAST_SPELL', { card: p, target: { kind: 'permanent', id: 'bear_ai', uid: 'bear_ai' }, xValue: 0 }, 'player');
  pass(g);
  assert.equal(perm(g, 'ai', 'bear_ai')?.damageMarked || 0, 0, 'Psionic Blast : dégâts prévenus sur la créature protégée.');
  assert.ok(perm(g, 'ai', 'bear_ai'), 'La créature protégée survit.');
  console.log('OK V12.86.2: Psionic Blast respecte la prévention sur créature.');
}

// 3. Force of Nature : dégâts d'entretien (8) prévenus par un bouclier ; sinon 8 dégâts.
for (const [label, withShield, expected] of [['avec bouclier', true, 20], ['sans bouclier', false, 12]]) {
  const g = newGame();
  const fon = createPermanent({ ...card('Force of Nature'), owner: 'player', controller: 'player' });
  // Entrée par ZoneManager : émet permanentEntered, ce qui enregistre les déclencheurs (comme en partie réelle).
  g.zones.enterBattlefield(fon, 'player', { controller: 'player', reason: 'test' });
  if (withShield) shield(g, 'player');
  mana(g, 'player', {});
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player';
  g.turnManager.gotoPhase('untap'); g.turnManager.nextPhase(); // -> entretien : émet upkeepStarted
  let guard = 0;
  while ((g.choices.getPending() || g.stack.items.length) && guard++ < 8) {
    const p = g.choices.getPending();
    if (p) g.choices.resolve(p.max === 1 ? p.defaultValue : p.options.slice(0, p.min));
    else pass(g, 1);
  }
  assert.equal(g.state.player.life, expected, `Force of Nature ${label} : vie attendue ${expected}.`);
  console.log(`OK V12.86.3 (${label}): dégâts d'entretien via le chemin canonique.`);
}

// 3b. damageAllCreaturesAndPlayers (Pestilence) : joueurs ET créatures protégés par le bouclier.
{
  const g = newGame();
  g.state.ai.battlefield = [bear('ai')]; shield(g, 'ai');
  const sp = { uid: 'pestSpell', name: 'Pestilence-test', type: 'Sorcery', color: ['B'], cost: '{B}', owner: 'player', controller: 'player', effect: { type: 'damageAllCreaturesAndPlayers', amount: 2 } };
  g.state.player.hand = [sp]; mana(g, 'player', { B: 1 });
  g.dispatch('CAST_SPELL', { card: sp, target: null, xValue: 0 }, 'player');
  pass(g);
  assert.equal(g.state.ai.life, 20, 'damageAll : joueur protégé intact.');
  assert.ok(perm(g, 'ai', 'bear_ai'), 'damageAll : la créature protégée SURVIT (une 2/2 meurt si le dégât passe).');
  assert.equal(perm(g, 'ai', 'bear_ai').damageMarked || 0, 0, 'damageAll : créature protégée sans dégât.');
  assert.equal(g.state.player.life, 18, "damageAll : l'autre joueur (non protégé) subit 2.");
  console.log('OK V12.86.3b: damageAllCreaturesAndPlayers respecte la prévention.');
}

// 4. Sans ReplacementService (harnais minimal) : le repli de l'API de pile APPLIQUE les dégâts
// (avant : résultat fictif sans effet -> créature et joueur intacts).
{
  const { StackController } = await import('../src/core/stack.js');
  const { EffectRegistry } = await import('../src/core/effect-registry.js');
  const { registerAtomicEffects } = await import('../src/core/effects/atomic-effects.js');
  const state = { turnNumber: 1, activePlayer: 'player',
    player: { life: 20, hand: [], battlefield: [], graveyard: [], exile: [], library: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } },
    ai: { life: 20, hand: [], battlefield: [bear('ai')], graveyard: [], exile: [], library: [], mana: { W:0,U:0,B:0,R:0,G:0,C:0 } } };
  const effects = new EffectRegistry(); registerAtomicEffects(effects);
  const stack = new StackController({ state: () => state, effects });
  const pest = { ...card('Pestilence'), uid: 'pest', name: 'Pestilence', color: ['B'] };
  stack.pushSpell({ uid: 's', name: 'Test', type: 'Sorcery', color: ['B'], owner: 'player', effect: { type: 'damageAllCreaturesAndPlayers', amount: 1 } }, 'player', null);
  stack.resolveTop();
  assert.equal(state.player.life, 19, 'Repli : le joueur perd 1 PV.');
  assert.equal(state.ai.life, 19, "Repli : l'IA perd 1 PV.");
  assert.equal(state.ai.battlefield[0].damageMarked, 1, 'Repli : la créature reçoit 1 dégât marqué.');
  console.log('OK V12.86.4: repli sans ReplacementService applique réellement les dégâts.');
}
