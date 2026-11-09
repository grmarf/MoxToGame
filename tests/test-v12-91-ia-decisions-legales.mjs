import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

// v12.74 — l'IA ne prend que des décisions que le moteur ACCEPTE. Défauts trouvés par le banc IA-vs-IA :
//  1. tapMana refusait les créatures à mana (Llanowar Elves) : il lisait `produces`, pas `tapAbility.produces`.
//  2. Blocage : l'IA ignorait l'attaquant (volants, peur...) ; UNE affectation illégale faisait rejeter TOUTE
//     la déclaration de blocage -> l'IA ne bloquait plus rien.
//  3. Sorts sans cible légale (Control Magic sans créature adverse, contresort sans sort adverse) choisis quand même.
//  4. Réponse par contresort sans vérifier qu'elle est payable.
//  5. Un sort sur la pile est marqué zone 'stack' (il restait marqué 'hand').

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}_${Math.random().toString(36).slice(2, 6)}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const body = (o, name, extra = {}) => ({ uid: `${name}_${o}`, name, type: 'Creature', owner: o, controller: o, zone: 'battlefield', cmc: 2, keywords: [], color: [], power: 2, toughness: 2, ...extra });
function newGame(active = 'ai', phase = 'main1') {
  const g = new GameFacade().connect();
  g.state.player.library = Array.from({ length: 8 }, (_, i) => land('p', i)); g.state.ai.library = Array.from({ length: 8 }, (_, i) => land('a', i));
  g.turnManager.activePlayer = active; g.state.activePlayer = active; g.turnManager.gotoPhase(phase); g.state.priorityHolder = active;
  return g;
}
const mana = (g, side, m) => { g.state[side].mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, ...m }; };

// 1. Créature à mana : tapMana fonctionne.
{
  const g = newGame('player');
  g.zones.enterBattlefield(createPermanent({ ...card('Llanowar Elves'), owner: 'player', controller: 'player' }), 'player', { controller: 'player', reason: 'test' });
  const elves = g.state.player.battlefield.find(p => p.name === 'Llanowar Elves');
  elves.summoningSickness = false;
  mana(g, 'player', {});
  g.engine.action('tapMana', { permanent: elves, controller: 'player' });
  assert.equal(g.state.player.mana.G, 1, 'Llanowar Elves produit {G}.');
  assert.equal(g.state.player.battlefield.find(p => p.name === 'Llanowar Elves').tapped, true, 'Llanowar Elves est engagé.');
  console.log('OK V12.91.1: une créature à mana se tape pour du mana.');
}

// 2. Blocage : l'IA ne bloque jamais un volant avec une créature sans vol, et utilise le bon bloqueur.
{
  const g = newGame('player', 'declareBlockers');
  const flyer = body('player', 'Serra Angel', { power: 4, toughness: 4, keywords: ['flying'], color: ['W'] });
  const ground = body('player', 'Hill Giant', { power: 3, toughness: 3, color: ['R'] });
  g.state.player.battlefield = [flyer, ground];
  const wall = body('ai', 'Wall of Stone', { power: 0, toughness: 8, color: ['R'] });
  const bat = body('ai', 'Giant Bat', { power: 1, toughness: 8, keywords: ['flying'], color: ['B'] });
  g.state.ai.battlefield = [wall, bat];
  g.combat.begin(); g.combat.confirmAttackers([flyer, ground], 'player');
  const move = g.aiFor('ai').chooseAction();
  assert.equal(move?.action, 'declareBlockers', "L'IA doit bloquer.");
  assert.deepEqual(move.data.blockers[flyer.uid], [bat.uid], 'Le volant est bloqué par la créature qui vole (jamais par le mur).');
  assert.deepEqual(move.data.blockers[ground.uid], [wall.uid], 'La créature au sol est bloquée par le mur.');
  assert.doesNotThrow(() => g.dispatch('declareBlockers', { blockers: move.data.blockers }, 'ai'), 'La déclaration de blocage est acceptée.');
  console.log('OK V12.91.2: les blocages de l\'IA tiennent compte de l\'attaquant et sont acceptés.');
}
// 2b. Aucun bloqueur légal pour le volant : pas d'affectation, mais le reste des blocages n'est PAS perdu.
{
  const g = newGame('player', 'declareBlockers');
  const flyer = body('player', 'Serra Angel', { power: 4, toughness: 4, keywords: ['flying'], color: ['W'] });
  const ground = body('player', 'Hill Giant', { power: 3, toughness: 3, color: ['R'] });
  g.state.player.battlefield = [flyer, ground];
  const wall = body('ai', 'Wall of Stone', { power: 0, toughness: 8, color: ['R'] });
  g.state.ai.battlefield = [wall];
  g.combat.begin(); g.combat.confirmAttackers([flyer, ground], 'player');
  const move = g.aiFor('ai').chooseAction();
  assert.ok(move && !(flyer.uid in move.data.blockers), 'Le volant n\'est pas bloqué (aucun bloqueur légal).');
  assert.deepEqual(move.data.blockers[ground.uid], [wall.uid], 'Le blocage légal est conservé.');
  assert.doesNotThrow(() => g.dispatch('declareBlockers', { blockers: move.data.blockers }, 'ai'));
  console.log('OK V12.91.2b: un blocage impossible ne fait plus perdre les blocages légaux.');
}

// 3. Sorts sans cible légale : jamais choisis.
{
  const g = newGame('ai');
  g.state.player.battlefield = [];
  g.state.ai.hand = [card('Control Magic', { owner: 'ai', controller: 'ai' }), card('Counterspell', { owner: 'ai', controller: 'ai' })];
  mana(g, 'ai', { U: 6 });
  const move = g.aiFor('ai').chooseAction();
  assert.equal(move, null, 'Ni Control Magic (aucune créature adverse) ni Counterspell (pile vide) : aucune action : ' + JSON.stringify(move?.data?.card?.name));
  g.state.player.battlefield = [body('player', 'Grizzly Bears')];
  const move2 = g.aiFor('ai').chooseAction();
  assert.equal(move2?.data?.card?.name, 'Control Magic', 'Avec une créature adverse, Control Magic redevient jouable.');
  console.log('OK V12.91.3: l\'IA ne choisit pas un sort sans cible légale.');
}

// 4. Réponse par contresort : seulement si payable ET s'il existe une cible légale.
{
  const g = newGame('player');
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; mana(g, 'player', { R: 1 });
  g.dispatch('castSpell', { card: bolt, target: { kind: 'player', side: 'ai' } }, 'player');
  g.state.ai.hand = [card('Counterspell', { owner: 'ai', controller: 'ai' })];
  mana(g, 'ai', { U: 1 });
  assert.equal(g.aiFor('ai').chooseResponse(), null, 'Counterspell ({U}{U}) non payable avec {U} : aucune réponse.');
  mana(g, 'ai', { U: 2 });
  const resp = g.aiFor('ai').chooseResponse();
  assert.equal(resp?.action, 'castCounter', 'Counterspell payable : réponse.');
  console.log('OK V12.91.4: l\'IA ne répond que si elle peut payer.');
}

// 5. Zone d'un sort sur la pile.
{
  const g = newGame('player');
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player', zone: 'hand' });
  g.state.player.hand = [bolt]; mana(g, 'player', { R: 1 });
  g.dispatch('castSpell', { card: bolt, target: { kind: 'player', side: 'ai' } }, 'player');
  assert.equal(g.stack.top.source.zone, 'stack', "Un sort sur la pile est dans la zone 'stack' (pas 'hand').");
  console.log('OK V12.91.5: un sort sur la pile est marqué zone stack.');
}
