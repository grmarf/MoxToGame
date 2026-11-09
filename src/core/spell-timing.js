// V12.76 (G29) — M1 : restrictions de timing des SORTS (« Lancez ce sort uniquement… »).
// Champ de carte `castOnlyDuring` ; la légalité dépend de la phase, du joueur actif et de deux drapeaux du TurnManager, car ce moteur fusionne certaines étapes :
//  - `declareAttackers()` fait passer DIRECTEMENT la phase à `declareBlockers` : tant que `blockersDeclared` est faux, c'est la fenêtre « attaquants déclarés, bloqueurs pas encore » ;
//  - `declareBlockers()` fait passer la phase à `combatDamage` SANS infliger de blessures : tant que `damageStarted` est faux, c'est la fenêtre « bloqueurs déclarés, blessures pas encore ».
// Valeur inconnue : aucune restriction (pas de blocage silencieux).
const ORDER = ['untap', 'upkeep', 'draw', 'main1', 'combatBegin', 'declareAttackers', 'declareBlockers', 'combatDamage', 'combatEnd', 'main2', 'endStep', 'cleanup'];
const idx = (phase) => ORDER.indexOf(phase);

export const CAST_TIMINGS = Object.freeze({
  beforeDamage: { text: "avant l'étape des blessures de combat", test: (c) => c.i < idx('combatDamage') || c.damageOpen },                                      // Berserk
  beforeBlockers: { text: "avant que les bloqueurs ne soient déclarés", test: (c) => c.i <= idx('declareAttackers') || c.blockersOpen },                      // Rapid Fire
  duringCombatBeforeBlockers: { text: "pendant le combat, avant que les bloqueurs ne soient déclarés", test: (c) => c.i === idx('combatBegin') || c.i === idx('declareAttackers') || c.blockersOpen }, // Disharmony, Blaze of Glory
  declareAttackers: { text: "pendant l'étape de déclaration des attaquants", test: (c) => c.i === idx('declareAttackers') || c.blockersOpen },                 // Teleport
  declareBlockers: { text: "pendant l'étape de déclaration des bloqueurs", test: (c) => c.damageOpen || (c.phase === 'declareBlockers' && c.blockersDeclared) }, // False Orders
  afterCombat: { text: "après le combat", test: (c) => c.i >= idx('combatEnd') },                                                                                // Glyph of Reincarnation
  opponentTurnAfterUpkeep: { text: "pendant le tour d'un adversaire, après son étape d'entretien", test: (c) => !c.own && c.i > idx('upkeep') },              // Reset
  opponentBeforeAttackers: { text: "pendant le tour d'un adversaire, avant la déclaration des attaquants", test: (c) => !c.own && c.i < idx('declareAttackers') }, // Siren's Call
});

/** `state` : { phase, activePlayer, blockersDeclared?, damageStarted? } ; `controller` : le joueur qui lance le sort. */
export function isCastTimingLegal(timing, state, controller) {
  const t = CAST_TIMINGS[timing]; if (!t) return true;
  const phase = state?.phase; const i = idx(phase); if (i < 0) return true;
  const blockersDeclared = !!state?.blockersDeclared; const damageStarted = !!state?.damageStarted;
  return !!t.test({ i, phase, own: state?.activePlayer === controller, blockersDeclared, blockersOpen: phase === 'declareBlockers' && !blockersDeclared, damageOpen: phase === 'combatDamage' && !damageStarted });
}
export function timingText(timing) { return CAST_TIMINGS[timing]?.text || ''; }

/** État de timing du moteur : à passer à `isCastTimingLegal`. */
export function timingStateOf(turnManager) {
  return { phase: turnManager.phase, activePlayer: turnManager.activePlayer, blockersDeclared: !!turnManager.blockersDeclared, damageStarted: turnManager.phase === 'combatDamage' && !!turnManager.phaseStarted };
}
