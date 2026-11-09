import { rngClock } from './rng-clock-service.js';
// @ts-check
/**
 * @fileoverview MTG Beta V9.1 — State Serialization
 * Save, restore, and snapshot game states without circular references.
 */

/** @typedef {import('./types.js').GameState} GameState */

/**
 * Serialize a GameState into a plain JSON-safe object.
 * @param {GameState} state
 * @returns {Object}
 */
export function serializeState(state) {
  return JSON.parse(JSON.stringify(state, (key, value) => {
    // Skip function references if any slipped in
    if (typeof value === 'function') return undefined;
    return value;
  }));
}

/**
 * Deserialize a serialized state back into a mutable GameState.
 * @param {Object} serialized
 * @returns {GameState}
 */
export function deserializeState(serialized) {
  // Deep clone to avoid mutations on the original serialized object
  const state = JSON.parse(JSON.stringify(serialized));

  // Ensure all required fields exist with defaults
  for (const side of ['player', 'ai']) {
    if (!state[side]) state[side] = {};
    state[side].life = state[side].life ?? 20;
    state[side].library = state[side].library ?? [];
    state[side].hand = state[side].hand ?? [];
    state[side].graveyard = state[side].graveyard ?? [];
    state[side].exile = state[side].exile ?? [];
    state[side].battlefield = state[side].battlefield ?? [];
    state[side].mana = state[side].mana ?? { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    state[side].mustDraw = state[side].mustDraw ?? false;
    state[side].extraTurns = state[side].extraTurns ?? 0;
    state[side].landsPlayedThisTurn = state[side].landsPlayedThisTurn ?? 0;
    state[side].hasLost = state[side].hasLost ?? false;
  }

  state.fogActive = state.fogActive ?? false;
  state.prevention = state.prevention ?? [];
  state.gameObjectSequence = state.gameObjectSequence ?? 0;
  state.turnNumber = state.turnNumber ?? 1;
  state.activePlayer = state.activePlayer ?? 'player';
  state.phase = state.phase ?? 'untap';
  state.priorityHolder = state.priorityHolder ?? null;
  for (const side of ['player','ai']) {
    if (!state[side]) continue;
    state[side].hasDrawnThisTurn = Boolean(state[side].hasDrawnThisTurn);
    state[side].landsPlayedThisTurn = Number(state[side].landsPlayedThisTurn || 0);
    state[side].mana = Object.assign({W:0,U:0,B:0,R:0,G:0,C:0}, state[side].mana || {});
  }

  return state;
}

/**
 * Create a compact snapshot (minimal metadata + full state).
 * @param {GameState} state
 * @param {Object} meta
 * @returns {Object}
 */
export function createSnapshot(state, meta = {}) {
  return {
    version: '9.6.0',
    timestamp: rngClock.now(),
    meta,
    state: serializeState(state),
  };
}

/**
 * Restore from a snapshot.
 * @param {Object} snapshot
 * @returns {{state: GameState, meta: Object}}
 */
export function restoreSnapshot(snapshot) {
  return {
    state: deserializeState(snapshot.state),
    meta: snapshot.meta || {},
  };
}

/**
 * Diff two serialized states (shallow comparison of key counts).
 * @param {GameState} before
 * @param {GameState} after
 * @returns {Object}
 */
export function diffState(before, after) {
  const changes = {};
  for (const side of ['player', 'ai']) {
    const sBefore = before[side];
    const sAfter = after[side];
    changes[side] = {
      lifeDelta: (sAfter?.life ?? 20) - (sBefore?.life ?? 20),
      handDelta: (sAfter?.hand?.length ?? 0) - (sBefore?.hand?.length ?? 0),
      libraryDelta: (sAfter?.library?.length ?? 0) - (sBefore?.library?.length ?? 0),
      graveyardDelta: (sAfter?.graveyard?.length ?? 0) - (sBefore?.graveyard?.length ?? 0),
      battlefieldDelta: (sAfter?.battlefield?.length ?? 0) - (sBefore?.battlefield?.length ?? 0),
    };
  }
  return changes;
}
