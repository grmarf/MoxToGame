import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

// BUG (audit v12.69, Firebreathing) : la capacité activée '{R} : +1/+0' est
// portée par l'Aura elle-même (ctx.sourceCard = l'Aura), mais 'pumpSelf'
// écrivait le buff sur ctx.sourceCard SANS distinguer ce cas : le bonus
// atterrissait sur l'Aura (qui n'a pas de force propre pertinente) au lieu
// de la créature enchantée. calculateCharacteristics ne lit jamais
// tempBuffs sur une Aura : Firebreathing s'activait sans jamais rien
// changer sur le terrain, malgré un statut "implemented".

const RICH = { W: 9, U: 9, B: 9, R: 9, G: 9, C: 9 };
const g = new GameFacade().connect();
g.state.player.library = []; g.state.ai.library = [];
g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
g.state.player.mana = { ...RICH };
const me = { uid: 'me', name: 'Grizzly Bears', type: 'Creature', subtype: 'Bear', power: 2, toughness: 2, color: ['G'], keywords: [], owner: 'player', controller: 'player', tapped: false, summoningSickness: false, damageMarked: 0, counters: [], auraBuffs: [], tempBuffs: [] };
g.state.player.battlefield.push(me);
const card = { ...CARDS.find(c => c.name === 'Firebreathing'), uid: 'fb1', owner: 'player', controller: 'player' };
g.state.player.hand = [card];
g.dispatch('CAST_SPELL', { card, target: { kind: 'permanent', perm: me, uid: 'me', name: me.name }, xValue: 0 }, 'player');
for (let i = 0; i < 6 && g.stack.items.length; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
const aura = [...g.state.player.battlefield, ...g.state.ai.battlefield].find(p => p.name === 'Firebreathing');
assert.equal(aura?.attachedTo, 'me', 'Firebreathing doit être attachée à la créature.');
g.state.priorityHolder = 'player';
for (let i = 0; i < 2; i++) { g.state.player.mana = { ...RICH }; g.state.priorityHolder = 'player'; g.dispatch('ACTIVATE_ABILITY', { permanent: aura, abilityIndex: 0, target: null }, 'player'); for (let j = 0; j < 6 && g.stack.items.length; j++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); }
const bear = g.state.player.battlefield.find(p => p.uid === 'me');
const chars = calculateCharacteristics(g.state, bear);
assert.equal(chars.power, 4, 'BUG Firebreathing : 2 activations de +1/+0 doivent porter la force à 4.');
assert.equal(chars.toughness, 2, "L'endurance ne doit pas changer.");
assert.deepEqual(aura.tempBuffs, [], "Le buff ne doit PAS rester sur l'Aura elle-même.");
console.log('OK V12.81: Firebreathing pompe bien la créature enchantée, pas elle-même.');
