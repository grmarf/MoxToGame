// V12.76 (G16) : point UNIQUE d'engagement d'un permanent. Émet `permanentTapped` quand un permanent DÉGAGÉ devient engagé
// (coût {T}, mana, attaque, effets de tap, bouclier de régénération). « Arrive engagé » n'est PAS « devient engagé » : zone-manager n'émet rien.
import { gameEvents } from './event-bus.js';

function sideOf(state, perm) {
  for (const sd of ['player', 'ai']) if (state?.[sd]?.battlefield?.includes(perm)) return sd;
  for (const sd of ['player', 'ai']) if (state?.[sd]?.battlefield?.some((p) => p.uid && p.uid === perm.uid)) return sd;
  return perm?.controller || null;
}

/** Engage `perm` ; renvoie true s'il vient de passer de dégagé à engagé (et a donc émis l'événement). */
export function tapPermanent(state, perm, { reason = 'tap', side = null } = {}) {
  if (!perm) return false;
  const was = !!perm.tapped;
  perm.tapped = true;
  if (was) return false;
  const controller = side || sideOf(state, perm);
  gameEvents.emit({ type: 'permanentTapped', permanent: perm, side: controller, controller, reason });
  return true;
}
