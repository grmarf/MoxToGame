// @ts-check
/**
 * @fileoverview MTG Beta V9.1 — Native Engine
 * Fully self-contained game engine with zero dependency on V7.2.
 * Implements all legacy-port functions using native V8 services.
 */

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Card} Card */
/** @typedef {import('./types.js').Permanent} Permanent */

import { isCastTimingLegal, timingText, timingStateOf } from './spell-timing.js';
import { gameEvents } from './event-bus.js';
import { canPayMana, payMana } from './costs/mana-cost.js';
import { CostService } from './costs/cost-system.js';
import { keywordsOf, hasKeyword } from './keywords.js';
import { normalizeCard, createPermanent } from './card-runtime.js';
import { rngClock } from './rng-clock-service.js';
import { getAbilities, isAbilityLegal, recordAbilityActivation } from './ability-model.js';
import { applyContinuousEffects, calculateCharacteristics, effectiveTypes, intrinsicLandMana } from './continuous-effects.js';
import { phaseAllowsPriority } from './turn/turn-rules.js';

/**
 * Native game engine.
 */

/**
 * Generic permanent-target restriction matcher. It deliberately evaluates
 * effective characteristics through the centralized continuous-effect
 * pipeline so type-changing effects are respected at target-validation time.
 *
 * @param {GameState} state
 * @param {Object} perm
 * @param {string|undefined} targetRestriction
 * @param {Object|null} combatState
 * @param {'player'|'ai'} [controller]
 * @returns {boolean}
 */
export function matchesTargetRestriction(state, perm, targetRestriction, combatState = null, controller = null) {
  if (!perm) return false;
  const restriction = String(targetRestriction || '');
  const chars = calculateCharacteristics(state, perm);
  const type = String(chars.type || '');
  const isCreature = /\bCreature\b/i.test(type);
  const isLand = /\bLand\b/i.test(type);
  const isArtifact = /\bArtifact\b/i.test(type);
  const isEnchantment = /\bEnchantment\b/i.test(type);

  switch (restriction) {
    case 'anyPermanent':
    case 'permanent':
      return true;
    case 'creature':
    case 'enchantedCreature':
      return isCreature;
    case 'land':
      return isLand;
    case 'creatureOrLand': // V12.76 (G19) : Fissure (« Destroy target creature or land »)
      return isCreature || isLand;
    case 'artifact':
      return isArtifact;
    case 'artifactOrEnchantment':
      return isArtifact || isEnchantment;
    case 'opponentsNonWallCreature': // V12.76 (G30) : Nettling Imp (« créature non-Mur du joueur actif » ; la fenêtre de timing garantit que c'est un adversaire)
      return /\bCreature\b/i.test(String(perm.type || '')) && !!controller && perm.controller !== controller && !String(perm.subtype || '').toLowerCase().split(/\s+/).includes('wall');
    case 'opponentsArtifact': // V12.76 (G24) : Relic Bind (« Enchanter : artefact qu'un adversaire contrôle »)
      return isArtifact && !!controller && perm.controller !== controller;
    case 'artifactCreatureOrLand': // V12.76 (G20) : Icy Manipulator (« tap target artifact, creature, or land »)
      return isArtifact || isCreature || isLand;
    case 'enchantment': // V12.76 (harnais) : Feedback (« Enchanter : enchantement »)
      return isEnchantment;
    case 'attackingCreature':
      return isCreature && !!combatState?.attackers?.some(p => p?.uid === perm.uid);
    // V12.76 (G10) : Karakas (« créature légendaire ciblée ») et Pendelhaven (« créature 1/1 ciblée »).
    case 'legendaryCreature':
      return isCreature && /\bLegendary\b/i.test(type);
    case 'oneOneCreature':
      return isCreature && Number(chars.power) === 1 && Number(chars.toughness) === 1;
    case 'attackingOrBlockingCreature': {
      if (!isCreature) return false;
      if (combatState?.attackers?.some(p => p?.uid === perm.uid)) return true;
      return Object.values(combatState?.blockers || {}).some(blockers =>
        Array.isArray(blockers) && blockers.some(p => p?.uid === perm.uid)
      );
    }
    // Other target domains: only the restrictions that explicitly admit a
    // permanent are accepted here. Player/stack/library/graveyard domains are
    // validated separately by #isLegalTarget.
    case 'anyTarget':
    case 'permanentOrSpell':
      return true;
    case 'opponentsCreature':
    case 'opponentsCreatures': {
      if (!isCreature || !controller) return false;
      const opponent = controller === 'player' ? 'ai' : 'player';
      return state?.[opponent]?.battlefield?.some(p => p?.uid === perm.uid) || perm.controller === opponent;
    }
    case 'killer':
    case 'enchanted':
      return true;
    case 'anyCard':
    case 'player':
    case 'self':
    case 'opponent':
    case 'spellOnStack':
    case 'creatureCardInGraveyard':
    case 'creatureCardInOwnGraveyard':
      return false;
    default:
      // Unknown restrictions must not silently widen a permanent target to
      // every permanent. They remain rejected until explicitly classified.
      return false;
  }
}

export class NativeEngine {
  /**
   * @param {Object} deps
   * @param {import('./stack.js').StackController} deps.stack
   * @param {import('./combat.js').CombatService} deps.combat
   * @param {import('./state-based-actions.js').StateBasedActions} deps.sba
   * @param {import('./turn/turn-manager.js').TurnManager} deps.turnManager
   * @param {import('./effect-registry.js').EffectRegistry} deps.effects
   */
  constructor({ stack, combat, sba, turnManager, effects }) {
    this.stack = stack;
    this.combat = combat;
    this.sba = sba;
    this.turnManager = turnManager;
    this.effects = effects;
    this._manaApi = { canPayMana, payMana };
    this._priorityHolder = 'player';
    this._consecutivePasses = 0;
    // Preserve runtime services across snapshot restoration.
    this.costService = this.costService || new CostService({ getState: () => this._state });
    /** @type {GameState|null} */
    this._state = this.#createInitialState();
  }

  /** @returns {GameState} */
  get state() { return this._state; }

  setChoiceService(service) { this.choiceService = service; }
  setReplacementService(service) { this.replacementService = service; }
  setZoneManager(service) { this.zoneManager = service; }
  setCostService(service) { this.costService = service || this.costService; }

  // ─────────────────────────────────────────────
  // State Management
  // ─────────────────────────────────────────────

  /** @returns {GameState} */
  getState() { return this._state; }

  /**
   * Replace the internal state (used by serialization restore).
   * @param {GameState} newState
   */
  setState(newState) {
    this._state = newState;
    if (newState.turnNumber) this.turnManager.turnNumber = newState.turnNumber;
    if (newState.activePlayer) this.turnManager.activePlayer = newState.activePlayer;
    if (newState.phase) this.turnManager.gotoPhase(newState.phase);
    this._priorityHolder = newState.priorityHolder || newState.activePlayer || 'player';
    this._consecutivePasses = 0;
    // Preserve runtime services across snapshot restoration.
    this.costService = this.costService || new CostService({ getState: () => this._state });
    gameEvents.emit({ type: 'stateRestored', state: newState });
  }

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  /**
   * Execute a game action natively.
   * @param {string} action
   * @param {Object} data
   */
  action(action, data = {}) {
    gameEvents.emit({ type: 'actionRequested', action, data });
    const before = JSON.parse(JSON.stringify(this._state));
    try {
      switch (String(action || '').trim()) {
        case 'cast': this.#castSpell(data.card, data.controller || this._state.activePlayer, data.target, data.x || 0); break;
        case 'playLand': this.#playLand(data.card, data.controller || this._state.activePlayer); break;
        case 'tapMana': this.#tapForMana(data.permanent, data.controller || this._state.activePlayer, data.color); break;
        case 'activateAbility': { const p = data.permanent; const controller = data.controller || this._state.activePlayer; const side = this._state[controller]; const actual = side?.battlefield.find(x => x.uid === p?.uid || x.objectId === p?.objectId || x === p) || p; const abilities = getAbilities(actual, controller).filter(a => a.kind === 'activated'); const a = data.abilityIndex != null ? abilities[data.abilityIndex] : (data.ability ?? data.effect); this.#activateAbility(actual, a, controller, data.target, { sacrificeUid: data.sacrifice?.uid ?? data.sacrificeUid }); break; }
        case 'nextPhase': this.turnManager.runPhase(); break;
        case 'passPriority': this.passPriorityFrom(data.controller || this._state.priorityHolder); break;
        case 'declareAttackers': this.turnManager.declareAttackers(data.attackers || []); break;
        case 'declareBlockers': this.turnManager.declareBlockers(data.blockers || {}); break;
        case 'confirmBlockers': this.turnManager.declareBlockers(data.blockers || {}); break;
        case 'resolveCombat': this.resolveCombatAssignments(); break;
        default: gameEvents.emit({ type: 'unknownAction', action, data });
      }
      this.sba.check(this._state);
      this.validateState();
    } catch (error) {
      for (const side of ['player', 'ai']) {
        const restored = JSON.parse(JSON.stringify(before[side]));
        for (const key of Object.keys(this._state[side])) delete this._state[side][key];
        Object.assign(this._state[side], restored);
      }
      for (const key of Object.keys(before)) if (key !== 'player' && key !== 'ai') this._state[key] = JSON.parse(JSON.stringify(before[key]));
      this.turnManager.activePlayer = this._state.activePlayer;
      this.turnManager.phase = this._state.phase;
      this._priorityHolder = this._state.priorityHolder;
      gameEvents.emit({ type: 'actionRolledBack', action, error: error.message });
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  // Stack (delegated to StackController)
  // ─────────────────────────────────────────────

  pushToStack(card, controller, targetInfo, xValue) {
    return this.stack.push(card, controller, targetInfo, xValue);
  }

  resolveTopOfStack() {
    const item = this.stack.resolveTop();
    this.sba.check(this._state);
    return item;
  }

  // ─────────────────────────────────────────────
  // Priority
  // ─────────────────────────────────────────────

  passPriorityFrom(side) {
    // State is the serialized source of truth; resync the runtime mirror so
    // snapshots/tests/direct state setup cannot leave the two representations
    // divergent.
    this._priorityHolder = this._state.priorityHolder;
    if (side !== this._priorityHolder) throw new Error(`Priorité détenue par ${this._priorityHolder}.`);
    if (!['player','ai'].includes(side)) throw new Error('Joueur de priorité invalide.');
    this._consecutivePasses += 1;
    const other = side === 'player' ? 'ai' : 'player';
    this._priorityHolder = other;
    this._state.priorityHolder = other;
    this.stack.pass(side);
    gameEvents.emit({ type: 'priorityPassed', side, next: other, consecutivePasses: this._consecutivePasses, stackSize: this.stack.size });
    gameEvents.emit({ type: 'priorityGiven', side: other, reason: 'passTransfer' });

    if (this._consecutivePasses < 2) return;

    this._consecutivePasses = 0;
    if (this.stack.isEmpty) {
      // No object on the stack: both players passed priority, so the current
      // phase may advance. TurnManager owns the phase transition.
      this.turnManager.runPhase();
    } else {
      // Two consecutive passes resolve exactly one top object. Any triggers
      // created during resolution are already on the stack when we restore
      // priority below.
      this.resolveTopOfStack();
    }

    // BUG M : une défaite DANS un sous-jeu (Shahrazad) termine le sous-jeu, pas la partie.
    if ((this._state.player.hasLost || this._state.ai.hasLost) && this.subgameSettle) this.subgameSettle();
    if (this._state.player.hasLost || this._state.ai.hasLost) {
      this._priorityHolder = null;
      this._state.priorityHolder = null;
      gameEvents.emit({ type: 'gameEndedByPriority', reason: 'stateBasedAction' });
      return;
    }

    this._priorityHolder = phaseAllowsPriority(this.turnManager.phase)
      ? this.turnManager.activePlayer
      : null;
    this._state.priorityHolder = this._priorityHolder;
    if (this._priorityHolder) {
      gameEvents.emit({ type: 'priorityGiven', side: this._priorityHolder, reason: 'postResolution' });
    }
  }

  giveResponderPriority(side) {
    if (!['player','ai'].includes(side)) throw new Error('Joueur de priorité invalide.');
    this._priorityHolder = side;
    this._state.priorityHolder = side;
    this._consecutivePasses = 0;
    gameEvents.emit({ type: 'priorityGiven', side, reason: 'responseWindow' });
  }

  // ─────────────────────────────────────────────
  // Targeting
  // ─────────────────────────────────────────────

  getValidTargets(effectType, controller, colors = [], cardEffect = null, sourceCard = null) {
    const list = this.#enumerateTargets(effectType, controller);
    if (!cardEffect) return list;
    // v12.74 : filtrage par la définition de la carte, avec le MÊME contrôle que le lancement
    // (#isLegalTarget) : l'UI et l'IA ne se voient plus proposer de cibles qui seront refusées.
    const FILTERABLE = new Set(['permanent', 'player', 'stackItem', 'libraryCard', 'graveyardCard']);
    return list.filter((t) => {
      const n = this.#normalizeTarget(t, controller);
      if (!n || !FILTERABLE.has(n.kind)) return true;   // formes spéciales ({type:'self'}...) : inchangées
      try { return this.#isLegalTarget(cardEffect, controller, n, sourceCard); } catch { return false; }
    });
  }

  #enumerateTargets(effectType, controller) {
    const state = this._state;
    const allPerms = [...state.player.battlefield, ...state.ai.battlefield].map(perm => ({ kind:'permanent', perm, uid:perm.uid, name:perm.name }));
    const players = [{kind:'player',side:'player',id:'player'},{kind:'player',side:'ai',id:'ai'}];
    const opponent = controller === 'player' ? 'ai' : 'player';

    switch (effectType) {
      case 'damage':
      case 'destroy':
      case 'exile':
      case 'bounce':
      case 'tapTarget':
      case 'pump':
      case 'discard':
        return allPerms;
      // V12.76 (G19) : « target player draws / discards » (Ancestral Recall, Braingeyser, Mind Twist). L'ordre est celui du
      // choix par défaut de l'IA (non modifiée : elle prend la 1re option) : soi d'abord pour piocher, l'adversaire d'abord pour défausser.
      case 'drawTarget':
        return controller === 'player' ? players : [players[1], players[0]];
      case 'discardRandomTarget':
        return controller === 'player' ? [players[1], players[0]] : players;
      case 'lookTopTarget': // V12.75 : Natural Selection regarde la bibliothèque d'UN joueur ciblé
      case 'damageByCount': // V12.75 : Storm Seeker, Jovial Evil, Eternal Flame ciblent un joueur
        return players;
      case 'anyTarget':
        return [...allPerms, ...players];
      case 'discardRandom':
        return state[opponent].hand.length > 0 ? [{ type: 'opponentHand' }] : [];
      case 'draw':
      case 'gainLife':
      case 'mana':
        return [{ type: 'self' }];
      case 'counterSpell':
      case 'counterCMC':
      case 'counterSpellColor':
      case 'counterUnlessPay':
      case 'counterSpellGainMana':   // v12.74 : Mana Drain n'était énuméré par aucun cas : aucune cible proposée
        // v12.74 : un contresort ne contre que des SORTS ; les capacités (déclenchées ou activées) sont exclues.
        return this.stack.items.filter(item => item.type === 'spell').map(item => ({
          ...item,
          _kind: 'stackItem',
          name: item.source?.name || 'Sort',
          type: item.source?.type || 'Spell',
        }));
      case 'copyPermanent':
        return allPerms.filter(p => /Creature/i.test(String(p.perm?.type || '')));
      case 'copySpell':
        return this.stack.items.filter(item => /Instant|Sorcery/i.test(String(item.source?.type || ''))).map(item => ({ ...item, _kind:'stackItem', name:item.source?.name || 'Sort', type:item.source?.type || 'Spell' }));
      case 'tutor':
        return state[controller].library.map(card => ({
          ...card,
          _kind: 'libraryCard',
        }));
      default:
        return allPerms;
    }
  }
  getAbilityOptions(permanentRef, controller) {
    const side=this._state[controller];
    const p=side.battlefield.find(x=>x.uid===permanentRef?.uid) || permanentRef;
    if(!p || !side.battlefield.includes(p)) return [];
    return getAbilities(p, controller).filter(a=>a.kind==='activated' && isAbilityLegal(a,{permanent:p,state:this._state,controller,canPay:(s,c,x)=>this.costService.canPay(controller,c,{controller,permanent:p,xValue:x})}));
  }

  choose(spec) {
    if(!this.choiceService) return spec.defaultValue ?? null;
    return this.choiceService.request(spec);
  }

  needsTarget(effectType) {
    const noTargetTypes = [
      'draw', 'gainLife', 'fog', 'extraTurn', 'wheel', 'mana',
      'untapAllLands', 'sirenCall', // V12.76 (G29) : Reset, Siren's Call (aucune cible)
      'forcefield', 'preventDamageToYou', // V12.76 (G31) : Forcefield, Conservator (aucune cible)
      'destroyAllCreatures', 'destroyAllLands', 'destroyAllEnchantments',
      'destroyAllMatching', // V12.75 : destruction/exil de masse filtrés (Cleanse, Tsunami, Shatterstorm...)
      'damageEachOpponentByCount', 'tapAllMatching', 'damageAttackers', 'shuffleHandRedraw', // V12.75 : lot E, sorts calculés sans cible
      'drainMana', 'reverseDamage', 'destroyXMountains', 'forceAttackAll', // V12.75 : étape 2, sorts sans cible
      'massPump', // V12.75 : sorts de masse sans cible (Army of Allah, Morale, Piety, Shield Wall, Hell Swarm...)
      'damageAllCreaturesAndPlayers', 'damageToFliersAndPlayers',
      'emptyManaPool', 'gainLifePerCreature', 'noop', 'searchLibrary', 'lookTop', 'putTopCardBottom', 'chooseColor', 'chooseNumber', 'coinFlip', 'createToken', 'randomDiscard', 'returnFromGraveyard', 'discardRandom', 'startSubgame', 'discardHandDraw', 'drainOpponents', 'mindBombDiscard',
      'addCounter', 'untapSelf', 'destroyEnchanted', // (drawTarget / discardRandomTarget : AVEC cible — G19)
      // V12.76 (G16) : Blight
      // V12.76 (G11) : marqueur sur la source (Mana Batteries), « dégagez ce permanent » (Basalt Monolith)
    ];
    return !noTargetTypes.includes(effectType);
  }

  // ─────────────────────────────────────────────

  resolveCombatAssignments() {
    if (!this.combat.isActive) return [];
    return this.combat.resolveDamage();
  }

  confirmAttackers(attackers) {
    return this.combat.confirmAttackers(attackers);
  }

  proceedToPlayerBlocks(attackers) {
    this.combat.toDeclareAttackers(attackers);
    return this.combat.confirmAttackers(attackers);
  }

  // ─────────────────────────────────────────────
  // AI Config (stub for compatibility)
  // ─────────────────────────────────────────────

  setAiConfig(difficulty, playstyle) {
    this._state.aiConfig = { difficulty, playstyle };
  }

  #tapForMana(permanent, controller, color = null) {
    const side = this._state[controller];
    const perm = side.battlefield.find(p => p.uid === permanent?.uid);
    // v12.74 : une créature à mana (Llanowar Elves...) déclare sa production dans tapAbility.produces, pas produces.
    if (!perm || (!String(perm.type || '').includes('Land') && !perm.produces && !perm.tapAbility?.produces)) throw new Error('Permanent producteur introuvable.');
    if (perm.tapped) throw new Error('Ce permanent est déjà engagé.');
    // V12.76 : Blood Moon — un terrain non-base devenu Montagne produit {R} et rien d'autre.
    const produced = intrinsicLandMana(this._state, perm) || String(perm.produces || perm.tapAbility?.produces || '');
    if (!produced) throw new Error('Ce terrain n’a pas de capacité de mana native.');
    const chosen = color || (produced === 'any' ? 'G' : produced[0]);
    if (produced !== 'any' && !produced.includes(chosen)) throw new Error('Couleur de mana invalide.');
    this.costService.pay(controller, { tap: true }, { controller, permanent: perm });
    // V12.76 : Goblin Caves — la Montagne enchantée produit {R}{R} au lieu de {R}.
    let amount = 1;
    // V12.76 (G11) : « {T} : ajoutez {C}{C}{C} » (Mana Vault, Basalt Monolith) — une production faite d'UNE seule couleur répétée donne
    // autant de mana ; une production à couleurs différentes (« WU ») reste un choix d'une couleur.
    if (produced !== 'any' && produced.length > 1 && [...produced].every((ch) => ch === produced[0])) amount = produced.length;
    for (const a of [...this._state.player.battlefield, ...this._state.ai.battlefield]) {
      if (a.isAura && a.attachedTo === perm.uid && a.auraEffect?.type === 'manaMultiplier' && (!a.auraEffect.color || a.auraEffect.color === chosen)) amount = Math.max(amount, Number(a.auraEffect.amount || 1));
    }
    // V12.76 (G9) : Urza's Mine / Power Plant / Tower — montant conditionnel lu dans la base (`manaIf`), jamais par nom de carte.
    const mi = perm.manaIf;
    if (mi && Array.isArray(mi.controls) && mi.controls.every(n => side.battlefield.some(q => q !== perm && q.name === n))) amount = Math.max(amount, Number(mi.amount || 1));
    side.mana[chosen] = (side.mana[chosen] || 0) + amount;
    gameEvents.emit({ type: 'manaAdded', side: controller, color: chosen, amount, permanent: perm });
    this.#applyManaBonusAuras(perm, controller);
    // V12.76 : tirer du mana d'un artefact est AUSSI activer une de ses capacités (Haunting Wind frappe Sol Ring, etc.).
    if (/Artifact/.test(String(calculateCharacteristics(this._state, perm).type || ''))) gameEvents.emit({ type: 'artifactAbilityActivated', permanent: perm, controller, side: controller, tapCost: true });
  }

  /** Load and shuffle a deck. Used by the UI and tests. */
  loadDeck(side, cards, { draw = 7 } = {}) {
    if (!this._state[side]) throw new Error(`Unknown side: ${side}`);
    const deck = cards.map((c) => { const card=normalizeCard(c); card.owner=side; card.zone='library'; card.objectId=card.objectId||rngClock.uuid('obj'); card.uid=card.uid||rngClock.uuid('card'); return card; });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rngClock.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this._state[side].library = deck;
    this._state[side].hand = [];
    this._state[side].graveyard = [];
    this._state[side].exile = [];
    const drawCount = Math.min(Math.max(0, Number(draw) || 0), deck.length);
    for (let i = 0; i < drawCount; i++) {
      const card = this._state[side].library[this._state[side].library.length - 1];
      if (this.zoneManager) {
        this.zoneManager.move(card, 'hand', { toSide: side, reason: 'draw' });
      } else {
        this._state[side].hand.push(this._state[side].library.pop());
      }
    }
    return this._state[side];
  }

  /**
   * v12.73 — Une carte quitte la main (lancement d'un sort, pose d'un terrain) par le chemin canonique
   * ZoneManager.remove. L'identité est garantie d'abord (une carte sans uid n'est sinon pas retrouvée) ;
   * repli par index si ZoneManager est absent ou ne l'a pas retrouvée.
   */
  #leaveHand(card, side, index) {
    if (this.zoneManager) {
      this.zoneManager.ensureIdentity(card, { owner: card.owner || null });
      if (this.zoneManager.remove(card)) return;
    }
    const i = side.hand.indexOf(card);
    if (i >= 0) side.hand.splice(i, 1);
  }

  /** Cast a spell after validating timing, ownership and mana. */
  #castSpell(card, controller, targetInfo = null, xValue = 0) {
    const side = this._state[controller];
    const index = side.hand.indexOf(card);
    if (index < 0) throw new Error('La carte à lancer n’est pas dans la main.');
    if (String(card.type || '').includes('Land')) throw new Error('Un terrain ne se lance pas comme un sort.');
    if (this._state.priorityHolder !== controller) throw new Error('Ce joueur n’a pas la priorité.');
    const isInstantSpeed = /Instant/i.test(String(card.type || '')) || /Flash/i.test(String(card.text_fr || '')) || card.flash === true;
    const isMain = ['main1', 'main2'].includes(this.turnManager.phase) && this.turnManager.activePlayer === controller;
    if (!isMain && !isInstantSpeed) throw new Error('Ce sort ne peut pas être lancé à ce moment.');
    // V12.76 (G29) : M1 — « Lancez ce sort uniquement… » (fenêtre de timing propre à la carte).
    if (card.castOnlyDuring && !isCastTimingLegal(card.castOnlyDuring, timingStateOf(this.turnManager), controller)) throw new Error(`Ce sort ne peut être lancé que ${timingText(card.castOnlyDuring)}.`);
    if (card.xSpell && xValue < 0) throw new Error('Valeur X invalide.');
    // V12.75 : Clone / Vesuvan Doppelganger — « vous POUVEZ choisir une créature » : sans créature à copier, la carte
    // se lance quand même (elle arrive 0/0 et meurt), la copie est donc facultative.
    const optionalCopy = card.effect?.type === 'copyPermanent' && /Creature/i.test(String(card.type || ''));
    if (this.needsTarget(card.effect?.type) && !targetInfo && card.effect && !optionalCopy) throw new Error('Une cible est requise.');
    // v12.74 : on normalise AVANT de juger la légalité (une cible de bibliothèque énumérée porte `_kind`).
    targetInfo = this.#normalizeTarget(targetInfo, controller);
    if (targetInfo && card.effect && !this.#isLegalTarget(card.effect, controller, targetInfo, card)) throw new Error('Cible illégale.');
    this.costService.pay(controller, card.cost || '', { controller, xValue, card });
    // v12.73 : la carte quitte la main par le chemin canonique (ZoneManager.remove) ; la pile n'est pas
    // une zone suivie, l'objet y est ensuite posé par pushSpell.
    this.#leaveHand(card, side, index);
    const item = this.stack.pushSpell(card, controller, targetInfo, xValue);
    gameEvents.emit({ type: 'spellCast', card, controller, xValue, item });
    // Casting a spell ends the caster's action window. The opponent receives
    // priority to respond before the spell can resolve.
    this.giveResponderPriority(controller === 'player' ? 'ai' : 'player');
    return item;
  }

  /** V12.76 (G9) : couleurs (W/U/B/R/G) que les terrains de l'ADVERSAIRE de `controller` pourraient produire (Fellwar Stone). */
  #opponentLandColors(controller) {
    const opp = controller === 'player' ? 'ai' : 'player';
    const found = new Set(); const COLORS = ['W','U','B','R','G'];
    for (const land of this._state[opp].battlefield) {
      if (!/Land/.test(String(calculateCharacteristics(this._state, land).type || ''))) continue;
      const raw = intrinsicLandMana(this._state, land) || String(land.produces || land.tapAbility?.produces || '');
      if (raw === 'any') COLORS.forEach(c => found.add(c)); else for (const ch of raw) if (COLORS.includes(ch)) found.add(ch);
      for (const a of land.activated || []) if (a.manaAbility && a.effect?.type === 'mana') { if (a.effect.color === 'any') COLORS.forEach(c => found.add(c)); else if (COLORS.includes(a.effect.color)) found.add(a.effect.color); }
    }
    return COLORS.filter(c => found.has(c));
  }

  /** V12.76 (lot G15) : « chaque fois que le terrain enchanté est engagé pour du mana, son contrôleur ajoute {G} » (Wild Growth) : tout chemin de mana. */
  #applyManaBonusAuras(perm, controller) {
    const side = this._state[controller];
    for (const a of [...this._state.player.battlefield, ...this._state.ai.battlefield]) {
      if (a.isAura && a.attachedTo === perm.uid && a.auraEffect?.type === 'manaBonus') {
        const color = a.auraEffect.color || 'C'; const n = Number(a.auraEffect.amount ?? 1);
        side.mana[color] = (side.mana[color] || 0) + n;
        gameEvents.emit({ type: 'manaAdded', side: controller, color, amount: n, permanent: perm });
      }
    }
  }

  #resolveManaAbility(ability, permanent, controller, options = {}) {
    const side = this._state[controller];
    const rawMana = permanent.tapAbility || null;
    const effect = rawMana
      ? { type: 'mana', color: (rawMana.produces === 'any' || rawMana.chooseColorAmount) ? 'any' : (rawMana.produces || undefined), amount: rawMana.chooseColorAmount || 1 }
      : ability.effect;
    if(!effect?.type || effect.type !== 'mana') throw new Error('Capacité de mana invalide.');

    const cost = {
      mana: ability.costSpec?.mana || (typeof ability.cost === 'string' ? ability.cost : ''),
      tap: !!ability.tap,
      sacrifice: rawMana?.sacrifice ? true : (ability.costSpec?.sacrifice || false), // V12.76 : « {T}, sacrifiez : ajoutez… » écrit en `activated` (objet { type, choose } conservé : Priest of Yawgmoth)
    };
    const paid = this.costService.pay(controller, cost, {controller, permanent, sacrificeUid: options.sacrificeUid, typeOf:(p)=>calculateCharacteristics(this._state,p).type});

    const addMana = (resolvedEffect) => {
      const amount = Math.max(1, Number(resolvedEffect.amount ?? 1));
      if(!Number.isFinite(amount)) throw new Error('Quantité de mana invalide.');
      const color = resolvedEffect.color || 'C';
      if(!['W','U','B','R','G','C'].includes(color)) throw new Error('Mana produit invalide.');
      for(let i=0;i<amount;i++) side.mana[color] = (side.mana[color] || 0) + 1;
      gameEvents.emit({type:'manaAdded',side:controller,color,amount,permanent});
      this.#applyManaBonusAuras(permanent, controller);
      // V12.76 (G9) : Rainbow Vale — « un adversaire prend le contrôle de ce terrain au début de la prochaine étape de fin ».
      // Chaque activation crée UN changement de contrôle différé (traité par TurnManager à l'entrée de l'étape de fin) ;
      // le bénéficiaire est l'adversaire de celui qui a ACTIVÉ la capacité, pas de son contrôleur à ce moment-là.
      if (resolvedEffect.passControlAtEndStep) this._state.delayedControl = [...(this._state.delayedControl || []), { uid: permanent.uid, to: controller === 'player' ? 'ai' : 'player', source: permanent.name }];
      // V12.76 : « ajoutez {B}. La carte vous inflige 1 blessure » (Elves of Deep Shadow) — blessure canonique (prévention, Ali...).
      if (Number(resolvedEffect.selfDamage) > 0) this.replacementService?.applyDamageToPlayer?.(controller, Number(resolvedEffect.selfDamage), { color: permanent.color?.[0] || null, source: permanent, meta: { effect: 'manaSelfDamage' } });
      if (/Artifact/.test(String(calculateCharacteristics(this._state, permanent).type || ''))) gameEvents.emit({ type: 'artifactAbilityActivated', permanent, controller, side: controller, tapCost: !!ability?.tap }); // V12.76 : Haunting Wind (Sol Ring...)
      recordAbilityActivation(permanent, ability);
      return { manaAbility:true, permanent, color, amount };
    };

    if(effect.color === 'any' || effect.color === 'opponentLands') {
      // V12.76 (G9) : Fellwar Stone — « un mana de n'importe quelle couleur qu'un terrain contrôlé par un adversaire pourrait produire ».
      const options = effect.color === 'opponentLands' ? this.#opponentLandColors(controller) : ['W','U','B','R','G'];
      if(!options.length) { recordAbilityActivation(permanent, ability); if (/Artifact/.test(String(calculateCharacteristics(this._state, permanent).type || ''))) gameEvents.emit({ type: 'artifactAbilityActivated', permanent, controller, side: controller, tapCost: !!ability?.tap }); return { manaAbility:true, permanent, color:null, amount:0 }; }
      if(options.length === 1) return addMana({...effect, color:options[0]});
      const spec = { type:'manaColor', controller, options, min:1, max:1, prompt:'Choisissez une couleur de mana.', defaultValue:options[0] };
      const chosen = this.choiceService ? this.choiceService.request(spec) : spec.defaultValue;
      if(chosen != null) return addMana({...effect, color:chosen});
      const pending = this.choiceService?.getPending?.();
      if(pending) {
        const originalResolve = pending._continuation;
        pending._continuation = (value) => addMana({...effect, color:value});
        return { manaAbility:true, permanent, pendingChoice:pending.id };
      }
      return { manaAbility:true, permanent, pendingChoice:true };
    }

    // V12.76 (G11) : Mana Batteries — « retirez n'importe quel nombre de marqueurs de charge : ajoutez {B}, puis ajoutez un {B} de plus
    // par marqueur retiré ». Le nombre de marqueurs retirés est un VRAI choix (0 à N) ; sans marqueur, aucun choix n'est demandé.
    // V12.76 (G13) : « ajoutez {B} égal à la valeur de mana de l'artefact sacrifié » (Priest of Yawgmoth) ; valeur nulle : aucun mana, coût quand même payé.
    if (effect.amountFrom === 'sacrificedManaValue') {
      const n = Number(paid?.sacrifice?.cmc ?? 0);
      if (!(n > 0)) { recordAbilityActivation(permanent, ability); return { manaAbility: true, permanent, color: null, amount: 0 }; }
      return addMana({ ...effect, amount: n });
    }
    // V12.76 (G22) : City of Shadows — « ajoutez {C} pour chaque marqueur de stockage sur ce terrain » : les marqueurs sont COMPTÉS, pas retirés.
    if (effect.perCounter) {
      const n = (permanent.counters || []).filter((c) => c.type === effect.perCounter.counter).length * Number(effect.perCounter.amount ?? 1);
      if (!(n > 0)) { recordAbilityActivation(permanent, ability); return { manaAbility: true, permanent, color: null, amount: 0 }; } // aucun marqueur : activée, aucun mana
      return addMana({ ...effect, color: effect.color || 'C', amount: n });
    }
    if (effect.perCounterRemoved) {
      const pc = effect.perCounterRemoved;
      const have = (permanent.counters || []).filter((c) => c.type === pc.counter).length;
      const finish = (n) => {
        n = Number(n);
        if (!Number.isInteger(n) || n < 0 || n > have) throw new Error('Nombre de marqueurs invalide.');
        let removed = 0;
        permanent.counters = (permanent.counters || []).filter((c) => (c.type === pc.counter && removed < n) ? (removed++, false) : true);
        const total = Number(effect.amount ?? 0) + n * Number(pc.amount ?? 1);
        if (total <= 0) { recordAbilityActivation(permanent, ability); return { manaAbility: true, permanent, color: null, amount: 0 }; } // 0 marqueur retiré : aucun mana
        return addMana({ ...effect, color: effect.color || 'C', amount: total });
      };
      if (have === 0) return finish(0);
      const spec = { type: 'number', controller, options: Array.from({ length: have + 1 }, (_, i) => i), min: 1, max: 1, prompt: `Combien de marqueurs ${pc.counter} retirer ?`, defaultValue: 0 };
      const chosen = this.choiceService ? this.choiceService.request(spec) : spec.defaultValue;
      if (chosen != null) return finish(chosen);
      const pending = this.choiceService?.getPending?.();
      if (pending) { pending._continuation = (value) => finish(value); return { manaAbility: true, permanent, pendingChoice: pending.id }; }
      return { manaAbility: true, permanent, pendingChoice: true };
    }

    // Generic activated mana abilities use the same registered mana effect
    // semantics, but resolve synchronously instead of entering the stack.
    const normalized = {...effect};
    if(normalized.amount === 'CC') normalized.amount = 2;
    const color = normalized.color || 'C';
    return addMana({...normalized, color});
  }

  /** Activate a canonical ability (M3). */
  /** V12.76 (G13) : permanents que `controller` peut sacrifier pour une exigence { type, other } (types EFFECTIFS). */
  #sacrificeCandidates(controller, req, source) {
    const res = [].concat(req.type).map((t) => new RegExp('\\b' + t + '\\b', 'i'));
    return this._state[controller].battlefield.filter((p) => {
      const ch = calculateCharacteristics(this._state, p);
      return res.some((re) => re.test(String(ch.type || '') + ' ' + String(ch.subtype || ''))) && !(req.other && source && p.uid === source.uid);
    });
  }

  #activateAbility(permanentRef, abilityOrEffect, controller, targetInfo = null, options = {}) {
    const side=this._state[controller];
    if(this._state.priorityHolder!==controller) throw new Error(`Ce joueur n'a pas la priorité.`);
    const permanent=side.battlefield.find(p=>p.uid===permanentRef?.uid)||permanentRef;
    if(!permanent||!side.battlefield.includes(permanent)) throw new Error('Permanent introuvable.');
    const ability = abilityOrEffect?.kind ? abilityOrEffect : (abilityOrEffect?.effect ? abilityOrEffect : (abilityOrEffect?.type ? {effect:abilityOrEffect,cost:''} : null));
    if(!ability) throw new Error('Capacité activée invalide.');
    if(!isAbilityLegal(ability,{permanent,state:this._state,controller,canPay:(s,c,x)=>this.costService.canPay(controller,c,{controller,permanent,xValue:x,typeOf:(p)=>calculateCharacteristics(this._state,p).type}),xValue:0})) throw new Error('Capacité activée illégale.');
    // V12.76 (G13) : « sacrifiez un artefact » (Priest of Yawgmoth) : vrai choix du joueur parmi ses permanents admissibles
    // (un seul candidat : automatique ; plusieurs : choix, l'activation reprend à sa réponse).
    const sacReq = ability.costSpec?.sacrifice ?? (ability.cost && typeof ability.cost === 'object' ? ability.cost.sacrifice : undefined) ?? ability.sacrifice;
    const exileReq = ability.costSpec?.exile ?? (ability.cost && typeof ability.cost === 'object' ? ability.cost.exile : undefined); // V12.76 (G22) : City of Shadows — « exilez une créature que vous contrôlez »
    const chooseReq = (sacReq && typeof sacReq === 'object' && sacReq.choose) ? sacReq : ((exileReq && typeof exileReq === 'object' && exileReq.type && exileReq.choose) ? exileReq : null);
    if (chooseReq && !options.sacrificeUid) {
      const candidates = this.#sacrificeCandidates(controller, chooseReq, permanent);
      if (candidates.length === 1) options = { ...options, sacrificeUid: candidates[0].uid };
      else if (candidates.length > 1) {
        const spec = { type: 'sacrificeChoice', controller, options: candidates, min: 1, max: 1, prompt: chooseReq === exileReq ? 'Choisissez la créature à exiler.' : 'Choisissez le permanent à sacrifier.', defaultValue: candidates[0] };
        const go = (picked) => this.#activateAbility(permanentRef, abilityOrEffect, controller, targetInfo, { ...options, sacrificeUid: (Array.isArray(picked) ? picked[0] : picked)?.uid });
        const chosen = this.choiceService ? this.choiceService.request(spec) : null;
        if (chosen != null) return go(chosen);
        const pending = this.choiceService?.getPending?.();
        if (pending) { pending._continuation = (value) => go(value); return { pendingChoice: pending.id }; }
        return go(spec.defaultValue);
      }
    }
    if(ability.manaAbility) {
      return this.#resolveManaAbility(ability, permanent, controller, options);
    }
    if(!ability.effect?.type && !(ability.effects?.length)) throw new Error('Capacité activée sans effet.');
    const effect = ability.effects?.length > 1 ? { type:'sequence', effects:ability.effects } : ability.effect;
    // v12.74 : on normalise puis on juge la cible AVANT de payer le coût (même ordre que #castSpell).
    // Hygiène seulement : `action()` restaure l'état sur toute exception, donc payer d'abord ne perdait
    // déjà rien d'observable ; mais on évite un paiement + une restauration inutiles.
    targetInfo = this.#normalizeTarget(targetInfo, controller);
    if(targetInfo && effect && !this.#isLegalTarget(effect,controller,targetInfo,permanent)) throw new Error('Cible illégale.');
    // V12.76 : coût structuré (`cost: { mana, tap, sacrifice }`) : Aeolipile, Orcish Mechanics... (jusqu'ici seul le mana et l'engagement étaient payés).
    const costObj = ability.cost && typeof ability.cost === 'object' ? ability.cost : null;
    this.costService.pay(controller, { mana: costObj ? (costObj.mana || '') : (ability.cost || ''), tap: !!ability.tap || !!costObj?.tap, sacrifice: costObj?.sacrifice ?? ability.sacrifice, exile: costObj?.exile }, {controller, permanent, sacrificeUid: options.sacrificeUid, typeOf:(p)=>calculateCharacteristics(this._state,p).type});
    const item=this.stack.pushAbility(permanent,effect,controller,targetInfo);
    recordAbilityActivation(permanent, ability);
    gameEvents.emit({type:'abilityActivated',permanent,ability,controller,item});
    if (/Artifact/.test(String(calculateCharacteristics(this._state, permanent).type || ''))) gameEvents.emit({ type: 'artifactAbilityActivated', permanent, controller, side: controller, tapCost: !!ability.tap || !!costObj?.tap }); // V12.76 : Haunting Wind
    // Activated abilities use the same response window as spells.
    this.giveResponderPriority(controller === 'player' ? 'ai' : 'player');
    return item;
  }

  #isLegalTarget(effect, controller, targetInfo, sourceCard = null) {
    if (!targetInfo) return !this.needsTarget(effect.type) || effect.type === 'copyPermanent';

    const restriction = effect?.target;

    // Non-permanent target domains are validated here before consulting the
    // broad permanent candidate list. These forms are already represented by
    // normalized target objects elsewhere in the engine, so keep their
    // validation generic rather than tying it to individual cards.
    if (targetInfo.kind === 'player') {
      if (restriction === 'anyTarget' || restriction === 'player') return true;
      if (restriction === 'self') return targetInfo.side === controller;
      if (restriction === 'opponent') return targetInfo.side === (controller === 'player' ? 'ai' : 'player');
      return false;
    }
    if (targetInfo.kind === 'stackItem') {
      if (restriction && !['spellOnStack', 'permanentOrSpell'].includes(restriction)) return false;
      const id = targetInfo.id || targetInfo.uid || targetInfo;
      const item = this.stack.items.find(it => it.id === id);
      if (!item) return false;
      // v12.74 : seuls les SORTS sont des cibles de contresort / copie (pas les capacités), et
      // `condition: 'creatureSpell'` (Remove Soul) n'était lue nulle part : il contrait n'importe quel sort.
      if (item.type !== 'spell') return false;
      // V12.75 : conditions de type de sort lues par table (Remove Soul, Flash Counter, Artifact Blast...).
      const SPELL_CONDITIONS = { creatureSpell: /Creature/i, instantSpell: /Instant|Interrupt/i, artifactSpell: /Artifact/i };
      // V12.75 : Fork copie un éphémère ou un rituel ; un sort de créature ou d'artefact n'est pas une cible légale.
      if (effect.type === 'copySpell' && effect.targetType === 'instantOrSorcery' && !/Instant|Sorcery|Interrupt/i.test(String(item.source?.type || ''))) return false;
      if (effect.condition && SPELL_CONDITIONS[effect.condition] && !SPELL_CONDITIONS[effect.condition].test(String(item.source?.type || ''))) return false;
      return true;
    }
    if (targetInfo.kind === 'libraryCard') {
      if (restriction !== 'anyCard') return false;
      const uid = targetInfo.uid || targetInfo.id || targetInfo;
      return [...this._state.player.library, ...this._state.ai.library].some(card => card.uid === uid || card.id === uid);
    }
    if (targetInfo.kind === 'graveyardCard') {
      if (!['creatureCardInGraveyard', 'creatureCardInOwnGraveyard'].includes(restriction)) return false;
      const uid = targetInfo.uid || targetInfo.id || targetInfo;
      const zones = restriction === 'creatureCardInOwnGraveyard'
        ? [this._state[controller].graveyard]
        : [this._state.player.graveyard, this._state.ai.graveyard];
      return zones.flat().some(card => (card.uid === uid || card.id === uid) && /\bCreature\b/i.test(String(card.type || '')));
    }
    if (targetInfo.kind !== 'permanent') return false;

    const candidates = this.getValidTargets(effect.type === 'damage' && restriction === 'anyTarget' ? 'anyTarget' : effect.type, controller);
    const uid = targetInfo.uid || targetInfo.id || targetInfo;
    const candidate = candidates.find(t =>
      t === targetInfo ||
      (uid != null && (t.uid === uid || t.id === uid)) ||
      (targetInfo.perm && t.perm && (t.perm === targetInfo.perm || (targetInfo.perm.uid != null && t.perm.uid === targetInfo.perm.uid) || (targetInfo.perm.objectId != null && t.perm.objectId === targetInfo.perm.objectId))) ||
      (targetInfo.side != null && t.kind === targetInfo.kind && t.side === targetInfo.side)
    );
    if (!candidate) return false;
    // v12.74 : `colorRestriction` (Blue / Red Elemental Blast : « détruisez le permanent ROUGE / BLEU ciblé »)
    // n'était lu nulle part : ces sorts pouvaient viser n'importe quel permanent. On lit la couleur
    // EFFECTIVE (effets continus inclus) du permanent visé.
    if (effect.colorRestriction) {
      const perm = candidate.perm || targetInfo.perm;
      let colors = [];
      try { colors = effectiveTypes(this._state, perm).color || []; } catch { colors = perm?.color || []; }
      if (!colors.includes(effect.colorRestriction)) return false;
    }
    // V12.76 (G20) : `restrict` {notColor, notArtifact} (Terror : « nonartifact, nonblack creature ») n'était lu NULLE PART : Terror détruisait
    // aussi les créatures noires et les créatures-artefacts. Couleur et types EFFECTIFS (effets continus inclus).
    if (effect.restrict) {
      const perm = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (perm) {
        let chars = null; try { chars = calculateCharacteristics(this._state, perm); } catch { chars = perm; }
        if (effect.restrict.notColor && (chars.color || []).includes(effect.restrict.notColor)) return false;
        if (effect.restrict.notArtifact && /\bArtifact\b/i.test(String(chars.type || ''))) return false;
      }
    }
    // V12.75 : `requireTapped` (Royal Assassin : « la créature ENGAGÉE ciblée ») n'était lu nulle part.
    // V12.76 (G21) : `requireMaxPower` (Tawnos's Wand : « creature with power 2 or less ») — force EFFECTIVE.
    if (effect.requireMaxPower != null) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (!live || Number(calculateCharacteristics(this._state, live).power) > Number(effect.requireMaxPower)) return false;
    }
    // V12.76 : `requireSubtype` (Goblin Caves : « Montagne » ciblée) — sous-type effectif.
    if (effect.requireSubtype) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      const have = live ? String(calculateCharacteristics(this._state, live).subtype || '').split(/\s+/) : [];
      // V12.76 : liste = « OU » (King Suleiman : un Djinni ou un Efreet)
      if (!live || ![].concat(effect.requireSubtype).some((s) => have.includes(s))) return false;
    }
    // V12.76 : couleur effective (Spinal Villain : « la créature bleue ciblée »).
    if (effect.requireColor) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (!live || ![].concat(effectiveTypes(this._state, live).color || []).includes(effect.requireColor)) return false;
    }
    // V12.76 (G26) : protection contre les artefacts (Artifact Ward) — une capacité ou un sort dont la SOURCE est un artefact ne peut pas cibler ce permanent.
    if (sourceCard && /Artifact/.test(String(sourceCard.type || ''))) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (live && calculateCharacteristics(this._state, live).keywords.includes('protectionartifacts')) return false;
    }
    // V12.76 (G30) : « contrôlée depuis le début du tour » (Nettling Imp).
    if (effect?.requireContinuousControl) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid); const t = this._state.turnNumber;
      if (live && ((live.enteredTurn != null && live.enteredTurn >= t) || (live.controlChangedTurn != null && live.controlChangedTurn >= t))) return false;
    }
    // V12.76 (G27) : Consecrate Land — « ne peut pas être enchanté par d'autres Auras » : on ne peut pas LANCER une Aura sur ce permanent.
    if (sourceCard && sourceCard.zone !== 'battlefield' && (sourceCard.isAura || /Aura/.test(String(sourceCard.subtype || '')))) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (live && calculateCharacteristics(this._state, live).keywords.includes('cantbeenchantedbyotherauras')) return false;
    }
    // V12.76 : linceul (shroud) — un permanent qui l'a ne peut être ciblé ni par un sort ni par une capacité (Svyelunite Priest).
    {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (live && calculateCharacteristics(this._state, live).keywords.includes('shroud')) return false;
    }
    // V12.76 : créature enchantée (Ramses Overdark) = une Aura lui est attachée.
    if (effect.requireEnchanted) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (!live || ![...this._state.player.battlefield, ...this._state.ai.battlefield].some((a) => a.isAura && a.attachedTo === live.uid)) return false;
    }
    // V12.76 : Aura attachée à une créature que vous contrôlez (Miracle Worker).
    if (effect.requireAttachedToControlled) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      const host = live && this._state[controller].battlefield.find((h) => h.uid === live.attachedTo);
      if (!live || !live.isAura || !host || !/Creature/.test(String(effectiveTypes(this._state, host).type || ''))) return false;
    }
    if (effect.requireTapped && !(candidate.perm || targetInfo.perm || this.findPermanent?.(uid))?.tapped) return false;
    // V12.75 : `requireKeyword` (Grapeshot Catapult : « la créature AVEC LE VOL ciblée ») : mot-clé effectif de la cible.
    if (effect.requireKeyword) {
      const live = candidate.perm || targetInfo.perm || this.findPermanent?.(uid);
      if (!live || !calculateCharacteristics(this._state, live).keywords.includes(effect.requireKeyword)) return false;
    }
    // Preserve the historical candidate semantics when an effect has no
    // target restriction at all. The new matcher is only authoritative when
    // effect.target is explicitly declared.
    if (!restriction) return true;
    return matchesTargetRestriction(this._state, candidate.perm || targetInfo.perm, restriction, this.combat?.combat, controller);
  }

  #normalizeTarget(targetInfo, controller) {
    if (!targetInfo) return null;
    // v12.74 : les cartes de bibliothèque / cimetière énumérées portent `_kind` ; la légalité lit `kind`.
    // Sans cette normalisation, Demonic Tutor était injouable par le chemin de l'UI.
    if (!targetInfo.kind && (targetInfo._kind === 'libraryCard' || targetInfo._kind === 'graveyardCard')) return { ...targetInfo, kind: targetInfo._kind };
    if (targetInfo.kind === 'permanent') return targetInfo;
    if (targetInfo.kind === 'player') {
      if (!['player','ai'].includes(targetInfo.side)) throw new Error(`Cible joueur invalide: ${targetInfo.side}`);
      return targetInfo;
    }
    const uid = targetInfo.uid || targetInfo.id || targetInfo;
    const perms = [...this._state.player.battlefield, ...this._state.ai.battlefield];
    const stackItem = this.stack.items.find(x => x.id === uid);
    if (stackItem) return {kind:'stackItem', item:stackItem, id:stackItem.id, name:stackItem.source?.name};
    const p = perms.find(x => x.uid === uid);
    if (p) return {kind:'permanent',perm:p,uid:p.uid,name:p.name};
    if (uid === 'player' || uid === 'ai') return {kind:'player',side:uid,id:uid};
    if (targetInfo.type === 'self') return {kind:'player',side:controller,id:controller};
    if (targetInfo.type === 'opponent') { const side=controller==='player'?'ai':'player'; return {kind:'player',side,id:side}; }
    return targetInfo;
  }

  validateState() {
    const state = this._state;
    if (!['player','ai'].includes(state.activePlayer)) throw new Error('activePlayer invalide.');
    if (!['player','ai'].includes(state.priorityHolder)) throw new Error('priorityHolder invalide.');
    for (const side of ['player','ai']) {
      const s=state[side];
      if (!s || !Array.isArray(s.hand) || !Array.isArray(s.battlefield) || !Array.isArray(s.graveyard) || !Array.isArray(s.library) || !s.mana) throw new Error(`Etat ${side} incomplet.`);
      for (const c of ['W','U','B','R','G','C']) if (!Number.isFinite(Number(s.mana[c]))) throw new Error(`Mana ${side}.${c} invalide.`);
      const seen=new Set();
      for (const p of s.battlefield) { if (!p.uid) throw new Error('Permanent sans uid.'); if(seen.has(p.uid)) throw new Error(`UID permanent dupliqué: ${p.uid}`); seen.add(p.uid); }
    }
    return true;
  }

  // ─────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────

  /** @param {Card} card @param {string} controller */
  #playLand(card, controller) {
    const side = this._state[controller];
    if (this.turnManager.activePlayer !== controller) throw new Error('Ce n’est pas votre tour.');
    if (!['main1', 'main2'].includes(this.turnManager.phase)) throw new Error('Un terrain ne peut être joué qu’en phase principale.');
    // V12.76 : Worms of the Earth (aucun terrain) et Fastbond (autant de terrains que l'on veut).
    const allPerms = [...this._state.player.battlefield, ...this._state.ai.battlefield];
    const hasStatic = (type, pred = () => true) => allPerms.some(p => [].concat(p.static || []).some(e => e && e.type === type && pred(p, e)));
    if (hasStatic('cantPlayLands')) throw new Error('Les joueurs ne peuvent pas jouer de terrains.');
    const fastbond = allPerms.find(p => p.controller === controller && [].concat(p.static || []).some(e => e && e.type === 'extraLandDrops'));
    if (!fastbond && side.landsPlayedThisTurn >= 1) throw new Error('Un seul terrain peut être joué par tour.');
    if (this._state.priorityHolder !== controller) throw new Error('Ce joueur n’a pas la priorité.');
    const index = side.hand.indexOf(card);
    if (index < 0) throw new Error('Le terrain n’est pas dans la main.');
    // v12.73 : sortie de main par le chemin canonique (ZoneManager.remove).
    this.#leaveHand(card, side, index);
    const perm = createPermanent(card);
    perm.owner = card.owner || controller;
    perm.controller = controller;
    perm.uid = rngClock.uuid('land');
    perm.playedThisTurn = true;
    perm.enteredTurn = this.turnManager.turnNumber;
    perm.summoningSickness = false;
    if (this.zoneManager) {
      this.zoneManager.enterBattlefield(perm, controller, { controller, reason: 'playLand' });
    } else {
      side.battlefield.push(perm);
    }
    side.landsPlayedThisTurn = (side.landsPlayedThisTurn || 0) + 1;
    gameEvents.emit({ type: 'landPlayed', card: perm, controller });
    // Fastbond : 1 blessure au joueur pour chaque terrain joué au-delà du premier ce tour-ci.
    if (fastbond && side.landsPlayedThisTurn > 1) this.replacementService?.applyDamageToPlayer?.(controller, 1, { color: null, source: fastbond, meta: {} });
  }

  /** @returns {GameState} */
  #createInitialState() {
    return {
      player: {
        life: 20,
        library: [],
        hand: [],
        graveyard: [],
        exile: [],
        battlefield: [],
        mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        mustDraw: false,
        extraTurns: 0,
        landsPlayedThisTurn: 0,
        hasLost: false,
        hasDrawnThisTurn: false,
      },
      ai: {
        life: 20,
        library: [],
        hand: [],
        graveyard: [],
        exile: [],
        battlefield: [],
        mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        mustDraw: false,
        extraTurns: 0,
        landsPlayedThisTurn: 0,
        hasLost: false,
        hasDrawnThisTurn: false,
      },
      fogActive: false,
      turnNumber: 1,
      activePlayer: 'player',
      phase: 'untap',
      priorityHolder: 'player',
    };
  }
}
