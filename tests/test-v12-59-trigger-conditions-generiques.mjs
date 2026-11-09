import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { createPermanent } from '../src/core/card-runtime.js';
import CARDS from '../src/data/cards-database.js';

const card = name => CARDS.find(c => c.name === name);
const freshGame = () => new GameFacade().connect();
const add = (g, side, c, extra = {}) => {
  const p = createPermanent({ ...c, owner: side, controller: side, ...extra });
  g.state[side].battlefield.push(p);
  return p;
};

// NOTE MÉTHODOLOGIQUE : chaque scénario appelle `g.triggerCollector.collect()`
// DIRECTEMENT plutôt que d'émettre sur le bus d'événements global
// (`gameEvents`). Ce bus est un singleton partagé par toutes les instances
// GameFacade créées dans un même processus (constaté en construisant ce
// test : émettre sur le bus global depuis le scénario 4 réveillait aussi le
// TriggerEngine encore abonné du scénario 2, faussant le résultat). Appeler
// collect() directement isole chaque scénario et teste précisément la
// fonction corrigée par cette mission (`matchesCondition`), sans dépendre
// de la couche de traduction d'événements (TriggerEngine, hors périmètre et
// déjà correcte).

// 1. Hypnotic Specter : "chaque fois qu'il inflige des blessures à un
// adversaire, ce joueur se défausse au hasard d'une carte." Condition réelle
// de la carte : { targetType:'player', sourceSelf:true } (pas de champ
// `kind`) -- avant correction, ce trigger ne se déclenchait jamais.
{
  const g = freshGame();
  const specter = add(g, 'player', card('Hypnotic Specter'));
  g.triggerEngine.syncBattlefield(g.state);

  const resultPlayer = g.triggerCollector.collect({ type: 'damageDealt', source: specter, sourceId: specter.uid, target: 'ai', targetType: 'player', amount: 2 });
  assert.equal(resultPlayer.length, 1, 'Hypnotic Specter doit se déclencher quand il inflige des dégâts à un joueur.');
  assert.equal(resultPlayer[0].effect.type, 'randomDiscard', "L'effet déclenché doit être randomDiscard.");

  // Non-régression : dégâts infligés à une CRÉATURE (pas un joueur) ne doivent pas déclencher.
  const otherCreature = add(g, 'ai', card('Grizzly Bears'));
  const resultCreature = g.triggerCollector.collect({ type: 'damageDealt', source: specter, sourceId: specter.uid, target: otherCreature, targetType: 'creature', amount: 2 });
  assert.equal(resultCreature.length, 0, 'Hypnotic Specter ne doit pas se déclencher pour des dégâts infligés à une créature.');
  console.log('OK V12.59.1: Hypnotic Specter se déclenche (condition sans champ kind), et seulement contre un joueur.');
}

// 2. Warp Artifact : "À l'entretien du contrôleur de l'artefact enchanté,
// Warp Artifact inflige 1 blessure à ce joueur." Condition réelle :
// { controllerUpkeep:false, sourceSelf:true }. Usage adverse modélisé par
// cette condition : Warp Artifact contrôlé par 'player' enchante un artefact
// contrôlé par 'ai' -- controllerUpkeep:false signifie "pas l'entretien du
// CONTRÔLEUR DE L'AURA (player)", ce qui correspond à l'entretien du
// contrôleur de l'artefact enchanté (ai) dans ce cas.
{
  const g = freshGame();
  const artifact = add(g, 'ai', card('Black Lotus'));
  const warp = add(g, 'player', card('Warp Artifact'), { isAura: true, attachedTo: artifact.uid });
  g.triggerEngine.syncBattlefield(g.state);

  const resultOwnUpkeep = g.triggerCollector.collect({ type: 'upkeepStarted', side: 'player' });
  assert.equal(resultOwnUpkeep.length, 0, "Warp Artifact ne doit pas se déclencher à l'entretien du contrôleur de l'aura.");

  const resultEnchantedUpkeep = g.triggerCollector.collect({ type: 'upkeepStarted', side: 'ai' });
  assert.equal(resultEnchantedUpkeep.length, 1, "Warp Artifact doit se déclencher à l'entretien du contrôleur de l'artefact enchanté.");
  assert.equal(resultEnchantedUpkeep[0].source, warp, 'La source du trigger doit être Warp Artifact.');
  assert.equal(resultEnchantedUpkeep[0].effect.type, 'damageEventPlayer', "L'effet déclenché : 1 blessure au contrôleur de l'artefact (Oracle).");
  console.log('OK V12.59.2: Warp Artifact se déclenche exactement sur le bon entretien (condition sans champ kind).');
}

// 3. Creature Bond : "Si la créature enchantée meurt, piochez une carte."
// Condition réelle : { enchantedSource:true }.
// NOTE IMPORTANTE découverte en construisant ce test : Creature Bond
// possède, en plus du système de trigger moderne (TriggerCollector, celui
// corrigé par cette mission), un second mécanisme totalement indépendant et
// plus ancien dans complex-effects.js (`gameEvents.on('creatureDied', ...)`
// qui pioche pour le contrôleur de TOUT permanent ayant `effect.type ===
// 'drawOnDeath'`, SANS vérifier quelle créature est réellement morte ni si
// c'est bien celle que Creature Bond enchante). Ce second mécanisme,
// préexistant, est un second modèle concurrent hors périmètre de BUG-04
// (le fichier concerné, complex-effects.js, n'est pas autorisé par cette
// mission) -- signalé dans le rapport, non corrigé ici.
{
  const g = freshGame();
  const enchanted = add(g, 'player', card('Grizzly Bears'));
  const otherCreature = add(g, 'player', card('Grizzly Bears'));
  const bond = add(g, 'player', card('Creature Bond'), { isAura: true, attachedTo: enchanted.uid });
  g.triggerEngine.syncBattlefield(g.state);

  const resultOther = g.triggerCollector.collect({ type: 'creatureDied', permanent: otherCreature, side: 'player', reason: 'lethalDamage' });
  assert.equal(resultOther.length, 0, "Creature Bond ne doit pas se déclencher quand une autre créature meurt.");

  const resultEnchanted = g.triggerCollector.collect({ type: 'creatureDied', permanent: enchanted, side: 'player', reason: 'lethalDamage' });
  assert.equal(resultEnchanted.length, 1, "Creature Bond doit se déclencher quand la créature qu'il enchante meurt.");
  assert.equal(resultEnchanted[0].source, bond, 'La source du trigger doit être Creature Bond.');
  assert.equal(resultEnchanted[0].effect.type, 'damageEventPlayer', "L'effet déclenché : blessures au contrôleur de la créature (Oracle : égales à son endurance).");
  console.log('OK V12.59.3: Creature Bond se déclenche uniquement pour SA créature enchantée (condition sans champ kind).');
}

// 4. Vesuvan Doppelganger (non-régression) : "À l'entretien de son
// contrôleur..." Condition réelle : { controllerUpkeep:true, sourceSelf:true }.
{
  const g = freshGame();
  const doppel = add(g, 'player', card('Vesuvan Doppelganger'));
  g.triggerEngine.syncBattlefield(g.state);

  const resultOtherUpkeep = g.triggerCollector.collect({ type: 'upkeepStarted', side: 'ai' });
  assert.equal(resultOtherUpkeep.length, 0, "Vesuvan Doppelganger ne doit pas se déclencher à l'entretien adverse.");

  const resultOwnUpkeep = g.triggerCollector.collect({ type: 'upkeepStarted', side: 'player' });
  assert.equal(resultOwnUpkeep.length, 1, "Vesuvan Doppelganger doit se déclencher à l'entretien de son contrôleur.");
  assert.equal(resultOwnUpkeep[0].source, doppel, 'La source du trigger doit être Vesuvan Doppelganger.');
  console.log('OK V12.59.4: Vesuvan Doppelganger -- non-régression, controllerUpkeep:true fonctionne toujours.');
}
