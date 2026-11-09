// V10.3 — C8.4/C8.5: library search + Aura/attachment runtime.
import { gameEvents } from '../event-bus.js';

const sides = ['player','ai'];
const other = s => s === 'player' ? 'ai' : 'player';
const matchesType = (card, wanted) => !wanted || String(card?.type || '').toLowerCase().includes(String(wanted).toLowerCase());
const matchesSubtype = (card, wanted) => !wanted || String(card?.subtype || card?.type || '').toLowerCase().includes(String(wanted).toLowerCase());

function register(registry, type, fn) { if (!registry.has(type)) registry.register(type, fn); }
function findPermanent(state, ref) {
  const id = ref?.uid || ref?.objectId || ref?.id || ref;
  return sides.flatMap(s => state[s]?.battlefield || []).find(p => p?.uid === id || p?.objectId === id) || null;
}

function search(ctx, effect) {
  const side = effect.side || ctx.controllerKey;
  const library = ctx.state[side]?.library || [];
  if (!library.length) return null;
  const candidates = library.filter(card => {
    if (effect.name && card.name !== effect.name) return false;
    if (effect.cardType && !matchesType(card, effect.cardType)) return false;
    if (effect.subtype && !matchesSubtype(card, effect.subtype)) return false;
    if (effect.basicLand && !/Basic/i.test(String(card.supertypes || card.type || ''))) return false;
    if (effect.colors?.length && !effect.colors.some(c => (card.color || []).includes(c))) return false;
    if (typeof effect.predicate === 'function' && !effect.predicate(card)) return false;
    return true;
  });
  if (!candidates.length) { ctx.api.shuffle(library); return null; }
  const chosen = ctx.api.choose({ type:'libraryCard', controller:side, options:candidates, min:1, max:1, prompt:effect.prompt || 'Choisissez une carte dans votre bibliothèque.', defaultValue:candidates[0] });
  if (!chosen) { ctx.api.shuffle(library); return null; }
  const index = library.indexOf(chosen);
  if (index < 0) { ctx.api.shuffle(library); return null; }
  const card = library.splice(index, 1)[0];
  const destination = effect.destination || 'hand';
  if (ctx.api.zones) ctx.api.zones.move(card, destination, { toSide: destination === 'battlefield' ? side : side, controller: side, reason:'librarySearch' });
  else ctx.state[side][destination].push({...card, zone:destination});
  ctx.api.shuffle(library);
  gameEvents.emit({type:'librarySearched', side, card, destination});
  return card;
}

export function registerC84C85Effects(registry) {
  register(registry, 'tutor', search);
  register(registry, 'searchLibraryToHand', search);
  register(registry, 'searchBasicLand', (ctx, effect) => search(ctx, {...effect, cardType:'Land', basicLand:true}));
  register(registry, 'searchCardType', search);
  register(registry, 'revealSearch', (ctx, effect) => search(ctx, effect));

  register(registry, 'attachAura', (ctx, effect) => {
    const aura = findPermanent(ctx.state, effect.aura || ctx.sourceCard);
    const target = findPermanent(ctx.state, ctx.targetInfo);
    if (!aura || !target) return null;
    if (!String(aura.type || '').includes('Aura')) return null;
    aura.isAura = true;
    aura.attachedTo = target.uid;
    aura.auraEffect = aura.auraEffect || effect.auraEffect || aura.effect || null;
    gameEvents.emit({type:'auraAttached', aura, target});
    return aura;
  });

  register(registry, 'grantManaToEnchantedLand', (ctx, effect) => {
    const aura = findPermanent(ctx.state, effect.aura || ctx.sourceCard);
    const target = findPermanent(ctx.state, ctx.targetInfo) || findPermanent(ctx.state, aura?.attachedTo);
    if (!aura || !target) return null;
    const side = target.controller || ctx.controllerKey;
    const color = effect.color || 'G';
    if (!ctx.state[side]?.mana) return null;
    ctx.state[side].mana[color] = (ctx.state[side].mana[color] || 0) + Number(effect.amount || 1);
    return color;
  });
}
