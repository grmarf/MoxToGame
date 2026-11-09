// V10.2 — C8.3: copy / transformation engine.
// Copiable values are captured explicitly; runtime identity, controller and zone are not copied.

const COPY_KEYS = [
  'name','cost','cmc','color','type','subtype','supertypes','power','toughness',
  'keywords','abilities','activated','triggers','static','effect','effects',
  'produces','tapAbility','flash','isLand','isCreature','text_fr'
];

export function copiableValues(source) {
  const out = {};
  for (const key of COPY_KEYS) {
    if (source?.[key] !== undefined) out[key] = structuredCloneSafe(source[key]);
  }
  return out;
}

function structuredCloneSafe(v) {
  if (v === undefined || v === null) return v;
  return JSON.parse(JSON.stringify(v));
}

export function applyCopyValues(target, source, { except = [] } = {}) {
  const values = copiableValues(source);
  const excluded = new Set(except);
  for (const [key, value] of Object.entries(values)) {
    if (!excluded.has(key)) target[key] = value;
  }
  target.copiedFrom = source.uid || source.objectId || source.id || null;
  target.copyTimestamp = rngClock.now();
  return target;
}

export function snapshotCopy(target) {
  if (!target) return null;
  target.copyValues = copiableValues(target);
  target.copyTimestamp = rngClock.now();
  return target.copyValues;
}

export function restoreCopy(target, values) {
  if (!values) return target;
  for (const key of COPY_KEYS) if (values[key] !== undefined) target[key] = structuredCloneSafe(values[key]);
  return target;
}

export function registerC83Effects(registry) {
  const register = (type, fn) => { if (!registry.has(type)) registry.register(type, fn); };

  register('copyPermanent', (ctx, effect) => {
    const ref = ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo?.object || ctx.targetInfo;
    const target = ctx.api.findPermanent?.(ref);
    if (!target) return null;
    return { copyTarget: target.uid || target.objectId, copiableValues: copiableValues(target) };
  });

  register('copyPermanentContinuous', (ctx, effect) => {
    const target = ctx.api.findPermanent?.(ctx.targetInfo?.uid || ctx.targetInfo?.perm || ctx.targetInfo);
    if (!target) return null;
    const source = ctx.api.findPermanent?.(effect.source || ctx.sourceCard) || ctx.sourceCard;
    if (!source) return null;
    target.copyValues = copiableValues(source);
    target.copySourceUid = source.uid || source.objectId || null;
    target.copyExcept = [...(effect.except || [])];
    target.copyTimestamp = rngClock.now();
    return target;
  });

  register('copySpell', (ctx, effect) => {
    const item = ctx.api.findStackItem?.(ctx.targetInfo?.id || ctx.targetInfo);
    if (!item) return null;
    const copied = {
      ...item,
      source: structuredCloneSafe(item.source),
      effects: structuredCloneSafe(item.effects || []),
      effect: structuredCloneSafe(item.effect),
      copiedFrom: item.id,
      type: 'copy',
      controller: ctx.controllerKey,
      target: effect.chooseNewTargets ? (ctx.api.chooseNewTargets?.(item, ctx.controllerKey) ?? item.target) : item.target,
    };
    return ctx.api.pushStackCopy?.(copied, ctx.controllerKey) || ctx.api.pushSpellCopy?.(item, ctx.controllerKey, copied.target) || null;
  });
}
