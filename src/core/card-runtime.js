// @ts-check
/** Runtime normalization for C0 cards: lands, vanilla creatures and simple permanents. */
import { rngClock } from './rng-clock-service.js';

export function normalizeCard(card) {
  const c = { ...card };
  c.cost = c.cost ?? '';
  c.cmc = Number(c.cmc ?? 0);
  c.color = Array.isArray(c.color) ? [...c.color] : [];
  c.keywords = Array.isArray(c.keywords) ? [...c.keywords] : [];
  c.triggers = Array.isArray(c.triggers) ? c.triggers.map(t => ({ ...t })) : [];
  if (c.upkeepTrigger && !c.triggers.some(t => t.event === 'upkeepStarted')) {
    c.triggers.push({ event: 'upkeepStarted', condition: { kind: 'controllerUpkeep', controllerSelf: true }, effect: c.upkeepTrigger });
  }
  c.isLand = /\bLand\b/.test(String(c.type || ''));
  c.isCreature = /\bCreature\b/.test(String(c.type || ''));
  c.isPermanent = /Creature|Artifact|Enchantment|Planeswalker/.test(String(c.type || ''));
  if (c.produces && typeof c.produces !== 'string') c.produces = String(c.produces);
  // Le comportement de chaque carte (triggers, activated, static, effect, replacementEffects, aura)
  // vit désormais UNIQUEMENT dans src/data/cards-database.js : plus de dérogation par nom ici.
  return c;
}

export function createPermanent(card) {
  const c = normalizeCard(card);
  return {
    ...c,
    uid: c.uid || rngClock.uuid('perm'),
    objectId: c.objectId || rngClock.uuid('obj'),
    zone: 'battlefield',
    zoneChangeId: null,
    tapped: false,
    summoningSickness: !!c.isCreature && !c.keywords.some(k => String(k).toLowerCase() === 'haste'),
    enteredTurn: null,
    damageMarked: 0,
    counters: Array.isArray(c.counters) ? [...c.counters] : [],
    auraBuffs: [],
    tempBuffs: [],
    tempKeywords: [],
    playedThisTurn: false,
    activationUsesThisTurn: Object.create(null),
    controller: c.controller || null,
    owner: c.owner || null,
  };
}

export function isBasicC0Card(card) {
  const c = normalizeCard(card);
  return c.isLand || (c.isPermanent && !c.effect && !c.activated && !c.triggers && !c.static && !c.tapAbility);
}
