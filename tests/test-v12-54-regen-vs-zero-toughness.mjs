import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => CARDS.find(c => c.name === name);
const setup = () => {
  const g = new GameFacade().connect();
  g.turnManager.gotoPhase('main1');
  g.turnManager.activePlayer = 'player';
  g.state.phase = 'main1';
  g.state.priorityHolder = 'player';
  g.state.activePlayer = 'player';
  g.state.player.mana = {W:20,U:20,B:20,R:20,G:20,C:20};
  g.state.ai.mana = {W:20,U:20,B:20,R:20,G:20,C:20};
  return g;
};
const add = (g, name = 'Grizzly Bears') => {
  const p = createPermanent({...card(name)});
  p.controller = 'player';
  p.owner = 'player';
  g.state.player.battlefield.push(p);
  return p;
};
const resolve = g => g.dispatch('RESOLVE_STACK', {}, 'player');
const fakeSpell = (effect, target) => ({
  name: 'Test Effect', type: 'Sorcery', color: ['R'], cost: '', effect, sets: [], keywords: []
});
const dispatchDamage = (g, target, amount) => {
  g.state.player.hand = [fakeSpell({type:'damage', amount, target:'creature'}, {kind:'permanent', uid:target.uid})];
  g.dispatch('CAST_SPELL', { card: g.state.player.hand[0], target:{kind:'permanent', uid:target.uid} }, 'player');
  resolve(g);
};
const dispatchSba = g => {
  const spell = fakeSpell({type:'damage', amount:0, target:'player'}, {kind:'player', side:'player'});
  g.state.player.hand = [spell];
  g.dispatch('CAST_SPELL', { card:spell, target:{kind:'player', side:'player'} }, 'player');
  resolve(g);
};

// 1 — lethal damage still consumes regeneration and saves the creature.
{
  const g = setup();
  const p = add(g);
  p.regenShield = true;
  dispatchDamage(g, p, 2);
  assert.ok(g.state.player.battlefield.some(x => x.uid === p.uid));
  assert.equal(p.regenShield, false);
  assert.equal(p.damageMarked, 0);
  assert.equal(p.tapped, true);
}

// 2 — zero toughness bypasses regeneration and the shield is not consumed.
{
  const g = setup();
  const p = add(g);
  p.regenShield = true;
  // Synthetic characteristic reduction: this isolates 704.5f without
  // relying on an unrelated counter-placement path.
  p.toughness = 0;
  dispatchSba(g);
  assert.ok(!g.state.player.battlefield.some(x => x.uid === p.uid));
  assert.ok(g.state.player.graveyard.some(x => x.previousUid === p.uid));
  // The SBA path does not consume a regeneration shield for 704.5f.
  assert.equal(p.regenShield, true);
}

// 3 — zero toughness plus marked damage is still an unconditional death.
{
  const g = setup();
  const p = add(g);
  p.regenShield = true;
  p.toughness = 0;
  p.damageMarked = 1;
  dispatchSba(g);
  assert.ok(!g.state.player.battlefield.some(x => x.uid === p.uid));
  assert.ok(g.state.player.graveyard.some(x => x.previousUid === p.uid));
}

console.log('OK V12.54: régénération vs endurance <= 0 — 704.5f séparé de 704.5g, non-régression dégâts létaux.');
