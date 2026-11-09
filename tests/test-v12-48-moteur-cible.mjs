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
const add = (g, name, side = 'player') => {
  const p = createPermanent({...card(name)});
  p.controller = side;
  p.owner = side;
  g.state[side].battlefield.push(p);
  return p;
};
const resolve = g => g.dispatch('resolveStack', {}, 'player');
const activate = (g, permanent, abilityIndex = 0, target = null) => {
  g.action('activateAbility', {
    permanent,
    controller: 'player',
    abilityIndex,
    target
  });
  resolve(g);
};
const cast = (g, c, target = null) => {
  g.state.player.hand = [c];
  g.dispatch('CAST_SPELL', {card:c, target}, 'player');
};

{
  // Bug 1 — Deathgrip: real green spell is removed from stack and goes to
  // its controller's graveyard; a non-green spell remains untouched.
  const g = setup();
  const deathgrip = add(g, 'Deathgrip');
  const green = {
    name: 'Test Green Spell',
    type: 'Instant',
    color: ['G'],
    cost: '{G}',
    effect: {type:'damage', amount:1, target:'player'},
    sets: []
  };
  cast(g, green, {kind:'player', side:'player'});
  assert.equal(g.stack.items.length, 1);
  g.state.priorityHolder = 'player';
  activate(g, deathgrip, 0, {kind:'stackItem', id:g.stack.items[0].id});
  assert.equal(g.stack.items.length, 0);
  assert.ok(g.state.player.graveyard.some(c => c.name === 'Test Green Spell'));

  const red = {
    name: 'Test Red Spell',
    type: 'Instant',
    color: ['R'],
    cost: '{R}',
    effect: {type:'damage', amount:1, target:'player'},
    sets: []
  };
  g.state.priorityHolder = 'player';
  cast(g, red, {kind:'player', side:'player'});
  const redId = g.stack.items[0].id;
  g.state.priorityHolder = 'player';
  activate(g, deathgrip, 0, {kind:'stackItem', id:redId});
  assert.ok(g.stack.items.some(i => i.id === redId), 'Deathgrip ne doit pas affecter un sort rouge');
  // Let the untouched red spell resolve so the test stays on a real dispatch path.
  g.state.priorityHolder = 'player';
  resolve(g);
  assert.ok(!g.stack.items.some(i => i.id === redId));
}

{
  // Bug 2 — self-regeneration: all six named cards have their real activated
  // regeneration ability and the source itself receives the shield.
  const specs = [
    ['Drudge Skeletons', '{B}', 1],
    ['Wall of Bone', '{B}', 4],
    ["Will-o'-the-Wisp", '{B}', 1],
    ['Uthden Troll', '{R}', 2],
    ['Clay Statue', '{2}', 1],
    ['Diabolic Machine', '{3}', 4],
  ];
  for (const [name, cost, toughness] of specs) {
    const g = setup();
    const p = add(g, name);
    const manaColor = cost.includes('B') ? 'B' : cost.includes('R') ? 'R' : 'C';
    if (manaColor === 'C') g.state.player.mana.C = 20;
    activate(g, p);
    assert.equal(p.regenShield, true, `${name}: activation doit créer le bouclier`);
    if (/Artifact/.test(p.type)) {
      const destroyer = card('Shatter');
      g.state.player.hand = [destroyer];
      g.state.priorityHolder = 'player';
      g.dispatch('CAST_SPELL', {card: destroyer, target: {kind:'permanent', uid:p.uid}}, 'player');
      resolve(g);
    } else {
      // V12.76 (G20) : Terror interdit la régénération (Oracle) -> on détruit par blessures létales (actions d'état).
      p.damageMarked = 99; g.stack.sba.check(g.state);
    }
    assert.ok(g.state.player.battlefield.some(x => x.uid === p.uid), `${name}: doit survivre à la destruction`);
    assert.equal(p.regenShield, false, `${name}: le bouclier doit être consommé`);
    assert.equal(p.damageMarked || 0, 0, `${name}: les blessures doivent être retirées`);
    assert.equal(p.tapped, true, `${name}: la régénération doit engager la créature`);
  }
}

{
  // Bug 3 — Circle of Protection: Artifacts: one artifact-source damage is
  // prevented; the one-shot shield is then consumed, and non-artifact damage
  // is not prevented.
  const g = setup();
  const circle = add(g, 'Circle of Protection: Artifacts');
  const artifactSource = add(g, "Aladdin's Ring");
  g.state.player.mana.C = 20;
  activate(g, circle);
  assert.equal(g.state.player.prevention.length, 1);
  assert.equal(g.state.player.prevention[0].sourceType, 'Artifact');

  const before = g.state.player.life;
  g.state.priorityHolder = 'player';
  activate(g, artifactSource, 0, {kind:'player', side:'player'});
  assert.equal(g.state.player.life, before, 'les blessures de la source artefact doivent être prévenues');
  assert.equal(g.state.player.prevention.length, 0, 'le bouclier est consommé après la prochaine source artefact');

  // Rod is tapped after activation; use a real non-artifact spell for the
  // second half of the filter test.
  const bolt = {
    name: 'Test Red Spell',
    type: 'Instant',
    color: ['R'],
    cost: '{R}',
    effect: {type:'damage', amount:2, target:'player'},
    sets: []
  };
  g.state.priorityHolder = 'player';
  cast(g, bolt, {kind:'player', side:'player'});
  resolve(g);
  assert.equal(g.state.player.life, before - 2, 'une source non-artefact ne doit pas être prévenue');
}

{
  // Non-regression — explicit target still wins over the implicit source.
  const g = setup();
  const source = add(g, 'Death Ward');
  const target = add(g, 'Grizzly Bears');
  cast(g, card('Death Ward'), {kind:'permanent', uid:target.uid});
  resolve(g);
  assert.equal(target.regenShield, true);
  assert.equal(source.regenShield, undefined);
}

for (const name of [
  'Deathgrip', 'Drudge Skeletons', 'Wall of Bone', "Will-o'-the-Wisp",
  'Uthden Troll', 'Clay Statue', 'Diabolic Machine',
  'Circle of Protection: Artifacts'
]) assert.equal(card(name).effectStatus, 'implemented', `${name} doit être certifiée implemented`);

console.log('OK V12.48: 3 correctifs moteur + 6 régénérations self + Circle Artifacts + non-régression cible explicite.');
