// V9.7.2 — C5: continuous effects engine.
// Characteristic-changing effects are evaluated from the current game state,
// in deterministic MTG-style layers, without mutating the printed definition.

import { normalizeKeyword } from './keywords.js';

export const ContinuousLayer = Object.freeze({ TYPE: 4, COLOR: 5, ABILITY: 6, PT: 7 });
export const PTSublayer = Object.freeze({ BASE: '7a', SET: '7b', MODIFY: '7c', SWITCH: '7d' });

function sideOf(state, permanent) {
  if (state?.player?.battlefield?.some(p => p.uid === permanent?.uid)) return 'player';
  if (state?.ai?.battlefield?.some(p => p.uid === permanent?.uid)) return 'ai';
  return permanent?.controller || null;
}

function tokens(value) { return String(value || '').toLowerCase().split(/\s+|—|,|\/|-/).filter(Boolean); }
function hasType(chars, wanted) {
  if (!wanted) return true;
  return tokens(chars.type).includes(String(wanted).toLowerCase()) || String(chars.type).toLowerCase().includes(String(wanted).toLowerCase());
}
function hasColor(chars, wanted) {
  return (chars.color || []).map(String).map(x => x.toUpperCase()).includes(String(wanted).toUpperCase());
}
function hasSubtype(chars, wanted) {
  if (!wanted) return true;
  const sub = tokens(chars.subtype);
  return sub.includes(String(wanted).toLowerCase()) || String(chars.subtype || '').toLowerCase().includes(String(wanted).toLowerCase());
}
function hasAnyKeyword(chars, wanted) {
  const wantedList = Array.isArray(wanted) ? wanted : [wanted];
  return wantedList.some(k => chars.keywords.includes(normalizeKeyword(k)));
}
function controllerMatches(state, source, target, filter) {
  if (!filter || filter === 'any' || filter === 'all') return true;
  const a = sideOf(state, source), b = sideOf(state, target);
  if (filter === 'self' || filter === 'controller' || filter === 'you') return a === b;
  if (filter === 'opponent' || filter === 'opponents') return !!a && !!b && a !== b;
  return true;
}

function sourceEffectApplies(state, source, target, chars, effect) {
  if (!effect || !target) return false;
  if (effect.type === 'conditionalPump' && source.uid !== target.uid) return false;
  if (effect.auraSource && source.attachedTo !== target.uid) return false;
  if (effect.selfOnly && source.uid !== target.uid) return false;
  if (effect.excludeSelf && source.uid === target.uid) return false; // V12.76 (G18) : « les AUTRES » (Goblin King, Lord of Atlantis)
  if (effect.filterNotColor && hasColor(chars, effect.filterNotColor)) return false; // V12.76 (G18) : « non blanches »
  if (effect.onlyCreatures && !/Creature/i.test(chars.type)) return false;
  // V12.76 (G23) : Goblin Caves — « tant que le terrain enchanté est une Montagne DE BASE » (n'importe quel camp). On lit le type/sous-type
  // STATIQUES du terrain (pas ses caractéristiques effectives : pas de récursion, et Blood Moon ne rend pas « de base » un terrain non de base).
  // V12.76 (G26) : Spectral Cloak — « a le linceul tant qu'elle est NON ENGAGÉE » : la condition porte sur la créature qui reçoit l'effet.
  if (effect.whileHostUntapped && target?.tapped) return false;
  if (effect.enchantedIsBasic) {
    const host = [...(state?.player?.battlefield || []), ...(state?.ai?.battlefield || [])].find(p => p.uid === source.attachedTo);
    if (!host || !/\bBasic\b/i.test(String(host.type || '')) || !tokens(host.subtype).includes(String(effect.enchantedIsBasic).toLowerCase())) return false;
  }
  if (effect.nonBasic && /\bBasic\b/i.test(String(chars.type))) return false; // V12.76 : Blood Moon
  if (effect.filterColor && !hasColor(chars, effect.filterColor)) return false;
  if (effect.filterSubtype && !hasSubtype(chars, effect.filterSubtype)) return false;
  if (effect.filterType && !hasType(chars, effect.filterType)) return false;
  if (effect.filterKeyword && !hasAnyKeyword(chars, effect.filterKeyword)) return false;
  if (!controllerMatches(state, source, target, effect.controllerFilter)) return false;
  if (effect.condition === 'controlForest' || effect.condition === 'controlsForest') {
    const side = sideOf(state, source);
    if (!side || !state[side]?.battlefield?.some(p => /Land/i.test(String(p.type || '')) && /Forest/i.test(String(p.subtype || p.name || '')))) return false;
  }
  if (effect.condition === 'controlIsland' || effect.condition === 'controlsIsland') {
    const side = sideOf(state, source);
    if (!side || !state[side]?.battlefield?.some(p => /Land/i.test(String(p.type || '')) && /Island/i.test(String(p.subtype || p.name || '')))) return false;
  }
  if (effect.condition === 'controlMountain' || effect.condition === 'controlsMountain') {
    const side = sideOf(state, source);
    if (!side || !state[side]?.battlefield?.some(p => /Land/i.test(String(p.type || '')) && /Mountain/i.test(String(p.subtype || p.name || '')))) return false;
  }
  if (effect.condition === 'controlSwamp' || effect.condition === 'controlsSwamp') {
    const side = sideOf(state, source);
    if (!side || !state[side]?.battlefield?.some(p => /Land/i.test(String(p.type || '')) && /Swamp/i.test(String(p.subtype || p.name || '')))) return false;
  }
  return true;
}

function collectStaticEffects(state) {
  return [
    ...(state?.player?.battlefield || []),
    ...(state?.ai?.battlefield || []),
  ].flatMap(source => {
    const effects = [];
    if (source?.static) effects.push(...(Array.isArray(source.static) ? source.static : [source.static]));
    if (source?.isAura && source?.attachedTo && source?.auraEffect) {
      effects.push({ ...source.auraEffect, auraSource: true, attachedTo: source.attachedTo });
    }
    return effects.map(effect => ({ source, effect }));
  });
}

function initialCharacteristics(permanent, base) {
  // BUG K (audit v12.66) : permanent.chosenColor est écrit par plusieurs
  // effets (changeColor/colorChange en complex-effects.js, le choix de
  // couleur résolu en choice-effects.js -- utilisé par Purelace et tout
  // futur effet de changement de couleur) mais n'était JAMAIS lu ici :
  // calculateCharacteristics ne regardait que base.color/permanent.color,
  // donc Purelace était un no-op silencieux sur la couleur réellement
  // effective du permanent (protections/couleur-dépendantes restaient
  // basées sur l'ancienne couleur). chosenColor est un effet de calque 5
  // (couleur) écrit directement sur l'objet plutôt que collecté via
  // collectStaticEffects -- on l'injecte donc dès la base, AVANT les
  // effets statiques de la boucle ci-dessous, qui peuvent toujours le
  // surcharger ensuite (une Aura changeant la couleur après coup reste
  // prioritaire, comme l'exige l'ordre des calques).
  const chosenColor = permanent?.chosenColor ? [String(permanent.chosenColor).toUpperCase()] : null;
  return {
    type: String(base.type ?? permanent?.type ?? ''),
    subtype: String(base.subtype ?? permanent?.subtype ?? ''),
    color: [...(base.color ?? chosenColor ?? permanent?.color ?? [])],
    keywords: [...(base.keywords ?? permanent?.keywords ?? [])].map(normalizeKeyword),
    abilities: [...(base.abilities ?? permanent?.abilities ?? [])],
    power: Number(base.power ?? permanent?.power ?? 0),
    toughness: Number(base.toughness ?? permanent?.toughness ?? 0),
  };
}

/**
 * V12.1 — stable dependency ordering inside a layer.
 * Effects may optionally declare `dependsOn` / `dependsOnSource` as a source uid,
 * source name, or array of either. We use a stable topological sort and fall
 * back to timestamp/collection order when no dependency is declared.
 */
function stableEffectKey(item, index) {
  const source = item?.source || {};
  return String(index).padStart(6, '0') + '\u0000' + String(source.uid ?? source.objectId ?? source.id ?? '') + '\u0000' + String(source.name ?? '');
}

function effectDependsOn(a, b) {
  const aEffect = a?.effect;
  const bEffect = b?.effect;
  if (!aEffect || !bEffect) return false;

  // Explicit `dependsOn` means that the declaring effect must be evaluated
  // AFTER its dependency. This function answers the opposite question used
  // by the topological graph: does A have to precede B?
  const aExplicit = aEffect.dependsOn ?? aEffect.dependsOnSource;
  if (aExplicit) {
    const deps = Array.isArray(aExplicit) ? aExplicit : [aExplicit];
    if (deps.some(x => x === b?.source?.uid || x === b?.source?.objectId || x === b?.source?.id || x === b?.source?.name)) return false;
  }
  const bExplicit = bEffect.dependsOn ?? bEffect.dependsOnSource;
  if (bExplicit) {
    const deps = Array.isArray(bExplicit) ? bExplicit : [bExplicit];
    if (deps.some(x => x === a?.source?.uid || x === a?.source?.objectId || x === a?.source?.id || x === a?.source?.name)) return true;
  }

  // CR 613.8: within a layer, an effect that changes a characteristic must
  // precede an effect whose applicability depends on that characteristic.
  if (aEffect.type === 'changeType' && (bEffect.filterType || bEffect.filterSubtype || bEffect.onlyCreatures)) return true;
  if (aEffect.type === 'changeColor' && bEffect.filterColor) return true;
  if (['grantKeyword','addKeyword','removeKeyword'].includes(aEffect.type) && bEffect.filterKeyword) return true;
  if ((aEffect.type === 'grantAbility' || aEffect.type === 'removeAbility') && bEffect.filterAbility) return true;

  return false;
}

function orderLayerEffects(effects) {
  // Stable Kahn topological sort. Every tie is resolved by the original
  // battlefield/collection order, so the result is deterministic even when
  // dependencies are absent or cyclic.
  const indexed = effects.map((item, index) => ({ item, index, key: stableEffectKey(item, index) }));
  const indegree = new Map(indexed.map(node => [node, 0]));
  const outgoing = new Map(indexed.map(node => [node, []]));

  for (const a of indexed) {
    for (const b of indexed) {
      if (a === b || !effectDependsOn(a.item, b.item)) continue;
      // effectDependsOn(a, b) means a must be evaluated before b.
      // Therefore the graph edge is A -> B (not B -> A).
      outgoing.get(a).push(b);
      indegree.set(b, indegree.get(b) + 1);
    }
  }

  const ready = indexed.filter(node => indegree.get(node) === 0).sort((a, b) => a.key.localeCompare(b.key));
  const ordered = [];
  while (ready.length) {
    const node = ready.shift();
    ordered.push(node.item);
    for (const next of outgoing.get(node)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) {
        ready.push(next);
        ready.sort((a, b) => a.key.localeCompare(b.key));
      }
    }
  }

  // Cycles are legal as a data condition. Preserve the deterministic source
  // order for the unresolved tail rather than inventing an arbitrary order.
  if (ordered.length !== indexed.length) {
    const seen = new Set(ordered);
    ordered.push(...indexed.filter(node => !seen.has(node)).sort((a, b) => a.key.localeCompare(b.key)).map(node => node.item));
  }
  return ordered;
}

function layerEffects(effects, layer) {
  const filtered = effects.filter(({ effect }) => {
    if (layer === 1) return effect?.type === 'copyValues' || effect?.type === 'copyPermanentContinuous';
    if (layer === 2) return effect?.type === 'changeControl';
    if (layer === 3) return effect?.type === 'changeText';
    if (layer === 4) return effect?.type === 'changeType';
    if (layer === 5) return effect?.type === 'changeColor';
    if (layer === 6) return ['grantKeyword','addKeyword','anthem','grantKeywordIf','grantAbility','removeKeyword','removeAbility'].includes(effect?.type);
    if (layer === 7) return ['dynamicPT','setPowerToughness','anthem','anthemAttacking','conditionalPump','pump','modifyPowerToughness','switchPowerToughness'].includes(effect?.type);
    return false;
  });
  return orderLayerEffects(filtered);
}

function applyStoredCopy(target, chars) {
  const values = target?.copyValues;
  if (!values) return;
  const excluded = new Set(Array.isArray(target?.copyExcept) ? target.copyExcept : []);
  if (values.name !== undefined && !excluded.has('name')) chars.name = String(values.name);
  if (values.type !== undefined && !excluded.has('type')) chars.type = String(values.type);
  if (values.subtype !== undefined && !excluded.has('subtype')) chars.subtype = String(values.subtype);
  if (values.color !== undefined && !excluded.has('color')) chars.color = [...values.color];
  if (values.power !== undefined && !excluded.has('power')) chars.power = Number(values.power);
  if (values.toughness !== undefined && !excluded.has('toughness')) chars.toughness = Number(values.toughness);
  if (values.keywords !== undefined && !excluded.has('keywords')) chars.keywords = [...values.keywords].map(normalizeKeyword);
  if (values.abilities !== undefined && !excluded.has('abilities')) chars.abilities = [...values.abilities];
}

function applyLayer1(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 1)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type === 'copyValues' && effect.values) {
      if (effect.values.name !== undefined) chars.name = String(effect.values.name);
      if (effect.values.type !== undefined) chars.type = String(effect.values.type);
      if (effect.values.subtype !== undefined) chars.subtype = String(effect.values.subtype);
      if (effect.values.color !== undefined) chars.color = [...effect.values.color];
      if (effect.values.power !== undefined) chars.power = Number(effect.values.power);
      if (effect.values.toughness !== undefined) chars.toughness = Number(effect.values.toughness);
      if (effect.values.keywords !== undefined) chars.keywords = [...effect.values.keywords].map(normalizeKeyword);
      if (effect.values.abilities !== undefined) chars.abilities = [...effect.values.abilities];
    }
  }
}

function applyLayer2(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 2)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type !== 'changeControl') continue;
    const controller = effect.controller ?? effect.newController;
    if (controller) target._effectiveController = controller;
  }
}

function applyLayer3(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 3)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type !== 'changeText') continue;
    if (effect.replaceName && chars.name) chars.name = chars.name.split(effect.replaceName).join(effect.withName ?? effect.replaceName);
    if (effect.replaceText && chars.text) chars.text = String(chars.text).split(effect.replaceText).join(effect.withText ?? effect.replaceText);
  }
}

function applyLayer4(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 4)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type !== 'changeType') continue;
    if (effect.newType !== undefined || effect.cardType !== undefined || effect.typeValue !== undefined) {
      chars.type = String(effect.newType ?? effect.cardType ?? effect.typeValue);
    }
    if (effect.addType && !new RegExp('\\b' + effect.addType + '\\b', 'i').test(String(chars.type))) chars.type = (String(chars.type || '') + ' ' + effect.addType).trim(); // V12.76 : Living Lands / Kormus Bell / Living Plane
    if (effect.subtype !== undefined) chars.subtype = String(effect.subtype);
    if (Array.isArray(effect.subtypes)) chars.subtype = effect.subtypes.join(' ');
  }
}

function applyLayer5(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 5)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type !== 'changeColor') continue;
    if (Array.isArray(effect.colors)) chars.color = [...effect.colors];
    else if (effect.color !== undefined) chars.color = [effect.color];
  }
}

const PROTECTION_LETTER = { white: 'W', blue: 'U', black: 'B', red: 'R', green: 'G', w: 'W', u: 'U', b: 'B', r: 'R', g: 'G' };

function applyLayer6(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 6)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type === 'grantKeyword' || effect.type === 'addKeyword' || effect.type === 'anthem' || effect.type === 'grantKeywordIf') {
      if (effect.keyword) {
        // V12.75 : « protection » + color:'white' (White Ward...) doit produire protectionW, le format lu par
        // hasProtectionFromColors ; avant, le mot-clé générique « protection » était poussé sans couleur et
        // l'Aura ne protégeait de rien.
        const protLetter = String(effect.keyword).toLowerCase() === 'protection' ? PROTECTION_LETTER[String(effect.color || '').toLowerCase()] : null;
        chars.keywords.push(protLetter ? 'protection' + protLetter : normalizeKeyword(effect.keyword));
      }
      if (Array.isArray(effect.keywords)) chars.keywords.push(...effect.keywords.map(normalizeKeyword));
    }
    if (effect.type === 'grantAbility' && effect.ability) chars.abilities.push(effect.ability);
    if (effect.type === 'removeKeyword' && effect.keyword) {
      const k = normalizeKeyword(effect.keyword);
      chars.keywords = chars.keywords.filter(x => x !== k);
    }
    if (effect.type === 'removeAbility' && effect.ability) {
      chars.abilities = chars.abilities.filter(a => JSON.stringify(a) !== JSON.stringify(effect.ability));
    }
  }
}

function countControlled(state, side, predicate) {
  return (state?.[side]?.battlefield || []).filter(predicate).length;
}
// Layer 7a — characteristic-defining / dynamic P/T effects.
// These are evaluated before any 7b setting effect, preserving the existing order.
function applyDynamicPT(state, source, target, chars, effect) {
  if (effect.type !== 'dynamicPT') return;
  // V12.76 : une force/endurance définie par une capacité de la carte ne vaut que pour CETTE carte. Sans ce garde-fou, Nightmare,
  // Plague Rats, Beast of Burden, Keldon Warlord... imposaient leur valeur à TOUTES les créatures en jeu.
  if (source.uid !== target.uid) return;
  const own = sideOf(state, source);
  if (!own) return;
  const other = own === 'player' ? 'ai' : 'player';
  if (effect.ownTurnOnly && state.activePlayer !== own) { chars.power = Number(effect.base || 0); if (!effect.onlyPower) chars.toughness = Number(effect.base || 0); return; } // Angry Mob : hors de votre tour
  // V12.76 : `controller` était ignoré (Plague Rats / Beast of Burden : 'all' ne comptaient que le camp de la source).
  const sides = effect.controller === 'all' ? [own, other] : effect.controller === 'opponent' ? [other] : [own];
  const countControlled = (st, _s, pred) => sides.reduce((t, sd) => t + (st?.[sd]?.battlefield || []).filter(pred).length, 0);
  const side = own;
  let n = 0;
  if (effect.powerSource === 'basicLandCount') n = countControlled(state, side, p => /Land/i.test(String(p.type||'')) && String(p.subtype||'').split(/\s+/).includes(effect.landType));
  else if (effect.powerSource === 'subtypeCount') n = countControlled(state, side, p => String(p.subtype||'').split(/\s+/).includes(effect.subtype));
  else if (effect.powerSource === 'graveyardCreatureCount') n = (state[side].graveyard || []).filter(c => /Creature/i.test(String(c.type || ''))).length; // V12.75 : Necropolis
  else if (effect.powerSource === 'creatureCount') n = countControlled(state, side, p => /Creature/i.test(String(p.type||'')) && !(effect.excludeSubtype && String(p.subtype || '').split(/\s+/).includes(effect.excludeSubtype))); // V12.76 (G18) : Keldon Warlord (créatures non-Mur ; sous-type STATIQUE : lire les couches ici rappellerait ce calcul -> récursion)
  const per = Number(effect.per ?? 1); const base = Number(effect.base || 0); chars.power = base + n * per; if (!effect.onlyPower) chars.toughness = base + n * per; // V12.75 : onlyPower (Necropolis : endurance inchangée)
}

// Layer 7b — effects that set P/T to a specific value.
function applyPTBaseAndSet(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 7)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type !== 'setPowerToughness') continue;
    if (effect.power !== undefined) chars.power = Number(effect.power);
    if (effect.toughness !== undefined) chars.toughness = Number(effect.toughness);
  }
}

// Layer 7c — modifications from continuous effects plus counters/aura/temp buffs.
function applyPTModify(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 7)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (!['anthem','anthemAttacking','conditionalPump','pump','modifyPowerToughness'].includes(effect.type)) continue;
    if (effect.type === 'anthemAttacking' && !target.attacking) continue;
    chars.power += Number(effect.power || 0);
    chars.toughness += Number(effect.toughness || 0);
  }
  for (const c of target?.counters || []) {
    if (c.type === '+1/+1') { chars.power++; chars.toughness++; }
    else if (c.type === '-1/-1') { chars.power--; chars.toughness--; }
    else if (c.type === '+1/+0') chars.power++;
    else if (c.type === '+0/+1') chars.toughness++;
    else if (/^[+-]\d+\/[+-]\d+$/.test(String(c.type || ''))) {
      const [p, t] = String(c.type).split('/').map(Number); chars.power += p; chars.toughness += t;
    }
  }
  for (const b of target?.auraBuffs || []) {
    chars.power += Number(b.power || 0); chars.toughness += Number(b.toughness || 0);
    if (b.keyword) chars.keywords.push(normalizeKeyword(b.keyword));
  }
  for (const b of target?.tempBuffs || []) {
    chars.power += Number(b.power || 0); chars.toughness += Number(b.toughness || 0);
  }
  for (const k of target?.tempKeywords || []) chars.keywords.push(normalizeKeyword(k));
  // V12.76 : mots-clés perdus jusqu'à la fin du tour (Radjan Spirit) — appliqués APRÈS les gains temporaires.
  const lost = (target?.tempLostKeywords || []).map(normalizeKeyword);
  if (lost.length) chars.keywords = chars.keywords.filter((k) => !lost.includes(k));
}

// Layer 7d — switch P/T. This remains last by contract.
function applyPTSwitch(state, target, chars, effects) {
  for (const { source, effect } of layerEffects(effects, 7)) {
    if (!sourceEffectApplies(state, source, target, chars, effect)) continue;
    if (effect.type === 'switchPowerToughness') [chars.power, chars.toughness] = [chars.toughness, chars.power];
  }
}

/**
 * Centralized Layer 7 pipeline. The four sublayers are intentionally explicit
 * so future changes cannot accidentally interleave 7a/7b/7c/7d. This preserves
 * the exact evaluation order already exercised by the test suite.
 */
function applyLayer7(state, target, chars, effects) {
  for (const { source, effect } of effects) {
    if (sourceEffectApplies(state, source, target, chars, effect)) applyDynamicPT(state, source, target, chars, effect);
  }
  applyPTBaseAndSet(state, target, chars, effects);
  applyPTModify(state, target, chars, effects);
  applyPTSwitch(state, target, chars, effects);
}

export function calculateCharacteristics(state, permanent, base = {}) {
  const chars = initialCharacteristics(permanent, base);
  chars.name = String(base.name ?? permanent?.name ?? '');
  chars.text = String(base.text ?? permanent?.text_fr ?? permanent?.text ?? '');
  applyStoredCopy(permanent, chars);
  const effects = collectStaticEffects(state);
  applyLayer1(state, permanent, chars, effects);
  applyLayer2(state, permanent, chars, effects);
  applyLayer3(state, permanent, chars, effects);
  applyLayer4(state, permanent, chars, effects);
  applyLayer5(state, permanent, chars, effects);
  applyLayer6(state, permanent, chars, effects);
  applyLayer7(state, permanent, chars, effects);
  chars.keywords = [...new Set(chars.keywords)];
  return chars;
}

export function effectivePowerToughness(state, permanent) {
  const c = calculateCharacteristics(state, permanent);
  return { power: c.power, toughness: c.toughness };
}
export function effectiveKeywords(state, permanent) { return calculateCharacteristics(state, permanent).keywords; }

export function hasProtectionFromColors(state, permanent, sourceColors = []) {
  if (!permanent || !Array.isArray(sourceColors) || sourceColors.length === 0) return false;
  const colors = sourceColors.map(String).map(c => c.toUpperCase());
  const aliases = { W: ['protectionw', 'protectionwhite', 'protection white'], U: ['protectionu', 'protectionblue', 'protection blue'], B: ['protectionb', 'protectionblack', 'protection black'], R: ['protectionr', 'protectionred', 'protection red'], G: ['protectiong', 'protectiongreen', 'protection green'] };
  const keywords = effectiveKeywords(state, permanent).map(k => String(k).toLowerCase());
  return colors.some(c => (aliases[c] || []).some(k => keywords.includes(k)));
}
export function effectiveTypes(state, permanent) {
  const c = calculateCharacteristics(state, permanent);
  return { type: c.type, subtype: c.subtype, color: [...c.color] };
}
export function applyContinuousEffects(state, permanent, base = {}) { return calculateCharacteristics(state, permanent, base); }

/** C5 facade used by future effects and tests. */
export class ContinuousEffectEngine {
  constructor(getState) { this.getState = getState; }
  characteristics(permanent, base = {}) { return calculateCharacteristics(this.getState(), permanent, base); }
  powerToughness(permanent) { return effectivePowerToughness(this.getState(), permanent); }
  keywords(permanent) { return effectiveKeywords(this.getState(), permanent); }
  types(permanent) { return effectiveTypes(this.getState(), permanent); }
}

/** V12.76 (règle 305.6, Blood Moon) : mana intrinsèque d'un terrain NON-BASE dont le sous-type a été remplacé par un type de terrain de base
 *  (« tous les terrains non-base sont des Montagnes ») : il produit uniquement le mana de ce type et perd sa production imprimée. null sinon. */
export function intrinsicLandMana(state, perm) {
  if (!perm) return null;
  const c = calculateCharacteristics(state, perm);
  if (!/\bLand\b/i.test(String(c.type || '')) || /\bBasic\b/i.test(String(perm.type || ''))) return null;
  if (String(c.subtype || '') === String(perm.subtype || '')) return null;
  const MAP = { Plains: 'W', Island: 'U', Swamp: 'B', Mountain: 'R', Forest: 'G' };
  const letters = [...new Set(String(c.subtype || '').split(/\s+/).map(t => MAP[t]).filter(Boolean))];
  return letters.length ? letters.join('') : null;
}
