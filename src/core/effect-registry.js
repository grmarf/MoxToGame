// @ts-check
/** @typedef {import('./types.js').EffectContext} EffectContext */
/** @typedef {import('./types.js').EffectData} EffectData */

/**
 * V8.1 effect registry. New effect implementations belong here, not in the legacy switch.
 * Domain registration is centralized by src/core/effects/index.js.
 */
export class EffectRegistry {
  constructor() {
    /** @type {Map<string, Function>} */
    this.handlers = new Map();
  }

  /** @param {string} type @param {Function} handler @param {{replace?: boolean}} [opts] */
  register(type, handler, { replace = false } = {}) {
    if (!replace && this.handlers.has(type)) {
      throw new Error(`Effect already registered: ${type}`);
    }
    if (typeof handler !== 'function') {
      throw new TypeError(`Effect handler for ${type} must be a function`);
    }
    this.handlers.set(type, handler);
    return this;
  }

  /** @param {string} type @returns {boolean} */
  has(type) { return this.handlers.has(type); }

  /** @param {string} type @param {EffectContext} context @param {EffectData} effect */
  resolve(type, context, effect) {
    const handler = this.handlers.get(type);
    if (!handler) throw new Error(`Unknown effect: ${type}`);
    return handler(context, effect);
  }

  /** @returns {string[]} */
  types() { return [...this.handlers.keys()].sort(); }
}

export const effects = new EffectRegistry();
