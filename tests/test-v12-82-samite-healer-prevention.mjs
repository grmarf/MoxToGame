import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

// Audit v12.69, Samite Healer : "{T} : Prévenez, ce tour-ci, les prochaines
// 1 blessures sur une cible, créature ou joueur." L'ability était certifiée
// "implemented" mais résolvait 'preventDamage', un type d'effet jamais
// enregistré -- son activation levait une exception. Ce test l'active
// réellement, puis vérifie que le bouclier protège LA CIBLE choisie sans
// protéger le reste du champ de bataille du même côté.

const g = new GameFacade().connect();
g.state.player.library = []; g.state.ai.library = [];
g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
const mk = (uid) => ({ uid, objectId: uid, name: 'Grizzly Bears', type: 'Creature', power: 2, toughness: 2, color: ['G'], keywords: [], owner: 'player', controller: 'player', tapped: false, summoningSickness: false, damageMarked: 0, counters: [], auraBuffs: [], tempBuffs: [] });
const shielded = mk('shielded'), unshielded = mk('unshielded');
const healer = { ...CARDS.find(c => c.name === 'Samite Healer'), uid: 'h1', objectId: 'h1', owner: 'player', controller: 'player', tapped: false, summoningSickness: false, damageMarked: 0, counters: [], auraBuffs: [], tempBuffs: [] };
g.state.player.battlefield.push(shielded, unshielded, healer);

const opts = g.getAbilityOptions(healer, 'player');
assert.equal(opts.length, 1, 'Samite Healer doit avoir sa capacité activable.');
const cand = g.targeting.validTargets(opts[0].effect.type, 'player').find(o => o.perm?.uid === 'shielded');
assert.ok(cand, 'La créature protégée doit être une cible légale.');
assert.doesNotThrow(() => g.dispatch('ACTIVATE_ABILITY', { permanent: healer, abilityIndex: 0, target: cand }, 'player'),
  "L'activation de Samite Healer ne doit pas lever d'exception (BUG : 'preventDamage' non enregistré).");
assert.equal(healer.tapped, true, 'Samite Healer doit s\'engager pour activer sa capacité.');
for (let i = 0; i < 6 && g.stack.items.length; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);

g.stack.replacements.applyDamageToPermanent(shielded, 1, {});
assert.equal(shielded.damageMarked, 0, 'La créature ciblée doit être protégée de la blessure.');

g.stack.replacements.applyDamageToPermanent(unshielded, 1, {});
assert.equal(unshielded.damageMarked, 1, "BUG : le bouclier ne doit PAS protéger une autre créature du même côté (portée par cible, pas par joueur).");

console.log('OK V12.82: Samite Healer active sans exception et protège précisément la cible choisie.');
