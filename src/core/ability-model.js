// V9.4 — canonical ability model (M3 consolidation).
import { CAST_TIMINGS, isCastTimingLegal } from './spell-timing.js';
import { normalizeCost } from './costs/cost-system.js';
import { effectiveKeywords } from './continuous-effects.js';
export const AbilityKind = Object.freeze({ STATIC:'static', ACTIVATED:'activated', TRIGGERED:'triggered', REPLACEMENT:'replacement' });

export function normalizeAbility(raw = {}, { source = null, controller = null } = {}) {
  if (!raw) return null;
  const kind = raw.kind || (raw.event ? AbilityKind.TRIGGERED : raw.cost !== undefined || raw.tap !== undefined || raw.manaAbility ? AbilityKind.ACTIVATED : raw.replacement ? AbilityKind.REPLACEMENT : AbilityKind.STATIC);
  return Object.freeze({
    id: raw.id || `${kind}_${source?.uid || source?.id || 'card'}_${raw.effect?.type || 'ability'}`,
    kind, source, controller,
    cost: raw.cost ?? '', costSpec: normalizeCost(raw.cost ?? '', raw), tap: !!raw.tap,
    manaAbility: !!raw.manaAbility,
    event: raw.event || null, condition: raw.condition || null,
    effect: raw.effect || null, effects: Array.isArray(raw.effects) ? raw.effects : (raw.effect ? [raw.effect] : []),
    mode: raw.mode || null, choices: raw.choices || null, onlyDuring: raw.onlyDuring || null, onlyIf: raw.onlyIf || null,
    targets: raw.targets || raw.target || null,
    description: raw.description || null,
    layer: raw.layer ?? null, duration: raw.duration || null,
    replacement: raw.replacement || null,
    maxPerTurn: raw.maxPerTurn == null ? null : Math.max(0, Number(raw.maxPerTurn)),
  });
}

export function getAbilities(source, controller = null) {
  if (!source) return [];
  const result = [];
  for (const a of (source.abilities || [])) result.push(normalizeAbility(a, { source, controller }));
  for (const a of (source.activated || [])) result.push(normalizeAbility(a, { source, controller }));
  if (source.tapAbility) {
    const ta = source.tapAbility;
    result.push(normalizeAbility({ ...ta, kind: AbilityKind.ACTIVATED, manaAbility: !!(ta.produces || ta.chooseColorAmount), tap: true, cost: { mana: ta.cost || '', tap: true, sacrifice: !!ta.sacrifice }, effect: ta.effect || null }, { source, controller }));
  }
  for (const a of (source.triggers || [])) result.push(normalizeAbility({ ...a, kind: AbilityKind.TRIGGERED }, { source, controller }));
  if (source.static) result.push(normalizeAbility({ ...source.static, kind: AbilityKind.STATIC }, { source, controller }));
  if (source.replacement) result.push(normalizeAbility({ ...source.replacement, kind: AbilityKind.REPLACEMENT }, { source, controller }));
  return result.filter(Boolean);
}

export function isAbilityLegal(ability, { permanent = null, state, controller, canPay, xValue = 0 } = {}) {
  if (!ability) return false;
  if (ability.controller && ability.controller !== controller) return false;
  // V12.75 : « ne jouez cette capacité que pendant votre entretien » (Colossus of Sardia).
  if (ability.onlyDuring === 'ownUpkeep' && !(state?.phase === 'upkeep' && state?.activePlayer === controller)) return false;
  // V12.76 (G10) : Tolaria (« pendant n'importe quelle étape d'entretien ») et Desert (« pendant l'étape de fin de combat »).
  if (ability.onlyDuring === 'anyUpkeep' && state?.phase !== 'upkeep') return false;
  if (ability.onlyDuring === 'endOfCombat' && state?.phase !== 'combatEnd') return false;
  // V12.76 (G30) : toute fenêtre de `spell-timing.js` (Nettling Imp : `opponentBeforeAttackers`).
  if (ability.onlyDuring && CAST_TIMINGS[ability.onlyDuring] && !isCastTimingLegal(ability.onlyDuring, state, controller)) return false;
  // V12.76 (G10) : Library of Alexandria (« seulement si vous avez exactement sept cartes en main »).
  if (ability.onlyIf?.handSize != null && (state?.[controller]?.hand?.length ?? 0) !== Number(ability.onlyIf.handSize)) return false;
  if (ability.tap && permanent?.tapped) return false;
  if (ability.tap && permanent && /Creature/i.test(String(permanent.type || '')) && permanent.summoningSickness) {
    const keywords = effectiveKeywords(state, permanent);
    if (!keywords.includes('haste')) return false;
  }
  if (ability.cost && !canPay(state[controller], ability.cost, xValue)) return false;
  if (ability.maxPerTurn != null && permanent) {
    const uses = Number(permanent.activationUsesThisTurn?.[ability.id] || 0);
    if (uses >= ability.maxPerTurn) return false;
  }
  return true;
}

export function recordAbilityActivation(permanent, ability) {
  if (!permanent || !ability || ability.maxPerTurn == null) return;
  if (!permanent.activationUsesThisTurn || typeof permanent.activationUsesThisTurn !== 'object') {
    permanent.activationUsesThisTurn = Object.create(null);
  }
  permanent.activationUsesThisTurn[ability.id] = Number(permanent.activationUsesThisTurn[ability.id] || 0) + 1;
}
