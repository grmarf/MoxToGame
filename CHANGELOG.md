# Journal des versions MoxToGame (moteur v12)

Source : titre de chaque rapport (docs/reports, ou docs/archive/deliverables pour 53–55). Le détail est dans le rapport lié.

Rapports de livraison : `docs/reports/` · diffs, sorties de tests et anciens livrables : `docs/archive/`.

- **v12.76** — Lots G2 (restrictions de combat, 9 cartes, correctif jetons), G3 (cartes « terrains », 8 cartes, correctif dynamicPT) G4 (blessures, 3 cartes), G5 (mana simple, 13 cartes, primitive « arrive engagé », premier test paramétré) G6 (dégâts à cible avec {T}, 10 cartes, correctifs du coût de sacrifice) G7 (destruction / exil avec {T}, 11 cartes) G8 (bonus de force/endurance et mots-clés avec {T}, 10 cartes, primitive « linceul ») et lot « unification » (fin des dérogations par nom, 2 tests bloquants, dette de types révélée, correction de Goblin War Drums, Bottle of Suleiman et Copper Tablet) et G9 (mana au choix et conditionnel : Black Lotus, Implements of Sacrifice, City of Brass, terrains d'Urza, Fellwar Stone, Rainbow Vale) et G10 (terrains à seconde capacité : Strip Mine, Library of Alexandria, Pendelhaven, Desert, Hammerheim, Tolaria, Urborg ; revalidation des cibles à la résolution) et G11 (Mana Vault, Basalt Monolith, cinq Mana Batteries ; production multiple corrigée) et G12 (cinq terrains de stockage : choix « ne pas dégager ») et G13 (Priest of Yawgmoth : sacrifice d'artefact au choix) et G14 (harnais de scénarios + contrat d'aura : 11 auras certifiées, 8 défauts corrigés dont Fear, Web et les Wards) et G15 (Curse Artifact, Divine Transformation, Wild Growth ; l'IA déclare les attaquants obligatoires) et G16 (événement `permanentTapped` « devient engagé » : Psychic Venom, Blight) et G17 (supertypes Legendary/World, indicateur de couleur des Kobolds, règle des Mondes, Karakas) et G18 (alignement sur l'Oracle de 13 cartes jouables : Army of Allah, Holy Light, Living Lands, Kormus Bell, Riptide, Keldon Warlord, Bog Rats, Land Leeches, Carnivorous Plant, Stone-Throwing Devils, Goblin King, Lord of Atlantis, Martyr's Cry) et G19 (cibles de joueur : Ancestral Recall, Braingeyser, Mind Twist ; Fissure créature ou terrain sans régénération) et G20 (Haunting Wind 1 blessure et « devient engagé », Creature Bond = endurance, Terror sans régénération et restriction non-noire/non-artefact enfin appliquée, Icy Manipulator) et G21 (alignement Oracle : Staff of Zegon, Svyelunite Priest, Tunnel, Tawnos's Wand, Urza's Avenger, Tracker, Ruins of Trokair, Scarwood Hag, Volcanic Eruption ; Warp Artifact texte) et G22 (City of Shadows : exil d'une créature en coût avec vrai choix, mana par marqueur sans retrait) et G23 (Winter Orb « tant que dégagé » ; Goblin Caves : Enchanter terrain, +0/+2 aux Gobelins si Montagne de base) et G24 (Time Walk : tour supplémentaire enfin réel ; Stasis, Brass Man, Lifeforce, Artifact Possession, Relic Bind alignés sur l'Oracle) et G25 (Time Vault : saut de tour avec vrai choix, tour supplémentaire) et G26 (7 Auras de combat et de ciblage : Gaseous Form, Demonic Torment, Seeker, Brainwash, Artifact Ward, Spirit Shackle, Spectral Cloak) et G27 (Auras de terrain : Consecrate Land avec `indestructible`, Farmstead, Goblin Shrine ; événement `permanentLeft`) et G28 (Venom, Infinite Authority, Farrel's Mantle, Backfire, Power Leak ; événements de blocage, effets différés de fin de combat ; correctif de l'énumération des cibles de l'IA) et G29 (M1 : restrictions de timing des sorts ; Reset, Teleport, Rapid Fire, Berserk, Siren's Call) et G30 (Erg Raiders, Nettling Imp ; capacités à fenêtre de timing) et G31 (M13 : correction du moteur de boucliers de prévention ; Forcefield, Conservator, Oasis, Combat Medic, Kei Takahashi, Maze of Ith) et G32 (comparaison de TOUTE la base à l'Oracle Scryfall : structure alignée ; 12 cartes jouables fausses corrigées dont Iron Star et ses 4 sœurs, Howling Mine, Tangle Kelp, Dragon Whelp, Desert Nomads, Amrou Kithkin) → `docs/reports/V12.76-REPORT.md`, `docs/RAPPORT-ECARTS-ORACLE.md`
- **v12.75** — Chantier 2, lots A à G (créatures vanille / mots-clés, Auras simples, seigneurs et effets globaux, sorts simples, sorts calculés, cartes sans statut) → `docs/reports/V12.75-REPORT.md`
- **v12.74** — Chantier 3 : banc IA-vs-IA à graine fixe avec invariants → `docs/reports/V12.74-REPORT.md`
- **v12.73** — Chantier 1 : derniers trous connus du moteur → `docs/reports/V12.73-REPORT.md`
- **v12.72** — Chemin unique pour les zones et les dégâts → `docs/reports/V12.72-REPORT.md`
- **v12.71** — Vrai choix du joueur pour counterUnlessPay (Force Spike / Power Sink) → `docs/reports/V12.71-REPORT.md`
- **v12.66** — Rapport de livraison → `docs/reports/V12.66-REPORT.md`
- **v12.65** — BUG-02 (Prompt Q) : dernier site de dégâts non protégé → `docs/reports/V12.65-REPORT.md`
- **v12.64** — AUDIT-03 — Rapport de livraison → `docs/reports/V12.64-REPORT.md`
- **v12.63** — AUDIT-01 REPORT → `docs/reports/V12.63-REPORT.md`
- **v12.62** — AUDIT-05 REPORT → `docs/reports/V12.62-REPORT.md`
- **v12.61** — AUDIT-06 REPORT → `docs/reports/V12.61-REPORT.md`
- **v12.60** — BUG-02 report → `docs/reports/V12.60-REPORT.md`
- **v12.59** — BUG-04 : correspondance générique des conditions de → `docs/reports/V12.59-REPORT.md`
- **v12.58** — AUDIT-15 : State-Based Actions rendues itératives → `docs/reports/V12.58-REPORT.md`
- **v12.57** — BUG-03 : checkStateBasedDeaths branché sur les vraies → `docs/reports/V12.57-REPORT.md`
- **v12.55** — Prompt L report → `docs/archive/deliverables/v12_55/V12.55-REPORT.md`
- **v12.54** — Régénération vs endurance ≤ 0 → `docs/archive/deliverables/v12_54/V12.54-REPORT.md`
- **v12.53** — mana burn authentique → `docs/archive/deliverables/v12_53/V12.53-REPORT.md`
- **v12.50** — Prompt F / Cartes batch 4 → `docs/reports/V12.50-BATCH4-REPORT.md`
- **v12.49** — limite d'activation par tour → `docs/reports/V12.49-REPORT.md`
- **v12.46** — Batch 2 : capacités activées simples → `docs/reports/V12.46-REPORT.md`
- **v12.45** — capacités activées avec choix réels → `docs/reports/V12.45-ACTIVATED-CHOICES-REPORT.md`
- **v12.43** — ChooseColor Continuation Report → `docs/reports/V12.43-CHOOSE-COLOR-CONTINUATION-REPORT.md`
- **v12.42** — Prompt 08 → `docs/reports/V12.42-SEARCH-LIBRARY-CONTINUATION-REPORT.md`
- **v12.41** — Choice Continuation Report → `docs/reports/V12.41-CHOICE-CONTINUATION-REPORT.md`
