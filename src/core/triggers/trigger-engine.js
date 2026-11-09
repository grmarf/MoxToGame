// @ts-check
/**
 * @fileoverview MTG Beta V8.13 — Trigger Engine
 * Listens to canonical game events and automatically pushes
 * matching triggers onto the stack via TriggerCollector.
 */

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').StackItem} StackItem */

import { gameEvents } from '../event-bus.js';
import { orderTriggers } from '../stack/trigger-ordering.js';

/**
 * Maps canonical event types to trigger event names.
 */
const EVENT_MAP = Object.freeze({
  combatDamageToPlayer: 'damageDealt',
  combatDamageToCreature: 'damageDealt',
  creatureDied: 'creatureDied',
  permanentEntered: 'permanentEntered',
  spellCast: 'spellCast',
  playerLost: 'playerLost',
  upkeepStarted: 'upkeepStarted',
  endStepStarted: 'endStepStarted',
  drawStepStarted: 'drawStepStarted',
  artifactAbilityActivated: 'artifactAbilityActivated', // V12.76 : Haunting Wind
  permanentTapped: 'permanentTapped', // V12.76 (G16) : « devient engagé » (Psychic Venom, Blight...)
  creatureBlocked: 'creatureBlocked', attackerUnblocked: 'attackerUnblocked', damageDealtToPlayer: 'damageDealtToPlayer', // V12.76 (G28)
  permanentLeft: 'permanentLeft', // V12.76 (G27) : « quand ce permanent quitte le champ de bataille » (Goblin Shrine) ; regard en arrière déjà géré par le collecteur
});

export class TriggerEngine {
  /**
   * @param {Object} deps
   * @param {import('./trigger-collector.js').TriggerCollector} deps.collector
   * @param {import('../stack.js').StackController} deps.stack
   * @param {() => string} deps.getActivePlayer
   * @param {Function} [deps.chooser]
   */
  constructor({ collector, stack, getActivePlayer, chooser = null }) {
    if (!collector) throw new Error('TriggerEngine requires a collector');
    if (!stack) throw new Error('TriggerEngine requires a stack');
    this.collector = collector;
    this.stack = stack;
    this.getActivePlayer = getActivePlayer;
    this.chooser = chooser;
    this.unsubscribers = [];
    this.#subscribe();
  }

  /**
   * v12.74 — Se désabonne du bus d'événements GLOBAL. Sans cela, chaque partie créée dans le même
   * processus laissait ses écouteurs actifs (fuite + travail inutile à chaque événement) : inacceptable
   * pour un banc qui enchaîne des centaines de parties.
   */
  dispose() {
    for (const off of this.unsubscribers) { try { off?.(); } catch { /* déjà retiré */ } }
    this.unsubscribers = [];
  }

  /** Subscribe to all canonical game events. */
  #subscribe() {
    // TriggerEngine is the sole event -> trigger -> stack pipeline.
    // The collector intentionally stays passive to prevent duplicate pushes.
    // V12.75 : un permanent qui QUITTE le champ de bataille (destruction, rebond, exil, sacrifice...) doit cesser de déclencher.
    // Avant, seul `creatureDied` désenregistrait : un artefact ou un enchantement détruit gardait ses déclencheurs actifs pour
    // toute la partie (Black Vise détruit infligeait encore des blessures chaque entretien). L'objet qui change de zone reçoit
    // une NOUVELLE identité ; on désenregistre donc par l'ancienne (`oldObjectId`) et par l'objet lui-même.
    this.unsubscribers.push(gameEvents.on('zoneChanged', (evt) => {
      if (evt.from !== 'battlefield' || evt.to === 'battlefield') return;
      if (evt.object) this.collector.markSourceLeft(evt.object);
      this.collector.markSourceLeftByObjectId(evt.oldObjectId);
    }));
    for (const [canonicalEvent, triggerEvent] of Object.entries(EVENT_MAP)) {
      this.unsubscribers.push(gameEvents.on(canonicalEvent, (evt) => {
        if (canonicalEvent === 'permanentEntered' && evt.permanent) {
          this.registerPermanent(evt.permanent, evt.side || evt.controller);
        }
        const normalized = { ...evt, type: triggerEvent };
        if (triggerEvent === 'damageDealt' && !normalized.targetType) {
          normalized.targetType = typeof normalized.target === 'string' ? 'player' : 'creature';
        }
        this.handle(normalized);
        if (canonicalEvent === 'creatureDied' && evt.permanent) {
          this.unregisterPermanent(evt.permanent);
        }
      }));
    }

    // TurnManager emits canonical step events directly. Do not synthesize them
    // again from phaseChanged: doing so would duplicate upkeep/end-step triggers.
    this.unsubscribers.push(gameEvents.on('phaseChanged', (evt) => {
      if (evt.phase === 'cleanup') this.collector.pruneExpired?.(evt.turn);
    }));
  }

  registerPermanent(permanent, controller = null) {
    if (!permanent) return [];
    const side = controller || this.#findController(permanent);
    return this.collector.registerSource(permanent, side);
  }

  unregisterPermanent(permanent) {
    if (permanent) this.collector.unregisterSource(permanent);
  }

  syncBattlefield(state) {
    this.collector.clear();
    for (const side of ['player', 'ai']) {
      for (const permanent of state?.[side]?.battlefield || []) {
        this.registerPermanent(permanent, side);
      }
    }
  }

  #findController(permanent) {
    const state = this.collector.getGameState?.();
    if (!state) return null;
    for (const side of ['player', 'ai']) {
      if (state[side]?.battlefield?.includes(permanent)) return side;
    }
    return null;
  }

  /**
   * Handle a canonical event by collecting and pushing triggers.
   * @param {{type: string}} event
   * @returns {StackItem[]}
   */
  handle(event) {
    const triggers = this.collector.collect(event);
    if (!triggers.length) return [];

    const activePlayer = this.getActivePlayer();
    const ordered = orderTriggers(triggers, activePlayer, this.chooser);

    for (const trigger of ordered) {
      this.stack.pushTrigger(trigger, trigger.controller);
    }

    gameEvents.emit({
      type: 'triggersPushed',
      count: ordered.length,
      eventType: event.type,
    });

    return ordered;
  }

  /** Manually scan all registered sources for a given event (useful for testing). */
  scanAndPush(eventType, context = {}) {
    const event = { type: eventType, ...context };
    return this.handle(event);
  }
}
