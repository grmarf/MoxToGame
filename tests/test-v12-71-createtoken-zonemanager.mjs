import assert from 'node:assert/strict';
import { EffectRegistry } from '../src/core/effect-registry.js';
import { registerC86C87Effects } from '../src/core/effects/token-historical-effects.js';
import { ZoneManager } from '../src/core/zone-manager.js';
import { gameEvents } from '../src/core/event-bus.js';

// BUG G (audit v12.66) : createToken (Bottle of Suleiman & co) poussait le
// token directement dans ctx.state[side].battlefield, en contournant le
// ZoneManager (ctx.api.zones.enterBattlefield) -- le seul chemin canonique
// pour changer de zone dans le moteur. Effet de bord concret : le handler
// émettait AUSSI son propre 'permanentEntered' en plus de celui que
// enterBattlefield émet déjà ailleurs dans le moteur pour toute autre
// entrée sur le champ de bataille -- un token créé via createToken aurait
// donc déclenché deux fois tout "quand cette créature entre en jeu".
// Ce test vérifie : (1) le token passe bien par ZoneManager (identité
// posée par ensureIdentity, permanent présent sur le bon battlefield),
// (2) 'permanentEntered' n'est émis QU'UNE SEULE FOIS par token créé.

const registry = new EffectRegistry();
registerC86C87Effects(registry);

{
  const state = { turnNumber: 3, player: { battlefield: [] }, ai: { battlefield: [] } };
  const zones = new ZoneManager({ state: () => state });

  let permanentEnteredCount = 0;
  const unsub = gameEvents.on('permanentEntered', () => { permanentEnteredCount++; });

  const ctx = { state, controllerKey: 'player', sourceCard: { name: 'Bottle of Suleiman' }, api: { zones } };
  const created = registry.resolve('createToken', ctx, { type: 'createToken', name: 'Djinn', subtype: 'Djinn', power: 5, toughness: 5, amount: 1 });

  assert.equal(state.player.battlefield.length, 1, 'BUG G : le token doit se retrouver exactement une fois sur le champ de bataille.');
  const onField = state.player.battlefield[0];
  assert.equal(onField, created[0], 'BUG G : le token retourné doit être le même objet que celui réellement posé sur le champ de bataille (enterBattlefield renvoie une copie identifiée -- il ne faut pas garder une référence périmée).');
  assert.ok(onField.uid, 'BUG G : le token doit avoir une identité (uid) posée par ZoneManager.ensureIdentity.');
  assert.equal(onField.controller, 'player', 'Le token doit être contrôlé par le bon côté.');
  assert.equal(permanentEnteredCount, 1, "BUG G : 'permanentEntered' ne doit être émis qu'une seule fois par token créé (pas de double-émission handler+ZoneManager).");

  unsub();
  console.log('OK V12.71: createToken (token-historical-effects.js) route via ZoneManager.enterBattlefield, identité et zone cohérentes.');
}
