// @ts-check
/**
 * @fileoverview MTG Beta V9.1 — Turn UI Component
 * Displays current phase, turn number, active player,
 * and provides controls to advance phases.
 */

/** @typedef {import('../core/turn/turn-manager.js').TurnManager} TurnManager */

export class TurnUI {
  /**
   * @param {Object} opts
   * @param {TurnManager} opts.turnManager
   * @param {Function} opts.onNextPhase — callback when user clicks "Next Phase"
   * @param {HTMLElement} [opts.container] — optional container element
   */
  constructor({ turnManager, onNextPhase, onPassPriority = onNextPhase, getPriorityHolder = () => null, container = null }) {
    this.turnManager = turnManager;
    this.onNextPhase = onNextPhase;
    this.onPassPriority = onPassPriority;
    this.getPriorityHolder = getPriorityHolder;
    this.container = container || this.#createContainer();
    this.render();
  }

  /** @returns {HTMLElement} */
  #createContainer() {
    const el = document.createElement('div');
    el.id = 'turn-ui';
    el.className = 'turn-ui';
    document.body.appendChild(el);
    return el;
  }

  /**
   * Render the turn UI based on current state.
   * @param {Object} [override]
   */
  render(override = {}) {
    const snap = this.turnManager?.snapshot || override;
    const phase = snap.phase || 'unknown';
    const turn = snap.turn || 1;
    const active = snap.activePlayer || 'player';
    const priority = this.getPriorityHolder?.() ?? snap.priorityHolder ?? null;
    const playerHasPriority = priority === 'player';
    const priorityLabel = priority === 'player' ? '👤 Votre priorité' : priority === 'ai' ? '🤖 Priorité à l’IA' : '⏸️ Pas de priorité';

    const phaseLabels = {
      untap: '🔄 Dégaînement',
      upkeep: '⚙️ Entretien',
      draw: '📥 Pioche',
      main1: '🏛️ Phase principale 1',
      combatBegin: '⚔️ Début du combat',
      declareAttackers: '⚔️ Déclarer attaquants',
      declareBlockers: '🛡️ Déclarer bloqueurs',
      combatDamage: '💥 Dégâts de combat',
      combatEnd: '✅ Fin du combat',
      main2: '🏛️ Phase principale 2',
      endStep: '🌙 Fin de tour',
      cleanup: '🧹 Nettoyage',
    };

    const isPlayerTurn = active === 'player';
    const turnIndicator = isPlayerTurn ? '👤 Votre tour' : "🤖 Tour de l'IA";

    this.container.innerHTML = `
      <div class="turn-bar">
        <div class="turn-info">
          <span class="turn-number">Tour ${turn}</span>
          <span class="turn-owner">${turnIndicator}</span>
          <span class="priority-indicator">${priorityLabel}</span>
        </div>
        <div class="phase-track">
          ${this.#renderPhaseTrack(phase)}
        </div>
        <button class="next-phase-btn" id="next-phase-btn" ${playerHasPriority ? '' : 'disabled'}>⏭️ ${priority === 'player' ? 'Passer / phase suivante' : 'En attente de l’IA'}</button>
      </div>
    `;

    const btn = this.container.querySelector('#next-phase-btn');
    if (btn) {
      btn.addEventListener('click', () => this.onNextPhase());
    }
  }

  /** @param {string} currentPhase */
  #renderPhaseTrack(currentPhase) {
    const phases = [
      'untap', 'upkeep', 'draw', 'main1',
      'combatBegin', 'declareAttackers', 'declareBlockers',
      'combatDamage', 'combatEnd', 'main2', 'endStep', 'cleanup',
    ];
    const icons = {
      untap: '↺', upkeep: '⚙️', draw: '📥', main1: '1️⃣',
      combatBegin: '⚔️', declareAttackers: '⚔️', declareBlockers: '🛡️',
      combatDamage: '💥', combatEnd: '✅', main2: '2️⃣', endStep: '🌙', cleanup: '🧹',
    };

    const currentIdx = phases.indexOf(currentPhase);
    return phases.map((ph, i) => {
      let cls = 'phase-dot';
      if (i < currentIdx) cls += ' phase-done';
      else if (i === currentIdx) cls += ' phase-active';
      else cls += ' phase-pending';
      return `<span class="${cls}" title="${ph}">${icons[ph] || '•'}</span>`;
    }).join('');
  }

  /** Highlight a specific phase momentarily (for animations). */
  flashPhase(phase) {
    const dots = this.container.querySelectorAll('.phase-dot');
    dots.forEach((dot) => {
      if (dot.title === phase) {
        dot.classList.add('phase-flash');
        setTimeout(() => dot.classList.remove('phase-flash'), 500);
      }
    });
  }
}
