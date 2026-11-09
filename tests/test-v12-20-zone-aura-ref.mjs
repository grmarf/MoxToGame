// V12.20 — Quand une aura change de zone, attachedTo est-il mis à jour ?
import { ZoneManager } from '../src/core/zone-manager.js';

const state = {
  player: { battlefield: [], graveyard: [], hand: [], library: [], exile: [] },
  ai: { battlefield: [], graveyard: [], hand: [], library: [], exile: [] }
};

const zm = new ZoneManager({ state: () => state, replacements: null });

const target = { uid: 't1', name: 'Creature', zone: 'battlefield' };
const aura = { uid: 'a1', name: 'Aura', zone: 'battlefield', attachedTo: 't1', isAura: true };

state.player.battlefield.push(target, aura);

zm.moveToGraveyard(aura, { toSide: 'player', reason: 'destroy' });

const auraInGy = state.player.graveyard.find(x => x.uid === 'a1');
console.log('Aura in graveyard attachedTo:', auraInGy?.attachedTo);

if (auraInGy && auraInGy.attachedTo === 't1') {
  console.error(`BUG: attachedTo non nettoyé après changement de zone`);
  process.exit(1);
}

console.log(`PASS: attachedTo nettoyé ou objet recréé sans référence`);
