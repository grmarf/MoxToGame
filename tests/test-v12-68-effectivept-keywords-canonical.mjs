import assert from 'node:assert/strict';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import { effectivePowerToughness, effectiveKeywords as canonicalEffectiveKeywords } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

// BUGS B et C (audit v12.66) : ctx.api.effectivePT et ctx.api.effectiveKeywords
// (buildApi, stack.js) étaient des doublons appauvris -- effectivePT ne
// comptait que perm.auraBuffs (ignorait les marqueurs +1/+1 et les couches
// 1-7), effectiveKeywords rejouait sa propre logique d'aura ad hoc au lieu
// du pipeline canonique utilisé par combat.js (calculateCharacteristics via
// effectivePowerToughness/effectiveKeywords de continuous-effects.js).
// Exploitable notamment par Swords to Plowshares (lifegainFromPower lit
// ctx.api.effectivePT et sous-évaluait le gain de vie sur une créature
// boostée par un marqueur +1/+1).
//
// Méthodologie : on enregistre un effet-sonde qui capture ctx.api tel que
// réellement construit par le stack pendant une résolution, puis on
// compare ses résultats à la référence canonique -- pas un mock, le vrai
// #buildApi(state) du moteur, via le vrai chemin CAST_SPELL -> stack.

installEffects(effects, globalThis);
game.connect();

let captured = null;
effects.register('testProbeBC', (ctx) => {
  const target = ctx.api.findPermanent(ctx.targetInfo.uid);
  captured = {
    pt: ctx.api.effectivePT(target),
    keywords: ctx.api.effectiveKeywords(target),
  };
});

function setupGame() {
  game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
  game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));
  game.turnManager.gotoPhase('main1');
  game.turnManager.activePlayer = 'player';
  game.state.activePlayer = 'player';
  game.state.priorityHolder = 'player';
}
function giveMana(side) { game.state[side].mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 }; }
function resolveStack() {
  const ctrl = game.state.priorityHolder;
  const opp = ctrl === 'player' ? 'ai' : 'player';
  game.dispatch('PASS_PRIORITY', {}, ctrl);
  if (game.stack.size > 0) game.dispatch('PASS_PRIORITY', {}, opp);
}

{
  setupGame();
  giveMana('player');

  // Grizzly Bears 2/2 + 1 marqueur +1/+1 (doit devenir 3/3 pour effectivePT).
  const bear = {
    uid: 'probe_bear', name: 'Grizzly Bears', power: 2, toughness: 2, type: 'Creature',
    controller: 'player', owner: 'player', tapped: false, summoningSickness: false,
    keywords: [], color: ['G'], tempBuffs: [], auraBuffs: [], counters: [{ type: '+1/+1' }],
  };
  // Aura qui accorde 'flying' -- doit apparaître dans effectiveKeywords via
  // le même mécanisme (isAura/attachedTo/auraEffect) que le pipeline canonique.
  const aura = {
    uid: 'probe_aura', name: 'Sonde Aura', type: 'Enchantment — Aura',
    controller: 'player', owner: 'player', isAura: true, attachedTo: 'probe_bear',
    auraEffect: { type: 'addKeyword', keyword: 'flying' },
  };
  game.state.player.battlefield = [bear, aura];

  const probeCard = { name: 'Sonde Test B/C', cost: '{W}', cmc: 1, color: ['W'], type: 'Instant', effect: { type: 'testProbeBC', target: 'creature' } };
  game.state.player.hand = [probeCard];
  game.dispatch('CAST_SPELL', { card: probeCard, target: { kind: 'permanent', perm: bear, uid: bear.uid } }, 'player');
  resolveStack();

  assert.ok(captured, 'La sonde doit avoir capturé ctx.api pendant la résolution.');

  const refPT = effectivePowerToughness(game.state, bear);
  const refKw = canonicalEffectiveKeywords(game.state, bear);

  assert.deepEqual(captured.pt, refPT, 'BUG B : ctx.api.effectivePT doit correspondre à la référence canonique (calculateCharacteristics).');
  assert.equal(captured.pt.power, 3, 'BUG B : le marqueur +1/+1 doit porter la force à 3 (2/2 de base).');
  assert.equal(captured.pt.toughness, 3, 'BUG B : le marqueur +1/+1 doit porter l’endurance à 3.');

  assert.deepEqual([...captured.keywords].sort(), [...refKw].sort(), 'BUG C : ctx.api.effectiveKeywords doit correspondre à la référence canonique.');
  assert.ok(captured.keywords.includes('flying'), 'BUG C : le vol accordé par l’Aura doit apparaître dans ctx.api.effectiveKeywords.');

  console.log('OK V12.68: ctx.api.effectivePT/effectiveKeywords (stack.js) délèguent au pipeline canonique state-aware.');
}
