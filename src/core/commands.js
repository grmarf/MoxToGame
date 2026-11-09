import { rngClock } from './rng-clock-service.js';
/** Commands are the public boundary between UI/AI and the game engine. */
export const CommandType = Object.freeze({
  ACTION: 'action',
  CAST_SPELL: 'castSpell',
  ACTIVATE_ABILITY: 'activateAbility',
  PASS_PRIORITY: 'passPriority',
  PLAY_LAND: 'playLand',
  DECLARE_ATTACKERS: 'declareAttackers',
  DECLARE_BLOCKERS: 'declareBlockers',
  RESOLVE_STACK: 'resolveStack',
  MAKE_DECISION: 'makeDecision',
  // V11.0 — manquait: sans cette entrée, dispatch('nextPhase') ne correspondait
  // jamais à aucun `case` dans GameFacade#dispatch et tombait dans le `default`
  // (commandPendingMigration) sans jamais appeler turnManager.runPhase().
  // Le bouton "Phase suivante" ne faisait donc littéralement rien.
  NEXT_PHASE: 'nextPhase',
});

export function command(type, payload = {}, source = 'player') {
  return { id: crypto.randomUUID?.() ?? rngClock.uuid('cmd'), type, source, payload, timestamp: rngClock.now() };
}
