// @ts-check
/**
 * @fileoverview MTG Beta V8.13 — Minimal Native AI
 * Testable AI service with simple heuristics for land drops,
 * spell casting, combat, and priority passing.
 */

/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').Card} Card */
/** @typedef {import('../types.js').Permanent} Permanent */

import { isCastTimingLegal } from '../spell-timing.js';
import { gameEvents } from '../event-bus.js';
import { effectivePowerToughness, effectiveKeywords } from '../continuous-effects.js';

export class AIService {
  /**
   * @param {Object} deps
   * @param {() => GameState} deps.state
   * @param {import('../turn/turn-manager.js').TurnManager} deps.turnManager
   * @param {import('../combat.js').CombatService} deps.combat
   * @param {import('../stack.js').StackController} deps.stack
   * @param {import('../effect-registry.js').EffectRegistry} deps.effects
   * @param {string} [deps.side] — 'ai' or 'player' (for testing both sides)
   */
  constructor({ state, turnManager, combat, stack, effects, costs = null, targeting = null, side = 'ai' }) {
    this.getState = state;
    this.turnManager = turnManager;
    this.combat = combat;
    this.stack = stack;
    this.effects = effects;
    this.costs = costs;
    this.targeting = targeting;   // v12.74 : pour ne choisir que des sorts qui ont une cible légale
    this.side = side;
    this.opponent = side === 'ai' ? 'player' : 'ai';
  }

  // ─────────────────────────────────────────────
  // Main Decision Loop
  // ─────────────────────────────────────────────

  /**
   * Choose the best action for the current phase.
   * @returns {{action: string, data: Object}|null}
   */
  chooseAction() {
    const state = this.getState();
    const phase = this.turnManager.phase;
    const myState = state[this.side];

    switch (phase) {
      case 'main1':
      case 'main2':
        return this.#chooseMainPhaseAction(myState);
      case 'declareAttackers':
        return this.#chooseAttackers();
      case 'declareBlockers':
        return this.#chooseBlockers();
      default:
        return null;
    }
  }

  /**
   * Decide whether to respond to the current stack item.
   * @returns {{action: string, data: Object}|null}
   */
  chooseResponse() {
    const state = this.getState();
    const top = this.stack.top;
    if (!top) return null;
    if (top.controller === this.side) return null; // Don't counter own spells

    // Heuristique simple : contrer si l'on a un contresort en main, PAYABLE, avec une cible légale
    // (v12.74 : avant, on tentait un contresort non payable ou sans cible légale, que le moteur refusait).
    const COUNTER_TYPES = new Set(['counterSpell', 'counterCMC', 'counterSpellColor', 'counterUnlessPay']);
    const counter = state[this.side].hand.find((c) =>
      COUNTER_TYPES.has(c.effect?.type) && this.#canCast(c, state[this.side]) && this.#legalStackTarget(c, top)
    );
    if (counter) {
      return { action: 'castCounter', data: { card: counter, target: top } };
    }
    return null;
  }

  // ─────────────────────────────────────────────
  // Main Phase
  // ─────────────────────────────────────────────

  /** @param {import('../types.js').SideState} myState */
  #chooseMainPhaseAction(myState) {
    // Priority 1: Play a land if we haven't this turn
    // V11.0 fix — `p.playedThisTurn` est posé une fois pour toutes sur le
    // permanent au moment où il entre en jeu (cf. native-engine#playLand) et
    // n'est JAMAIS réinitialisé ensuite : ce n'est pas un compteur par tour,
    // c'est un horodatage. Baser la décision dessus faisait que l'IA ne
    // jouait plus jamais aucun terrain après son tout premier. La source de
    // vérité correcte, remise à zéro à chaque tour (turn-rules.js
    // resetTurnCounters), est `myState.landsPlayedThisTurn`.
    const land = myState.hand.find((c) => String(c.type || '').includes('Land'));
    // v12.76 : Worms of the Earth — aucun joueur ne peut jouer de terrain (sinon l'ordre serait rejeté à chaque tour).
    const landsForbidden = [...this.getState().player.battlefield, ...this.getState().ai.battlefield].some((p) => [].concat(p.static || []).some((e) => e && e.type === 'cantPlayLands'));
    if (land && !landsForbidden && !(myState.landsPlayedThisTurn >= 1)) {
      return { action: 'playLand', data: { card: land } };
    }

    // Priority 2: Cast a creature if we have mana
    const creature = myState.hand.find((c) =>
      String(c.type || '').includes('Creature') && this.#canCast(c, myState) && this.#hasLegalTarget(c)
    );
    if (creature) {
      return { action: 'castSpell', data: { card: creature } };
    }

    // Priority 3: Cast any other affordable spell
    // Un sort ne vise que s'il a une cible légale : un contresort ne se lance jamais « à vide » (pile vide).
    const spell = myState.hand.find((c) =>
      c.effect && this.#canCast(c, myState) && this.#hasLegalTarget(c)
    );
    if (spell) {
      return { action: 'castSpell', data: { card: spell } };
    }

    return null;
  }

  // ─────────────────────────────────────────────
  // Combat
  // ─────────────────────────────────────────────

  /** @returns {{action: string, data: {attackers: Permanent[]}}|null} */
  #chooseAttackers() {
    const valid = this.combat.getValidAttackers(this.side);
    // Attack with everything that has power > 0
    let attackers = valid.filter((a) => effectivePowerToughness(this.getState(), a).power > 0);
    // V12.76 (lot G15) : une créature OBLIGÉE d'attaquer (Erg Raiders, Juggernaut) est toujours déclarée, même à force nulle (règle, pas stratégie) :
    // sinon la déclaration est refusée par le moteur (échec d'action de l'IA).
    const forced = valid.filter((a) => this.combat.isRequiredToAttack(a));
    attackers = [...new Set([...forced, ...attackers])];
    // v12.76 : Caverns of Despair — pas plus de N attaquants ; on garde d'abord les obligatoires, puis les plus forts.
    const maxA = this.combat.attackLimit();
    if (attackers.length > maxA) attackers = attackers.sort((x, y) => (forced.includes(y) - forced.includes(x)) || (effectivePowerToughness(this.getState(), y).power - effectivePowerToughness(this.getState(), x).power)).slice(0, maxA);
    if (attackers.length === 0) return null;
    return { action: 'declareAttackers', data: { attackers } };
  }

  /** @returns {{action: string, data: {blockers: Object}}|null} */
  #chooseBlockers() {
    const state = this.getState();
    const attackers = this.combat.combat?.attackers || [];
    const blockers = this.combat.getValidBlockers(this.side);
    if (blockers.length === 0 || attackers.length === 0) return null;

    const assignments = {};
    // v12.76 : Lure / « doit être bloquée par toutes les créatures qui peuvent » — l'IA assigne d'abord tous les
    // bloqueurs légaux à ces attaquants (sinon la déclaration entière serait rejetée).
    const forced = attackers.filter((a) => a.mustBeBlocked || effectiveKeywords(state, a).includes('lure'));
    for (const attacker of forced) {
      const legal = this.combat.getValidBlockers(this.side, attacker).filter((b) => blockers.includes(b));
      if (legal.length === 0) continue;
      assignments[attacker.uid] = legal.map((b) => b.uid);
      for (const b of legal) blockers.splice(blockers.indexOf(b), 1);
    }
    for (const attacker of attackers) {
      if (assignments[attacker.uid]) continue;
      // v12.74 : bloqueurs LÉGAUX contre CET attaquant (volant, peur, intimidation...) — avant, une seule
      // affectation illégale faisait rejeter TOUTE la déclaration de blocage de l'IA.
      const legal = new Set(this.combat.getValidBlockers(this.side, attacker));
      // Menace : exige deux bloqueurs ; l'IA n'en assigne qu'un seul -> elle ne bloque pas cet attaquant.
      if (effectiveKeywords(state, attacker).includes('menace')) continue;
      // Find a blocker that survives the trade
      const bestBlocker = blockers.find((b) => {
        if (!legal.has(b)) return false;
        const bToughness = effectivePowerToughness(state, b).toughness;
        const aPower = effectivePowerToughness(state, attacker).power;
        return bToughness > aPower;
      });
      if (bestBlocker) {
        assignments[attacker.uid] = [bestBlocker.uid];
        // Remove used blocker
        const idx = blockers.indexOf(bestBlocker);
        if (idx > -1) blockers.splice(idx, 1);
      }
    }

    if (Object.keys(assignments).length === 0) return null;
    // v12.76 : Caverns of Despair — pas plus de N bloqueurs ; on retire les affectations en trop.
    const maxB = this.combat.blockLimit();
    let used = 0;
    for (const k of Object.keys(assignments)) { used += assignments[k].length; }
    if (used > maxB) { let n = 0; for (const k of Object.keys(assignments)) { const keep = assignments[k].slice(0, Math.max(0, maxB - n)); if (keep.length) { assignments[k] = keep; n += keep.length; } else delete assignments[k]; } }
    if (Object.keys(assignments).length === 0) return null;
    return { action: 'declareBlockers', data: { blockers: assignments } };
  }

  // ─────────────────────────────────────────────
  // Mana & Casting
  // ─────────────────────────────────────────────

  /**
   * Check if a card can be cast with available mana.
   * @param {Card} card
   * @param {import('../types.js').SideState} sideState
   * @returns {boolean}
   */
  #canCast(card, sideState) {
    // V12.76 (G29) : fenêtre de timing propre à la carte (sinon le moteur refuse le lancer et le banc compte une erreur d'action).
    if (card.castOnlyDuring && !isCastTimingLegal(card.castOnlyDuring, { phase: this.getState().phase, activePlayer: this.getState().activePlayer }, this.side)) return false;
    if (!card.cost) return true;
    if (!this.costs) return false;

    // V12: the AI must use the same canonical payment validator as the
    // engine. This prevents false positives such as trying to pay 1B from
    // a pool containing only two generic/white mana.
    const maxX = card.xSpell ? this.#maxAffordableX(card, sideState) : 0;
    return this.costs.canPay(this.side, card.cost, { controller: this.side, card, xValue: maxX });
  }

  #maxAffordableX(card, sideState) {
    if (!card.xSpell) return 0;
    let best = 0;
    const upper = Math.min(20, Object.values(sideState.mana || {}).reduce((a, b) => a + Number(b || 0), 0));
    for (let x = 0; x <= upper; x += 1) {
      if (this.costs.canPay(this.side, card.cost, { controller: this.side, card, xValue: x })) best = x;
    }
    return best;
  }

  /**
   * v12.74 — Le sort a-t-il au moins une cible légale ? (sans cible requise : toujours vrai).
   * Sans service de ciblage (tests unitaires), on reste permissif comme avant.
   */
  #legalStackTarget(card, item) {
    if (!this.targeting) return true;
    return (this.targeting.validTargets(card.effect.type, this.side, [], card.effect, card) || []).some((o) => o.id === item.id);
  }

  #hasLegalTarget(card) {
    const type = card?.effect?.type;
    if (!type || !this.targeting?.needsTarget?.(type)) return true;
    return (this.targeting.validTargets(type, this.side, [], card.effect, card) || []).length > 0;
  }

  canCast(card, xValue = 0) {
    if (!this.costs) return false;
    return this.costs.canPay(this.side, card?.cost || '', { controller: this.side, card, xValue });
  }

  // ─────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────

  /** @returns {string} */
  getStatus() {
    const state = this.getState();
    const my = state[this.side];
    return `AI[${this.side}] hand=${my.hand.length} mana=${Object.values(my.mana).reduce((a,b)=>a+b,0)} life=${my.life}`;
  }
}
