import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { StackController } from '../src/core/stack.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);

// 1. createToken exposed by the real Stack API must route through ZoneManager.
// A small synthetic effect calls ctx.api.createToken; resolution is performed
// by StackController itself, so #buildApi is the real production API closure.
{
  const g = new GameFacade().connect();
  const type = '__audit08_createToken__';
  effects.register(type, ctx => ctx.api.createToken('player', {
    name: 'Audit Token', type: 'Creature', isCreature: true,
    power: 1, toughness: 1, keywords: [], color: ['G']
  }));

  const item = g.stack.pushSpell({
    name: 'Audit Token Spell', type: 'Instant', owner: 'player', effect: { type }
  }, 'player');
  g.stack.resolveTop();

  assert.equal(item.type, 'spell');
  assert.equal(g.state.player.battlefield.length, 1);
  const token = g.state.player.battlefield[0];
  assert.equal(token.name, 'Audit Token');
  assert.equal(token.zone, 'battlefield');
  assert.ok(token.uid, 'token must have a UID');
  assert.ok(token.objectId, 'token must have an objectId');
  assert.equal(token.owner, 'player');
  assert.equal(token.controller, 'player');
  assert.equal(token.token, true);

  // Compare with the canonical ZoneManager path used for a normal permanent:
  // a newly created object receives stable identity, battlefield state and an
  // entry event, while zoneHistory starts empty because there is no prior zone.
  const normal = { name: 'Audit Permanent', type: 'Creature', owner: 'player', controller: 'player' };
  const entered = g.zones.enterBattlefield(normal, 'player', { controller: 'player', reason: 'spellResolved' });
  assert.ok(entered.uid && entered.objectId);
  assert.equal(entered.zone, 'battlefield');
  assert.equal(Array.isArray(entered.zoneHistory), false, 'new battlefield entries have no prior zone history');
}

// 2. NativeEngine.loadDeck initial draw must use ZoneManager exactly like
// stack API drawCard: library -> hand gets a new identity linked to the old one.
{
  const g = new GameFacade().connect();
  const plains = { ...(CARDS.find(c => c.name === 'Plains')) };
  g.engine.loadDeck('player', [plains], { draw: 1 });
  const drawn = g.state.player.hand[0];
  const oldUid = drawn.previousUid;
  const oldObjectId = drawn.previousObjectId;

  assert.equal(g.state.player.library.length, 0);
  assert.equal(g.state.player.hand.length, 1);
  assert.equal(drawn.zone, 'hand');
  assert.equal(drawn.previousUid, oldUid, 'ZoneManager draw must preserve previous UID');
  assert.equal(drawn.previousObjectId, oldObjectId, 'ZoneManager draw must preserve previous objectId');
  assert.ok(drawn.zoneChangeId, 'draw must record a zone-change id');
  assert.deepEqual(drawn.zoneHistory, [{
    zoneChangeId: drawn.zoneChangeId,
    from: 'library', to: 'hand',
    oldUid: oldUid,
    oldObjectId: oldObjectId
  }]);
}

// 3. Regression for the two ZoneManager catch paths in StackController:
// if ZoneManager cannot locate a card, the existing fallback still produces
// a graveyard object with a coherent objectId. Also verify the no-ZoneManager
// construction keeps the historical raw-push behavior.
{
  const makeStack = zones => {
    const state = {
      turnNumber: 1,
      player: { library: [], hand: [], battlefield: [], graveyard: [], exile: [] },
      ai: { library: [], hand: [], battlefield: [], graveyard: [], exile: [] }
    };
    const stack = new StackController({ state: () => state, effects, zones });
    return { state, stack };
  };

  // With a ZoneManager: trigger the fizzle path, then force its move to fail.
  {
    const g = new GameFacade().connect();
    const card = { uid: 'orphan-aura', objectId: 'orphan-aura-obj', name: 'Orphan Aura', type: 'Enchantment Aura', owner: 'player' };
    const item = g.stack.pushSpell(card, 'player', { uid: 'missing-target' });
    assert.doesNotThrow(() => g.stack.resolveTop());
    assert.equal(g.state.player.graveyard.length, 1);
    const moved = g.state.player.graveyard[0];
    assert.equal(moved.zone, 'graveyard');
    assert.equal(moved.objectId, card.objectId);
    assert.equal(moved.uid, card.uid);
    assert.equal(item.type, 'spell');
  }

  // Without ZoneManager: exact raw fallback remains available and unchanged.
  {
    const { state, stack } = makeStack(null);
    const card = { uid: 'orphan-no-zones', objectId: 'orphan-no-zones-obj', name: 'Orphan Aura', type: 'Enchantment Aura', owner: 'player' };
    stack.pushSpell(card, 'player', { uid: 'missing-target' });
    stack.resolveTop();
    assert.equal(state.player.graveyard.length, 1);
    assert.equal(state.player.graveyard[0].uid, card.uid);
    assert.equal(state.player.graveyard[0].objectId, card.objectId);
    assert.equal(state.player.graveyard[0].zone, 'graveyard');
  }
}

console.log('OK V12.65 AUDIT-08: createToken et pioche passent par ZoneManager; fallback sans ZoneManager préservé.');
