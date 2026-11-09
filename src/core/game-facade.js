// @ts-check
import { gameEvents } from './event-bus.js';
import { command, CommandType } from './commands.js';
import { NativeEngine } from './native-engine.js';
import { StackController } from './stack.js';
import { PriorityController } from './priority.js';
import { TargetingService } from './targeting.js';
import { StateBasedActions } from './state-based-actions.js';
import { CombatService } from './combat.js';
import { effects } from './effect-registry.js';
import { TurnManager, TurnPhase } from './turn/turn-manager.js';
import { phaseAllowsPriority } from './turn/turn-rules.js';
import { TriggerEngine } from './triggers/trigger-engine.js';
import { TriggerCollector } from './triggers/trigger-collector.js';
import { AIService } from './ai/ai-service.js';
import { ActionHistory } from './action-history.js';
import { serializeState, deserializeState } from './serialization.js';
import { ChoiceService } from './choice-service.js';
import { ReplacementService } from './replacement-effects.js';
import { installEffects } from './effects/index.js';
import { CostService } from './costs/cost-system.js';
import { ZoneManager } from './zone-manager.js';
import { SubgameManager } from './subgame-manager.js';

export class GameFacade {
  constructor({ useLegacy = false, host = null } = {}) {
    this.useLegacy = useLegacy;
    this.host = host;
    this.engine = null;
    this.stack = null;
    this.priority = null;
    this.targeting = null;
    this.stateBasedActions = null;
    this.combat = null;
    this.turnManager = null;
    this.triggerEngine = null;
    this.triggerCollector = null;
    this.ai = null;
    this.history = null;
    this.choices = null;
    this.replacements = null;
    this.costs = null;
    this.zones = null;
    this.subgames = null;
  }

  connect() {
    if (!effects.has('damage')) installEffects(effects, typeof window !== 'undefined' ? window : globalThis);
    const common = { state: () => this.state };

    this.choices = new ChoiceService({ state: () => this.state, events: gameEvents });
    gameEvents.setStateProvider(() => this.state);
    this.replacements = new ReplacementService({ state: () => this.state, choiceService: this.choices });
    this.subgames = new SubgameManager({ getState: () => this.state, setState: s => this.engine?.setState(s), zones: () => this.zones });
    this.zones = new ZoneManager({ state: () => this.state, replacements: this.replacements });
    this.stateBasedActions = new StateBasedActions({ legacyCheck: null, zones: this.zones, choiceService: this.choices });
    this.choices.afterResolve = () => { this.stateBasedActions.check(this.state); this.subgames?.settle(); };
    this.combat = new CombatService({ state: () => this.state, sba: this.stateBasedActions, replacements: this.replacements });
    this.stack = new StackController({ ...common, effects, pushLegacy: null, resolveLegacy: null, zones: this.zones, replacements: this.replacements, choiceService: this.choices, subgames: this.subgames, combat: this.combat, sba: this.stateBasedActions });
    this.turnManager = new TurnManager({ state: () => this.state, sba: this.stateBasedActions, combat: this.combat, startingPlayer: 'player', zones: this.zones, replacements: this.replacements });
    this.turnManager.delayedRunner = (at) => this.stack.runDelayed(at); // V12.76 (G28) : effets différés (fin de combat, prochaine étape finale)

    this.engine = new NativeEngine({ stack: this.stack, combat: this.combat, sba: this.stateBasedActions, turnManager: this.turnManager, effects });
    this.engine.subgameSettle = () => this.subgames.settle();
    this.costs = new CostService({ getState: () => this.state, choose: spec => this.choices?.request(spec), zones: this.zones });
    this.engine.setChoiceService(this.choices);
    this.turnManager.choiceService = this.choices; // V12.76 (G12) : choix « ne pas dégager » pendant l'étape de dégagement
    this.engine.setCostService(this.costs);
    this.engine.setReplacementService(this.replacements);
    this.engine.setZoneManager(this.zones);
    this.priority = new PriorityController({ ...common, give: this.engine.giveResponderPriority.bind(this.engine), pass: this.engine.passPriorityFrom.bind(this.engine) });
    this.targeting = new TargetingService({ getValidTargets: this.engine.getValidTargets.bind(this.engine), needsTarget: this.engine.needsTarget.bind(this.engine) });

    this.triggerCollector = new TriggerCollector({ eventBus: gameEvents, stack: this.stack, getGameState: () => this.state });
    this.triggerEngine = new TriggerEngine({ collector: this.triggerCollector, stack: this.stack, getActivePlayer: () => this.turnManager?.activePlayer || 'player' });
    this.triggerEngine.syncBattlefield(this.state);
    this.ai = new AIService({ state: () => this.state, turnManager: this.turnManager, combat: this.combat, stack: this.stack, effects, costs: this.costs, targeting: this.targeting, side: 'ai' });

    // V8.15 — Action History
    this.history = new ActionHistory({ maxSnapshots: 5 });

    return this;
  }

  /**
   * v12.74 — IA d'un côté donné ('ai' = game.ai ; 'player' = une seconde instance pour l'auto-jeu).
   * Mémorisée : une seule instance par côté.
   */
  aiFor(side) {
    if (side === 'ai') return this.ai;
    this._aiBySide = this._aiBySide || {};
    if (!this._aiBySide[side]) {
      this._aiBySide[side] = new AIService({ state: () => this.state, turnManager: this.turnManager, combat: this.combat, stack: this.stack, effects, costs: this.costs, targeting: this.targeting, side });
    }
    return this._aiBySide[side];
  }

  /** v12.74 — Libère les écouteurs du bus global (à appeler en fin de partie headless). */
  dispose() {
    this.triggerEngine?.dispose?.();
    this.triggerCollector?.clear?.();
  }

  connectLegacy() {
    this.useLegacy = true;
    return this.connect();
  }

  get state() { return this.engine?.getState() ?? null; }

  dispatch(type, payload = {}, source = 'player') {
    type = String(type || '').trim();
    const aliases = { ACTION: CommandType.ACTION, NEXT_PHASE: CommandType.NEXT_PHASE, PASS_PRIORITY: CommandType.PASS_PRIORITY, RESOLVE_STACK: CommandType.RESOLVE_STACK, CAST_SPELL: CommandType.CAST_SPELL, DECLARE_ATTACKERS: CommandType.DECLARE_ATTACKERS, DECLARE_BLOCKERS: CommandType.DECLARE_BLOCKERS, ACTIVATE_ABILITY: CommandType.ACTIVATE_ABILITY };
    type = aliases[type] || type;
    if (!this.engine) throw new Error('GameFacade is not connected');
    const cmd = command(type, payload, source);
    gameEvents.emit({ type: 'commandIssued', command: cmd });

    const stateBefore = serializeState(this.state);
    const meta = {
      turn: this.turnManager?.turnNumber || 1,
      phase: this.turnManager?.phase || 'unknown',
      activePlayer: this.turnManager?.activePlayer || 'player',
    };

    switch (type) {
      case CommandType.ACTION:
        this.engine.action(payload.action, payload.data);
        break;
      case CommandType.PASS_PRIORITY:
        this.priority.pass(source);
        break;
      case CommandType.RESOLVE_STACK:
        this.stack.resolveTop();
        this.stateBasedActions.check(this.state);
        break;
      case CommandType.DECLARE_ATTACKERS:
        this.turnManager.declareAttackers(payload.attackers || []);
        break;
      case CommandType.DECLARE_BLOCKERS:
        this.turnManager.declareBlockers(payload.blockers || {});
        break;
      case CommandType.CAST_SPELL:
        this.#castSpell(payload.card, source, payload.target, payload.xValue);
        break;
      case CommandType.ACTIVATE_ABILITY:
        this.engine.action('activateAbility', { permanent: payload.permanent, controller: source, target: payload.target, abilityIndex: payload.abilityIndex, ability: payload.ability });
        break;
      case CommandType.NEXT_PHASE:
        // V12: the phase button is also the player's explicit pass action.
        // If an object is on the stack, pressing 'next phase' passes priority
        // instead of illegally skipping resolution. Otherwise the active
        // player may advance the current phase.
        if (!phaseAllowsPriority(this.turnManager.phase) && source === this.turnManager.activePlayer) {
          // Untap/Cleanup have no priority window. Execute all consecutive
          // no-priority phases so the UI stops directly at the next real
          // decision window (normally upkeep or the next turn's upkeep).
          this.turnManager.advanceAutomaticPhases();
        } else if (this.state.priorityHolder === source && phaseAllowsPriority(this.turnManager.phase)) {
          // A phase advance is a pass whenever the caller currently has
          // priority. This is true both with and without a stack object.
          // Two passes with an empty stack advance the phase; two passes with
          // a non-empty stack resolve its top object.
          this.priority.pass(source);
        } else {
          throw new Error('Ce joueur n’a pas la priorité.');
        }
        break;
      default:
        throw new Error(`Commande inconnue: ${type}`);
    }

    this.stateBasedActions.check(this.state);
    // BUG M : point de sûreté -- une défaite dans un sous-jeu ne doit pas terminer la partie principale.
    this.subgames?.settle();

    // V8.15 — Record in history
    this.history.record(type, payload, stateBefore, serializeState(this.state), meta);

    gameEvents.emit({ type: 'commandDispatched', command: cmd, state: this.state });
    return cmd;
  }

  /** V12.32 — canonical UI/AI access to currently legal activated abilities. */
  getAbilityOptions(permanent, controller = 'player') {
    if (!this.engine) throw new Error('GameFacade is not connected');
    return this.engine.getAbilityOptions(permanent, controller);
  }

  action(action, data) { return this.dispatch(CommandType.ACTION, { action, data }); }

  #castSpell(card, controller, targetInfo = null, xValue = 0) {
    this.engine.action('cast', { card, controller, target: targetInfo, x: xValue });
  }

  // V8.15 — Snapshot helpers
  saveSnapshot() {
    return serializeState(this.state);
  }

  loadSnapshot(serialized) {
    this.engine.setState(deserializeState(serialized));
    this.triggerEngine?.syncBattlefield(this.state);
  }
}

export const game = new GameFacade();
