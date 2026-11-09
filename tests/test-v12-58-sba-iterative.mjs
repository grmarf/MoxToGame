import assert from 'assert';
import { StateBasedActions } from '../src/core/state-based-actions.js';

// Scénario de cascade réelle à deux vagues :
// - Une créature C (endurance de base 1) est enchantée par une Aura légendaire A
//   qui lui donne +0/+2 (toughness effective = 3). C porte 2 dégâts marqués :
//   au premier passage, C survit (2 < 3).
// - Une seconde Aura légendaire A2, de même nom que A, est aussi sur le champ de
//   bataille -> la RÈGLE DES LÉGENDES (#checkLegendRule, exécutée APRÈS
//   #checkCreatureDeath dans l'ordre du fichier) détruit A dans le même passage
//   (le choiceService par défaut garde perms[0], donc A2 -- A est détruite).
// - Une fois A détruite, le buff +0/+2 disparaît (collectStaticEffects ne lit que
//   les auras encore présentes sur le champ de bataille). L'endurance effective de
//   C retombe donc à 1, alors qu'elle porte toujours 2 dégâts marqués : C devient
//   mortelle. Mais #checkCreatureDeath a déjà terminé son unique passage AVANT que
//   la règle des légendes ne détruise A -- sans boucle, C resterait donc en vie à
//   tort jusqu'au prochain appel externe à check().
function buildState() {
  return {
    player: {
      battlefield: [
        { name: 'Grizzly Bears', type: 'Creature', uid: 'creature1', owner: 'player', power: 1, toughness: 1, damageMarked: 2, keywords: [] },
        { name: 'Aura of Might', type: 'Legendary Enchantment - Aura', uid: 'aura1', owner: 'player', isAura: true, attachedTo: 'creature1', auraEffect: { type: 'pump', power: 0, toughness: 2 }, keywords: [] },
        { name: 'Aura of Might', type: 'Legendary Enchantment - Aura', uid: 'aura2', owner: 'player', isAura: true, attachedTo: null, auraEffect: { type: 'pump', power: 0, toughness: 0 }, keywords: [] },
      ],
      graveyard: [], hand: [], library: [], exile: [], life: 20, mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    },
    ai: {
      battlefield: [], graveyard: [], hand: [], library: [], exile: [], life: 20, mana: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    },
  };
}

// 1. Cascade réelle : un seul appel à check() doit traiter les deux vagues.
{
  const state = buildState();
  const sba = new StateBasedActions({ zones: null, choiceService: null }); // pas de choiceService -> défaut perms[0] gardé
  // byName regroupe par nom puis Object.entries -- l'ordre d'insertion sur le
  // champ de bataille détermine perms[0]. On construit la liste explicitement
  // pour que "auraKept" soit en première position (donc gardée) et
  // "auraDestroyed" (celle réellement attachée à la créature) soit détruite,
  // ce qui déclenche la cascade recherchée.
  const creature = { name: 'Grizzly Bears', type: 'Creature', uid: 'creature1', owner: 'player', power: 1, toughness: 1, damageMarked: 2, keywords: [] };
  const auraKept = { name: 'Aura of Might', type: 'Legendary Enchantment - Aura', uid: 'aura2', owner: 'player', isAura: true, attachedTo: null, auraEffect: { type: 'pump', power: 0, toughness: 0 }, keywords: [] };
  const auraDestroyed = { name: 'Aura of Might', type: 'Legendary Enchantment - Aura', uid: 'aura1', owner: 'player', isAura: true, attachedTo: 'creature1', auraEffect: { type: 'pump', power: 0, toughness: 2 }, keywords: [] };
  state.player.battlefield = [auraKept, auraDestroyed, creature];

  const events = sba.check(state);

  const stillOnBattlefield = state.player.battlefield.some(p => p.uid === 'creature1');
  const inGraveyard = state.player.graveyard.some(p => p.uid === 'creature1');
  assert.strictEqual(inGraveyard, true, 'La créature doit mourir dans le MÊME appel à check(), une fois son aura de buff détruite par la règle des légendes.');
  assert.strictEqual(stillOnBattlefield, false, 'La créature ne doit plus être sur le champ de bataille après ce même appel à check().');
  assert.ok(events.some(e => e.type === 'legendRule'), 'Un événement legendRule doit être émis (aura1 détruite).');
  assert.ok(events.some(e => e.type === 'creatureDied' && e.permanent.uid === 'creature1'), 'Un événement creatureDied doit être émis pour la créature, dans le même appel.');
  console.log('OK V12.58.1: check() traite une cascade à deux vagues en un seul appel externe.');
}

// 2. Non-régression : sans cascade (aura de buff jamais détruite), un seul passage suffit et rien d'inattendu ne meurt.
{
  const state = buildState();
  // Retirer la seconde aura pour qu'il n'y ait pas de règle des légendes déclenchée.
  state.player.battlefield = state.player.battlefield.filter(p => p.uid !== 'aura2');
  const sba = new StateBasedActions({ zones: null, choiceService: null });
  const events = sba.check(state);
  assert.strictEqual(state.player.battlefield.some(p => p.uid === 'creature1'), true, 'Sans cascade, la créature bufée doit rester en vie (endurance effective 3 > 2 dégâts marqués).');
  assert.strictEqual(events.some(e => e.type === 'legendRule'), false, 'Aucun événement legendRule ne doit être émis sans duplicata.');
  console.log('OK V12.58.2: non-régression -- pas de cascade, pas de mort injustifiée.');
}

// 3. Garde-fou : le plafond de sécurité ne doit jamais être atteint sur ces scénarios réels
//    (vérifié indirectement : check() doit retourner rapidement, pas de blocage).
{
  const state = buildState();
  const auraKept = state.player.battlefield.find(p => p.uid === 'aura2');
  const start = Date.now();
  const sba = new StateBasedActions({ zones: null, choiceService: null });
  sba.check(state);
  const elapsed = Date.now() - start;
  assert.ok(elapsed < 1000, 'check() doit se stabiliser rapidement, sans boucler indéfiniment.');
  console.log('OK V12.58.3: check() se stabilise rapidement (pas de boucle infinie).');
}
