// V9.2 — canonical keyword helpers shared by combat and effects.
export const KEYWORD_ALIASES = Object.freeze({
  'first strike':'first strike', firststrike:'first strike',
  'double strike':'double strike', doublestrike:'double strike',
  'flying':'flying', reach:'reach', trample:'trample', haste:'haste',
  vigilance:'vigilance', menace:'menace', fear:'fear', intimidate:'intimidate',
  defender:'defender', unblockable:'unblockable', landwalk:'landwalk',
  'islandwalk':'islandwalk', 'swampwalk':'swampwalk', 'mountainwalk':'mountainwalk',
  'forestwalk':'forestwalk', 'plainswalk':'plainswalk', protection:'protection',
  regeneration:'regenerate', regenerate:'regenerate'
});
export function normalizeKeyword(k=''){ const s=String(k).trim().toLowerCase(); return KEYWORD_ALIASES[s] || s; }
export function keywordsOf(p, state = null){
  if (state) {
    try {
      // Lazy import would complicate the hot path; callers that have state should use
      // effectiveKeywords from continuous-effects. Keep this helper backward-compatible.
    } catch (_) {}
  }
  const lost=(p?.tempLostKeywords||[]).map(normalizeKeyword); // V12.76 : « perd le vol jusqu'à la fin du tour » (Radjan Spirit)
  return [...(p?.keywords||[]),...(p?.tempKeywords||[])].map(normalizeKeyword).filter(k=>!lost.includes(k));
}
export function hasKeyword(p,k){ return keywordsOf(p).includes(normalizeKeyword(k)); }
