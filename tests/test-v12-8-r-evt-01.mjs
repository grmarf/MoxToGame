import assert from 'assert';
import { gameEvents } from '../src/core/event-bus.js';
import { installC7EventRules } from '../src/core/effects/complex-effects.js';

// R-EVT-01 : un événement émis SANS `state` reçoit automatiquement l'état courant (state provider).
// v12.73 : l'ancien écouteur upkeepStarted / static 'blackViseLands' (jamais porté par aucune carte)
// a été supprimé ; le même principe est vérifié avec un écouteur réel de installC7EventRules :
// permanentEntered + static 'lifeLossAndManaOnCreatureEnter'.

gameEvents.stateProvider = null;

const mockState = {
  player: { battlefield: [], life: 20, graveyard: [], library: [], hand: [], mana: {W:0,U:0,B:0,R:0,G:0,C:0} },
  ai: { battlefield: [{ name: 'Test Enchantment', static: { type: 'lifeLossAndManaOnCreatureEnter' } }],
        life: 20, graveyard: [], library: [], hand: [], mana: {W:0,U:0,B:0,R:0,G:0,C:0} },
};

gameEvents.setStateProvider(() => mockState);
installC7EventRules();

// Émettre permanentEntered SANS state (comme le fait ZoneManager)
gameEvents.emit({ type: 'permanentEntered', permanent: { name: 'Grizzly Bears', type: 'Creature' }, side: 'player', controller: 'player' });

assert.strictEqual(mockState.player.life, 19, 'le state doit être injecté : 1 PV perdu à l\'entrée de la créature');
assert.strictEqual(mockState.player.mana.B, 1, 'le state doit être injecté : 1 mana noir gagné');
console.log('OK: R-EVT-01 — state injecté automatiquement dans les événements.');
