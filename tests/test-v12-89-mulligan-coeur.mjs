import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { rngClock } from '../src/core/rng-clock-service.js';
import { mulliganSide, putOnBottom } from '../src/core/mulligan.js';
import CARDS from '../src/data/cards-database.js';
import { instrumentState, violations } from './lib/zone-guard.mjs';

// v12.73 — le mulligan vit dans le cœur (ZoneManager), plus dans l'UI : il est testable sans navigateur,
// reproductible à graine fixe, et ne réécrit plus directement hand/library.

const deck = () => CARDS.filter(c => !c.isToken && c.cost !== undefined).slice(0, 40).map(c => ({ ...c }));
function newGame(seed) {
  rngClock.configure({ seed });
  const g = new GameFacade().connect();
  g.engine.loadDeck('player', deck(), 7);
  return g;
}
const names = (a) => a.map(c => c.name).sort().join('|');

try {
  // 1. Un mulligan : nouvelle main de 7, aucune carte perdue ni dupliquée, sous surveillance du garde-fou.
  {
    const g = newGame(11);
    const before = names([...g.state.player.hand, ...g.state.player.library]);
    assert.equal(g.state.player.hand.length, 7);
    instrumentState(g.state);
    mulliganSide(g, 'player');
    const after = names([...g.state.player.hand, ...g.state.player.library]);
    assert.equal(g.state.player.hand.length, 7, 'Nouvelle main de 7 cartes.');
    assert.equal(g.state.player.library.length, 33, 'La bibliothèque garde 33 cartes.');
    assert.equal(after, before, 'Aucune carte perdue ni dupliquée.');
    assert.deepEqual([...violations.keys()], [], 'Aucune écriture de zone hors ZoneManager : ' + [...violations.keys()].join(' | '));
    console.log('OK V12.89.1: mulligan via ZoneManager, 40 cartes conservées, aucune écriture directe.');
  }
  // 2. Reproductible : même graine -> même nouvelle main.
  {
    const a = newGame(5); mulliganSide(a, 'player'); const ha = a.state.player.hand.map(c => c.name).join('|');
    const b = newGame(5); mulliganSide(b, 'player'); const hb = b.state.player.hand.map(c => c.name).join('|');
    assert.equal(ha, hb, 'Même graine : même main après mulligan.');
    const c = newGame(6); mulliganSide(c, 'player');
    assert.notEqual(c.state.player.hand.map(x => x.name).join('|'), ha, 'Graine différente : main différente.');
    console.log('OK V12.89.2: mulligan reproductible à graine fixe.');
  }
  // 3. Règle de Londres : les cartes renvoyées vont AU FOND (dernières à piocher).
  {
    const g = newGame(3);
    mulliganSide(g, 'player');
    const hand = g.state.player.hand, toBottom = hand.slice(0, 2).map(c => c.name);
    putOnBottom(g, 'player', hand.slice(0, 2));
    assert.equal(g.state.player.hand.length, 5, 'La main passe à 5 cartes.');
    const lib = g.state.player.library;
    assert.equal(lib.length, 35);
    assert.deepEqual(lib.slice(0, 2).map(c => c.name).sort(), [...toBottom].sort(), 'Les 2 cartes sont au fond de la bibliothèque.');
    console.log('OK V12.89.3: putOnBottom place les cartes au fond (règle de Londres).');
  }
} finally { rngClock.configure({ seed: null }); }
