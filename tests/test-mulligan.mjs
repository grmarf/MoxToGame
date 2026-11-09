// Stub DOM minimal — suffisant pour que game-ui.js ne plante pas sur les
// appels document.getElementById(...).classList/.innerHTML/.onclick,
// sans avoir besoin d'un vrai navigateur.
function stubEl() {
  const el = {
    classList: { add() {}, remove() {}, contains: () => false },
    _innerHTML: '',
    set innerHTML(v) { this._innerHTML = v; },
    get innerHTML() { return this._innerHTML; },
    set textContent(v) { this._text = v; },
    get textContent() { return this._text; },
    addEventListener() {},
    querySelectorAll: () => [],
    appendChild() {},
    onclick: null,
    dataset: {},
    disabled: false,
    value: '',
    scrollTop: 0,
  };
  return el;
}
globalThis.document = {
  getElementById: () => stubEl(),
  createElement: () => stubEl(),
  body: stubEl(),
};

const { gameEvents } = await import('../src/core/event-bus.js');
const { game } = await import('../src/core/game-facade.js');
const { effects } = await import('../src/core/effect-registry.js');
const { installEffects } = await import('../src/core/effects/index.js');
const CARDS = (await import('../src/data/cards-database.js')).default;
const { isCardPlayable } = await import('../src/core/card-playability.js');
const { createGameUI } = await import('../src/ui/game-ui.js');

installEffects(effects, globalThis);
game.connect();

const ui = createGameUI({ cards: CARDS, game, root: stubEl() });

// Construit un deck réaliste (comme addRandomDeck) puis lance startGame(),
// qui déclenche loadDeck + résolution auto du mulligan IA + écran de mulligan joueur.
const playableBasics = CARDS.filter(c => c.isBasic && isCardPlayable(c));
const playableNonBasics = CARDS.filter(c => !c.isBasic && isCardPlayable(c));
ui.deck = Array.from({ length: 24 }, (_, i) => playableBasics[i % playableBasics.length]).concat(
  Array.from({ length: 36 }, (_, i) => playableNonBasics[i % playableNonBasics.length])
);
ui.startGame();

console.log('Main de départ (joueur) :', game.state.player.hand.length, 'cartes');
console.log('Bibliothèque (joueur) :', game.state.player.library.length, 'cartes');
if (game.state.player.hand.length !== 7) { console.error('ÉCHEC : la main de départ ne fait pas 7 cartes.'); process.exit(1); }

// Le joueur fait un mulligan.
ui.mulliganPlayer();
console.log('Après 1 mulligan — main :', game.state.player.hand.length, 'cartes | compteur :', ui.playerMulliganCount);
if (game.state.player.hand.length !== 7 || ui.playerMulliganCount !== 1) {
  console.error('ÉCHEC : le mulligan ne repioche pas correctement 7 cartes / n\'incrémente pas le compteur.');
  process.exit(1);
}

// Le joueur garde sa main : il doit maintenant en sélectionner 1 pour le fond de bibliothèque.
ui.keepPlayerHand();
if (ui.mulliganStage !== 'selectingBottom') { console.error('ÉCHEC : l\'étape de sélection du fond n\'a pas démarré.'); process.exit(1); }

const libBefore = game.state.player.library.length;
const cardToBottom = game.state.player.hand[0];
ui.mulliganBottomSelection.add(cardToBottom.uid);
ui.confirmMulliganBottom();

console.log('Après confirmation — main :', game.state.player.hand.length, '| bibliothèque :', game.state.player.library.length);
if (game.state.player.hand.length !== 6) { console.error('ÉCHEC : la main devrait contenir 6 cartes après avoir renvoyé 1 carte.'); process.exit(1); }
if (game.state.player.library.length !== libBefore + 1) { console.error('ÉCHEC : la bibliothèque n\'a pas récupéré la carte renvoyée.'); process.exit(1); }
if (!ui.started) { console.error('ÉCHEC : la partie ne démarre pas après le mulligan.'); process.exit(1); }

console.log('OK : le mulligan (repioche + renvoi au fond) fonctionne correctement.');
process.exit(0);
