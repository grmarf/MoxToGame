// V10.7 / C9.1 — isolated subgame manager for Shahrazad.
// The main game is suspended while the subgame runs; subgame objects have no
// rules meaning in the main game except for the final result.
import { serializeState, deserializeState } from './serialization.js';
import { gameEvents } from './event-bus.js';
import { rngClock } from './rng-clock-service.js';

export class SubgameManager {
  constructor({ getState, setState, zones = null }) {
    this.zones = zones; // v12.73 : ZoneManager (ou fonction qui le renvoie) pour rendre la carte source
    this.getState = getState;
    this.setState = setState;
    this.mainSnapshot = null;
    this.depth = 0;
  }

  get active() { return !!this.mainSnapshot; }

  start({ controller = 'player', source = null } = {}) {
    if (this.active) throw new Error('A subgame is already active.');
    // Le sort Shahrazad est en cours de résolution au moment du snapshot : il
    // n'est donc ni en main ni au cimetière dans la partie principale restaurée.
    this.sourceCard = source ? { ...source } : null;
    const main = serializeState(this.getState());
    this.mainSnapshot = main;
    this.depth = 1;
    const sub = this.#createSubgameState(main);
    this.setState(sub);
    gameEvents.emit({ type: 'subgameStarted', state: sub, depth: this.depth, controller });
    return sub;
  }

  // Ends the current subgame. winner is the side that won the subgame, or
  // null for a drawn subgame (no loser, no life loss).
  finish(winner) {
    if (!this.active) throw new Error('No active subgame.');
    const main = deserializeState(this.mainSnapshot);
    const loser = winner === 'player' ? 'ai' : winner === 'ai' ? 'player' : null;
    // BUG M (audit) : "le perdant PERD la moitié de ses points de vie,
    // arrondie au supérieur" -> il perd ceil(vie/2), il lui reste floor(vie/2).
    // L'ancien code laissait ceil(vie/2) (13 PV -> 7 au lieu de 6).
    if (loser) main[loser].life = main[loser].life - Math.ceil(main[loser].life / 2);
    const source = this.sourceCard; this.sourceCard = null;
    main.subgameResult = winner ? { winner, loser } : { winner: null, loser: null, draw: true };
    this.mainSnapshot = null;
    this.depth = 0;
    this.setState(main);
    if (source) {
      // v12.73 : le sort Shahrazad (résolu, hors zones suivies) rejoint le cimetière par ZoneManager.place()
      // (identité canonique + zoneChanged). Après setState : le ZoneManager lit désormais la partie principale.
      const owner = source.owner || 'player';
      const already = (main[owner].graveyard || []).some(c => c.uid && c.uid === source.uid);
      const zones = typeof this.zones === 'function' ? this.zones() : this.zones;
      if (!already) {
        if (zones) zones.place(source, 'graveyard', { toSide: owner, reason: 'shahrazadResolved' });
        else main[owner].graveyard.push({ ...source, zone: 'graveyard' });
      }
    }
    gameEvents.emit({ type: 'subgameFinished', state: main, winner, loser });
    return main;
  }

  // BUG M (audit) : finish() n'était appelé nulle part -- un joueur qui perdait
  // DANS le sous-jeu (0 PV, pioche en bibliothèque vide...) faisait passer
  // hasLost à vrai sur l'état courant, lu par le moteur comme la fin de la
  // PARTIE PRINCIPALE. settle() convertit cette défaite en fin de sous-jeu
  // (retour à la partie principale, perdant à la moitié de ses PV). Idempotent,
  // appelé aux points sûrs (fin d'action du moteur, fin de dispatch).
  settle() {
    if (!this.active) return null;
    const st = this.getState();
    const pLost = !!st?.player?.hasLost, aLost = !!st?.ai?.hasLost;
    if (!pLost && !aLost) return null;
    const winner = pLost && aLost ? null : (pLost ? 'ai' : 'player');
    return this.finish(winner);
  }

  #createSubgameState(main) {
    const sub = deserializeState(main);
    for (const side of ['player', 'ai']) {
      // Rule 724.2: only libraries move into the subgame; other main-game
      // zones remain outside it. The new game gets fresh zones/state.
      const deck = (main[side].library || []).map(c => ({ ...c }));
      sub[side] = {
        life: 20,
        library: deck,
        hand: [],
        graveyard: [],
        exile: [],
        battlefield: [],
        mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        mustDraw: false,
        extraTurns: 0,
        landsPlayedThisTurn: 0,
        hasDrawnThisTurn: false,
        hasLost: false,
      };
    }
    sub.turnNumber = 1;
    sub.activePlayer = rngClock.random() < 0.5 ? 'player' : 'ai';
    sub.phase = 'untap';
    sub.priorityHolder = sub.activePlayer;
    sub.stack = [];
    sub.combat = null;
    sub.subgame = { active: true, depth: 1 };
    return sub;
  }
}
