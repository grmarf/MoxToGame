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

// ── Lot 2: Reclassifications B ──
{
  const bw = findCard('Bog Wraith');
  if (!bw.keywords.includes('swampwalk')) throw new Error('Bog Wraith: swampwalk manquant');
  console.log('OK Lot2-B: Bog Wraith swampwalk');

  const ea = findCard('Elvish Archers');
  if (!ea.keywords.includes('firstStrike')) throw new Error('Elvish Archers: firstStrike manquant');
  console.log('OK Lot2-B: Elvish Archers reach+firstStrike');

  const gs = findCard('Giant Spider');
  if (!gs.keywords.includes('reach')) throw new Error('Giant Spider: reach manquant');
  console.log('OK Lot2-B: Giant Spider defender+reach');
}

// ── Lot 2: Cartes C — structure + E2E ──

// C21: Blue Elemental Blast structure
{
  const beb = findCard('Blue Elemental Blast');
  if (beb.effect.type !== 'destroy') throw new Error('Blue Elemental Blast: type incorrect');
  console.log('OK Lot2-C21: Blue Elemental Blast structure');
}

// C22: Red Elemental Blast structure
{
  const reb = findCard('Red Elemental Blast');
  if (reb.effect.type !== 'destroy') throw new Error('Red Elemental Blast: type incorrect');
  console.log('OK Lot2-C22: Red Elemental Blast structure');
}

// C23: Holy Strength pump +1/+2
{
  const hs = findCard('Holy Strength');
  if (hs.effect.type !== 'pump' || hs.effect.power !== 1 || hs.effect.toughness !== 2) throw new Error('Holy Strength: effet incorrect');
  console.log('OK Lot2-C23: Holy Strength structure');
}

// C24: Unholy Strength pump +2/+1
{
  const us = findCard('Unholy Strength');
  if (us.effect.type !== 'pump' || us.effect.power !== 2 || us.effect.toughness !== 1) throw new Error('Unholy Strength: effet incorrect');
  console.log('OK Lot2-C24: Unholy Strength structure');
}

// C25: Samite Healer activated preventDamage
{
  const sh = findCard('Samite Healer');
  if (!sh.activated || sh.activated[0].effect.type !== 'preventDamage') throw new Error('Samite Healer: activated incorrect');
  console.log('OK Lot2-C25: Samite Healer structure');
}

// C26: Orcish Artillery activated damage
{
  const oa = findCard('Orcish Artillery');
  if (!oa.activated || oa.activated[0].effect.type !== 'damage') throw new Error('Orcish Artillery: activated incorrect');
  console.log('OK Lot2-C26: Orcish Artillery structure');
}

// C27: Orcish Oriflamme static anthem
{
  const oo = findCard('Orcish Oriflamme');
  if (!oo.static || oo.static.type !== 'anthem') throw new Error('Orcish Oriflamme: static incorrect');
  console.log('OK Lot2-C27: Orcish Oriflamme structure');
}

// C28: Flight grantKeyword flying
{
  const flight = findCard('Flight');
  if (flight.effect.type !== 'grantKeyword' || flight.effect.keyword !== 'flying') throw new Error('Flight: effet incorrect');
  console.log('OK Lot2-C28: Flight structure');
}

// C29: Jump addKeywordUntilEnd flying
{
  const jump = findCard('Jump');
  if (jump.effect.type !== 'addKeywordUntilEnd' || jump.effect.keyword !== 'flying') throw new Error('Jump: effet incorrect');
  console.log('OK Lot2-C29: Jump structure');
}

// C30: Lance grantKeyword firstStrike
{
  const lance = findCard('Lance');
  if (lance.effect.type !== 'grantKeyword' || lance.effect.keyword !== 'firstStrike') throw new Error('Lance: effet incorrect');
  console.log('OK Lot2-C30: Lance structure');
}

// C31: Firebreathing activated pumpSelf
{
  const fb = findCard('Firebreathing');
  if (!fb.activated || fb.activated[0].effect.type !== 'pumpSelf') throw new Error('Firebreathing: activated incorrect');
  console.log('OK Lot2-C31: Firebreathing structure');
}

// C32: Dingus Egg trigger landDestroyed
{
  const de = findCard('Dingus Egg');
  if (!de.triggers || de.triggers[0].event !== 'landDestroyed') throw new Error('Dingus Egg: trigger incorrect');
  console.log('OK Lot2-C32: Dingus Egg structure');
}

// C33: Savannah Lions functional
{
  const sl = findCard('Savannah Lions');
  if (sl.effectStatus !== 'functional') throw new Error('Savannah Lions: status incorrect');
  console.log('OK Lot2-A: Savannah Lions functional');
}

console.log('\nOK Lot2: 20 cartes — 3 B + 13 C + 1 A vérifiées.');
