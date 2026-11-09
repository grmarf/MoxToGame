# Écarts entre la base MoxToGame et l'Oracle Scryfall (lot G32, 30/10/2026)

Méthode : l'export Scryfall filtré (1118 cartes : extensions Alpha à Homelands + cartes de la base ; script `scryfall_filtre_mobile.py`) est comparé par script à la base (985 cartes).

## 1. Structure : base identique à Scryfall
Après les corrections de ce lot : **0 écart** de coût de mana, valeur de mana, couleurs, types, sous-types, supertypes, force et endurance sur les 985 cartes. Corrections faites : 31 cartes Légendaires et 6 Mondes manquants (la liste Perplexity de G17 était incomplète), Invoke Prejudice n'est pas un Monde, Kobolds of Kher Keep est rouge, Dragon Engine = Dragon Construct, Nameless Race sans sous-type. Les 115 cartes de Homelands n'existent pas dans la base (hors périmètre jusqu'ici).

## 2. Mots-clés
Après normalisation : 6 cartes différentes, toutes corrigées ou expliquées (Pirate Ship, Demonic Hordes, Argothian Pixies : `flying` retiré ; Amrou Kithkin : `banding` retiré ; Desert Nomads : `mountainwalk` et `protectionU` retirés ; Living Wall : `regenerate` est une capacité activée, pas un mot-clé).

## 3. Cartes « jouables » dont l'effet ne suivait PAS l'Oracle (corrigées au lot G32)
| Carte | Défaut | Correction |
|---|---|---|
| Iron Star | effet entièrement faux (prévention de blessures rouges) | déclencheur « sort rouge : payez {1}, gagnez 1 PV » |
| Crystal Rod, Ivory Cup, Throne of Bone, Wooden Sphere | non implémentées (même mécanisme qu'Iron Star) | implémentées (bleu, blanc, noir, vert) |
| Ironclaw Orcs | seuil de force 3 au lieu de 2 | force 2 ou plus |
| Celestial Prism | coût {3} au lieu de {2} | {2}, {T} |
| Howling Mine | tous les joueurs piochaient, au profit du contrôleur, même engagée | « ce joueur » pioche, seulement si dégagée |
| Amrou Kithkin | `banding` + « bloquée par plus d'une créature » (inventé) | « ne peut pas être bloquée par une créature de force 3 ou plus » |
| Invisibility | effet `cantBlock` (sémantique différente) | « bloquée seulement par des Murs » (mot-clé d'Aura) |
| Tangle Kelp | « ne peut pas attaquer » (faux) | engagée à l'arrivée ; ne se dégage pas si elle a attaqué lors du dernier tour |
| Dragon Whelp | clause « sacrifiez-le à partir de 4 activations » absente | sacrifice différé à la prochaine étape de fin |
| Desert Nomads | `mountainwalk` et `protectionU` inventés | Desertwalk + prévention des blessures des Déserts |
| Demonic Hordes | `flying` inventé ; capacité `{T}` : détruisez un terrain ABSENTE | corrigés (la clause d'entretien à choix adverse reste M6) |
| Pirate Ship, Argothian Pixies | `flying` inventé | retiré |

## 4. Cartes jouables encore signalées par l'heuristique (82), À EXAMINER
L'heuristique compare les nombres, le timing de lancer, la présence d'une capacité `{T}` et les verbes de l'Oracle aux données de la base. **Beaucoup de signalements sont de faux positifs** (capacités de mana déclarées par `produces`, mots-clés d'évasion, reminder text, `regenerate`/`untap` portés par un effet sous un autre nom). « Ne peut pas être régénérée » a été vérifié en partie réelle pour Wrath of God, Fissure et Tunnel : correct.

| Carte | Signalement | Oracle (début) |
|---|---|---|
| Reverse Damage | Oracle « gain » sans trace dans la base | The next time a source of your choice would deal damage to you this turn, prevent that damage. You gain life e |
| White Knight | Oracle « deals » sans trace dans la base | First strike (This creature deals combat damage before creatures without first strike.) / Protection from blac |
| Wrath of God | Oracle « regenerate » sans trace dans la base | Destroy all creatures. They can't be regenerated. |
| Blue Elemental Blast | Oracle « counter target » sans trace dans la base | Choose one — / • Counter target red spell. / • Destroy target red permanent. |
| Jump | Oracle « gain » sans trace dans la base | Target creature gains flying until end of turn. |
| Lord of Atlantis | Oracle « can't be blocked » sans trace dans la base | Other Merfolk get +1/+1 and have islandwalk. (They can't be blocked as long as defending player controls an Is |
| Mahamoti Djinn | Oracle « can't be blocked » sans trace dans la base | Flying (This creature can't be blocked except by creatures with flying or reach.) |
| Siren's Call | Oracle « destroy » sans trace dans la base | Cast this spell only during an opponent's turn, before attackers are declared. / Creatures the active player c |
| Timetwister | nombres Oracle absents de la base: [7]; Oracle « draws » sans trace dans la base | Each player shuffles their hand and graveyard into their library, then draws seven cards. (Then put Timetwiste |
| Black Knight | Oracle « can't be blocked » sans trace dans la base | First strike (This creature deals combat damage before creatures without first strike.) / Protection from whit |
| Bog Wraith | Oracle « can't be blocked » sans trace dans la base | Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.) |
| Drudge Skeletons | Oracle « destroy » sans trace dans la base | {B}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remo |
| Fear | Oracle « can't be blocked » sans trace dans la base | Enchant creature (Target a creature as you cast this. This card enters attached to that creature.) / Enchanted |
| Nettling Imp | Oracle « destroy » sans trace dans la base | {T}: Choose target non-Wall creature the active player has controlled continuously since the beginning of the  |
| Nightmare | Oracle « can't be blocked » sans trace dans la base | Flying (This creature can't be blocked except by creatures with flying or reach.) / Nightmare's power and toug |
| Paralyze | nombres Oracle absents de la base: [4]; Oracle « untap » sans trace dans la base | Enchant creature / When this Aura enters, tap enchanted creature. / Enchanted creature doesn't untap during it |
| Terror | Oracle « regenerate » sans trace dans la base | Destroy target nonartifact, nonblack creature. It can't be regenerated. |
| Wall of Bone | Oracle « destroy » sans trace dans la base | Defender (This creature can't attack.) / {B}: Regenerate this creature. (The next time this creature would be  |
| Will-o'-the-Wisp | Oracle « destroy » sans trace dans la base | Flying (This creature can't be blocked except by creatures with flying or reach.) / {B}: Regenerate this creat |
| Burrowing | Oracle « can't be blocked » sans trace dans la base | Enchant creature / Enchanted creature has mountainwalk. (It can't be blocked as long as defending player contr |
| Earthbind | nombres Oracle absents de la base: [2]; Oracle « deals » sans trace dans la base | Enchant creature / When this Aura enters, if enchanted creature has flying, this Aura deals 2 damage to that c |
| Goblin Balloon Brigade | Oracle « gain » sans trace dans la base | {R}: This creature gains flying until end of turn. |
| Red Elemental Blast | Oracle « counter target » sans trace dans la base | Choose one — / • Counter target blue spell. / • Destroy target blue permanent. |
| Tunnel | Oracle « regenerate » sans trace dans la base | Destroy target Wall. It can't be regenerated. |
| Berserk | Oracle « destroy » sans trace dans la base | Cast this spell only before the combat damage step. / Target creature gains trample and gets +X/+0 until end o |
| Birds of Paradise | capacité avec {T} dans l'Oracle mais aucune capacité activée | Flying / {T}: Add one mana of any color. |
| Llanowar Elves | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {G}. |
| Regeneration | Oracle « destroy » sans trace dans la base | Enchant creature (Target a creature as you cast this. This card enters attached to that creature.) / {G}: Rege |
| Black Lotus | nombres Oracle absents de la base: [3]; capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}, Sacrifice this artifact: Add three mana of any one color. |
| Mana Vault | capacité avec {T} dans l'Oracle mais aucune capacité activée | This artifact doesn't untap during your untap step. / At the beginning of your upkeep, you may pay {4}. If you |
| Mox Emerald | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {G}. |
| Mox Jet | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {B}. |
| Mox Pearl | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {W}. |
| Mox Ruby | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {R}. |
| Mox Sapphire | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {U}. |
| Abu Ja'far | Oracle « regenerate » sans trace dans la base | When this creature dies, destroy all creatures blocking or blocked by it. They can't be regenerated. |
| Fishliver Oil | Oracle « can't be blocked » sans trace dans la base | Enchant creature (Target a creature as you cast this. This card enters attached to that creature.) / Enchanted |
| Dancing Scimitar | Oracle « can't be blocked » sans trace dans la base | Flying (This creature can't be blocked except by creatures with flying or reach.) |
| Flying Carpet | Oracle « gain » sans trace dans la base | {2}, {T}: Target creature gains flying until end of turn. |
| Artifact Ward | Oracle « can't be blocked » sans trace dans la base | Enchant creature / Enchanted creature can't be blocked by artifact creatures. / Prevent all damage that would  |
| Shatterstorm | Oracle « regenerate » sans trace dans la base | Destroy all artifacts. They can't be regenerated. |
| Crumble | Oracle « regenerate » sans trace dans la base | Destroy target artifact. It can't be regenerated. That artifact's controller gains life equal to its mana valu |
| Ivory Tower | Oracle « gain » sans trace dans la base | At the beginning of your upkeep, you gain X life, where X is the number of cards in your hand minus 4. |
| Tetravus | Oracle « exile » sans trace dans la base | Flying / This creature enters with three +1/+1 counters on it. / At the beginning of your upkeep, you may remo |
| Urza's Avenger | Oracle « gain » sans trace dans la base | {0}: This creature gets -1/-1 and gains your choice of banding, flying, first strike, or trample until end of  |
| Rapid Fire | Oracle « gain » sans trace dans la base | Cast this spell only before blockers are declared. / Target creature gains first strike until end of turn. If  |
| Righteous Avengers | Oracle « can't be blocked » sans trace dans la base | Plainswalk (This creature can't be blocked as long as defending player controls a Plains.) |
| Spirit Link | Oracle « gain » sans trace dans la base | Enchant creature (Target a creature as you cast this. This card enters attached to that creature.) / Whenever  |
| Devouring Deep | Oracle « can't be blocked » sans trace dans la base | Islandwalk (This creature can't be blocked as long as defending player controls an Island.) |
| Relic Bind | Oracle « gain » sans trace dans la base | Enchant artifact an opponent controls / Whenever enchanted artifact becomes tapped, choose one — / • This Aura |
| Segovian Leviathan | Oracle « can't be blocked » sans trace dans la base | Islandwalk (This creature can't be blocked as long as defending player controls an Island.) |
| Lost Soul | Oracle « can't be blocked » sans trace dans la base | Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.) |
| Syphon Soul | Oracle « gain » sans trace dans la base | Syphon Soul deals 2 damage to each other player. You gain life equal to the damage dealt this way. |
| Vampire Bats | Oracle « can't be blocked » sans trace dans la base | Flying (This creature can't be blocked except by creatures with flying or reach.) / {B}: This creature gets +1 |
| Mountain Yeti | Oracle « can't be blocked » sans trace dans la base | Mountainwalk (This creature can't be blocked as long as defending player controls a Mountain.) / Protection fr |
| Cat Warriors | Oracle « can't be blocked » sans trace dans la base | Forestwalk (This creature can't be blocked as long as defending player controls a Forest.) |
| Elven Riders | Oracle « can't be blocked » sans trace dans la base | This creature can't be blocked except by Walls and/or creatures with flying. |
| Pixie Queen | Oracle « gain » sans trace dans la base | Flying / {G}{G}{G}, {T}: Target creature gains flying until end of turn. |
| Princess Lucrezia | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {U}. |
| Riven Turnbull | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {B}. |
| Erosion | Oracle « destroy » sans trace dans la base | Enchant land / At the beginning of the upkeep of enchanted land's controller, destroy that land unless that pl |
| Bog Imp | Oracle « can't be blocked » sans trace dans la base | Flying (This creature can't be blocked except by creatures with flying or reach.) |
| Worms of the Earth | nombres Oracle absents de la base: [2, 5]; Oracle « destroy » sans trace dans la base | Players can't play lands. / Lands can't enter the battlefield. / At the beginning of each upkeep, any player m |
| Fissure | Oracle « regenerate » sans trace dans la base | Destroy target creature or land. It can't be regenerated. |
| Sisters of the Flame | capacité avec {T} dans l'Oracle mais aucune capacité activée | {T}: Add {R}. |
| Hidden Path | Oracle « can't be blocked » sans trace dans la base | Green creatures have forestwalk. (They can't be blocked as long as defending player controls a Forest.) |
| Scarwood Hag | Oracle « gain » sans trace dans la base | {G}{G}{G}{G}, {T}: Target creature gains forestwalk until end of turn. (It can't be blocked as long as defendi |
| Marsh Goblins | Oracle « can't be blocked » sans trace dans la base | Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.) |
| Necropolis | Oracle « exile » sans trace dans la base | Defender (This creature can't attack.) / Exile a creature card from your graveyard: Put X +0/+1 counters on th |
| Maze of Ith | Oracle « untap » sans trace dans la base | {T}: Untap target attacking creature. Prevent all combat damage that would be dealt to and dealt by that creat |
| Order of Leitbur | Oracle « gain » sans trace dans la base | Protection from black / {W}: This creature gains first strike until end of turn. / {W}{W}: This creature gets  |
| Merseine | nombres Oracle absents de la base: [3]; Oracle « untap » sans trace dans la base | Enchant creature / This Aura enters with three net counters on it. / Enchanted creature doesn't untap during i |
| Svyelunite Priest | Oracle « gain » sans trace dans la base | {U}{U}, {T}: Target creature gains shroud until end of turn. Activate only during your upkeep. (It can't be th |
| Order of the Ebon Hand | Oracle « gain » sans trace dans la base | Protection from white / {B}: This creature gains first strike until end of turn. / {B}{B}: This creature gets  |
| Goblin Flotilla | Oracle « gain » sans trace dans la base | Islandwalk (This creature can't be blocked as long as defending player controls an Island.) / At the beginning |
| Goblin War Drums | Oracle « can't be blocked » sans trace dans la base | Creatures you control have menace. (They can't be blocked except by two or more creatures.) |
| Bottomless Vault | Oracle « untap » sans trace dans la base | This land enters tapped. / You may choose not to untap this land during your untap step. / At the beginning of |
| Dwarven Hold | Oracle « untap » sans trace dans la base | This land enters tapped. / You may choose not to untap this land during your untap step. / At the beginning of |
| Hollow Trees | Oracle « untap » sans trace dans la base | This land enters tapped. / You may choose not to untap this land during your untap step. / At the beginning of |
| Icatian Store | Oracle « untap » sans trace dans la base | This land enters tapped. / You may choose not to untap this land during your untap step. / At the beginning of |
| Rainbow Vale | Oracle « gain » sans trace dans la base | {T}: Add one mana of any color. An opponent gains control of this land at the beginning of the next end step. |
| Sand Silos | Oracle « untap » sans trace dans la base | This land enters tapped. / You may choose not to untap this land during your untap step. / At the beginning of |

## 5. Prochaines étapes
1. Examiner la liste du § 4 par lots de 15 (vraie partie pour chaque carte douteuse). 2. Relire de la même façon les 72 → 68 cartes sans statut. 3. Ajouter Homelands (115 cartes) si le périmètre l'exige. 4. Régénérer ce rapport après chaque lot (le script de comparaison est reproductible).