// V12.76 (G29) — Aides de test : ouvrir une fenêtre de timing LÉGALE pour un sort à `castOnlyDuring` (M1), puis restaurer la phase.
// Les anciens tests lançaient ces sorts en phase principale : ils vérifient la cible / l'effet, pas le timing (qui a son propre test, test-v12-140).
export function legalWindow(timing, caster) {
  const opp = caster === 'player' ? 'ai' : 'player';
  return ({
    beforeDamage: { phase: 'main1', active: caster }, beforeBlockers: { phase: 'main1', active: caster },
    duringCombatBeforeBlockers: { phase: 'declareAttackers', active: caster }, declareAttackers: { phase: 'declareAttackers', active: caster },
    declareBlockers: { phase: 'combatDamage', active: caster }, afterCombat: { phase: 'main2', active: caster },
    opponentTurnAfterUpkeep: { phase: 'main1', active: opp }, opponentBeforeAttackers: { phase: 'main1', active: opp },
  })[timing] || null;
}
export function withWindow(g, card, side, fn) {
  const w = card?.castOnlyDuring ? legalWindow(card.castOnlyDuring, side) : null; if (!w) return fn();
  const tm = g.turnManager; const st = g.state; const saved = { phase: tm.phase, ap: tm.activePlayer, sp: st.phase, sa: st.activePlayer, ps: tm.phaseStarted, bd: tm.blockersDeclared };
  tm.phase = w.phase; st.phase = w.phase; tm.activePlayer = w.active; st.activePlayer = w.active; tm.phaseStarted = false; tm.blockersDeclared = false;
  try { return fn(); } finally { tm.phase = saved.phase; st.phase = saved.sp; tm.activePlayer = saved.ap; st.activePlayer = saved.sa; tm.phaseStarted = saved.ps; tm.blockersDeclared = saved.bd; }
}
