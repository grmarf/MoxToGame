// V12.10 — Injectable RNG & Clock Service (R-DET-01)
// Provides seedable PRNG (mulberry32) and deterministic logical clock.
// Default mode: non-deterministic (Math.random / Date.now).
// Test/replay mode: fixed seed + incremental counter.

function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class RngClockService {
  constructor({ seed = null, useLogicalClock = false } = {}) {
    this._seed = seed;
    this._useLogicalClock = useLogicalClock;
    this._counter = 0;
    this._rng = seed != null ? mulberry32(seed) : () => Math.random();
  }

  configure({ seed = null, useLogicalClock = false } = {}) {
    this._seed = seed;
    this._useLogicalClock = useLogicalClock;
    this._counter = 0;
    this._rng = seed != null ? mulberry32(seed) : () => Math.random();
  }

  random() {
    return this._rng();
  }

  now() {
    return this._useLogicalClock ? ++this._counter : Date.now();
  }

  shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  uuid(prefix = 'id') {
    return `${prefix}_${this.now().toString(36)}_${Math.floor(this.random() * 1e9).toString(36)}`;
  }
}

export const rngClock = new RngClockService();
