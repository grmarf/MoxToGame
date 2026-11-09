// V12.76 (G24) — Time Walk (tour supplémentaire RÉEL), Stasis (entretien {U}), Brass Man (entretien {1}), Lifeforce ({G}{G} : contrer un sort noir),
// Artifact Possession (2 blessures), Relic Bind (au choix : 1 blessure ou 1 PV). Parties réelles : pile, entretien, vrais choix.
// Oracle : Relic Bind vérifié sur Scryfall/mtg.wtf (LEG n°71) ; Stasis, Brass Man, Lifeforce, Time Walk : Oracle connu (à confirmer sur fiche).
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

for (const n of ['Time Walk', 'Stasis', 'Brass Man', 'Lifeforce', 'Artifact Possession', 'Relic Bind']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Time Walk : un vrai tour supplémentaire « après celui-ci » ──────────────────────────────────────────────
{ const g = newGame(); cast(g, 'Time Walk'); assert.deepEqual(order(g, 3), ['player', 'ai', 'player'], 'Time Walk : le lanceur rejoue AVANT l\'adversaire'); }
{ const g = newGame(); cast(g, 'Time Walk'); cast(g, 'Time Walk'); assert.deepEqual(order(g, 4), ['player', 'player', 'ai', 'player'], 'deux Time Walk : deux tours supplémentaires'); }
{ const g = newGame(); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; cast(g, 'Time Walk', null, 0, 'ai'); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai';
  assert.deepEqual(order(g, 3), ['ai', 'player', 'ai'], 'Time Walk de l\'IA : l\'IA rejoue d\'abord'); }
{ const g = newGame(); assert.deepEqual(order(g, 3), ['ai', 'player', 'ai'], 'témoin : alternance normale'); }
// Tour supplémentaire demandé PENDANT LE TOUR DE L'ADVERSAIRE (chemin de Time Vault) : j'enchaîne mon tour supplémentaire puis MON tour normal, puis lui.
{ const g = newGame(); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; g.state.extraTurnQueue = ['player'];
  assert.deepEqual(order(g, 3), ['player', 'player', 'ai'], 'extra pendant le tour adverse : mon extra, mon tour normal, puis l\'adversaire (je ne perds pas mon tour)'); }

// ── Stasis : dégagement sauté pour TOUS ; à VOTRE entretien, payez {U} ou sacrifiez ───────────────────────────
const stasisGame = (side = 'player') => { const g = newGame(); const st = put(g, side, 'Stasis'); const mine = put(g, 'player', 'Forest', { tapped: true }); const theirs = put(g, 'ai', 'Forest', { tapped: true }); return { g, st, mine, theirs }; };
{ const { g, st, mine, theirs } = stasisGame(); upkeepOf(g, 'player');
  assert.equal(live(g, mine).tapped, true, 'Stasis : MES terrains ne se dégagent pas'); assert.equal(live(g, theirs).tapped, true, 'Stasis : ceux de l\'adversaire non plus (témoin plus bas)');
  g.state.player.mana = { ...EMPTY(), U: 1 }; settle(g); const pe = g.choices.getPending(); assert.ok(pe, 'choix d\'entretien posé'); assert.deepEqual(pe.options, ['pay', 'sacrifice']);
  g.choices.resolve('pay'); assert.ok(has(g, st), '{U} payé : Stasis reste'); assert.equal(g.state.player.mana.U, 0, '{U} consommé'); }
{ const { g, st } = stasisGame(); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), U: 1 }; settle(g); g.choices.resolve('sacrifice'); assert.ok(!has(g, st) && inGy(g, st), 'refus : Stasis sacrifiée (cimetière)'); assert.equal(g.state.player.mana.U, 1, 'rien payé'); }
{ const { g, st } = stasisGame(); upkeepOf(g, 'player'); settle(g); const pe = g.choices.getPending(); assert.deepEqual(pe?.options, ['sacrifice'], 'sans {U} : seule issue = sacrifier'); g.choices.resolve('sacrifice'); assert.ok(!has(g, st)); }
{ const { g, st } = stasisGame(); upkeepOf(g, 'ai'); settle(g); assert.equal(g.choices.getPending(), null, 'l\'entretien de l\'ADVERSAIRE ne me coûte rien'); assert.ok(has(g, st)); }
{ const { g, st, mine } = stasisGame('ai'); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; g.turnManager.gotoPhase('cleanup'); g.state.phase = 'cleanup'; upkeepOf(g, 'player'); settle(g); assert.equal(g.choices.getPending(), null, 'Stasis adverse : je ne paie pas'); assert.equal(live(g, mine).tapped, true, 'mais mes terrains restent engagés'); assert.ok(has(g, st)); }
{ const g = newGame(); const mine = put(g, 'player', 'Forest', { tapped: true }); upkeepOf(g, 'player'); assert.equal(live(g, mine).tapped, false, 'témoin : sans Stasis, le terrain se dégage'); }

// ── Brass Man : ne se dégage pas ; à VOTRE entretien, vous pouvez payer {1} pour le dégager ──────────────────
assert.ok(!(by('Brass Man').activated || []).length, 'plus de capacité activée « {1} : dégagez-le » à tout moment');
const brass = (tapped = true) => { const g = newGame(); const b = put(g, 'player', 'Brass Man', { tapped }); return { g, b }; };
{ const { g, b } = brass(); upkeepOf(g, 'player'); assert.equal(live(g, b).tapped, true, 'ne se dégage pas à l\'étape de dégagement');
  g.state.player.mana = { ...EMPTY(), C: 1 }; settle(g); const pe = g.choices.getPending(); assert.equal(pe?.type, 'payToUntap'); assert.deepEqual(pe.options, ['pay', 'decline']);
  g.choices.resolve('pay'); assert.equal(live(g, b).tapped, false, '{1} payé : dégagé'); assert.equal(g.state.player.mana.C, 0); }
{ const { g, b } = brass(); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), C: 1 }; settle(g); g.choices.resolve('decline'); assert.equal(live(g, b).tapped, true, 'refus : reste engagé'); assert.equal(g.state.player.mana.C, 1); }
{ const { g, b } = brass(); upkeepOf(g, 'player'); settle(g); assert.deepEqual(g.choices.getPending()?.options, ['decline'], 'sans mana : rien à choisir'); g.choices.resolve('decline'); assert.equal(live(g, b).tapped, true); }
{ const { g, b } = brass(); upkeepOf(g, 'ai'); settle(g); assert.equal(g.choices.getPending(), null, 'entretien adverse : rien'); assert.equal(live(g, b).tapped, true); }
{ const { g } = brass(false); upkeepOf(g, 'player'); g.state.player.mana = { ...EMPTY(), C: 1 }; settle(g); assert.equal(g.choices.getPending(), null, 'déjà dégagé : aucune question'); }
{ const { g, b } = brass(); g.state.priorityHolder = 'player'; g.state.player.mana = { ...FULL }; assert.throws(() => g.action('activateAbility', { permanent: live(g, b), controller: 'player', abilityIndex: 0 }), /.+/, 'plus aucune capacité à activer'); assert.equal(live(g, b).tapped, true); }

// ── Lifeforce : {G}{G} : contrez un sort noir (plus de surcoût) ──────────────────────────────────────────────
assert.equal(by('Lifeforce').static, undefined, 'plus de surcoût statique');
assert.equal(by('Lifeforce').activated?.[0]?.cost, '{G}{G}');
const spell = (color, side = 'ai') => ({ name: `Sort ${color}`, uid: `S${++seq}`, objectId: `S${seq}`, type: 'Instant', color: [color], cost: `{${color}}`, effect: { type: 'damage', amount: 1, target: 'player' }, sets: [], owner: side, controller: side });
const lifeGame = (color) => { const g = newGame(); const lf = put(g, 'player', 'Lifeforce'); const c = spell(color); g.state.ai.hand.push(c); g.state.ai.mana = { ...FULL }; g.state.priorityHolder = 'ai'; g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai';
  g.dispatch('CAST_SPELL', { card: c, target: { kind: 'player', side: 'player' } }, 'ai'); assert.equal(g.stack.size, 1, 'le sort est sur la pile'); g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; return { g, lf, c, id: g.stack.items[0].id }; };
{ const { g, lf, c, id } = lifeGame('B'); g.state.priorityHolder = 'player'; g.state.player.mana = { ...EMPTY(), G: 2 }; const l0 = g.state.player.life;
  g.action('activateAbility', { permanent: live(g, lf), controller: 'player', abilityIndex: 0, target: { kind: 'stackItem', id } }); settle(g);
  assert.equal(g.stack.size, 0, 'pile vide'); assert.ok(g.state.ai.graveyard.some((x) => x.name === c.name), 'sort noir contré -> cimetière'); assert.equal(g.state.player.life, l0, 'aucun dégât subi'); assert.equal(g.state.player.mana.G, 0, '{G}{G} payé'); }
{ const { g, lf, id } = lifeGame('R'); g.state.priorityHolder = 'player'; g.state.player.mana = { ...EMPTY(), G: 2 }; const l0 = g.state.player.life;
  g.action('activateAbility', { permanent: live(g, lf), controller: 'player', abilityIndex: 0, target: { kind: 'stackItem', id } }); settle(g); assert.equal(g.state.player.life, l0 - 1, 'sort ROUGE non contré : il résout'); }
{ const { g, lf, id } = lifeGame('B'); g.state.priorityHolder = 'player'; g.state.player.mana = { ...EMPTY(), G: 1 };
  assert.throws(() => g.action('activateAbility', { permanent: live(g, lf), controller: 'player', abilityIndex: 0, target: { kind: 'stackItem', id } }), /.+/, 'un seul {G} : illégal'); assert.equal(g.stack.size, 1); }
{ const g = newGame(); put(g, 'player', 'Lifeforce'); const target = put(g, 'ai', 'Grizzly Bears'); g.state.player.mana = { ...EMPTY(), C: 1, B: 1 }; g.state.priorityHolder = 'player';
  g.dispatch('CAST_SPELL', { card: (() => { const c = { ...structuredClone(by('Terror')), uid: `T${++seq}`, objectId: `T${seq}`, owner: 'player', controller: 'player' }; g.state.player.hand.push(c); return c; })(), target: pT(target) }, 'player'); settle(g);
  assert.ok(!has(g, target), 'Terror ({1}{B}) coûte son prix normal avec Lifeforce en jeu'); }

// ── Artifact Possession : 2 blessures au contrôleur de l'artefact enchanté (engagé OU capacité sans {T}) ────────
{ const g = newGame(); const ring = put(g, 'player', 'Sol Ring'); cast(g, 'Artifact Possession', pT(ring)); assert.equal(live(g, ring) && g.state.player.battlefield.find((p) => p.name === 'Artifact Possession')?.attachedTo, ring.uid, 'Aura attachée à l\'artefact');
  const l0 = g.state.player.life; act(g, ring); assert.equal(g.state.player.life, l0 - 2, 'artefact enchanté engagé : 2 blessures à son contrôleur, UNE seule fois'); }
{ const g = newGame(); const ring = put(g, 'ai', 'Sol Ring'); cast(g, 'Artifact Possession', pT(ring)); const lp = g.state.player.life, la = g.state.ai.life; act(g, ring, 'ai');
  assert.equal(g.state.ai.life, la - 2, 'artefact ADVERSE : 2 blessures à l\'adversaire'); assert.equal(g.state.player.life, lp, 'pas à moi (propriétaire de l\'Aura)'); }
{ const g = newGame(); const clay = put(g, 'ai', 'Clay Statue'); cast(g, 'Artifact Possession', pT(clay)); const la = g.state.ai.life; act(g, clay, 'ai');
  assert.equal(g.state.ai.life, la - 2, 'capacité SANS {T} : 2 blessures, une fois'); assert.equal(live(g, clay).tapped, false); }
{ const g = newGame(); const a = put(g, 'player', 'Sol Ring'); const b = put(g, 'player', 'Sol Ring'); cast(g, 'Artifact Possession', pT(a)); const l0 = g.state.player.life; act(g, b); assert.equal(g.state.player.life, l0, 'un AUTRE artefact : aucune blessure'); }
{ const g = newGame(); const bears = put(g, 'player', 'Grizzly Bears'); assert.throws(() => cast(g, 'Artifact Possession', pT(bears)), /illégale/i, 'une créature non artefact n\'est pas une cible légale'); assert.ok(!g.state.player.battlefield.some((p) => p.name === 'Artifact Possession')); }
{ const g = newGame(); const ring = put(g, 'player', 'Sol Ring'); cast(g, 'Artifact Possession', pT(ring)); const ap = g.state.player.battlefield.find((p) => p.name === 'Artifact Possession'); cast(g, 'Disenchant', pT(ap)); assert.ok(!has(g, ap), 'Aura détruite'); const l0 = g.state.player.life; act(g, ring); assert.equal(g.state.player.life, l0, 'Aura partie : plus de blessure'); }

// ── Relic Bind : sur un artefact ADVERSE ; quand il s'engage, AU CHOIX 1 blessure ou 1 PV à un joueur ciblé ──────
const rbGame = () => { const g = newGame(); const ring = put(g, 'ai', 'Sol Ring'); cast(g, 'Relic Bind', pT(ring)); const rb = g.state.player.battlefield.find((p) => p.name === 'Relic Bind'); assert.equal(rb?.attachedTo, ring.uid, 'Relic Bind attachée à l\'artefact adverse'); return { g, ring }; };
{ const g = newGame(); const mine = put(g, 'player', 'Sol Ring'); assert.throws(() => cast(g, 'Relic Bind', pT(mine)), /illégale/i, 'artefact que JE contrôle : cible illégale'); assert.ok(!g.state.player.battlefield.some((p) => p.name === 'Relic Bind')); }
{ const g = newGame(); const bears = put(g, 'ai', 'Grizzly Bears'); assert.throws(() => cast(g, 'Relic Bind', pT(bears)), /illégale/i, 'une créature adverse non plus'); }
for (const [mode, side, delta] of [['damage-opponent', 'ai', -1], ['damage-self', 'player', -1], ['gain-self', 'player', +1], ['gain-opponent', 'ai', +1]]) {
  const { g, ring } = rbGame(); const before = { player: g.state.player.life, ai: g.state.ai.life }; act(g, ring, 'ai');
  const pe = g.choices.getPending(); assert.ok(pe, `${mode} : choix posé au contrôleur de l'Aura`); assert.equal(pe.controller, 'player'); assert.deepEqual([...pe.options].sort(), ['damage-opponent', 'damage-self', 'gain-opponent', 'gain-self'], 'les 4 combinaisons mode × joueur');
  g.choices.resolve(mode); assert.equal(g.state[side].life, before[side] + delta, `${mode} : ±1 pour ${side}`); const other = side === 'ai' ? 'player' : 'ai'; assert.equal(g.state[other].life, before[other], 'l\'autre joueur est intact'); }
{ const { g } = rbGame(); const other = put(g, 'ai', 'Sol Ring'); act(g, other, 'ai'); assert.equal(g.choices.getPending(), null, 'un AUTRE artefact engagé : rien'); }

console.log('OK test-v12-135-g24-donnees-seules');
