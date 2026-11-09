# MoxToGame — Mécaniques à implémenter (état : zip `lot-g32`, 30/10/2026)

**Base** : 985 cartes, 480 jouables (59 `functional` + 421 `implemented`), 437 `unimplemented`, 68 sans statut. `npm test` : 364 lignes OK.

**Mise à jour G32** : la base est comparée à l'export Scryfall (`RAPPORT-ECARTS-ORACLE.md`). Structure identique à Scryfall (0 écart de coût, types, supertypes, force/endurance). 12 cartes « implémentées » fausses corrigées ; **82 cartes jouables restent à examiner** (liste du rapport, beaucoup de faux positifs).

**Mise à jour G24** : Stasis, Brass Man, Lifeforce, Artifact Possession, Relic Bind sont faits. **Time Walk était cassée** (aucun tour supplémentaire) : corrigée par une file `state.extraTurnQueue` ✔. **Time Vault n'était PAS « données seules »** : fait au lot G25 (remplacement de début de tour avec vrai choix, voir M23).

## 0. Comment lire ce document

- **✔** = constaté dans le code ce jour (fichier lu). **◻** = hypothèse à SONDER en vraie partie avant de coder (règle n°1 de la méthode).
- Les listes de cartes viennent du texte français de la base (souvent faux) : les noms sont fiables, les descriptions sont à confronter à l'Oracle.
- Une carte peut apparaître dans plusieurs familles. Les chiffres sont des ordres de grandeur.
- Rien ici ne touche à l'IA adverse (refonte prévue plus tard) : chaque lot doit noter ce que l'IA ne sait pas faire.
- Constat corrigé par rapport au prompt de reprise : `continuous-effects.js` (couche 7c) lit **déjà** tout marqueur de forme `+n/+m` (regex `^[+-]\d+/[+-]\d+$`) ✔. Les marqueurs `+1/+2`, `+0/+1`, `-0/-2` n'exigent donc **pas** de travail dans les couches ; le manque est ailleurs (poser le marqueur sur une cible, les compter, les retirer).

## 1. Briques déjà présentes (ne pas les refaire)

| Brique | Où | Preuve |
|---|---|---|
| Coût `exile: { type, choose }` sur le champ de bataille (types effectifs, vrai choix du joueur) | `src/core/costs/cost-system.js`, `native-engine.js` (`#activateAbility`) | ✔ (lot G22) |
| Mana « par marqueur » sans retrait (`perCounter`) et avec retrait (`perCounterRemoved`) | `native-engine.js` (`#resolveManaAbility`) | ✔ |
| Statique `whileUntapped` (« tant que cet artefact est dégagé ») | `turn/turn-manager.js` (`#hasStatic`) | ✔ (lot G23) |
| Condition `enchantedIsBasic` (terrain enchanté = terrain de base d'un sous-type) | `continuous-effects.js` (`sourceEffectApplies`) | ✔ (lot G23) |
| Étape de dégagement : `skipUntapPhase`, `cantUntapCreatures` (booléen), `untapLock` (un terrain, choix **automatique**), choix « ne pas dégager » (`keepTapped`) | `turn/turn-manager.js` (`#runUntap`) | ✔ |
| Timing des **capacités** : `onlyDuring` = `ownUpkeep`, `anyUpkeep`, `endOfCombat` ; `onlyIf.handSize` ; `maxPerTurn` | `ability-model.js` (`isAbilityLegal`) | ✔ |
| Événements déclencheurs reconnus : `combatDamageToPlayer/Creature`, `creatureDied`, `permanentEntered`, `spellCast`, `playerLost`, `upkeepStarted`, `endStepStarted`, `drawStepStarted`, `artifactAbilityActivated`, `permanentTapped` | `triggers/trigger-engine.js` (`EVENT_MAP`) | ✔ |
| Événements émis par le combat mais **non branchés** aux déclencheurs : `attackersDeclared`, `blockersDeclared` | `combat.js` (émission), `trigger-engine.js` (`EVENT_MAP`) | ✔ |
| Effets déjà enregistrés utiles (liste **non exhaustive**) : `payToUntap`, `payOrSacrifice`, `payOrDamage`, `destroyLandOrPay`, `counterUnlessPay`, `counterSpellColor`, `regenerateShield`, `preventDamage*`, `preventNextDamageFromColor/Artifact`, `copySpell`, `copyPermanent`, `extraTurn`, `drainMana`, `stealCreature(UntilEnd)`, `stealArtifact`, `createToken`, `reanimate`, `forceAttack(All)`, `mustBeBlocked`, `tapTarget/untapTarget/tapOrUntap`, `changeColor`, `damageController`, `lookTopTarget` | `src/core/effects/*.js` | ✔ (noms) / ◻ (comportement exact) |
| Retour de contrôle différé, mana différé | `state.delayedControl`, `side.delayedMana` (`turn-manager.js`) | ✔ |
| Copie « sauf que… » (test d'exceptions de copie) | `layers/copy-effects.js`, `test-v12-8-r613-02-copy-except` | ◻ (étendue exacte à relire) |
| Pile ou face (`rngClock`) | `effects/choice-effects.js`, Bottle of Suleiman | ✔ |
| `indestructible` (destruction directe et blessures létales) ; `cantbeenchantedbyotherauras` (Consecrate Land) | `stack.js` (`destroyPermanent`), `state-based-actions.js`, `native-engine.js` (`#isLegalTarget`) | ✔ (G27) |
| Événement `permanentLeft` (un permanent quitte le champ de bataille, regard en arrière) | `zone-manager.js` (émission), `triggers/trigger-engine.js` (`EVENT_MAP`) | ✔ (G27) |
| Effets `payToGainLife` (entretien du contrôleur du terrain enchanté), `damageEachMatching` (blessure à chaque créature d'un sous-type) | `effects/upkeep-cost-effects.js`, `effects/damage-family-effects.js` | ✔ (G27) |
| Bande : **validation des groupes** à l'attaque (au moins une créature avec banding, au plus une sans) | `combat.js` l. 83-86 | ✔ |

## 2. Mécaniques transverses (à faire en premier : chacune débloque plusieurs cartes)

### M1 — Restriction de timing des SORTS (« Lancez ce sort uniquement pendant… »)  — **fait** ✔ (G29)
- **Fait (G29)** : champ de carte `castOnlyDuring`, module `src/core/spell-timing.js` (8 fenêtres : `beforeDamage`, `beforeBlockers`, `duringCombatBeforeBlockers`, `declareAttackers`, `declareBlockers`, `afterCombat`, `opponentTurnAfterUpkeep`, `opponentBeforeAttackers`), vérifié dans `native-engine.js` (`#castSpell`, refus avant tout paiement) ET par l'IA (`ai-service.js` `#canCast` : sans cela le banc compte une erreur d'action). Piège du moteur : `declareAttackers()` passe directement la phase à `declareBlockers` et `declareBlockers()` à `combatDamage` SANS infliger de blessures ; les fenêtres utilisent donc les drapeaux `blockersDeclared` et `phaseStarted`. Assistant de test : `tests/lib/timing.mjs` (`withWindow`).
- **Faits** : Reset, Teleport, Rapid Fire, Berserk, Siren's Call, et le champ ajouté à Blaze of Glory. **Restent** (mécanique propre à écrire, timing déjà disponible) : False Orders (`declareBlockers`), Disharmony (`duringCombatBeforeBlockers` ; exige de retirer une créature du combat), Glyph of Reincarnation (`afterCombat`), Blaze of Glory (effet encore FAUX : multi-blocage, M10).
- **Constat** : `onlyDuring` n'existe que pour les capacités activées. Aucun contrôle pour les sorts : ces cartes se lancent à n'importe quel moment.
- **Fichiers** : `native-engine.js` (`#castSpell`, avant paiement et avant ciblage), `card-playability.js` (grisage UI / IA), `ability-model.js` (réutiliser la table de phases).
- **Modification** : champ de carte `castOnlyDuring` (valeurs à définir : `beforeBlockers`, `declareAttackers`, `combat`, `beforeDamage`, `afterCombat`, `opponentTurn`, `opponentBeforeAttackers`) ; `canCast` refuse hors fenêtre ; test par fenêtre (autorisé / refusé).

### M2 — Mémoire d'attaque et événements de combat  — **partiel** ✔ (G28 : événements faits ; mémoire d'attaque restante)
- **Fait (G28)** : `combat.js` (`assignBlockers`) émet `creatureBlocked` (une fois par paire attaquant/bloqueur) et `attackerUnblocked` ; `EVENT_MAP` les relaie ; conditions `enchantedInBlock` (`otherNotSubtype`, `otherMaxToughness`), `enchantedUnblocked`. Émission `damageDealtToPlayer` (blessures NON de combat d'une source à un joueur) depuis `stack.js` (`applyDamageToPlayer`). `attackedTurn` posé par `combat.js` (`confirmAttackers`, G29) ; **Erg Raiders et Nettling Imp faits au lot G30** (conditions `controllerEndStep`, `sourceDidNotAttackThisTurn`, `sourceNotUnderControlThisTurn` ; `controlChangedTurn` posé par `ZoneManager.changeController` ; capacités : `onlyDuring` accepte maintenant toute fenêtre de `spell-timing.js`). **Reste** : le déclencheur `attackersDeclared` (Mijae Djinn, Ydwen Efreet, Goblin Flotilla), qui exige aussi de retirer une créature du combat.
- **Constat** : aucun champ « a attaqué ce tour » (`attackedThisTurn` introuvable) ; `attackersDeclared` / `blockersDeclared` ne sont pas dans `EVENT_MAP`.
- **Fichiers** : `combat.js` (`confirmAttackers` : poser `perm.attackedTurn = turnNumber`), `triggers/trigger-engine.js` (`EVENT_MAP` += `attackersDeclared`, `blockersDeclared`), `triggers/trigger-collector.js` (nouvelles conditions : `sourceDidNotAttackThisTurn`, `sourceNotEnteredThisTurn`, `sourceBlocksOrBlocked`).
- **Cartes** : Erg Raiders, Goblin Flotilla (déclencheur « devient bloquée / bloque »), Nettling Imp (destruction si n'a pas attaqué), Siren's Call.

### M3 — Effets différés génériques (« à la fin du tour / au début du prochain… »)  — **fait pour fin de combat et prochaine étape finale** ✔ (G28)
- **Fait (G28)** : `state.delayedEffects` (`{ at: 'endOfCombat' | 'nextEndStep', kind: 'destroy' | 'addCounter', targetUid, … }`) exécuté par `StackController.runDelayed(at)` ; le TurnManager l'appelle à l'étape de fin de combat et au début de l'étape finale (`delayedRunner`, câblé dans `game-facade.js`). Indépendant de l'Aura source (elle peut partir avant). **Reste** : `nextUpkeep`, effets arbitraires (Siren's Call, Berserk, Cockatrice).
- **Constat** : seuls `state.delayedControl` et `side.delayedMana` existent ; pas de liste générique d'effets différés.
- **Fichiers** : `native-engine.js` ou `stack.js` (API `scheduleDelayed({ at: 'endStep'|'nextEndStep'|'nextUpkeep', effect, controller, source })`), `turn/turn-manager.js` (`#runEndStep`, `#runUpkeep` : vider et résoudre la liste), `serialization.js` (sérialiser la liste).
- **Cartes** : Siren's Call (détruire les non-Mur qui n'ont pas attaqué), Nettling Imp, Cockatrice / Thicket Basilisk-like (détruire à la fin du combat), Berserk (détruire à la fin du tour), Disintegrate (exil si meurt ce tour), Sengir Vampire (conditionnel), Righteousness ◻.

### M4 — Modes « choisissez l'un » avec choix AVANT la cible  — **absent** ◻
- **Fichiers** : `native-engine.js` (`#castSpell` : demander le mode, puis la cible du mode ; `needsTarget` et `#isLegalTarget` par mode), `choice-service.js` (nouveau type de choix `mode`), `stack.js` (porter `item.mode`), base de données (`modes: [{ effect, target }]`).
- **Cartes** : Blue/Red Elemental Blast (mode 1 : contrer un sort de la couleur ; mode 2 : détruire un **permanent** de la couleur, pas seulement une créature).
- **Note** : `colorRestriction` existe déjà côté permanents ✔ (prompt) ; il faut l'étendre aux sorts sur la pile.

### M5 — Paiement « sauf si… » avec alternatives (mana OU PV OU engagement de terrain)  — **partiel** ◻
- **Constat** : `payOrSacrifice`, `payOrDamage`, `destroyLandOrPay`, `counterUnlessPay` existent ; il manque un effet générique « détruire/sacrifier SAUF SI on paie l'un de [coûts] » avec **choix** du payeur.
- **Fichiers** : `effects/upkeep-cost-effects.js` (nouvel effet `destroyUnlessPay { alternatives: [{mana}, {life}] }`), `costs/cost-system.js` (coût « engager un terrain »), `choice-service.js`.
- **Cartes** : Erosion (détruire le terrain sauf si {1} ou 1 PV), **Stasis** (sacrifier sauf si {U} à l'entretien : probablement donnée seule, ◻), Power Sink (X, ou engager des terrains), Power Leak, Farmstead, Kudzu ◻.

### M6 — Choix par l'ADVERSAIRE (ou par un joueur précis)  — **à étendre** ◻
- **Constat** : `ChoiceService.request({ controller })` accepte un contrôleur, mais l'IA répond par défaut ; aucune carte ne désigne un autre chooser.
- **Fichiers** : `choice-service.js` (paramètre `chooser`), `effects/upkeep-cost-effects.js`.
- **Cartes** : Demonic Hordes (terrain sacrifié choisi par un adversaire), Juxtapose, Black Vise (inutile à 2 joueurs).

### M7 — Marqueurs : poser sur une CIBLE, coût d'exil depuis le CIMETIÈRE  — **partiel** ✔
- **Constat** : `addCounter` (`effects/atomic-effects.js`) ne cible que la source ou la créature enchantée (`target: 'enchanted'`) ✔ ; les marqueurs `+n/+m` sont déjà lus par les couches ✔.
- **Fichiers** : `effects/atomic-effects.js` (`addCounter` : accepter une cible choisie `ctx.targetInfo`, et `counterFrom: 'exiledManaValue'`), `costs/cost-system.js` (étendre `exile: { zone: 'graveyard', type: 'Creature', choose }`), `native-engine.js` (même flux de choix que le sacrifice/exil du champ de bataille, lot G22).
- **Cartes** : **Armor Thrull** (jouable : `{T}`, sacrifice : marqueur +1/+2 sur la cible), **Necropolis** (jouable : exiler une créature du cimetière → X marqueurs +0/+1), Tetravus (retirer des marqueurs → jetons), Merseine (marqueurs « filet » ; ne se dégage pas ; payer le coût de mana de la créature), Spirit Shackle, Rock Hydra, Triskelion, Primordial Ooze, etc. (40 cartes à marqueurs non jouables).

### M8 — Animation temporaire d'un permanent (« devient une créature jusqu'à la fin du tour »)  — **absente** ◻
- **Fichiers** : `continuous-effects.js` (couche 4 : `changeType` temporaire ; couche 7b : `setPowerToughness` temporaire, portés par une liste `perm.tempEffects`), `turn/turn-manager.js` (retirer `tempEffects` au nettoyage), `effects/token-historical-effects.js` (nouvel effet `becomeCreatureUntilEnd`).
- **Attention** : l'endroit où `tempBuffs` est vidé en fin de tour n'a pas été localisé ce jour (introuvable par `untilEndOfTurn` dans `turn-manager.js`) ◻ : le trouver avant d'ajouter `tempEffects` au même endroit ; règle du mal d'invocation d'un terrain animé (`enteredTurn`, `turn-manager.js` l. ~369 ✔).
- **Cartes** : **Mishra's Factory** (2/2 artefact « Assembly-Worker » ; `{T}` : +1/+1 à un Assembly-Worker), Mishra's War Machine / Vodalian War Machine ◻, Gaea's Liege, Jade Statue, Ashnod's Transmogrant, Titania's Song, Magnetic Mountain ◻.

### M9 — Force de base TEMPORAIRE  — **absente** ◻
- **Fichiers** : `continuous-effects.js` (`applyPTSet`, couche 7b : lire `perm.tempSetPower`), nouvel effet `setBasePowerUntilEnd` (dans `effects/extended-effects.js`) avec cible `requireKeyword: 'flying'` (déjà lu ✔ côté cible).
- **Cartes** : Island of Wak-Wak (jouable : aujourd'hui inflige 1 blessure, faux).

### M10 — Blocage multiple et blocage obligatoire généralisé  — **absent** ✔
- **Constat** : aucun mécanisme « peut bloquer n'importe quel nombre de créatures » ✔.
- **Fichiers** : `combat.js` (`assignBlockers` : drapeau `canBlockAny`, validation « doit bloquer chaque attaquant si possible »), `effects/complex-effects.js` (nouvel effet `forceBlockAll` remplaçant `mustBeBlocked` pour Blaze of Glory), `app/ai-controller.js` (laisser tel quel : noter la limite).
- **Cartes** : Blaze of Glory (jouable : donne aujourd'hui +1/+1, faux) ; lié à M1 (timing).

### M11 — Mana RESTREINT (dépense réservée)  — **absent** ✔
- **Constat** : la réserve est un simple enregistrement `{C,W,U,B,R,G}` ; `payMana(player, cost, xValue)` ne connaît pas le sort payé ✔.
- **Fichiers** : `costs/mana-cost.js` (`payMana(player, cost, xValue, spellContext)` ; réserve parallèle `side.restrictedMana = [{ color, amount, spendOn: 'artifact' }]`), `native-engine.js` (`#castSpell` et `#activateAbility` passent la carte payée), `turn/turn-manager.js` (brûlure de mana et vidage aux changements de phase), `effects/atomic-effects.js` (`drainMana`, `emptyManaPool` doivent inclure la réserve restreinte), UI (affichage).
- **Cartes** : Mishra's Workshop ({T} : {C}{C}{C} pour les artefacts seulement).

### M12 — Bande (banding) : dégâts et protection partagés  — **partiel** ✔
- **Constat** : seule la validation des groupes existe (`combat.js` l. 83-86). Manquent l'assignation des dégâts de l'attaquant par le DÉFENSEUR (règle 702.22) et la protection partagée.
- **Fichiers** : `combat.js` (résolution des dégâts : si un groupe contient une créature « banding » bloquée, le défenseur répartit), `continuous-effects.js` (« bandes with other » ◻).
- **Cartes** : War Elephant, Goblin Hero, Icatian Infantry, Icatian Phalanx, Icatian Scout, Icatian Skirmishers ; option de Urza's Avenger (jouable).
- **Coût estimé** : élevé pour 6 cartes ; à placer tard.

### M13 — Prévention évoluée  — **partiel, noyau fait** ✔ (G31)
- **Fait (G31)** : boucliers corrigés dans `replacement-effects.js` (3 défauts : `addPreventionShield` PERDAIT `target` et `leave` ; un bouclier `nextMatchingDamage` disparaissait à tout événement de blessures du même camp ; il n'expirait jamais à la fin du tour — corrigé dans `turn-manager.js`) ; nouveau champ `leave: N` (« prévenez tout sauf N ») ; effets `preventDamageToYou` (Conservator), `forcefield` (choix de la source parmi les attaquantes NON bloquées via `api.combat`), `mazeOfIth` (mots-clés temporaires G26) ; Circle of Protection : `once`. **Cartes faites** : Forcefield, Conservator, Oasis, Combat Medic, Kei Takahashi, Maze of Ith.
- **Restent** : Guardian Angel (prévention ACTIVABLE par `{1}` jusqu'à la fin du tour : capacité accordée au joueur, `state.temporaryAbilities`), Kry Shield, Amulet of Kroog, Rakalite (renvoi en main à la fin du tour : effet différé `returnToHand`), Argivian Blacksmith (cible artefact-créature), Healing Salve / Balm of Restoration (modaux, M4), Alabaster Potion (X), Horn of Deafening, Lady Evangela, Delif's Cube, Island Sanctuary (remplacement de pioche + restriction d'attaque ; texte de la base faux), Marble Priest, Uncle Istvan, Wall of Vapor/Shadows/Putrid Flesh (statiques). **Vérifier** Healing Salve (statut « implemented » mais le mode « prévenez 3 blessures » semble absent).
- **Constat** : `preventDamage` (`replacement-effects.js`) et les effets `preventNextDamageFrom*` existent ✔. Manquent : prévention « les X prochaines blessures à une cible quelconque », réduction à un plafond (« ramenez à 1 »), prévention **activable** à l'instant jusqu'à la fin du tour, remplacement de l'étape de pioche.
- **Fichiers** : `replacement-effects.js` (type de remplacement `reduceTo`, bouclier de joueur/permanent avec montant), `effects/replacement-card-effects.js` (nouveaux effets), `native-engine.js` (capacité **temporairement accordée à un joueur** : `state.temporaryAbilities`, à énumérer par le moteur d'actions).
- **Cartes** : **Guardian Angel** (jouable : donne aujourd'hui un bouclier de régénération, faux), Forcefield, Conservator, Island Sanctuary, Kry Shield, Amulet of Kroog, Rakalite, Maze of Ith, etc. (35 cartes de prévention non jouables).

### M14 — Contrôle lié à une durée / à une condition  — **partiel** ✔
- **Constat** : `stealCreature`, `stealCreatureUntilEnd`, `state.delayedControl`, `ZoneManager.changeController` existent ✔ ; manque le contrôle « tant que [condition] » réévalué en continu.
- **Fichiers** : `continuous-effects.js` (couche 2, condition `whileSourceTapped` / `whilePowerAtMost`), `state-based-actions.js` (restituer le contrôle quand la condition tombe).
- **Cartes** : Old Man of the Sea, Aladdin, Ghazbán Ogre, Juxtapose (échange), Willow Satyr, Rubinia Soulsinger, Seasinger, Preacher, Thrull Champion, Scarwood Bandits, The Wretched, Disharmony, Glyph of Reincarnation, Gauntlets of Chaos, Safe Haven, Bronze Tablet.

### M15 — Aura qui cible une carte du CIMETIÈRE  — **absente** ◻
- **Fichiers** : `native-engine.js` (`#enumerateTargets` : zone `graveyard`), `zone-manager.js` (placement de l'Aura sur la carte revenue).
- **Cartes** : Animate Dead (réanimation + −1/−0 ; `reanimate` existe ✔).

### M16 — Copies spécialisées  — **partiel** ◻
- **Fichiers** : `layers/copy-effects.js`, `stack.js` (copie de sort avec exception de couleur).
- **Cartes** : Fork (jouable : la copie doit être ROUGE), Vesuvan Doppelganger (jouable : copie sauf la couleur + capacité d'entretien accordée), Copy Artifact, Dance of Many.

### M17 — Sort ciblant un sort OU un permanent (changement de couleur)  — **partiel** ◻
- **Fichiers** : `native-engine.js` (`#isLegalTarget` : accepter `permanentOrSpell` ✔ côté restriction), `effects/complex-effects.js` (`changeColor` : appliquer à `item.card.color` sur la pile).
- **Cartes** : Purelace (jouable), Thoughtlace, Deathlace, Chaoslace, Sleight of Mind.

### M18 — Dégâts répartis  — **absents** ✔
- **Fichiers** : `native-engine.js` (cibles multiples avec répartition choisie), `choice-service.js` (choix `divide`), `effects/atomic-effects.js` (`damageDivided`).
- **Cartes** : Fireball (jouable ou non selon statut ◻), Pyrotechnics, Raging River ◻, Timber Wolves ◻.

### M19 — Révélation / consultation de la main adverse  — **absente** ✔
- **Fichiers** : `choice-service.js` (choix en lecture seule), `effects/choice-effects.js` (effet `revealHand`), UI (`ui/game-ui.js`).
- **Cartes** : Word of Command, Glasses of Urza, Sindbad, Land Tax, Field of Dreams, Revelation, Nebuchadnezzar, Firestorm Phoenix ◻.

### M20 — Mélange et ordre au choix (bibliothèque)  — **partiel** ◻
- **Fichiers** : `effects/choice-effects.js` (`lookTopTarget` : choix de la bibliothèque ciblée, ordre des cartes, mélange facultatif ; `stack/trigger-ordering.js` montre qu'un choix d'ordre existe déjà ✔).
- **Cartes** : Natural Selection (jouable).

### M21 — Lancers de pièce dans les déclencheurs et les capacités  — **partiel** ✔
- **Constat** : le lancer de pièce existe (Bottle of Suleiman) ; manquent les déclencheurs sur attaque / blocage (voir M2).
- **Cartes** : Mijae Djinn, Ydwen Efreet, Goblin Artisans, Goblin Kites, Orcish Captain, Mana Clash.

### M22 — Mise (ante)  — **absente** ✔ — **décision de conception requise**
- **Cartes** (6, texte vérifié) : Contract from Below, Darkpact, Demonic Attorney, Jeweled Bird, Tempest Efreet, Rebirth.
- **Option A** : jamais implémentées (statut « non jouable par conception »). **Option B** : zone `ante` (`zone-manager.js` : `ZONES`), procédure de début de partie (`game-facade.js`), règle « jouer pour la mise » (échec du banc IA possible). Recommandation : option A.

### M23 — Tour supplémentaire / saut de tour  — **fait** ✔ (lots G24 et G25)
- Tour supplémentaire : `extraTurn` alimente `state.extraTurnQueue`, consommée par `turn/turn-manager.js` (`#startNewTurn`), reprise via `state.resumeAfterExtra` (y compris extra pris pendant le tour adverse).
- Saut de tour : statique `skipTurnIfTapped` + choix `skipTurn` posé avant le début du tour (Time Vault). Limite : l'IA ne saute jamais.
- Reste : ruling « le tour supplémentaire le plus récent d'abord » (FIFO aujourd'hui, sans effet à un seul joueur).

## 3. Cartes JOUABLES dont le comportement diffère encore de l'Oracle

*(Stasis, Brass Man et Lifeforce ont été retirées du tableau : corrigées au lot G24.)*

| Carte | Écart | Mécanique | Fichier(s) à modifier | Nature | Preuve |
|---|---|---|---|---|---|
| Erosion | PV perdus au lieu de « détruisez le terrain sauf si {1} ou 1 PV » | M5 | `effects/upkeep-cost-effects.js` + données | nouvel effet `destroyUnlessPay` | ✔ données lues |
| Power Sink | X ou engager des terrains | M5 | `effects/choice-effects.js`, `cost-system.js` | variante de `counterUnlessPay` avec terrains | ◻ |
| Island of Wak-Wak | 1 blessure au lieu de « force de base 0 » | M9 | `continuous-effects.js`, `extended-effects.js` | effet `setBasePowerUntilEnd` | ✔ données lues |
| Blue / Red Elemental Blast | mode unique ; créature seulement | M4 | `native-engine.js`, `choice-service.js`, `stack.js` | modes + cible par mode | ✔ données lues |
| Guardian Angel | bouclier de régénération (faux) | M13 | `native-engine.js` (`state.temporaryAbilities`) | prévention de X blessures, ACTIVABLE `{1}` jusqu'à la fin du tour (noyau de boucliers prêt depuis G31) | ✔ données lues |
| Smoke | aucune créature dégagée au lieu d'une seule | #runUntap | `turn/turn-manager.js` | `cantUntapCreatures` → `max: 1` avec choix | ✔ code lu |
| Winter Orb | terrain dégagé choisi **automatiquement** | #runUntap | `turn/turn-manager.js` | remplacer le « premier terrain » par un choix | ✔ code lu |
| Abu Ja'far | détruit le tueur au lieu des bloqueurs/bloqués | combat | `state-based-actions.js`, `stack.js` (payload `creatureDied`), `combat.js` | joindre `combatPartners` à l'événement ; effet `destroyCombatPartners` sans régénération | ✔ payload lu |
| Earthbind | retire le vol sans condition ni 2 blessures | trigger | `triggers/trigger-collector.js`, `continuous-effects.js` | condition `enchantedHasKeyword` + drapeau de source | ◻ |
| Armor Thrull | bonus temporaire au lieu d'un marqueur +1/+2 | M7 | `atomic-effects.js` (`addCounter` ciblé) + données | sacrifice de soi + marqueur sur cible | ✔ |
| Necropolis | force = cimetière | M7 | `cost-system.js`, `atomic-effects.js` | exil depuis le cimetière → X marqueurs +0/+1 | ✔ |
| Demonic Hordes | pas de `{T}` : détruire un terrain ; choix adverse | M6 | `effects/upkeep-cost-effects.js` + données | `{T}` + terrain choisi par l'adversaire + engager à l'entretien | ✔ données lues |
| Goblin Flotilla | `{R}` : +1/+1 | M2 | `trigger-engine.js`, `combat.js` | déclencheur de combat avec paiement | ✔ |
| Chaos Orb | destruction aléatoire | **décision** | — | simulation du lancer à définir (voir § 5) | ✔ |
| Tetravus | effet fixe | M7 | `atomic-effects.js` | marqueurs +1/+1, retrait au choix, jetons volants | ✔ |
| Vesuvan Doppelganger | copie simplifiée | M16 | `layers/copy-effects.js` | exceptions de couleur et capacité accordée | ◻ |
| Worms of the Earth | clause d'entretien absente ; « aucun terrain ne peut entrer » | transverse | `zone-manager.js`, `effects/upkeep-cost-effects.js` | interdiction à l'entrée de zone + choix de **chaque** joueur | ◻ |
| Natural Selection | regarde seulement | M20 | `effects/choice-effects.js` | cible, réordonner, mélange facultatif | ◻ |
| Fork | copie non rouge | M16 | `stack.js` | exception de couleur | ◻ |
| Purelace | cible un permanent seulement | M17 | `native-engine.js`, `complex-effects.js` | cible un sort sur la pile | ◻ |
| Blaze of Glory | donne +1/+1 (faux) ; timing fait (G29) | M10 | `combat.js` | `forceBlockAll` (une créature peut bloquer plusieurs attaquants ; doit tous les bloquer) | ✔ |
| Drain Power | prend le mana non utilisé | transverse | `effects/atomic-effects.js` (`drainMana`) | forcer d'abord toutes les capacités de mana de la cible | ◻ |
| Merseine | « ne peut pas attaquer » | M7 | `turn-manager.js`, `cost-system.js` | marqueurs « filet » ; ne se dégage pas ; coût = coût de mana de la créature | ✔ |
| Mishra's Workshop | non implémentée | M11 | `mana-cost.js`, `native-engine.js`, `turn-manager.js` | mana restreint | ✔ |
| Mishra's Factory | non implémentée | M8 | `continuous-effects.js`, `token-historical-effects.js` | animation jusqu'à la fin du tour | ✔ |
| City of Brass | utilise l'ancien chemin de blessures | `permanentTapped` | données | migrer vers l'événement `permanentTapped` (optionnel) | ◻ |
| Black Vise | « choisissez un adversaire » absent | — | **aucun changement à 2 joueurs** | — | ✔ |

## 4. Cartes NON jouables : familles à implémenter (noms exacts)

**Auras restantes (18)** — Animate Artifact, Phantasmal Terrain, Animate Dead, Aspect of Wolf, Instill Energy, Kudzu, Living Artifact, Power Artifact, Equinox, Anti-Magic Aura, Dream Coat, Puppet Master, Venarian Gold, Imprison, Takklemaggot, Cocoon, Thrull Retainer, Tourach's Gate.
- Sous-familles et fichiers : **restrictions de combat et de ciblage : faites au lot G26** (Demonic Torment, Gaseous Form, Brainwash, Seeker, Artifact Ward, Spirit Shackle, Spectral Cloak ; mots-clés `nocombatdamagedealt/received`, `attacktaxN`, `seekerevasion`, `protectionartifacts`, condition `whileHostUntapped`) ; reste Imprison ◻ ; **auras de terrain** : **faites au lot G27** (Consecrate Land, Farmstead, Goblin Shrine) ; restent Tourach's Gate, Phantasmal Terrain (changement de type de terrain, couche 4), Equinox, Kudzu (rattachement choisi), Living Artifact (enchante un ARTEFACT, pas un terrain : le texte de la base est faux) ; **« devient engagé »** (Artifact Possession, Relic Bind) → **faits au lot G24** (condition `enchantedBecomesTapped` ✔ + effet `chooseDamageOrGain` + restriction `opponentsArtifact`) ; **animation** (Animate Artifact, Living Artifact ◻) → M8 ; **marqueurs / entretien** (Power Leak, Spirit Shackle, Takklemaggot, Venom) → M7/M5.
- Méthode : le harnais `tests/lib/scenario.mjs` + contrat d'aura `test-v12-123` (table `OPTIONS`).

**Contrôle (16)** — voir M14. **Jetons (21)** — Lich, The Hive, Rukh Egg, City in a Bottle, Golgothian Sylex, Ivory Guardians, Beasts of Bogardan, Arboria, Master of the Hunt, Boris Devilboon, Hazezon Tamar, Stangg, Serpent Generator, Dance of Many, Nameless Race, Homarid Spawning Bed, Breeding Pit, Goblin Warrens, Elvish Farmer, Night Soil, Thallid → `createToken` existe ✔ (`effects/token-historical-effects.js`) : surtout des données et des déclencheurs.
**Récursion de zone (21)** — Lich, Nether Shadow, Library of Leng, Argivian Archaeologist, Drafna's Restoration, Reconstruction, Urza's Miter, Petra Sphinx, Recall, All Hallow's Eve, Hell's Caretaker, Tempest Efreet, Glyph of Reincarnation, Reincarnation, Adun Oakenshield, Knowledge Vault, Triassic Egg, Frankenstein's Monster, Nameless Race, Skull of Orm, Night Soil → `returnFromGraveyard`, `reanimate` existent ✔ ; manques : choix de carte du cimetière avec filtre, dépense de marqueurs (M7).
**Main adverse (9)** — voir M19. **Dégâts répartis (15)** — voir M18. **Bande (6)** — voir M12.
**72 cartes sans statut** : à sonder carte par carte en vraie partie avant toute certification (test-v12-83 interdit les cartes à texte sans statut).

## 5. Décisions à prendre (par toi)

1. **Ante (M22)** : option A (jamais) ou B (zone `ante`).
2. **Chaos Orb** : le lancer physique n'a pas d'équivalent exact ; proposition : « détruisez un nombre aléatoire (0 à 3) de permanents non-jeton, choisis au hasard, puis détruisez Chaos Orb » avec graine `rngClock` ; ou laisser `unimplemented`.
3. **Winter Orb / Smoke** : confirmer que le choix du terrain/de la créature dégagée doit être un vrai choix pour le joueur humain (l'IA : premier candidat).
4. **Bande (M12)** : 6 cartes seulement ; à implémenter avant ou après les 35 auras ?
5. **Faux positifs de la relecture Perplexity** : régénérer `ecarts-jouables.txt` face aux données du moteur (la liste actuelle est obsolète sur au moins 12 cartes déjà alignées).

## 6. Ordre de travail proposé

1. ~~Données seules : Stasis, Brass Man, Lifeforce, Artifact Possession, Relic Bind, Time Vault~~ **faits (lots G24 et G25)**.
2. **Petits correctifs moteur** : Smoke et Winter Orb (choix), M9 (Wak-Wak), M7 (Armor Thrull, Necropolis), Fork/Purelace (M16/M17).
3. **Socle de combat** : M2 puis M3 puis M1 → Erg Raiders, Siren's Call, Nettling Imp, Goblin Flotilla, Mijae Djinn, Ydwen Efreet, Abu Ja'far.
4. **Modes et paiement** : M4 (Elemental Blasts), M5 (Erosion, Power Sink, Power Leak).
5. **Mana restreint et animation** : M11 (Workshop), M8 (Factory).
6. **Auras par familles** (harnais) puis contrôle (M14), prévention (M13), bande (M12), dégâts répartis (M18), main adverse (M19).

**Protocole inchangé pour chaque lot** : sonder en vraie partie → texte officiel (Oracle) → scénario qui échoue → correction → test vert → mutation réintroduite (doit être attrapée) → suite complète → banc → zip retesté depuis un dézip vierge → rapport + `CHANGELOG.md`.
