// V12.76 (G28) — Auras de créature à déclencheur : Venom, Infinite Authority (bloque / est bloquée -> destruction en fin de combat), Farrel's Mantle (non bloquée -> blessures), Backfire (blessures reçues renvoyées), Power Leak (entretien : payer pour prévenir).
// Oracle vérifié (Scryfall / sites concordants) : Venom DRK n°90, Infinite Authority LEG n°191, Farrel's Mantle FEM n°2. Backfire et Power Leak : texte de la base au format Oracle, à confirmer sur fiche.
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

for (const n of ['Venom', 'Infinite Authority', "Farrel's Mantle", 'Backfire', 'Power Leak']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const auraOn = (g, name, host) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((p) => p.name === name && p.attachedTo === host.uid);
const dmg = (g, p) => (live(g, p) ? live(g, p).damageMarked || 0 : -1);
const nCounters = (g, p, type) => (live(g, p)?.counters || []).filter((c) => c.type === type).length;
// Un combat complet par le VRAI TurnManager. `step` : jusqu'où aller ('blockers' | 'damage' | 'end' | 'endstep').
function combatTurn(g, atts, blocks = {}, side = 'player', step = 'end') {
  g.state.activePlayer = side; g.turnManager.activePlayer = side; g.turnManager.gotoPhase('main1'); g.turnManager.beginCombat();
  g.turnManager.declareAttackers(atts); settle(g);
  if (g.choices.getPending() && step === 'attackers') return;
  g.turnManager.declareBlockers(blocks); settle(g); if (step === 'blockers') return;
  g.turnManager.runPhase(); settle(g); if (step === 'damage') return;
  g.turnManager.nextPhase(); settle(g); if (step === 'end') return;
  g.turnManager.nextPhase(); settle(g); g.turnManager.nextPhase(); settle(g);
}

// ── Venom : bloque / est bloquée par une créature NON Mur -> détruite en fin de combat (même si elle a survécu) ───
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Venom', pT(gr)); assert.ok(auraOn(g, 'Venom', gr)); const wurm = put(g, 'ai', 'Craw Wurm');
  combatTurn(g, [gr], { [gr.uid]: [wurm.uid] }, 'player', 'damage'); assert.ok(has(g, wurm), 'à la fin de l\'étape de dégâts : le ver est ENCORE en jeu (2 blessures sur 4)'); assert.equal(dmg(g, wurm), 2);
  g.turnManager.nextPhase(); settle(g); assert.ok(!has(g, wurm), 'au début de la fin de combat : détruit par Venom'); assert.ok(g.state.ai.graveyard.some((c) => c.name === 'Craw Wurm')); }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Venom', pT(gr)); const wall = put(g, 'ai', 'Wall of Stone'); combatTurn(g, [gr], { [gr.uid]: [wall.uid] }); assert.ok(has(g, wall), 'un Mur n\'est pas détruit (« non-Mur »)'); }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Venom', pT(gr)); const wurm = put(g, 'ai', 'Craw Wurm'); const other = put(g, 'ai', 'Hill Giant'); const gr2 = put(g, 'player', 'Grizzly Bears');
  combatTurn(g, [gr2], { [gr2.uid]: [other.uid] }); assert.ok(has(g, other), 'témoin : une créature qui bloque une AUTRE créature (sans Venom) n\'est pas détruite'); void wurm; }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Venom', pT(gr)); const att = put(g, 'ai', 'Craw Wurm'); combatTurn(g, [att], { [att.uid]: [gr.uid] }, 'ai'); assert.ok(!has(g, att), 'enchantée BLOQUEUSE : l\'attaquant non-Mur est détruit en fin de combat'); }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Venom', pT(gr)); const wurm = put(g, 'ai', 'Craw Wurm'); combatTurn(g, [gr], {}); assert.ok(has(g, wurm), 'non bloquée : aucun déclenchement'); }

// ── Infinite Authority : toughness <= 3 -> détruite en fin de combat (si elle a SURVÉCU au combat) ; au début de la prochaine étape finale, +1/+1 sur la 1re créature ───
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Infinite Authority', pT(gr)); const wood = put(g, 'ai', 'Wall of Wood'); assert.ok(auraOn(g, 'Infinite Authority', gr));
  combatTurn(g, [gr], { [gr.uid]: [wood.uid] }, 'player', 'damage'); assert.ok(has(g, wood), 'le Mur 0/3 survit aux 2 blessures'); g.turnManager.nextPhase(); settle(g); assert.ok(!has(g, wood), 'détruit en fin de combat (endurance 3)');
  assert.equal(nCounters(g, gr, '+1/+1'), 0, 'pas de marqueur avant la prochaine étape finale'); g.turnManager.nextPhase(); settle(g); g.turnManager.nextPhase(); settle(g); assert.equal(g.state.phase, 'endStep', 'étape finale');
  assert.equal(nCounters(g, gr, '+1/+1'), 1, '+1/+1 sur la créature enchantée'); }
{ const g = newGame(); const gr = put(g, 'player', 'Hill Giant'); cast(g, 'Infinite Authority', pT(gr)); const bear = put(g, 'ai', 'Grizzly Bears'); combatTurn(g, [gr], { [gr.uid]: [bear.uid] }, 'player', 'endstep');
  assert.ok(!has(g, bear), 'le 2/2 meurt déjà aux dégâts de combat'); assert.equal(nCounters(g, gr, '+1/+1'), 0, 'pas « détruite ainsi » (déjà morte) : AUCUN marqueur'); }
{ const g = newGame(); const gr = put(g, 'player', 'Hill Giant'); cast(g, 'Infinite Authority', pT(gr)); const wurm = put(g, 'ai', 'Craw Wurm'); combatTurn(g, [gr], { [gr.uid]: [wurm.uid] }, 'player', 'endstep'); assert.ok(has(g, wurm), 'endurance 4 : hors de portée (3 ou moins seulement)'); assert.equal(nCounters(g, gr, '+1/+1'), 0); }
{ const g = newGame(); const wall = put(g, 'player', 'Wall of Stone'); cast(g, 'Infinite Authority', pT(wall)); const zb = put(g, 'ai', 'Scathe Zombies'); combatTurn(g, [zb], { [zb.uid]: [wall.uid] }, 'ai', 'endstep');
  assert.ok(!has(g, zb), 'enchantée BLOQUEUSE : l\'attaquant (endurance 2, indemne : le Mur a 0 de force) est détruit'); assert.equal(nCounters(g, wall, '+1/+1'), 1, 'et le Mur reçoit son marqueur'); }
{ const g = newGame(); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, 'Infinite Authority', pT(gr)); const wood = put(g, 'ai', 'Wall of Wood'); const wood2 = put(g, 'ai', 'Wall of Wood');
  combatTurn(g, [gr], { [gr.uid]: [wood.uid, wood2.uid] }, 'player', 'endstep'); assert.ok(!has(g, wood) && !has(g, wood2), 'deux bloqueurs : les deux sont détruits'); assert.equal(nCounters(g, gr, '+1/+1'), 2, 'un marqueur PAR créature (ruling 2004)'); }

// ── Farrel's Mantle : enchantée ATTAQUE et n'est pas bloquée -> son contrôleur peut lui faire infliger (force + 2) à une AUTRE créature ; pas de blessures de combat ensuite ───
{ const g = newGame(); const gi = put(g, 'player', 'Hill Giant'); cast(g, "Farrel's Mantle", pT(gi)); const bear = put(g, 'ai', 'Grizzly Bears'); const wurm = put(g, 'ai', 'Craw Wurm'); const l0 = g.state.ai.life;
  combatTurn(g, [gi], {}, 'player', 'blockers'); const pe = g.choices.getPending(); assert.ok(pe, 'question posée au contrôleur de la créature enchantée'); assert.equal(pe.controller, 'player'); assert.ok(pe.options.includes('decline'));
  assert.ok(pe.options.includes(wurm.uid) && pe.options.includes(bear.uid), 'toutes les autres créatures sont ciblables'); assert.ok(!pe.options.includes(gi.uid), 'pas la créature enchantée elle-même');
  g.choices.resolve(wurm.uid); settle(g); assert.ok(!has(g, wurm), 'force 3 + 2 = 5 blessures : le Craw Wurm (endurance 4) meurt — 3 seules ne suffiraient pas'); assert.ok(has(g, bear), 'une seule cible'); g.turnManager.runPhase(); settle(g); assert.equal(g.state.ai.life, l0, 'la créature enchantée n\'assigne AUCUNE blessure de combat ce tour'); }
{ const g = newGame(); const gi = put(g, 'player', 'Hill Giant'); cast(g, "Farrel's Mantle", pT(gi)); const bear = put(g, 'ai', 'Grizzly Bears'); const l0 = g.state.ai.life; combatTurn(g, [gi], {}, 'player', 'blockers'); g.choices.resolve('decline'); settle(g); assert.ok(has(g, bear), 'refus : rien'); g.turnManager.runPhase(); settle(g); assert.equal(g.state.ai.life, l0 - 3, 'refus : elle inflige ses blessures de combat normales au joueur'); }
{ const g = newGame(); const gi = put(g, 'player', 'Hill Giant'); cast(g, "Farrel's Mantle", pT(gi)); const bear = put(g, 'ai', 'Grizzly Bears'); combatTurn(g, [gi], { [gi.uid]: [bear.uid] }, 'player', 'blockers'); assert.equal(g.choices.getPending(), null, 'bloquée : aucun déclenchement'); }
{ const g = newGame(); const gi = put(g, 'player', 'Hill Giant'); const gr = put(g, 'player', 'Grizzly Bears'); cast(g, "Farrel's Mantle", pT(gi)); put(g, 'ai', 'Scathe Zombies'); combatTurn(g, [gr], {}, 'player', 'blockers'); assert.equal(g.choices.getPending(), null, 'une AUTRE créature non bloquée (sans Aura) : rien'); }

// ── Backfire : « chaque fois que la créature enchantée vous inflige des blessures, Backfire en inflige autant à son contrôleur » ─────────────────
{ const g = newGame(); const foe = put(g, 'ai', 'Hill Giant'); cast(g, 'Backfire', pT(foe)); assert.ok(auraOn(g, 'Backfire', foe)); const l0 = g.state.player.life, a0 = g.state.ai.life;
  combatTurn(g, [foe], {}, 'ai'); assert.equal(g.state.player.life, l0 - 3, 'je subis les 3 blessures de combat'); assert.equal(g.state.ai.life, a0 - 3, 'Backfire en inflige 3 à son contrôleur (l\'adversaire)'); }
{ const g = newGame(); const foe = put(g, 'ai', 'Prodigal Sorcerer'); cast(g, 'Backfire', pT(foe)); const l0 = g.state.player.life, a0 = g.state.ai.life; act(g, foe, 'ai', { target: { kind: 'player', side: 'player' } });
  assert.equal(g.state.player.life, l0 - 1, 'blessure NON de combat à moi'); assert.equal(g.state.ai.life, a0 - 1, 'Backfire renvoie 1 à son contrôleur'); }
{ const g = newGame(); const foe = put(g, 'ai', 'Hill Giant'); cast(g, 'Backfire', pT(foe)); const mine = put(g, 'player', 'Grizzly Bears'); const a0 = g.state.ai.life; combatTurn(g, [foe], { [foe.uid]: [mine.uid] }, 'ai'); assert.equal(g.state.ai.life, a0, 'blessures à MA créature : pas de renvoi'); }
{ const g = newGame(); const foe = put(g, 'ai', 'Hill Giant'); const other = put(g, 'ai', 'Grizzly Bears'); cast(g, 'Backfire', pT(foe)); const a0 = g.state.ai.life; combatTurn(g, [other], {}, 'ai'); assert.equal(g.state.ai.life, a0, 'une AUTRE créature de l\'adversaire : pas de renvoi'); }

{ const g = newGame(); const mine = put(g, 'player', 'Hill Giant'); cast(g, 'Backfire', pT(mine)); const l0 = g.state.player.life, a0 = g.state.ai.life; combatTurn(g, [mine], {}, 'player');
  assert.equal(g.state.ai.life, a0 - 3, 'ma créature enchantée blesse l\'adversaire'); assert.equal(g.state.player.life, l0, 'ce n\'est PAS « vous inflige » (je suis le contrôleur de l\'Aura) : aucun renvoi sur moi'); }

// ── Power Leak : à l'entretien du contrôleur de l'ENCHANTEMENT enchanté : 2 blessures, prévenez-en autant que de mana payé ──────────────────────
const leak = (side = 'ai') => { const g = newGame(); const e = put(g, side, 'Gloom'); cast(g, 'Power Leak', pT(e)); assert.ok(auraOn(g, 'Power Leak', e), 'Power Leak attachée à un enchantement'); return { g, e }; };
{ const { g } = leak('ai'); upkeepOf(g, 'ai'); g.state.ai.mana = { ...EMPTY(), C: 2 }; settle(g); const pe = g.choices.getPending(); assert.equal(pe?.type, 'payAnyAmount'); assert.equal(pe.controller, 'ai', 'c\'est le contrôleur de l\'enchantement qui choisit'); assert.deepEqual(pe.options, ['0', '1', '2']);
  const l0 = g.state.ai.life; g.choices.resolve('1'); assert.equal(g.state.ai.life, l0 - 1, 'paye 1 : 2 - 1 = 1 blessure'); assert.equal(g.state.ai.mana.C, 1, '1 mana payé'); }
{ const { g } = leak('ai'); upkeepOf(g, 'ai'); g.state.ai.mana = { ...EMPTY(), C: 2 }; settle(g); const l0 = g.state.ai.life; g.choices.resolve('2'); assert.equal(g.state.ai.life, l0, 'paye 2 : tout est prévenu'); assert.equal(g.state.ai.mana.C, 0); }
{ const { g } = leak('ai'); upkeepOf(g, 'ai'); settle(g); const pe = g.choices.getPending(); assert.deepEqual(pe?.options, ['0'], 'sans mana'); const l0 = g.state.ai.life; g.choices.resolve('0'); assert.equal(g.state.ai.life, l0 - 2, 'rien payé : 2 blessures'); }
{ const { g } = leak('player'); upkeepOf(g, 'ai'); settle(g); assert.equal(g.choices.getPending(), null, 'l\'entretien de l\'ADVERSAIRE ne concerne pas mon enchantement'); }
{ const { g } = leak('player'); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), U: 1, C: 1 }; settle(g); const pe = g.choices.getPending(); assert.equal(pe?.controller, 'player'); assert.deepEqual(pe.options, ['0', '1', '2']); const l0 = g.state.player.life; g.choices.resolve('2'); assert.equal(g.state.player.life, l0, 'mon enchantement, mon entretien : je paie 2, aucune blessure'); }

console.log('OK test-v12-139-g28-auras-declencheurs');
