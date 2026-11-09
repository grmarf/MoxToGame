import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';

function makeGame() {
  const game = new GameFacade();
  game.connect();
  return game;
}

function selfSacrificingPermanent(uid) {
  return {
    uid,
    objectId: `${uid}-obj`,
    name: 'Test Self-Sacrificer',
    type: 'Artifact',
    owner: 'player',
    controller: 'player',
    tapped: false,
    activated: [{
      cost: { sacrifice: 'self' },
      effect: { type: 'noop' },
    }],
  };
}

// 1. Le permanent source est seul : sacrifice:"self" doit être payable et
//    doit déplacer CE permanent (identifié par uid) au cimetière.
{
  const game = makeGame();
  const source = selfSacrificingPermanent('self-only');
  game.engine.setState({
    ...game.state,
    player: { ...game.state.player, battlefield: [source] },
    priorityHolder: 'player',
    phase: 'main1',
  });

  const [ability] = game.getAbilityOptions(source, 'player');
  assert.ok(ability, 'la capacité sacrifice:"self" doit être considérée payable lorsque le permanent est seul');

  game.costs.pay('player', ability.cost, { controller: 'player', permanent: source });

  assert.equal(game.state.player.battlefield.length, 0, 'le permanent source doit quitter le champ de bataille');
  assert.equal(game.state.player.graveyard.length, 1, 'le permanent sacrifié doit être au cimetière');
  assert.equal(game.state.player.graveyard[0].previousUid, source.uid, 'le permanent sacrifié doit être exactement la source (uid avant changement de zone)');
  console.log('OK V12.62.1: sacrifice:"self" seul — source sacrifiée par uid.');
}

// 2. La source partage le champ de bataille avec un autre permanent :
//    sacrifice:"self" ne doit jamais choisir l'autre permanent.
{
  const game = makeGame();
  const source = selfSacrificingPermanent('self-with-other');
  const other = {
    uid: 'other-permanent',
    objectId: 'other-permanent-obj',
    name: 'Other Permanent',
    type: 'Artifact',
    owner: 'player',
    controller: 'player',
    tapped: false,
  };
  game.engine.setState({
    ...game.state,
    player: { ...game.state.player, battlefield: [source, other] },
    priorityHolder: 'player',
    phase: 'main1',
  });

  const [ability] = game.getAbilityOptions(source, 'player');
  assert.ok(ability, 'la capacité sacrifice:"self" doit rester payable avec plusieurs permanents');

  game.costs.pay('player', ability.cost, { controller: 'player', permanent: source });

  assert.equal(game.state.player.battlefield.length, 1, 'un seul autre permanent doit rester sur le champ de bataille');
  assert.equal(game.state.player.battlefield[0].uid, other.uid, 'l’autre permanent doit rester en jeu');
  assert.equal(game.state.player.graveyard.length, 1, 'exactement un permanent doit être sacrifié');
  assert.equal(game.state.player.graveyard[0].previousUid, source.uid, 'le permanent sacrifié doit être exactement la source (uid avant changement de zone)');
  console.log('OK V12.62.2: sacrifice:"self" avec autre permanent — source sacrifiée, autre permanent conservé.');
}

console.log('OK: V12.62 sacrifice:"self" — deux scénarios E2E validés.');
