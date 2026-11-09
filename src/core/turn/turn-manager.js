// @ts-check
/**
 * @fileoverview MTG Beta V8.13 — Turn Manager
 * Orchestrates the full MTG turn structure with explicit phase transitions,
 * automatic SBA checks, and trigger emission.
 */

/** @typedef {import('../types.js').GameState} GameState */

import { gameEvents } from '../event-bus.js';
import { effectiveTypes, calculateCharacteristics } from '../continuous-effects.js';
import { phaseAllowsPriority, emptyManaPool, resetTurnCounters, clearUntilCleanup } from './turn-rules.js';

export const TurnPhase = Object.freeze({
  UNTAP: 'untap',
  UPKEEP: 'upkeep',
  DRAW: 'draw',
  MAIN1: 'main1',
  COMBAT_BEGIN: 'combatBegin',
  DECLARE_ATTACKERS: 'declareAttackers',
  DECLARE_BLOCKERS: 'declareBlockers',
  COMBAT_DAMAGE: 'combatDamage',
  COMBAT_END: 'combatEnd',
  MAIN2: 'main2',
  END_STEP: 'endStep',
  CLEANUP: 'cleanup',
});

const PHASE_ORDER = [
  TurnPhase.UNTAP,
  TurnPhase.UPKEEP,
  TurnPhase.DRAW,
  TurnPhase.MAIN1,
  TurnPhase.COMBAT_BEGIN,
  TurnPhase.DECLARE_ATTACKERS,
  TurnPhase.DECLARE_BLOCKERS,
  TurnPhase.COMBAT_DAMAGE,
  TurnPhase.COMBAT_END,
  TurnPhase.MAIN2,
  TurnPhase.END_STEP,
  TurnPhase.CLEANUP,
];

export class TurnManager {
  /**
   * @param {Object} deps
   * @param {() => GameState} deps.state
   * @param {import('../state-based-actions.js').StateBasedActions} deps.sba
   * @param {import('../combat.js').CombatService} deps.combat
   * @param {import('../triggers/trigger-engine.js').TriggerEngine} [deps.triggerEngine]
   * @param {string} [deps.startingPlayer]
   */
  constructor({ state, sba, combat, triggerEngine = null, startingPlayer = 'player', zones = null, replacements = null }) {
    this.getState = state;
    this.sba = sba;
    this.combat = combat;
    this.triggerEngine = triggerEngine;
    this.zones = zones;
    this.replacements = replacements;
    this.activePlayer = startingPlayer;
    this.turnNumber = 1;
    this.phaseIndex = 0;
    this.phase = TurnPhase.UNTAP;
    this.priorityPlayer = startingPlayer;
    this.combatDeclared = false;
    this.blockersDeclared = false;
    this.extraTurns = 0;
    this.phaseStarted = false;
  }

  /** @returns {{turn: number, phase: string, activePlayer: string}} */
  get snapshot() {
    return {
      turn: this.turnNumber,
      phase: this.phase,
      activePlayer: this.activePlayer,
      priorityPlayer: this.priorityPlayer,
    };
  }

  // ─────────────────────────────────────────────
  // Phase Navigation
  // ─────────────────────────────────────────────

  /** Advance to the next phase, entering it and executing its turn-based action. */
  nextPhase() {
    const state = this.getState();
    // V12.76 (G25) : une question « sauter ce tour ? » (Time Vault) est posée : le jeu ne bouge pas tant qu'elle n'est pas résolue.
    if (this.choiceService?.getPending?.()?.type === 'skipTurn') return this.snapshot;
    this.sba.check(state);
    this.#emptyManaPoolsAtBoundary(state);
    // Mana burn can reduce a player to 0 or less life, so SBA must be
    // re-checked before the phase transition proceeds.
    this.sba.check(state);
    let nextIndex = this.phaseIndex + 1;
    let newTurn = false;
    if (nextIndex >= PHASE_ORDER.length) {
      nextIndex = 0;
      newTurn = true;
    }
    if (newTurn) {
      // V12.76 (G25) : le propriétaire du prochain tour est désigné par #startNewTurn (tours supplémentaires, reprise, Time Vault) ;
      // si une question est posée (sauter le tour ?), l'avancée est suspendue et reprise dans sa continuation.
      this.#startNewTurn(state, () => this.#completeNextPhase(state, nextIndex));
      return this.snapshot;
    }
    this.#completeNextPhase(state, nextIndex);
    return this.snapshot;
  }

  /** Désigne qui joue le prochain tour, applique le saut éventuel (Time Vault), puis appelle `done()`. */
  #startNewTurn(state, done, guard = 0) {
    // V12.76 (G24) : tours supplémentaires (Time Walk) — `state.extraTurnQueue` = camps qui jouent un tour de plus « après celui-ci ».
    // Après la série de tours supplémentaires, le jeu reprend avec le joueur qui AURAIT suivi (`state.resumeAfterExtra`).
    const other = (side) => (side === 'player' ? 'ai' : 'player'); const queue = state.extraTurnQueue || (state.extraTurnQueue = []);
    if (this.extraTurns > 0) this.extraTurns -= 1;
    else if (queue.length) { if (!state.resumeAfterExtra) state.resumeAfterExtra = other(this.activePlayer); this.activePlayer = queue.shift(); }
    else if (state.resumeAfterExtra) { this.activePlayer = state.resumeAfterExtra; state.resumeAfterExtra = null; }
    else this.activePlayer = other(this.activePlayer);
    const owner = this.activePlayer;
    const begin = () => { this.turnNumber += 1; resetTurnCounters(state[owner]); done(); };
    // V12.76 (G25) : Time Vault — « si vous deviez commencer votre tour alors que cet artefact est engagé, vous pouvez sauter ce tour à la place ;
    // si vous le faites, dégagez-le ». Décision prise AVANT le début du tour, seulement si l'artefact est engagé à cet instant. Le tour sauté n'a pas lieu
    // (pas de numéro de tour, pas d'étape de dégagement) ; le joueur suivant est désigné comme si ce tour avait été joué. Limite connue : l'IA ne saute jamais.
    const vault = guard < 6 && owner === 'player' && this.choiceService
      ? (state[owner]?.battlefield || []).find((p) => p?.tapped && [].concat(p.static || []).some((e) => e?.type === 'skipTurnIfTapped')) : null;
    if (!vault) { begin(); return; }
    const finish = (picked) => {
      const c = Array.isArray(picked) ? picked[0] : picked;
      if (c === 'skip') { vault.tapped = false; gameEvents.emit({ type: 'log', msg: `${vault.name} : le tour est sauté ; ${vault.name} se dégage.`, side: owner }); this.#startNewTurn(state, done, guard + 1); }
      else begin();
      return c;
    };
    const chosen = this.choiceService.request({ type: 'skipTurn', controller: owner, options: ['skip', 'play'], defaultValue: 'play', prompt: `${vault.name} est engagé : sauter ce tour et le dégager ?` }, finish);
    if (chosen != null) finish(chosen);
    // sinon : question en attente ; `finish` sera appelée à la résolution (la phase n'a pas avancé).
  }

  /** Entre dans la phase `nextIndex` (après désignation du joueur actif) et exécute son action de tour. */
  #completeNextPhase(state, nextIndex) {
    this.phaseIndex = nextIndex;
    this.phase = PHASE_ORDER[this.phaseIndex];
    this.combatDeclared = false;
    this.blockersDeclared = false;
    this.#onPhaseEnter();
    state.turnNumber = this.turnNumber;
    state.activePlayer = this.activePlayer;
    state.phase = this.phase;

    // Execute the turn-based action as part of entering the new phase.
    // Consumers therefore never observe a phase whose mandatory entry action
    // is still pending.
    this.#executeCurrentPhaseAction();
    this.phaseStarted = true;

    // Step events are emitted after the entry action so their observers see a
    // coherent phase/state snapshot. This also guarantees that priority is not
    // exposed before draw/combat damage/cleanup has completed.
    gameEvents.emit({ type:'phaseChanged', phase:this.phase, turn:this.turnNumber, activePlayer:this.activePlayer, priorityAvailable:phaseAllowsPriority(this.phase) });
    if (this.phase === TurnPhase.UPKEEP) gameEvents.emit({ type:'upkeepStarted', side:this.activePlayer, activePlayer:this.activePlayer });
    if (this.phase === TurnPhase.DRAW) gameEvents.emit({ type:'drawStepStarted', side:this.activePlayer, activePlayer:this.activePlayer });
    if (this.phase === TurnPhase.COMBAT_BEGIN) gameEvents.emit({ type:'combatStarted', side:this.activePlayer, activePlayer:this.activePlayer });
    if (this.phase === TurnPhase.END_STEP) this.delayedRunner?.('nextEndStep'); // V12.76 (G28)
    if (this.phase === TurnPhase.END_STEP) gameEvents.emit({ type:'endStepStarted', side:this.activePlayer, activePlayer:this.activePlayer });

    // Recompute priority after the entry action. This is especially important
    // for draw/combat-damage, which are turn-based actions performed on entry.
    state.turnNumber = this.turnNumber;
    state.activePlayer = this.activePlayer;
    state.phase = this.phase;
    state.priorityHolder = phaseAllowsPriority(this.phase) ? this.priorityPlayer : null;
    this.priorityPlayer = state.priorityHolder;
  }

  /**
   * Jump to a specific phase (for testing/debugging).
   * @param {string} targetPhase
   */
  gotoPhase(targetPhase) {
    const idx = PHASE_ORDER.indexOf(targetPhase);
    if (idx === -1) throw new Error(`Unknown phase: ${targetPhase}`);
    this.phaseIndex = idx;
    this.phase = targetPhase;
    this.phaseStarted = false;
    if (targetPhase === TurnPhase.DECLARE_ATTACKERS) this.combatDeclared = false;
    if (targetPhase === TurnPhase.DECLARE_BLOCKERS) this.blockersDeclared = false;
    this.#onPhaseEnter();
    return this.snapshot;
  }

  /**
   * Execute consecutive no-priority phases until a real decision window is
   * reached.
   */
  advanceAutomaticPhases(maxSteps = 8) {
    let steps = 0;
    while (!phaseAllowsPriority(this.phase)) {
      if (steps++ >= maxSteps) throw new Error('Boucle de phases automatiques dépassant la limite de sécurité.');
      this.runPhase();
      const state = this.getState();
      if (state?.player?.hasLost || state?.ai?.hasLost) break;
    }
    return this.snapshot;
  }

  /**
   * Execute the current phase if it has been entered without execution (e.g.
   * gotoPhase in tests/debugging); otherwise advance to the next phase.
   */
  runPhase() {
    if (!this.phaseStarted) {
      this.#executeCurrentPhaseAction();
      this.phaseStarted = true;
      const state = this.getState();
      state.turnNumber = this.turnNumber;
      state.activePlayer = this.activePlayer;
      state.phase = this.phase;
      state.priorityHolder = phaseAllowsPriority(this.phase) ? this.priorityPlayer : null;
      this.priorityPlayer = state.priorityHolder;
      return this.snapshot;
    }
    return this.nextPhase();
  }

  #executeCurrentPhaseAction() {
    switch (this.phase) {
      case TurnPhase.UNTAP: this.#runUntap(); break;
      case TurnPhase.UPKEEP: this.#runUpkeep(); break;
      case TurnPhase.DRAW: this.#runDraw(); break;
      case TurnPhase.MAIN1:
      case TurnPhase.MAIN2: this.#runMain(); break;
      case TurnPhase.COMBAT_BEGIN:
        this.combat.begin();
        break;
      case TurnPhase.DECLARE_ATTACKERS:
        if (this.combat.combat) this.combat.combat.phase = 'declareAttackers';
        break;
      case TurnPhase.DECLARE_BLOCKERS:
        if (this.combat.combat) this.combat.combat.phase = 'declareBlockers';
        break;
      case TurnPhase.COMBAT_DAMAGE: this.#runCombatDamage(); break;
      case TurnPhase.COMBAT_END: this.delayedRunner?.('endOfCombat'); this.combat.end(); break; // V12.76 (G28) : « à la fin du combat, détruisez… »
      case TurnPhase.END_STEP: this.#runEndStep(); break;
      case TurnPhase.CLEANUP: this.#runCleanup(); break;
    }
  }

  // ─────────────────────────────────────────────
  // Phase Implementations
  // ─────────────────────────────────────────────

  #runUntap() {
    const state = this.getState();
    state.priorityHolder = null;
    const side = state[this.activePlayer];
    // V12.76 (G32) : Tangle Kelp — « ne se dégage pas si elle a attaqué lors du DERNIER tour de son contrôleur ». `attackedFlag` est posé à l'attaque et remis à zéro ici, à
    // chaque étape de dégagement de son contrôleur : vrai à cet instant = elle a attaqué pendant son tour précédent.
    const attackedLast = new Set(side.battlefield.filter((p) => p.attackedFlag)); for (const p of side.battlefield) p.attackedFlag = false;
    if (this.#hasStatic('skipUntap', this.activePlayer)) { side.skipUntap = false; gameEvents.emit({type:'untapSkipped', side:this.activePlayer}); return; }
    // V12.75 : Stasis (« les joueurs sautent leur phase de dégagement »), Smoke (« les créatures ne se dégagent pas ») et
    // Winter Orb (« chaque joueur ne dégage qu'un seul terrain ») n'étaient lus par personne : leurs statiques restaient lettre morte.
    if (this.#hasStatic('skipUntapPhase', this.activePlayer)) { gameEvents.emit({type:'untapSkipped', side:this.activePlayer}); return; }
    const noCreatures = this.#hasStatic('cantUntapCreatures', this.activePlayer);
    const oneLand = this.#hasStatic('untapLock', this.activePlayer);
    let landsUntapped = 0;
    // V12.76 (G12) : « vous pouvez choisir de ne pas dégager ce terrain » (terrains de stockage) : UN seul choix pour le joueur humain,
    // les permanents concernés restent engagés jusqu'à sa réponse ; l'IA les dégage toujours.
    const mayChoose = this.activePlayer === 'player' && !oneLand && !!this.choiceService;
    const optional = [];
    for (const perm of side.battlefield) {
      // BUG A (audit v12.66) : perm.tapAbility?.doesntUntap (donnée déjà
      // présente pour Mana Vault) n'était jamais consultée ici -- seul
      // perm.cantUntap (mécanisme distinct, alimenté par des effets comme
      // paralyze) bloquait le dégagement.
      if (attackedLast.has(perm) && calculateCharacteristics(state, perm).keywords.includes('nountapifattackedlastturn')) continue; // V12.76 (G32) Tangle Kelp
      if (perm.tapped && !perm.cantUntap && !perm.tapAbility?.doesntUntap && !(Array.isArray(perm.keywords) && perm.keywords.includes('doesntUntap'))) { // V12.75 : « ne se dégage pas » portée par un mot-clé (Brass Man) n'était pas lue
        if (noCreatures && /\bCreature\b/i.test(String(effectiveTypes(state, perm).type || ''))) continue;
        if (oneLand && /\bLand\b/i.test(String(effectiveTypes(state, perm).type || ''))) {
          if (landsUntapped >= 1) continue; // le choix du terrain est automatique (premier terrain engagé)
          landsUntapped++;
        }
        if (mayChoose && perm.mayNotUntap) { optional.push(perm); continue; }
        perm.tapped = false;
        gameEvents.emit({ type: 'permanentUntapped', permanent: perm, side: this.activePlayer });
      }
    }
    if (optional.length) {
      const untapUnlessKept = (value) => {
        const kept = (Array.isArray(value) ? value : [value]).map((x) => x?.uid ?? x);
        for (const p of optional) if (p.tapped && !kept.includes(p.uid)) { p.tapped = false; gameEvents.emit({ type: 'permanentUntapped', permanent: p, side: this.activePlayer }); }
      };
      const chosen = this.choiceService.request({ type: 'keepTapped', controller: this.activePlayer, options: optional, min: 0, max: optional.length, defaultValue: [], prompt: 'Choisissez les permanents que vous NE dégagez PAS (aucun : tous se dégagent).' });
      if (chosen != null) untapUnlessKept(chosen);
      else { const pending = this.choiceService.getPending(); if (pending) pending._continuation = (value) => { untapUnlessKept(value); return value; }; else untapUnlessKept([]); }
    }
  }

  #runUpkeep() {
    // Triggers are emitted by phaseChanged event, caught by TriggerEngine
    // This is where upkeep cost effects resolve
  }

  #runDraw() {
    const state = this.getState();
    const side = state[this.activePlayer];
    // BUG A (audit v12.66) : perm.tapAbility?.upkeepDamage (Mana Vault : 1
    // blessure si toujours engagée à la pioche) n'était jamais appliqué.
    // Générique : n'importe quel futur permanent avec ce champ de donnée
    // bénéficie du même comportement sans code supplémentaire.
    for (const perm of side.battlefield) {
      if (perm.tapped && perm.tapAbility?.doesntUntap && perm.tapAbility?.upkeepDamage) {
        const amount = Number(perm.tapAbility.upkeepDamage);
        if (this.replacements?.applyDamageToPlayer) {
          this.replacements.applyDamageToPlayer(this.activePlayer, amount, { color: null, source: perm, meta: { reason: 'tapAbilityUpkeepDamage' } });
        } else {
          side.life -= amount;
        }
        gameEvents.emit({ type: 'tapAbilityUpkeepDamage', permanent: perm, side: this.activePlayer, amount });
      }
    }
    if (this.#hasStatic('skipDraw', this.activePlayer)) { side.hasDrawnThisTurn = true; gameEvents.emit({type:'drawSkipped', side:this.activePlayer}); return; }
    if (side.hasDrawnThisTurn) return;
    side.hasDrawnThisTurn = true;
    if (side.library.length > 0) {
      // ZoneManager.move() resolves the object from its current zone. Do not
      // pop it first: removing it from the library makes the lookup fail.
      const card = side.library[side.library.length - 1];
      if (this.zones) this.zones.move(card, 'hand', { toSide: this.activePlayer, reason: 'draw' });
      else side.hand.push(side.library.pop());
    } else {
      side.mustDraw = true;
      this.sba.check(state);
    }
  }

  #emptyManaPoolsAtBoundary(state) {
    for (const side of ['player', 'ai']) {
      const amount = emptyManaPool(state[side]);
      if (amount <= 0) continue;

      if (this.replacements?.applyDamageToPlayer) {
        this.replacements.applyDamageToPlayer(side, amount, {
          color: null,
          source: null,
          meta: { manaBurn: true, reason: 'phaseBoundary' },
        });
      } else {
        state[side].life -= amount;
      }

      gameEvents.emit({ type:'manaPoolEmptied', side, amount, reason:'phaseBoundary', manaBurn:true });
    }
  }

  #runMain() {
    // Main phase: player/AI can play lands, cast spells, activate abilities.
    // Seule action automatique : le mana différé (Mana Drain) arrive au début de
    // la prochaine phase principale de son contrôleur.
    const side = this.getState()[this.activePlayer];
    for (const d of side.delayedMana || []) {
      side.mana = side.mana || {};
      side.mana.C = (side.mana.C || 0) + Number(d.amount || 0);
      gameEvents.emit({ type: 'delayedManaAdded', side: this.activePlayer, amount: d.amount, source: d.source });
    }
    if (side.delayedMana?.length) side.delayedMana = [];
  }

  #runCombatDamage() {
    if (this.combat.isActive && this.combat.currentPhase === 'combatDamage') {
      const events = this.combat.resolveDamage();
      this.sba.check(this.getState());
      return events;
    }
    return [];
  }

  #runEndStep() {
    // V12.76 (G9) : changements de contrôle différés « au début de la prochaine étape de fin » (Rainbow Vale).
    // Une activation faite PENDANT l'étape de fin est enregistrée après ce passage : elle attend l'étape de fin suivante.
    const state = this.getState();
    const pending = state.delayedControl || [];
    if (!pending.length) return;
    state.delayedControl = [];
    for (const d of pending) {
      const perm = [...state.player.battlefield, ...state.ai.battlefield].find((p) => p.uid === d.uid);
      if (!perm || !state[d.to] || perm.controller === d.to) continue; // a quitté le champ de bataille, ou déjà chez ce joueur
      if (this.zones) this.zones.changeController(perm, d.to, { reason: 'delayedControl' });
      else { const from = perm.controller; state[from].battlefield.splice(state[from].battlefield.indexOf(perm), 1); perm.controller = d.to; state[d.to].battlefield.push(perm); }
    }
  }

  #runCleanup() {
    const state = this.getState();
    const side = state[this.activePlayer];
    // Cleanup expires cleanup-scoped effects for permanents on both sides.
    // The cleanup step belongs to the active player, but its expiration sweep
    // is global to the battlefield; do not leave the opponent's temporary
    // state alive into the next turn.
    clearUntilCleanup(state.player);
    clearUntilCleanup(state.ai);
    state.fogActive = false; // V12.75 : la prévention « ce tour-ci » de Fog / Holy Day / Darkness expire au nettoyage
    // V12.75 : les boucliers de prévention « jusqu'à la fin du tour » (until:'cleanup') n'expiraient JAMAIS : le seul code qui les purgeait
    // écoutait un événement `cleanupStarted` que personne n'émet. Un bouclier posé ce tour-ci protégeait donc pour toute la partie.
    for (const sd of ['player', 'ai']) {
      if (Array.isArray(state[sd].prevention)) state[sd].prevention = state[sd].prevention.filter((sh) => sh.persistent); // V12.76 (G31) : `nextMatchingDamage` (« ce tour-ci ») expire aussi
    }
    for (const perm of [...state.player.battlefield, ...state.ai.battlefield]) {
      if (perm.damageMarked > 0) perm.damageMarked = 0;
      if (perm.summoningSickness && perm.enteredTurn != null && perm.enteredTurn < this.turnNumber) perm.summoningSickness = false;
    }
    while (side.hand.length > 7) {
      // ZoneManager.move() must see the card in its source zone; do not pop
      // it before resolving the zone change.
      const discarded = side.hand[side.hand.length - 1];
      if (this.zones) this.zones.move(discarded, 'graveyard', { toSide: discarded.owner || this.activePlayer, reason: 'handSize' });
      else side.graveyard.push(side.hand.pop());
      gameEvents.emit({ type:'discardedToHandSize', card:discarded, side:this.activePlayer });
    }
    gameEvents.emit({type:'cleanupCompleted', side:this.activePlayer, turn:this.turnNumber});
  }

  #hasStatic(type, side) {
    const state = this.getState();
    return ['player','ai'].some(s => (state[s]?.battlefield || []).some(p => {
      const list = Array.isArray(p.static) ? p.static : (p.static ? [p.static] : []);
      // V12.76 (G23) : `whileUntapped` — « tant que cet artefact est dégagé » (Winter Orb) : un permanent ENGAGÉ au début de l'étape ne pèse pas.
      return list.some(e => e?.type === type && !(e.whileUntapped && p.tapped) && (e.controller === 'all' || e.controller === side || !e.controller));
    }));
  }

  #onPhaseEnter() {
    const state = this.getState();
    if (!phaseAllowsPriority(this.phase)) {
      this.priorityPlayer = null;
    } else if (this.phase === TurnPhase.DECLARE_BLOCKERS) {
      // The defending player is the non-active player. The active player
      // cannot advance through the blockers window on their own.
      this.priorityPlayer = this.activePlayer === 'player' ? 'ai' : 'player';
    } else {
      this.priorityPlayer = this.activePlayer;
    }
    state.priorityHolder = this.priorityPlayer;
  }

  takeExtraTurn() { this.extraTurns += 1; gameEvents.emit({type:'extraTurnScheduled', player:this.activePlayer, count:this.extraTurns}); }

  // ─────────────────────────────────────────────
  // Combat Helpers
  // ─────────────────────────────────────────────

  beginCombat() {
    this.gotoPhase(TurnPhase.COMBAT_BEGIN);
    return this.combat.begin();
  }

  declareAttackers(attackers) {
    if (this.phase !== TurnPhase.DECLARE_ATTACKERS) this.gotoPhase(TurnPhase.DECLARE_ATTACKERS);
    const result = this.combat.confirmAttackers(attackers, this.activePlayer);
    this.combatDeclared = true;

    // The combat service records the declaration itself, but TurnManager is
    // the authority for the turn phase. Enter the blockers window immediately
    // after a legal attacker declaration without executing a second action.
    this.phaseIndex = PHASE_ORDER.indexOf(TurnPhase.DECLARE_BLOCKERS);
    this.phase = TurnPhase.DECLARE_BLOCKERS;
    this.phaseStarted = true;
    this.#onPhaseEnter();
    const state = this.getState();
    state.turnNumber = this.turnNumber;
    state.activePlayer = this.activePlayer;
    state.phase = this.phase;
    state.priorityHolder = this.priorityPlayer;
    gameEvents.emit({ type:'phaseChanged', phase:this.phase, turn:this.turnNumber, activePlayer:this.activePlayer, priorityAvailable:true });
    return result;
  }

  declareBlockers(blockerMap) {
    if (this.phase !== TurnPhase.DECLARE_BLOCKERS) this.gotoPhase(TurnPhase.DECLARE_BLOCKERS);
    this.combat.assignBlockers(blockerMap || {});
    this.blockersDeclared = true;

    // The combat service now has the blocker declaration. Move the turn
    // machine to combat damage, but do not resolve damage here: combat damage
    // remains a turn-based action executed when this phase is processed.
    this.phaseIndex = PHASE_ORDER.indexOf(TurnPhase.COMBAT_DAMAGE);
    this.phase = TurnPhase.COMBAT_DAMAGE;
    this.phaseStarted = false;
    this.#onPhaseEnter();
    const state = this.getState();
    state.turnNumber = this.turnNumber;
    state.activePlayer = this.activePlayer;
    state.phase = this.phase;
    state.priorityHolder = this.priorityPlayer;
    gameEvents.emit({ type:'phaseChanged', phase:this.phase, turn:this.turnNumber, activePlayer:this.activePlayer, priorityAvailable:true });
    return this.combat;
  }

  resolveCombatDamage() {
    this.gotoPhase(TurnPhase.COMBAT_DAMAGE);
    return this.#runCombatDamage();
  }
}
