// V9.7 — turn structure / timing helpers (M9).
export const NON_PRIORITY_PHASES = Object.freeze(new Set(['untap','cleanup']));
export const MAIN_PHASES = Object.freeze(new Set(['main1','main2']));
export const COMBAT_PHASES = Object.freeze(new Set(['combatBegin','declareAttackers','declareBlockers','combatDamage','combatEnd']));
export function phaseAllowsPriority(phase){ return !NON_PRIORITY_PHASES.has(phase); }
export function isMainPhase(phase){ return MAIN_PHASES.has(phase); }
export function isCombatPhase(phase){ return COMBAT_PHASES.has(phase); }
export function emptyManaPool(side){
  if(!side?.mana) return 0;
  let n=0; for(const k of Object.keys(side.mana)){ n += Number(side.mana[k]||0); side.mana[k]=0; } return n;
}
export function resetTurnCounters(side){ if(!side) return; side.landsPlayedThisTurn=0; side.mana={W:0,U:0,B:0,R:0,G:0,C:0}; side.hasDrawnThisTurn=false; for(const p of side.battlefield||[]){ p.activationUsesThisTurn=Object.create(null); } }
export function clearUntilCleanup(side){
  for(const p of side?.battlefield||[]){
    if(Array.isArray(p.tempBuffs)) p.tempBuffs.length=0;
    if(Array.isArray(p.tempKeywords)) p.tempKeywords.length=0;
    if(Array.isArray(p.tempLostKeywords)) p.tempLostKeywords.length=0;
    if(Array.isArray(p.untilEndEffects)) p.untilEndEffects.length=0;
    if(Array.isArray(p.untilCleanupEffects)) p.untilCleanupEffects.length=0;
  }
}
