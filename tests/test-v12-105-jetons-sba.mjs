// V12.76 — Règle 704.5d : un jeton qui quitte le champ de bataille cesse d'exister.
// Défaut trouvé par le banc IA-vs-IA (graine 807) : l'action d'état filtrait sur `isToken`, champ que personne ne pose ;
// les jetons du gestionnaire createToken actif portent `token` + `isTokenPermanent`. Un Soldat d'Icatian Town mort au combat
// restait au cimetière (invariant I4). Le défaut existait avant le lot G2.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { CombatService } from '../src/core/combat.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, n); return c; };
let seq = 0;
function newGame() { const g = new GameFacade().connect(); g.state.ai.library = []; g.state.player.library = []; g.state.turnNumber = 6; return g; }
function put(g, side, base, extra = {}) {
  const p = { ...by(base), uid: `${base}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, ...extra };
  g.state[side].battlefield.push(p); return p;
}
const SOLDIER = { name: 'Soldier', token: true, isTokenPermanent: true, power: 1, toughness: 1, type: 'Creature' };

// 1. Mort au combat (cas de la graine 807) : ni cimetière, ni champ de bataille.
{
  const g = newGame(); g.state.activePlayer = 'ai';
  const tok = put(g, 'ai', 'Gray Ogre', SOLDIER); const blk = put(g, 'player', 'Hill Giant');
  const c = new CombatService({ state: () => g.state, sba: g.stateBasedActions }); c.begin();
  c.confirmAttackers([tok], 'ai'); c.assignBlockers({ [tok.uid]: [blk.uid] }); c.resolveDamage();
  g.stateBasedActions.check(g.state);
  assert.deepEqual(g.state.ai.battlefield.map((p) => p.name), [], 'le jeton est mort');
  assert.deepEqual(g.state.ai.graveyard.map((p) => p.name), [], 'jeton mort au combat : aucun cimetière');
}
// 2. Les trois marqueurs de jeton sont reconnus dans toutes les zones hors champ de bataille ; une vraie carte reste.
for (const marker of [{ token: true }, { isToken: true }, { isTokenPermanent: true }]) {
  for (const zone of ['hand', 'graveyard', 'exile']) {
    const g = newGame();
    g.state.player[zone].push({ ...by('Gray Ogre'), uid: `tok${++seq}`, ...marker, zone });
    g.state.player[zone].push({ ...by('Gray Ogre'), uid: `real${++seq}`, zone });
    g.stateBasedActions.check(g.state);
    assert.equal(g.state.player[zone].length, 1, `${JSON.stringify(marker)} dans ${zone} : le jeton disparaît`);
    assert.ok(g.state.player[zone][0].uid.startsWith('real'), `${zone} : la vraie carte reste`);
  }
}
console.log('test-v12-105 OK');
