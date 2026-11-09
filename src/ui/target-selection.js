// Helpers shared by the human targeting UI. Runtime objects are never persisted here;
// targets are identified by stable keys and re-resolved from the engine's current list.
export function targetKey(target) {
  if (!target) return null;
  if (target.kind === 'permanent') return `permanent:${target.uid || target.perm?.uid || target.id || ''}`;
  if (target.kind === 'player') return `player:${target.side || target.id || ''}`;
  if (target.kind === 'stackItem') return `stack:${target.id || target.item?.id || ''}`;
  if (target.type === 'self') return `player:${target.side || target.id || ''}`;
  if (target.type === 'opponent') return `player:${target.side || target.id || ''}`;
  if (target.uid) return `uid:${target.uid}`;
  if (target.id) return `id:${target.id}`;
  return null;
}

export function findTargetByKey(targets, key) {
  if (!key) return null;
  return (targets || []).find(target => targetKey(target) === key) || null;
}
