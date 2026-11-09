// V12.76 (G25) — Time Vault : arrive engagé, ne se dégage pas, « si vous deviez commencer votre tour alors que cet artefact est engagé, vous pouvez sauter ce tour à la place ; dégagez-le », {T} : tour supplémentaire.
// Oracle : Scryfall LEB n°275. Rulings : la décision est prise quand le tour ALLAIT commencer, seulement si l'artefact est engagé à ce moment ; il se dégage avant tout le reste.
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


assert.equal(by('Time Vault').effectStatus, 'implemented', 'Time Vault : statut');
const vaultGame = (tapped = true, side = 'player') => { const g = newGame(); const v = put(g, side, 'Time Vault', { tapped }); return { g, v }; };
// Avance jusqu'au prochain début de tour dont un choix « sauter ? » est posé.
const untilSkipChoice = (g, max = 90) => { for (let i = 0; i < max && !g.choices.getPending(); i++) { g.turnManager.nextPhase(); if (!g.choices.getPending()) settle(g); } return g.choices.getPending(); };
const owners = (g, n) => { const out = []; for (let i = 0; i < 90 && out.length < n; i++) { const pe = g.choices.getPending(); if (pe) g.choices.resolve(pe.defaultValue ?? pe.options[0]); g.turnManager.nextPhase(); if (g.state.phase === 'upkeep') out.push(g.state.activePlayer); } return out; };

// ── Donnée : arrive engagé ; le lancer réel le pose engagé ───────────────────────────────────────────────────
{ const g = newGame(); cast(g, 'Time Vault'); const v = g.state.player.battlefield.find((p) => p.name === 'Time Vault'); assert.ok(v, 'en jeu'); assert.equal(v.tapped, true, 'arrive ENGAGÉ'); }

// ── Choix au début de mon tour, Time Vault engagée : JOUER le tour (elle reste engagée) ────────────────────────
{ const { g, v } = vaultGame(); const pe = untilSkipChoice(g); assert.equal(pe?.type, 'skipTurn', 'un choix « sauter ce tour ? » est posé'); assert.equal(pe.controller, 'player'); assert.deepEqual(pe.options, ['skip', 'play']);
  const t = g.state.turnNumber; assert.equal(g.state.activePlayer, 'ai', 'le tour qui allait commencer n\'a pas encore commencé (fin du tour adverse)');
  g.choices.resolve('play'); assert.equal(g.state.activePlayer, 'player', 'je joue mon tour'); assert.equal(g.state.turnNumber, t + 1, 'un tour de plus'); assert.equal(live(g, v).tapped, true, 'ne se dégage PAS à l\'étape de dégagement'); }

// ── SAUTER : le tour n'a pas lieu, Time Vault se dégage, l'adversaire enchaîne ───────────────────────────────
{ const { g, v } = vaultGame(); untilSkipChoice(g); const t = g.state.turnNumber; g.choices.resolve('skip');
  assert.equal(live(g, v).tapped, false, 'Time Vault dégagée'); assert.equal(g.state.activePlayer, 'ai', 'mon tour est SAUTÉ : l\'adversaire rejoue'); assert.equal(g.state.turnNumber, t + 1, 'un seul tour compté (le tour sauté n\'existe pas)');
  assert.equal(g.choices.getPending(), null, 'aucune autre question'); }

// ── Pas de choix : Time Vault dégagée, ou à l'adversaire de l'IA (limite connue : l'IA ne saute jamais) ─────────────
{ const { g } = vaultGame(false); const pe = untilSkipChoice(g, 40); assert.equal(pe, null, 'dégagée : aucune question'); }
{ const { g, v } = vaultGame(true, 'ai'); assert.equal(untilSkipChoice(g, 60), null, 'aucune question posée pour la Time Vault de l\'IA'); }
{ const { g, v } = vaultGame(true, 'ai'); const o = owners(g, 3); assert.deepEqual(o, ['ai', 'player', 'ai'], 'Time Vault de l\'IA engagée : elle joue ses tours (aucune question)'); assert.equal(live(g, v).tapped, true); }
// Time Vault ADVERSE engagée : elle ne me concerne pas
{ const { g } = vaultGame(true, 'ai'); const o = owners(g, 2); assert.equal(o[0], 'ai'); }

// ── {T} : tour supplémentaire « après celui-ci » (capacité à vitesse d'instant, pile) ────────────────────────────
{ const { g, v } = vaultGame(false); act(g, v); assert.equal(live(g, v).tapped, true, 'engagée'); assert.deepEqual(g.state.extraTurnQueue, ['player'], 'un tour supplémentaire demandé');
  const pe = untilSkipChoice(g); assert.equal(pe?.type, 'skipTurn', 'mon tour supplémentaire : Time Vault est engagée, je peux le sauter'); g.choices.resolve('play'); assert.equal(g.state.activePlayer, 'player', 'mon tour SUPPLÉMENTAIRE'); }
// … et l'enchaînement classique : sauter un tour pour dégager, puis la reprendre pour un tour de plus (gain net nul, jamais de tours multiples sautés)
{ const { g, v } = vaultGame(false); act(g, v); const pe = untilSkipChoice(g); g.choices.resolve('skip');
  assert.equal(live(g, v).tapped, false, 'le tour supplémentaire sauté dégage la Time Vault'); assert.equal(g.state.activePlayer, 'ai', 'puis l\'adversaire (mon tour supplémentaire n\'a pas eu lieu)'); void pe; }
// Tour supplémentaire pris PENDANT LE TOUR ADVERSE : mon extra, puis mon tour normal, puis lui — avec la Time Vault engagée, une question à chaque début
{ const { g, v } = vaultGame(false); g.state.activePlayer = 'ai'; g.turnManager.activePlayer = 'ai'; act(g, v); assert.deepEqual(g.state.extraTurnQueue, ['player']);
  let pe = untilSkipChoice(g); assert.equal(pe?.type, 'skipTurn'); g.choices.resolve('play'); assert.equal(g.state.activePlayer, 'player', 'extra');
  pe = untilSkipChoice(g); assert.equal(pe?.type, 'skipTurn', 'mon tour NORMAL qui suit : Time Vault toujours engagée : nouvelle question'); g.choices.resolve('skip'); assert.equal(g.state.activePlayer, 'ai', 'tour normal sauté : l\'adversaire'); assert.equal(live(g, v).tapped, false); }

// ── Garde : un second nextPhase pendant que la question est posée n'avance pas le jeu ────────────────────────────
{ const { g } = vaultGame(); const pe = untilSkipChoice(g); const id = pe.id, phase = g.state.phase, who = g.state.activePlayer, t = g.state.turnNumber;
  g.turnManager.nextPhase(); g.turnManager.nextPhase(); assert.equal(g.choices.getPending()?.id, id, 'la même question'); assert.equal(g.state.phase, phase); assert.equal(g.state.activePlayer, who); assert.equal(g.state.turnNumber, t, 'rien n\'a avancé'); }

console.log('OK test-v12-136-g25-time-vault');
