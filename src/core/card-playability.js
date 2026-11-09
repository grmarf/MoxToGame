// V12.27 — single source of truth for the card pool exposed to gameplay.
// A card is playable only when its database status explicitly certifies that
// its rules are implemented enough for the current game surface.

const PLAYABLE_EFFECT_STATUSES = new Set(['functional', 'implemented']);

/**
 * Return whether a database card belongs to the currently certified playable
 * card pool.
 *
 * Deliberately status-driven: cards with missing/null status are not silently
 * inferred to be playable, even when their shape resembles a simple card.
 * This prevents the deckbuilder from exposing partially wired cards.
 *
 * @param {object|null|undefined} card
 * @returns {boolean}
 */
export function isCardPlayable(card) {
  if (!card || typeof card !== 'object') return false;
  return PLAYABLE_EFFECT_STATUSES.has(card.effectStatus);
}

export { PLAYABLE_EFFECT_STATUSES };
