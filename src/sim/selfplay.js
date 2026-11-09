// @ts-check
/**
 * v12.74 — Banc d'auto-jeu IA-vs-IA, synchrone et reproductible à graine fixe.
 * Fait jouer DEUX instances d'AIService (une par côté) sur un GameFacade réel, sans minuterie ni DOM,
 * en vérifiant les invariants du moteur (./invariants.js) après chaque action.
 *
 * Usage : const r = playGame({ seed: 42 });  r.violations / r.softFailures / r.hash / r.winner
 */
import { GameFacade } from '../core/game-facade.js';
import { rngClock } from '../core/rng-clock-service.js';
import { buildRandomPlayableDeck } from '../core/deck-builder.js';
import { autoMulligan } from '../core/mulligan.js';
import { phaseAllowsPriority } from '../core/turn/turn-rules.js';
import { pickAiTarget, pickStackTarget } from '../app/ai-controller.js';
import { checkInvariants } from './invariants.js';
import CARDS from '../data/cards-database.js';

const opp = (side) => (side === 'ai' ? 'player' : 'ai');
const MAIN = new Set(['main1', 'main2']);

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

/**
 * @param {{seed?: number, deckSize?: number, basicCount?: number, maxTurns?: number, maxSteps?: number,
 *          cards?: object[], decks?: {player?: object[], ai?: object[]}, firstPlayer?: 'player'|'ai', checkInvariants?: boolean}} [opts]
 */
export function playGame(opts = {}) {
  const { seed = 1, deckSize = 40, basicCount = 17, maxTurns = 30, maxSteps = 6000, cards = CARDS } = opts;
  const doCheck = opts.checkInvariants !== false;
  rngClock.configure({ seed, useLogicalClock: true });

  const violations = new Map();      // message -> { count, step, turn, phase }
  const softFailures = new Map();    // "type: message" -> count
  const trace = [];
  let step = 0, endReason = 'running', game = null;

  const note = (map, key, extra) => { const cur = map.get(key); if (cur) cur.count += 1; else map.set(key, { count: 1, ...extra }); };
  const ctxNow = () => ({ step, turn: game?.turnManager?.turnNumber, phase: game?.turnManager?.phase });

  try {
    game = new GameFacade().connect();
    const rng = () => rngClock.random();
    const decks = {
      player: opts.decks?.player || buildRandomPlayableDeck(cards, { size: deckSize, basicCount, rng }),
      ai: opts.decks?.ai || buildRandomPlayableDeck(cards, { size: deckSize, basicCount, rng }),
    };
    game.engine.loadDeck('player', decks.player);
    game.engine.loadDeck('ai', decks.ai);
    const deckSizes = { player: decks.player.length, ai: decks.ai.length };
    autoMulligan(game, 'player'); autoMulligan(game, 'ai');
    // v12.74 : `firstPlayer` permet de séparer un biais de CÔTÉ d'un effet de l'ORDRE DE JEU.
    if (opts.firstPlayer && opts.firstPlayer !== game.turnManager.activePlayer) {
      game.turnManager.activePlayer = opts.firstPlayer; game.state.activePlayer = opts.firstPlayer; game.state.priorityHolder = opts.firstPlayer;
    }

    const isOver = () => !!(game.state.player.hasLost || game.state.ai.hasLost);
    const isStable = () => game.stack.isEmpty && !game.choices.getPending() && !game.stack._activeResolutionItem;
    const check = () => {
      if (!doCheck) return;
      for (const msg of checkInvariants(game, { deckSize: deckSizes, stable: isStable() })) note(violations, msg, ctxNow());
    };

    /** Envoie une commande ; une exception est consignée (échec « mou ») sans interrompre la partie. */
    const send = (type, payload, source, label) => {
      try { game.dispatch(type, payload, source); trace.push(`${game.turnManager.turnNumber}.${game.turnManager.phase}.${source}:${label}`); check(); return true; }
      catch (err) {
        note(softFailures, `${type}: ${String(err?.message || err).slice(0, 110)}`, { ...ctxNow(), example: label });
        try { opts.onSoftFailure?.({ type, payload, source, label, error: err, game }); } catch { /* diagnostic uniquement */ }
        return false;
      }
    };

    const resolveChoice = (pending) => {
      const opts2 = pending.options || [];
      const n = Math.max(0, Number(pending.min ?? 0));
      const cands = [pending.defaultValue, opts2[0], opts2.slice(0, n), opts2.slice(0, Math.max(n, Number(pending.max ?? 1))), []];
      for (const value of cands) {
        if (value === undefined) continue;
        try { game.choices.resolve(value); trace.push(`${game.turnManager.turnNumber}.${game.turnManager.phase}.choice:${pending.type}`); check(); return true; } catch { /* candidat suivant */ }
      }
      note(violations, `I8 choix impossible à résoudre: ${pending.type}`, ctxNow());
      return false;
    };

    // Progression : on mémorise ce qui a déjà été fait ce tour pour ne jamais boucler.
    let turnKey = '', attackersDone = false, blockersDone = false, attempted = new Set(), lastSig = '', sameSig = 0;

    while (step < maxSteps) {
      step += 1;
      if (isOver()) { endReason = 'win'; break; }
      const tm = game.turnManager;
      if (tm.turnNumber > maxTurns) { endReason = 'turnLimit'; break; }

      const pending = game.choices.getPending();
      if (pending) { if (!resolveChoice(pending)) { endReason = 'stuck'; break; } continue; }

      const phase = tm.phase, active = tm.activePlayer;
      const key = `${tm.turnNumber}`;
      if (key !== turnKey) { turnKey = key; attackersDone = false; blockersDone = false; attempted = new Set(); }

      // Détection de blocage : même situation trop longtemps.
      const sig = `${key}|${phase}|${game.state.priorityHolder}|${game.stack.size}|${game.state.player.hand.length}|${game.state.ai.hand.length}|${game.state.player.life}|${game.state.ai.life}`;
      if (sig === lastSig) { sameSig += 1; } else { sameSig = 0; lastSig = sig; }
      if (sameSig > 30) { note(violations, `I9 partie bloquée (aucune progression) en phase ${phase}`, ctxNow()); endReason = 'stuck'; break; }

      if (!phaseAllowsPriority(phase)) { send('nextPhase', {}, active, `auto:${phase}`); continue; }
      const actor = game.state.priorityHolder || active;
      const ai = game.aiFor(actor);

      // Blocage : le défenseur déclare ses bloqueurs une fois, avant toute passe.
      if (phase === 'declareBlockers' && !blockersDone) {
        blockersDone = true;
        const defender = opp(active);
        if ((game.combat?.combat?.attackers || []).length > 0) {
          let move = null; try { move = game.aiFor(defender).chooseAction(); } catch (e) { note(softFailures, `chooseBlockers: ${e.message}`.slice(0, 120), ctxNow()); }
          if (move?.action === 'declareBlockers') send('declareBlockers', { blockers: move.data.blockers }, defender, 'blockers');
        }
        continue;
      }

      if (!game.stack.isEmpty) {
        const top = game.stack.top;
        let response = null;
        if (top.controller !== actor) { try { response = ai.chooseResponse(); } catch (e) { note(softFailures, `chooseResponse: ${e.message}`.slice(0, 120), ctxNow()); } }
        if (response?.action === 'castCounter' && response.data?.card && !attempted.has(`resp:${response.data.card.uid}:${top.id}`)) {
          attempted.add(`resp:${response.data.card.uid}:${top.id}`);
          const target = pickStackTarget(game, response.data.card, actor, top);
          if (target && send('castSpell', { card: response.data.card, target }, actor, `counter:${response.data.card.name}`)) continue;
        }
        send('passPriority', {}, actor, 'pass');
        continue;
      }

      if (actor !== active) { send('passPriority', {}, actor, 'pass'); continue; }

      if (MAIN.has(phase)) {
        for (const land of game.state[active].battlefield.filter((p) => !p.tapped && (p.produces || p.tapAbility?.produces))) {
          send('action', { action: 'tapMana', data: { permanent: land, controller: active } }, active, 'tapMana');
        }
        let move = null; try { move = ai.chooseAction(); } catch (e) { note(softFailures, `chooseAction: ${e.message}`.slice(0, 120), ctxNow()); }
        const card = move?.data?.card;
        const uid = card && (card.uid || card.name);
        if (move && card && !attempted.has(`${phase}:${uid}`)) {
          attempted.add(`${phase}:${uid}`);
          if (move.action === 'playLand') send('action', { action: 'playLand', data: { card, controller: active } }, active, `land:${card.name}`);
          else if (move.action === 'castSpell') {
            const target = pickAiTarget(game, card, active);
            send('castSpell', { card, target }, active, `cast:${card.name}`);
          }
          continue;
        }
        send('nextPhase', {}, active, 'endMain');
        continue;
      }

      if (phase === 'declareAttackers' && !attackersDone) {
        attackersDone = true;
        let move = null; try { move = ai.chooseAction(); } catch (e) { note(softFailures, `chooseAttackers: ${e.message}`.slice(0, 120), ctxNow()); }
        const attackers = move?.action === 'declareAttackers' ? move.data.attackers : [];
        send('declareAttackers', { attackers }, active, `attack:${attackers.length}`);
        continue;
      }
      send('nextPhase', {}, active, `next:${phase}`);
    }
    if (endReason === 'running') endReason = isOver() ? 'win' : 'stepLimit';

    check();
    const st = game.state;
    const snapshot = ['player', 'ai'].map((s) => `${s}:${st[s].life}:${ZONES_SIZES(st[s])}:${st[s].battlefield.map((p) => p.name).sort().join(',')}`).join('|');
    const winner = st.player.hasLost && st.ai.hasLost ? 'draw' : st.player.hasLost ? 'ai' : st.ai.hasLost ? 'player' : null;
    return {
      seed, endReason, winner, turns: game.turnManager.turnNumber, steps: step,
      hash: fnv1a(trace.join(';') + '#' + snapshot), trace, snapshot,
      violations, softFailures,
    };
  } finally {
    try { game?.dispose?.(); } catch { /* ignore */ }
    rngClock.configure({ seed: null, useLogicalClock: false });
  }
}

function ZONES_SIZES(st) { return ['hand', 'library', 'graveyard', 'exile'].map((z) => st[z].length).join('/'); }
