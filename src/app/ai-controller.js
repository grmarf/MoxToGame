// @ts-check
/**
 * @fileoverview MTG V12.0 — AI Controller
 *
 * V10.8 exposait déjà `game.ai` (AIService, dans src/core/ai/ai-service.js)
 * mais rien ne l'appelait jamais : ni le TurnManager, ni la GameFacade, ni
 * bootstrap.js. Résultat, le "joueur IA" ne jouait aucun terrain, ne lançait
 * aucun sort, n'attaquait ni ne bloquait jamais — il fallait cliquer
 * "Phase suivante" pour lui, indéfiniment.
 *
 * Ce module comble ce vide en écoutant les événements du moteur et en
 * pilotant l'IA :
 *  - Pendant le tour de l'IA (activePlayer === 'ai') : elle engage ses
 *    terrains pour produire du mana, joue un terrain, lance les sorts
 *    qu'elle peut se permettre (en choisissant une cible pertinente quand
 *    le sort en exige une — V11.1), résout la pile, déclare ses attaquants,
 *    puis avance automatiquement les phases qui ne demandent aucune
 *    décision (dégagement, entretien, pioche, etc.).
 *  - Pendant le tour du joueur humain, si la phase "declareBlockers" est
 *    atteinte, l'IA (qui défend) choisit ses bloqueurs automatiquement.
 *  - V12.0 : dès qu'un des deux joueurs a perdu (`state[side].hasLost`),
 *    l'IA arrête complètement d'agir — plus aucune action n'est dispatchée.
 *
 * Limite assumée (V11.1, héritée de V11.0) : l'IA ne répond pas à la pile
 * en instant-speed pendant le tour du joueur humain (chooseResponse()
 * n'est utilisé que pendant son propre tour). Une IA réactive complète
 * est un chantier ultérieur — cf. le rapport de suivi fourni avec ce zip.
 */

import { effectivePowerToughness } from '../core/continuous-effects.js';
import { phaseAllowsPriority } from '../core/turn/turn-rules.js';

const AI_SIDE = 'ai';
const HUMAN_SIDE = 'player';

const THINK_DELAY_MS = 450;   // petite latence pour que les actions de l'IA restent lisibles
const MAX_STEPS_PER_TURN = 60; // garde-fou anti-boucle infinie

const AUTO_PHASES = new Set([
  'untap', 'upkeep', 'draw', 'combatBegin', 'combatDamage', 'combatEnd', 'endStep', 'cleanup',
]);
const MAIN_PHASES = new Set(['main1', 'main2']);

// V12.0 — types d'effets considérés comme du "retrait" (viser la meilleure
// menace adverse) vs du "soutien" (viser sa propre meilleure créature).
const REMOVAL_EFFECTS = new Set(['damage', 'destroy', 'exile', 'bounce', 'tapTarget', 'discard']);
const BUFF_EFFECTS = new Set(['pump', 'copyPermanent']);

/**
 * V12.0 — Choisit une cible pour un sort qui en exige une. Avant cet ajout,
 * l'IA passait systématiquement `target: null`, donc tout sort ciblé
 * (retrait, buff, brûlure...) échouait avec "Une cible est requise." et
 * était simplement abandonné. Exportée (plutôt que gardée dans la
 * fermeture d'installAIController) pour rester testable directement.
 * @param {import('../core/game-facade.js').GameFacade} game
 * @param {Object} card
 */
export function pickAiTarget(game, card, side = AI_SIDE) {
  // v12.74 : `side` permet de faire jouer l'IA pour n'importe quel joueur (auto-jeu IA-vs-IA).
  const OPP = side === AI_SIDE ? HUMAN_SIDE : AI_SIDE;
  const effectType = card?.effect?.type;
  if (!effectType || !game.targeting?.needsTarget(effectType)) return null;
  const options = game.targeting.validTargets(effectType, side, [], card.effect, card) || [];   // v12.74 : filtré par la carte (V12.76 G28 : et par la carte source)
  if (!options.length) return null;

  const power = (o) => {
    if (!o?.perm) return 0;
    try { return Number(effectivePowerToughness(game.state, o.perm).power ?? o.perm.power ?? 0); }
    catch { return Number(o.perm.power ?? 0); }
  };
  const isCreature = (o) => o.kind === 'permanent' && /Creature/i.test(String(o.perm?.type || ''));
  const controlledBy = (o, side) => o.perm?.controller === side;

  if (REMOVAL_EFFECTS.has(effectType) || effectType === 'anyTarget') {
    const enemyCreatures = options.filter((o) => isCreature(o) && controlledBy(o, OPP));
    if (enemyCreatures.length) return enemyCreatures.sort((a, b) => power(b) - power(a))[0];
    if (effectType === 'anyTarget') {
      const enemyPlayer = options.find((o) => o.kind === 'player' && o.side === OPP);
      if (enemyPlayer) return enemyPlayer;
    }
    return options[0];
  }

  if (BUFF_EFFECTS.has(effectType)) {
    const ownCreatures = options.filter((o) => isCreature(o) && controlledBy(o, side));
    if (ownCreatures.length) return ownCreatures.sort((a, b) => power(b) - power(a))[0];
    return options[0];
  }

  if (['counterSpell', 'counterCMC', 'counterSpellColor', 'counterUnlessPay', 'copySpell'].includes(effectType)) {
    const enemyStackItem = options.find((o) => o.controller === OPP);
    return enemyStackItem || options[0];
  }

  return options[0];
}

/**
 * v12.74 — Cible pour répondre à un élément de pile (contresort, copie) : l'entrée de la liste de cibles
 * légales qui correspond à cet élément. Avant, l'IA passait l'élément de pile BRUT, que le moteur refusait :
 * sa réponse par contresort n'avait jamais abouti.
 */
export function pickStackTarget(game, card, side, stackItem) {
  if (!stackItem) return null;
  const options = game.targeting.validTargets(card?.effect?.type, side, [], card?.effect, card) || [];
  return options.find((o) => o.id === stackItem.id) || null;
}

export function installAIController({ game, events }) {
  let stepCount = 0;
  let turnToken = 0;          // incrémenté à chaque nouveau tour IA pour invalider les setTimeout en vol
  let attemptedThisPhase = new Set();

  function log(msg) {
    events.emit({ type: 'log', msg, side: 'ai' });
  }

  /** V12.0 — vrai dès que la partie est terminée (l'un des deux joueurs a perdu). */
  function isGameOver() {
    const state = game.state;
    return !!(state && (state.player?.hasLost || state.ai?.hasLost));
  }

  function safeDispatch(type, payload) {
    // Timers can overlap around priority transfers. Never turn a stale timer
    // into a gameplay error: the current holder is the single source of truth.
    if (game.turnManager && phaseAllowsPriority(game.turnManager.phase) && game.state?.priorityHolder !== AI_SIDE) return false;
    try {
      game.dispatch(type, payload, AI_SIDE);
      return true;
    } catch (err) {
      log(`⚠️ Action IA échouée (${type}) [phase=${game.turnManager?.phase}, active=${game.turnManager?.activePlayer}, priority=${game.state?.priorityHolder}, stack=${game.stack?.size}] : ${err.message}`);
      return false;
    }
  }

  /** Engage tous les terrains non engagés de l'IA pour remplir sa réserve de mana. */
  function tapAllLandsForMana() {
    const state = game.state;
    if (!state) return;
    const lands = state[AI_SIDE].battlefield.filter(
      (p) => !p.tapped && (p.produces || p.tapAbility?.produces)
    );
    for (const land of lands) {
      safeDispatch('action', { action: 'tapMana', data: { permanent: land, controller: AI_SIDE } });
    }
  }

  /**
   * V12.0 — Choisit une cible pour un sort qui en exige une (délègue à la
   * fonction exportée `pickAiTarget`, définie hors de cette fermeture pour
   * rester testable directement).
   */
  function chooseTargetFor(card) { return pickAiTarget(game, card); }

  function scheduleAiTurnStep(myToken) {
    setTimeout(() => runAiTurnStep(myToken), THINK_DELAY_MS);
  }

  function runAiTurnStep(myToken) {
    if (isGameOver()) return;
    if (game.turnManager && phaseAllowsPriority(game.turnManager.phase) && game.state?.priorityHolder !== AI_SIDE) return; // V12.0 — partie terminée, l'IA n'agit plus.
    if (myToken !== turnToken) return; // un nouveau tour a démarré entre-temps, on abandonne cette chaîne
    if (!game.turnManager || game.turnManager.activePlayer !== AI_SIDE) return;

    stepCount += 1;
    if (stepCount > MAX_STEPS_PER_TURN) {
      log('⚠️ Limite de sécurité atteinte sur le tour IA — passage forcé.');
      if (!phaseAllowsPriority(game.turnManager.phase) || game.state?.priorityHolder === AI_SIDE) safeDispatch('nextPhase', {});
      return;
    }

    const phase = game.turnManager.phase;

    if (MAIN_PHASES.has(phase)) {
      tapAllLandsForMana();
      let move = null;
      try { move = game.ai.chooseAction(); } catch (err) { log(`⚠️ Décision IA impossible : ${err.message}`); }

      if (move && move.data && move.data.card) {
        const uid = move.data.card.uid || move.data.card.name;
        if (attemptedThisPhase.has(uid)) {
          // Déjà tenté (et probablement refusé) cette phase-ci : on arrête d'insister.
          // (Le dispatch nextPhase émet 'phaseChanged', qui relance la chaîne tout seul.)
          if (game.state?.priorityHolder === AI_SIDE) safeDispatch('nextPhase', {});
          return;
        }
        attemptedThisPhase.add(uid);

        if (move.action === 'playLand') {
          safeDispatch('action', { action: 'playLand', data: { card: move.data.card, controller: AI_SIDE } });
        } else if (move.action === 'castSpell') {
          const target = chooseTargetFor(move.data.card);
          safeDispatch('castSpell', { card: move.data.card, target });
        }
        scheduleAiTurnStep(myToken); // même phase : il faut se rappeler nous-mêmes pour enchaîner
        return;
      }

      // Plus rien à jouer ce tour-ci : nextPhase() déclenchera 'phaseChanged',
      // qui relance runAiTurnStep tout seul.
      if (game.state?.priorityHolder === AI_SIDE) safeDispatch('nextPhase', {});
      return;
    }

    if (phase === 'declareAttackers') {
      let move = null;
      try { move = game.ai.chooseAction(); } catch (err) { log(`⚠️ Décision d'attaque impossible : ${err.message}`); }
      const attackers = (move && move.action === 'declareAttackers') ? move.data.attackers : [];
      safeDispatch('declareAttackers', { attackers });
      if (attackers.length > 0) log(`🤖 L'IA attaque avec ${attackers.length} créature(s).`);
      if (game.state?.priorityHolder === AI_SIDE) safeDispatch('nextPhase', {});
      return;
    }

    if (phase === 'declareBlockers') {
      // C'est le tour de l'IA (elle attaque) : c'est au joueur humain de bloquer.
      const attackers = game.combat?.combat?.attackers || [];
      if (attackers.length === 0) {
        // Rien à bloquer : pas besoin d'attendre un clic pour ça.
        if (game.state?.priorityHolder === AI_SIDE) safeDispatch('nextPhase', {});
        return;
      }
      // Sinon on n'avance pas tout seul, on attend le clic du joueur sur "Phase suivante"
      // une fois qu'il a assigné ses bloqueurs via le panneau de combat.
      return;
    }

    if (AUTO_PHASES.has(phase)) {
      safeDispatch('nextPhase', {});
      return;
    }
  }

  /** L'IA défend contre l'attaque du joueur humain : elle choisit ses bloqueurs. */
  function runAiBlockStep() {
    if (isGameOver()) return; // V11.1
    if (!game.turnManager || game.turnManager.phase !== 'declareBlockers') return;
    if (game.turnManager.activePlayer !== HUMAN_SIDE) return; // sinon c'est géré par runAiTurnStep
    if (!game.combat?.isActive || game.combat.currentPhase !== 'declareBlockers') return;
    if (game.state?.priorityHolder !== AI_SIDE) return;

    let move = null;
    try { move = game.ai.chooseAction(); } catch (err) { log(`⚠️ Décision de blocage impossible : ${err.message}`); }
    const blockers = (move && move.action === 'declareBlockers') ? move.data.blockers : {};
    safeDispatch('declareBlockers', { blockers });
    if (Object.keys(blockers).length > 0) log(`🤖 L'IA bloque avec ${Object.keys(blockers).length} créature(s).`);
  }

  function runAiPriorityStep() {
    if (isGameOver() || game.state?.priorityHolder !== AI_SIDE) return;
    if (!game.stack || game.stack.isEmpty) {
      if (game.turnManager?.activePlayer === AI_SIDE) {
        setTimeout(() => runAiTurnStep(turnToken), THINK_DELAY_MS);
      } else {
        safeDispatch('passPriority', {});
      }
      return;
    }

    let response = null;
    try { response = game.ai.chooseResponse(); } catch (err) { log(`⚠️ Réponse IA impossible : ${err.message}`); }

    if (response?.action === 'castCounter' && response.data?.card) {
      const target = pickStackTarget(game, response.data.card, AI_SIDE, response.data.target || game.stack.top);
      if (target) { safeDispatch('castSpell', { card: response.data.card, target }); return; }
    }

    // No response: pass priority. The engine will either hand priority to
    // the opponent or resolve the top item after the second consecutive pass.
    safeDispatch('passPriority', {});
  }

  events.on('priorityGiven', (evt) => {
    if (evt.side !== AI_SIDE || isGameOver()) return;
    if (game.stack?.isEmpty) {
      setTimeout(runAiPriorityStep, THINK_DELAY_MS);
      return;
    }
    setTimeout(runAiPriorityStep, THINK_DELAY_MS);
  });

  events.on('phaseChanged', (evt) => {
    if (isGameOver()) return; // V12.0 — plus aucune programmation d'action IA après la fin de partie.
    if (evt.activePlayer === AI_SIDE) {
      if (MAIN_PHASES.has(evt.phase)) attemptedThisPhase = new Set();
      if (evt.phase === 'untap') { turnToken += 1; stepCount = 0; }
      scheduleAiTurnStep(turnToken);
    } else if (evt.phase === 'declareBlockers') {
      setTimeout(runAiBlockStep, THINK_DELAY_MS);
    }
  });
}

