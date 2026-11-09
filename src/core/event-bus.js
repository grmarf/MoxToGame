// @ts-check
/**
 * Simple event bus for decoupled cross-module communication.
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
    /** @type {Function|null} */
    this.stateProvider = null;
  }

  /**
   * Register a function that returns the current GameState.
   * Used to inject `state` into canonical events automatically.
   * @param {Function} fn
   */
  setStateProvider(fn) {
    this.stateProvider = fn;
  }

  /**
   * Subscribe to an event type.
   * @param {string} type
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  on(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
    return () => this.listeners.get(type).delete(handler);
  }

  /**
   * Emit an event.
   * @param {{type: string}} event
   */
  emit(event) {
    if (this.stateProvider && event && typeof event === 'object' && !('state' in event)) {
      event = { ...event, state: this.stateProvider() };
    }
    const set = this.listeners.get(event.type);
    if (set) set.forEach((h) => h(event));
  }
}

export const gameEvents = new EventBus();
