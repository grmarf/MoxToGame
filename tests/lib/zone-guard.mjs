// Garde-fou « chemin unique » : détecte toute écriture de zone hors ZoneManager.
// Usage : instrumentState(state) sur un GameFacade réel, puis lire `violations`.
import { ZoneManager } from '../../src/core/zone-manager.js';

export const violations = new Map();
let zoneDepth = 0;
let installed = false;
const ZK = ['hand', 'graveyard', 'exile', 'battlefield', 'library'];

function installProtoWrap() {
  if (installed) return; installed = true;
  for (const m of ['move', 'remove', 'enterBattlefield', 'place', 'changeController', 'shuffleLibrary']) {
    const o = ZoneManager.prototype[m]; if (typeof o !== 'function') continue;
    ZoneManager.prototype[m] = function (...a) { zoneDepth++; try { return o.apply(this, a); } finally { zoneDepth--; } };
  }
}
// Premier cadre de pile situé dans src/ : « Classe.méthode (fichier) ».
function where() {
  const line = new Error().stack.split('\n').slice(2).find(l => l.includes('/src/') && !l.includes('zone-guard'));
  if (!line) return '?';
  const fn = (line.match(/at (?:async )?([\w$.#<>]+) \(/) || [])[1] || '<anonymous>';
  const file = (line.match(/\/src\/([^:)]+)/) || [])[1] || '?';
  return `${fn} (${file})`;
}
// Une écriture dont aucun cadre n'est dans src/ vient du test lui-même (mise en place) : ignorée.
const rec = (kind, w) => { if (w === '?') return; const k = `${kind} @ ${w}`; violations.set(k, (violations.get(k) || 0) + 1); };

export function instrumentState(state) {
  installProtoWrap();
  for (const side of ['player', 'ai']) {
    const raw = state[side];
    const arrays = {};
    const wrap = (zone, arr) => new Proxy(arr, {
      set(t, p, v) { if (!zoneDepth && p !== 'length') rec(`écriture ${side}.${zone}`, where()); t[p] = v; return true; },
      deleteProperty(t, p) { if (!zoneDepth) rec(`retrait ${side}.${zone}`, where()); delete t[p]; return true; },
    });
    for (const z of ZK) arrays[z] = wrap(z, raw[z]);
    state[side] = new Proxy(raw, {
      get(t, p) { return ZK.includes(p) ? arrays[p] : t[p]; },
      set(t, p, v) {
        if (ZK.includes(p)) { if (!zoneDepth && v !== arrays[p]) rec(`réassignation ${side}.${p}`, where()); arrays[p] = Array.isArray(v) ? wrap(p, v) : v; }
        t[p] = v; return true;
      },
    });
  }
}
