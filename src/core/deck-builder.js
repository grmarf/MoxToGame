// V12.28 — deck construction helpers for the currently certified playable pool.
import { isCardPlayable } from './card-playability.js';

/**
 * Return the cards that the deckbuilder is allowed to expose as playable.
 * @param {Array<object>} cards
 * @returns {Array<object>}
 */
export function getPlayableCards(cards) {
  if (!Array.isArray(cards)) return [];
  return cards.filter(isCardPlayable);
}

/**
 * Build a deterministic-size random deck from the certified playable pool.
 * Basic lands are used for the guaranteed land portion; the remaining slots
 * are sampled from playable non-basic cards.
 *
 * @param {Array<object>} cards
 * @param {{size?: number, basicCount?: number, rng?: () => number}} options
 * @returns {Array<object>}
 */
export function buildRandomPlayableDeck(cards, options = {}) {
  const size = Number.isInteger(options.size) ? options.size : 60;
  const requestedBasicCount = Number.isInteger(options.basicCount) ? options.basicCount : 24;
  const rng = typeof options.rng === 'function' ? options.rng : Math.random;

  if (size < 1) throw new Error('La taille du deck doit être positive.');
  if (requestedBasicCount < 0 || requestedBasicCount > size) {
    throw new Error('Le nombre de terrains de base garanti est invalide.');
  }

  const playable = getPlayableCards(cards);
  const basics = playable.filter(c => c.isBasic);
  const pool = playable.filter(c => !c.isBasic);

  if (!basics.length) throw new Error('Aucun terrain de base jouable disponible.');
  if (size > requestedBasicCount && !pool.length) {
    throw new Error('Aucune carte non-terrain jouable disponible pour compléter le deck.');
  }

  const deck = [];
  for (let i = 0; i < requestedBasicCount && deck.length < size; i++) {
    deck.push({ ...basics[i % basics.length] });
  }

  while (deck.length < size) {
    const index = Math.min(pool.length - 1, Math.max(0, Math.floor(rng() * pool.length)));
    deck.push({ ...pool[index] });
  }

  return deck;
}


/**
 * Validate a deck for the currently playable game surface.
 * This is intentionally a construction/startup validator, not a full MTG
 * deck-construction rules engine.
 * @param {Array<object>} cards
 * @param {{minSize?: number, maxSize?: number}} options
 * @returns {{valid:boolean, errors:string[], size:number, unplayable:number, invalidReferences:number}}
 */
export function validateDeck(cards, options = {}) {
  const minSize = Number.isInteger(options.minSize) ? options.minSize : 40;
  const maxSize = Number.isInteger(options.maxSize) ? options.maxSize : 60;
  const errors = [];
  const deck = Array.isArray(cards) ? cards : [];

  if (deck.length < minSize) errors.push(`Le deck doit contenir au moins ${minSize} cartes.`);
  if (deck.length > maxSize) errors.push(`Le deck ne peut pas contenir plus de ${maxSize} cartes.`);

  const unplayable = deck.filter(card => !isCardPlayable(card));
  if (unplayable.length) errors.push(`${unplayable.length} carte(s) du deck ne sont pas certifiées jouables.`);

  const invalidReferences = deck.filter(card => !card || typeof card !== 'object' || typeof card.name !== 'string' || !card.name.trim());
  if (invalidReferences.length) errors.push(`${invalidReferences.length} référence(s) de carte sont invalides.`);

  return {
    valid: errors.length === 0,
    errors,
    size: deck.length,
    unplayable: unplayable.length,
    invalidReferences: invalidReferences.length,
  };
}
