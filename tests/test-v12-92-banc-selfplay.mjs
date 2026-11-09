import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { gameEvents } from '../src/core/event-bus.js';
import { playGame } from '../src/sim/selfplay.js';
import { checkInvariants } from '../src/sim/invariants.js';
import { buildRandomPlayableDeck } from '../src/core/deck-builder.js';
import { rngClock } from '../src/core/rng-clock-service.js';
import CARDS from '../src/data/cards-database.js';

// v12.74 — banc IA-vs-IA. Quatre garanties :
//  A. Le détecteur d'invariants DÉTECTE bien chaque type de corruption (un banc qui ne peut pas échouer ne vaut rien).
//  B. Des parties complètes IA-vs-IA (graine fixe) ne violent AUCUN invariant, sans échec d'action, et se terminent.
//  C. Reproductibilité : même graine -> exactement la même partie (empreinte identique) ; autre graine -> autre partie.
//  D. Aucune fuite d'écouteurs sur le bus global entre deux parties (dispose()).

// 1..12 : tirage courant. 13, 32, 35, 36 : graines où le banc a d'abord trouvé des défauts rares
// (blocages illégaux contre volant / mur, créature à mana) — elles restent comme régressions.
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 32, 35, 36];

// ── A. Le détecteur attrape chaque corruption ───────────────────────────────
// V12.76 (G32) : les parties de contrôle de la section A étaient laissées CONNECTÉES au bus global d'événements : elles réagissaient aux événements des parties suivantes (B, C) et
// consommaient de l'aléa partagé selon leur propre état, ce qui rendait la section C (même graine = même partie) fragile dès qu'un déclencheur écoutait un événement répandu. On les libère.
const controlGames = [];
function loadedGame() {
  rngClock.configure({ seed: 99 });
  const g = new GameFacade().connect(); controlGames.push(g);
  const deck = () => buildRandomPlayableDeck(CARDS, { size: 40, basicCount: 17, rng: () => rngClock.random() });
  const d1 = deck(), d2 = deck();
  g.engine.loadDeck('player', d1); g.engine.loadDeck('ai', d2);
  rngClock.configure({ seed: null });
  return { g, ctx: { deckSize: { player: d1.length, ai: d2.length }, stable: true } };
}
{
  const { g, ctx } = loadedGame();
  assert.deepEqual(checkInvariants(g, ctx), [], 'Une partie saine n\'a aucune violation.');
  const cases = [
    ['I1', (g) => { g.state.player.hand.pop(); }],                                            // carte perdue
    ['I1', (g) => { g.state.player.graveyard.push({ ...g.state.player.hand[0] }); }],         // carte dupliquée
    ['I2', (g) => { g.state.player.graveyard.push(g.state.player.hand[0]); }],                // même objet dans deux zones
    ['I3', (g) => { g.state.player.hand[0].zone = 'graveyard'; }],                            // zone incohérente
    ['I4', (g) => { g.state.player.graveyard.push({ uid: 'tok', objectId: 'tok_o', name: 'Gobelin', type: 'Creature', token: true, owner: 'player', zone: 'graveyard' }); }],
    ['I5', (g) => { g.state.ai.battlefield.push({ uid: 'x', objectId: 'x_o', name: 'Voleur', type: 'Creature', owner: 'ai', controller: 'player', zone: 'battlefield', token: true, power: 1, toughness: 1 }); }],
    ['I6', (g) => { g.state.ai.life = NaN; }],
    ['I6', (g) => { g.state.player.mana.R = -1; }],
    ['I7', (g) => { g.state.ai.battlefield.push({ uid: 'b', objectId: 'b_o', name: 'Ours', type: 'Creature', owner: 'ai', controller: 'ai', zone: 'battlefield', token: true, power: 2, toughness: 2, damageMarked: 2 }); }],
    ['I7', (g) => { g.state.player.life = 0; }],
  ];
  for (const [code, corrupt] of cases) {
    const { g: g2, ctx: c2 } = loadedGame();
    corrupt(g2);
    const found = checkInvariants(g2, c2);
    assert.ok(found.some((m) => m.startsWith(code)), `Corruption ${code} non détectée : ${JSON.stringify(found)}`);
  }
  console.log(`OK V12.92.A: le détecteur attrape ${cases.length} corruptions (I1..I7).`);
}

for (const g of controlGames) g.dispose?.(); // fin de la section A : plus aucune partie de contrôle abonnée au bus

// ── B. Parties complètes sans violation ─────────────────────────────────────
{
  const bad = [];
  let turns = 0;
  for (const seed of SEEDS) {
    const r = playGame({ seed });
    turns += r.turns;
    if (r.violations.size) bad.push(`graine ${seed} : violations ${[...r.violations.keys()].join(' ; ')}`);
    if (r.softFailures.size) bad.push(`graine ${seed} : échecs d'action ${[...r.softFailures.keys()].join(' ; ')}`);
    if (r.endReason !== 'win') bad.push(`graine ${seed} : fin '${r.endReason}'`);
  }
  assert.deepEqual(bad, [], 'Banc IA-vs-IA :\n  ' + bad.join('\n  '));
  console.log(`OK V12.92.B: ${SEEDS.length} parties IA-vs-IA complètes (${(turns / SEEDS.length).toFixed(1)} tours en moyenne) : 0 violation, 0 échec d'action.`);
}

// ── C. Reproductibilité ─────────────────────────────────────────────────────
{
  const a = playGame({ seed: 7 }), b = playGame({ seed: 7 }), c = playGame({ seed: 8 });
  assert.equal(a.hash, b.hash, 'Même graine : empreinte identique.');
  assert.equal(a.trace.join(';'), b.trace.join(';'), 'Même graine : même suite d\'actions.');
  assert.equal(a.snapshot, b.snapshot, 'Même graine : même état final.');
  assert.notEqual(a.hash, c.hash, 'Graine différente : partie différente.');
  console.log('OK V12.92.C: une graine = une partie exactement reproductible.');
}

// ── D. Pas de fuite d'écouteurs entre parties ───────────────────────────────
{
  const count = () => [...gameEvents.listeners.values()].reduce((n, s) => n + s.size, 0);
  playGame({ seed: 3 });                // installe les règles globales (une fois pour toutes)
  const before = count();
  for (let i = 0; i < 3; i++) playGame({ seed: 20 + i });
  assert.equal(count(), before, 'Après 3 parties de plus, le nombre d\'écouteurs du bus global ne change pas.');
  console.log('OK V12.92.D: dispose() libère les écouteurs (aucune fuite entre parties).');
}
