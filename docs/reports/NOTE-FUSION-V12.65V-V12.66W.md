NOTE-FUSION-V12.65V-V12.66W.md — Fusion des livraisons Prompt V (AUDIT-08)
et Prompt W (hasProtectionFromColors unifié)

CONSTAT
Les deux zips fournis par l'utilisateur (MoxToGame-v12_65-AUDIT-08-corrige.zip
pour le Prompt V, puis MoxToGame-v12_66-hasprotectionfromcolors-unifie.zip
pour le Prompt W) partaient tous les deux de la MÊME base
(MoxToGame-v12_65-damageandgain-protection.zip, la livraison de Claude pour
BUG-02/Prompt Q) -- ce ne sont pas deux étapes séquentielles mais deux
BRANCHES DIVERGENTES du même point de départ. Le zip W, en particulier, ne
contient PAS les corrections du Prompt V (createToken et pioche initiale
routés via ZoneManager) : `stack.js#createToken` et
`native-engine.js#loadDeck` y sont restés dans leur état d'avant le Prompt
V. Appliquer W tel quel aurait fait perdre silencieusement le travail de V.

VÉRIFICATION FAITE AVANT FUSION
- Prompt V (zip MoxToGame-v12_65-AUDIT-08-corrige.zip) : vérifié authentique
  par lecture directe du code (createToken et loadDeck routés via
  ZoneManager avec repli conditionnel identique au patron déjà en place
  ailleurs) + test réel passant par le vrai moteur (pushSpell/resolveTop).
  Les 4 sites `catch` initialement suspectés par Claude n'étaient en
  réalité que 2, et les deux étaient déjà conformes avant cette mission --
  le rapport le dit honnêtement.
- Prompt W (zip MoxToGame-v12_66-hasprotectionfromcolors-unifie.zip) :
  vérifié authentique par lecture directe du code (méthode
  `hasProtectionFromColors` supprimée de `buildApi` dans stack.js, les deux
  appelants d'atomic-effects.js migrés vers l'import direct de
  continuous-effects.js) + test réel passant par le vrai moteur, ancré sur
  deux cartes réelles avec protection intrinsèque (White Knight/protectionB
  contre Pestilence, Serra Angel/protectionG ajoutée contre Hurricane).
  Option A choisie (suppression de la version dupliquée), conformément à la
  recommandation du prompt.

FUSION EFFECTUÉE PAR CLAUDE
Diff exhaustif entre les deux zips : les seules divergences de code
touchaient stack.js (à deux endroits non chevauchants : createToken pour V,
la méthode hasProtectionFromColors pour W) et atomic-effects.js (les deux
lignes d'appel migrées par W, sans rapport avec les changements de V).
Fusion appliquée sur la base du zip V (qui contient déjà native-engine.js
corrigé) :
1. Suppression de la méthode `hasProtectionFromColors` de `buildApi`
   (stack.js), exactement comme dans le zip W -- le reste de stack.js
   (dont la correction createToken de V) reste inchangé.
2. Migration des deux appels d'atomic-effects.js (lignes ~151 et ~470) vers
   l'import direct, identique caractère pour caractère au zip W.
3. Ajout du test tests/test-v12-66-hasprotectionfromcolors-unifie.mjs
   (copié tel quel depuis le zip W) en plus du test
   tests/test-v12-65-zonemanager-tokens-draw.mjs déjà présent (zip V).

Un diff complet post-fusion contre le zip W confirme que les seules
différences restantes sont : native-engine.js et stack.js#createToken
(les deux corrections du Prompt V, absentes de W), et la présence du
fichier de test du Prompt V -- aucune perte, aucun ajout non désiré.

PREUVE
`npm test` intégral sur la base fusionnée : 133 fichiers, exit 0.
Les deux tests des missions concernées passent individuellement :
node tests/test-v12-65-zonemanager-tokens-draw.mjs → exit 0
node tests/test-v12-66-hasprotectionfromcolors-unifie.mjs → exit 0
Recherche exhaustive d'un appel résiduel à l'ancienne API :
`grep -rn "api.hasProtectionFromColors" src/` → aucune occurrence.

RECOMMANDATION POUR LA SUITE
Les deux prochaines IA (ou instances) qui reprennent ce projet en parallèle
devraient systématiquement partir du DERNIER zip livré et vérifié, jamais
d'un zip antérieur -- pour éviter que ce genre de divergence silencieuse
ne se reproduise. Envisager de faire figurer le numéro de version réel
dans package.json (actuellement resté à 12.46.0 depuis plusieurs missions,
signalé mais jamais corrigé faute d'autorisation de périmètre) pour rendre
ce genre de décalage plus visible d'un coup d'œil.
