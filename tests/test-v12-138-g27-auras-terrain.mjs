// V12.76 (G27) — Auras de terrain : Consecrate Land (indestructible, aucune autre Aura), Farmstead (entretien du propriétaire du terrain : payer {W}{W} pour 1 PV), Goblin Shrine (+1/+0 aux Gobelins, 1 blessure à chaque Gobelin quand elle part).
// Oracle vérifié sur Scryfall / mtg.wtf / sites de cartes : Consecrate Land (LEA n°14), Farmstead (LEB n°20), Goblin Shrine (DRK n°68 ; ruling : fonctionne sur une Montagne adverse).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, objectId: `${p}FO${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai'); g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY(); return g;
}
const put = (g, side, name, extra = {}) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, ...extra }; g.state[side].battlefield.push(p); g.triggerEngine?.syncBattlefield?.(g.state); return p; };
const pT = (p) => ({ kind: 'permanent', uid: p.uid });
const live = (g, p) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((q) => q.uid === p.uid);
const has = (g, p) => !!live(g, p);
const inGy = (g, p) => g.state[p.owner].graveyard.some((c) => c.name === p.name);
function cast(g, name, target, x = 0, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side);
  for (let i = 0; i < 6 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; g.state[side].mana = EMPTY(); return card;
}
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const act = (g, p, side = 'player', extra = {}, mana = FULL) => { g.state.priorityHolder = side; g.state[side].mana = { ...mana }; g.action('activateAbility', { permanent: live(g, p), controller: side, abilityIndex: 0, ...extra }); settle(g); };
const advanceUntil = (g, pred, max = 90) => { for (let i = 0; i < max && !pred(); i++) { g.turnManager.nextPhase(); if (!pred()) settle(g); } assert.ok(pred(), `condition non atteinte (phase ${g.state.phase}, tour de ${g.state.activePlayer})`); };
const upkeepOf = (g, side) => { const t = g.state.turnNumber; advanceUntil(g, () => g.state.turnNumber !== t && g.state.activePlayer === side && g.state.phase === 'upkeep'); };
const order = (g, n = 3) => { const out = []; for (let i = 0; i < 80 && out.length < n; i++) { g.turnManager.nextPhase(); if (g.state.phase === 'upkeep') out.push(g.state.activePlayer); } return out; };

import { calculateCharacteristics } from '../src/core/continuous-effects.js';

for (const n of ['Consecrate Land', 'Farmstead', 'Goblin Shrine']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const pt = (g, p) => { const c = calculateCharacteristics(g.state, live(g, p)); return [c.power, c.toughness]; };
const dmg = (g, p) => (live(g, p) ? live(g, p).damageMarked || 0 : -1); // -1 = n'existe plus
const auraOn = (g, name, host) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((p) => p.name === name && p.attachedTo === host.uid);

// ── Consecrate Land : le terrain enchanté est indestructible et ne peut pas être enchanté par d'autres Auras ───────
{ const g = newGame(); const mtn = put(g, 'player', 'Mountain'); cast(g, 'Consecrate Land', pT(mtn)); assert.ok(auraOn(g, 'Consecrate Land', mtn), 'Consecrate Land attachée');
  cast(g, 'Stone Rain', pT(mtn), 0, 'ai'); assert.ok(has(g, mtn), 'Stone Rain se résout mais le terrain n\'est PAS détruit'); assert.ok(g.stack.size === 0); }
{ const g = newGame(); const mtn = put(g, 'ai', 'Mountain'); cast(g, 'Consecrate Land', pT(mtn)); cast(g, 'Stone Rain', pT(mtn)); assert.ok(has(g, mtn), 'sur un terrain ADVERSE aussi'); }
{ const g = newGame(); const mtn = put(g, 'player', 'Mountain'); const other = put(g, 'player', 'Forest'); cast(g, 'Consecrate Land', pT(mtn)); cast(g, 'Stone Rain', pT(other), 0, 'ai'); assert.ok(!has(g, other), 'témoin : un terrain non protégé est détruit'); }
{ const g = newGame(); const mtn = put(g, 'player', 'Mountain'); cast(g, 'Consecrate Land', pT(mtn)); assert.throws(() => cast(g, 'Goblin Caves', pT(mtn)), /illégale/i, 'une autre Aura ne peut pas enchanter ce terrain'); assert.ok(!auraOn(g, 'Goblin Caves', mtn));
  assert.throws(() => cast(g, 'Consecrate Land', pT(mtn)), /illégale/i, 'ni une seconde Consecrate Land (« d\'autres Auras »)'); }
// Ruling 2006 : si elle arrive sur un terrain déjà enchanté, les autres Auras vont au cimetière
{ const g = newGame(); const mtn = put(g, 'player', 'Mountain'); cast(g, 'Goblin Caves', pT(mtn)); assert.ok(auraOn(g, 'Goblin Caves', mtn), 'témoin : Goblin Caves attachée'); cast(g, 'Consecrate Land', pT(mtn));
  assert.ok(auraOn(g, 'Consecrate Land', mtn), 'Consecrate Land reste'); assert.ok(!auraOn(g, 'Goblin Caves', mtn), 'l\'autre Aura est mise au cimetière'); assert.ok(g.state.player.graveyard.some((c) => c.name === 'Goblin Caves')); }
// Aura partie : le terrain redevient destructible
{ const g = newGame(); const mtn = put(g, 'player', 'Mountain'); cast(g, 'Consecrate Land', pT(mtn)); const cl = auraOn(g, 'Consecrate Land', mtn); cast(g, 'Disenchant', pT(cl)); assert.ok(!has(g, cl)); cast(g, 'Stone Rain', pT(mtn), 0, 'ai'); assert.ok(!has(g, mtn), 'Consecrate Land partie : Stone Rain détruit enfin le terrain'); }
// Un terrain-créature indestructible survit aussi aux blessures létales (actions d'état)
{ const g = newGame(); const mtn = put(g, 'player', 'Mountain'); cast(g, 'Consecrate Land', pT(mtn)); live(g, mtn).type = 'Land Creature'; live(g, mtn).power = 1; live(g, mtn).toughness = 1; live(g, mtn).damageMarked = 3; g.stack.sba.check(g.state); assert.ok(has(g, mtn), 'indestructible : les blessures létales ne le détruisent pas'); }

// ── Farmstead : à l'entretien de son CONTRÔLEUR, le terrain enchanté peut payer {W}{W} pour gagner 1 PV ────────
const farm = (side = 'player') => { const g = newGame(); const pl = put(g, side, 'Plains'); cast(g, 'Farmstead', pT(pl)); assert.ok(auraOn(g, 'Farmstead', pl), 'Farmstead attachée'); return { g, pl }; };
{ const { g } = farm(); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), W: 2 }; settle(g); const pe = g.choices.getPending(); assert.equal(pe?.type, 'payToGainLife'); assert.equal(pe.controller, 'player'); assert.deepEqual(pe.options, ['pay', 'decline']);
  const l0 = g.state.player.life; g.choices.resolve('pay'); assert.equal(g.state.player.life, l0 + 1, '+1 PV'); assert.equal(g.state.player.mana.W, 0, '{W}{W} payés'); }
{ const { g } = farm(); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), W: 2 }; settle(g); const l0 = g.state.player.life; g.choices.resolve('decline'); assert.equal(g.state.player.life, l0, 'refus : rien'); assert.equal(g.state.player.mana.W, 2); }
{ const { g } = farm(); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), W: 1 }; settle(g); assert.deepEqual(g.choices.getPending()?.options, ['decline'], '{W} seul : payer est impossible'); g.choices.resolve('decline'); assert.equal(g.state.player.life, 20); }
{ const { g } = farm(); upkeepOf(g, 'ai'); settle(g); assert.equal(g.choices.getPending(), null, 'à l\'entretien de l\'ADVERSAIRE : rien pour moi'); }
// Farmstead sur le terrain de l'ADVERSAIRE : c'est son entretien, son choix, son mana, ses PV
{ const { g } = farm('ai'); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; upkeepOf(g, 'player'); settle(g); assert.equal(g.choices.getPending(), null, 'mon entretien : aucune question (le terrain n\'est pas à moi)'); }
{ const { g } = farm('ai'); upkeepOf(g, 'ai'); g.state.ai.mana = { ...EMPTY(), W: 2 }; settle(g); const pe = g.choices.getPending(); assert.equal(pe?.controller, 'ai', 'la question est posée à l\'ADVERSAIRE'); const l0 = g.state.ai.life, m0 = g.state.player.life; g.choices.resolve('pay'); assert.equal(g.state.ai.life, l0 + 1, 'c\'est lui qui gagne 1 PV'); assert.equal(g.state.player.life, m0); }
{ const { g, pl } = farm(); cast(g, 'Disenchant', pT(auraOn(g, 'Farmstead', pl))); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), W: 2 }; settle(g); assert.equal(g.choices.getPending(), null, 'Aura partie : plus de déclencheur'); }

// ── Goblin Shrine : +1/+0 aux Gobelins si Montagne de base ; quand elle part, 1 blessure à CHAQUE Gobelin ─────────
const shrineGame = (host = 'Mountain', side = 'player') => { const g = newGame(); const h = put(g, side, host); const mine = put(g, 'player', 'Goblin Digging Team'); const theirs = put(g, 'ai', 'Goblin Hero'); const giant = put(g, 'player', 'Hill Giant');
  const base = { mine: pt(g, mine), theirs: pt(g, theirs), giant: pt(g, giant) }; cast(g, 'Goblin Shrine', pT(h)); return { g, h, mine, theirs, giant, base, shrine: auraOn(g, 'Goblin Shrine', h) }; };
{ const o = shrineGame(); assert.ok(o.shrine); assert.deepEqual(pt(o.g, o.mine), [o.base.mine[0] + 1, o.base.mine[1]], 'Gobelin à moi +1/+0'); assert.deepEqual(pt(o.g, o.theirs), [o.base.theirs[0] + 1, o.base.theirs[1]], 'Gobelin adverse +1/+0'); assert.deepEqual(pt(o.g, o.giant), o.base.giant, 'Hill Giant inchangé'); }
{ const o = shrineGame('Mountain', 'ai'); assert.deepEqual(pt(o.g, o.mine), [o.base.mine[0] + 1, o.base.mine[1]], 'sur une Montagne ADVERSE aussi (ruling 2004)'); }
for (const land of ['Forest', 'Badlands']) { const o = shrineGame(land); assert.deepEqual(pt(o.g, o.mine), o.base.mine, `${land} : pas une Montagne de base : aucun bonus`); }
{ const o = shrineGame(); cast(o.g, 'Disenchant', pT(o.shrine)); assert.ok(!has(o.g, o.shrine), 'Aura partie'); assert.ok(!has(o.g, o.mine), 'Goblin Digging Team 1/1 : meurt (1 blessure)'); assert.equal(dmg(o.g, o.theirs), 1, 'Goblin Hero 2/2 : 1 blessure marquée (survit)'); assert.equal(dmg(o.g, o.giant), 0, 'Hill Giant intact'); }
{ const o = shrineGame(); cast(o.g, 'Stone Rain', pT(o.h), 0, 'ai'); assert.ok(!has(o.g, o.h) && !has(o.g, o.shrine), 'terrain détruit, l\'Aura part avec lui'); assert.ok(!has(o.g, o.mine), 'la 1 blessure est infligée aussi quand l\'hôte disparaît'); assert.equal(dmg(o.g, o.theirs), 1); }
{ const o = shrineGame('Forest'); cast(o.g, 'Disenchant', pT(o.shrine)); assert.ok(!has(o.g, o.mine), 'même sans bonus (Forêt), la blessure est infligée à la sortie'); }
{ const o = shrineGame(); assert.equal(dmg(o.g, o.mine), 0, 'tant qu\'elle reste : aucune blessure'); assert.equal(dmg(o.g, o.theirs), 0); }

// Non-régression (banc, graine 48) : l'énumération des cibles de l'IA/UI connaît la carte source -> elle ne propose plus un terrain protégé à une Aura
{ const g = newGame(); const prot = put(g, 'ai', 'Mountain'); const free = put(g, 'ai', 'Forest'); cast(g, 'Consecrate Land', pT(prot)); const blight = by('Blight');
  const ids = g.targeting.validTargets(blight.effect.type, 'player', [], blight.effect, { ...structuredClone(blight), uid: 'x', objectId: 'x' }).map((o) => o.perm?.uid || o.id);
  assert.ok(!ids.includes(prot.uid) && ids.includes(free.uid), 'Blight : le terrain protégé par Consecrate Land n\'est plus proposé, les autres oui');
  const ids2 = g.targeting.validTargets(blight.effect.type, 'player', [], blight.effect).map((o) => o.perm?.uid || o.id); assert.ok(ids2.includes(prot.uid), 'témoin : sans carte source, l\'ancien comportement (liste large) subsiste'); }

console.log('OK test-v12-138-g27-auras-terrain');
