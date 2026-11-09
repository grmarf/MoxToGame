// @ts-check
/**
 * @fileoverview MTG Beta V8.15 — Action History & Replay
 * Immutable timeline of every dispatched command with state diffs.
 * Enables undo, replay, and regression testing.
 */

/** @typedef {import('./types.js').GameState} GameState */

import { gameEvents } from './event-bus.js';
import { serializeState, diffState } from './serialization.js';
import { rngClock } from './rng-clock-service.js';

/**
 * @typedef {Object} HistoryEntry
 * @property {number} index
 * @property {number} turn
 * @property {string} phase
 * @property {string} activePlayer
 * @property {string} commandType
 * @property {Object} payload
 * @property {Object} diff
 * @property {number} timestamp
 * @property {Object} [stateSnapshot]
 */

export class ActionHistory {
  constructor({ maxSnapshots = 10 } = {}) {
    /** @type {HistoryEntry[]} */
    this.log = [];
    /** @type {number} */
    this.cursor = -1;
    this.maxSnapshots = maxSnapshots;
  }

  /** @returns {number} */
  get length() { return this.log.length; }

  /** @returns {HistoryEntry|null} */
  get current() { return this.log[this.cursor] ?? null; }

  /** @returns {boolean} */
  get canUndo() { return this.cursor >= 0; }

  /** @returns {boolean} */
  get canRedo() { return this.cursor < this.log.length - 1; }

  // ─────────────────────────────────────────────
  // Recording
  // ─────────────────────────────────────────────

  /**
   * Record a command with before/after state.
   * @param {string} commandType
   * @param {Object} payload
   * @param {GameState} stateBefore
   * @param {GameState} stateAfter
   * @param {{turn: number, phase: string, activePlayer: string}} meta
   * @returns {HistoryEntry}
   */
  record(commandType, payload, stateBefore, stateAfter, meta) {
    // Truncate any redo entries if we branch from middle
    if (this.cursor < this.log.length - 1) {
      this.log = this.log.slice(0, this.cursor + 1);
    }

    const entry = {
      index: this.log.length,
      turn: meta.turn,
      phase: meta.phase,
      activePlayer: meta.activePlayer,
      commandType,
      payload: JSON.parse(JSON.stringify(payload)),
      diff: diffState(stateBefore, stateAfter),
      timestamp: rngClock.now(),
      stateSnapshot: this.#shouldSnapshot() ? serializeState(stateAfter) : null,
    };

    this.log.push(entry);
    this.cursor = entry.index;

    gameEvents.emit({ type: 'historyRecorded', entry });
    return entry;
  }

  // ─────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────

  /** Move cursor back one step. @returns {HistoryEntry|null} */
  undo() {
    if (!this.canUndo) return null;
    this.cursor -= 1;
    gameEvents.emit({ type: 'historyUndone', toIndex: this.cursor });
    return this.current;
  }

  /** Move cursor forward one step. @returns {HistoryEntry|null} */
  redo() {
    if (!this.canRedo) return null;
    this.cursor += 1;
    gameEvents.emit({ type: 'historyRedone', toIndex: this.cursor });
    return this.current;
  }

  /** Jump to a specific index. @returns {HistoryEntry|null} */
  goto(index) {
    if (index < -1 || index >= this.log.length) return null;
    this.cursor = index;
    gameEvents.emit({ type: 'historyGoto', toIndex: index });
    return this.current;
  }

  // ─────────────────────────────────────────────
  // Replay
  // ─────────────────────────────────────────────

  /**
   * Replay all actions from index 0 up to a target index.
   * @param {Function} dispatchFn — (commandType, payload) => void
   * @param {GameState} initialState
   * @param {number} [upToIndex] — defaults to current cursor
   * @returns {GameState}
   */
  replay(dispatchFn, initialState, upToIndex = this.cursor) {
    const target = Math.min(upToIndex, this.log.length - 1);
    for (let i = 0; i <= target; i++) {
      const entry = this.log[i];
      dispatchFn(entry.commandType, entry.payload);
    }
    return initialState;
  }

  /**
   * Export the full history as a JSON string.
   * @returns {string}
   */
  export() {
    return JSON.stringify({
      version: '8.15.0',
      exportedAt: rngClock.now(),
      entries: this.log,
    }, null, 2);
  }

  /**
   * Import a history from JSON.
   * @param {string} json
   */
  import(json) {
    const data = JSON.parse(json);
    this.log = data.entries || [];
    this.cursor = this.log.length - 1;
  }

  /**
   * Find the nearest snapshot before or at a given index.
   * @param {number} index
   * @returns {Object|null} serialized state
   */
  findNearestSnapshot(index) {
    for (let i = index; i >= 0; i--) {
      if (this.log[i].stateSnapshot) return this.log[i].stateSnapshot;
    }
    return null;
  }

  // ─────────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────────

  /** @returns {boolean} */
  #shouldSnapshot() {
    if (this.log.length === 0) return true;
    const lastSnap = this.log.findLastIndex((e) => e.stateSnapshot !== null);
    return (this.log.length - lastSnap) >= this.maxSnapshots;
  }
}
