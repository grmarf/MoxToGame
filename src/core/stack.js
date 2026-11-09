// @ts-check
/**
 * @fileoverview MTG Beta V8.12 — Native Stack Controller
 * Full LIFO stack with EffectRegistry resolution, priority gates,
 * and canonical event emission. Replaces legacy stack delegation.
 */

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').StackItem} StackItem */
/** @typedef {import('./types.js').EffectData} EffectData */
/** @typedef {import('./types.js').Card} Card */
/** @typedef {import('./types.js').Permanent} Permanent */
/** @typedef {import('./effect-registry.js').EffectRegistry} EffectRegistry */

import { matchesTargetRestriction } from './native-engine.js';
const RECHECK_TARGETS = new Set(['oneOneCreature', 'legendaryCreature', 'attackingCreature']);
import { gameEvents } from './event-bus.js';
import { tapPermanent } from './permanent-tap.js';
import { rngClock } from './rng-clock-service.js';
import { createPermanent } from './card-runtime.js';
import { applyCopyValues, snapshotCopy } from './layers/copy-effects.js';
import { effectivePowerToughness, effectiveKeywords as canonicalEffectiveKeywords, effectiveTypes as canonicalEffectiveTypes } from './continuous-effects.js';

/**
 * Unique ID generator for stack items.
 * @returns {string}
 */
function uid() {
  return rngClock.uuid('stk');
}

/**
 * Native stack controller with EffectRegistry resolution.
 */
export class StackController {
  /**
   * @param {Object} deps
   * @param {() => GameState} deps.state
   * @param {EffectRegistry} deps.effects
   * @param {Function} [deps.pushLegacy] — optional fallback
   * @param {Function} [deps.resolveLegacy] — optional fallback
   */
  /**
   * V12.76 (G28) : effets différés génériques (`state.delayedEffects`) — « à la fin du combat, détruisez… » (Venom, Infinite Authority) puis
   * « au début de la prochaine étape finale, mettez un marqueur… ». Appelé par le TurnManager (`delayedRunner`).
   */
  runDelayed(at) {
    const state = this.getState?.() || this._state; const list = state?.delayedEffects; if (!list?.length) return;
    const api = this.#buildApi(state); const keep = [];
    for (const d of list) {
      if (d.at !== at) { keep.push(d); continue; }
      const target = api.findPermanent(d.targetUid);
      if (d.kind === 'destroy') {
        if (target) { api.destroyPermanent(target, {}); if (!api.findPermanent(d.targetUid) && d.thenCounterOn) keep.push({ at: 'nextEndStep', kind: 'addCounter', targetUid: d.thenCounterOn, counter: '+1/+1', sourceName: d.sourceName }); }
      } else if (d.kind === 'addCounter') { if (target) (target.counters = target.counters || []).push({ type: d.counter }); }
      else if (d.kind === 'sacrificeSelf') { if (target) api.zones.moveToGraveyard(target, { toSide: target.owner || api.findPermSide(target), reason: 'sacrifice' }); } // Dragon Whelp (sacrifice : l'indestructible n'empêche rien)
      else if (d.kind === 'destroyIfNotAttacked') { if (target && target.attackedTurn !== d.turnNumber) api.destroyPermanent(target, {}); } // Nettling Imp
      else if (d.kind === 'destroyIfAttacked') { if (target && target.attackedTurn === d.turnNumber) api.destroyPermanent(target, {}); } // Berserk
      else if (d.kind === 'destroyNonWallsNotAttacked') { // Siren's Call : les créatures non-Mur (contrôlées depuis le début du tour) qui n'ont pas attaqué
        for (const uid of d.uids || []) { const c = api.findPermanent(uid); if (c && api.findPermSide(c) === d.side && c.attackedTurn !== d.turnNumber) api.destroyPermanent(c, {}); }
      }
    }
    state.delayedEffects = keep; api.checkStateBasedDeaths?.();
  }

  constructor({ state, effects, pushLegacy, resolveLegacy, zones = null, replacements = null, choiceService = null, subgames = null, combat = null, sba = null }) {
    this.getState = state;
    this.effects = effects;
    this.pushLegacy = pushLegacy;
    this.resolveLegacy = resolveLegacy;
    this.zones = zones;
    this.replacements = replacements;
    this.choiceService = choiceService;
    this.subgames = subgames;
    this.combat = combat;
    // V12.57 (fix BUG-03) : instance StateBasedActions injectée pour que
    // checkStateBasedDeaths() dans buildApi() puisse réellement exécuter
    // les SBA au lieu d'être un no-op.
    this.sba = sba;
    /** @type {StackItem[]} */
    this._items = [];
    /** @type {Set<string>} */
    this._resolved = new Set();
    /** @type {Map<string, { item: StackItem, continuation: Function }>} */
    this._suspendedChoices = new Map();
  }

  /** @returns {StackItem[]} */
  get items() { return [...this._items]; }

  /** @returns {number} */
  get size() { return this._items.length; }

  /** @returns {StackItem|null} */
  get top() { return this._items[this._items.length - 1] ?? null; }

  /** @returns {boolean} */
  get isEmpty() { return this._items.length === 0; }

  // ─────────────────────────────────────────────
  // Push Operations
  // ─────────────────────────────────────────────

  /**
   * Push a spell onto the stack.
   * @param {Card} card
   * @param {string} controller — 'player' | 'ai'
   * @param {Object} [targetInfo]
   * @param {number} [xValue]
   * @returns {StackItem}
   */
  pushSpell(card, controller, targetInfo = null, xValue = 0) {
    // v12.74 : un sort sur la pile n'est plus dans la main ; sa zone le dit (il restait marqué 'hand').
    if (card && typeof card === 'object') card.zone = 'stack';
    const item = {
      id: uid(),
      type: 'spell',
      source: card,
      effect: card.effect || null,
      effects: Array.isArray(card.effects) ? card.effects : (card.effect ? [card.effect] : []),
      controller,
      target: targetInfo,
      xValue,
      timestamp: rngClock.now(),
    };
    this._items.push(item);
    gameEvents.emit({ type: 'stackPushed', item, stackSize: this.size });
    return item;
  }

  /**
   * Push a triggered ability onto the stack.
   * @param {Object} trigger — from TriggerCollector
   * @param {string} controller
   * @returns {StackItem}
   */
  pushTrigger(trigger, controller) {
    const item = {
      id: uid(),
      type: 'trigger',
      source: trigger.source,
      effect: trigger.effect,
      effects: Array.isArray(trigger.effects) ? trigger.effects : (trigger.effect ? [trigger.effect] : []),
      controller,
      target: null,
      xValue: 0,
      timestamp: rngClock.now(),
      triggerDescriptor: trigger,
    };
    this._items.push(item);
    gameEvents.emit({ type: 'stackPushed', item, stackSize: this.size });
    return item;
  }

  /**
   * Push an activated ability onto the stack.
   * @param {Permanent} permanent
   * @param {EffectData} effect
   * @param {string} controller
   * @param {Object} [targetInfo]
   * @returns {StackItem}
   */
  pushAbility(permanent, effect, controller, targetInfo = null) {
    const item = {
      id: uid(),
      type: 'ability',
      source: permanent,
      effect,
      effects: Array.isArray(effect) ? effect : (effect ? [effect] : []),
      controller,
      target: targetInfo,
      xValue: 0,
      timestamp: rngClock.now(),
    };
    this._items.push(item);
    gameEvents.emit({ type: 'stackPushed', item, stackSize: this.size });
    return item;
  }

  /**
   * Legacy-compatible push wrapper.
   * @param {Card} card
   * @param {string} controller
   * @param {Object} [targetInfo]
   * @param {number} [xValue]
   * @returns {StackItem|null}
   */
  push(card, controller, targetInfo = null, xValue = 0) {
    if (card.effect && this.effects.has(card.effect.type)) {
      return this.pushSpell(card, controller, targetInfo, xValue);
    }
    // Fallback to legacy for un-migrated effects
    if (this.pushLegacy) {
      this.pushLegacy(card, controller, targetInfo, xValue);
    }
    return null;
  }

  // ─────────────────────────────────────────────
  // Resolution
  // ─────────────────────────────────────────────

  pushCopy(item, controller, target=null) {
    const deepClone = (obj) => { if (obj === null || typeof obj !== 'object') return obj; if (obj instanceof Date) return new Date(obj); if (Array.isArray(obj)) return obj.map(deepClone); const c={}; for (const k of Object.keys(obj)) c[k]=deepClone(obj[k]); return c; };
    const copy = { ...item, id: uid(), type:'copy', controller, target, timestamp:rngClock.now(), copiedFrom:item.id, source:deepClone(item.source || {}), effects:deepClone(item.effects || []), effect:deepClone(item.effect || null) };
    this._items.push(copy);
    gameEvents.emit({ type:'stackPushed', item:copy, stackSize:this.size, copy:true });
    return copy;
  }

  pushSpellCopy(item, controller, target=null) { return this.pushCopy(item, controller, target); }

  /**
   * Resolve the top item of the stack using EffectRegistry.
   * @returns {StackItem|null}
   */
  #targetStillLegal(effect, item) {
    const state = this.getState(); const info = item.target;
    if (info.kind && info.kind !== 'permanent') return true;
    const uid = info.uid ?? info.id ?? info.perm?.uid;
    const perm = [...state.player.battlefield, ...state.ai.battlefield].find((p) => p.uid === uid);
    return !!perm && matchesTargetRestriction(state, perm, effect.target, this.combat?.combat ?? null, item.controller);
  }

  resolveTop() {
    const item = this._items.pop();
    if (!item) {
      gameEvents.emit({ type: 'stackEmptied' });
      return null;
    }

    if (this._resolved.has(item.id)) {
      gameEvents.emit({ type: 'stackResolved', item, duplicate: true });
      return item;
    }

    // Try native resolution first
    this._activeResolutionItem = item;
    if (item.effect && this.effects.has(item.effect.type)) {
      const state = this.getState();
      const ctx = {
        state,
        controllerKey: item.controller,
        sourceCard: item.source,
        api: this.#buildApi(state),
        targetInfo: item.target,
        xValue: item.xValue,
        // v12.73 : l'événement déclencheur (ex. upkeepStarted -> joueur dont c'est l'entretien).
        triggerEvent: item.triggerDescriptor?.triggerEvent || null,
      };
      try {
        for (const effect of (item.effects?.length ? item.effects : [item.effect])) {
          if (!effect?.type) continue;
          if (!this.effects.has(effect.type)) {
            gameEvents.emit({ type: 'unknownEffect', effect, item });
            continue;
          }
          // V12.76 (G10) : une cible dont la condition peut changer en réponse (« 1/1 », « légendaire », « attaquante ») est
          // revalidée à la RÉSOLUTION : devenue illégale, l'effet ne fait rien (règle 608.2b).
          if (RECHECK_TARGETS.has(effect.target) && item.target && !this.#targetStillLegal(effect, item)) {
            gameEvents.emit({ type: 'targetIllegalOnResolution', item, effect });
            ctx.api.log?.(`${item.source?.name} : la cible n'est plus légale, l'effet est annulé.`, item.controller);
            continue;
          }
          this.effects.resolve(effect.type, ctx, effect);
          // A choice may suspend this stack item. The continuation is registered
          // through the API and ChoiceService; do not finalize while pending.
          const pending = this.choiceService?.getPending?.();
          if (pending?.id && pending._continuation) {
            this._suspendedChoices.set(pending.id, { item, continuation: pending._continuation });
            this._items.push(item);
            gameEvents.emit({ type: 'stackResolutionPaused', item, choiceId: pending.id });
            return item;
          }
        }
        this._finalizeSpell(item);
        this._resolved.add(item.id);
        gameEvents.emit({ type: 'stackResolved', item, native: true });
      } catch (err) {
        gameEvents.emit({ type: 'stackResolutionFailed', item, error: err.message });
        // Re-push on failure so it can be retried or handled
        this._items.push(item);
        throw err;
      }
      this._activeResolutionItem = null;
      return item;
    }

    // Fallback to legacy resolution
    if (this.resolveLegacy) {
      this.resolveLegacy();
      gameEvents.emit({ type: 'stackResolved', item, native: false });
      this._activeResolutionItem = null;
      return item;
    }

    if (item.type === 'spell') this._finalizeSpell(item);
    gameEvents.emit({ type: 'stackResolved', item, native: false, noEffect: true });
    return item;
  }

  /**
   * Resolve all items in the stack (LIFO order).
   * @returns {StackItem[]}
   */
  resolveAll() {
    const resolved = [];
    while (!this.isEmpty) {
      resolved.push(this.resolveTop());
    }
    return resolved;
  }

  /** Resume a suspended stack resolution after a player choice. */
  #resumeChoice(item, value, continuation) {
    const pendingId = [...this._suspendedChoices.entries()].find(([, entry]) => entry.item === item)?.[0] || null;
    const state = this.getState();
    const ctx = {
      state,
      controllerKey: item.controller,
      sourceCard: item.source,
      api: this.#buildApi(state),
      targetInfo: item.target,
      xValue: item.xValue,
      triggerEvent: item.triggerDescriptor?.triggerEvent || null,
    };
    this._activeResolutionItem = item;
    try {
      const result = continuation(value, ctx);
      if (pendingId) this._suspendedChoices.delete(pendingId);
      // La continuation peut elle-même demander un nouveau choix (suspension
      // imbriquée, ex. Mind Bomb : un choix par joueur, résolus l'un après
      // l'autre). Si c'est le cas, l'item ne doit pas être finalisé
      // maintenant : il reste suspendu, en attente de ce nouveau choix.
      const nestedPending = this.choiceService?.getPending?.();
      if (nestedPending?.id && nestedPending._continuation) {
        this._suspendedChoices.set(nestedPending.id, { item, continuation: nestedPending._continuation });
        gameEvents.emit({ type: 'stackResolutionPaused', item, choiceId: nestedPending.id, nested: true });
        return item;
      }
      this._finalizeSpell(item);
      this._resolved.add(item.id);
      const idx = this._items.findIndex(x => x.id === item.id);
      if (idx >= 0) this._items.splice(idx, 1);
      gameEvents.emit({ type: 'stackResolved', item, native: true, resumed: true, choiceId: pendingId });
      return result;
    } catch (err) {
      gameEvents.emit({ type: 'stackResolutionFailed', item, error: err.message, resumed: true });
      throw err;
    } finally {
      this._activeResolutionItem = null;
    }
  }

  // ─────────────────────────────────────────────
  // Priority & Response
  // ─────────────────────────────────────────────

  /**
   * Check if a player can respond to the current top item.
   * @param {string} side — 'player' | 'ai'
   * @returns {boolean}
   */
  canRespond(side) {
    if (this.isEmpty) return false;
    const top = this.top;
    // A player cannot respond to their own spell/ability immediately
    // (simplified: both get priority before resolution)
    return top.controller !== side || this.size > 1;
  }

  /**
   * Pass priority for a side.
   * @param {string} side
   */
  pass(side) {
    gameEvents.emit({ type: 'priorityPassed', side, stackSize: this.size, topItem: this.top });
    if (this.pushLegacy) {
      this.pushLegacy(side);
    }
  }

  // ─────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────

  /** Remove all items from the stack. */
  clear() {
    const count = this._items.length;
    this._items.length = 0;
    gameEvents.emit({ type: 'stackCleared', count });
  }

  /** @returns {StackItem[]} */
  toArray() { return [...this._items]; }

  /** Move a resolved spell to its correct zone, or put a permanent spell onto the battlefield. */
  _finalizeSpell(item) {
    if (item.type !== 'spell') return;
    const state = this.getState();
    const side = state[item.controller];
    const card = item.source;
    const isPermanent = /Creature|Artifact|Enchantment|Planeswalker/.test(String(card?.type || ''));
    const isAuraCard = /\bAura\b/i.test(String(card?.type || '')) || /\bAura\b/i.test(String(card?.subtype || ''));

    // Bug 9 : Aura sans cible valide doit fizzle
    if (isPermanent && isAuraCard) {
        const ref = item.target?.perm || item.target?.object || item.target;
        const target = this.#buildApi(state).findPermanent(ref);
        if (!target) {
            if (this.zones) {
                // v12.72 : le sort vient de la pile (hors zones suivies) -> place() (identité + zoneChanged).
                this.zones.place(card, 'graveyard', { toSide: card.owner || item.controller, reason: 'fizzleNoTarget' });
            } else {
                side.graveyard.push({ ...card, zone: 'graveyard', objectId: card.objectId || rngClock.uuid('obj') });
            }
            gameEvents.emit({ type: 'spellFizzled', item, reason: 'auraNoTarget' });
            return;
        }
    }

    if (isPermanent) {
      let resolvedCard = card;
      if (card?.effect?.type === 'copyPermanent') {
        const ref = item.target?.perm || item.target?.object || item.target;
        const id = ref?.uid || ref?.objectId || ref?.id || ref;
        const copied = [...state.player.battlefield, ...state.ai.battlefield].find(p => p.uid === id || p.objectId === id);
        if (copied) {
          resolvedCard = { ...JSON.parse(JSON.stringify(copied)), owner: card.owner || item.controller, controller: item.controller, zone:'battlefield', copiedFrom:copied.uid };
          delete resolvedCard.uid; delete resolvedCard.objectId; delete resolvedCard.zoneChangeId;
          delete resolvedCard.enteredTurn; delete resolvedCard.damageMarked;
        }
      }
      const permanent = createPermanent(resolvedCard);
      permanent.controller = item.controller;
      permanent.owner = card.owner || item.controller;
      permanent.enteredTurn = state.turnNumber || 1;
      const entered = this.zones ? this.zones.enterBattlefield(permanent, item.controller, { controller: item.controller, reason: 'spellResolved' }) : (side.battlefield.push(permanent), permanent);
      if (isAuraCard) {
        entered.isAura = true;
        entered.auraEffect = card.effect || null;
        const ref = item.target?.perm || item.target?.object || item.target;
        const target = this.#buildApi(state).findPermanent(ref);
        if (target) entered.attachedTo = target.uid;
        if (entered._controlGrantTargetUid) {
          const granted = this.#buildApi(state).findPermanent(entered._controlGrantTargetUid);
          if (granted) {
            entered.controlledPermanentUid = granted.uid;
            granted.controlGrantedByAuraUid = entered.uid;
            granted.controlGrantOriginalController = entered._controlGrantOriginalController || granted._controlGrantOriginalController || granted.owner;
            delete granted._controlGrantedByAuraPending;
          }
          delete entered._controlGrantTargetUid;
          delete entered._controlGrantOriginalController;
        }
      }
      // V12.75 : `permanentEntered` était émis DEUX fois pour un sort permanent (une fois par le gestionnaire de zones, une fois ici) :
      // tout déclencheur d'entrée en jeu (Tetravus : trois jetons) se produisait en double.
      if (entered?._enterEmitted) delete entered._enterEmitted;
      else gameEvents.emit({ type: 'permanentEntered', permanent: entered, side: item.controller, controller: item.controller, source: card });
    } else {
      // Bug 8 : fallback si zones.find échoue
      if (this.zones) {
        // v12.72 : idem — chemin unique pile -> cimetière (plus de repli direct).
        this.zones.place(card, 'graveyard', { toSide: card.owner || item.controller, reason: 'spellResolved' });
      } else {
        side.graveyard.push({ ...card, zone: 'graveyard', objectId: card.objectId || rngClock.uuid('obj') });
      }
    }
  }

  // ─────────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────────

  /** @param {GameState} state */
  /** @param {GameState} state */
  #buildApi(state) {
    const stack = this;
    return {
      state,
      opponentKey: (k) => k === 'player' ? 'ai' : 'player',
      allPermanents: () => [...state.player.battlefield, ...state.ai.battlefield],
      combat: stack.combat && stack.combat.combat ? {
        phase: stack.combat.combat.phase,
        attackers: stack.combat.combat.attackers.map(a => a.uid),
        blockers: Object.fromEntries(
          Object.entries(stack.combat.combat.blockers || {}).map(([k, v]) => [k, v.map(b => b.uid)])
        ),
        attackingSide: stack.combat.combat.attackingSide,
        defendingSide: stack.combat.combat.defendingSide,
      } : null,
      zones: stack.zones,
      replacements: stack.replacements,
      moveToZone: (obj, zone, opts={}) => stack.zones ? stack.zones.move(obj, zone, opts) : null,
      preventDamage: (side, amount, color=null, source=null, meta={}) => stack.replacements?.preventDamage(side, amount, color, source, meta) || { prevented:0, remaining:amount },
      replaceDamageLifeLoss: (side, amount, meta={}) => stack.replacements?.replaceDamageLifeLoss(side, amount, meta) || { replaced:false, loss:amount },
      applyDamageToPlayer: (side, amount, opts={}) => {
        // V12.76 (G28) : événement « une source inflige des blessures NON de combat à un joueur » (Backfire).
        const res = (() => {
        if (stack.replacements?.applyDamageToPlayer) return stack.replacements.applyDamageToPlayer(side, amount, opts);
        // v12.72 : sans ReplacementService (harnais minimal), l'ancien repli renvoyait un résultat
        // fictif SANS retirer de vie : les appelants qui croyaient « le service a fait le travail »
        // ne perdaient rien. Le repli applique réellement la perte de vie.
        const n = Math.max(0, Number(amount || 0));
        if (state[side] && n > 0) state[side].life -= n;
        return { amount:n, prevented:0, loss:n };
        })();
        if (res && opts.source?.uid && !opts.meta?.combat && Number(res.amount) > 0) gameEvents.emit({ type:'damageDealtToPlayer', source: opts.source, target: side, amount: Number(res.amount), damageKind: 'effect' });
        return res;
      },
      applyDamageToPermanent: (target, amount, opts={}) => {
        if (stack.replacements?.applyDamageToPermanent) return stack.replacements.applyDamageToPermanent(target, amount, opts);
        // v12.72 : même défaut que applyDamageToPlayer — le repli ne marquait aucun dégât.
        const n = Math.max(0, Number(amount || 0));
        if (target && n > 0) target.damageMarked = (target.damageMarked || 0) + n;
        return { amount:n, prevented:0 };
      },
      startSubgame: (controller='player', source=null) => stack.subgames?.start({controller, source}),
      addPreventionShield: (side, shield) => stack.replacements?.addPreventionShield(side, shield),
      drawCard: (side) => { const s=state[side]; if(!s.library.length){ s.mustDraw=true; return null; } const c=s.library[s.library.length-1]; if(stack.zones) return stack.zones.move(c,'hand',{toSide:side,reason:'draw'}); s.library.pop(); s.hand.push(c); return c; },
      discardCard: (side, index=0) => { const s=state[side]; if(!s.hand.length) return null; const safeIndex=Math.max(0,Math.min(index,s.hand.length-1)); const c=s.hand[safeIndex]; gameEvents.emit({type:'cardDiscarded',state,side,card:c,reason:'discard'}); if(stack.zones) return stack.zones.move(c,'graveyard',{toSide:c.owner||side,reason:'discard'}); s.hand.splice(safeIndex,1); s.graveyard.push(c); return c; },

      // ── Pile ──
      stackItems: () => [...stack._items],
      findStackItem: (itemId) => stack._items.find(it => it.id === itemId),
      findPermanent: (ref) => { const id = ref?.uid || ref?.objectId || ref?.id || ref; return [...state.player.battlefield, ...state.ai.battlefield].find(p => p.uid === id || p.objectId === id) || null; },
      attachAura: (auraRef, targetRef) => { const aura = stack.#buildApi(state).findPermanent(auraRef); const target = stack.#buildApi(state).findPermanent(targetRef); if (!aura || !target || !/\bAura\b/i.test(String(aura.type||''))) return null; aura.isAura=true; aura.attachedTo=target.uid; aura.auraEffect=aura.auraEffect||aura.effect||null; gameEvents.emit({type:'auraAttached',aura,target}); return aura; },
      detachAura: (auraRef) => { const aura = stack.#buildApi(state).findPermanent(auraRef); if (!aura) return null; const old=aura.attachedTo; aura.attachedTo=null; gameEvents.emit({type:'auraDetached',aura,oldTarget:old}); return aura; },
      pushSpellCopy: (item, controller, target=null) => stack.pushCopy(item, controller, target),
      choose: (spec, continuation = null) => {
        if (!this.choiceService) return spec.defaultValue ?? null;
        // BUG P (v12.71) : pendant la résolution d'un élément, celui-ci est déjà
        // sorti de la pile ; le « haut de pile » est alors un AUTRE élément
        // (le sort ciblé par un contresort, par ex.). Rattacher la reprise à ce
        // dernier finalisait/retirait le mauvais objet. On privilégie donc
        // l'élément en cours de résolution tant qu'il n'a pas été remis sur la
        // pile (suspension), et on retombe sur le haut de pile sinon.
        const active = stack._activeResolutionItem;
        const item = (active && !stack._items.includes(active))
          ? active
          : (stack._items[stack._items.length - 1] || active || null);
        const wrapped = typeof continuation === 'function' && item ? (value) => stack.#resumeChoice(item, value, continuation) : continuation;
        return this.choiceService.request(spec, wrapped);
      },
      chooseNewTargets: (item, controller) => item.target,
      resolveInlineEffect: (effect, extra={}) => { if (!effect?.type || !stack.effects.has(effect.type)) return null; return stack.effects.resolve(effect.type, { state, controllerKey:extra.controllerKey || 'player', sourceCard:extra.sourceCard || null, api:stack.#buildApi(state), targetInfo:extra.targetInfo || null, xValue:extra.xValue || 0 }, effect); },
      createToken: (side, effect) => { const token = { ...effect, id:undefined, uid:rngClock.uuid('token'), objectId:rngClock.uuid('obj'), zone:'battlefield', owner:side, controller:side, token:true, enteredTurn:state.turnNumber||1, damageMarked:0, tapped:false, summoningSickness:!!effect.isCreature && !effect.keywords?.includes('haste'), counters:[] }; delete token.amount; delete token.controller; token.controller=side; const entered = stack.zones ? stack.zones.enterBattlefield(token, side, { controller:side, reason:'tokenCreated' }) : (state[side].battlefield.push(token), token); if (stack.zones) return entered; gameEvents.emit({type:'permanentEntered',permanent:token,side,controller:side,source:token}); return token; },
      removeStackItem: (itemId) => {
        const idx = stack._items.findIndex(it => it.id === itemId);
        if (idx >= 0) {
          const [removed] = stack._items.splice(idx, 1);
          return removed;
        }
        return null;
      },

      // ── Mana ──
      totalMana: (pool) => Object.values(pool).reduce((a, b) => a + b, 0),
      payGenericFromPool: (side, amount) => {
        let remaining = amount;
        for (const c of ['C', 'W', 'U', 'B', 'R', 'G']) {
          while (remaining > 0 && side.mana[c] > 0) { side.mana[c]--; remaining--; }
        }
        return remaining === 0;
      },

      // ── Mots-clés & protection ──
      // BUG B/C (audit v12.66) : ces deux fonctions étaient des doublons
      // "appauvris" qui ne lisaient que perm.keywords/tempKeywords/auraBuffs,
      // ignorant marqueurs +1/+1, effets statiques et couches 1-7 -- alors
      // que combat.js utilise déjà le pipeline canonique et state-aware
      // (calculateCharacteristics via effectivePowerToughness/effectiveKeywords
      // de continuous-effects.js). On délègue désormais au même pipeline pour
      // que ctx.api expose la même vérité que le moteur de combat.
      effectiveKeywords: (perm) => canonicalEffectiveKeywords(state, perm),
      effectivePT: (perm) => effectivePowerToughness(state, perm),

      // ── Destruction & utilitaires ──
      log: (msg, side) => gameEvents.emit({ type: 'log', msg, side }),
      // V12.57 (fix BUG-03) : appelait auparavant un no-op ; branche
      // désormais réellement l'instance StateBasedActions injectée dans
      // le constructeur (this.sba), si elle est présente.
      checkStateBasedDeaths: () => { if (stack.sba) stack.sba.check(state); },
      destroyPermanent: (p, opts = {}) => {
        const side = state.player.battlefield.includes(p) ? 'player' : state.ai.battlefield.includes(p) ? 'ai' : null;
        if (side) {
          // V12.76 (G27) : indestructible (Consecrate Land) — la destruction (et la régénération) ne s'applique pas.
          try { if (!opts.ignoreIndestructible && canonicalEffectiveKeywords(state, p).includes('indestructible')) return; } catch { /* repli : destructible */ }
          // V12.19 (fix) : destroyPermanent() est le point d'entrée commun à tous
          // les effets de destruction directe (Terror, Wrath of God, etc. via le
          // handler 'destroy' d'atomic-effects.js, gagnant du registre). Il
          // ignorait totalement regenShield, contrairement au chemin des dégâts
          // létaux dans state-based-actions.js -- confirmé par test réel
          // (Will-o'-the-Wisp survivait au SBA mais mourait quand même à Terror).
          // Comportement aligné sur celui de l'ASB : consomme le bouclier,
          // engage la créature, retire les dégâts marqués, empêche la mort.
          if (p.regenShield && !opts.noRegen) {
            p.regenShield = false;
            p.damageMarked = 0;
            tapPermanent(state, p, { reason: 'regeneration', side });
            gameEvents.emit({ type: 'regenerationUsed', permanent: p, side, reason: 'destroy' });
            return;
          }
          // V12.75 : une créature DÉTRUITE (Terror, Fissure, Wrath...) n'émettait jamais `creatureDied` : seul le
          // chemin des dégâts létaux (actions d'état) le faisait. Creature Bond, Soul Net, Karma et tous les
          // déclencheurs « quand une créature meurt » ne réagissaient donc qu'aux blessures. On lit le type
          // EFFECTIF avant le déplacement (un artefact animé est une créature).
          let wasCreature = /\bCreature\b/i.test(String(p.type || ''));
          try { wasCreature = /\bCreature\b/i.test(String(canonicalEffectiveTypes(state, p).type || '')); } catch { /* repli sur le type imprimé */ }
          let lkToughness = null; try { lkToughness = effectivePowerToughness(state, p).toughness; } catch { lkToughness = p.toughness ?? null; } // V12.76 (G20)
          let moved = null;
          if (stack.zones) moved = stack.zones.moveToGraveyard(p, { toSide: p.owner || side, reason: 'destroy' });
          else { state[side].battlefield = state[side].battlefield.filter(x => x !== p); state[side].graveyard.push(p); }
          p.destroyed = true;
          if (wasCreature) gameEvents.emit({ type: 'creatureDied', permanent: p, graveyardUid: moved?.uid || null, side, reason: 'destroy', toughness: lkToughness });
        }
      },
      findPermSide: (p) => state.player.battlefield.includes(p) ? 'player' : state.ai.battlefield.includes(p) ? 'ai' : null,
      shuffle: (a) => rngClock.shuffle(a),
      uid: () => rngClock.uuid('p'),
      makePermFromCard: (c) => ({ ...c, auraBuffs: [], tempBuffs: [] }),
    };
  }

}
