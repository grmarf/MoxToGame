import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
import { pickAiTarget } from '../src/app/ai-controller.js';

installEffects(effects, globalThis);
game.connect();
game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));

// Deux créatures côté joueur humain, de force différente.
game.state.player.battlefield.push(
  { uid: 'weak', name: 'Faible', type: 'Creature', power: 1, toughness: 1, controller: 'player', owner: 'player', color: [], tapped: false },
  { uid: 'strong', name: 'Forte', type: 'Creature', power: 6, toughness: 6, controller: 'player', owner: 'player', color: [], tapped: false },
);

// Carte de test avec un effet de destruction ciblé (comme une carte de retrait classique).
const removalSpell = { name: 'Sort de test', type: 'Instant', cost: '1B', effect: { type: 'destroy' } };

const chosen = pickAiTarget(game, removalSpell);
console.log('Cible choisie par pickAiTarget() :', chosen?.perm?.name);
if (chosen?.perm?.name !== 'Forte') { console.error('ÉCHEC : pickAiTarget() n\'a pas visé la créature la plus forte.'); process.exit(1); }
console.log('OK : pickAiTarget() vise bien la menace adverse la plus forte pour un effet de retrait.');
process.exit(0);

