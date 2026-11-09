// V12.75 — Lecture du texte de règles français des créatures « mots-clés seuls ».
//
// Sert de règle exécutable pour certifier une créature SANS comportement
// spécifique : tout son texte (hors texte de rappel entre parenthèses) doit se
// réduire à des mots-clés que le moteur lit réellement, et la liste `keywords`
// de la carte doit être exactement cet ensemble. Si le texte contient autre
// chose, la fonction renvoie null : la carte a un vrai comportement à
// implémenter et ne peut pas être certifiée par ce chemin.

const LAND_WALK = { 'plaines': 'plainswalk', 'îles': 'islandwalk', 'marais': 'swampwalk', 'montagnes': 'mountainwalk', 'forêts': 'forestwalk' };
const WALK_ALIAS = { 'plaine': 'plainswalk', 'île': 'islandwalk', 'marécage': 'swampwalk', 'montagne': 'mountainwalk', 'forêt': 'forestwalk' };
const COLOR = { blanc: 'W', bleu: 'U', noir: 'B', rouge: 'R', vert: 'G' };

const PATTERNS = [
  [/^vol\b/, () => ['flying']],
  [/^initiative\b/, () => ['first strike']],
  [/^vigilance\b/, () => ['vigilance']],
  [/^défenseur\b/, () => ['defender']],
  [/^piétinement\b/, () => ['trample']],
  [/^célérité\b/, () => ['haste']],
  [/^(?:la )?bande\b/, () => ['banding']],
  [/^regroupement\b/, () => ['banding']],
  [/^sauvagerie (\d+)/, (m) => ['rampage' + m[1]]],
  [/^traversée des (plaines|îles|marais|montagnes|forêts)/, (m) => [LAND_WALK[m[1]]]],
  // Variantes d'écriture présentes dans la base : « la forêt-marche », « la marécage-marche »…
  [/^(?:la |le )?(plaine|île|marécage|montagne|forêt)-marche/, (m) => [WALK_ALIAS[m[1]]]],
  // Mots-clés écrits en toutes lettres.
  [/^attaquer avec [^.]*? ne (?:la|le) fait pas s['’]engager/, () => ['vigilance']],
  [/^[^.]*? peut bloquer comme si (?:elle|il) avait le vol/, () => ['reach']],
  [/^(?:la )?protection contre le (blanc|bleu|noir|rouge|vert)\b/, (m) => ['protection' + COLOR[m[1]]]],
];

const SEPARATORS = /^[\s.,;]+/;

/** Mots-clés (forme normalisée, minuscules) lus par le moteur de combat. */
export function parseKeywordText(raw) {
  const text = String(raw || '');
  let rest = text.replace(/\([^)]*\)/g, ' ').toLowerCase().replace(SEPARATORS, '');
  const found = [];
  // Le rappel « (Les murs ne peuvent pas attaquer.) » énonce le défenseur d'un mur.
  if (/\([^)]*ne peuvent? pas attaquer[^)]*\)/i.test(text)) found.push('defender');
  while (rest.length) {
    let matched = false;
    for (const [re, build] of PATTERNS) {
      const m = rest.match(re);
      if (!m) continue;
      found.push(...build(m).map(normalizeKeywordForAudit));
      rest = rest.slice(m[0].length).replace(SEPARATORS, '');
      matched = true;
      break;
    }
    if (!matched) return null;
  }
  return [...new Set(found)];
}

export function normalizeKeywordForAudit(k) {
  return String(k).toLowerCase().replace('firststrike', 'first strike');
}

/** Mots-clés de la donnée carte, comparables à ceux du texte (les marqueurs génériques `landwalk`/`protection` sont ignorés). */
export function dataKeywordSet(card) {
  return new Set((card.keywords || []).map(normalizeKeywordForAudit).filter((k) => k !== 'landwalk' && k !== 'protection'));
}
