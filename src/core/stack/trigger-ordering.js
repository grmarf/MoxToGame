/**
 * V8.6 — Trigger ordering and active-player ordering.
 *
 * MTG-style baseline:
 * - triggers controlled by the active player are ordered first;
 * - within a controller's batch, the controller chooses the order;
 * - the resulting ordered list is pushed to the stack in sequence so the
 *   last pushed item resolves first.
 *
 * The chooser is injected, making this testable and compatible with a UI/AI.
 */
export function groupTriggersByController(triggers) {
  const groups = new Map();
  for (const trigger of triggers) {
    const key = trigger.controller ?? "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(trigger);
  }
  return groups;
}

export function orderTriggers(triggers, activePlayer, chooser = null) {
  const groups = groupTriggersByController(triggers);
  const controllers = [...groups.keys()];

  controllers.sort((a, b) => {
    if (a === activePlayer) return -1;
    if (b === activePlayer) return 1;
    return 0;
  });

  const ordered = [];
  for (const controller of controllers) {
    const batch = [...groups.get(controller)];
    const chosen = typeof chooser === "function"
      ? chooser(batch, { controller, activePlayer })
      : batch;
    ordered.push(...chosen);
  }

  return ordered;
}

export function pushOrderedTriggers(stack, triggers, activePlayer, chooser = null) {
  const ordered = orderTriggers(triggers, activePlayer, chooser);
  for (const trigger of ordered) stack.push(trigger);
  return ordered;
}
