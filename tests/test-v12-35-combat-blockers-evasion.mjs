// V12.35 — getValidBlockers doit respecter l'évasion (vol, protection, terrain
// de passage, etc.) vis-à-vis d'un attaquant précis, pas seulement filtrer
// les créatures aptes à bloquer en général.
//
// Avant correction, getValidBlockers(side) ignorait totalement l'attaquant
// (appelait #canBlock(p, null, side)), donc l'UI de blocage (game-ui.js)
// proposait n'importe quelle créature comme bloqueur légal, y compris contre
// un attaquant volant sans vol/portée en face -- l'assignation n'échouait
// qu'au moment de assignBlockers(), après coup.
import { CombatService } from '../src/core/combat.js';

function creature({ uid, name, side, power = 2, toughness = 2, keywords = [] }) {
  return {
    uid, name, type: 'Creature', power, toughness, keywords,
    tapped: false, summoningSickness: false, damageMarked: 0,
    auraBuffs: [], tempBuffs: [], tempKeywords: [],
    controller: side, owner: side,
  };
}

const flyer = creature({ uid: 'flyer', name: 'Créature volante', side: 'ai', keywords: ['flying'] });
const groundBlocker = creature({ uid: 'ground', name: 'Bloqueur au sol', side: 'player' });
const reachBlocker = creature({ uid: 'reach', name: 'Bloqueur avec portée', side: 'player', keywords: ['reach'] });

const state = {
  activePlayer: 'ai',
  player: { battlefield: [groundBlocker, reachBlocker], life: 20 },
  ai: { battlefield: [flyer], life: 20 },
};

const combat = new CombatService({ state: () => state });
combat.begin();
combat.confirmAttackers([flyer], 'ai');

// 1) Sans préciser l'attaquant (compat rétro pour les appelants existants,
//    ex. src/core/ai/ai-service.js) : comportement historique inchangé, on
//    ne filtre pas par évasion.
const withoutAttacker = combat.getValidBlockers('player').map(p => p.uid).sort();
if (JSON.stringify(withoutAttacker) !== JSON.stringify(['ground', 'reach'])) {
  console.error('FAIL: appel sans attaquant doit rester permissif (compat rétro).', withoutAttacker);
  process.exit(1);
}

// 2) Avec l'attaquant volant précisé : seul le bloqueur avec portée doit
//    ressortir comme légal.
const withAttacker = combat.getValidBlockers('player', flyer).map(p => p.uid).sort();
if (JSON.stringify(withAttacker) !== JSON.stringify(['reach'])) {
  console.error('FAIL: seul un bloqueur avec vol/portée doit pouvoir bloquer un attaquant volant.', withAttacker);
  process.exit(1);
}

// 3) Le moteur doit toujours refuser l'assignation illégale sous-jacente
//    (garde-fou déjà existant, non modifié) : confirme que le fix de
//    getValidBlockers n'a fait que rapprocher l'UI de cette vérité, sans la
//    dupliquer ni l'affaiblir.
let rejected = false;
try { combat.assignBlockers({ flyer: ['ground'] }); }
catch (e) { rejected = /Blocage illégal/.test(e.message); }
if (!rejected) {
  console.error('FAIL: le moteur doit toujours rejeter un bloqueur au sol contre un attaquant volant.');
  process.exit(1);
}

console.log('OK: V12.35 getValidBlockers respecte l’évasion par attaquant précis (fix UI de blocage).');
