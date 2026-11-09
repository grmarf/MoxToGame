// V12.76 — Chantier 2, lot G4 : famille « blessures » (3 cartes) : Ali from Cairo, Haunting Wind, Inquisition.
// Tout est joué en partie réelle (GameFacade, CAST_SPELL, pile, activation de capacités, combat) avec les vraies cartes.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { CombatService } from '../src/core/combat.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const FULL = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai');
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5;
  return g;
}
function put(g, side, name, extra = {}) {
  const uid = `${name}#${++seq}`; // objectId distinct : le moteur retrouve une carte par uid OU objectId (undefined === undefined ramènerait la première)
  const p = { ...by(name), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
function settle(g) { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); }
function cast(g, name, target = null) {
  const card = { ...by(name), uid: `${name}#${++seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(card); g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player';
  const payload = { card, xValue: 0 }; if (target) payload.target = target;
  g.dispatch('CAST_SPELL', payload, 'player'); settle(g);
  return g.state.player.battlefield.find((p) => p.uid === card.uid) || null;
}
const live = (g, p) => g.state[p.controller].battlefield.find((x) => x.uid === p.uid);
const combatFor = (g) => { const c = new CombatService({ state: () => g.state, sba: g.stateBasedActions, replacements: g.replacements }); c.begin(); return c; };
const P = { kind: 'player', side: 'player' }, A = { kind: 'player', side: 'ai' };

// ── 1. Données ───────────────────────────────────────────────────────────
for (const n of ['Ali from Cairo', 'Haunting Wind', 'Inquisition']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 2. Ali from Cairo ───────────────────────────────────────────────────
{ // sort de dégâts : la vie s'arrête à 1
  const g = newGame(); put(g, 'player', 'Ali from Cairo'); g.state.player.life = 2;
  cast(g, 'Lightning Bolt', P);
  assert.equal(g.state.player.life, 1, 'Ali : 3 blessures à 2 PV -> 1 PV');
  cast(g, 'Lightning Bolt', P);
  assert.equal(g.state.player.life, 1, 'Ali : à 1 PV, d\'autres blessures ne tuent pas');
}
{ // combat
  const g = newGame(); g.state.player.life = 3; put(g, 'player', 'Ali from Cairo');
  const hit = put(g, 'ai', 'Hill Giant'); g.state.activePlayer = 'ai';
  const c = combatFor(g); c.confirmAttackers([hit], 'ai'); c.assignBlockers({}); c.resolveDamage();
  assert.equal(g.state.player.life, 1, 'Ali : blessures de combat plafonnées à 1 PV');
}
{ // le protégé, pas l'adversaire de celui qui contrôle Ali
  const g = newGame(); put(g, 'ai', 'Ali from Cairo'); g.state.player.life = 2;
  cast(g, 'Lightning Bolt', P);
  assert.ok(g.state.player.life <= 0, 'Ali adverse ne protège pas mon joueur');
  const h = newGame(); put(h, 'ai', 'Ali from Cairo'); h.state.ai.life = 2;
  cast(h, 'Lightning Bolt', A); assert.equal(h.state.ai.life, 1, 'Ali protège son contrôleur');
}
{ // sans Ali : on meurt ; Ali parti : plus de protection ; au-dessus du plancher : dégâts normaux
  const g = newGame(); g.state.player.life = 2; cast(g, 'Lightning Bolt', P); assert.ok(g.state.player.life <= 0, 'témoin : sans Ali');
  const h = newGame(); put(h, 'player', 'Ali from Cairo'); h.state.player.life = 10; cast(h, 'Lightning Bolt', P);
  assert.equal(h.state.player.life, 7, 'Ali : au-dessus de 1 PV, dégâts normaux');
  h.state.player.battlefield = h.state.player.battlefield.filter((p) => p.name !== 'Ali from Cairo'); h.state.player.life = 2; cast(h, 'Lightning Bolt', P);
  assert.ok(h.state.player.life <= 0, 'Ali parti : plus de plancher');
}

// ── 3. Haunting Wind (Oracle : « Whenever an artifact becomes tapped or a player activates an artifact's ability without {T} in its activation cost, ... 1 damage to that artifact's controller ») ──
{
  const g = newGame(); assert.ok(cast(g, 'Haunting Wind'), 'Haunting Wind résolu');
  const ring = put(g, 'player', 'Sol Ring'); const life0 = g.state.player.life;
  g.action('activateAbility', { permanent: live(g, ring), controller: 'player', abilityIndex: 0 }); settle(g);
  assert.equal(g.state.player.life, life0 - 1, 'Sol Ring (capacité de mana, avec {T}) : UNE blessure (l\'artefact devient engagé ; pas de double comptage)');
  const pearl = put(g, 'player', 'Mox Pearl'); g.state.player.life = 20;
  g.action('tapMana', { permanent: live(g, pearl), controller: 'player', color: 'W' }); settle(g);
  assert.equal(g.state.player.life, 19, 'Mox (tapMana) : 1 blessure');
  const forest = put(g, 'player', 'Forest'); g.state.player.life = 20;
  g.action('tapMana', { permanent: live(g, forest), controller: 'player', color: 'G' }); settle(g);
  assert.equal(g.state.player.life, 20, 'un terrain n\'est pas un artefact : aucune blessure');
  const tome = put(g, 'player', 'Jayemdae Tome'); g.state.player.life = 20; g.state.player.mana = { ...FULL }; g.state.priorityHolder = 'player';
  const hand0 = g.state.player.hand.length;
  g.action('activateAbility', { permanent: live(g, tome), controller: 'player', abilityIndex: 0 }); settle(g);
  assert.equal(g.state.player.life, 19, 'Jayemdae Tome ({4},{T}) : 1 blessure (engagé)');
  assert.equal(g.state.player.hand.length, hand0 + 1, 'et la capacité se résout quand même');
}
{ // l'adversaire qui active : c'est LUI qui est touché, même si j'ai Haunting Wind (syncBattlefield : un `put` direct n'enregistre pas les déclencheurs)
  const g = newGame(); put(g, 'player', 'Haunting Wind'); const ring = put(g, 'ai', 'Sol Ring'); g.triggerEngine.syncBattlefield(g.state); g.state.ai.life = 20; g.state.priorityHolder = 'ai'; g.state.activePlayer = 'ai';
  g.action('activateAbility', { permanent: live(g, ring), controller: 'ai', abilityIndex: 0 }); settle(g);
  assert.equal(g.state.ai.life, 19, 'l\'adversaire activant son artefact subit 1 blessure'); assert.equal(g.state.player.life, 20, 'moi : intact');
}
{ // témoin : sans Haunting Wind rien ne se passe
  const g = newGame(); const ring = put(g, 'player', 'Sol Ring');
  g.action('activateAbility', { permanent: live(g, ring), controller: 'player', abilityIndex: 0 }); settle(g);
  assert.equal(g.state.player.life, 20, 'sans Haunting Wind : aucune blessure');
}

// ── 4. Inquisition ──────────────────────────────────────────────────────
{
  const g = newGame();
  g.state.ai.hand = [{ ...by('Savannah Lions'), uid: 'h1' }, { ...by('Serra Angel'), uid: 'h2' }, { ...by('Hill Giant'), uid: 'h3' }, { ...by('Plains'), uid: 'h4' }];
  cast(g, 'Inquisition', A);
  assert.equal(g.state.ai.life, 18, 'Inquisition : 2 cartes blanches -> 2 blessures');
  assert.equal(g.state.ai.hand.length, 4, 'la main n\'est pas modifiée');
}
{ // aucune carte blanche : 0 ; ciblage de soi-même possible, compte MA main
  const g = newGame(); g.state.ai.hand = [{ ...by('Hill Giant'), uid: 'h1' }];
  cast(g, 'Inquisition', A); assert.equal(g.state.ai.life, 20, 'aucune carte blanche : aucune blessure');
  const h = newGame(); h.state.player.hand = [{ ...by('Serra Angel'), uid: 'h1' }, { ...by('Serra Angel'), uid: 'h2' }, { ...by('Serra Angel'), uid: 'h3' }];
  cast(h, 'Inquisition', P); assert.equal(h.state.player.life, 17, 'Inquisition sur soi : compte sa propre main (3 cartes blanches)');
}
console.log('test-v12-107 OK');
