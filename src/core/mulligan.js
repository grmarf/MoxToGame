// v12.73 — Mulligan du cœur (règle de Londres) : toute la manipulation de zones passe par ZoneManager.
// L'UI ne fait qu'appeler ces fonctions (plus d'écriture directe de hand/library).

/** Renvoie toute la main en bibliothèque, mélange (PRNG du moteur) et pioche `handSize` cartes. */
export function mulliganSide(game, side, { handSize = 7 } = {}) {
  const zones = game.zones, st = game.state[side];
  for (const card of [...st.hand]) zones.move(card, 'library', { toSide: side, reason: 'mulligan' });
  zones.shuffleLibrary(side);
  for (let i = 0; i < handSize && st.library.length > 0; i++) {
    zones.move(st.library[st.library.length - 1], 'hand', { toSide: side, reason: 'mulliganDraw' });
  }
  return st.hand;
}

/** Règle de Londres : renvoie les cartes choisies AU FOND de la bibliothèque (piochées en dernier). */
export function putOnBottom(game, side, cards) {
  for (const card of [...cards]) game.zones.move(card, 'library', { toSide: side, reason: 'mulliganBottom', position: 'bottom' });
  return game.state[side].library;
}

/**
 * Décision de mulligan automatique (IA et auto-jeu) : on garde 2 à 5 terrains sur la main, sinon mulligan
 * (2 au plus) ; on renvoie ensuite au fond les cartes les plus chères (règle de Londres).
 * @returns {number} nombre de mulligans effectués
 */
export function autoMulligan(game, side, { maxMulligans = 2, cmcOf = (c) => Number(c.cmc || 0) } = {}) {
  const st = game.state[side];
  const isLand = (c) => String(c.type || '').includes('Land');
  let mulligans = 0;
  while (mulligans < maxMulligans) {
    const lands = st.hand.filter(isLand).length;
    if (lands >= 2 && lands <= 5) break;
    mulliganSide(game, side);
    mulligans += 1;
  }
  if (mulligans > 0) putOnBottom(game, side, [...st.hand].sort((a, b) => cmcOf(b) - cmcOf(a)).slice(0, mulligans));
  return mulligans;
}
