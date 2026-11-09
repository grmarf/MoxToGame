import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { gameEvents } from '../src/core/event-bus.js';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerC81Effects } from '../src/core/effects/choice-effects.js';
import { ZoneManager } from '../src/core/zone-manager.js';
import CARDS from '../src/data/cards-database.js';

// v12.72 — chemin unique pour les ZONES. Chaque objet qui change de zone passe par
// ZoneManager (identité + événement 'zoneChanged' + remplacements). Trois trous réels :
//  (1) un sort résolu/contrecarré quitte la pile SANS événement (repli direct dans le cimetière) ;
//  (2) un changement de contrôle déplace le permanent entre les tableaux à la main ;
//  (3) les continuations Mind Bomb / searchLibrary retirent la carte de sa zone AVANT
//      zones.move -> « Objet introuvable » et la carte disparaît du jeu.

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const lib = (p, n) => Array.from({ length: n }, (_, i) => land(p, i));
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
function capture(type) { const seen = []; const off = gameEvents.on(type, (e) => seen.push(e)); return { seen, off }; }

// 1. Sort résolu : la carte passe de la pile au cimetière via ZoneManager (événement + identité).
{
  const g = newGame();
  const { seen, off } = capture('zoneChanged');
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; mana(g, 'player', { R: 1 });
  g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player');
  pass(g);
  off?.();
  const ev = seen.find(e => e.to === 'graveyard' && e.object?.name === 'Lightning Bolt');
  assert.ok(ev, 'Un sort résolu doit émettre zoneChanged (pile -> cimetière).');
  assert.equal(ev.from, 'stack', "Provenance = 'stack'.");
  const gy = g.state.player.graveyard.filter(c => c.name === 'Lightning Bolt');
  assert.equal(gy.length, 1, 'Exactement un exemplaire au cimetière.');
  assert.ok(gy[0].objectId && gy[0].zone === 'graveyard', 'Identité + zone posées.');
  console.log('OK V12.85.1: sort résolu -> zoneChanged(stack -> graveyard).');
}

// 2. Sort contrecarré : même chemin.
{
  const g = newGame();
  const { seen, off } = capture('zoneChanged');
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; mana(g, 'player', { R: 1 });
  const cs = card('Counterspell', { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [cs]; mana(g, 'ai', { U: 2 });
  g.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' }, xValue: 0 }, 'player');
  const item = g.stack.items[g.stack.items.length - 1];
  g.dispatch('CAST_SPELL', { card: cs, target: { kind: 'stackItem', id: item.id }, xValue: 0 }, 'ai');
  for (let i = 0; i < 6 && g.stack.items.length; i++) pass(g, 1);
  off?.();
  const ev = seen.find(e => e.to === 'graveyard' && e.object?.name === 'Lightning Bolt');
  assert.ok(ev, 'Un sort contrecarré doit émettre zoneChanged.');
  assert.equal(ev.from, 'stack');
  assert.equal(g.state.player.graveyard.filter(c => c.name === 'Lightning Bolt').length, 1);
  // BUG Q (v12.72) : Counterspell ne contrait RIEN en partie réelle (handler counterSpell ne lisait
  // que `_kind`, or le moteur normalise la cible en `kind`) : Bolt résolvait et un test qui ne
  // regarde que le cimetière passait à vide. On exige donc le vrai effet : aucun dégât subi.
  assert.equal(g.state.ai.life, 20, 'Counterspell doit VRAIMENT contrer Lightning Bolt (0 dégât).');
  assert.equal(ev.reason, 'countered', "Raison de déplacement = 'countered' (pas une résolution).");
  assert.ok(g.state.ai.graveyard.some(c => c.name === 'Counterspell'), 'Counterspell finit aussi au cimetière.');
  console.log('OK V12.85.2: sort contrecarré -> zoneChanged(stack -> graveyard), et Counterspell contre réellement.');
}

// 3. Changement de contrôle : identité conservée (même uid), événement, aucune copie.
{
  const g = newGame();
  const { seen, off } = capture('controlChanged');
  const victim = bear('ai'); g.state.ai.battlefield = [victim];
  const cm = card('Control Magic', { owner: 'player', controller: 'player' });
  g.state.player.hand = [cm]; mana(g, 'player', { U: 4 });
  g.dispatch('CAST_SPELL', { card: cm, target: { kind: 'permanent', id: victim.uid, uid: victim.uid }, xValue: 0 }, 'player');
  pass(g);
  off?.();
  assert.equal(g.state.ai.battlefield.some(p => p.uid === victim.uid), false, "La créature quitte le champ de l'IA.");
  const stolen = g.state.player.battlefield.filter(p => p.uid === victim.uid);
  assert.equal(stolen.length, 1, 'La créature est sur le champ du joueur, une seule fois, avec le même uid.');
  assert.equal(stolen[0].controller, 'player');
  assert.ok(seen.some(e => e.permanent?.uid === victim.uid && e.to === 'player' && e.from === 'ai'), "'controlChanged' émis (ai -> player).");
  console.log('OK V12.85.3: Control Magic passe par le chemin unique de changement de contrôle.');
}

// 4. Mind Bomb en partie réelle : les cartes défaussées vont AU CIMETIÈRE (plus de disparition).
{
  const g = newGame();
  const mb = card('Mind Bomb', { owner: 'player', controller: 'player' });
  const h = [land('px', 1), land('px', 2), land('px', 3)];
  g.state.player.hand = [mb, ...h]; g.state.ai.hand = [land('ax', 1)];
  mana(g, 'player', { U: 3 });
  g.dispatch('CAST_SPELL', { card: mb, target: null, xValue: 0 }, 'player');
  pass(g);
  let guard = 0;
  while (g.choices.getPending() && guard++ < 6) {
    const p = g.choices.getPending();
    g.choices.resolve(p.options.slice(0, p.max)); // le joueur défausse 3 cartes ; l'IA sa seule carte (choix 0-ou-1)
    pass(g, 1);
  }
  const gy = g.state.player.graveyard.map(c => c.name);
  for (const n of ['pxLand1', 'pxLand2', 'pxLand3']) assert.equal(gy.filter(x => x === n).length, 1, `${n} doit être au cimetière exactement une fois (pas perdue).`);
  assert.equal(g.state.player.hand.length, 0);
  assert.equal(g.state.ai.graveyard.filter(c => c.name === 'aiLand1' || c.name === 'axLand1').length, 1, "L'IA défausse sa seule carte (choix 0-ou-1) : elle est au cimetière.");
  assert.equal(g.state.ai.life, 18, 'Mind Bomb : 3 - 1 défaussée = 2 blessures à l\'IA.');
  assert.equal(g.state.player.life, 20, 'Mind Bomb : 3 défaussées = 0 blessure au joueur.');
  console.log('OK V12.85.4: Mind Bomb défausse réellement au cimetière.');
}

// 5. searchLibrary : la carte choisie arrive en main exactement une fois, la bibliothèque perd une carte.
{
  const registry = new EffectRegistry(); registerC81Effects(registry);
  const state = { turnNumber: 1,
    player: { life: 20, library: [], hand: [], battlefield: [], graveyard: [], exile: [], mana: {} },
    ai: { life: 20, library: [], hand: [], battlefield: [], graveyard: [], exile: [], mana: {} } };
  const zones = new ZoneManager({ state: () => state });
  state.player.library = [{ uid: 'c1', name: 'A', type: 'Instant' }, { uid: 'c2', name: 'B', type: 'Instant' }, { uid: 'c3', name: 'C', type: 'Instant' }];
  const api = { zones, log() {}, shuffle() {}, choose: (spec) => spec.options.find(o => o.uid === 'c2'), state };
  registry.resolve('searchLibrary', { state, controllerKey: 'player', sourceCard: { name: 'Tuteur' }, api, targetInfo: null }, { type: 'searchLibrary' });
  assert.equal(state.player.hand.filter(c => c.name === 'B').length, 1, 'B arrive en main exactement une fois.');
  assert.equal(state.player.library.length, 2, 'La bibliothèque a perdu exactement une carte.');
  console.log('OK V12.85.5: searchLibrary déplace la carte par ZoneManager sans la perdre.');
}

// 6. Remove Soul (même handler counterSpell) : contre un sort de créature, pas un éclair.
{
  const g = newGame();
  const bears = card('Grizzly Bears', { owner: 'player', controller: 'player' });
  const rs = card('Remove Soul', { owner: 'ai', controller: 'ai' });
  g.state.player.hand = [bears]; mana(g, 'player', { G: 1, C: 1 });
  g.state.ai.hand = [rs]; mana(g, 'ai', { U: 2 });
  g.dispatch('CAST_SPELL', { card: bears, target: null, xValue: 0 }, 'player');
  g.dispatch('CAST_SPELL', { card: rs, target: { kind: 'stackItem', id: g.stack.items.at(-1).id }, xValue: 0 }, 'ai');
  for (let i = 0; i < 6 && g.stack.items.length; i++) pass(g, 1);
  assert.equal(g.state.player.battlefield.some(p => p.name === 'Grizzly Bears'), false, 'Remove Soul contre le sort de créature.');
  assert.equal(g.state.player.graveyard.filter(c => c.name === 'Grizzly Bears').length, 1, 'La créature contrée est au cimetière (une fois).');
  console.log('OK V12.85.6: Remove Soul contre réellement un sort de créature.');
}
