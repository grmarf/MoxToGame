// MoxToGame — Base de cartes fusionnée (v12.22 candidate)
// Générée automatiquement le 2026-08-28T11:12:44.295Z
// Source : fusion Archive.zip (Scryfall) + travail moteur existant (v12.21.1)
// 12 cartes marquées needsScryfallRefetch: true nécessitent une revérification (échec de fetch original ARN/ATQ/DRK)
import { normalizeCard } from '../core/card-runtime.js';

const CARDS = [
  {
    "id": 1,
    "name": "Plains",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Basic Land",
    "subtype": "Plains",
    "rarity": "Basic",
    "produces": "W",
    "isBasic": true,
    "text_fr": "{T} : Ajoutez {W}.",
    "sets": [],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "functional"
  },
  {
    "id": 2,
    "name": "Island",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Basic Land",
    "subtype": "Island",
    "rarity": "Basic",
    "produces": "U",
    "isBasic": true,
    "text_fr": "{T} : Ajoutez {U}.",
    "sets": [],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "functional"
  },
  {
    "id": 3,
    "name": "Swamp",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Basic Land",
    "subtype": "Swamp",
    "rarity": "Basic",
    "produces": "B",
    "isBasic": true,
    "text_fr": "{T} : Ajoutez {B}.",
    "sets": [],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "functional"
  },
  {
    "id": 4,
    "name": "Mountain",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Basic Land",
    "subtype": "Mountain",
    "rarity": "Basic",
    "produces": "R",
    "isBasic": true,
    "text_fr": "{T} : Ajoutez {R}.",
    "sets": [],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "functional"
  },
  {
    "id": 5,
    "name": "Forest",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Basic Land",
    "subtype": "Forest",
    "rarity": "Basic",
    "produces": "G",
    "isBasic": true,
    "text_fr": "{T} : Ajoutez {G}.",
    "sets": [],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "functional"
  },
  {
    "name": "Animate Wall",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter : mur. Le mur enchanté peut attaquer comme s'il n'avait pas le défenseur.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/animate_wall.jpeg",
    "effect": {"type": "removeKeyword", "keyword": "defender", "target": "creature", "requireSubtype": "Wall"},
    "effectStatus": "implemented",
    "id": 6
  },
  {
    "name": "Armageddon",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez tous les terrains.",
    "effect": {
      "type": "destroyAllLands"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/armageddon.jpeg",
    "id": 7
  },
  {
    "name": "Balance",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Chaque joueur choisit un nombre de terrains qu'il contrôle égal au nombre de terrains contrôlés par le joueur qui en contrôle le moins, puis sacrifie le reste. Les joueurs défaussent des cartes et sacrifient des créatures de la même manière.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/balance.jpeg",
    "effectStatus": "unimplemented",
    "id": 8
  },
  {
    "name": "Benalish Hero",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [
      "banding"
    ],
    "text_fr": "Bandage.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/benalish_hero.jpeg",
    "id": 9
  },
  {
    "name": "Black Ward",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée a la protection contre le noir. Cet effet ne retire pas cette Aura.",
    "effect": {"type": "addKeyword", "target": "creature", "keyword": "protection", "color": "black"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/black_ward.jpeg",
    "effectStatus": "implemented",
    "id": 10
  },
  {
    "name": "Blaze of Glory",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Une créature attaquante ciblée gagne +1/+1 et doit être bloquée par toutes.",
    "effectStatus": "implemented",
    "castOnlyDuring": "duringCombatBeforeBlockers",
    "effect": {
      "type": "mustBeBlocked",
      "target": "attackingCreature",
      "power": 1,
      "toughness": 1
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/blaze_of_glory.jpeg",
    "id": 11
  },
  {
    "name": "Blessing",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter : créature{W} : La créature enchantée gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/blessing.jpeg",
    "effect": {"type": "enchant", "target": "creature"},
    "activated": [{"cost": "{W}", "effect": {"type": "pumpSelf", "power": 1, "toughness": 1}}],
    "effectStatus": "implemented",
    "id": 12
  },
  {
    "name": "Blue Ward",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée a la protection contre le bleu. Cet effet ne retire pas cette Aura.",
    "effect": {"type": "addKeyword", "target": "creature", "keyword": "protection", "color": "blue"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/blue_ward.jpeg",
    "effectStatus": "implemented",
    "id": 13
  },
  {
    "name": "Castle",
    "sets": [
      "LEB"
    ],
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures dégagées que vous contrôlez gagnent +0/+2.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/castle.jpeg",
    "effectStatus": "unimplemented",
    "id": 14
  },
  {
    "name": "Circle of Protection: Black",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {
          "type": "preventNextDamageFromColor",
          "color": "B"
        }
      }
    ],
    "text_fr": "{1}: La prochaine fois qu'une source noire de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/circle_of_protection_black.jpeg",
    "id": 15
  },
  {
    "name": "Circle of Protection: Blue",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {
          "type": "preventNextDamageFromColor",
          "color": "U"
        }
      }
    ],
    "text_fr": "{1}: La prochaine fois qu'une source bleue de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/circle_of_protection_blue.jpeg",
    "id": 16
  },
  {
    "name": "Circle of Protection: Green",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {
          "type": "preventNextDamageFromColor",
          "color": "G"
        }
      }
    ],
    "text_fr": "{1}: La prochaine fois qu'une source verte de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/circle_of_protection_green.jpeg",
    "id": 17
  },
  {
    "name": "Circle of Protection: Red",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {
          "type": "preventNextDamageFromColor",
          "color": "R"
        }
      }
    ],
    "text_fr": "{1}: La prochaine fois qu'une source rouge de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/circle_of_protection_red.jpeg",
    "id": 18
  },
  {
    "name": "Circle of Protection: White",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {
          "type": "preventNextDamageFromColor",
          "color": "W"
        }
      }
    ],
    "text_fr": "{1}: La prochaine fois qu'une source blanche de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/circle_of_protection_white.jpeg",
    "id": 19
  },
  {
    "name": "Consecrate Land",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : terrain.\nLe terrain enchanté est indestructible et ne peut pas être enchanté par d'autres Auras.",
    "effect": {
      "type": "addKeyword",
      "target": "land",
      "keywords": [
        "indestructible",
        "cantbeenchantedbyotherauras"
      ]
    },
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "isAura": true,
    "subtype": "Aura",
    "img": "img/consecrate_land.jpeg",
    "id": 20
  },
  {
    "name": "Conversion",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, sacrifiez cet enchantement à moins que vous ne payiez {W}{W}. Toutes les montagnes sont des plaines.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/conversion.jpeg",
    "effectStatus": "unimplemented",
    "id": 21
  },
  {
    "name": "Crusade",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures blanches gagnent +1/+1.",
    "static": {
      "type": "anthem",
      "filterColor": "W",
      "power": 1,
      "toughness": 1
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/crusade.jpeg",
    "id": 22
  },
  {
    "name": "Death Ward",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Bouclier de régénération.",
    "effect": {
      "type": "regenerateShield",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/death_ward.jpeg",
    "id": 23
  },
  {
    "name": "Disenchant",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez l'enchantement ciblé ou l'artefact ciblé.",
    "effect": {
      "type": "destroy",
      "target": "artifactOrEnchantment"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/disenchant.jpeg",
    "id": 24
  },
  {
    "name": "Farmstead",
    "cost": "{W}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter : terrain.\nLe terrain enchanté a « À votre entretien, vous pouvez payer {W}{W}. Si vous le faites, vous gagnez 1 PV. »",
    "effect": {
      "type": "enchant",
      "target": "land"
    },
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "enchantedControllerUpkeep": true
        },
        "effect": {
          "type": "payToGainLife",
          "cost": "{W}{W}",
          "amount": 1
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "isAura": true,
    "subtype": "Aura",
    "img": "img/farmstead.jpeg",
    "id": 25
  },
  {
    "name": "Green Ward",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée a la protection contre le vert. Cet effet ne retire pas cette Aura.",
    "effect": {"type": "addKeyword", "target": "creature", "keyword": "protection", "color": "green"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/green_ward.jpeg",
    "effectStatus": "implemented",
    "id": 26
  },
  {
    "name": "Guardian Angel",
    "cost": "{X}{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "La créature ciblée gagne un bouclier de régénération.",
    "effectStatus": "implemented",
    "effect": {
      "type": "regenerateShield",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "xSpell": true,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/guardian_angel.jpeg",
    "id": 27
  },
  {
    "name": "Healing Salve",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Choisissez l'un Le joueur ciblé gagne 3 points de vie ; ou prévenez, ce tour-ci, les prochaines 3 blessures sur une cible, créature ou joueur.",
    "effect": {
      "type": "gainLife",
      "amount": 3,
      "target": "self"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/healing_salve.jpeg",
    "id": 28
  },
  {
    "name": "Holy Armor",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. La créature enchantée gagne +0/+2. {W} : La créature enchantée gagne +0/+1 jusqu'à la fin du tour.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/holy_armor.jpeg",
    "effect": {"type": "pump", "power": 0, "toughness": 2, "target": "creature"},
    "activated": [{"cost": "{W}", "effect": {"type": "pumpSelf", "power": 0, "toughness": 1}}],
    "effectStatus": "implemented",
    "id": 29
  },
  {
    "name": "Holy Strength",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée gagne +1/+2.",
    "effect": {
      "type": "pump",
      "power": 1,
      "toughness": 2,
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/holy_strength.jpeg",
    "id": 30
  },
  {
    "name": "Island Sanctuary",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Prévenez les dégâts des créatures sans vol.",
    "static": {
      "type": "preventDamageFromNonFlying"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/island_sanctuary.jpeg",
    "id": 31
  },
  {
    "name": "Karma",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de l'entretien de chaque joueur, le Karma inflige à ce joueur un nombre de blessures égal au nombre de marais qu'il contrôle. (Votre phase d'entretien commence après le dégagement de vos cartes et avant votre pioche.)",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "effectStatus": "implemented",
    "triggers": [{"event": "upkeepStarted", "effect": {"type": "upkeepDamageBySwamps"}}],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/karma.jpeg",
    "id": 32
  },
  {
    "name": "Lance",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "La créature enchantée gagne l'initiative.",
    "effect": {
      "type": "grantKeyword",
      "keyword": "firstStrike",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/lance.jpeg",
    "id": 33
  },
  {
    "name": "Mesa Pegasus",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Pegasus",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [
      "flying",
      "banding"
    ],
    "text_fr": "Vol, la bande.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/mesa_pegasus.jpeg",
    "id": 34
  },
  {
    "name": "Northern Paladin",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Knight",
    "power": 3,
    "toughness": 3,
    "rarity": "Rare",
    "text_fr": "{W}{W}, {T}: Détruisez le permanent noir ciblé.",
    "effectStatus": "implemented",
    "activated": [
      {
        "cost": "{W}{W}",
        "tap": true,
        "effect": {
          "type": "destroy",
          "target": "anyPermanent",
          "colorRestriction": "B"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/northern_paladin.jpeg",
    "id": 35
  },
  {
    "name": "Pearled Unicorn",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Unicorn",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/pearled_unicorn.jpeg",
    "id": 36
  },
  {
    "name": "Personal Incarnation",
    "cost": "{3}{W}{W}{W}",
    "cmc": 6,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Avatar Incarnation",
    "power": 6,
    "toughness": 6,
    "rarity": "Rare",
    "text_fr": "{0} : redirigez les blessures vers l'Incarnation.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/personal_incarnation.jpeg",
    "effectStatus": "unimplemented",
    "id": 37
  },
  {
    "name": "Purelace",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Changez la couleur d'un permanent en blanc.",
    "effectStatus": "implemented",
    "effect": {
      "type": "changeColor",
      "target": "permanent",
      "color": "W"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/purelace.jpeg",
    "id": 38
  },
  {
    "name": "Red Ward",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée a la protection contre le rouge. Cet effet ne retire pas cette Aura.",
    "effect": {"type": "addKeyword", "target": "creature", "keyword": "protection", "color": "red"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/red_ward.jpeg",
    "effectStatus": "implemented",
    "id": 39
  },
  {
    "name": "Resurrection",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Renvoyez en jeu la carte de créature ciblée de votre cimetière.",
    "effect": {"type": "returnFromGraveyard", "target": "creatureCardInOwnGraveyard", "destination": "battlefield"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/resurrection.jpeg",
    "effectStatus": "implemented",
    "id": 40
  },
  {
    "name": "Reverse Damage",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "La prochaine fois qu'une source de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures. Vous gagnez autant de points de vie.",
    "effectStatus": "implemented",
    "effect": {
      "type": "reverseDamage"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/reverse_damage.jpeg",
    "id": 41
  },
  {
    "name": "Righteousness",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "La créature bloqueuse ciblée gagne +7/+7 jusqu'à la fin du tour.",
    "effect": {
      "type": "pump",
      "power": 7,
      "toughness": 7,
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/righteousness.jpeg",
    "id": 42
  },
  {
    "name": "Samite Healer",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{T}: Prévenez, ce tour-ci, les prochaines 1 blessures sur une cible, créature ou joueur.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {
          "type": "preventDamage",
          "amount": 1,
          "target": "anyTarget"
        }
      }
    ],
    "effectStatus": "implemented",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "img": "img/samite_healer.jpeg",
    "id": 43
  },
  {
    "name": "Savannah Lions",
    "sets": [
      "LEB"
    ],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Cat",
    "power": 2,
    "toughness": 1,
    "img": "img/savannah_lions.jpeg",
    "id": 44
  },
  {
    "name": "Serra Angel",
    "cost": "{3}{W}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Angel",
    "power": 4,
    "toughness": 4,
    "rarity": "Uncommon",
    "keywords": [
      "flying",
      "vigilance"
    ],
    "text_fr": "Vol\nAttaquer avec l'Ange de Serra ne la fait pas s'engager.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/serra_angel.jpeg",
    "id": 45
  },
  {
    "name": "Swords to Plowshares",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Exilez la créature ciblée. Son contrôleur gagne autant de PV que sa force.",
    "effect": {
      "type": "exile",
      "target": "creature",
      "lifegainFromPower": true
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/swords_to_plowshares.jpeg",
    "id": 46
  },
  {
    "name": "Veteran Bodyguard",
    "sets": [
      "LEB"
    ],
    "cost": "{3}{W}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Tant que cette créature est dégagée, toutes les blessures qui devraient vous être infligées par des créatures non bloquées sont infligées à cette créature à la place.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Human",
    "power": 2,
    "toughness": 5,
    "img": "img/veteran_bodyguard.jpeg",
    "effectStatus": "unimplemented",
    "id": 47
  },
  {
    "name": "Wall of Swords",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 3,
    "toughness": 5,
    "rarity": "Uncommon",
    "keywords": [
      "flying",
      "defender"
    ],
    "text_fr": "(Les murs ne peuvent pas attaquer.)\nVol",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_swords.jpeg",
    "id": 48
  },
  {
    "name": "White Knight",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Knight",
    "power": 2,
    "toughness": 2,
    "rarity": "Uncommon",
    "keywords": [
      "firstStrike",
      "protection",
      "protectionB"
    ],
    "text_fr": "Initiative, protection contre le noir",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/white_knight.jpeg",
    "id": 49
  },
  {
    "name": "White Ward",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Protection contre le blanc.",
    "effect": {
      "type": "addKeyword",
      "target": "creature",
      "keyword": "protection",
      "color": "white"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/white_ward.jpeg",
    "id": 50
  },
  {
    "name": "Wrath of God",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez toutes les créatures. Elles ne peuvent pas être régénérées.",
    "effect": {
      "type": "destroyAllCreatures"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/wrath_of_god.jpeg",
    "id": 51
  },
  {
    "name": "Air Elemental",
    "cost": "{3}{U}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Elemental",
    "power": 4,
    "toughness": 4,
    "rarity": "Uncommon",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/air_elemental.jpeg",
    "id": 52
  },
  {
    "name": "Ancestral Recall",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Un joueur ciblé pioche trois cartes.",
    "effect": {
      "type": "drawTarget",
      "amount": 3,
      "target": "player"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/ancestral_recall.jpeg",
    "id": 53
  },
  {
    "name": "Animate Artifact",
    "sets": [
      "LEB"
    ],
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : artefact. Tant que l'artefact enchanté n'est pas une créature, c'est une créature-artefact dont la force et l'endurance sont chacune égales à sa valeur de mana.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/animate_artifact.jpeg",
    "effectStatus": "unimplemented",
    "id": 54
  },
  {
    "name": "Blue Elemental Blast",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez une créature rouge ou contrez un sort rouge.",
    "effect": {
      "type": "destroy",
      "target": "creature",
      "colorRestriction": "R"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/blue_elemental_blast.jpeg",
    "id": 55
  },
  {
    "name": "Braingeyser",
    "cost": "{X}{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "xSpell": true,
    "text_fr": "Un joueur ciblé pioche X cartes.",
    "effectStatus": "implemented",
    "effect": {
      "type": "drawTarget",
      "amount": "X",
      "target": "player"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/braingeyser.jpeg",
    "id": 56
  },
  {
    "name": "Clone",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Shapeshifter",
    "power": 0,
    "toughness": 0,
    "rarity": "Uncommon",
    "text_fr": "Au moment où le Clone arrive en jeu, vous pouvez choisir une créature en jeu. Si vous faites ainsi, le Clone arrive en jeu comme une copie de cette créature.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effect": {
      "type": "copyPermanent",
      "targetType": "creature",
      "copiable": true
    },
    "img": "img/clone.jpeg",
    "id": 57
  },
  {
    "name": "Control Magic",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créatureVous contrôlez la créature enchantée.",
    "effect": {
      "type": "stealCreature",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/control_magic.jpeg",
    "id": 58
  },
  {
    "name": "Copy Artifact",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Vous pouvez faire en sorte que cet enchantement arrive sur le champ de bataille en tant que copie de n'importe quel artefact sur le champ de bataille, sauf qu'il s'agit aussi d'un enchantement en plus de ses autres types.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/copy_artifact.jpeg",
    "effectStatus": "unimplemented",
    "id": 59
  },
  {
    "name": "Counterspell",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Contrecarrez le sort ciblé.",
    "effect": {
      "type": "counterSpell",
      "target": "spellOnStack"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/counterspell.jpeg",
    "id": 60
  },
  {
    "name": "Creature Bond",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Quand la créature enchantée meurt, cette Aura inflige au contrôleur de la créature un nombre de blessures égal à son endurance.",
    "effectStatus": "implemented",
    "effect": {
      "type": "enchant",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "creatureDied",
        "condition": {
          "enchantedSource": true
        },
        "effect": {
          "type": "damageEventPlayer",
          "amountFrom": "eventToughness"
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/creature_bond.jpeg",
    "id": 61
  },
  {
    "name": "Drain Power",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Ajoutez tout le mana non utilisé de l'adversaire.",
    "effectStatus": "implemented",
    "effect": {
      "type": "drainMana",
      "target": "opponent"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/drain_power.jpeg",
    "id": 62
  },
  {
    "name": "Feedback",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À l'entretien du contrôleur de l'enchantement ciblé, il perd 1 PV.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/feedback.jpeg",
    "effect": {"type": "enchant", "target": "enchantment"},
    "triggers": [{"event": "upkeepStarted", "condition": {"enchantedControllerUpkeep": true, "sourceSelf": true}, "effect": {"type": "damageEventPlayer", "amount": 1}}],
    "effectStatus": "implemented",
    "id": 63
  },
  {
    "name": "Flight",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée a le vol.",
    "effect": {
      "type": "grantKeyword",
      "keyword": "flying",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/flight.jpeg",
    "id": 64
  },
  {
    "name": "Invisibility",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée ne peut pas être bloquée, excepté par des murs.",
    "effect": {
      "type": "addKeyword",
      "target": "creature",
      "keyword": "blockablebywallsonly"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/invisibility.jpeg",
    "id": 65
  },
  {
    "name": "Jump",
    "sets": [
      "LEB"
    ],
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "La créature ciblée acquiert le vol jusqu'à la fin du tour.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {
      "type": "addKeywordUntilEnd",
      "keyword": "flying",
      "target": "creature"
    },
    "effectStatus": "implemented",
    "img": "img/jump.jpeg",
    "id": 66
  },
  {
    "name": "Lifetap",
    "sets": [
      "LEB"
    ],
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'une forêt contrôlée par un adversaire est engagée, vous gagnez 1 point de vie.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/lifetap.jpeg",
    "effectStatus": "unimplemented",
    "id": 67
  },
  {
    "name": "Lord of Atlantis",
    "sets": [
      "LEB"
    ],
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Les autres Ondins gagnent +1/+1 et ont la traversée des îles. (Ils sont imblocables si le joueur défenseur contrôle au moins une île.)",
    "static": {"type": "anthem", "excludeSelf": true, "filterSubtype": "Merfolk", "onlyCreatures": true, "power": 1, "toughness": 1, "keyword": "islandwalk"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Merfolk",
    "power": 2,
    "toughness": 2,
    "img": "img/lord_of_atlantis.jpeg",
    "effectStatus": "implemented",
    "id": 68
  },
  {
    "name": "Magical Hack",
    "sets": [
      "LEB"
    ],
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Modifiez le texte du sort ou du permanent ciblé en remplaçant toutes les occurrences d'un type de terrain de base par un autre. (Par exemple, vous pouvez changer « traversée des marais » en « traversée des plaines ». Cet effet dure indéfiniment.)",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/magical_hack.jpeg",
    "effectStatus": "unimplemented",
    "id": 69
  },
  {
    "name": "Mahamoti Djinn",
    "cost": "{4}{U}{U}",
    "cmc": 6,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Djinn",
    "power": 5,
    "toughness": 6,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/mahamoti_djinn.jpeg",
    "id": 70
  },
  {
    "name": "Mana Short",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Engagez tous les terrains que le joueur ciblé contrôle et videz sa réserve.",
    "effect": {
      "type": "emptyManaPool",
      "target": "opponent"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/mana_short.jpeg",
    "id": 71
  },
  {
    "name": "Merfolk of the Pearl Trident",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Merfolk",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/merfolk_of_the_pearl_trident.jpeg",
    "id": 72,
    "text_fr": ""
  },
  {
    "name": "Phantasmal Forces",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Illusion",
    "power": 4,
    "toughness": 1,
    "rarity": "Uncommon",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol. À votre entretien, payez {U} ou sacrifiez-la.",
    "effectStatus": "implemented",
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "kind": "controllerUpkeep",
          "controllerSelf": true
        },
        "effect": {
          "type": "payOrSacrifice",
          "cost": "U"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/phantasmal_forces.jpeg",
    "id": 73
  },
  {
    "name": "Phantasmal Terrain",
    "sets": [
      "LEB"
    ],
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Au moment où le Terrain fantas-ma-ti-que arrive en jeu, choisissez un type de terrain de base.\nLe terrain enchanté est un terrain du type choisi.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/phantasmal_terrain.jpeg",
    "effectStatus": "unimplemented",
    "id": 74
  },
  {
    "name": "Phantom Monster",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Illusion",
    "power": 3,
    "toughness": 3,
    "rarity": "Uncommon",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/phantom_monster.jpeg",
    "id": 75
  },
  {
    "name": "Pirate Ship",
    "effectStatus": "implemented",
    "static": [{"type": "cantAttackUnlessDefenderControls", "subtype": "Island"}, {"type": "sacrificeUnlessControls", "subtype": "Island"}],
    "cost": "{4}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Human Pirate",
    "power": 4,
    "toughness": 3,
    "rarity": "Rare",
    "keywords": [],
    "text_fr": "Le Navire pirate ne peut pas attaquer à moins que le joueur défenseur ne contrôle une île.\n{T} : Le navire pirate inflige 1 blessure à une cible, créature ou joueur.\nQuand vous ne contrôlez pas d'île, sacrifiez le Navire pirate.",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 1, "target": "anyTarget"}}],
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/pirate_ship.jpeg",
    "id": 76
  },
  {
    "name": "Power Leak",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : enchantement. Au début de l'entretien du contrôleur de l'enchantement enchanté, ce joueur peut payer n'importe quel montant de mana. Cette Aura inflige 2 blessures à ce joueur. Prévenez X de ces blessures, X étant le montant de mana payé ainsi par ce joueur.",
    "keywords": [],
        "effect": {
      "type": "enchant",
      "target": "enchantment"
    },
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {"enchantedControllerUpkeep": true},
        "effect": {"type": "payAnyAmountOrDamage", "damage": 2}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/power_leak.jpeg",
    "effectStatus": "implemented",
    "id": 77
  },
  {
    "name": "Power Sink",
    "cost": "{X}{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "Contrecarrez à moins que son contrôleur ne paie X. S'il ne paie pas, il engage tous les terrains produisant du mana qu'il contrôle et vide sa réserve de mana.",
    "effect": {
      "type": "counterUnlessPay",
      "target": "spellOnStack",
      "amount": "X",
      "tapLandsIfUnpaid": true
    },
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/power_sink.jpeg",
    "id": 78
  },
  {
    "name": "Prodigal Sorcerer",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Human Wizard Sorcerer",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "activated": [
      {
        "cost": "{T}",
        "tap": true,
        "effect": {
          "type": "damage",
          "amount": 1,
          "target": "anyTarget"
        }
      }
    ],
    "text_fr": "{T} : 1 blessure.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/prodigal_sorcerer.jpeg",
    "id": 79
  },
  {
    "name": "Psionic Blast",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Inflige 4 blessures à n'importe quelle cible et 2 blessures à vous-même.",
    "effect": {
      "type": "damageAndSelfDamage",
      "amount": 4,
      "selfAmount": 2,
      "target": "anyTarget"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/psionic_blast.jpeg",
    "id": 80
  },
  {
    "name": "Psychic Venom",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : terrain. À chaque fois que le terrain enchanté est engagé, cette Aura inflige 2 blessures au contrôleur de ce terrain.",
    "keywords": [],
        "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/psychic_venom.jpeg",
    "effect": {"type": "enchant", "target": "land"},
    "triggers": [{"event": "permanentTapped", "condition": {"enchantedBecomesTapped": true}, "effect": {"type": "damageEventPlayer", "amount": 2}}],
    "effectStatus": "implemented",
    "id": 81
  },
  {
    "name": "Sea Serpent",
    "cost": "{5}{U}",
    "cmc": 6,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Serpent",
    "power": 5,
    "toughness": 5,
    "rarity": "Common",
    "text_fr": "Ne peut pas attaquer sans Île.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/sea_serpent.jpeg",
    "effectStatus": "unimplemented",
    "id": 82
  },
  {
    "name": "Siren's Call",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Lancez ce sort uniquement pendant le tour d'un adversaire, avant la déclaration des attaquants.\nLes créatures que contrôle le joueur actif attaquent ce tour-ci si possible.\nAu début de la prochaine étape de fin, détruisez toutes les créatures non-Mur que ce joueur contrôle et qui n'ont pas attaqué ce tour-ci. Ignorez cet effet pour chaque créature que ce joueur ne contrôlait pas depuis le début du tour.",
    "effectStatus": "implemented",
    "effect": {"type": "sirenCall"},
    "castOnlyDuring": "opponentBeforeAttackers",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/sirens_call.jpeg",
    "id": 83
  },
  {
    "name": "Sleight of Mind",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Changez la couleur d'un mot de couleur sur une cible.",
    "effect": {
      "type": "colorChangeWord",
      "target": "permanentOrSpell"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/sleight_of_mind.jpeg",
    "id": 84
  },
  {
    "name": "Spell Blast",
    "cost": "{X}{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "Contrecarrez le sort ciblé ayant un coût converti de mana de X. (Par exemple, si le coût de mana de ce sort est {3}{U}{U}, X est 5.)",
    "effectStatus": "implemented",
    "effect": {
      "type": "counterCMC",
      "target": "spellOnStack",
      "amount": "X"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/spell_blast.jpeg",
    "id": 85
  },
  {
    "name": "Stasis",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les joueurs sautent leur étape de dégagement.\nÀ votre entretien, sacrifiez Stasis sauf si vous payez {U}.",
    "effectStatus": "implemented",
    "static": {
      "type": "skipUntapPhase"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "controllerUpkeep": true,
          "sourceSelf": true
        },
        "effect": {
          "type": "payOrSacrifice",
          "cost": "U"
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/stasis.jpeg",
    "id": 86
  },
  {
    "name": "Steal Artifact",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Vous contrôlez l'artefact enchanté.",
    "effect": {
      "type": "stealCreature",
      "target": "artifact"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/steal_artifact.jpeg",
    "id": 87
  },
  {
    "name": "Thoughtlace",
    "sets": [
      "LEB"
    ],
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Le sort ou le permanent ciblé devient bleu. (Les symboles de mana sur ce permanent restent inchangés.)",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/thoughtlace.jpeg",
    "effectStatus": "unimplemented",
    "id": 88
  },
  {
    "name": "Time Walk",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Prenez un tour supplémentaire.",
    "effect": {
      "type": "extraTurn"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/time_walk.jpeg",
    "id": 89
  },
  {
    "name": "Timetwister",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Chaque joueur mélange sa main et son cimetière dans sa bibliothèque, puis pioche sept cartes.",
    "effect": {
      "type": "wheel"
    },
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/timetwister.jpeg",
    "id": 90
  },
  {
    "name": "Twiddle",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Engagez ou dégagez l'artefact ciblé, la créature ciblée, ou le terrain ciblé.",
    "effect": {
      "type": "tapOrUntap",
      "target": "anyPermanent"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/twiddle.jpeg",
    "id": 91
  },
  {
    "name": "Unsummon",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Renvoyez la créature ciblée dans la main de son propriétaire.",
    "effect": {
      "type": "bounce",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/unsummon.jpeg",
    "id": 92
  },
  {
    "name": "Vesuvan Doppelganger",
    "cost": "{3}{U}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Shapeshifter",
    "power": 0,
    "toughness": 0,
    "rarity": "Rare",
    "text_fr": "Copie une créature.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "controllerUpkeep": true,
          "sourceSelf": true
        },
        "effect": {
          "type": "copyPermanent",
          "targetType": "creature",
          "copiable": true,
          "retargetSource": true
        }
      }
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effect": {
      "type": "copyPermanent",
      "targetType": "creature",
      "copiable": true
    },
    "img": "img/vesuvan_doppelganger.jpeg",
    "id": 93
  },
  {
    "name": "Volcanic Eruption",
    "cost": "{X}{U}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "xSpell": true,
    "text_fr": "Détruisez X Montagnes ciblées. Volcanic Eruption inflige à chaque créature et à chaque joueur un nombre de blessures égal au nombre de Montagnes mises au cimetière ainsi.",
    "effectStatus": "implemented",
    "effect": {
      "type": "destroyXMountains",
      "amount": "X",
      "damageEach": true
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/volcanic_eruption.jpeg",
    "id": 94
  },
  {
    "name": "Wall of Air",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 1,
    "toughness": 5,
    "rarity": "Uncommon",
    "keywords": [
      "flying",
      "defender"
    ],
    "text_fr": "(Les murs ne peuvent pas attaquer.)\nVol",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_air.jpeg",
    "id": 95
  },
  {
    "name": "Wall of Water",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 5,
    "rarity": "Uncommon",
    "keywords": [
      "defender"
    ],
    "text_fr": "Défenseur.",
    "sets": [
      "LEB"
    ],
    "activated": [
      {
        "cost": "{U}",
        "tap": false,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0
        }
      }
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_water.jpeg",
    "id": 96
  },
  {
    "name": "Water Elemental",
    "cost": "{3}{U}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Elemental",
    "power": 5,
    "toughness": 4,
    "rarity": "Uncommon",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/water_elemental.jpeg",
    "id": 97
  },
  {
    "name": "Animate Dead",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : carte de créature dans un cimetière\nQuand l'Animation des morts arrive sur le champ de bataille, si elle est sur le champ de bataille, elle perd « Enchanter : carte de créature dans un cimetière » et acquiert « Enchanter : créature mise sur le champ de bataille avec l'Animation des morts ». Renvoyez sur le champ de bataille, sous votre contrôle, la carte de créature enchantée et attachez-lui l'Animation des morts. Quand l'Animation des morts quitte le champ de bataille, le contrôleur de cette créature la sacrifie.\nLa créature enchantée gagne -1/-0.",
    "effect": {
      "type": "reanimate",
      "target": "creatureCardInGraveyard",
      "powerMod": -1
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/animate_dead.jpeg",
    "id": 98
  },
  {
    "name": "Bad Moon",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures noires gagnent +1/+1.",
    "static": {
      "type": "anthem",
      "filterColor": "B",
      "power": 1,
      "toughness": 1
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/bad_moon.jpeg",
    "id": 99
  },
  {
    "name": "Black Knight",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Knight",
    "power": 2,
    "toughness": 2,
    "rarity": "Uncommon",
    "keywords": [
      "firstStrike",
      "protection",
      "protectionW"
    ],
    "text_fr": "Initiative (Cette créature inflige des blessures de combat avant les créatures sans l'initiative.)\nProtection contre le blanc (Cette créature ne peut pas être bloquée, ciblée, blessée ou enchantée par quoi que ce soit de blanc.)",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/black_knight.jpeg",
    "id": 100
  },
  {
    "name": "Bog Wraith",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Wraith",
    "power": 3,
    "toughness": 3,
    "rarity": "Uncommon",
    "keywords": [
      "landwalk",
      "swampwalk"
    ],
    "text_fr": "Traversée des marais (Cette créature est imblocable tant que le joueur défenseur contrôle au moins un marais.)",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/bog_wraith.jpeg",
    "id": 101
  },
  {
    "name": "Contract from Below",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Piochez sept cartes. Mélangez votre main dans votre bibliothèque. Ante.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/contract_from_below.jpeg",
    "effectStatus": "unimplemented",
    "id": 102
  },
  {
    "name": "Cursed Land",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À l'entretien du contrôleur du terrain enchanté, il perd 1 PV.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/cursed_land.jpeg",
    "effect": {"type": "enchant", "target": "land"},
    "triggers": [{"event": "upkeepStarted", "condition": {"enchantedControllerUpkeep": true, "sourceSelf": true}, "effect": {"type": "damageEventPlayer", "amount": 1}}],
    "effectStatus": "implemented",
    "id": 103
  },
  {
    "name": "Dark Ritual",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Ajoutez {B}{B}{B} à votre réserve de mana.",
    "effect": {
      "type": "mana",
      "color": "B",
      "amount": 3
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/dark_ritual.jpeg",
    "id": 104
  },
  {
    "name": "Darkpact",
    "cost": "{B}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Mélangez votre cimetière dans votre bibliothèque. Ante.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/darkpact.jpeg",
    "effectStatus": "unimplemented",
    "id": 105
  },
  {
    "name": "Deathgrip",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{B}{B} : contrez un sort vert.",
    "activated": [
      {
        "cost": "{B}{B}",
        "tap": false,
        "effect": {
          "type": "counterSpellColor",
          "color": "G"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/deathgrip.jpeg",
    "id": 106
  },
  {
    "name": "Deathlace",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "La cible devient noire.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/deathlace.jpeg",
    "effectStatus": "unimplemented",
    "id": 107
  },
  {
    "name": "Demonic Attorney",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Ante.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/demonic_attorney.jpeg",
    "effectStatus": "unimplemented",
    "id": 108
  },
  {
    "name": "Demonic Hordes",
    "cost": "{3}{B}{B}{B}",
    "cmc": 6,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Demon",
    "power": 5,
    "toughness": 5,
    "rarity": "Rare",
    "keywords": [],
    "text_fr": "Vol. À votre entretien, détruisez un terrain ou payez {B}{B}{B}.",
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {
          "type": "destroy",
          "target": "land"
        }
      }
    ],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "kind": "controllerUpkeep",
          "controllerSelf": true
        },
        "effect": {
          "type": "destroyLandOrPay",
          "cost": "BBB"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/demonic_hordes.jpeg",
    "id": 109
  },
  {
    "name": "Demonic Tutor",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Cherchez une carte dans votre bibliothèque, mettez cette carte dans votre main, puis mélangez.",
    "effect": {
      "type": "tutor",
      "target": "anyCard"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/demonic_tutor.jpeg",
    "id": 110
  },
  {
    "name": "Drain Life",
    "cost": "{X}{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Ne dépensez que du mana noir pour X. Drain Life inflige X blessures à n'importe quelle cible. Vous gagnez autant de points de vie que de blessures infligées, mais pas plus que le total de points de vie du joueur avant que les blessures ne soient infligées, la loyauté du planeswalker avant que les blessures ne soient infligées, ou l'endurance de la créature.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/drain_life.jpeg",
    "id": 111
  },
  {
    "name": "Drudge Skeletons",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Skeleton",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [
      "heal",
      "regenerate",
      "regenerateInnate"
    ],
    "text_fr": "{B}: Régénérez ces Squelettes serviles.",
    "activated": [
      {
        "cost": "{B}",
        "tap": false,
        "effect": {
          "type": "regenerateShield"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/drudge_skeletons.jpeg",
    "id": 112
  },
  {
    "name": "Evil Presence",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : terrain\nLe terrain enchanté est un marais.",
    "effect": {
      "type": "changeType",
      "target": "land",
      "subtype": "Swamp"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "isAura": true,
    "auraEffect": {
      "type": "changeType",
      "subtype": "Swamp"
    },
    "subtype": "Aura",
    "effectStatus": "implemented",
    "img": "img/evil_presence.jpeg",
    "id": 113
  },
  {
    "name": "Fear",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée ne peut pas être bloquée excepté par des créatures-artefacts ou des créatures noires.",
    "effect": {
      "type": "addKeyword",
      "target": "creature",
      "keyword": "fear"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "effectStatus": "implemented",
    "img": "img/fear.jpeg",
    "id": 114
  },
  {
    "name": "Frozen Shade",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Shade",
    "power": 0,
    "toughness": 1,
    "rarity": "Common",
    "activated": [
      {
        "cost": "{B}",
        "tap": false,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 1
        }
      }
    ],
    "text_fr": "{B} : +1/+1.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/frozen_shade.jpeg",
    "id": 115
  },
  {
    "name": "Gloom",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les sorts blancs coûtent {3} de plus.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "static": [
      {
        "type": "spellCostIncrease",
        "filterColor": "W",
        "amount": 3
      }
    ],
    "img": "img/gloom.jpeg",
    "id": 116
  },
  {
    "name": "Howl from Beyond",
    "cost": "{X}{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "La créature ciblée gagne +X/+0 jusqu'à la fin du tour.",
    "effectStatus": "implemented",
    "effect": {
      "type": "pump",
      "power": "X",
      "toughness": 0,
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/howl_from_beyond.jpeg",
    "id": 117
  },
  {
    "name": "Hypnotic Specter",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Specter",
    "power": 2,
    "toughness": 2,
    "rarity": "Uncommon",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol (Cette créature ne peut être bloquée que par des créatures avec le vol.)\nÀ chaque fois que le Spectre hypnotiseur inflige des blessures à un adversaire, ce joueur se défausse au hasard d'une carte.",
    "effectStatus": "implemented",
    "triggers": [
      {
        "event": "damageDealt",
        "condition": {
          "targetType": "player",
          "sourceSelf": true
        },
        "effect": {
          "type": "randomDiscard",
          "target": "opponent",
          "amount": 1
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/hypnotic_specter.jpeg",
    "id": 118
  },
  {
    "name": "Lich",
    "cost": "{B}{B}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Au moment où cet enchantement arrive sur le champ de bataille, vous perdez autant de points de vie que votre total de points de vie. Vous ne perdez pas la partie pour avoir 0 point de vie ou moins. Si vous deviez gagner des points de vie, piochez ce nombre de cartes à la place. À chaque fois que des blessures vous sont infligées, sacrifiez autant de permanents non-jetons. Si vous ne le pouvez pas, vous perdez la partie. Quand cet enchantement est mis dans un cimetière depuis le champ de bataille, vous perdez la partie.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/lich.jpeg",
    "id": 119
  },
  {
    "name": "Lord of the Pit",
    "cost": "{4}{B}{B}{B}",
    "cmc": 7,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Demon",
    "power": 7,
    "toughness": 7,
    "rarity": "Rare",
    "keywords": [
      "flying",
      "trample"
    ],
    "text_fr": "Vol, piétinement (Cette créature ne peut être bloquée que par des créatures avec le vol ou la portée. Si cette créature inflige suffisamment de blessures de combat à ses bloqueurs pour les détruire, vous pouvez faire qu'elle inflige le reste de ses blessures au joueur défenseur.)\nAu début de votre entretien, sacrifiez une créature autre que le Lige de la fosse. Si vous ne le pouvez pas, le Lige de la fosse vous inflige 7 blessures.",
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "kind": "controllerUpkeep",
          "controllerSelf": true
        },
        "effect": {
          "type": "sacrificeOrDamage",
          "damage": 7
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/lord_of_the_pit.jpeg",
    "id": 120
  },
  {
    "name": "Mind Twist",
    "cost": "{X}{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "xSpell": true,
    "text_fr": "Un joueur ciblé défausse X cartes au hasard.",
    "effect": {
      "type": "discardRandomTarget",
      "amount": "X",
      "target": "player"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/mind_twist.jpeg",
    "id": 121
  },
  {
    "name": "Nether Shadow",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Célérité. Au début de votre entretien, si cette carte est dans votre cimetière avec trois cartes de créature ou plus au-dessus d'elle, vous pouvez mettre cette carte sur le champ de bataille.",
    "sets": [
      "LEB"
    ],
    "keywords": [
      "haste"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Spirit",
    "power": 1,
    "toughness": 1,
    "img": "img/nether_shadow.jpeg",
    "id": 122
  },
  {
    "name": "Nettling Imp",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Imp",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "activated": [
      {
        "cost": "",
        "tap": true,
        "onlyDuring": "opponentBeforeAttackers",
        "effect": {
          "type": "nettlingImp",
          "target": "opponentsNonWallCreature",
          "requireContinuousControl": true
        }
      }
    ],
    "text_fr": "{T} : choisissez une créature non-Mur ciblée que le joueur actif contrôle depuis le début du tour. Cette créature attaque ce tour-ci si possible. Détruisez-la au début de la prochaine étape de fin si elle n'a pas attaqué ce tour-ci. Ne l'activez que pendant un tour adverse, avant la déclaration des attaquants.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/nettling_imp.jpeg",
    "id": 123
  },
  {
    "name": "Nightmare",
    "cost": "{5}{B}",
    "cmc": 6,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Nightmare Horse",
    "power": "*",
    "toughness": "*",
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\nLe Cheval de cauchemar a une force et une endurance chacune égale au nombre de marais que vous contrôlez.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "static": [
      {
        "type": "dynamicPT",
        "powerSource": "basicLandCount",
        "landType": "Swamp",
        "controller": "self"
      }
    ],
    "effectStatus": "implemented",
    "img": "img/nightmare.jpeg",
    "id": 124
  },
  {
    "name": "Paralyze",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée ne se dégage pas tant que le joueur ne paie pas {B}.",
    "effect": {
      "type": "paralyze",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "isAura": true,
    "auraEffect": {
      "type": "paralyze"
    },
    "subtype": "Aura",
    "effectStatus": "implemented",
    "img": "img/paralyze.jpeg",
    "id": 125
  },
  {
    "name": "Pestilence",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{B}",
        "tap": false,
        "effect": {
          "type": "damageAllCreaturesAndPlayers",
          "amount": 1
        }
      }
    ],
    "text_fr": "{B} : 1 blessure à chaque créature et joueur.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/pestilence.jpeg",
    "id": 126
  },
  {
    "name": "Plague Rats",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Rat",
    "power": "*",
    "toughness": "*",
    "rarity": "Common",
    "text_fr": "Force et endurance = nombre de Rats.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "static": [
      {
        "type": "dynamicPT",
        "powerSource": "subtypeCount",
        "subtype": "Rat",
        "controller": "all",
        "per": 1
      }
    ],
    "effectStatus": "implemented",
    "img": "img/plague_rats.jpeg",
    "id": 127
  },
  {
    "name": "Raise Dead",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Renvoyez une carte de créature ciblée depuis votre cimetière dans votre main.",
    "effect": {
      "type": "returnFromGraveyard",
      "target": "creatureCardInOwnGraveyard"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/raise_dead.jpeg",
    "id": 128
  },
  {
    "name": "Royal Assassin",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Assassin",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {
          "type": "destroy",
          "target": "creature", "requireTapped": true
        }
      }
    ],
    "text_fr": "{T} : Détruisez la créature engagée ciblée.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/royal_assassin.jpeg",
    "id": 129
  },
  {
    "name": "Sacrifice",
    "sets": [
      "LEB"
    ],
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "En tant que coût supplémentaire pour lancer ce sort, sacrifiez une créature.\nAjoutez une quantité de {B} égale à la valeur de mana de la créature sacrifiée.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/sacrifice.jpeg",
    "effectStatus": "unimplemented",
    "id": 130
  },
  {
    "name": "Scathe Zombies",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Zombie",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/scathe_zombies.jpeg",
    "id": 131,
    "text_fr": ""
  },
  {
    "name": "Scavenging Ghoul",
    "sets": [
      "LEB"
    ],
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Au début de chaque étape de fin de tour, mettez un marqueur de cadavre sur cette créature pour chaque créature morte ce tour-ci. Retirez un marqueur de cadavre de cette créature : Régénérez cette créature.",
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Zombie",
    "power": 2,
    "toughness": 2,
    "img": "img/scavenging_ghoul.jpeg",
    "id": 132
  },
  {
    "name": "Sengir Vampire",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Vampire",
    "power": 4,
    "toughness": 4,
    "rarity": "Uncommon",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\nÀ chaque fois qu'une créature blessée par le Vampire sengien ce tour-ci est mise dans un cimetière, mettez un marqueur +1/+1 sur le Vampire sengien.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/sengir_vampire.jpeg",
    "id": 133
  },
  {
    "name": "Simulacrum",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Vous gagnez autant de points de vie que de blessures qui vous ont été infligées ce tour-ci. Simulacrum inflige à la créature ciblée que vous contrôlez autant de blessures que celles qui vous ont été infligées ce tour-ci.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/simulacrum.jpeg",
    "effectStatus": "unimplemented",
    "id": 134
  },
  {
    "name": "Sinkhole",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Détruisez le terrain ciblé.",
    "effect": {
      "type": "destroy",
      "target": "land"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/sinkhole.jpeg",
    "id": 135
  },
  {
    "name": "Terror",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez la créature non-artefact, non-noire ciblée. Elle ne peut pas être régénérée.",
    "effect": {
      "type": "destroy",
      "target": "creature",
      "restrict": {
        "notColor": "B",
        "notArtifact": true
      },
      "noRegen": true
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/terror.jpeg",
    "id": 136
  },
  {
    "name": "Unholy Strength",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée gagne +2/+1.",
    "effect": {
      "type": "pump",
      "power": 2,
      "toughness": 1,
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/unholy_strength.jpeg",
    "id": 137
  },
  {
    "name": "Wall of Bone",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Skeleton Wall",
    "power": 1,
    "toughness": 4,
    "rarity": "Uncommon",
    "keywords": [
      "heal",
      "regenerate",
      "defender"
    ],
    "text_fr": "(Les murs ne peuvent pas attaquer.)\n{B}: Régénérez le Mur d'ossements.",
    "activated": [
      {
        "cost": "{B}",
        "tap": false,
        "effect": {
          "type": "regenerateShield"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_bone.jpeg",
    "id": 138
  },
  {
    "name": "Warp Artifact",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter un artefact. Au début de l'entretien du contrôleur de l'artefact enchanté, cette Aura inflige 1 blessure à ce joueur.",
    "effectStatus": "implemented",
    "effect": {
      "type": "enchant",
      "target": "artifact"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "enchantedControllerUpkeep": true,
          "sourceSelf": true
        },
        "effect": {
          "type": "damageEventPlayer",
          "amount": 1
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/warp_artifact.jpeg",
    "id": 139
  },
  {
    "name": "Weakness",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature\nLa créature enchantée gagne -2/-1.",
    "effectStatus": "implemented",
    "effect": {
      "type": "pump",
      "power": -2,
      "toughness": -1,
      "target": "creature",
      "permanentAura": true
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/weakness.jpeg",
    "id": 140
  },
  {
    "name": "Will-o'-the-Wisp",
    "activated": [
      {
        "cost": "{B}",
        "tap": false,
        "effect": {
          "type": "regenerateShield"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vol (Cette créature ne peut être bloquée que par des créatures avec le vol.)\n{B} : Régénérez le Feu follet. (La prochaine fois que cette créature devrait être détruite ce tour-ci, elle ne l'est pas. À la place, engagez-la, retirez-lui toutes ses blessures et retirez-la du combat.)",
    "keywords": [
      "flying",
      "heal",
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Spirit",
    "power": 0,
    "toughness": 1,
    "effectStatus": "implemented",
    "img": "img/willothewisp.jpeg",
    "id": 141
  },
  {
    "name": "Word of Command",
    "sets": [
      "LEB"
    ],
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Regardez la main de l'adversaire ciblé et choisissez-y une carte. Vous contrôlez ce joueur jusqu'à ce que Word of Command finisse de se résoudre. Le joueur joue cette carte si possible. Ce faisant, le joueur ne peut activer des capacités de mana que si elles proviennent de terrains qu'il contrôle et seulement si le mana produit est dépensé pour activer d'autres capacités de mana de terrains qu'il contrôle et/ou pour jouer cette carte. Si la carte choisie est lancée en tant que sort, vous contrôlez le joueur tant que ce sort se résout.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/word_of_command.jpeg",
    "effectStatus": "unimplemented",
    "id": 142
  },
  {
    "name": "Zombie Master",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Zombie",
    "power": 2,
    "toughness": 3,
    "rarity": "Rare",
    "text_fr": "Les autres créatures Zombie ont la traversée des marais. (Elles ne peuvent pas être bloquées tant que le joueur défenseur contrôle au moins un marais.)\nLes autres zombies ont « {B} : Régénérez ce permanent. » (La prochaine fois qu'il devrait être détruit ce tour-ci, à la place, engagez-le, retirez-le du combat et retirez-lui toutes ses blessures.)",
    "static": {
      "type": "anthem",
      "filterSubtype": "Zombie",
      "power": 1,
      "toughness": 1,
      "keyword": "swampwalk"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/zombie_master.jpeg",
    "id": 143
  },
  {
    "name": "Burrowing",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "La créature enchantée a la montagne-marche.",
    "effect": {"type": "grantKeyword", "keyword": "mountainwalk", "target": "creature"},
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/burrowing.jpeg",
    "effectStatus": "implemented",
    "id": 144
  },
  {
    "name": "Chaoslace",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "La cible devient rouge.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/chaoslace.jpeg",
    "effectStatus": "unimplemented",
    "id": 145
  },
  {
    "name": "Disintegrate",
    "cost": "{X}{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "La Désintégration inflige X blessures à une cible, créature ou joueur. Cette créature ne peut pas être régénérée ce tour-ci. Si cette créature devait être mise dans un cimetière ce tour-ci, retirez-la de la partie à la place.",
    "effect": {
      "type": "damage",
      "amount": "X",
      "target": "anyTarget"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/disintegrate.jpeg",
    "id": 146
  },
  {
    "name": "Dragon Whelp",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Dragon",
    "power": 2,
    "toughness": 3,
    "rarity": "Uncommon",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\n{R} : Le Dragonnet gagne +1/+0 jusqu'à la fin du tour. À la fin du tour, si cette capacité a été jouée au moins quatre fois ce tour-ci, sacrifiez le Dragonnet.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{R}",
        "tap": false,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0,
          "sacrificeAfter": 4
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/dragon_whelp.jpeg",
    "id": 147
  },
  {
    "name": "Dwarven Demolition Team",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "destroy", "target": "creature", "requireSubtype": "Wall"}}],
    "sets": [
      "LEB"
    ],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Détruisez le mur ciblé.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Dwarf",
    "power": 1,
    "toughness": 1,
    "img": "img/dwarven_demolition_team.jpeg",
    "effectStatus": "implemented",
    "id": 148
  },
  {
    "name": "Dwarven Warriors",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{T} : La créature ciblée de force 2 ou moins ne peut pas être bloquée ce tour-ci.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Dwarf Warrior",
    "power": 1,
    "toughness": 1,
    "img": "img/dwarven_warriors.jpeg",
    "effectStatus": "unimplemented",
    "id": 149
  },
  {
    "name": "Earth Elemental",
    "cost": "{3}{R}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Elemental",
    "power": 4,
    "toughness": 5,
    "rarity": "Uncommon",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/earth_elemental.jpeg",
    "id": 150
  },
  {
    "name": "Earthbind",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée perd le vol.",
    "effectStatus": "implemented",
    "effect": {
      "type": "removeKeyword",
      "keyword": "flying",
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/earthbind.jpeg",
    "id": 151
  },
  {
    "name": "Earthquake",
    "sets": [
      "LEB"
    ],
    "cost": "{X}{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Le Tremblement de terre inflige X blessures à chaque créature sans le vol et à chaque joueur.",
    "effect": {"type": "damageAllCreaturesAndPlayers", "amount": "X", "exceptFlying": true},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/earthquake.jpeg",
    "effectStatus": "implemented",
    "id": 152
  },
  {
    "name": "False Orders",
    "sets": [
      "LEB"
    ],
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Lancez ce sort uniquement pendant l'étape de déclaration des bloqueurs. Retirez du combat la créature ciblée que le joueur défenseur contrôle. Les créatures qu'elle bloquait et qui n'étaient bloquées que par cette seule créature pendant ce combat deviennent non bloquées. Vous pouvez faire en sorte qu'elle bloque une créature attaquante de votre choix.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/false_orders.jpeg",
    "effectStatus": "unimplemented",
    "id": 153
  },
  {
    "name": "Fire Elemental",
    "cost": "{3}{R}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Elemental",
    "power": 5,
    "toughness": 4,
    "rarity": "Uncommon",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/fire_elemental.jpeg",
    "id": 154
  },
  {
    "name": "Fireball",
    "cost": "{X}{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "La Boule de feu inflige X blessures réparties de manière égale, arrondies à l'unité inférieure, entre n'importe quel nombre de créatures et/ou de joueurs ciblés.\nEn tant que coût supplémentaire pour jouer la Boule de feu, payez {1} pour chaque cible après la première.",
    "effect": {
      "type": "damage",
      "amount": "X",
      "target": "anyTarget"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/fireball.jpeg",
    "id": 155
  },
  {
    "name": "Firebreathing",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{R}",
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0
        }
      }
    ],
    "text_fr": "Enchanter : créature (Ciblez une créature au moment où vous jouez cette carte. Cette carte arrive en jeu attachée à cette créature.)\n{R} : La créature enchantée gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/firebreathing.jpeg",
    "effect": {"type": "enchant", "target": "creature"},
    "id": 156
  },
  {
    "name": "Flashfires",
    "sets": [
      "LEB"
    ],
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Détruisez toutes les plaines.",
    "effect": {
      "type": "destroyAllLands",
      "filter": "Plains"
    },
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/flashfires.jpeg",
    "id": 157
  },
  {
    "name": "Fork",
    "cost": "{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Copiez un sort instantané ou rituel ciblé. Vous pouvez choisir de nouvelles cibles.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {
      "type": "copySpell",
      "targetType": "instantOrSorcery",
      "chooseNewTargets": true
    },
    "img": "img/fork.jpeg",
    "id": 158
  },
  {
    "name": "Goblin Balloon Brigade",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin Warrior",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "activated": [
      {
        "cost": "{R}",
        "tap": false,
        "effect": {
          "type": "addKeywordUntilEnd",
          "keyword": "flying"
        }
      }
    ],
    "text_fr": "{R} : Les Aérostiers gobelins acquièrent le vol jusqu'à la fin du tour. (Ils ne peuvent être bloqués que par des créatures avec le vol.)",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/goblin_balloon_brigade.jpeg",
    "id": 159
  },
  {
    "name": "Goblin King",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "Les autres Gobelins gagnent +1/+1 et ont la traversée des montagnes. (Ils sont imblocables tant que le joueur défenseur contrôle au moins une montagne.)",
    "effectStatus": "implemented",
    "static": {
      "type": "anthem",
      "excludeSelf": true,
      "filterSubtype": "Goblin",
      "power": 1,
      "toughness": 1,
      "keyword": "mountainwalk"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_king.jpeg",
    "id": 160
  },
  {
    "name": "Granite Gargoyle",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Gargoyle",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol. {R} : +0/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{R}",
        "tap": false,
        "effect": {
          "type": "pumpSelf",
          "power": 0,
          "toughness": 1
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/granite_gargoyle.jpeg",
    "id": 161
  },
  {
    "name": "Gray Ogre",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Ogre",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/gray_ogre.jpeg",
    "id": 162
  },
  {
    "name": "Hill Giant",
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Giant",
    "power": 3,
    "toughness": 3,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/hill_giant.jpeg",
    "id": 163
  },
  {
    "name": "Hurloon Minotaur",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Minotaur",
    "power": 2,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/hurloon_minotaur.jpeg",
    "id": 164
  },
  {
    "name": "Ironclaw Orcs",
    "static": [{"type": "cantBlockPowerAtLeast", "power": 2}],
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orc",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "text_fr": "Ne peut pas bloquer les créatures de force 3 ou plus.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ironclaw_orcs.jpeg",
    "effectStatus": "implemented",
    "id": 165
  },
  {
    "name": "Keldon Warlord",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human Barbarian",
    "power": "*",
    "toughness": "*",
    "rarity": "Uncommon",
    "text_fr": "La force et l'endurance de Keldon Warlord sont chacune égales au nombre de créatures non-Mur que vous contrôlez.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "static": [
      {
        "type": "dynamicPT",
        "powerSource": "creatureCount",
        "excludeSubtype": "Wall",
        "controller": "self",
        "per": 1
      }
    ],
    "img": "img/keldon_warlord.jpeg",
    "id": 166
  },
  {
    "name": "Lightning Bolt",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "La Foudre inflige 3 blessures à une cible, créature ou joueur.",
    "effect": {
      "type": "damage",
      "amount": 3,
      "target": "anyTarget"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/lightning_bolt.jpeg",
    "id": 167
  },
  {
    "name": "Mana Flare",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un joueur engage un terrain pour du mana, ce joueur ajoute un mana de n'importe quel type que ce terrain a produit.",
    "static": {
      "type": "manaFlare"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/mana_flare.jpeg",
    "id": 168
  },
  {
    "name": "Manabarbs",
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un joueur engage un terrain pour du mana, les Barbelures de mana infligent 1 blessure à ce joueur.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/manabarbs.jpeg",
    "effectStatus": "unimplemented",
    "id": 169
  },
  {
    "name": "Mons's Goblin Raiders",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/monss_goblin_raiders.jpeg",
    "id": 170,
    "text_fr": ""
  },
  {
    "name": "Orcish Artillery",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orc Warrior",
    "power": 1,
    "toughness": 3,
    "rarity": "Uncommon",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 2, "target": "anyTarget", "selfDamage": 3}}],
    "text_fr": "{T}: L'Artillerie orque inflige 2 blessures à une cible, créature ou joueur, et vous inflige 3 blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/orcish_artillery.jpeg",
    "id": 171
  },
  {
    "name": "Orcish Oriflamme",
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures attaquantes que vous contrôlez gagnent +1/+0.",
    "static": {
      "type": "anthem",
      "condition": "attacking",
      "power": 1,
      "toughness": 0
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/orcish_oriflamme.jpeg",
    "id": 172
  },
  {
    "name": "Power Surge",
    "sets": [
      "LEB"
    ],
    "cost": "{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Au début de l'entretien de chaque joueur, cet enchantement inflige X blessures à ce joueur, X étant le nombre de terrains non-engagés qu'il contrôlait au début de ce tour.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/power_surge.jpeg",
    "effectStatus": "unimplemented",
    "id": 173
  },
  {
    "name": "Raging River",
    "sets": [
      "LEB"
    ],
    "cost": "{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'une ou plusieurs créatures que vous contrôlez attaquent, chaque joueur défenseur répartit toutes les créatures sans le vol qu'il contrôle en une pile « gauche » et une pile « droite ». Ensuite, pour chaque créature attaquante que vous contrôlez, choisissez « gauche » ou « droite ». Cette créature ne peut être bloquée lors de ce combat que par des créatures avec le vol et des créatures de la pile portant l'étiquette choisie.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/raging_river.jpeg",
    "effectStatus": "unimplemented",
    "id": 174
  },
  {
    "name": "Red Elemental Blast",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez une créature bleue ou contrez un sort bleu.",
    "effect": {
      "type": "destroy",
      "target": "creature",
      "colorRestriction": "U"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/red_elemental_blast.jpeg",
    "id": 175
  },
  {
    "name": "Roc of Kher Ridges",
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Bird",
    "power": 3,
    "toughness": 3,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/roc_of_kher_ridges.jpeg",
    "id": 176
  },
  {
    "name": "Rock Hydra",
    "sets": [
      "LEB"
    ],
    "cost": "{X}{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Cette créature arrive sur le champ de bataille avec X marqueurs +1/+1. Pour chaque blessure de 1 point qui devrait être infligée à cette créature, si elle a un marqueur +1/+1, retirez-en un marqueur +1/+1 et prévenez cette blessure. {R} : Prévenez la prochaine blessure de 1 point qui devrait être infligée à cette créature ce tour-ci. {R}{R}{R} : Mettez un marqueur +1/+1 sur cette créature. N'activez cette capacité que pendant votre entretien.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Hydra",
    "power": 0,
    "toughness": 0,
    "img": "img/rock_hydra.jpeg",
    "effectStatus": "unimplemented",
    "id": 177
  },
  {
    "name": "Sedge Troll",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Troll",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "{B} : régénérez.",
    "sets": [
      "LEB"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/sedge_troll.jpeg",
    "id": 178
  },
  {
    "name": "Shatter",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez l'artefact ciblé.",
    "effect": {
      "type": "destroy",
      "target": "artifact"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/shatter.jpeg",
    "id": 179
  },
  {
    "name": "Shivan Dragon",
    "cost": "{4}{R}{R}",
    "cmc": 6,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Dragon",
    "power": 5,
    "toughness": 5,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\n{R}: Le Dragon shivân gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{R}",
        "tap": false,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/shivan_dragon.jpeg",
    "id": 180
  },
  {
    "name": "Smoke",
    "cost": "{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures ne se dégagent pas pendant l'étape de dégagement.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "static": [
      {
        "type": "cantUntapCreatures",
        "controller": "all"
      }
    ],
    "img": "img/smoke.jpeg",
    "id": 181
  },
  {
    "name": "Stone Giant",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : La créature ciblée que vous contrôlez d'endurance inférieure à la force du Géant de pierre acquiert le vol jusqu'à la fin du tour. Détruisez cette créature au début de l'étape de fin.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Giant",
    "power": 3,
    "toughness": 4,
    "img": "img/stone_giant.jpeg",
    "effectStatus": "unimplemented",
    "id": 182
  },
  {
    "name": "Stone Rain",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Détruisez le terrain ciblé.",
    "effect": {
      "type": "destroy",
      "target": "land"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/stone_rain.jpeg",
    "id": 183
  },
  {
    "name": "Tunnel",
    "sets": [
      "LEB"
    ],
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Détruisez un Mur ciblé. Il ne peut pas être régénéré.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {
      "type": "destroy",
      "target": "creature",
      "requireSubtype": "Wall",
      "noRegen": true
    },
    "effectStatus": "implemented",
    "img": "img/tunnel.jpeg",
    "id": 184
  },
  {
    "name": "Two-Headed Giant of Foriys",
    "static": [{"type": "extraBlocks", "count": 1}],
    "cost": "{4}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Giant",
    "power": 4,
    "toughness": 4,
    "rarity": "Rare",
    "sets": [
      "LEB"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/twoheaded_giant_of_foriys.jpeg",
    "id": 185,
    "text_fr": "Piétinement. Cette créature peut bloquer une créature supplémentaire à chaque combat."
  },
  {
    "name": "Uthden Troll",
    "activated": [
      {
        "cost": "{R}",
        "tap": false,
        "effect": {
          "type": "regenerateShield"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{R} : Régénérez le Troll d'Uthden.",
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Troll",
    "power": 2,
    "toughness": 2,
    "effectStatus": "implemented",
    "img": "img/uthden_troll.jpeg",
    "id": 186
  },
  {
    "name": "Wall of Fire",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 5,
    "rarity": "Uncommon",
    "keywords": [
      "defender"
    ],
    "text_fr": "(Les murs ne peuvent pas attaquer.)\n{R}: Le Mur de feu gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "LEB"
    ],
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0
        }
      }
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_fire.jpeg",
    "id": 187
  },
  {
    "name": "Wall of Stone",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 8,
    "rarity": "Uncommon",
    "keywords": [
      "defender"
    ],
    "text_fr": "(Les murs ne peuvent pas attaquer.)",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_stone.jpeg",
    "id": 188
  },
  {
    "name": "Wheel of Fortune",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Chaque joueur défausse sa main, puis pioche sept cartes.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": { "type": "discardHandDraw", "amount": 7 },
    "effectStatus": "implemented",
    "img": "img/wheel_of_fortune.jpeg",
    "id": 189
  },
  {
    "name": "Aspect of Wolf",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "La créature enchantée gagne +X/+Y (X = forêts, Y = forêts/2).",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/aspect_of_wolf.jpeg",
    "effectStatus": "unimplemented",
    "id": 190
  },
  {
    "name": "Berserk",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Ne lancez ce sort qu'avant l'étape des blessures de combat.\nUne créature ciblée acquiert le piétinement et gagne +X/+0 jusqu'à la fin du tour, X étant sa force. Au début de la prochaine étape de fin, détruisez cette créature si elle a attaqué ce tour-ci.",
    "effect": {
      "type": "berserk",
      "target": "creature"
    },
    "castOnlyDuring": "beforeDamage",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/berserk.jpeg",
    "id": 191
  },
  {
    "name": "Birds of Paradise",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Bird",
    "power": 0,
    "toughness": 1,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\n{T}: Ajoutez un mana d'une couleur de votre choix à votre réserve.",
    "tapAbility": {
      "produces": "any"
    },
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/birds_of_paradise.jpeg",
    "id": 192
  },
  {
    "name": "Camouflage",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Jusqu'à la fin du tour, vos créatures ne peuvent pas être bloquées normalement.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/camouflage.jpeg",
    "effectStatus": "unimplemented",
    "id": 193
  },
  {
    "name": "Channel",
    "sets": [
      "LEB"
    ],
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Jusqu'à la fin du tour, à tout moment où vous pourriez activer une capacité de mana, vous pouvez payer 1 point de vie. Si vous faites ainsi, ajoutez {C}.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/channel.jpeg",
    "effectStatus": "unimplemented",
    "id": 194
  },
  {
    "name": "Cockatrice",
    "cost": "{3}{G}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Cockatrice",
    "power": 2,
    "toughness": 4,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\nÀ chaque fois que le Cocatrix bloque ou devient bloqué par une créature non-mur, détruisez cette créature à la fin du combat.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/cockatrice.jpeg",
    "id": 195
  },
  {
    "name": "Craw Wurm",
    "cost": "{4}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Wurm",
    "power": 6,
    "toughness": 4,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "text_fr": "",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/craw_wurm.jpeg",
    "id": 196
  },
  {
    "name": "Elvish Archers",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elf Archer",
    "power": 2,
    "toughness": 1,
    "rarity": "Rare",
    "keywords": [
      "firstStrike"
    ],
    "text_fr": "Initiative",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/elvish_archers.jpeg",
    "id": 197
  },
  {
    "name": "Fastbond",
    "static": [{"type": "extraLandDrops"}],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Vous pouvez jouer n'importe quel nombre de terrains pendant votre tour. Chaque fois que vous jouez un terrain au-delà du premier ce tour-ci, Fastbond vous inflige 1 blessure.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/fastbond.jpeg",
    "effectStatus": "implemented",
    "id": 198
  },
  {
    "name": "Fog",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Prévenez toutes les blessures de combat qui devraient être infligées ce tour-ci.",
    "effect": {
      "type": "fog"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/fog.jpeg",
    "id": 199
  },
  {
    "name": "Force of Nature",
    "cost": "{2}{G}{G}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elemental",
    "power": 8,
    "toughness": 8,
    "rarity": "Rare",
    "keywords": [
      "trample"
    ],
    "text_fr": "Piétinement (Si cette créature inflige suffisamment de blessures de combat à ses bloqueurs pour les détruire, vous pouvez faire qu'elle inflige le reste de ses blessures au joueur défenseur.)\nAu début de votre entretien, la Force de la Nature vous inflige 8 blessures à moins que vous ne payiez {G}{G}{G}{G}.",
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "kind": "controllerUpkeep",
          "controllerSelf": true
        },
        "effect": {
          "type": "payOrDamage",
          "cost": "GGGG",
          "damage": 8
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/force_of_nature.jpeg",
    "id": 200
  },
  {
    "name": "Fungusaur",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Fungus Dinosaur",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "À chaque fois que le Fongosaure reçoit des blessures, placez sur lui un marqueur +1/+1. (Les blessures sont infligées avant le placement du marqueur.)",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/fungusaur.jpeg",
    "effectStatus": "unimplemented",
    "id": 201
  },
  {
    "name": "Gaea's Liege",
    "cost": "{3}{G}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Avatar",
    "power": "*",
    "toughness": "*",
    "rarity": "Rare",
    "text_fr": "La force et l'endurance du Noble féal de Gaia sont chacune égale au nombre de forêts que vous contrôlez. Tant que le Noble féal de Gaia attaque, sa force et son endurance sont chacune égale au nombre de forêts que le joueur défenseur contrôle à la place.\n{T} : Le terrain ciblé devient une forêt jusqu'à ce que le Noble féal de Gaia quitte le jeu.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "static": [
      {
        "type": "dynamicPT",
        "powerSource": "basicLandCount",
        "landType": "Forest",
        "controller": "self"
      }
    ],
    "img": "img/gaeas_liege.jpeg",
    "id": 202
  },
  {
    "name": "Giant Growth",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "La créature ciblée gagne +3/+3 jusqu'à la fin du tour.",
    "effect": {
      "type": "pump",
      "power": 3,
      "toughness": 3,
      "target": "creature"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/giant_growth.jpeg",
    "id": 203
  },
  {
    "name": "Giant Spider",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Spider",
    "power": 2,
    "toughness": 4,
    "rarity": "Common",
    "keywords": [
      "reach"
    ],
    "text_fr": "L'Araignée géante peut bloquer comme si elle avait le vol.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/giant_spider.jpeg",
    "id": 204
  },
  {
    "name": "Grizzly Bears",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Bear",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/grizzly_bears.jpeg",
    "id": 205,
    "text_fr": ""
  },
  {
    "name": "Hurricane",
    "cost": "{X}{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "xSpell": true,
    "text_fr": "L'Ouragan inflige X blessures à chaque créature avec le vol et à chaque joueur.",
    "effect": {
      "type": "damageToFliersAndPlayers",
      "amount": "X"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/hurricane.jpeg",
    "id": 206
  },
  {
    "name": "Ice Storm",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Détruisez le terrain ciblé.",
    "effect": {
      "type": "destroy",
      "target": "land"
    },
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/ice_storm.jpeg",
    "id": 207
  },
  {
    "name": "Instill Energy",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "La créature enchantée n'a pas de maladie d'invocation et se dégage en plus.",
    "effect": {
      "type": "noop"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/instill_energy.jpeg",
    "id": 208
  },
  {
    "name": "Ironroot Treefolk",
    "cost": "{4}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Treefolk",
    "power": 3,
    "toughness": 5,
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/ironroot_treefolk.jpeg",
    "id": 209
  },
  {
    "name": "Kudzu",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Le terrain enchanté est détruit. Son contrôleur choisit un nouveau terrain.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/kudzu.jpeg",
    "effectStatus": "unimplemented",
    "id": 210
  },
  {
    "name": "Ley Druid",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human Druid",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{T} : Dégagez un terrain ciblé.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{T}",
        "tap": true,
        "effect": {
          "type": "tapOrUntap",
          "target": "land"
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/ley_druid.jpeg",
    "id": 211
  },
  {
    "name": "Lifeforce",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{G}{G} : contrez un sort noir.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{G}{G}",
        "tap": false,
        "effect": {
          "type": "counterSpellColor",
          "color": "B"
        }
      }
    ],
    "img": "img/lifeforce.jpeg",
    "id": 212
  },
  {
    "name": "Lifelace",
    "sets": [
      "LEB"
    ],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Le sort ou le permanent ciblé devient vert. (Les symboles de mana sur ce permanent restent inchangés.)",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/lifelace.jpeg",
    "effectStatus": "unimplemented",
    "id": 213
  },
  {
    "name": "Living Artifact",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Le terrain enchanté gagne des marqueurs de croissance.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/living_artifact.jpeg",
    "effectStatus": "unimplemented",
    "id": 214
  },
  {
    "name": "Living Lands",
    "static": [{"type": "changeType", "addType": "Creature", "filterType": "Land", "controllerFilter": "all", "filterSubtype": "Forest"}, {"type": "setPowerToughness", "power": 1, "toughness": 1, "filterType": "Land", "controllerFilter": "all", "filterSubtype": "Forest"}],
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Toutes les forêts sont des créatures 1/1 qui restent des terrains.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/living_lands.jpeg",
    "effectStatus": "implemented",
    "id": 215
  },
  {
    "name": "Llanowar Elves",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elf Druid",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{T} : Ajoutez {G} à votre réserve.",
    "tapAbility": {
      "produces": "G"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/llanowar_elves.jpeg",
    "id": 216
  },
  {
    "name": "Lure",
    "effect": {"type": "grantKeyword", "keyword": "lure", "target": "creature"},
    "effectStatus": "implemented",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Toutes les créatures capables de bloquer la créature enchantée le font.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "static": [
      {
        "type": "mustBlock",
        "sourceOnly": true
      }
    ],
    "subtype": "Aura",
    "img": "img/lure.jpeg",
    "id": 217
  },
  {
    "name": "Natural Selection",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Regardez les trois cartes du dessus d'une bibliothèque. Vous pouvez en mettre une au fond.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {"type":"lookTopTarget","target":"player","amount":3},
    "img": "img/natural_selection.jpeg",
    "id": 218
  },
  {
    "name": "Regeneration",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "{G}: Régénérez la créature enchantée.",
    "sets": [
      "LEB"
    ],
    "keywords": [
      "heal",
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/regeneration.jpeg",
    "effect": {"type": "enchant", "target": "creature"},
    "activated": [{"cost": "{G}", "effect": {"type": "regenerateShield"}}],
    "effectStatus": "implemented",
    "id": 219
  },
  {
    "name": "Regrowth",
    "sets": [
      "LEB"
    ],
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Renvoyez une carte ciblée depuis votre cimetière dans votre main.",
    "effect": {
      "type": "returnFromGraveyard"
    },
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/regrowth.jpeg",
    "id": 220
  },
  {
    "name": "Scryb Sprites",
    "sets": [
      "LEB"
    ],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Vol.",
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Faerie",
    "power": 1,
    "toughness": 1,
    "img": "img/scryb_sprites.jpeg",
    "id": 221
  },
  {
    "name": "Shanodin Dryads",
    "sets": [
      "LEB"
    ],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Traversée des forêts (Cette créature est imblocable si le joueur défenseur contrôle au moins une forêt.)",
    "keywords": [
      "landwalk",
      "forestwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Nymph Dryad",
    "power": 1,
    "toughness": 1,
    "img": "img/shanodin_dryads.jpeg",
    "id": 222
  },
  {
    "name": "Stream of Life",
    "cost": "{X}{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "Le joueur ciblé gagne X points de vie.",
    "effect": {
      "type": "gainLife",
      "amount": "X",
      "target": "player"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/stream_of_life.jpeg",
    "id": 223
  },
  {
    "name": "Thicket Basilisk",
    "cost": "{3}{G}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Basilisk",
    "power": 2,
    "toughness": 4,
    "rarity": "Uncommon",
    "text_fr": "Chaque fois que cette créature bloque ou est bloquée, détruisez la créature adverse à la fin du combat.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thicket_basilisk.jpeg",
    "effectStatus": "unimplemented",
    "id": 224
  },
  {
    "name": "Timber Wolves",
    "sets": [
      "LEB"
    ],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Regroupement. (N'importe quelles créatures avec le regroupement, et jusqu'à une sans, peuvent attaquer en groupe. Les groupes sont bloqués comme un tout. Si une créature avec le regroupement que vous contrôlez bloque une créature ou est bloquée par elle, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "keywords": [
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Wolf",
    "power": 1,
    "toughness": 1,
    "img": "img/timber_wolves.jpeg",
    "id": 225
  },
  {
    "name": "Tranquility",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Détruisez tous les enchantements.",
    "effect": {
      "type": "destroyAllEnchantments"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/tranquility.jpeg",
    "id": 226
  },
  {
    "name": "Tsunami",
    "sets": [
      "LEB"
    ],
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Détruisez toutes les îles.",
    "effect": {"type": "destroyAllMatching", "cardType": "Land", "subtype": "Island"},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/tsunami.jpeg",
    "effectStatus": "implemented",
    "id": 227
  },
  {
    "name": "Verduran Enchantress",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human Druid",
    "power": 0,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "À chaque fois que vous jouez un sort d'enchantement, vous pouvez piocher une carte.",
    "effectStatus": "implemented",
    "static": {
      "type": "drawOnEnchantmentCast"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/verduran_enchantress.jpeg",
    "id": 228
  },
  {
    "name": "Wall of Brambles",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Plant Wall",
    "power": 2,
    "toughness": 3,
    "rarity": "Uncommon",
    "keywords": [
      "regenerate",
      "defender"
    ],
    "text_fr": "Défenseur. {G} : régénérez.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/wall_of_brambles.jpeg",
    "id": 229
  },
  {
    "name": "Wall of Ice",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 7,
    "rarity": "Uncommon",
    "keywords": [
      "defender"
    ],
    "text_fr": "Défenseur.",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_ice.jpeg",
    "id": 230
  },
  {
    "name": "Wall of Wood",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 3,
    "rarity": "Common",
    "keywords": [
      "defender"
    ],
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.)",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_wood.jpeg",
    "id": 231
  },
  {
    "name": "Wanderlust",
    "sets": [
      "LEB"
    ],
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. Au début de l'entretien du contrôleur de la créature enchantée, cette Aura inflige 1 blessure à ce joueur.",
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/wanderlust.jpeg",
    "effect": {"type": "enchant", "target": "creature"},
    "triggers": [{"event": "upkeepStarted", "condition": {"enchantedControllerUpkeep": true, "sourceSelf": true}, "effect": {"type": "damageEventPlayer", "amount": 1}}],
    "effectStatus": "implemented",
    "id": 232
  },
  {
    "name": "War Mammoth",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elephant",
    "power": 3,
    "toughness": 3,
    "rarity": "Common",
    "sets": [
      "LEB"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/war_mammoth.jpeg",
    "id": 233,
    "text_fr": "Piétinement."
  },
  {
    "name": "Web",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter : créature (Ciblez une créature au moment où vous jouez cette carte. Cette carte arrive en jeu attachée à cette créature.)\nLa créature enchantée gagne +0/+2 et elle peut bloquer comme si elle avait le vol.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effect": {
      "type": "addKeyword",
      "target": "creature",
      "keyword": "reach"
    },
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/web.jpeg",
    "id": 234
  },
  {
    "name": "Wild Growth",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "À chaque fois que le terrain enchanté est engagé pour du mana, son contrôleur ajoute {G} à sa réserve.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/wild_growth.jpeg",
    "effect": {"type": "manaBonus", "target": "land", "color": "G", "amount": 1},
    "effectStatus": "implemented",
    "id": 235
  },
  {
    "name": "Ankh of Mishra",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Chaque fois qu'un terrain arrive en jeu, son contrôleur subit 2 blessures.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ankh_of_mishra.jpeg",
    "effectStatus": "unimplemented",
    "id": 236
  },
  {
    "name": "Basalt Monolith",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Le Monolithe de basalte ne se dégage pas pendant votre étape de dégagement.{T} : Ajoutez {3} à votre réserve.{3} : Dégagez le Monolithe de basalte.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/basalt_monolith.jpeg",
    "tapAbility": {"produces": "CCC", "doesntUntap": true},
    "activated": [{"cost": "{3}", "effect": {"type": "untapSelf"}}],
    "id": 237
  },
  {
    "name": "Black Lotus",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{T}, sacrifiez : ajoutez trois manas d'une seule couleur.",
    "tapAbility": {
      "sacrifice": true,
      "chooseColorAmount": 3
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/black_lotus.jpeg",
    "effectStatus": "implemented",
    "id": 238
  },
  {
    "name": "Black Vise",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À l'entretien de l'adversaire, il subit X blessures (X = cartes en main − 4).",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "effectStatus": "implemented",
    "triggers": [{"event": "upkeepStarted", "condition": {"controllerUpkeep": false}, "effect": {"type": "upkeepDamageByHand", "threshold": 4}}],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/black_vise.jpeg",
    "id": 239
  },
  {
    "name": "Celestial Prism",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : ajoutez un mana d'une couleur de votre choix.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{2}",
        "tap": true,
        "manaAbility": true,
        "effect": {
          "type": "mana",
          "color": "any",
          "amount": 1
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/celestial_prism.jpeg",
    "id": 240
  },
  {
    "name": "Chaos Orb",
    "effectStatus": "implemented",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T} : détruisez un permanent aléatoire.",
    "activated": [
      {
        "cost": "{1}",
        "tap": true,
        "effect": {
          "type": "destroyRandomPermanent"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/chaos_orb.jpeg",
    "id": 241
  },
  {
    "name": "Clockwork Beast",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Beast",
    "power": 0,
    "toughness": 4,
    "rarity": "Rare",
    "text_fr": "Créature à ressort.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/clockwork_beast.jpeg",
    "effectStatus": "unimplemented",
    "id": 242
  },
  {
    "name": "Conservator",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{3}, {T} : prévenez les 2 prochaines blessures qui devraient vous être infligées ce tour-ci.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "activated": [
      {
        "cost": "{3}",
        "tap": true,
        "effect": {"type": "preventDamageToYou", "amount": 2}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/conservator.jpeg",
    "effectStatus": "implemented",
    "id": 243
  },
  {
    "name": "Copper Tablet",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Au début de l'entretien de chaque joueur, la Tablette de cuivre inflige 1 blessure à ce joueur.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "effect": {
          "type": "damageEventPlayer",
          "amount": 1
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/copper_tablet.jpeg",
    "id": 244
  },
  {
    "name": "Crystal Rod",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un joueur joue un sort bleu, vous pouvez payer {1}. Si vous faites ainsi, vous gagnez 1 point de vie.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "spellCast",
        "condition": {"spellColor": "U"},
        "effect": {"type": "payToGainLife", "cost": "{1}", "amount": 1}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/crystal_rod.jpeg",
    "effectStatus": "implemented",
    "id": 245
  },
  {
    "name": "Cyclopean Tomb",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2} : mettez un marqueur sur un terrain. Ce terrain devient un marais.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/cyclopean_tomb.jpeg",
    "effectStatus": "unimplemented",
    "id": 246
  },
  {
    "name": "Dingus Egg",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un terrain est mis dans un cimetière depuis le jeu, l'Œuf de dingus inflige 2 blessures au contrôleur de ce terrain.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "landDestroyed",
        "effect": {
          "type": "damage",
          "amount": 2,
          "target": "opponent"
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/dingus_egg.jpeg",
    "id": 247
  },
  {
    "name": "Disrupting Scepter",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3}, {T}: Le joueur ciblé se défausse d'une carte de sa main. Ne jouez cette capacité que pendant votre tour.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/disrupting_scepter.jpeg",
    "id": 248
  },
  {
    "name": "Forcefield",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1} : la prochaine fois qu'une créature non bloquée de votre choix devrait vous infliger des blessures de combat ce tour-ci, prévenez toutes ces blessures sauf 1.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "activated": [
      {
        "cost": "{1}",
        "tap": false,
        "effect": {"type": "forcefield"}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/forcefield.jpeg",
    "effectStatus": "implemented",
    "id": 249
  },
  {
    "name": "Gauntlet of Might",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Les montagnes produisent un mana supplémentaire. Les créatures rouges gagnent +1/+1.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/gauntlet_of_might.jpeg",
    "effectStatus": "unimplemented",
    "id": 250
  },
  {
    "name": "Glasses of Urza",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T} : regardez la main adverse.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/glasses_of_urza.jpeg",
    "effectStatus": "unimplemented",
    "id": 251
  },
  {
    "name": "Helm of Chatzuk",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T} : La créature ciblée gagne le regroupement jusqu'à la fin du tour. (N'importe quelles créatures avec le regroupement, et jusqu'à une sans, peuvent attaquer en groupe. Les groupes sont bloqués comme un tout. Si une créature avec le regroupement qu'un joueur contrôle bloque une créature ou est bloquée par elle, ce joueur répartit les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/helm_of_chatzuk.jpeg",
    "id": 252
  },
  {
    "name": "Howling Mine",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Au début de l'étape de pioche de chaque joueur, si la Mine rugissante est dégagée, ce joueur pioche une carte.",
    "triggers": [
      {
        "event": "drawStepStarted",
        "condition": {
          "sourceUntapped": true
        },
        "effect": {
          "type": "draw",
          "amount": 1,
          "target": "eventPlayer"
        }
      }
    ],
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/howling_mine.jpeg",
    "id": 253
  },
  {
    "name": "Icy Manipulator",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{1}, {T} : engagez un artefact, une créature ou un terrain ciblé.",
    "activated": [
      {
        "cost": "{1}",
        "tap": true,
        "effect": {
          "type": "tapTarget",
          "target": "artifactCreatureOrLand"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/icy_manipulator.jpeg",
    "id": 254
  },
  {
    "name": "Illusionary Mask",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{X} : Vous pouvez choisir une carte de créature dans votre main dont le coût de mana pourrait être payé par tout ou partie du mana que vous avez dépensé pour {X}. Si vous faites ainsi, vous pouvez lancer cette carte face cachée en tant que créature-sort 2/2 sans payer son coût de mana. Si la créature que devient ce sort en se résolvant n'a pas été retournée face visible et devrait assigner ou infliger des blessures, subir des blessures, ou être engagée, elle est retournée face visible à la place et assigne ou inflige des blessures, subit des blessures, ou est engagée. N'activez cette capacité qu'à la vitesse d'un rituel.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/illusionary_mask.jpeg",
    "id": 255
  },
  {
    "name": "Iron Star",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un joueur joue un sort rouge, vous pouvez payer {1}. Si vous faites ainsi, vous gagnez 1 point de vie.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "spellCast",
        "condition": {"spellColor": "R"},
        "effect": {"type": "payToGainLife", "cost": "{1}", "amount": 1}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/iron_star.jpeg",
    "id": 256
  },
  {
    "name": "Ivory Cup",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un joueur lance un sort blanc, vous pouvez payer {1}. Si vous faites ainsi, vous gagnez 1 point de vie.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "spellCast",
        "condition": {"spellColor": "W"},
        "effect": {"type": "payToGainLife", "cost": "{1}", "amount": 1}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/ivory_cup.jpeg",
    "id": 257
  },
  {
    "name": "Jade Monolith",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1} : redirigez les blessures d'une source ciblée vers une créature ciblée.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/jade_monolith.jpeg",
    "effectStatus": "unimplemented",
    "id": 258
  },
  {
    "name": "Jade Statue",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2} : La Statue de jade devient une créature-artefact 3/6 jusqu'à la fin du combat. Ne jouez cette capacité que pendant le combat.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/jade_statue.jpeg",
    "effectStatus": "unimplemented",
    "id": 259
  },
  {
    "name": "Jayemdae Tome",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{4}, {T}: Piochez une carte.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{4}",
        "tap": true,
        "effect": {
          "type": "draw",
          "amount": 1
        }
      }
    ],
    "effectStatus": "implemented",
    "subtype": "Book",
    "img": "img/jayemdae_tome.jpeg",
    "id": 260
  },
  {
    "name": "Juggernaut",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Juggernaut",
    "power": 5,
    "toughness": 3,
    "rarity": "Uncommon",
    "keywords": [
      "mustAttack"
    ],
    "text_fr": "Le Djaggernaut attaque à chaque tour si possible.\nLe Djaggernaut ne peut pas être bloqué par des murs.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "static": [
      {
        "type": "mustAttack"
      },
      {
        "type": "cantBeBlockedBySubtype",
        "subtype": "Wall"
      }
    ],
    "img": "img/juggernaut.jpeg",
    "id": 261
  },
  {
    "name": "Kormus Bell",
    "static": [{"type": "changeType", "addType": "Creature", "filterType": "Land", "controllerFilter": "all", "filterSubtype": "Swamp"}, {"type": "setPowerToughness", "power": 1, "toughness": 1, "filterType": "Land", "controllerFilter": "all", "filterSubtype": "Swamp"}, {"type": "changeColor", "color": "B", "filterType": "Land", "controllerFilter": "all", "filterSubtype": "Swamp"}],
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Tous les marais sont des créatures noires 1/1 qui restent des terrains.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/kormus_bell.jpeg",
    "effectStatus": "implemented",
    "id": 262
  },
  {
    "name": "Library of Leng",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Il n'y a pas de limite au nombre de cartes dans votre main.\nSi un effet vous contraint à vous défausser d'une carte, défaussez-vous-en, mais vous pouvez la mettre au-dessus de votre bibliothèque à la place de la mettre dans votre cimetière.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/library_of_leng.jpeg",
    "id": 263
  },
  {
    "name": "Living Wall",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 6,
    "rarity": "Uncommon",
    "keywords": ["defender"],
    "activated": [{"cost": "{1}", "tap": false, "effect": {"type": "regenerateShield"}}],
    "text_fr": "Défenseur. {1} : régénérez.",
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/living_wall.jpeg",
    "id": 264
  },
  {
    "name": "Mana Vault",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "L'Arche de mana ne se dégage pas pendant votre étape de dégagement.\nAu début de votre entretien, vous pouvez payer {4}. Si vous faites ainsi, dégagez l'Arche de mana.\nAu début de votre étape de pioche, si l'Arche de mana est engagée, elle vous inflige 1 blessure.\n{T} : Ajoutez {C}{C}{C}.",
    "tapAbility": {
      "produces": "CCC",
      "doesntUntap": true,
      "upkeepDamage": 1
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "controllerUpkeep": true,
          "sourceSelf": true
        },
        "effect": {
          "type": "payToUntap",
          "cost": "{4}"
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/mana_vault.jpeg",
    "effectStatus": "implemented",
    "id": 265
  },
  {
    "name": "Meekstone",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Les créatures dont la force est de 3 ou plus ne se dégagent pas pendant l'étape de dégagement de leurs contrôleurs.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/meekstone.jpeg",
    "id": 266
  },
  {
    "name": "Mox Emerald",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "produces": "G",
    "text_fr": "{T} : Ajoutez {G}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/mox_emerald.jpeg",
    "id": 267
  },
  {
    "name": "Mox Jet",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "produces": "B",
    "text_fr": "{T} : Ajoutez {B}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/mox_jet.jpeg",
    "id": 268
  },
  {
    "name": "Mox Pearl",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "produces": "W",
    "text_fr": "{T} : Ajoutez {W}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/mox_pearl.jpeg",
    "id": 269
  },
  {
    "name": "Mox Ruby",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "produces": "R",
    "text_fr": "{T} : Ajoutez {R}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/mox_ruby.jpeg",
    "id": 270
  },
  {
    "name": "Mox Sapphire",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "produces": "U",
    "text_fr": "{T} : Ajoutez {U}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/mox_sapphire.jpeg",
    "id": 271
  },
  {
    "name": "Nevinyrral's Disk",
    "activated": [{"cost": "{1}", "tap": true, "effect": {"type": "destroyAllMatching", "cardTypes": ["Artifact", "Creature", "Enchantment"]}}],
    "entersTapped": true,
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Le Disque de Nevinyrral arrive sur le champ de bataille engagé.{1}, {T} : Détruisez tous les artefacts, toutes les créatures et tous les enchantements.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/nevinyrrals_disk.jpeg",
    "effectStatus": "implemented",
    "id": 272
  },
  {
    "name": "Obsianus Golem",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Golem",
    "power": 4,
    "toughness": 6,
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/obsianus_golem.jpeg",
    "id": 273
  },
  {
    "name": "Rod of Ruin",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{3}, {T}: La Baguette de ruine inflige 1 blessure à une cible, créature ou joueur.",
    "activated": [
      {
        "cost": "{3}",
        "tap": true,
        "effect": {
          "type": "damage",
          "amount": 1,
          "target": "anyTarget"
        }
      }
    ],
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/rod_of_ruin.jpeg",
    "id": 274
  },
  {
    "name": "Sol Ring",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {2} à votre réserve.",
    "activated": [
      {
        "cost": "",
        "tap": true,
        "manaAbility": true,
        "effect": {
          "type": "mana",
          "amount": "CC"
        }
      }
    ],
    "effectStatus": "implemented",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/sol_ring.jpeg",
    "id": 275
  },
  {
    "name": "Soul Net",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'une créature est mise dans un cimetière depuis le jeu, vous pouvez payer {1}. Si vous faites ainsi, vous gagnez 1 point de vie.",
    "static": {
      "type": "gainLifeOnDeath"
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/soul_net.jpeg",
    "id": 276
  },
  {
    "name": "Sunglasses of Urza",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Vous pouvez dépenser du mana blanc comme s'il s'agissait de mana rouge.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/sunglasses_of_urza.jpeg",
    "id": 277
  },
  {
    "name": "The Hive",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{5}, {T} : Mettez en jeu un jeton de créature-artefact 1/1 Insecte avec le vol appelée Guêpe. (Elle ne peut être bloquée que par des créatures avec le vol ou la portée.)",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/the_hive.jpeg",
    "id": 278
  },
  {
    "name": "Throne of Bone",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un joueur joue un sort noir, vous pouvez payer {1}. Si vous faites ainsi, vous gagnez 1 point de vie.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "spellCast",
        "condition": {"spellColor": "B"},
        "effect": {"type": "payToGainLife", "cost": "{1}", "amount": 1}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/throne_of_bone.jpeg",
    "id": 279
  },
  {
    "name": "Time Vault",
    "sets": [
      "LEB"
    ],
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Time Vault arrive engagé.\nTime Vault ne se dégage pas pendant votre étape de dégagement.\nSi vous deviez commencer votre tour alors que Time Vault est engagé, vous pouvez sauter ce tour à la place. Si vous le faites, dégagez Time Vault.\n{T} : prenez un tour supplémentaire après celui-ci.",
    "keywords": [
      "doesntUntap"
    ],
    "triggers": [],
    "entersTapped": true,
    "static": {
      "type": "skipTurnIfTapped"
    },
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {
          "type": "extraTurn"
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/time_vault.jpeg",
    "effectStatus": "implemented",
    "id": 280
  },
  {
    "name": "Winter Orb",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Tant que cet artefact est dégagé, les joueurs ne peuvent pas dégager plus d'un terrain pendant leur étape de dégagement.",
    "effectStatus": "implemented",
    "static": {
      "type": "untapLock",
      "whileUntapped": true
    },
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/winter_orb.jpeg",
    "id": 281
  },
  {
    "name": "Wooden Sphere",
    "sets": [
      "LEB"
    ],
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un joueur joue un sort vert, vous pouvez payer {1}. Si vous faites ainsi, vous gagnez 1 point de vie.",
    "keywords": [],
    "triggers": [
      {
        "event": "spellCast",
        "condition": {"spellColor": "G"},
        "effect": {"type": "payToGainLife", "cost": "{1}", "amount": 1}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/wooden_sphere.jpeg",
    "effectStatus": "implemented",
    "id": 282
  },
  {
    "name": "Badlands",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "BR",
    "text_fr": "{T} : Ajoutez {B} ou {R}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Swamp Mountain",
    "img": "img/badlands.jpeg",
    "id": 283
  },
  {
    "name": "Bayou",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "BG",
    "text_fr": "{T} : Ajoutez {B} ou {G}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Swamp Forest",
    "img": "img/bayou.jpeg",
    "id": 284
  },
  {
    "name": "Plateau",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "RW",
    "text_fr": "{T} : Ajoutez {R} ou {W}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Mountain Plains",
    "img": "img/plateau.jpeg",
    "id": 285
  },
  {
    "name": "Savannah",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "GW",
    "text_fr": "{T} : Ajoutez {G} ou {W}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Forest Plains",
    "img": "img/savannah.jpeg",
    "id": 286
  },
  {
    "name": "Scrubland",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "WB",
    "text_fr": "{T} : Ajoutez {W} ou {B}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Plains Swamp",
    "img": "img/scrubland.jpeg",
    "id": 287
  },
  {
    "name": "Taiga",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "RG",
    "text_fr": "{T} : Ajoutez {R} ou {G}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Mountain Forest",
    "img": "img/taiga.jpeg",
    "id": 288
  },
  {
    "name": "Tropical Island",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "GU",
    "text_fr": "{T} : Ajoutez {G} ou {U}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Forest Island",
    "img": "img/tropical_island.jpeg",
    "id": 289
  },
  {
    "name": "Tundra",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "WU",
    "text_fr": "{T} : Ajoutez {W} ou {U}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Plains Island",
    "img": "img/tundra.jpeg",
    "id": 290
  },
  {
    "name": "Underground Sea",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "UB",
    "text_fr": "{T} : Ajoutez {U} ou {B}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Island Swamp",
    "img": "img/underground_sea.jpeg",
    "id": 291
  },
  {
    "name": "Volcanic Island",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "produces": "UR",
    "text_fr": "{T} : Ajoutez {U} ou {R}.",
    "sets": [
      "LEB"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Island Mountain",
    "img": "img/volcanic_island.jpeg",
    "id": 292
  },
  {
    "name": "Abu Ja'far",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 0,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "Quand Abu Ja'far meurt, détruisez la créature qui l'a tuée.",
    "triggers": [
      {
        "event": "creatureDied",
        "condition": {
          "sourceSelf": true
        },
        "effect": {
          "type": "destroy",
          "target": "killer"
        }
      }
    ],
    "effectStatus": "implemented",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/abu_jafar.jpeg",
    "id": 293
  },
  {
    "name": "Army of Allah",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Les créatures attaquantes gagnent +2/+0 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "attacking", "power": 2, "toughness": 0},
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/army_of_allah.jpeg",
    "effectStatus": "implemented",
    "id": 294
  },
  {
    "name": "Camel",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Camel",
    "power": 0,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Les créatures que vous contrôlez ne peuvent pas être blessées par les déserts.",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/camel.jpeg",
    "id": 295
  },
  {
    "name": "Eye for an Eye",
    "sets": [
      "ARN"
    ],
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "La prochaine fois qu'une source de votre choix devrait vous infliger des blessures ce tour-ci, cette source vous inflige ces blessures et Eye for an Eye inflige autant de blessures au contrôleur de cette source.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/eye_for_an_eye.jpeg",
    "effectStatus": "unimplemented",
    "id": 296
  },
  {
    "name": "Jihad",
    "cost": "{W}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Choisir une couleur. Les créatures de cette couleur gagnent +2/+1.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/jihad.jpeg",
    "effectStatus": "unimplemented",
    "id": 297
  },
  {
    "name": "King Suleiman",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "destroy", "target": "creature", "requireSubtype": ["Djinn", "Efreet"]}}],
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Noble",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{T} : détruisez un Djinni ou un Efreet ciblé.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/king_suleiman.jpeg",
    "effectStatus": "implemented",
    "id": 298
  },
  {
    "name": "Moorish Cavalry",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Knight",
    "power": 3,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "Piétinement",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/moorish_cavalry.jpeg",
    "id": 299
  },
  {
    "name": "Piety",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Les créatures bloqueuses gagnent +0/+3 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "blocking", "power": 0, "toughness": 3},
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/piety.jpeg",
    "effectStatus": "implemented",
    "id": 300
  },
  {
    "name": "Repentant Blacksmith",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "La protection contre le rouge.",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "protection",
      "protectionR"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/repentant_blacksmith.jpeg",
    "id": 301
  },
  {
    "name": "Shahrazad",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Chaque joueur quitte la partie en cours et en commence une sous-partie.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {
      "type": "startSubgame"
    },
    "img": "img/shahrazad.jpeg",
    "id": 302
  },
  {
    "name": "War Elephant",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Elephant",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "La bande.",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "banding",
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/war_elephant.jpeg",
    "id": 303
  },
  {
    "name": "Dandân",
    "sets": [
      "ARN"
    ],
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Le Dandân ne peut pas attaquer à moins que le joueur défenseur ne contrôle une île.\nQuand vous ne contrôlez pas d'île, sacrifiez le Dandân.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Fish",
    "power": 4,
    "toughness": 1,
    "img": "img/dandn.jpeg",
    "effectStatus": "unimplemented",
    "id": 304
  },
  {
    "name": "Fishliver Oil",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature (Ciblez une créature au moment où vous jouez cette carte. Cette carte arrive en jeu attachée à cette créature.)\nLa créature enchantée a la traversée des îles. (Cette créature est imblocable tant que le joueur défenseur contrôle au moins une île.)",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/fishliver_oil.jpeg",
    "effect": {"type": "grantKeyword", "keyword": "islandwalk", "target": "creature"},
    "effectStatus": "implemented",
    "id": 305
  },
  {
    "name": "Flying Men",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/flying_men.jpeg",
    "id": 306
  },
  {
    "name": "Giant Tortoise",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Turtle",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Ne peut pas attaquer à moins d'être dégagé.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/giant_tortoise.jpeg",
    "effectStatus": "unimplemented",
    "id": 307
  },
  {
    "name": "Island Fish Jasconius",
    "cost": "{4}{U}{U}{U}",
    "cmc": 7,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Fish",
    "power": 6,
    "toughness": 8,
    "rarity": "Rare",
    "text_fr": "Ne peut pas attaquer à moins que le défenseur ne contrôle une île.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/island_fish_jasconius.jpeg",
    "effectStatus": "unimplemented",
    "id": 308
  },
  {
    "name": "Merchant Ship",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 0,
    "toughness": 2,
    "rarity": "Uncommon",
    "text_fr": "Ne peut pas attaquer à moins que le défenseur ne contrôle une île. {T} : gagnez 1 PV.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/merchant_ship.jpeg",
    "effectStatus": "unimplemented",
    "id": 309
  },
  {
    "name": "Old Man of the Sea",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Djinn",
    "power": 2,
    "toughness": 3,
    "rarity": "Rare",
    "text_fr": "{T} : gagnez le contrôle d'une créature ciblée de force 2 ou moins.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/old_man_of_the_sea.jpeg",
    "effectStatus": "unimplemented",
    "id": 310
  },
  {
    "name": "Serendib Djinn",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Djinn",
    "power": 5,
    "toughness": 6,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol. Quand Serendib Djinn blesse un joueur, sacrifiez un terrain.",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/serendib_djinn.jpeg",
    "id": 311
  },
  {
    "name": "Serendib Efreet",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Efreet",
    "power": 3,
    "toughness": 4,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol. À votre entretien, subissez 1 blessure.",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/serendib_efreet.jpeg",
    "id": 312
  },
  {
    "name": "Sindbad",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{T} : Piochez une carte et révélez-la. Si ce n'est pas une carte de terrain, défaussez-vous en.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/sindbad.jpeg",
    "effectStatus": "unimplemented",
    "id": 313
  },
  {
    "name": "Unstable Mutation",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature\nLa créature enchantée gagne +3/+3.\nAu début de l'entretien du contrôleur de la créature enchantée, mettez un marqueur -1/-1 sur cette créature.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/unstable_mutation.jpeg",
    "effect": {"type": "pump", "power": 3, "toughness": 3, "target": "creature"},
    "triggers": [{"event": "upkeepStarted", "condition": {"enchantedControllerUpkeep": true, "sourceSelf": true}, "effect": {"type": "addCounter", "counter": "-1/-1", "amount": 1, "target": "enchanted"}}],
    "effectStatus": "implemented",
    "id": 314
  },
  {
    "name": "Cuombajj Witches",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Wizard",
    "power": 1,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "{T}: Les Envoûteuses de Cuombajj infligent 1 blessure à n'importe quelle cible et 1 blessure à n'importe quelle cible choisie par un adversaire.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/cuombajj_witches.jpeg",
    "effectStatus": "unimplemented",
    "id": 315
  },
  {
    "name": "El-Hajjâj",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Wizard",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "Chaque fois qu'il blesse un joueur, gagnez autant de PV.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/elhajjj.jpeg",
    "effectStatus": "unimplemented",
    "id": 316
  },
  {
    "name": "Erg Raiders",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Warrior",
    "power": 2,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "Au début de votre étape de fin, si Erg Raiders n'a pas attaqué ce tour-ci, il vous inflige 2 blessures, sauf s'il est passé sous votre contrôle ce tour-ci.",
    "effectStatus": "implemented",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "endStepStarted",
        "condition": {
          "controllerEndStep": true,
          "sourceDidNotAttackThisTurn": true,
          "sourceNotUnderControlThisTurn": true
        },
        "effect": {
          "type": "damageController",
          "amount": 2
        }
      }
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/erg_raiders.jpeg",
    "id": 317
  },
  {
    "name": "Guardian Beast",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Beast",
    "power": 2,
    "toughness": 4,
    "rarity": "Rare",
    "text_fr": "Tant que vous contrôlez une bibliothèque, vos artefacts ne peuvent pas être détruits.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/guardian_beast.jpeg",
    "effectStatus": "unimplemented",
    "id": 318
  },
  {
    "name": "Hasran Ogress",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Ogre",
    "power": 3,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Chaque fois qu'elle attaque, inflige 3 blessures à vous à moins que vous ne payiez {2}.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/hasran_ogress.jpeg",
    "effectStatus": "unimplemented",
    "id": 319
  },
  {
    "name": "Junún Efreet",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Efreet",
    "power": 3,
    "toughness": 3,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol. Au début de votre entretien, sacrifiez Junún Efreet à moins de payer {B}{B}.",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/junn_efreet.jpeg",
    "id": 320
  },
  {
    "name": "Juzám Djinn",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Djinn",
    "power": 5,
    "toughness": 5,
    "rarity": "Rare",
    "text_fr": "À l'entretien, inflige 1 blessure à vous.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/juzm_djinn.jpeg",
    "effectStatus": "unimplemented",
    "id": 321
  },
  {
    "name": "Khabál Ghoul",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Zombie",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "À l'entretien, mettez un marqueur +1/+1 sur chaque Ghoul.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/khabl_ghoul.jpeg",
    "effectStatus": "unimplemented",
    "id": 322
  },
  {
    "name": "Oubliette",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Quand l'Oubliette arrive sur le champ de bataille, une créature ciblée passe hors phase jusqu'à ce que l'Oubliette quitte le champ de bataille. Engagez cette créature au moment où elle passe en phase de cette manière. (Les auras et les équipements passent hors phase avec elle. Tant que les permanents sont hors phase, ils sont traités comme s'ils n'existaient pas.)",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/oubliette.jpeg",
    "effectStatus": "unimplemented",
    "id": 323
  },
  {
    "name": "Sorceress Queen",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Wizard Sorcerer",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{T} : la créature ciblée devient 0/2.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {
          "type": "setBasePT",
          "power": 0,
          "toughness": 2
        }
      }
    ],
    "img": "img/sorceress_queen.jpeg",
    "id": 324
  },
  {
    "name": "Stone-Throwing Devils",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Devil",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [
      "firstStrike"
    ],
    "text_fr": "Initiative.",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/stonethrowing_devils.jpeg",
    "id": 325
  },
  {
    "name": "Aladdin",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human Rogue",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{1}{R}{R} : gagnez le contrôle d'un artefact ciblé.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/aladdin.jpeg",
    "effectStatus": "unimplemented",
    "id": 326
  },
  {
    "name": "Ali Baba",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human Rogue",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{R} : détruisez le mur ciblé.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ali_baba.jpeg",
    "effectStatus": "unimplemented",
    "id": 327
  },
  {
    "name": "Ali from Cairo",
    "effectStatus": "implemented",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 0,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "Les blessures ne peuvent pas vous réduire en dessous de 1 PV.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "replacementEffects": [
      {
        "event": "damageToController",
        "type": "setLifeMinimum",
        "minimum": 1
      }
    ],
    "img": "img/ali_from_cairo.jpeg",
    "id": 328
  },
  {
    "name": "Bird Maiden",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human Bird",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol.",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/bird_maiden.jpeg",
    "id": 329
  },
  {
    "name": "Desert Nomads",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human Nomad",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Marche du désert.\nPrévenez toutes les blessures que les Déserts infligent à Desert Nomads.",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "landwalk",
      "desertwalk"
    ],
    "static": [
      {
        "type": "preventDamageFromSubtype",
        "sourceSubtype": "Desert"
      }
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/desert_nomads.jpeg",
    "id": 330
  },
  {
    "name": "Hurr Jackal",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Jackal",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{T} : retirez un marqueur de cimetière d'une créature.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/hurr_jackal.jpeg",
    "effectStatus": "unimplemented",
    "id": 331
  },
  {
    "name": "Kird Ape",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Ape",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Le Gorille beringeï gagne +1/+2 tant que vous contrôlez une forêt.",
    "effectStatus": "implemented",
    "static": {
      "type": "conditionalPump",
      "condition": "controlForest",
      "power": 1,
      "toughness": 2
    },
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/kird_ape.jpeg",
    "id": 332
  },
  {
    "name": "Magnetic Mountain",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les artefacts bleus deviennent des créatures.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/magnetic_mountain.jpeg",
    "effectStatus": "unimplemented",
    "id": 333
  },
  {
    "name": "Mijae Djinn",
    "cost": "{R}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Djinn",
    "power": 6,
    "toughness": 3,
    "rarity": "Rare",
    "text_fr": "Quand Mijae Djinn attaque, lancez une pièce. Pile : retirez-le du combat.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/mijae_djinn.jpeg",
    "effectStatus": "unimplemented",
    "id": 334
  },
  {
    "name": "Rukh Egg",
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Bird Egg",
    "power": 0,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "Quand l'Œuf de rukh est envoyé dans un cimetière depuis le jeu, mettez en jeu, à la fin du tour, un jeton de créature 4/4 rouge Rukh.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/rukh_egg.jpeg",
    "effectStatus": "unimplemented",
    "id": 335
  },
  {
    "name": "Ydwen Efreet",
    "cost": "{R}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Efreet",
    "power": 3,
    "toughness": 6,
    "rarity": "Rare",
    "text_fr": "Quand Ydwen Efreet bloque, lancez une pièce. Pile : retirez-le du combat.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ydwen_efreet.jpeg",
    "effectStatus": "unimplemented",
    "id": 336
  },
  {
    "name": "Cyclone",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À l'entretien, mettez un marqueur de bourrasque. Inflige X blessures à chaque créature sans vol (X = marqueurs).",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/cyclone.jpeg",
    "effectStatus": "unimplemented",
    "id": 337
  },
  {
    "name": "Desert Twister",
    "cost": "{4}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Détruisez le permanent ciblé.",
    "effect": {"type": "destroy", "target": "permanent"},
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/desert_twister.jpeg",
    "effectStatus": "implemented",
    "id": 338
  },
  {
    "name": "Drop of Honey",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Au début de l'entretien, détruisez la créature avec la force la plus basse.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/drop_of_honey.jpeg",
    "effectStatus": "unimplemented",
    "id": 339
  },
  {
    "name": "Erhnam Djinn",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Djinn",
    "power": 4,
    "toughness": 5,
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, la créature non-mur ciblée qu'un adversaire contrôle acquiert la traversée des forêts jusqu'au début de votre prochain entretien.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/erhnam_djinn.jpeg",
    "effectStatus": "unimplemented",
    "id": 340
  },
  {
    "name": "Ghazbán Ogre",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Ogre",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Au début de l'entretien, le joueur avec le plus de PV gagne le contrôle de Ghazbân Ogre.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ghazbn_ogre.jpeg",
    "effectStatus": "unimplemented",
    "id": 341
  },
  {
    "name": "Ifh-Bíff Efreet",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Efreet",
    "power": 3,
    "toughness": 3,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol. {G} : inflige 1 blessure à chaque créature avec vol.",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{G}",
        "tap": false,
        "effect": {
          "type": "damageToFliersAndPlayers",
          "amount": 1
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/ifhbff_efreet.jpeg",
    "id": 342
  },
  {
    "name": "Metamorphosis",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Sacrifiez une créature. Ajoutez X manas (X = CMC).",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/metamorphosis.jpeg",
    "effectStatus": "unimplemented",
    "id": 343
  },
  {
    "name": "Nafs Asp",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Snake",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Chaque fois que Nafs Asp blesse un joueur, celui-ci perd 1 PV à son prochain entretien.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/nafs_asp.jpeg",
    "effectStatus": "unimplemented",
    "id": 344
  },
  {
    "name": "Sandstorm",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "La Tempête de sable inflige 1 blessure à chaque créature attaquante.",
    "effect": {"type": "damageAttackers", "amount": 1},
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/sandstorm.jpeg",
    "effectStatus": "implemented",
    "id": 345
  },
  {
    "name": "Singing Tree",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Plant",
    "power": 0,
    "toughness": 3,
    "rarity": "Rare",
    "text_fr": "{T} : la créature attaquante ciblée devient 0/2.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {
          "type": "setBasePT",
          "power": 0,
          "toughness": 2
        }
      }
    ],
    "img": "img/singing_tree.jpeg",
    "id": 346
  },
  {
    "name": "Wyluli Wolf",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Wolf",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{T} : une créature ciblée gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "ARN"
    ],
    "activated": [{ "cost": "{T}", "tap": true, "effect": { "type": "pump", "power": 1, "toughness": 1 } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/wyluli_wolf.jpeg",
    "id": 347
  },
  {
    "name": "Aladdin's Lamp",
    "cost": "{10}",
    "cmc": 10,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{5} : cherchez une carte dans votre bibliothèque et mettez-la en main. Mélangez.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{5}",
        "effect": {
          "type": "searchLibrary"
        }
      }
    ],
    "img": "img/aladdins_lamp.jpeg",
    "id": 348
  },
  {
    "name": "Aladdin's Ring",
    "effectStatus": "implemented",
    "cost": "{8}",
    "cmc": 8,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{8}, {T}: L'Anneau d'Aladdin inflige 4 blessures à une cible, créature ou joueur.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [{"cost": "{8}", "tap": true, "effect": {"type": "damage", "amount": 4, "target": "anyTarget"}}],
    "img": "img/aladdins_ring.jpeg",
    "id": 349
  },
  {
    "name": "Bottle of Suleiman",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, sacrifiez la Bouteille de Salomon : lancez une pièce. Si vous gagnez, créez un jeton de créature-artefact Djinn 5/5 incolore avec le vol. Si vous perdez, la Bouteille de Salomon vous inflige 5 blessures.",
    "effectStatus": "implemented",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": {
          "mana": "{1}",
          "sacrifice": "self"
        },
        "effect": {
          "type": "coinFlip",
          "heads": {
            "type": "createToken",
            "name": "Djinn",
            "subtype": "Djinn",
            "tokenType": "Artifact Creature",
            "color": [],
            "power": 5,
            "toughness": 5,
            "keywords": [
              "flying"
            ]
          },
          "tails": {
            "type": "damageController",
            "amount": 5
          }
        }
      }
    ],
    "img": "img/bottle_of_suleiman.jpeg",
    "id": 350
  },
  {
    "name": "Brass Man",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 1,
    "toughness": 3,
    "rarity": "Uncommon",
    "text_fr": "Ne se dégage pas pendant votre étape de dégagement.\nÀ votre entretien, vous pouvez payer {1}. Si vous le faites, dégagez Brass Man.",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "doesntUntap"
    ],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {
          "controllerUpkeep": true,
          "sourceSelf": true
        },
        "effect": {
          "type": "payToUntap",
          "cost": "{1}"
        }
      }
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/brass_man.jpeg",
    "id": 351
  },
  {
    "name": "City in a Bottle",
    "sets": [
      "ARN"
    ],
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un ou plusieurs autres permanents non-jetons dont le nom a été imprimé à l'origine dans l'extension Arabian Nights se trouvent sur le champ de bataille, leurs contrôleurs les sacrifient. Les joueurs ne peuvent pas lancer de sorts ni jouer de terrains dont le nom a été imprimé à l'origine dans l'extension Arabian Nights.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/city_in_a_bottle.jpeg",
    "effectStatus": "unimplemented",
    "id": 352
  },
  {
    "name": "Dancing Scimitar",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Spirit",
    "power": 1,
    "toughness": 5,
    "rarity": "Rare",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol (Cette créature ne peut être bloquée que par des créatures avec le vol.)",
    "sets": [
      "ARN"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/dancing_scimitar.jpeg",
    "id": 353
  },
  {
    "name": "Ebony Horse",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2} : retirez une créature attaquante du combat.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ebony_horse.jpeg",
    "effectStatus": "unimplemented",
    "id": 354
  },
  {
    "name": "Flying Carpet",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T}: La créature ciblée acquiert le vol jusqu'à la fin du tour.",
    "sets": [
      "ARN"
    ],
    "activated": [{ "cost": "{2}", "tap": true, "effect": { "type": "addKeywordUntilEnd", "keyword": "flying" } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/flying_carpet.jpeg",
    "id": 355
  },
  {
    "name": "Jandor's Ring",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2} : piochez une carte. N'utilisez cette capacité que si vous avez dépensé du mana pour une capacité de Djinn ou d'Efreet ce tour.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/jandors_ring.jpeg",
    "effectStatus": "unimplemented",
    "id": 356
  },
  {
    "name": "Jandor's Saddlebags",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3}, {T}: Dégagez la créature ciblée.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{3}",
        "tap": false,
        "effect": {
          "type": "tapOrUntap",
          "target": "creature",
          "tap": false
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/jandors_saddlebags.jpeg",
    "id": 357
  },
  {
    "name": "Jeweled Bird",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Retirez Jeweled Bird de la partie : mettez une carte ante dans votre cimetière.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/jeweled_bird.jpeg",
    "effectStatus": "unimplemented",
    "id": 358
  },
  {
    "name": "Pyramids",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2} : détruisez un effet qui cible un terrain que vous contrôlez.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/pyramids.jpeg",
    "effectStatus": "unimplemented",
    "id": 359
  },
  {
    "name": "Ring of Ma'rûf",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{5} : cherchez une carte dans votre bibliothèque et mettez-la en main. Mélangez.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{5}",
        "effect": {
          "type": "searchLibrary"
        }
      }
    ],
    "img": "img/ring_of_marf.jpeg",
    "id": 360
  },
  {
    "name": "Sandals of Abdallah",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "La créature équipée a la plaine-marche.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/sandals_of_abdallah.jpeg",
    "effectStatus": "unimplemented",
    "id": 361
  },
  {
    "name": "Bazaar of Baghdad",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : piochez deux cartes, puis défaussez trois cartes.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/bazaar_of_baghdad.jpeg",
    "id": 362
  },
  {
    "name": "City of Brass",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois que la Cité d'airain devient engagée, elle vous inflige 1 blessure.\n{T}: Ajoutez un mana d'une couleur de votre choix à votre réserve.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/city_of_brass.jpeg",
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "any", "amount": 1, "selfDamage": 1}}],
    "effectStatus": "implemented",
    "id": 363
  },
  {
    "name": "Desert",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Common",
    "text_fr": "{T} : Ajoutez {1} à votre réserve.\n{T} : Le Désert inflige 1 blessure à la créature attaquante ciblée. Ne jouez cette capacité que pendant l'étape de fin de combat.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Desert",
    "img": "img/desert.jpeg",
    "produces": "C",
    "activated": [{"cost": "", "tap": true, "onlyDuring": "endOfCombat", "effect": {"type": "damage", "amount": 1, "target": "attackingCreature"}}],
    "effectStatus": "implemented",
    "id": 364
  },
  {
    "name": "Diamond Valley",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T} : sacrifiez une créature. Gagnez des PV égaux à son endurance.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/diamond_valley.jpeg",
    "id": 365
  },
  {
    "name": "Elephant Graveyard",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T} : régénérez une créature Éléphant ou Mammouth ciblée.",
    "sets": [
      "ARN"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/elephant_graveyard.jpeg",
    "id": 366
  },
  {
    "name": "Island of Wak-Wak",
    "effectStatus": "implemented",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 1, "target": "creature", "requireKeyword": "flying"}}],
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T} : inflige 1 blessure à une créature avec vol ciblée.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/island_of_wakwak.jpeg",
    "id": 367
  },
  {
    "name": "Library of Alexandria",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : ajoutez {C}. {T} : piochez une carte. N'utilisez cette capacité que si vous avez exactement sept cartes en main.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/library_of_alexandria.jpeg",
    "produces": "C",
    "activated": [{"cost": "", "tap": true, "onlyIf": {"handSize": 7}, "effect": {"type": "draw", "amount": 1, "target": "self"}}],
    "effectStatus": "implemented",
    "id": 368
  },
  {
    "name": "Oasis",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : prévenez les prochaines 1 blessures d'une créature ciblée.",
    "sets": [
      "ARN"
    ],
    "keywords": [],
    "triggers": [],
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {"type": "preventDamage", "amount": 1, "target": "creature"}
      }
    ],
    "effectStatus": "implemented",
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/oasis.jpeg",
    "id": 369
  },
  {
    "name": "Argivian Archaeologist",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Artificer",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{T} : ramenez un artefact ciblé d'un cimetière dans votre main.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/argivian_archaeologist.jpeg",
    "effectStatus": "unimplemented",
    "id": 370
  },
  {
    "name": "Argivian Blacksmith",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Artificer",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "{T} : prévenez les prochaines 2 blessures d'un artefact ciblé.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/argivian_blacksmith.jpeg",
    "effectStatus": "unimplemented",
    "id": 371
  },
  {
    "name": "Artifact Ward",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature.\nLa créature enchantée a la protection contre les artefacts.",
    "sets": [
      "ATQ"
    ],
    "effect": {"type": "addKeyword", "target": "creature", "keywords": ["protectionartifacts"]},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/artifact_ward.jpeg",
    "effectStatus": "implemented",
    "id": 372
  },
  {
    "name": "Circle of Protection: Artifacts",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{2} : La prochaine fois qu'une source artefact de votre choix devrait vous blesser ce tour-ci, prévenez ces blessures.",
    "activated": [
      {
        "cost": "{2}",
        "tap": false,
        "effect": {
          "type": "preventNextDamageFromArtifact"
        }
      }
    ],
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/circle_of_protection_artifacts.jpeg",
    "id": 373
  },
  {
    "name": "Damping Field",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les artefacts ne peuvent pas être engagés. Les créatures engagent pour attaquer coûtent {1} de plus.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/damping_field.jpeg",
    "effectStatus": "unimplemented",
    "id": 374
  },
  {
    "name": "Martyrs of Korlis",
    "cost": "{3}{W}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": 6,
    "rarity": "Uncommon",
    "text_fr": "Banding. Vous pouvez rediriger les blessures infligées à vous vers Martyrs of Korlis.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/martyrs_of_korlis.jpeg",
    "effectStatus": "unimplemented",
    "id": 375
  },
  {
    "name": "Reverse Polarity",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Gagnez des PV égaux aux blessures infligées par des artefacts ce tour-ci.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/reverse_polarity.jpeg",
    "effectStatus": "unimplemented",
    "id": 376
  },
  {
    "name": "Drafna's Restoration",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Remettez jusqu'à trois cartes artefact ciblées d'un cimetière dans la bibliothèque de leur propriétaire.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/drafnas_restoration.jpeg",
    "effectStatus": "unimplemented",
    "id": 377
  },
  {
    "name": "Energy Flux",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À l'entretien, les artefacts perdent un marqueur de charge. Les artefacts sans marqueur sont détruits.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/energy_flux.jpeg",
    "effectStatus": "unimplemented",
    "id": 378
  },
  {
    "name": "Hurkyl's Recall",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Renvoyez tous les artefacts que le joueur ciblé possède dans sa main.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/hurkyls_recall.jpeg",
    "effectStatus": "unimplemented",
    "id": 379
  },
  {
    "name": "Power Artifact",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les coûts d'activation de l'artefact enchanté coûtent {2} de moins.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/power_artifact.jpeg",
    "effectStatus": "unimplemented",
    "id": 380
  },
  {
    "name": "Reconstruction",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Ramenez un artefact ciblé d'un cimetière dans votre main.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/reconstruction.jpeg",
    "effectStatus": "unimplemented",
    "id": 381
  },
  {
    "name": "Sage of Lat-Nam",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Human Artificer",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "activated": [
      {
        "cost": "{U}{U}",
        "tap": true,
        "effect": {
          "type": "draw",
          "amount": 1,
          "target": "self"
        }
      }
    ],
    "text_fr": "{T}, Sacrifiez un artefact : Piochez une carte.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/sage_of_latnam.jpeg",
    "id": 382
  },
  {
    "name": "Transmute Artifact",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez un artefact. Cherchez un artefact dans votre bibliothèque et mettez-le en jeu.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/transmute_artifact.jpeg",
    "effectStatus": "unimplemented",
    "id": 383
  },
  {
    "name": "Artifact Possession",
    "sets": [
      "ATQ"
    ],
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : artefact. À chaque fois que l'artefact enchanté est engagé ou qu'un joueur active une capacité de l'artefact enchanté sans {T} dans son coût d'activation, cette Aura inflige 2 blessures au contrôleur de cet artefact.",
    "keywords": [],
    "effect": {
      "type": "enchant",
      "target": "artifact"
    },
    "triggers": [
      {
        "event": "permanentTapped",
        "condition": {
          "enchantedBecomesTapped": true
        },
        "effect": {
          "type": "damageEventPlayer",
          "amount": 2
        }
      },
      {
        "event": "artifactAbilityActivated",
        "condition": {
          "enchantedBecomesTapped": true,
          "withoutTapCost": true
        },
        "effect": {
          "type": "damageEventPlayer",
          "amount": 2
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/artifact_possession.jpeg",
    "effectStatus": "implemented",
    "id": 384
  },
  {
    "name": "Gate to Phyrexia",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez une créature : détruisez un artefact ciblé.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/gate_to_phyrexia.jpeg",
    "effectStatus": "unimplemented",
    "id": 385
  },
  {
    "name": "Haunting Wind",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Chaque fois qu'un artefact devient engagé ou qu'un joueur active une capacité d'un artefact sans {T} dans son coût d'activation, Haunting Wind inflige 1 blessure au contrôleur de cet artefact.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [{"event": "permanentTapped", "condition": {"permanentIsArtifact": true}, "effect": {"type": "damageEventPlayer", "amount": 1}}, {"event": "artifactAbilityActivated", "condition": {"withoutTapCost": true}, "effect": {"type": "damageEventPlayer", "amount": 1}}],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/haunting_wind.jpeg",
    "effectStatus": "implemented",
    "id": 386
  },
  {
    "name": "Phyrexian Gremlins",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Phyrexian Gremlin",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Vous pouvez choisir de ne pas détourner Phyrexian Gremlins. {B}{B} : engagez un artefact ciblé.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/phyrexian_gremlins.jpeg",
    "effectStatus": "unimplemented",
    "id": 387
  },
  {
    "name": "Priest of Yawgmoth",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Phyrexian Human Cleric",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "{T}, sacrifiez un artefact : ajoutez un nombre de {B} égal à la valeur de mana de l'artefact sacrifié.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/priest_of_yawgmoth.jpeg",
    "effectStatus": "implemented",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": {"type": "Artifact", "choose": true}}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "B", "amount": 0, "amountFrom": "sacrificedManaValue"}}],
    "id": 388
  },
  {
    "name": "Xenic Poltergeist",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Spirit",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{T} : un artefact ciblé devient une créature avec force et endurance égales à son CMC.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/xenic_poltergeist.jpeg",
    "effectStatus": "unimplemented",
    "id": 389
  },
  {
    "name": "Yawgmoth Demon",
    "sets": [
      "ATQ"
    ],
    "cost": "{4}{B}{B}",
    "cmc": 6,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vol (Cette créature ne peut être bloquée que par des créatures avec le vol.)\nInitiative (Cette créature inflige des blessures de combat avant les créatures sans l'initiative.)\nAu début de votre entretien, vous pouvez sacrifier un artefact. Si vous ne le faites pas, engagez le Démon de Yaugzebul et il vous inflige 2 blessures.",
    "keywords": [
      "flying",
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "subtype": "Phyrexian Demon",
    "power": 6,
    "toughness": 6,
    "img": "img/yawgmoth_demon.jpeg",
    "id": 390
  },
  {
    "name": "Artifact Blast",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Contrecarrez un sort d'artefact ciblé.",
    "effect": {"type": "counterSpell", "condition": "artifactSpell"},
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/artifact_blast.jpeg",
    "effectStatus": "implemented",
    "id": 391
  },
  {
    "name": "Atog",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Atog",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Sacrifiez un artefact : L'Atog gagne +2/+2 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/atog.jpeg",
    "effectStatus": "unimplemented",
    "id": 392
  },
  {
    "name": "Detonate",
    "cost": "{X}{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "xSpell": true,
    "text_fr": "Détruisez l'artefact ciblé ayant un coût converti de mana de X. Elle ne peut pas être régénérée. La Détonation inflige X blessures au contrôleur de cet artefact.",
    "effect": {
      "type": "destroy",
      "target": "artifact"
    },
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/detonate.jpeg",
    "id": 393
  },
  {
    "name": "Dwarven Weaponsmith",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Dwarf Artificer",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{T} : sacrifiez un artefact. Mettez un marqueur +1/+1 sur une créature ciblée.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/dwarven_weaponsmith.jpeg",
    "effectStatus": "unimplemented",
    "id": 394
  },
  {
    "name": "Goblin Artisans",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin Artificer",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{T} : annulez un sort d'artefact ciblé. Lancez une pièce. Pile : détruisez-le.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_artisans.jpeg",
    "effectStatus": "unimplemented",
    "id": 395
  },
  {
    "name": "Orcish Mechanics",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": {"type": "Artifact"}}, "tap": true, "effect": {"type": "damage", "amount": 2, "target": "anyTarget"}}],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orc",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{T} : sacrifiez un artefact. Inflige 2 blessures à n'importe quelle cible.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/orcish_mechanics.jpeg",
    "effectStatus": "implemented",
    "id": 396
  },
  {
    "name": "Shatterstorm",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez tous les artefacts. Ils ne peuvent pas être régénérés.",
    "effect": {"type": "destroyAllMatching", "cardType": "Artifact", "noRegen": true},
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/shatterstorm.jpeg",
    "effectStatus": "implemented",
    "id": 397
  },
  {
    "name": "Argothian Pixies",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Faerie",
    "power": 2,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [],
    "text_fr": "Vol. La protection contre les artefacts.",
    "sets": [
      "ATQ"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/argothian_pixies.jpeg",
    "id": 398
  },
  {
    "name": "Argothian Treefolk",
    "cost": "{3}{G}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Treefolk",
    "power": 3,
    "toughness": 5,
    "rarity": "Common",
    "text_fr": "La protection contre les artefacts.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/argothian_treefolk.jpeg",
    "effectStatus": "unimplemented",
    "id": 399
  },
  {
    "name": "Citanul Druid",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human Druid",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "Chaque fois qu'un joueur active une capacité d'artefact, Citanul Druid gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/citanul_druid.jpeg",
    "effectStatus": "unimplemented",
    "id": 400
  },
  {
    "name": "Crumble",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez l'artefact ciblé. Son contrôleur gagne autant de PV que son CMC.",
    "effect": {"type": "destroy", "target": "artifact", "gainLifeCmc": "controller"},
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/crumble.jpeg",
    "effectStatus": "implemented",
    "id": 401
  },
  {
    "name": "Gaea's Avenger",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Treefolk",
    "power": "1+*",
    "toughness": "1+*",
    "rarity": "Rare",
    "text_fr": "Force et endurance égales au nombre d'artefacts que l'adversaire contrôle.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/gaeas_avenger.jpeg",
    "effectStatus": "unimplemented",
    "id": 402
  },
  {
    "name": "Powerleech",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Chaque fois qu'un joueur active une capacité d'artefact, gagnez 1 PV.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/powerleech.jpeg",
    "effectStatus": "unimplemented",
    "id": 403
  },
  {
    "name": "Titania's Song",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Tous les artefacts non-créatures deviennent des créatures 4/4.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "static": [
      {
        "type": "animateArtifacts",
        "power": 4,
        "toughness": 4
      }
    ],
    "img": "img/titanias_song.jpeg",
    "id": 404
  },
  {
    "name": "Amulet of Kroog",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Common",
    "text_fr": "{2} : prévenez les prochaines 1 blessures d'une créature ciblée.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/amulet_of_kroog.jpeg",
    "effectStatus": "unimplemented",
    "id": 405
  },
  {
    "name": "Armageddon Clock",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, mettez un marqueur sur Armageddon Clock. À votre entretien, inflige X blessures à chaque joueur (X = marqueurs).",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/armageddon_clock.jpeg",
    "effectStatus": "unimplemented",
    "id": 406
  },
  {
    "name": "Ashnod's Altar",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez une créature : Ajoutez {C}{C}.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ashnods_altar.jpeg",
    "effectStatus": "unimplemented",
    "id": 407
  },
  {
    "name": "Ashnod's Battle Gear",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Vous pouvez choisir de ne pas détourner une créature équipée. {2} : +2/-2 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ashnods_battle_gear.jpeg",
    "effectStatus": "unimplemented",
    "id": 408
  },
  {
    "name": "Ashnod's Transmogrant",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T} : la créature ciblée devient un artefact.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ashnods_transmogrant.jpeg",
    "effectStatus": "unimplemented",
    "id": 409
  },
  {
    "name": "Battering Ram",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Banding. Si Battering Ram est bloqué par un mur, détruisez ce mur.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/battering_ram.jpeg",
    "effectStatus": "unimplemented",
    "id": 410
  },
  {
    "name": "Bronze Tablet",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{4} : échangez le contrôle de Bronze Tablet et d'un artefact ciblé.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/bronze_tablet.jpeg",
    "effectStatus": "unimplemented",
    "id": 411
  },
  {
    "name": "Candelabra of Tawnos",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{X} : dégagez X terrains ciblés.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{X}",
        "effect": {
          "type": "untapX",
          "targetType": "land"
        }
      }
    ],
    "img": "img/candelabra_of_tawnos.jpeg",
    "id": 412
  },
  {
    "name": "Clay Statue",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Golem",
    "power": 3,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{2} : régénérez.",
    "activated": [
      {
        "cost": "{2}",
        "tap": false,
        "effect": {
          "type": "regenerateShield"
        }
      }
    ],
    "sets": [
      "ATQ"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/clay_statue.jpeg",
    "id": 413
  },
  {
    "name": "Clockwork Avian",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Bird",
    "power": 0,
    "toughness": 4,
    "rarity": "Rare",
    "text_fr": "Arrive avec quatre marqueurs +1/+1. Vol. Quand il attaque ou bloque, retirez un marqueur.",
    "sets": [
      "ATQ"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/clockwork_avian.jpeg",
    "id": 414
  },
  {
    "name": "Colossus of Sardia",
    "cost": "{9}",
    "cmc": 9,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Golem",
    "power": 9,
    "toughness": 9,
    "rarity": "Rare",
    "text_fr": "Piétinement (Si cette créature inflige suffisamment de blessures de combat à ses bloqueurs pour les détruire, vous pouvez faire qu'elle inflige le reste de ses blessures au joueur défenseur.)\nLe Colosse de Sardie ne se dégage pas pendant votre étape de dégagement.\n{9} : Dégagez le Colosse de Sardie. Ne jouez cette capacité que pendant votre entretien.",
    "effectStatus": "implemented",
    "sets": [
      "ATQ"
    ],
    "keywords": ["trample", "doesntUntap"],
    "activated": [{"cost": "{9}", "tap": false, "onlyDuring": "ownUpkeep", "effect": {"type": "untapSelf"}}],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/colossus_of_sardia.jpeg",
    "id": 415
  },
  {
    "name": "Coral Helm",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3} : défaussez une carte au hasard. La créature ciblée gagne +2/+2 ou +0/-1.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/coral_helm.jpeg",
    "effectStatus": "unimplemented",
    "id": 416
  },
  {
    "name": "Cursed Rack",
    "sets": [
      "ATQ"
    ],
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Au moment où cet artefact arrive sur le champ de bataille, choisissez un adversaire. La taille maximale de la main du joueur choisi est de quatre cartes.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/cursed_rack.jpeg",
    "effectStatus": "unimplemented",
    "id": 417
  },
  {
    "name": "Dragon Engine",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Dragon Construct",
    "power": 1,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "{2} : Le Dragon-machine gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "activated": [{ "cost": "{2}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 0 } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/dragon_engine.jpeg",
    "id": 418
  },
  {
    "name": "Feldon's Cane",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T}, retirez la Canne de Feldonn de la partie : Mélangez votre cimetière dans votre bibliothèque.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/feldons_cane.jpeg",
    "effectStatus": "unimplemented",
    "id": 419
  },
  {
    "name": "Golgothian Sylex",
    "sets": [
      "ATQ"
    ],
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T} : Chaque permanent non-jeton dont le nom a été imprimé à l'origine dans l'extension Antiquities est sacrifié par son contrôleur.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/golgothian_sylex.jpeg",
    "effectStatus": "unimplemented",
    "id": 420
  },
  {
    "name": "Grapeshot Catapult",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 2,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "{T}: La Catapulte à mitraille inflige 1 blessure à la créature avec le vol ciblée.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{T}",
        "tap": true,
        "effect": {
          "type": "damage",
          "amount": 1,
          "target": "creature",
          "requireKeyword": "flying"
        }
      }
    ],
    "effectStatus": "implemented",
    "img": "img/grapeshot_catapult.jpeg",
    "id": 421
  },
  {
    "name": "Ivory Tower",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, vous gagnez X points de vie, X étant le nombre de cartes dans votre main moins 4.",
    "effectStatus": "implemented",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [{"event": "upkeepStarted", "condition": {"kind": "controllerUpkeep", "controllerSelf": true}, "effect": {"type": "upkeepGainByHand", "threshold": 4}}],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ivory_tower.jpeg",
    "id": 422
  },
  {
    "name": "Jalum Tome",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T}: Piochez une carte, puis défaussez-vous d'une carte de votre main.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{2}",
        "effect": {
          "type": "draw",
          "amount": 1,
          "then": {
            "type": "discard",
            "amount": 1
          }
        }
      }
    ],
    "subtype": "Book",
    "img": "img/jalum_tome.jpeg",
    "id": 423
  },
  {
    "name": "Mightstone",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Les créatures attaquantes gagnent +1/+0.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/mightstone.jpeg",
    "effectStatus": "unimplemented",
    "id": 424
  },
  {
    "name": "Millstone",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T}: Le joueur ciblé met dans son cimetière les deux cartes du dessus de sa bibliothèque.",
    "sets": [
      "ATQ"
    ],
    "keywords": [
      "mill"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [
      {
        "cost": "{2}",
        "effect": {
          "type": "mill",
          "amount": 2,
          "target": "opponent"
        }
      }
    ],
    "img": "img/millstone.jpeg",
    "id": 425
  },
  {
    "name": "Mishra's War Machine",
    "cost": "{7}",
    "cmc": 7,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Juggernaut",
    "power": 5,
    "toughness": 5,
    "rarity": "Rare",
    "text_fr": "Banding. À l'entretien, sacrifiez un terrain ou inflige 3 blessures à vous.",
    "sets": [
      "ATQ"
    ],
    "keywords": [
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/mishras_war_machine.jpeg",
    "id": 426
  },
  {
    "name": "Obelisk of Undoing",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{6} : renvoyez un artefact ciblé, une créature ciblée et un terrain ciblé dans la main de leur propriétaire.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/obelisk_of_undoing.jpeg",
    "effectStatus": "unimplemented",
    "id": 427
  },
  {
    "name": "Onulet",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 2,
    "toughness": 2,
    "rarity": "Uncommon",
    "text_fr": "Quand Onulet meurt, gagnez 2 PV.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [{"event": "creatureDied", "condition": {"sourceSelf": true}, "effect": {"type": "gainLife", "amount": 2, "target": "self"}}],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/onulet.jpeg",
    "effectStatus": "implemented",
    "id": 428
  },
  {
    "name": "Ornithopter",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Thopter",
    "power": 0,
    "toughness": 2,
    "rarity": "Common",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol",
    "sets": [
      "ATQ"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/ornithopter.jpeg",
    "id": 429
  },
  {
    "name": "Primal Clay",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Shapeshifter",
    "power": "*",
    "toughness": "*",
    "rarity": "Uncommon",
    "text_fr": "Arrive en jeu comme 3/3, 2/2 vol, ou 1/6 défenseur.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/primal_clay.jpeg",
    "effectStatus": "unimplemented",
    "id": 430
  },
  {
    "name": "Rakalite",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2} : prévenez les prochaines 1 blessures d'une cible. Retirez Rakalite de la partie.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/rakalite.jpeg",
    "effectStatus": "unimplemented",
    "id": 431
  },
  {
    "name": "Rocket Launcher",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{4} : sacrifiez Rocket Launcher. Inflige 1 blessure à n'importe quelle cible.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/rocket_launcher.jpeg",
    "effectStatus": "unimplemented",
    "id": 432
  },
  {
    "name": "Shapeshifter",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Shapeshifter",
    "power": "*",
    "toughness": "7-*",
    "rarity": "Rare",
    "text_fr": "As it enters the battlefield, choose a number. Its power and toughness are each equal to that number.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/shapeshifter.jpeg",
    "effectStatus": "unimplemented",
    "id": 433
  },
  {
    "name": "Staff of Zegon",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Common",
    "text_fr": "{3}, {T} : la créature ciblée gagne -2/-0 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "activated": [{ "cost": "{3}", "tap": true, "effect": { "type": "pump", "power": -2, "toughness": 0, "target": "creature" } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/staff_of_zegon.jpeg",
    "id": 434
  },
  {
    "name": "Su-Chi",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 4,
    "toughness": 4,
    "rarity": "Uncommon",
    "sets": [
      "ATQ"
    ],
    "text_fr": "Quand Su-Chi meurt, ajoutez {C}{C}{C}{C}.",
    "keywords": [],
    "triggers": [{"event": "creatureDied", "condition": {"sourceSelf": true}, "effect": {"type": "mana", "color": "C", "amount": 4}}],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/suchi.jpeg",
    "effectStatus": "implemented",
    "id": 435
  },
  {
    "name": "Tablet of Epityr",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Common",
    "text_fr": "{1} : regardez les quatre cartes du dessus de votre bibliothèque.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tablet_of_epityr.jpeg",
    "effectStatus": "unimplemented",
    "id": 436
  },
  {
    "name": "Tawnos's Coffin",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3} : exilez une créature ciblée. {3} : remettez-la en jeu.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tawnoss_coffin.jpeg",
    "effectStatus": "unimplemented",
    "id": 437
  },
  {
    "name": "Tawnos's Wand",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : la créature ciblée de force 2 ou moins ne peut pas être bloquée ce tour-ci.",
    "effectStatus": "implemented",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "addKeywordUntilEnd", "keyword": "unblockable", "target": "creature", "requireMaxPower": 2}}],
    "img": "img/tawnoss_wand.jpeg",
    "id": 438
  },
  {
    "name": "Tawnos's Weaponry",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2} : les créatures que vous contrôlez gagnent +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tawnoss_weaponry.jpeg",
    "effectStatus": "unimplemented",
    "id": 439
  },
  {
    "name": "Tetravus",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "Vol. Arrive avec trois jetons Tétravite 1/1 avec vol.",
    "effectStatus": "implemented",
    "sets": [
      "ATQ"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [{"event": "permanentEntered", "condition": {"sourceSelf": true}, "effect": {"type": "createToken", "amount": 3, "name": "Tetravite", "subtype": "Tetravite", "tokenType": "Artifact Creature", "color": [], "power": 1, "toughness": 1, "keywords": ["flying"]}}],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/tetravus.jpeg",
    "id": 440
  },
  {
    "name": "The Rack",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Au moment où le Chevalet de torture arrive en jeu, choisissez un adversaire.\nAu début de l'entretien du joueur choisi, le Chevalet de torture inflige X blessures à ce joueur, X étant 3 moins le nombre de cartes dans sa main.",
    "effectStatus": "implemented",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [{"event": "upkeepStarted", "condition": {"controllerUpkeep": false}, "effect": {"type": "upkeepDamageByHandDeficit", "base": 3}}],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/the_rack.jpeg",
    "id": 441
  },
  {
    "name": "Triskelion",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Construct",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "Le Triskèle arrive en jeu avec trois marqueurs +1/+1 sur lui.\nRetirez un marqueur +1/+1 du Triskèle : Le Triskèle inflige une blessure à une cible, créature ou joueur.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/triskelion.jpeg",
    "effectStatus": "unimplemented",
    "id": 442
  },
  {
    "name": "Urza's Avenger",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Shapeshifter",
    "power": 4,
    "toughness": 4,
    "rarity": "Rare",
    "text_fr": "{0} : Urza's Avenger gagne -1/-1 et la capacité de votre choix parmi la bande, le vol, l'initiative ou le piétinement jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "activated": [{"cost": "{0}", "tap": false, "effect": {"type": "chooseKeywordUntilEnd", "selfPower": -1, "selfToughness": -1, "options": ["flying", "trample", "first strike", "banding"]}}],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/urzas_avenger.jpeg",
    "effectStatus": "implemented",
    "id": 443
  },
  {
    "name": "Urza's Chalice",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Common",
    "text_fr": "Chaque fois qu'un joueur joue un sort vert, vous pouvez payer {2}. Si vous le faites, gagnez 1 PV.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/urzas_chalice.jpeg",
    "effectStatus": "unimplemented",
    "id": 444
  },
  {
    "name": "Urza's Miter",
    "sets": [
      "ATQ"
    ],
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un artefact que vous contrôlez est mis dans un cimetière depuis le champ de bataille, s'il n'a pas été sacrifié, vous pouvez payer {3}. Si vous faites ainsi, piochez une carte.",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/urzas_miter.jpeg",
    "effectStatus": "unimplemented",
    "id": 445
  },
  {
    "name": "Wall of Spears",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Wall",
    "power": 2,
    "toughness": 3,
    "rarity": "Uncommon",
    "keywords": [
      "firstStrike",
      "defender"
    ],
    "text_fr": "(Les murs ne peuvent pas attaquer.)\nInitiative",
    "sets": [
      "ATQ"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/wall_of_spears.jpeg",
    "id": 446
  },
  {
    "name": "Weakstone",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Les créatures bloqueuses gagnent -1/-0.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/weakstone.jpeg",
    "effectStatus": "unimplemented",
    "id": 447
  },
  {
    "name": "Yotian Soldier",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Soldier",
    "power": 1,
    "toughness": 4,
    "rarity": "Common",
    "text_fr": "Attaquer avec ce Soldat yotien ne le fait pas s'engager.",
    "sets": [
      "ATQ"
    ],
    "keywords": [
      "vigilance"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/yotian_soldier.jpeg",
    "id": 448
  },
  {
    "name": "Mishra's Factory",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {1} à votre réserve.\n{1} : L'Usine de Mishra devient une créature-artefact 2/2 Ouvrier spécialisé jusqu'à la fin du tour. C'est toujours un terrain.\n{T} : La créature Ouvrier spécialisé ciblée gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/mishras_factory.jpeg",
    "id": 449
  },
  {
    "name": "Mishra's Workshop",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T} : ajoutez {C}{C}{C}. Ne peut être utilisé que pour jouer des artefacts.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/mishras_workshop.jpeg",
    "id": 450
  },
  {
    "name": "Strip Mine",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {C}.\n{T}, sacrifiez la Mine des morts-terrains : Détruisez le terrain ciblé.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/strip_mine.jpeg",
    "produces": "C",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": "self"}, "tap": true, "effect": {"type": "destroy", "target": "land"}}],
    "effectStatus": "implemented",
    "id": 451
  },
  {
    "name": "Urza's Mine",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {1} à votre réserve. Si vous contrôlez une centrale énergétique d'Urza et une tour d'Urza, ajoutez {2} à votre réserve à la place.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Urza's Mine",
    "img": "img/urzas_mine.jpeg",
    "produces": "C",
    "manaIf": {"controls": ["Urza's Power Plant", "Urza's Tower"], "amount": 2},
    "effectStatus": "implemented",
    "id": 452
  },
  {
    "name": "Urza's Power Plant",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Common",
    "text_fr": "{T} : Ajoutez {1} à votre réserve. Si vous contrôlez une mine d'Urza et une tour d'Urza, ajoutez {2} à votre réserve à la place.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Urza's Power-Plant",
    "img": "img/urzas_power_plant.jpeg",
    "produces": "C",
    "manaIf": {"controls": ["Urza's Mine", "Urza's Tower"], "amount": 2},
    "effectStatus": "implemented",
    "id": 453
  },
  {
    "name": "Urza's Tower",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Common",
    "text_fr": "{T} : Ajoutez {1} à votre réserve. Si vous contrôlez une mine d'Urza et une centrale énergétique d'Urza, ajoutez {3} à votre réserve à la place.",
    "sets": [
      "ATQ"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Urza's Tower",
    "img": "img/urzas_tower.jpeg",
    "produces": "C",
    "manaIf": {"controls": ["Urza's Mine", "Urza's Power Plant"], "amount": 3},
    "effectStatus": "implemented",
    "id": 454
  },
  {
    "name": "Akron Legionnaire",
    "cost": "{6}{W}{W}",
    "cmc": 8,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "À l'exception des créatures nommées Akron Legionnaire et des créatures-artefacts, les créatures que vous contrôlez ne peuvent pas attaquer.",
    "sets": [
      "LEG"
    ],
    "subtype": "Giant Soldier",
    "power": 8,
    "toughness": 4,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/akron_legionnaire.jpeg",
    "id": 455
  },
  {
    "name": "Alabaster Potion",
    "cost": "{X}{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Choisissez l'un —\n• Le joueur ciblé gagne X points de vie.\n• Prévenez les X prochaines blessures qui devraient être infligées à n'importe quelle cible ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/alabaster_potion.jpeg",
    "id": 456
  },
  {
    "name": "Amrou Kithkin",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Kithkin",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [],
    "sets": [
      "LEG"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "text_fr": "Cette créature ne peut pas être bloquée par des créatures de force 3 ou plus.",
    "static": [
      {
        "type": "cantBeBlockedByPowerAtLeast",
        "power": 3
      }
    ],
    "effectStatus": "implemented",
    "img": "img/amrou_kithkin.jpeg",
    "id": 457
  },
  {
    "name": "Angelic Voices",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures que vous contrôlez gagnent +1/+1 tant que vous ne contrôlez aucune créature non-artefact et non-blanche.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/angelic_voices.jpeg",
    "id": 458
  },
  {
    "name": "Cleanse",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez toutes les créatures noires.",
    "effect": {"type": "destroyAllMatching", "cardType": "Creature", "color": "B"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/cleanse.jpeg",
    "id": 459
  },
  {
    "name": "Clergy of the Holy Nimbus",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Si cette créature devait être détruite, régénérez-la à la place. {1} : Cette créature ne peut pas être régénérée ce tour-ci. Seuls vos adversaires peuvent activer cette capacité.",
    "sets": [
      "LEG"
    ],
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/clergy_of_the_holy_nimbus.jpeg",
    "id": 460
  },
  {
    "name": "D'Avenant Archer",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 1, "target": "attackingOrBlockingCreature"}}],
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{T} : Cette créature inflige 1 blessure à la créature ciblée attaquante ou bloqueuse.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Soldier Archer",
    "power": 1,
    "toughness": 2,
    "img": "img/davenant_archer.jpeg",
    "id": 461
  },
  {
    "name": "Divine Intervention",
    "cost": "{6}{W}{W}",
    "cmc": 8,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Cet enchantement arrive sur le champ de bataille avec deux marqueurs d'intervention. Au début de votre entretien, retirez un marqueur d'intervention de cet enchantement. Quand vous retirez le dernier marqueur d'intervention de cet enchantement, la partie est nulle.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/divine_intervention.jpeg",
    "id": 462
  },
  {
    "name": "Divine Offering",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez l'artefact ciblé. Vous gagnez autant de points de vie que son coût converti de mana.",
    "effect": {"type": "destroy", "target": "artifact", "gainLifeCmc": "caster"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/divine_offering.jpeg",
    "id": 463
  },
  {
    "name": "Divine Transformation",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/divine_transformation.jpeg",
    "text_fr": "Enchanter : créature. La créature enchantée gagne +3/+3.",
    "effect": {"type": "pump", "power": 3, "toughness": 3, "target": "creature"},
    "effectStatus": "implemented",
    "id": 464
  },
  {
    "name": "Elder Land Wurm",
    "cost": "{4}{W}{W}{W}",
    "cmc": 7,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Défenseur, piétinement. Quand cette créature bloque, elle perd le défenseur.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "trample",
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Dragon Wurm",
    "power": 5,
    "toughness": 5,
    "img": "img/elder_land_wurm.jpeg",
    "id": 465
  },
  {
    "name": "Enchanted Being",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Prévenez toutes les blessures de combat qui devraient être infligées à cette créature par des créatures enchantées.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human",
    "power": 2,
    "toughness": 2,
    "img": "img/enchanted_being.jpeg",
    "id": 466
  },
  {
    "name": "Equinox",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : terrain. Le terrain enchanté a « {T} : Contrecarrez le sort ciblé s'il devait détruire un terrain que vous contrôlez. »",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Aura",
    "img": "img/equinox.jpeg",
    "id": 467
  },
  {
    "name": "Fortified Area",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures Mur que vous contrôlez gagnent +1/+0 et ont le regroupement. (N'importe quelles créatures avec le regroupement, et jusqu'à une sans, peuvent attaquer en groupe. Les groupes sont bloqués comme un tout. Si une créature avec le regroupement que vous contrôlez bloque une créature ou est bloquée par elle, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/fortified_area.jpeg",
    "id": 468
  },
  {
    "name": "Glyph of Life",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Choisissez une créature Mur ciblée. À chaque fois que cette créature subit des blessures d'une créature attaquante ce tour-ci, vous gagnez autant de points de vie.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/glyph_of_life.jpeg",
    "id": 469
  },
  {
    "name": "Great Defender",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "La créature ciblée gagne +0/+X jusqu'à la fin du tour, X étant sa valeur de mana.",
    "effect": {"type": "pump", "target": "creature", "power": 0, "toughnessFrom": "cmc"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/great_defender.jpeg",
    "id": 470
  },
  {
    "name": "Great Wall",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures avec la traversée des plaines peuvent être bloquées comme si elles n'avaient pas la traversée des plaines.",
    "static": {"type": "ignoreLandwalk", "landwalk": "plainswalk"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/great_wall.jpeg",
    "id": 471
  },
  {
    "name": "Greater Realm of Preservation",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{1}{W} : La prochaine fois qu'une source noire ou rouge de votre choix devrait vous infliger des blessures ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/greater_realm_of_preservation.jpeg",
    "id": 472
  },
  {
    "name": "Heaven's Gate",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Les créatures ciblées gagnent le vol jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/heavens_gate.jpeg",
    "effectStatus": "unimplemented",
    "id": 473
  },
  {
    "name": "Holy Day",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Prévenez toutes les blessures de combat qui devraient être infligées ce tour-ci.",
    "effect": {"type": "fog"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/holy_day.jpeg",
    "id": 474
  },
  {
    "name": "Indestructible Aura",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Prévenez toutes les blessures qui devraient être infligées à la créature ciblée ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/indestructible_aura.jpeg",
    "id": 475
  },
  {
    "name": "Infinite Authority",
    "cost": "{W}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter : créature. À chaque fois que la créature enchantée bloque ou est bloquée par une créature d'endurance 3 ou moins, détruisez l'autre créature à la fin du combat. Au début de la prochaine étape de fin de tour, si cette créature a été détruite ainsi, mettez un marqueur +1/+1 sur la première créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
        "effect": {
      "type": "enchant",
      "target": "creature"
    },
    "triggers": [
      {
        "event": "creatureBlocked",
        "condition": {"enchantedInBlock": true, "otherMaxToughness": 3},
        "effect": {"type": "destroyOtherAtEndOfCombat", "thenCounter": true}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/infinite_authority.jpeg",
    "id": 476
  },
  {
    "name": "Ivory Guardians",
    "cost": "{4}{W}{W}",
    "cmc": 6,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Protection contre le rouge. Les créatures nommées Ivory Guardians gagnent +1/+1 tant qu'un adversaire contrôle un permanent rouge non-jeton.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "protectionR"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Giant Cleric",
    "power": 3,
    "toughness": 3,
    "img": "img/ivory_guardians.jpeg",
    "id": 477
  },
  {
    "name": "Keepers of the Faith",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human Cleric",
    "power": 2,
    "toughness": 3,
    "img": "img/keepers_of_the_faith.jpeg",
    "id": 478
  },
  {
    "name": "Kismet",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les artefacts, créatures et terrains que vos adversaires contrôlent arrivent engagés sur le champ de bataille.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/kismet.jpeg",
    "id": 479
  },
  {
    "name": "Land Tax",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, si un adversaire contrôle plus de terrains que vous, vous pouvez chercher dans votre bibliothèque jusqu'à trois cartes de terrain de base, les révéler, les mettre dans votre main et mélanger ensuite votre bibliothèque.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/land_tax.jpeg",
    "id": 480
  },
  {
    "name": "Lifeblood",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'une montagne contrôlée par un adversaire est engagée, vous gagnez 1 point de vie.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/lifeblood.jpeg",
    "id": 481
  },
  {
    "name": "Moat",
    "static": [{"type": "cantAttackUnlessKeyword", "keyword": "flying"}],
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures sans le vol ne peuvent pas attaquer.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/moat.jpeg",
    "id": 482
  },
  {
    "name": "Osai Vultures",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Vol. Au début de chaque étape de fin de tour, si une créature est morte ce tour-ci, mettez un marqueur de charogne sur cette créature. Retirez deux marqueurs de charogne de cette créature : Cette créature gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Bird",
    "power": 1,
    "toughness": 1,
    "img": "img/osai_vultures.jpeg",
    "id": 483
  },
  {
    "name": "Petra Sphinx",
    "cost": "{2}{W}{W}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Le joueur ciblé choisit un nom de carte, puis révèle la carte du dessus de sa bibliothèque. Si cette carte a le nom choisi, ce joueur la met dans sa main. Sinon, le joueur la met dans son cimetière.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Sphinx",
    "power": 3,
    "toughness": 4,
    "img": "img/petra_sphinx.jpeg",
    "id": 484
  },
  {
    "name": "Presence of the Master",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un joueur lance un sort d'enchantement, contrecarrez-le.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/presence_of_the_master.jpeg",
    "id": 485
  },
  {
    "name": "Rapid Fire",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Lancez ce sort uniquement avant que les bloqueurs ne soient déclarés. La créature ciblée gagne l'initiative jusqu'à la fin du tour. Si elle n'a pas la sauvagerie, cette créature gagne la sauvagerie 2 jusqu'à la fin du tour. (À chaque fois que la créature devient bloquée, elle gagne +2/+2 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "rapidFire", "target": "creature"},
    "castOnlyDuring": "beforeBlockers",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/rapid_fire.jpeg",
    "id": 486
  },
  {
    "name": "Remove Enchantments",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Renvoyez dans votre main tous les enchantements que vous possédez et contrôlez à la fois, toutes les Auras que vous possédez attachées à des permanents que vous contrôlez, et toutes les Auras que vous possédez attachées à des créatures attaquantes que vos adversaires contrôlent. Ensuite, détruisez tous les autres enchantements que vous contrôlez, toutes les autres Auras attachées à des permanents que vous contrôlez, et toutes les autres Auras attachées à des créatures attaquantes que vos adversaires contrôlent.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/remove_enchantments.jpeg",
    "id": 487
  },
  {
    "name": "Righteous Avengers",
    "cost": "{4}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Traversée des plaines. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle une plaine.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "plainswalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Soldier",
    "power": 3,
    "toughness": 1,
    "img": "img/righteous_avengers.jpeg",
    "id": 488
  },
  {
    "name": "Seeker",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée ne peut être bloquée que par des créatures-artefacts et/ou des créatures blanches.",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "addKeyword", "target": "creature", "keywords": ["seekerevasion"]},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/seeker.jpeg",
    "id": 489
  },
  {
    "name": "Shield Wall",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Les créatures que vous contrôlez gagnent +0/+2 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "yours", "power": 0, "toughness": 2},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/shield_wall.jpeg",
    "id": 490
  },
  {
    "name": "Spirit Link",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois que la créature enchantée inflige des blessures, vous gagnez autant de points de vie.",
    "effectStatus": "implemented",
    "effect": {
      "type": "spiritLink",
      "target": "creature"
    },
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/spirit_link.jpeg",
    "id": 491
  },
  {
    "name": "Spiritual Sanctuary",
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Au début de l'entretien de chaque joueur, si ce joueur contrôle une plaine, il gagne 1 point de vie.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/spiritual_sanctuary.jpeg",
    "id": 492
  },
  {
    "name": "Thunder Spirit",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vol, initiative.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying",
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Elemental Spirit",
    "power": 2,
    "toughness": 2,
    "img": "img/thunder_spirit.jpeg",
    "id": 493
  },
  {
    "name": "Tundra Wolves",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Initiative (Cette créature inflige des blessures de combat avant les créatures sans l'initiative.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Wolf",
    "power": 1,
    "toughness": 1,
    "img": "img/tundra_wolves.jpeg",
    "id": 494
  },
  {
    "name": "Visions",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Regardez les cinq cartes du dessus de la bibliothèque du joueur ciblé. Vous pouvez ensuite faire mélanger cette bibliothèque par ce joueur.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/visions.jpeg",
    "id": 495
  },
  {
    "name": "Wall of Caltrops",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) À chaque fois que cette créature bloque une créature, si au moins un autre Mur bloque aussi cette créature et qu'aucune créature non-Mur ne la bloque, cette créature gagne le regroupement jusqu'à la fin du tour. (Si une créature avec le regroupement que vous contrôlez bloque une créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qui la bloquent.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wall",
    "power": 2,
    "toughness": 1,
    "img": "img/wall_of_caltrops.jpeg",
    "id": 496
  },
  {
    "name": "Wall of Light",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) Protection contre le noir.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender",
      "protectionB"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Wall",
    "power": 1,
    "toughness": 5,
    "img": "img/wall_of_light.jpeg",
    "id": 497
  },
  {
    "name": "Acid Rain",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez toutes les forêts.",
    "effect": {"type": "destroyAllMatching", "cardType": "Land", "subtype": "Forest"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/acid_rain.jpeg",
    "id": 498
  },
  {
    "name": "Anti-Magic Aura",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. La créature enchantée ne peut pas être la cible de sorts et ne peut pas être enchantée par d'autres Auras.",
    "sets": [
      "LEG"
    ],
    "subtype": "Aura",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/antimagic_aura.jpeg",
    "id": 499
  },
  {
    "name": "Azure Drake",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Vol (Cette créature ne peut être bloquée que par des créatures avec le vol.)",
    "sets": [
      "LEG"
    ],
    "subtype": "Drake",
    "power": 2,
    "toughness": 4,
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/azure_drake.jpeg",
    "id": 500
  },
  {
    "name": "Backfire",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. À chaque fois que la créature enchantée vous inflige des blessures, cette Aura inflige autant de blessures au contrôleur de cette créature.",
    "sets": [
      "LEG"
    ],
    "subtype": "Aura",
    "keywords": [],
        "effect": {
      "type": "enchant",
      "target": "creature"
    },
    "triggers": [
      {
        "event": "damageDealt",
        "condition": {"targetType": "player", "damagedYouByEnchanted": true},
        "effect": {"type": "reflectDamage"}
      },
      {
        "event": "damageDealtToPlayer",
        "condition": {"damagedYouByEnchanted": true},
        "effect": {"type": "reflectDamage"}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/backfire.jpeg",
    "id": 501
  },
  {
    "name": "Boomerang",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Renvoyez le permanent ciblé dans la main de son propriétaire.",
    "effect": {"type": "bounce", "target": "permanent"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/boomerang.jpeg",
    "id": 502
  },
  {
    "name": "Brine Hag",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Quand cette créature meurt, changez la force et l'endurance de base de toutes les créatures lui ayant infligé des blessures ce tour-ci à 0/2. (Cet effet dure indéfiniment.)",
    "sets": [
      "LEG"
    ],
    "subtype": "Hag",
    "power": 2,
    "toughness": 2,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/brine_hag.jpeg",
    "id": 503
  },
  {
    "name": "Devouring Deep",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Traversée des îles. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle une île.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "islandwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Fish",
    "power": 1,
    "toughness": 2,
    "img": "img/devouring_deep.jpeg",
    "id": 504
  },
  {
    "name": "Dream Coat",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. {0} : La créature enchantée devient de la ou des couleurs de votre choix. N'activez cette capacité qu'une fois par tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Aura",
    "img": "img/dream_coat.jpeg",
    "id": 505
  },
  {
    "name": "Elder Spawn",
    "cost": "{4}{U}{U}{U}",
    "cmc": 7,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, à moins que vous ne sacrifiiez une île, sacrifiez cette créature, qui vous inflige alors 6 blessures. Cette créature ne peut pas être bloquée par des créatures rouges.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Spawn",
    "power": 6,
    "toughness": 6,
    "img": "img/elder_spawn.jpeg",
    "id": 506
  },
  {
    "name": "Enchantment Alteration",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Attachez l'Aura ciblée attachée à une créature ou un terrain à un autre permanent de ce type.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/enchantment_alteration.jpeg",
    "id": 507
  },
  {
    "name": "Energy Tap",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Engagez la créature non-engagée ciblée que vous contrôlez. Si vous faites ainsi, ajoutez un montant de {C} égal à la valeur de mana de cette créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/energy_tap.jpeg",
    "id": 508
  },
  {
    "name": "Field of Dreams",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Les joueurs jouent avec la carte du dessus de leur bibliothèque révélée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/field_of_dreams.jpeg",
    "id": 509
  },
  {
    "name": "Flash Counter",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Contrecarrez le sort d'éphémère ciblé.",
    "effect": {"type": "counterSpell", "condition": "instantSpell"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/flash_counter.jpeg",
    "id": 510
  },
  {
    "name": "Flash Flood",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Choisissez l'un —\n• Détruisez le permanent rouge ciblé.\n• Renvoyez la montagne ciblée dans la main de son propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/flash_flood.jpeg",
    "id": 511
  },
  {
    "name": "Force Spike",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Contrecarrez le sort ciblé à moins que son lanceur ne paye {1}.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": { "type": "counterUnlessPay", "target": "spellOnStack", "amount": 1 },
    "effectStatus": "implemented",
    "img": "img/force_spike.jpeg",
    "id": 512
  },
  {
    "name": "Gaseous Form",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. Prévenez toutes les blessures de combat qui devraient être infligées à la créature enchantée et par la créature enchantée.",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "addKeyword", "target": "creature", "keywords": ["nocombatdamagedealt", "nocombatdamagereceived"]},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/gaseous_form.jpeg",
    "id": 513
  },
  {
    "name": "Glyph of Delusion",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Mettez X marqueurs de glyphe sur la créature ciblée que le Mur ciblé a bloquée ce tour-ci, X étant la force de cette créature bloquée. La créature gagne « Cette créature ne se dégage pas pendant votre étape de dégagement si elle a un marqueur de glyphe sur elle » et « Au début de votre entretien, retirez un marqueur de glyphe de cette créature ».",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/glyph_of_delusion.jpeg",
    "id": 514
  },
  {
    "name": "In the Eye of Chaos",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un joueur lance un sort éphémère, contrecarrez-le à moins que ce joueur ne paie {X}, X étant sa valeur de mana.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/in_the_eye_of_chaos.jpeg",
    "id": 515
  },
  {
    "name": "Invoke Prejudice",
    "cost": "{U}{U}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un adversaire lance un sort de créature qui ne partage aucune couleur avec une créature que vous contrôlez, contrecarrez ce sort à moins que ce joueur ne paie {X}, X étant sa valeur de mana.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/invoke_prejudice.jpeg",
    "id": 516
  },
  {
    "name": "Juxtapose",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Vous et le joueur ciblé échangez le contrôle de la créature que chacun de vous contrôle ayant la plus grande valeur de mana. Ensuite, échangez le contrôle des artefacts de la même manière. Si deux permanents ou plus qu'un joueur contrôle sont à égalité pour la plus grande valeur, leur contrôleur en choisit un.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/juxtapose.jpeg",
    "id": 517
  },
  {
    "name": "Land Equilibrium",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Si un adversaire contrôlant au moins autant de terrains que vous devait mettre un terrain sur le champ de bataille, ce joueur met ce terrain sur le champ de bataille puis sacrifie un terrain de son choix à la place.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/land_equilibrium.jpeg",
    "id": 518
  },
  {
    "name": "Mana Drain",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Contrecarrez un sort ciblé. Au début de votre prochaine phase principale, ajoutez une quantité de {C} égale au coût converti de mana de ce sort.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": { "type": "counterSpellGainMana", "target": "spellOnStack" },
    "effectStatus": "implemented",
    "img": "img/mana_drain.jpeg",
    "id": 519
  },
  {
    "name": "Part Water",
    "cost": "{X}{X}{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "X créatures ciblées gagnent la traversée des îles jusqu'à la fin du tour. (Elles ne peuvent pas être bloquées tant que le joueur défenseur contrôle une île.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/part_water.jpeg",
    "id": 520
  },
  {
    "name": "Psionic Entity",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 2, "target": "anyTarget", "sourceDamage": 3}}],
    "cost": "{4}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Cette créature inflige 2 blessures à n'importe quelle cible et 3 blessures à elle-même.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "power": 2,
    "toughness": 2,
    "subtype": "Illusion",
    "img": "img/psionic_entity.jpeg",
    "id": 521
  },
  {
    "name": "Psychic Purge",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Psychic Purge inflige 1 blessure à n'importe quelle cible. Quand un sort ou une capacité qu'un adversaire contrôle vous fait défausser cette carte, ce joueur perd 5 points de vie.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/psychic_purge.jpeg",
    "id": 522
  },
  {
    "name": "Puppet Master",
    "cost": "{U}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. Quand la créature enchantée meurt, renvoyez cette carte dans la main de son propriétaire. Si cette carte est renvoyée dans la main de son propriétaire de cette manière, vous pouvez payer {U}{U}{U}. Si vous faites ainsi, renvoyez cette carte dans la main de son propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Aura",
    "img": "img/puppet_master.jpeg",
    "id": 523
  },
  {
    "name": "Recall",
    "cost": "{X}{X}{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Défaussez X cartes, puis renvoyez dans votre main une carte de votre cimetière pour chaque carte défaussée ainsi. Exilez Recall.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/recall.jpeg",
    "id": 524
  },
  {
    "name": "Relic Bind",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : artefact qu'un adversaire contrôle.\nÀ chaque fois que l'artefact enchanté est engagé, choisissez l'un —\n• Cette Aura inflige 1 blessure au joueur ciblé.\n• Le joueur ciblé gagne 1 point de vie.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "effect": {
      "type": "enchant",
      "target": "opponentsArtifact"
    },
    "triggers": [
      {
        "event": "permanentTapped",
        "condition": {
          "enchantedBecomesTapped": true
        },
        "effect": {
          "type": "chooseDamageOrGain",
          "amount": 1
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/relic_bind.jpeg",
    "id": 525
  },
  {
    "name": "Remove Soul",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Contrecarrez le sort de créature ciblé.",
    "effect": {
      "type": "counterSpell",
      "condition": "creatureSpell"
    },
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/remove_soul.jpeg",
    "id": 526
  },
  {
    "name": "Reset",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Lancez ce sort uniquement pendant le tour d'un adversaire, après son étape d'entretien. Dégagez tous les terrains que vous contrôlez.",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "untapAllLands"},
    "castOnlyDuring": "opponentTurnAfterUpkeep",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/reset.jpeg",
    "id": 527
  },
  {
    "name": "Reverberation",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Toutes les blessures qui devraient être infligées ce tour-ci par le sort de sorcellerie ciblé sont infligées au contrôleur de ce sort à la place.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/reverberation.jpeg",
    "id": 528
  },
  {
    "name": "Sea Kings' Blessing",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Une ou plusieurs créatures ciblées deviennent bleues jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/sea_kings_blessing.jpeg",
    "id": 529
  },
  {
    "name": "Segovian Leviathan",
    "cost": "{4}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Traversée des îles. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle une île.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "islandwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Leviathan",
    "power": 3,
    "toughness": 3,
    "img": "img/segovian_leviathan.jpeg",
    "id": 530
  },
  {
    "name": "Silhouette",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Choisissez une créature ciblée. Si un sort ou une capacité ciblant cette créature devait faire en sorte qu'une source lui inflige des blessures ce tour-ci, prévenez ces blessures.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/silhouette.jpeg",
    "id": 531
  },
  {
    "name": "Spectral Cloak",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée a le linceul tant qu'elle est non-engagée. (Elle ne peut pas être la cible de sorts ou de capacités.)",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "addKeyword", "target": "creature", "keyword": "shroud", "whileHostUntapped": true},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/spectral_cloak.jpeg",
    "id": 532
  },
  {
    "name": "Telekinesis",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Engagez la créature ciblée. Prévenez toutes les blessures de combat que cette créature devrait infliger ce tour-ci. Elle ne se dégage pas pendant les deux prochaines étapes de dégagement de son contrôleur.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/telekinesis.jpeg",
    "id": 533
  },
  {
    "name": "Teleport",
    "cost": "{U}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Lancez ce sort uniquement pendant l'étape de déclaration des attaquants. La créature ciblée ne peut pas être bloquée ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "unblockable", "target": "creature"},
    "castOnlyDuring": "declareAttackers",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/teleport.jpeg",
    "id": 534
  },
  {
    "name": "Time Elemental",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Quand cette créature attaque ou bloque, à la fin du combat, sacrifiez-la, et elle vous inflige alors 5 blessures. {2}{U}{U}, {T} : Renvoyez le permanent non enchanté ciblé dans la main de son propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elemental",
    "power": 0,
    "toughness": 2,
    "img": "img/time_elemental.jpeg",
    "id": 535
  },
  {
    "name": "Undertow",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures avec la traversée des îles peuvent être bloquées comme si elles n'avaient pas la traversée des îles.",
    "static": {"type": "ignoreLandwalk", "landwalk": "islandwalk"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/undertow.jpeg",
    "id": 536
  },
  {
    "name": "Venarian Gold",
    "cost": "{X}{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. Quand cette Aura arrive sur le champ de bataille, engagez la créature enchantée et mettez X marqueurs de sommeil sur elle. La créature enchantée ne se dégage pas pendant l'étape de dégagement de son contrôleur si elle a un marqueur de sommeil sur elle. Au début de l'entretien du contrôleur de la créature enchantée, retirez un marqueur de sommeil de cette créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Aura",
    "img": "img/venarian_gold.jpeg",
    "id": 537
  },
  {
    "name": "Wall of Vapor",
    "cost": "{3}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) Prévenez toutes les blessures qui devraient être infligées à cette créature par les créatures qu'elle bloque.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wall",
    "power": 0,
    "toughness": 1,
    "img": "img/wall_of_vapor.jpeg",
    "id": 538
  },
  {
    "name": "Wall of Wonder",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "(Les murs ne peuvent pas attaquer.)\n{2}{U}{U}: Le Mur des merveilles gagne +4/-4 jusqu'à la fin du tour et peut attaquer ce tour-ci comme s'il n'était pas un mur.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wall",
    "power": 1,
    "toughness": 5,
    "img": "img/wall_of_wonder.jpeg",
    "id": 539
  },
  {
    "name": "Zephyr Falcon",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Vol, vigilance.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying",
      "vigilance"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Bird",
    "power": 1,
    "toughness": 1,
    "img": "img/zephyr_falcon.jpeg",
    "id": 540
  },
  {
    "name": "Abomination",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois que cette créature bloque ou est bloquée par une créature verte ou blanche, détruisez cette créature à la fin du combat.",
    "sets": [
      "LEG"
    ],
    "subtype": "Horror",
    "power": 2,
    "toughness": 6,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/abomination.jpeg",
    "id": 541
  },
  {
    "name": "All Hallow's Eve",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Exilez All Hallow's Eve avec deux marqueurs de cri sur elle. Au début de votre entretien, si cette carte est exilée avec un marqueur de cri sur elle, retirez-en un marqueur de cri. S'il n'y a plus de marqueur de cri sur elle, mettez-la dans votre cimetière et chaque joueur renvoie toutes les cartes de créature de son cimetière sur le champ de bataille.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/all_hallows_eve.jpeg",
    "id": 542
  },
  {
    "name": "Blight",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : terrain. Quand le terrain enchanté est engagé, détruisez-le.",
    "sets": [
      "LEG"
    ],
    "subtype": "Aura",
    "keywords": [],
        "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effect": {"type": "enchant", "target": "land"},
    "triggers": [{"event": "permanentTapped", "condition": {"enchantedBecomesTapped": true}, "effect": {"type": "destroyEnchanted"}}],
    "effectStatus": "implemented",
    "img": "img/blight.jpeg",
    "id": 543
  },
  {
    "name": "Carrion Ants",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{1} : Cette créature gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "subtype": "Insect",
    "power": 0,
    "toughness": 1,
    "activated": [{ "cost": "{1}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 1 } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/carrion_ants.jpeg",
    "id": 544
  },
  {
    "name": "Chains of Mephistopheles",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Si un joueur devait piocher une carte, sauf la première qu'il pioche à chacune de ses étapes de pioche, ce joueur défausse une carte à la place. S'il défausse une carte ainsi, il pioche une carte. S'il ne défausse pas de carte ainsi, il meule une carte.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "mill"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/chains_of_mephistopheles.jpeg",
    "id": 545
  },
  {
    "name": "Cosmic Horror",
    "cost": "{3}{B}{B}{B}",
    "cmc": 6,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Initiative. Au début de votre entretien, détruisez cette créature à moins que vous ne payiez {3}{B}{B}{B}. Si cette créature est détruite ainsi, elle vous inflige 7 blessures.",
    "sets": [
      "LEG"
    ],
    "subtype": "Horror",
    "power": 7,
    "toughness": 7,
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/cosmic_horror.jpeg",
    "id": 546
  },
  {
    "name": "Cyclopean Mummy",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Quand cette créature meurt, exilez-la.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Zombie",
    "power": 2,
    "toughness": 1,
    "img": "img/cyclopean_mummy.jpeg",
    "id": 547
  },
  {
    "name": "Darkness",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Prévenez toutes les blessures de combat qui devraient être infligées ce tour-ci.",
    "effect": {"type": "fog"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/darkness.jpeg",
    "id": 548
  },
  {
    "name": "Demonic Torment",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée ne peut pas attaquer. Prévenez toutes les blessures de combat que la créature enchantée devrait infliger.",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "addKeyword", "target": "creature", "keywords": ["cantattack", "nocombatdamagedealt"]},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/demonic_torment.jpeg",
    "id": 549
  },
  {
    "name": "Evil Eye of Orms-by-Gore",
    "cost": "{4}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Les créatures non-œil que vous contrôlez ne peuvent pas attaquer.\nL'Œil maléfique d'Orms-par-Gore ne peut pas être bloqué, excepté par des murs.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Eye",
    "power": 3,
    "toughness": 6,
    "img": "img/evil_eye_of_ormsbygore.jpeg",
    "id": 550
  },
  {
    "name": "Fallen Angel",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Vol\nSacrifiez une créature : L'Ange déchue gagne +2/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Angel",
    "power": 3,
    "toughness": 3,
    "img": "img/fallen_angel.jpeg",
    "id": 551
  },
  {
    "name": "Ghosts of the Damned",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{T} : La créature ciblée gagne -1/-0 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "activated": [{ "cost": "{T}", "tap": true, "effect": { "type": "pump", "power": -1, "toughness": 0 } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Spirit",
    "power": 0,
    "toughness": 2,
    "img": "img/ghosts_of_the_damned.jpeg",
    "id": 552
  },
  {
    "name": "Giant Slug",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{5} : Au début de votre prochain entretien, choisissez un type de terrain de base. Cette créature gagne la traversée de ce type jusqu'à la fin de ce tour. (Elle ne peut pas être bloquée tant que le joueur défenseur contrôle un terrain de ce type.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Slug",
    "power": 1,
    "toughness": 1,
    "img": "img/giant_slug.jpeg",
    "id": 553
  },
  {
    "name": "Glyph of Doom",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Choisissez un Mur ciblé. À la prochaine fin de combat de ce tour, détruisez toutes les créatures que ce Mur a bloquées ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/glyph_of_doom.jpeg",
    "id": 554
  },
  {
    "name": "Greed",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "{B}, payez 2 points de vie : Piochez une carte.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/greed.jpeg",
    "id": 555
  },
  {
    "name": "Headless Horseman",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Zombie Knight",
    "power": 2,
    "toughness": 2,
    "img": "img/headless_horseman.jpeg",
    "id": 556
  },
  {
    "name": "Hell Swarm",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Toutes les créatures gagnent -1/-0 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "all", "power": -1, "toughness": 0},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/hell_swarm.jpeg",
    "id": 557
  },
  {
    "name": "Hell's Caretaker",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{T}, sacrifiez une créature : Renvoyez en jeu la carte de créature ciblée depuis votre cimetière. Ne jouez cette capacité que pendant votre étape d'entretien.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Horror",
    "power": 1,
    "toughness": 1,
    "img": "img/hells_caretaker.jpeg",
    "id": 558
  },
  {
    "name": "Hellfire",
    "cost": "{2}{B}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez toutes les créatures non-noires. Hellfire vous inflige X plus 3 blessures, X étant le nombre de créatures mortes ainsi.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/hellfire.jpeg",
    "id": 559
  },
  {
    "name": "Horror of Horrors",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez un marais : Régénérez la créature noire ciblée. (La prochaine fois que cette créature devrait être détruite ce tour-ci, elle ne l'est pas. À la place, engagez-la, retirez-lui toutes ses blessures et retirez-la du combat.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "heal",
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/horror_of_horrors.jpeg",
    "id": 560
  },
  {
    "name": "Imprison",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Enchanter : créature. À chaque fois qu'un joueur active une capacité de la créature enchantée avec {T} dans son coût d'activation qui n'est pas une capacité de mana, vous pouvez payer {1}. Si vous faites ainsi, contrecarrez cette capacité. Sinon, détruisez cette Aura. À chaque fois que la créature enchantée attaque ou bloque, vous pouvez payer {1}. Si vous faites ainsi, engagez la créature, retirez-la du combat, et les créatures qu'elle bloquait et qui n'étaient bloquées que par elle seule pendant ce combat deviennent non bloquées. Sinon, détruisez cette Aura.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Aura",
    "img": "img/imprison.jpeg",
    "id": 561
  },
  {
    "name": "Infernal Medusa",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois que cette créature bloque une créature, détruisez cette créature à la fin du combat. À chaque fois que cette créature est bloquée par une créature non-Mur, détruisez cette créature à la fin du combat.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Gorgon",
    "power": 2,
    "toughness": 4,
    "img": "img/infernal_medusa.jpeg",
    "id": 562
  },
  {
    "name": "Jovial Evil",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Jovial Evil inflige à l'adversaire ciblé X blessures, X étant le double du nombre de créatures blanches que ce joueur contrôle.",
    "effect": {"type": "damageByCount", "target": "opponent", "count": "whiteCreature", "whose": "victim", "multiplier": 2},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/jovial_evil.jpeg",
    "id": 563
  },
  {
    "name": "Lesser Werewolf",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{B} : Si la force de cette créature est de 1 ou plus, elle gagne -1/-0 jusqu'à la fin du tour et mettez un marqueur -0/-1 sur la créature ciblée bloquant ou bloquée par cette créature. N'activez cette capacité que pendant l'étape de déclaration des bloqueurs.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Werewolf",
    "power": 2,
    "toughness": 4,
    "img": "img/lesser_werewolf.jpeg",
    "id": 564
  },
  {
    "name": "Lost Soul",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Traversée des marais. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle un marais.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "swampwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Spirit Minion",
    "power": 2,
    "toughness": 1,
    "img": "img/lost_soul.jpeg",
    "id": 565
  },
  {
    "name": "Mold Demon",
    "cost": "{5}{B}{B}",
    "cmc": 7,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Quand cette créature arrive sur le champ de bataille, sacrifiez-la à moins que vous ne sacrifiiez deux marais.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Fungus Demon",
    "power": 6,
    "toughness": 6,
    "img": "img/mold_demon.jpeg",
    "id": 566
  },
  {
    "name": "Nether Void",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "À chaque fois qu'un joueur lance un sort, contrecarrez-le à moins que ce joueur ne paie {3}.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/nether_void.jpeg",
    "id": 567
  },
  {
    "name": "Pit Scorpion",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Scorpion",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Poison. Chaque fois qu'elle blesse un joueur, celui-ci gagne un marqueur de poison.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/pit_scorpion.jpeg",
    "effectStatus": "unimplemented",
    "id": 568
  },
  {
    "name": "Quagmire",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures avec la traversée des marais peuvent être bloquées comme si elles n'avaient pas la traversée des marais.",
    "static": {"type": "ignoreLandwalk", "landwalk": "swampwalk"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/quagmire.jpeg",
    "id": 569
  },
  {
    "name": "Shimian Night Stalker",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{B}, {T} : Toutes les blessures qui devraient vous être infligées ce tour-ci par la créature attaquante ciblée sont infligées à cette créature à la place.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Nightstalker",
    "power": 4,
    "toughness": 4,
    "img": "img/shimian_night_stalker.jpeg",
    "id": 570
  },
  {
    "name": "Spirit Shackle",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. À chaque fois que la créature enchantée est engagée, mettez un marqueur -0/-2 sur elle.",
    "sets": [
      "LEG"
    ],
    "effect": {"type": "enchant", "target": "creature"},
    "keywords": [],
    "triggers": [{"event": "permanentTapped", "condition": {"enchantedBecomesTapped": true}, "effect": {"type": "addCounter", "counter": "-0/-2", "amount": 1, "target": "enchanted"}}],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/spirit_shackle.jpeg",
    "id": 571
  },
  {
    "name": "Syphon Soul",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Siphonner l'âme inflige 2 blessures à chacun des autres joueurs. Vous gagnez autant de points de vie que de blessures infligées de cette manière.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": { "type": "drainOpponents", "amount": 2 },
    "effectStatus": "implemented",
    "img": "img/syphon_soul.jpeg",
    "id": 572
  },
  {
    "name": "Takklemaggot",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. Au début de l'entretien du contrôleur de la créature enchantée, mettez un marqueur -0/-1 sur cette créature. Quand la créature enchantée meurt, le contrôleur de cette créature choisit une créature que cette carte pourrait enchanter. Si ce joueur le fait, renvoyez cette carte sur le champ de bataille sous votre contrôle attachée à cette créature. Sinon, renvoyez cette carte sur le champ de bataille sous votre contrôle en tant qu'enchantement non-Aura. Elle perd « enchanter : créature » et gagne « Au début de l'entretien de ce joueur, cet enchantement inflige 1 blessure à ce joueur ».",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Aura",
    "img": "img/takklemaggot.jpeg",
    "id": 573
  },
  {
    "name": "The Abyss",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Au début de l'entretien de chaque joueur, détruisez la créature non-artefact ciblée que ce joueur contrôle, de son choix. Elle ne peut pas être régénérée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/the_abyss.jpeg",
    "id": 574
  },
  {
    "name": "The Wretched",
    "cost": "{3}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "À la fin du combat, acquérez le contrôle de toutes les créatures bloquant cette créature aussi longtemps que vous contrôlez cette créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Demon",
    "power": 2,
    "toughness": 5,
    "img": "img/the_wretched.jpeg",
    "id": 575
  },
  {
    "name": "Touch of Darkness",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Une ou plusieurs créatures ciblées deviennent noires jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/touch_of_darkness.jpeg",
    "id": 576
  },
  {
    "name": "Transmutation",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Échangez la force et l'endurance de la créature ciblée jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/transmutation.jpeg",
    "id": 577
  },
  {
    "name": "Underworld Dreams",
    "cost": "{B}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un adversaire pioche une carte, les Rêves du monde souterrain lui infligent 1 blessure.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/underworld_dreams.jpeg",
    "id": 578
  },
  {
    "name": "Vampire Bats",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "activated": [
      {
        "cost": "{B}",
        "tap": false,
        "maxPerTurn": 2,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0
        }
      }
    ],
    "text_fr": "Vol (Cette créature ne peut être bloquée que par des créatures avec le vol ou la portée.)\n{B} : Les Chauves-souris vampires gagnent +1/+0 jusqu'à la fin du tour. Ne jouez pas cette capacité plus de deux fois à chaque tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Bat",
    "power": 0,
    "toughness": 1,
    "img": "img/vampire_bats.jpeg",
    "id": 579
  },
  {
    "name": "Walking Dead",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{B} : Régénérez cette créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Zombie",
    "power": 1,
    "toughness": 1,
    "img": "img/walking_dead.jpeg",
    "id": 580
  },
  {
    "name": "Wall of Putrid Flesh",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) Protection contre le blanc. Prévenez toutes les blessures qui devraient être infligées à cette créature par des créatures enchantées.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender",
      "protectionW"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wall",
    "power": 2,
    "toughness": 4,
    "img": "img/wall_of_putrid_flesh.jpeg",
    "id": 581
  },
  {
    "name": "Wall of Shadows",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) Prévenez toutes les blessures qui devraient être infligées à cette créature par les créatures qu'elle bloque. Cette créature ne peut pas être la cible de sorts qui ne peuvent cibler que des Murs, ni de capacités qui ne peuvent cibler que des Murs.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wall",
    "power": 0,
    "toughness": 1,
    "img": "img/wall_of_shadows.jpeg",
    "id": 582
  },
  {
    "name": "Wall of Tombstones",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) Au début de votre entretien, changez l'endurance de base de cette créature pour qu'elle soit égale à 1 plus le nombre de cartes de créature dans votre cimetière. (Cet effet dure indéfiniment.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wall",
    "power": 0,
    "toughness": 1,
    "img": "img/wall_of_tombstones.jpeg",
    "id": 583
  },
  {
    "name": "Active Volcano",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Choisissez l'un —\n• Détruisez le permanent bleu ciblé.\n• Renvoyez l'île ciblée dans la main de son propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/active_volcano.jpeg",
    "id": 584
  },
  {
    "name": "Aerathi Berserker",
    "cost": "{2}{R}{R}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Sauvagerie 3 (À chaque fois que cette créature devient bloquée, elle gagne +3/+3 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "subtype": "Human Berserker",
    "power": 2,
    "toughness": 4,
    "keywords": [
      "rampage3"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/aerathi_berserker.jpeg",
    "id": 585
  },
  {
    "name": "Backdraft",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Choisissez un joueur ayant lancé un ou plusieurs sorts de sorcellerie ce tour-ci. Backdraft inflige à ce joueur des blessures égales à la moitié des blessures infligées par l'un de ces sorts de sorcellerie ce tour-ci, arrondie à l'inférieur.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/backdraft.jpeg",
    "id": 586
  },
  {
    "name": "Beasts of Bogardan",
    "cost": "{4}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Protection contre le rouge. Cette créature gagne +1/+1 tant qu'un adversaire contrôle un permanent blanc non-jeton.",
    "sets": [
      "LEG"
    ],
    "subtype": "Beast",
    "power": 3,
    "toughness": 3,
    "keywords": [
      "protectionR"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/beasts_of_bogardan.jpeg",
    "id": 587
  },
  {
    "name": "Blazing Effigy",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Quand cette créature meurt, elle inflige X blessures à la créature ciblée, X étant 3 plus le nombre de blessures infligées à cette créature ce tour-ci par d'autres sources nommées Blazing Effigy.",
    "sets": [
      "LEG"
    ],
    "subtype": "Elemental",
    "power": 0,
    "toughness": 3,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/blazing_effigy.jpeg",
    "id": 588
  },
  {
    "name": "Blood Lust",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Si la créature ciblée a une endurance de 5 ou plus, elle gagne +4/-4 jusqu’à la fin du tour. Sinon, elle gagne +4/-X jusqu’à la fin du tour, X étant son endurance moins 1.",
    "effect": {
      "type": "pump",
      "power": 4,
      "toughness": 0,
      "target": "creature"
    },
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/blood_lust.jpeg",
    "id": 589
  },
  {
    "name": "Caverns of Despair",
    "static": [{"type": "attackLimit", "count": 2}, {"type": "blockLimit", "count": 2}],
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Pas plus de deux créatures ne peuvent attaquer à chaque combat. Pas plus de deux créatures ne peuvent bloquer à chaque combat.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/caverns_of_despair.jpeg",
    "id": 590
  },
  {
    "name": "Chain Lightning",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "La Chaîne d'éclairs inflige 3 blessures à n'importe quelle cible. Puis ce joueur ou le contrôleur de ce permanent peut payer {R}{R}. Si le joueur fait ainsi, il peut copier ce sort et peut choisir une nouvelle cible pour cette copie.",
    "effect": {
      "type": "damage",
      "amount": 3,
      "target": "anyTarget"
    },
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/chain_lightning.jpeg",
    "id": 591
  },
  {
    "name": "Crevasse",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures avec la traversée des montagnes peuvent être bloquées comme si elles n'avaient pas la traversée des montagnes.",
    "static": {"type": "ignoreLandwalk", "landwalk": "mountainwalk"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/crevasse.jpeg",
    "id": 592
  },
  {
    "name": "Crimson Kobolds",
    "cost": "{0}",
    "cmc": 0,
    "color": ["R"],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Kobold",
    "power": 0,
    "toughness": 1,
    "img": "img/crimson_kobolds.jpeg",
    "id": 593
  },
  {
    "name": "Crimson Manticore",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Manticore",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "activated": [{ "cost": "{R}", "tap": true, "effect": { "type": "damage", "amount": 1, "target": "attackingOrBlockingCreature" } }],
    "effectStatus": "implemented",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol\n{R}, {T}: La Manticore pourpre inflige 1 blessure à la créature attaquante ou bloqueuse ciblée.",
    "sets": [
      "LEG"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/crimson_manticore.jpeg",
    "id": 594
  },
  {
    "name": "Crookshank Kobolds",
    "cost": "{0}",
    "cmc": 0,
    "color": ["R"],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Kobold",
    "power": 0,
    "toughness": 1,
    "img": "img/crookshank_kobolds.jpeg",
    "id": 595
  },
  {
    "name": "Disharmony",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "Lancez ce sort uniquement pendant le combat, avant que les bloqueurs ne soient déclarés. Dégagez la créature attaquante ciblée et retirez-la du combat. Acquérez le contrôle de cette créature jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/disharmony.jpeg",
    "id": 596
  },
  {
    "name": "Dwarven Song",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Une ou plusieurs créatures ciblées deviennent rouges jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/dwarven_song.jpeg",
    "id": 597
  },
  {
    "name": "Eternal Warrior",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature. La créature enchantée a la vigilance.",
    "effect": {"type": "grantKeyword", "keyword": "vigilance", "target": "creature"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/eternal_warrior.jpeg",
    "id": 598
  },
  {
    "name": "Falling Star",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Lancez Falling Star sur la zone de jeu d'une hauteur d'au moins 30 centimètres. Falling Star inflige 3 blessures à chaque créature sur laquelle elle atterrit. Engagez toutes les créatures ayant subi des blessures de Falling Star. Si Falling Star ne se retourne pas complètement au moins une fois pendant sa chute, elle n'a aucun effet.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/falling_star.jpeg",
    "id": 599
  },
  {
    "name": "Feint",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Engagez toutes les créatures bloquant la créature attaquante ciblée. Prévenez toutes les blessures de combat que cette créature et chaque créature la bloquant devraient infliger ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/feint.jpeg",
    "id": 600
  },
  {
    "name": "Firestorm Phoenix",
    "cost": "{4}{R}{R}",
    "cmc": 6,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vol. Si cette créature devait mourir, renvoyez-la dans la main de son propriétaire à la place. Jusqu'au prochain tour de ce joueur, ce joueur joue avec cette carte révélée dans sa main et ne peut pas la jouer.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Phoenix",
    "power": 3,
    "toughness": 2,
    "img": "img/firestorm_phoenix.jpeg",
    "id": 601
  },
  {
    "name": "Frost Giant",
    "cost": "{3}{R}{R}{R}",
    "cmc": 6,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Sauvagerie 2 (À chaque fois que cette créature devient bloquée, elle gagne +2/+2 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "rampage2"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Giant",
    "power": 4,
    "toughness": 4,
    "img": "img/frost_giant.jpeg",
    "id": 602
  },
  {
    "name": "Giant Strength",
    "cost": "{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée gagne +2/+2.",
    "effectStatus": "implemented",
    "effect": {
      "type": "pump",
      "power": 2,
      "toughness": 2,
      "target": "creature",
      "permanentAura": true
    },
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/giant_strength.jpeg",
    "id": 603
  },
  {
    "name": "Glyph of Destruction",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Le Mur bloqueur ciblé que vous contrôlez gagne +10/+0 jusqu'à la fin du combat. Prévenez toutes les blessures qui devraient lui être infligées ce tour-ci. Détruisez-le au début de la prochaine étape de fin de tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/glyph_of_destruction.jpeg",
    "id": 604
  },
  {
    "name": "Gravity Sphere",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Toutes les créatures perdent le vol.",
    "static": {"type": "removeKeyword", "keyword": "flying", "onlyCreatures": true},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/gravity_sphere.jpeg",
    "id": 605
  },
  {
    "name": "Hyperion Blacksmith",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Vous pouvez engager ou dégager l'artefact ciblé qu'un adversaire contrôle.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Artificer",
    "power": 2,
    "toughness": 2,
    "img": "img/hyperion_blacksmith.jpeg",
    "id": 606
  },
  {
    "name": "Immolation",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature\nLa créature enchantée gagne +2/-2.",
    "effect": {"type": "pump", "power": 2, "toughness": -2, "target": "creature", "permanentAura": true},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/immolation.jpeg",
    "id": 607
  },
  {
    "name": "Kobold Drill Sergeant",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Kobold Soldier",
    "power": 1,
    "toughness": 2,
    "rarity": "Uncommon",
    "text_fr": "Les Kobolds +1/+0.",
    "static": {
      "type": "anthem",
      "filterSubtype": "Kobold",
      "power": 1,
      "toughness": 0
    },
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/kobold_drill_sergeant.jpeg",
    "id": 608
  },
  {
    "name": "Kobold Overlord",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Initiative. Les autres créatures Kobold que vous contrôlez ont l'initiative.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Kobold",
    "power": 1,
    "toughness": 2,
    "img": "img/kobold_overlord.jpeg",
    "id": 609
  },
  {
    "name": "Kobold Taskmaster",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Les autres kobolds que vous contrôlez gagnent +1/+0.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Kobold",
    "power": 1,
    "toughness": 2,
    "img": "img/kobold_taskmaster.jpeg",
    "id": 610
  },
  {
    "name": "Kobolds of Kher Keep",
    "cost": "{0}",
    "cmc": 0,
    "color": ["R"],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Kobold",
    "power": 0,
    "toughness": 1,
    "img": "img/kobolds_of_kher_keep.jpeg",
    "id": 611
  },
  {
    "name": "Land's Edge",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Défaussez une carte : Si la carte défaussée était une carte de terrain, cet enchantement inflige 2 blessures au joueur ou au planeswalker ciblé. N'importe quel joueur peut activer cette capacité.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/lands_edge.jpeg",
    "id": 612
  },
  {
    "name": "Mountain Yeti",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Traversée des montagnes. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle une montagne.) Protection contre le blanc.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "mountainwalk",
      "protectionW"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Yeti",
    "power": 3,
    "toughness": 3,
    "img": "img/mountain_yeti.jpeg",
    "id": 613
  },
  {
    "name": "Primordial Ooze",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Cette créature attaque à chaque combat si possible. Au début de votre entretien, mettez un marqueur +1/+1 sur cette créature. Vous pouvez ensuite payer {X}, X étant le nombre de marqueurs +1/+1 sur elle. Sinon, engagez cette créature, qui vous inflige alors X blessures.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Ooze",
    "power": 1,
    "toughness": 1,
    "img": "img/primordial_ooze.jpeg",
    "id": 614
  },
  {
    "name": "Pyrotechnics",
    "cost": "{4}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "La Pyrotechnie inflige 4 blessures réparties de la manière que vous choisissez parmi un nombre quelconque de cibles, créatures et/ou joueurs.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/pyrotechnics.jpeg",
    "id": 615
  },
  {
    "name": "Quarum Trench Gnomes",
    "cost": "{3}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Si la plaine ciblée est engagée pour du mana, elle produit du mana incolore au lieu du mana blanc. (Cet effet dure indéfiniment.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Gnome",
    "power": 1,
    "toughness": 1,
    "img": "img/quarum_trench_gnomes.jpeg",
    "id": 616
  },
  {
    "name": "Raging Bull",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Ox",
    "power": 2,
    "toughness": 2,
    "img": "img/raging_bull.jpeg",
    "id": 617
  },
  {
    "name": "Spinal Villain",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "destroy", "target": "creature", "requireColor": "U"}}],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Détruisez la créature bleue ciblée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Beast",
    "power": 1,
    "toughness": 2,
    "img": "img/spinal_villain.jpeg",
    "id": 618
  },
  {
    "name": "Storm World",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Au début de l'entretien de chaque joueur, cet enchantement inflige X blessures à ce joueur, X étant 4 moins le nombre de cartes dans sa main.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/storm_world.jpeg",
    "id": 619
  },
  {
    "name": "Tempest Efreet",
    "cost": "{1}{R}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Retirez cette carte de votre deck avant de jouer si vous ne jouez pas pour ante. {T}, Sacrifiez cette créature : L'adversaire ciblé peut payer 10 points de vie. S'il ne le fait pas, il révèle une carte au hasard de sa main. Échangez la propriété de la carte révélée et de Tempest Efreet. Mettez la carte révélée dans votre main et Tempest Efreet, où qu'elle soit, dans le cimetière de ce joueur. Ce changement de propriété est permanent.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Efreet",
    "power": 3,
    "toughness": 3,
    "img": "img/tempest_efreet.jpeg",
    "id": 620
  },
  {
    "name": "The Brute",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. La créature enchantée gagne +1/+0. {R}{R}{R} : Régénérez la créature enchantée.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/the_brute.jpeg",
    "effect": {"type": "pump", "power": 1, "toughness": 0, "target": "creature"},
    "activated": [{"cost": "{R}{R}{R}", "effect": {"type": "regenerateShield"}}],
    "effectStatus": "implemented",
    "id": 621
  },
  {
    "name": "Wall of Dust",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 1,
    "toughness": 4,
    "rarity": "Uncommon",
    "keywords": [
      "defender"
    ],
    "text_fr": "Défenseur. {R} : force une créature à ne pas attaquer.",
    "sets": [
      "LEG"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/wall_of_dust.jpeg",
    "id": 622
  },
  {
    "name": "Wall of Earth",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Wall",
    "power": 0,
    "toughness": 6,
    "img": "img/wall_of_earth.jpeg",
    "id": 623
  },
  {
    "name": "Wall of Heat",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Wall",
    "power": 2,
    "toughness": 6,
    "img": "img/wall_of_heat.jpeg",
    "id": 624
  },
  {
    "name": "Wall of Opposition",
    "cost": "{3}{R}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Défenseur (Cette créature ne peut pas attaquer.) {1} : Cette créature gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "activated": [{ "cost": "{1}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 0 } }],
    "effectStatus": "implemented",
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Wall",
    "power": 0,
    "toughness": 6,
    "img": "img/wall_of_opposition.jpeg",
    "id": 625
  },
  {
    "name": "Winds of Change",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Chaque joueur mélange les cartes de sa main dans sa bibliothèque, puis pioche autant de cartes.",
    "effect": {"type": "shuffleHandRedraw"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/winds_of_change.jpeg",
    "id": 626
  },
  {
    "name": "Aisling Leprechaun",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "À chaque fois que cette créature bloque ou est bloquée par une créature, cette créature devient verte. (Cet effet dure indéfiniment.)",
    "sets": [
      "LEG"
    ],
    "subtype": "Faerie",
    "power": 1,
    "toughness": 1,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/aisling_leprechaun.jpeg",
    "id": 627
  },
  {
    "name": "Arboria",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "World Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures ne peuvent pas attaquer un joueur à moins que ce joueur n'ait lancé un sort ou mis un permanent non-jeton sur le champ de bataille pendant son dernier tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/arboria.jpeg",
    "id": 628
  },
  {
    "name": "Avoid Fate",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Contrecarrez le sort d'éphémère ou d'aura ciblé qui cible un permanent que vous contrôlez.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/avoid_fate.jpeg",
    "id": 629
  },
  {
    "name": "Barbary Apes",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "subtype": "Ape",
    "power": 2,
    "toughness": 2,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/barbary_apes.jpeg",
    "id": 630
  },
  {
    "name": "Cat Warriors",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Traversée des forêts. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle une forêt.)",
    "sets": [
      "LEG"
    ],
    "subtype": "Cat Warrior",
    "power": 2,
    "toughness": 2,
    "keywords": [
      "landwalk",
      "forestwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/cat_warriors.jpeg",
    "id": 631
  },
  {
    "name": "Cocoon",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature que vous contrôlez. Quand cette Aura arrive sur le champ de bataille, engagez la créature enchantée et mettez trois marqueurs de chrysalide sur cette Aura. La créature enchantée ne se dégage pas pendant votre étape de dégagement si cette Aura a un marqueur de chrysalide sur elle. Au début de votre entretien, retirez un marqueur de chrysalide de cette Aura. Si vous ne le pouvez pas, sacrifiez-la, mettez un marqueur +1/+1 sur la créature enchantée, et cette créature gagne le vol.",
    "sets": [
      "LEG"
    ],
    "subtype": "Aura",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/cocoon.jpeg",
    "id": 632
  },
  {
    "name": "Concordant Crossroads",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Toutes les créatures ont la célérité.",
    "static": {"type": "grantKeyword", "keyword": "haste", "onlyCreatures": true},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/concordant_crossroads.jpeg",
    "id": 633
  },
  {
    "name": "Craw Giant",
    "cost": "{3}{G}{G}{G}{G}",
    "cmc": 7,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Piétinement\nSauvagerie 2 (À chaque fois que cette créature devient bloquée, elle gagne +2/+2 jusqu'à la fin du tour pour chaque créature la bloquant autre que la première créature.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "trample",
      "rampage2"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Giant",
    "power": 6,
    "toughness": 4,
    "img": "img/craw_giant.jpeg",
    "id": 634
  },
  {
    "name": "Deadfall",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Les créatures avec la traversée des forêts peuvent être bloquées comme si elles n'avaient pas la traversée des forêts.",
    "static": {"type": "ignoreLandwalk", "landwalk": "forestwalk"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/deadfall.jpeg",
    "id": 635
  },
  {
    "name": "Durkwood Boars",
    "cost": "{4}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Boar",
    "power": 4,
    "toughness": 4,
    "img": "img/durkwood_boars.jpeg",
    "id": 636
  },
  {
    "name": "Elven Riders",
    "static": [{"type": "blockableOnlyBy", "keywords": ["flying"], "subtypes": ["Wall"]}],
    "cost": "{3}{G}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Les Cavaliers elfes ne peuvent être bloqués que par des créatures avec le vol et/ou des murs.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Elf",
    "power": 3,
    "toughness": 3,
    "img": "img/elven_riders.jpeg",
    "id": 637
  },
  {
    "name": "Emerald Dragonfly",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Vol. {G}{G} : Cette créature gagne l'initiative jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Insect",
    "power": 1,
    "toughness": 1,
    "img": "img/emerald_dragonfly.jpeg",
    "id": 638
  },
  {
    "name": "Eureka",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "En commençant par vous, chaque joueur peut mettre une carte de permanent de sa main sur le champ de bataille. Répétez ce processus jusqu'à ce que personne ne mette de carte sur le champ de bataille.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/eureka.jpeg",
    "id": 639
  },
  {
    "name": "Fire Sprites",
    "activated": [{"cost": "{G}", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "R", "amount": 1}}],
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Vol. {G}, {T} : Ajoutez {R}.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Faerie",
    "power": 1,
    "toughness": 1,
    "img": "img/fire_sprites.jpeg",
    "id": 640
  },
  {
    "name": "Floral Spuzzem",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois que cette créature attaque et n'est pas bloquée, vous pouvez détruire l'artefact ciblé que le joueur défenseur contrôle. Si vous faites ainsi, cette créature n'assigne aucune blessure de combat ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elemental",
    "power": 2,
    "toughness": 2,
    "img": "img/floral_spuzzem.jpeg",
    "id": 641
  },
  {
    "name": "Giant Turtle",
    "static": [{"type": "cantAttackIfAttackedLastTurn"}],
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Cette créature ne peut pas attaquer si elle a attaqué pendant votre dernier tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Turtle",
    "power": 2,
    "toughness": 4,
    "img": "img/giant_turtle.jpeg",
    "id": 642
  },
  {
    "name": "Glyph of Reincarnation",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Lancez ce sort uniquement après le combat. Détruisez toutes les créatures que le Mur ciblé a bloquées ce tour-ci. Elles ne peuvent pas être régénérées. Pour chaque créature morte ainsi, mettez une carte de créature du cimetière du joueur qui contrôlait cette créature la dernière fois qu'elle a été bloquée par ce Mur sur le champ de bataille sous le contrôle de son propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/glyph_of_reincarnation.jpeg",
    "id": 643
  },
  {
    "name": "Hornet Cobra",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Initiative.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Snake",
    "power": 2,
    "toughness": 1,
    "img": "img/hornet_cobra.jpeg",
    "id": 644
  },
  {
    "name": "Ichneumon Druid",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "À chaque fois qu'un adversaire lance un sort éphémère autre que le premier sort éphémère que ce joueur lance chaque tour, cette créature inflige 4 blessures à ce joueur.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Druid",
    "power": 1,
    "toughness": 1,
    "img": "img/ichneumon_druid.jpeg",
    "id": 645
  },
  {
    "name": "Killer Bees",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vol. {G} : Cette créature gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "activated": [{ "cost": "{G}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 1 } }],
    "effectStatus": "implemented",
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Insect",
    "power": 0,
    "toughness": 1,
    "img": "img/killer_bees.jpeg",
    "id": 646
  },
  {
    "name": "Living Plane",
    "static": [{"type": "changeType", "addType": "Creature", "filterType": "Land", "controllerFilter": "all"}, {"type": "setPowerToughness", "power": 1, "toughness": 1, "filterType": "Land", "controllerFilter": "all"}],
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Tous les terrains sont des créatures 1/1 qui restent des terrains.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/living_plane.jpeg",
    "id": 647
  },
  {
    "name": "Master of the Hunt",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{2}{G}{G} : Créez un jeton de créature 1/1 vert Loup nommé Wolves of the Hunt. Il a « regroupement avec d'autres créatures nommées Wolves of the Hunt ». (N'importe quelles créatures nommées Wolves of the Hunt peuvent attaquer en groupe tant qu'au moins l'une d'elles a « regroupement avec d'autres créatures nommées Wolves of the Hunt ». Les groupes sont bloqués comme un tout. Si au moins deux créatures nommées Wolves of the Hunt que vous contrôlez, dont l'une a « regroupement avec d'autres créatures nommées Wolves of the Hunt », bloquent ou sont bloquées par la même créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human",
    "power": 2,
    "toughness": 2,
    "img": "img/master_of_the_hunt.jpeg",
    "id": 648
  },
  {
    "name": "Moss Monster",
    "cost": "{3}{G}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Elemental",
    "power": 3,
    "toughness": 6,
    "img": "img/moss_monster.jpeg",
    "id": 649
  },
  {
    "name": "Pixie Queen",
    "activated": [{"cost": "{G}{G}{G}", "tap": true, "effect": {"type": "addKeywordUntilEnd", "keyword": "flying", "target": "creature"}}],
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vol. {G}{G}{G}, {T} : La créature ciblée gagne le vol jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Faerie",
    "power": 1,
    "toughness": 1,
    "img": "img/pixie_queen.jpeg",
    "id": 650
  },
  {
    "name": "Pradesh Gypsies",
    "activated": [{"cost": "{1}{G}", "tap": true, "effect": {"type": "pump", "power": -2, "toughness": 0, "target": "creature"}}],
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{1}{G}, {T} : La créature ciblée gagne -2/-0 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Nomad",
    "power": 1,
    "toughness": 1,
    "img": "img/pradesh_gypsies.jpeg",
    "id": 651
  },
  {
    "name": "Rabid Wombat",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Vigilance. Cette créature gagne +2/+2 pour chaque Aura qui lui est attachée.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "vigilance"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Wombat",
    "power": 0,
    "toughness": 1,
    "img": "img/rabid_wombat.jpeg",
    "id": 652
  },
  {
    "name": "Radjan Spirit",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "removeKeywordUntilEnd", "keyword": "flying", "target": "creature"}}],
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : La créature ciblée perd le vol jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Spirit",
    "power": 3,
    "toughness": 2,
    "img": "img/radjan_spirit.jpeg",
    "id": 653
  },
  {
    "name": "Rebirth",
    "cost": "{3}{G}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Retirez cette carte de votre deck avant de jouer si vous ne jouez pas pour ante. Chaque joueur peut mettre en ante la carte du dessus de sa bibliothèque. Si un joueur le fait, son total de points de vie devient 20.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/rebirth.jpeg",
    "id": 654
  },
  {
    "name": "Reincarnation",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Choisissez une créature ciblée. Quand cette créature meurt ce tour-ci, renvoyez une carte de créature sur le champ de bataille depuis le cimetière de son propriétaire, sous le contrôle du propriétaire de cette créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/reincarnation.jpeg",
    "id": 655
  },
  {
    "name": "Revelation",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "World Enchantment",
    "rarity": "Rare",
    "text_fr": "Les joueurs jouent avec leur main révélée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/revelation.jpeg",
    "id": 656
  },
  {
    "name": "Rust",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Contrecarrez la capacité activée ciblée provenant d'une source artefact. (Les capacités de mana ne peuvent pas être ciblées.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/rust.jpeg",
    "id": 657
  },
  {
    "name": "Shelkin Brownie",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{T} : La créature ciblée perd toutes les capacités « regroupement avec » jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Ouphe",
    "power": 1,
    "toughness": 1,
    "img": "img/shelkin_brownie.jpeg",
    "id": 658
  },
  {
    "name": "Storm Seeker",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Storm Seeker inflige au joueur ciblé des blessures égales au nombre de cartes dans sa main.",
    "effect": {"type": "damageByCount", "target": "player", "count": "cardsInHand", "whose": "victim"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/storm_seeker.jpeg",
    "id": 659
  },
  {
    "name": "Subdue",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Prévenez toutes les blessures de combat que la créature ciblée devrait infliger ce tour-ci. Cette créature gagne +0/+X jusqu'à la fin du tour, X étant sa valeur de mana.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/subdue.jpeg",
    "id": 660
  },
  {
    "name": "Sylvan Library",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre étape de pioche, vous pouvez piocher deux cartes supplémentaires. Si vous le faites, choisissez deux cartes dans votre main piochées ce tour-ci. Pour chacune de ces cartes, payez 4 points de vie ou mettez cette carte au-dessus de votre bibliothèque.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/sylvan_library.jpeg",
    "id": 661
  },
  {
    "name": "Sylvan Paradise",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Une ou plusieurs créatures ciblées deviennent vertes jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/sylvan_paradise.jpeg",
    "id": 662
  },
  {
    "name": "Typhoon",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Typhoon inflige à chaque adversaire des blessures égales au nombre d'îles que ce joueur contrôle.",
    "effect": {"type": "damageEachOpponentByCount", "count": "island", "whose": "victim"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/typhoon.jpeg",
    "id": 663
  },
  {
    "name": "Untamed Wilds",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Cherchez dans votre bibliothèque une carte de terrain de base et mettez cette carte en jeu. Mélangez ensuite votre bibliothèque.",
    "effect": {"type": "searchLibrary", "basicLand": true, "destination": "battlefield"},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/untamed_wilds.jpeg",
    "id": 664
  },
  {
    "name": "Whirling Dervish",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Protection contre le noir\nÀ la fin du tour, si le Derviche tourneur a infligé des blessures à un adversaire ce tour-ci, mettez un marqueur +1/+1 sur lui.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "protection"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Monk",
    "power": 1,
    "toughness": 1,
    "img": "img/whirling_dervish.jpeg",
    "id": 665
  },
  {
    "name": "Willow Satyr",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Vous pouvez choisir de ne pas dégager cette créature pendant votre étape de dégagement. {T} : Acquérez le contrôle de la créature légendaire ciblée aussi longtemps que vous contrôlez cette créature et qu'elle reste engagée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Satyr",
    "power": 1,
    "toughness": 1,
    "img": "img/willow_satyr.jpeg",
    "id": 666
  },
  {
    "name": "Winter Blast",
    "cost": "{X}{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Engagez X créatures ciblées. Winter Blast inflige 2 blessures à chacune de ces créatures ayant le vol.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/winter_blast.jpeg",
    "id": 667
  },
  {
    "name": "Wolverine Pack",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Sauvagerie 2 (À chaque fois que cette créature devient bloquée, elle gagne +2/+2 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "rampage2"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Wolverine",
    "power": 2,
    "toughness": 4,
    "img": "img/wolverine_pack.jpeg",
    "id": 668
  },
  {
    "name": "Wood Elemental",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Au moment où cette créature arrive sur le champ de bataille, sacrifiez n'importe quel nombre de forêts non-engagées. La force et l'endurance de Wood Elemental sont chacune égales au nombre de forêts sacrifiées à son arrivée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elemental",
    "power": "*",
    "toughness": "*",
    "img": "img/wood_elemental.jpeg",
    "id": 669
  },
  {
    "name": "Adun Oakenshield",
    "cost": "{B}{R}{G}",
    "cmc": 3,
    "color": [
      "B",
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{B}{R}{G}, {T} : Renvoyez la carte de créature ciblée depuis votre cimetière dans votre main.",
    "sets": [
      "LEG"
    ],
    "subtype": "Human Knight",
    "power": 1,
    "toughness": 2,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/adun_oakenshield.jpeg",
    "id": 670
  },
  {
    "name": "Angus Mackenzie",
    "cost": "{G}{W}{U}",
    "cmc": 3,
    "color": [
      "G",
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{G}{W}{U}, {T} : Prévenez toutes les blessures de combat qui devraient être infligées ce tour-ci. N'activez cette capacité qu'avant l'étape des blessures de combat.",
    "sets": [
      "LEG"
    ],
    "subtype": "Human Cleric",
    "power": 2,
    "toughness": 2,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/angus_mackenzie.jpeg",
    "id": 671
  },
  {
    "name": "Arcades Sabboth",
    "cost": "{2}{G}{G}{W}{W}{U}{U}",
    "cmc": 8,
    "color": [
      "G",
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol\nAu début de votre entretien, sacrifiez Arcades Sabboth à moins que vous ne payiez {G}{W}{U}.\nChaque créature dégagée que vous contrôlez gagne +0/+2 tant qu'elle n'attaque pas.\n{W} : Arcades Sabboth gagne +0/+1 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "subtype": "Elder Dragon",
    "power": 7,
    "toughness": 7,
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/arcades_sabboth.jpeg",
    "id": 672
  },
  {
    "name": "Axelrod Gunnarson",
    "cost": "{4}{B}{B}{R}{R}",
    "cmc": 8,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Piétinement. À chaque fois qu'une créature ayant subi des blessures d'Axelrod Gunnarson ce tour-ci meurt, vous gagnez 1 point de vie et Axelrod Gunnarson inflige 1 blessure au joueur ou au planeswalker ciblé.",
    "sets": [
      "LEG"
    ],
    "subtype": "Giant",
    "power": 5,
    "toughness": 5,
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/axelrod_gunnarson.jpeg",
    "id": 673
  },
  {
    "name": "Ayesha Tanaka",
    "cost": "{W}{W}{U}{U}",
    "cmc": 4,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Regroupement (N'importe quelles créatures avec le regroupement, et jusqu'à une sans, peuvent attaquer en groupe. Les groupes sont bloqués comme un tout. Si une créature avec le regroupement que vous contrôlez bloque une créature ou est bloquée par elle, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.) {T} : Contrecarrez la capacité activée ciblée provenant d'une source artefact à moins que le contrôleur de cette capacité ne paie {W}. (Les capacités de mana ne peuvent pas être ciblées.)",
    "sets": [
      "LEG"
    ],
    "subtype": "Human Artificer",
    "power": 2,
    "toughness": 2,
    "keywords": [
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/ayesha_tanaka.jpeg",
    "id": 674
  },
  {
    "name": "Barktooth Warbeard",
    "cost": "{4}{B}{R}{R}",
    "cmc": 7,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "subtype": "Human Warrior",
    "power": 6,
    "toughness": 5,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/barktooth_warbeard.jpeg",
    "id": 675
  },
  {
    "name": "Bartel Runeaxe",
    "cost": "{3}{B}{R}{G}",
    "cmc": 6,
    "color": [
      "B",
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vigilance. Bartel Runeaxe ne peut pas être la cible de sorts d'Aura.",
    "sets": [
      "LEG"
    ],
    "subtype": "Giant Warrior",
    "power": 6,
    "toughness": 5,
    "keywords": [
      "vigilance"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/bartel_runeaxe.jpeg",
    "id": 676
  },
  {
    "name": "Boris Devilboon",
    "cost": "{3}{B}{R}",
    "cmc": 5,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{2}{B}{R}, {T} : Créez un jeton de créature 1/1 noire et rouge Démon nommé Minor Demon.",
    "sets": [
      "LEG"
    ],
    "subtype": "Zombie Wizard",
    "power": 2,
    "toughness": 2,
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/boris_devilboon.jpeg",
    "id": 677
  },
  {
    "name": "Chromium",
    "cost": "{2}{W}{W}{U}{U}{B}{B}",
    "cmc": 8,
    "color": [
      "W",
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol. Sauvagerie 2 (À chaque fois que cette créature devient bloquée, elle gagne +2/+2 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.) Au début de votre entretien, sacrifiez Chromium à moins que vous ne payiez {W}{U}{B}.",
    "sets": [
      "LEG"
    ],
    "subtype": "Elder Dragon",
    "power": 7,
    "toughness": 7,
    "keywords": [
      "flying",
      "rampage2"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/chromium.jpeg",
    "id": 678
  },
  {
    "name": "Dakkon Blackblade",
    "cost": "{2}{W}{U}{U}{B}",
    "cmc": 6,
    "color": [
      "W",
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "La force et l'endurance de Dakkon Blackblade sont chacune égales au nombre de terrains que vous contrôlez.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Warrior",
    "power": "*",
    "toughness": "*",
    "img": "img/dakkon_blackblade.jpeg",
    "id": 679
  },
  {
    "name": "Gabriel Angelfire",
    "cost": "{3}{G}{G}{W}{W}",
    "cmc": 7,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, choisissez le vol, l'initiative, le piétinement ou la sauvagerie 3. Gabriel Angelfire gagne cette capacité jusqu'à votre prochain entretien. (À chaque fois qu'une créature avec la sauvagerie 3 devient bloquée, elle gagne +3/+3 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Angel",
    "power": 4,
    "toughness": 4,
    "img": "img/gabriel_angelfire.jpeg",
    "id": 680
  },
  {
    "name": "Gosta Dirk",
    "cost": "{3}{W}{W}{U}{U}",
    "cmc": 7,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Initiative. Les créatures avec la traversée des îles peuvent être bloquées comme si elles n'avaient pas la traversée des îles.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Warrior",
    "power": 4,
    "toughness": 4,
    "img": "img/gosta_dirk.jpeg",
    "id": 681
  },
  {
    "name": "Gwendlyn Di Corci",
    "cost": "{U}{B}{B}{R}",
    "cmc": 4,
    "color": [
      "U",
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Le joueur ciblé défausse une carte au hasard. N'activez cette capacité que pendant votre tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Rogue",
    "power": 3,
    "toughness": 5,
    "img": "img/gwendlyn_di_corci.jpeg",
    "id": 682
  },
  {
    "name": "Halfdane",
    "cost": "{1}{W}{U}{B}",
    "cmc": 4,
    "color": [
      "W",
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, modifiez la force et l'endurance de base de Halfdane pour qu'elles deviennent égales à la force et l'endurance de la créature ciblée autre que Halfdane, jusqu'à la fin de votre prochain entretien.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Shapeshifter",
    "power": 3,
    "toughness": 3,
    "img": "img/halfdane.jpeg",
    "id": 683
  },
  {
    "name": "Hazezon Tamar",
    "cost": "{4}{R}{G}{W}",
    "cmc": 7,
    "color": [
      "R",
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Quand Hazezon arrive sur le champ de bataille, créez X jetons de créature 1/1 Guerrier du sable rouges, verts et blancs au début de votre prochain entretien, X étant le nombre de terrains que vous contrôlez à ce moment. Quand Hazezon quitte le champ de bataille, exilez tous les Guerriers du sable.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Warrior",
    "power": 2,
    "toughness": 4,
    "img": "img/hazezon_tamar.jpeg",
    "id": 684
  },
  {
    "name": "Hunding Gjornersen",
    "cost": "{3}{W}{U}{U}",
    "cmc": 6,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "Sauvagerie 1 (À chaque fois que cette créature devient bloquée, elle gagne +1/+1 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "rampage1"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Warrior",
    "power": 5,
    "toughness": 4,
    "img": "img/hunding_gjornersen.jpeg",
    "id": 685
  },
  {
    "name": "Jacques le Vert",
    "cost": "{1}{R}{G}{W}",
    "cmc": 4,
    "color": [
      "R",
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Les créatures vertes que vous contrôlez gagnent +0/+2.",
    "static": {"type": "anthem", "filterColor": "G", "controllerFilter": "self", "onlyCreatures": true, "power": 0, "toughness": 2},
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Warrior",
    "power": 3,
    "toughness": 2,
    "img": "img/jacques_le_vert.jpeg",
    "id": 686
  },
  {
    "name": "Jasmine Boreal",
    "cost": "{3}{G}{W}",
    "cmc": 5,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human",
    "power": 4,
    "toughness": 5,
    "img": "img/jasmine_boreal.jpeg",
    "id": 687
  },
  {
    "name": "Jedit Ojanen",
    "cost": "{4}{W}{W}{U}",
    "cmc": 7,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Cat Warrior",
    "power": 5,
    "toughness": 5,
    "img": "img/jedit_ojanen.jpeg",
    "id": 688
  },
  {
    "name": "Jerrard of the Closed Fist",
    "cost": "{3}{R}{G}{G}",
    "cmc": 6,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human Knight",
    "power": 6,
    "toughness": 5,
    "img": "img/jerrard_of_the_closed_fist.jpeg",
    "id": 689
  },
  {
    "name": "Johan",
    "cost": "{3}{R}{G}{W}",
    "cmc": 6,
    "color": [
      "R",
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Au début du combat pendant votre tour, vous pouvez faire en sorte que Johan gagne « Johan ne peut pas attaquer » jusqu'à la fin du combat. Si vous faites ainsi, attaquer ne fait pas s'engager les créatures que vous contrôlez ce combat si Johan est non-engagé.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Wizard",
    "power": 5,
    "toughness": 4,
    "img": "img/johan.jpeg",
    "id": 690
  },
  {
    "name": "Kasimir the Lone Wolf",
    "cost": "{4}{W}{U}",
    "cmc": 6,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human Warrior",
    "power": 5,
    "toughness": 3,
    "img": "img/kasimir_the_lone_wolf.jpeg",
    "id": 691
  },
  {
    "name": "Kei Takahashi",
    "cost": "{2}{G}{W}",
    "cmc": 4,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Prévenez les 2 prochaines blessures qui devraient être infligées à la créature ciblée ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {"type": "preventDamage", "amount": 2, "target": "creature"}
      }
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Cleric",
    "power": 2,
    "toughness": 2,
    "img": "img/kei_takahashi.jpeg",
    "id": 692
  },
  {
    "name": "Lady Caleria",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 3, "target": "attackingOrBlockingCreature"}}],
    "cost": "{3}{G}{G}{W}{W}",
    "cmc": 7,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Lady Caleria inflige 3 blessures à la créature ciblée attaquante ou bloqueuse.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Elf Archer",
    "power": 3,
    "toughness": 6,
    "img": "img/lady_caleria.jpeg",
    "id": 693
  },
  {
    "name": "Lady Evangela",
    "cost": "{W}{U}{B}",
    "cmc": 3,
    "color": [
      "W",
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{W}{B}, {T} : Prévenez toutes les blessures de combat que la créature ciblée devrait infliger ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 2,
    "img": "img/lady_evangela.jpeg",
    "id": 694
  },
  {
    "name": "Lady Orca",
    "cost": "{5}{B}{R}",
    "cmc": 7,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Demon",
    "power": 7,
    "toughness": 4,
    "img": "img/lady_orca.jpeg",
    "id": 695
  },
  {
    "name": "Livonya Silone",
    "cost": "{2}{R}{R}{G}{G}",
    "cmc": 6,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Initiative ; traversée des terrains légendaires. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle un terrain légendaire.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "firstStrike",
      "legendary landwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Warrior",
    "power": 4,
    "toughness": 4,
    "img": "img/livonya_silone.jpeg",
    "id": 696
  },
  {
    "name": "Lord Magnus",
    "cost": "{3}{G}{W}{W}",
    "cmc": 6,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "Initiative. Les créatures avec la traversée des plaines peuvent être bloquées comme si elles n'avaient pas la traversée des plaines. Les créatures avec la traversée des forêts peuvent être bloquées comme si elles n'avaient pas la traversée des forêts.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Druid",
    "power": 4,
    "toughness": 3,
    "img": "img/lord_magnus.jpeg",
    "id": 697
  },
  {
    "name": "Marhault Elsdragon",
    "cost": "{3}{R}{R}{G}",
    "cmc": 6,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "Sauvagerie 1 (À chaque fois que cette créature devient bloquée, elle gagne +1/+1 jusqu'à la fin du tour pour chaque créature la bloquant au-delà de la première.)",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "rampage1"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Elf Warrior",
    "power": 4,
    "toughness": 6,
    "img": "img/marhault_elsdragon.jpeg",
    "id": 698
  },
  {
    "name": "Nebuchadnezzar",
    "cost": "{3}{U}{B}",
    "cmc": 5,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{X}, {T} : Choisissez un nom de carte. L'adversaire ciblé révèle X cartes au hasard de sa main. Ce joueur défausse ensuite toutes les cartes portant ce nom révélées ainsi. N'activez cette capacité que pendant votre tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Wizard",
    "power": 3,
    "toughness": 3,
    "img": "img/nebuchadnezzar.jpeg",
    "id": 699
  },
  {
    "name": "Nicol Bolas",
    "cost": "{2}{U}{U}{B}{B}{R}{R}",
    "cmc": 8,
    "color": [
      "U",
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol\nAu début de votre entretien, sacrifiez Nicol Bolas à moins que vous ne payiez {U}{B}{R}.\nÀ chaque fois que Nicol Bolas inflige des blessures à un adversaire, ce joueur se défausse de sa main.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elder Dragon",
    "power": 7,
    "toughness": 7,
    "img": "img/nicol_bolas.jpeg",
    "id": 700
  },
  {
    "name": "Palladia-Mors",
    "cost": "{2}{R}{R}{G}{G}{W}{W}",
    "cmc": 8,
    "color": [
      "R",
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol, piétinement. Au début de votre entretien, sacrifiez Palladia-Mors à moins que vous ne payiez {R}{G}{W}.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying",
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elder Dragon",
    "power": 7,
    "toughness": 7,
    "img": "img/palladiamors.jpeg",
    "id": 701
  },
  {
    "name": "Pavel Maliki",
    "cost": "{4}{B}{R}",
    "cmc": 6,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "{B}{R} : Pavel Maliki gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "activated": [{ "cost": "{B}{R}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 0 } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human",
    "power": 5,
    "toughness": 3,
    "img": "img/pavel_maliki.jpeg",
    "id": 702
  },
  {
    "name": "Princess Lucrezia",
    "tapAbility": {"produces": "U"},
    "cost": "{3}{U}{U}{B}",
    "cmc": 6,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {U}.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Wizard",
    "power": 5,
    "toughness": 4,
    "img": "img/princess_lucrezia.jpeg",
    "id": 703
  },
  {
    "name": "Ragnar",
    "cost": "{G}{W}{U}",
    "cmc": 3,
    "color": [
      "G",
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{G}{W}{U}, {T} : Régénérez la créature ciblée.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Cleric",
    "power": 2,
    "toughness": 2,
    "img": "img/ragnar.jpeg",
    "id": 704
  },
  {
    "name": "Ramirez DePietro",
    "cost": "{3}{U}{B}{B}",
    "cmc": 6,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "Initiative.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Pirate",
    "power": 4,
    "toughness": 3,
    "img": "img/ramirez_depietro.jpeg",
    "id": 705
  },
  {
    "name": "Ramses Overdark",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "destroy", "target": "creature", "requireEnchanted": true}}],
    "cost": "{2}{U}{U}{B}{B}",
    "cmc": 6,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "{T} : Détruisez la créature enchantée ciblée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Assassin",
    "power": 4,
    "toughness": 3,
    "img": "img/ramses_overdark.jpeg",
    "id": 706
  },
  {
    "name": "Rasputin Dreamweaver",
    "cost": "{4}{W}{U}",
    "cmc": 6,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Rasputin arrive sur le champ de bataille avec sept marqueurs de rêve. Retirez un marqueur de rêve de Rasputin : Ajoutez {C}. Retirez un marqueur de rêve de Rasputin : Prévenez la prochaine blessure de 1 point qui devrait être infligée à Rasputin ce tour-ci. Au début de votre entretien, si Rasputin a commencé le tour non-engagé, mettez un marqueur de rêve sur lui. Rasputin ne peut pas avoir plus de sept marqueurs de rêve sur lui.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Wizard",
    "power": 4,
    "toughness": 1,
    "img": "img/rasputin_dreamweaver.jpeg",
    "id": 707
  },
  {
    "name": "Riven Turnbull",
    "tapAbility": {"produces": "B"},
    "cost": "{5}{U}{B}",
    "cmc": 7,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {B}.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Advisor",
    "power": 5,
    "toughness": 7,
    "img": "img/riven_turnbull.jpeg",
    "id": 708
  },
  {
    "name": "Rohgahh of Kher Keep",
    "cost": "{2}{B}{B}{R}{R}",
    "cmc": 6,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, vous pouvez payer {R}{R}{R}. Si vous ne le faites pas, engagez Rohgahh et toutes les créatures nommées Kobolds of Kher Keep, puis un adversaire en acquiert le contrôle. Les créatures que vous contrôlez nommées Kobolds of Kher Keep gagnent +2/+2.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Kobold",
    "power": 5,
    "toughness": 5,
    "img": "img/rohgahh_of_kher_keep.jpeg",
    "id": 709
  },
  {
    "name": "Rubinia Soulsinger",
    "cost": "{2}{G}{W}{U}",
    "cmc": 5,
    "color": [
      "G",
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vous pouvez choisir de ne pas dégager Rubinia Chantelâme pendant votre étape de dégagement.{T} : Acquérez le contrôle de la créature ciblée tant que vous contrôlez Rubinia Chantelâme et que Rubinia reste engagée.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Faerie",
    "power": 2,
    "toughness": 3,
    "img": "img/rubinia_soulsinger.jpeg",
    "id": 710
  },
  {
    "name": "Sir Shandlar of Eberyn",
    "cost": "{4}{G}{W}",
    "cmc": 6,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human Knight",
    "power": 4,
    "toughness": 7,
    "img": "img/sir_shandlar_of_eberyn.jpeg",
    "id": 711
  },
  {
    "name": "Sivitri Scarzam",
    "cost": "{5}{U}{B}",
    "cmc": 7,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human",
    "power": 6,
    "toughness": 4,
    "img": "img/sivitri_scarzam.jpeg",
    "id": 712
  },
  {
    "name": "Sol'kanar the Swamp King",
    "cost": "{2}{U}{B}{R}",
    "cmc": 5,
    "color": [
      "U",
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Traversée des marais\nÀ chaque fois qu'un joueur joue un sort noir, vous gagnez 1 point de vie.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "landwalk",
      "swampwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Demon",
    "power": 5,
    "toughness": 5,
    "img": "img/solkanar_the_swamp_king.jpeg",
    "id": 713
  },
  {
    "name": "Stangg",
    "cost": "{4}{R}{G}",
    "cmc": 6,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Quand Stangg arrive sur le champ de bataille, créez Stangg Twin, un jeton de créature légendaire 3/4 rouge et verte Humain et Guerrier. Exilez ce jeton quand Stangg quitte le champ de bataille. Sacrifiez Stangg quand ce jeton quitte le champ de bataille.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Warrior",
    "power": 3,
    "toughness": 4,
    "img": "img/stangg.jpeg",
    "id": 714
  },
  {
    "name": "Sunastian Falconer",
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "C", "amount": 2}}],
    "cost": "{3}{R}{G}",
    "cmc": 5,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {C}{C}.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Shaman",
    "power": 4,
    "toughness": 4,
    "img": "img/sunastian_falconer.jpeg",
    "id": 715
  },
  {
    "name": "Tetsuo Umezawa",
    "cost": "{U}{B}{R}",
    "cmc": 3,
    "color": [
      "U",
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Tetsuo Umezawa ne peut pas être la cible de sorts d'Aura. {U}{B}{B}{R}, {T} : Détruisez la créature ciblée engagée ou bloqueuse.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Archer",
    "power": 3,
    "toughness": 3,
    "img": "img/tetsuo_umezawa.jpeg",
    "id": 716
  },
  {
    "name": "The Lady of the Mountain",
    "cost": "{4}{R}{G}",
    "cmc": 6,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Giant",
    "power": 5,
    "toughness": 5,
    "img": "img/the_lady_of_the_mountain.jpeg",
    "id": 717
  },
  {
    "name": "Tobias Andrion",
    "cost": "{3}{W}{U}",
    "cmc": 5,
    "color": [
      "W",
      "U"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human Advisor",
    "power": 4,
    "toughness": 4,
    "img": "img/tobias_andrion.jpeg",
    "id": 718
  },
  {
    "name": "Tor Wauki",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 2, "target": "attackingOrBlockingCreature"}}],
    "cost": "{2}{B}{B}{R}",
    "cmc": 5,
    "color": [
      "B",
      "R"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Tor Wauki inflige 2 blessures à la créature ciblée attaquante ou bloqueuse.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Archer",
    "power": 3,
    "toughness": 3,
    "img": "img/tor_wauki.jpeg",
    "id": 719
  },
  {
    "name": "Torsten Von Ursus",
    "cost": "{3}{G}{G}{W}",
    "cmc": 6,
    "color": [
      "G",
      "W"
    ],
    "type": "Legendary Creature",
    "rarity": "Uncommon",
    "text_fr": "",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "subtype": "Human Soldier",
    "power": 5,
    "toughness": 5,
    "img": "img/torsten_von_ursus.jpeg",
    "id": 720
  },
  {
    "name": "Tuknir Deathlock",
    "activated": [{"cost": "{R}{G}", "tap": true, "effect": {"type": "pump", "power": 2, "toughness": 2, "target": "creature"}}],
    "cost": "{R}{R}{G}{G}",
    "cmc": 4,
    "color": [
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol. {R}{G}, {T} : La créature ciblée gagne +2/+2 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Wizard",
    "power": 2,
    "toughness": 2,
    "img": "img/tuknir_deathlock.jpeg",
    "id": 721
  },
  {
    "name": "Ur-Drago",
    "cost": "{3}{U}{U}{B}{B}",
    "cmc": 7,
    "color": [
      "U",
      "B"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Initiative. Les créatures avec la traversée des marais peuvent être bloquées comme si elles n'avaient pas la traversée des marais.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elemental",
    "power": 4,
    "toughness": 4,
    "img": "img/urdrago.jpeg",
    "id": 722
  },
  {
    "name": "Vaevictis Asmadi",
    "cost": "{2}{B}{B}{R}{R}{G}{G}",
    "cmc": 8,
    "color": [
      "B",
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol. Au début de votre entretien, sacrifiez Vaevictis Asmadi à moins que vous ne payiez {B}{R}{G}. {B} : Vaevictis Asmadi gagne +1/+0 jusqu'à la fin du tour. {R} : Vaevictis Asmadi gagne +1/+0 jusqu'à la fin du tour. {G} : Vaevictis Asmadi gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elder Dragon",
    "power": 7,
    "toughness": 7,
    "img": "img/vaevictis_asmadi.jpeg",
    "id": 723
  },
  {
    "name": "Xira Arien",
    "cost": "{B}{R}{G}",
    "cmc": 3,
    "color": [
      "B",
      "R",
      "G"
    ],
    "type": "Legendary Creature",
    "rarity": "Rare",
    "text_fr": "Vol\n{B}{R}{G}, {T} : Un joueur ciblé pioche une carte.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Insect Wizard",
    "power": 1,
    "toughness": 2,
    "img": "img/xira_arien.jpeg",
    "id": 724
  },
  {
    "name": "Al-abara's Carpet",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{5}, {T} : Prévenez toutes les blessures qui devraient vous être infligées ce tour-ci par des créatures attaquantes sans le vol.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/alabaras_carpet.jpeg",
    "id": 725
  },
  {
    "name": "Alchor's Tomb",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2}, {T} : Le permanent ciblé que vous contrôlez devient de la couleur de votre choix. (Cet effet dure indéfiniment.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/alchors_tomb.jpeg",
    "id": 726
  },
  {
    "name": "Arena of the Ancients",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Les créatures légendaires ne se dégagent pas pendant les étapes de dégagement de leurs contrôleurs. Quand cet artefact arrive sur le champ de bataille, engagez toutes les créatures légendaires.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/arena_of_the_ancients.jpeg",
    "id": 727
  },
  {
    "name": "Black Mana Battery",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Mettez un marqueur de charge sur cet artefact. {T}, Retirez n'importe quel nombre de marqueurs de charge de cet artefact : Ajoutez {B}, puis ajoutez un {B} supplémentaire pour chaque marqueur de charge retiré ainsi.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/black_mana_battery.jpeg",
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "addCounter", "counter": "charge", "amount": 1}}, {"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "B", "amount": 1, "perCounterRemoved": {"counter": "charge", "amount": 1}}}],
    "id": 728
  },
  {
    "name": "Blue Mana Battery",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Mettez un marqueur de charge sur cet artefact. {T}, Retirez n'importe quel nombre de marqueurs de charge de cet artefact : Ajoutez {U}, puis ajoutez un {U} supplémentaire pour chaque marqueur de charge retiré ainsi.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/blue_mana_battery.jpeg",
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "addCounter", "counter": "charge", "amount": 1}}, {"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "U", "amount": 1, "perCounterRemoved": {"counter": "charge", "amount": 1}}}],
    "id": 729
  },
  {
    "name": "Bronze Horse",
    "cost": "{7}",
    "cmc": 7,
    "color": [],
    "type": "Artifact Creature",
    "rarity": "Rare",
    "text_fr": "Piétinement. Tant que vous contrôlez une autre créature, prévenez toutes les blessures qui devraient être infligées à cette créature par des sorts la ciblant.",
    "sets": [
      "LEG"
    ],
    "subtype": "Horse",
    "power": 4,
    "toughness": 4,
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/bronze_horse.jpeg",
    "id": 730
  },
  {
    "name": "Forethought Amulet",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, sacrifiez cet artefact à moins que vous ne payiez {3}. Si une source d'éphémère ou de sorcellerie devait vous infliger 3 blessures ou plus, elle vous inflige 2 blessures à la place.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/forethought_amulet.jpeg",
    "id": 731
  },
  {
    "name": "Gauntlets of Chaos",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{5}, Sacrifiez cet artefact : Échangez le contrôle de l'artefact, de la créature ou du terrain ciblé que vous contrôlez et du permanent ciblé qu'un adversaire contrôle et qui partage l'un de ces types avec lui. Si ces permanents sont échangés ainsi, détruisez toutes les Auras qui leur sont attachées.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/gauntlets_of_chaos.jpeg",
    "id": 732
  },
  {
    "name": "Green Mana Battery",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Mettez un marqueur de charge sur cet artefact. {T}, Retirez n'importe quel nombre de marqueurs de charge de cet artefact : Ajoutez {G}, puis ajoutez un {G} supplémentaire pour chaque marqueur de charge retiré ainsi.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/green_mana_battery.jpeg",
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "addCounter", "counter": "charge", "amount": 1}}, {"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "G", "amount": 1, "perCounterRemoved": {"counter": "charge", "amount": 1}}}],
    "id": 733
  },
  {
    "name": "Horn of Deafening",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2}, {T} : Prévenez toutes les blessures de combat que la créature ciblée devrait infliger ce tour-ci.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/horn_of_deafening.jpeg",
    "id": 734
  },
  {
    "name": "Knowledge Vault",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2}, {T} : Exilez la carte du dessus de votre bibliothèque, face cachée. {0} : Sacrifiez cet artefact. Si vous faites ainsi, défaussez votre main, puis mettez toutes les cartes exilées avec cet artefact dans la main de leur propriétaire. Quand cet artefact quitte le champ de bataille, mettez toutes les cartes exilées avec lui dans le cimetière de leur propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/knowledge_vault.jpeg",
    "id": 735
  },
  {
    "name": "Kry Shield",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Prévenez toutes les blessures que la créature ciblée que vous contrôlez devrait infliger ce tour-ci. Cette créature gagne +0/+X jusqu'à la fin du tour, X étant sa valeur de mana.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/kry_shield.jpeg",
    "id": 736
  },
  {
    "name": "Life Chisel",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez une créature : Vous gagnez autant de points de vie que l'endurance de la créature sacrifiée. N'activez cette capacité que pendant votre entretien.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/life_chisel.jpeg",
    "id": 737
  },
  {
    "name": "Life Matrix",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{4}, {T} : Mettez un marqueur de matrice sur la créature ciblée, qui gagne alors « Retirez un marqueur de matrice de cette créature : Régénérez cette créature. » N'activez cette capacité que pendant votre entretien.",
    "sets": [
      "LEG"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/life_matrix.jpeg",
    "id": 738
  },
  {
    "name": "Mana Matrix",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Les sorts d'éphémère et d'enchantement que vous lancez coûtent {2} de moins à lancer.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/mana_matrix.jpeg",
    "id": 739
  },
  {
    "name": "Marble Priest",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact Creature",
    "rarity": "Uncommon",
    "text_fr": "Tous les Murs capables de bloquer cette créature le font. Prévenez toutes les blessures de combat qui devraient être infligées à cette créature par des Murs.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Cleric",
    "power": 3,
    "toughness": 3,
    "img": "img/marble_priest.jpeg",
    "id": 740
  },
  {
    "name": "Mirror Universe",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{T}, Sacrifiez cet artefact : Échangez votre total de points de vie avec celui de l'adversaire ciblé. N'activez cette capacité que pendant votre entretien.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/mirror_universe.jpeg",
    "id": 741
  },
  {
    "name": "North Star",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{4}, {T} : Pour un sort ce tour-ci, vous pouvez dépenser du mana comme s'il s'agissait de mana de n'importe quel type pour payer le coût de mana de ce sort. (Les coûts additionnels sont toujours payés normalement.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/north_star.jpeg",
    "id": 742
  },
  {
    "name": "Nova Pentacle",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3}, {T} : La prochaine fois qu'une source de votre choix devrait vous infliger des blessures ce tour-ci, ces blessures sont infligées à la créature ciblée du choix d'un adversaire à la place.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/nova_pentacle.jpeg",
    "id": 743
  },
  {
    "name": "Planar Gate",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Les sorts de créature que vous lancez coûtent {2} de moins à lancer.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/planar_gate.jpeg",
    "id": 744
  },
  {
    "name": "Red Mana Battery",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Mettez un marqueur de charge sur cet artefact. {T}, Retirez n'importe quel nombre de marqueurs de charge de cet artefact : Ajoutez {R}, puis ajoutez un {R} supplémentaire pour chaque marqueur de charge retiré ainsi.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/red_mana_battery.jpeg",
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "addCounter", "counter": "charge", "amount": 1}}, {"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "R", "amount": 1, "perCounterRemoved": {"counter": "charge", "amount": 1}}}],
    "id": 745
  },
  {
    "name": "Relic Barrier",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T} : Engagez l'artefact ciblé.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/relic_barrier.jpeg",
    "id": 746
  },
  {
    "name": "Ring of Immortals",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3}, {T} : Contrecarrez le sort d'éphémère ou d'Aura ciblé qui cible un permanent que vous contrôlez.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/ring_of_immortals.jpeg",
    "id": 747
  },
  {
    "name": "Sentinel",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact Creature",
    "rarity": "Rare",
    "text_fr": "{0} : Changez l'endurance de base de cette créature pour qu'elle soit égale à 1 plus la force de la créature ciblée bloquant ou bloquée par cette créature. (Cet effet dure indéfiniment.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Shapeshifter",
    "power": 1,
    "toughness": 1,
    "img": "img/sentinel.jpeg",
    "id": 748
  },
  {
    "name": "Serpent Generator",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{4} : mettez en jeu un jeton Serpent 1/1.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/serpent_generator.jpeg",
    "effectStatus": "unimplemented",
    "id": 749
  },
  {
    "name": "Sword of the Ages",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Cet artefact arrive engagé sur le champ de bataille. {T}, Sacrifiez cet artefact et n'importe quel nombre de créatures que vous contrôlez : Cet artefact inflige à n'importe quelle cible des blessures égales à la force totale des créatures sacrifiées ainsi, puis exilez cet artefact et ces cartes de créature.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/sword_of_the_ages.jpeg",
    "id": 750
  },
  {
    "name": "Triassic Egg",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3}, {T} : Mettez un marqueur d'éclosion sur cet artefact. Sacrifiez cet artefact : Choisissez l'un. N'activez cette capacité que s'il y a deux marqueurs d'éclosion ou plus sur cet artefact.\n• Vous pouvez mettre une carte de créature de votre main sur le champ de bataille.\n• Renvoyez la carte de créature ciblée de votre cimetière sur le champ de bataille.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/triassic_egg.jpeg",
    "id": 751
  },
  {
    "name": "Voodoo Doll",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, mettez un marqueur d'épingle sur cet artefact. Au début de votre étape de fin de tour, si cet artefact est non-engagé, détruisez-le, et il vous inflige alors des blessures égales au nombre de marqueurs d'épingle sur lui. {X}{X}, {T} : Cet artefact inflige à n'importe quelle cible des blessures égales au nombre de marqueurs d'épingle sur lui. X est le nombre de marqueurs d'épingle sur cet artefact.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/voodoo_doll.jpeg",
    "id": 752
  },
  {
    "name": "White Mana Battery",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Mettez un marqueur de charge sur cet artefact. {T}, Retirez n'importe quel nombre de marqueurs de charge de cet artefact : Ajoutez {W}, puis ajoutez un {W} supplémentaire pour chaque marqueur de charge retiré ainsi.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/white_mana_battery.jpeg",
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "addCounter", "counter": "charge", "amount": 1}}, {"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "W", "amount": 1, "perCounterRemoved": {"counter": "charge", "amount": 1}}}],
    "id": 753
  },
  {
    "name": "Adventurers' Guildhouse",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Les créatures légendaires vertes que vous contrôlez ont « regroupement avec d'autres créatures légendaires ». (N'importe quelles créatures légendaires peuvent attaquer en groupe tant qu'au moins l'une d'elles a « regroupement avec d'autres créatures légendaires ». Les groupes sont bloqués comme un tout. Si au moins deux créatures légendaires que vous contrôlez, dont l'une a « regroupement avec d'autres créatures légendaires », bloquent ou sont bloquées par la même créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/adventurers_guildhouse.jpeg",
    "id": 754
  },
  {
    "name": "Cathedral of Serra",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Les créatures légendaires blanches que vous contrôlez ont « regroupement avec d'autres créatures légendaires ». (N'importe quelles créatures légendaires peuvent attaquer en groupe tant qu'au moins l'une d'elles a « regroupement avec d'autres créatures légendaires ». Les groupes sont bloqués comme un tout. Si au moins deux créatures légendaires que vous contrôlez, dont l'une a « regroupement avec d'autres créatures légendaires », bloquent ou sont bloquées par la même créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/cathedral_of_serra.jpeg",
    "id": 755
  },
  {
    "name": "Hammerheim",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Legendary Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {R}. {T} : La créature ciblée perd toutes les capacités de traversée de terrain jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/hammerheim.jpeg",
    "produces": "R",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "removeKeywordFamilyUntilEnd", "family": "landwalk", "target": "creature"}}],
    "id": 756
  },
  {
    "name": "Karakas",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Legendary Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {W}. {T} : Renvoyez la créature légendaire ciblée dans la main de son propriétaire.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/karakas.jpeg",
    "produces": "W",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "bounce", "target": "legendaryCreature"}}],
    "id": 757
  },
  {
    "name": "Mountain Stronghold",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Les créatures légendaires rouges que vous contrôlez ont « regroupement avec d'autres créatures légendaires ». (N'importe quelles créatures légendaires peuvent attaquer en groupe tant qu'au moins l'une d'elles a « regroupement avec d'autres créatures légendaires ». Les groupes sont bloqués comme un tout. Si au moins deux créatures légendaires que vous contrôlez, dont l'une a « regroupement avec d'autres créatures légendaires », bloquent ou sont bloquées par la même créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/mountain_stronghold.jpeg",
    "id": 758
  },
  {
    "name": "Pendelhaven",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Legendary Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {G} à votre réserve.\n{T} : La créature 1/1 ciblée gagne +1/+2 jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/pendelhaven.jpeg",
    "produces": "G",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "pump", "power": 1, "toughness": 2, "target": "oneOneCreature"}}],
    "id": 759
  },
  {
    "name": "Seafarer's Quay",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Les créatures légendaires bleues que vous contrôlez ont « regroupement avec d'autres créatures légendaires ». (N'importe quelles créatures légendaires peuvent attaquer en groupe tant qu'au moins l'une d'elles a « regroupement avec d'autres créatures légendaires ». Les groupes sont bloqués comme un tout. Si au moins deux créatures légendaires que vous contrôlez, dont l'une a « regroupement avec d'autres créatures légendaires », bloquent ou sont bloquées par la même créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/seafarers_quay.jpeg",
    "id": 760
  },
  {
    "name": "The Tabernacle at Pendrell Vale",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Legendary Land",
    "rarity": "Rare",
    "text_fr": "Toutes les créatures ont « Au début de votre entretien, détruisez cette créature à moins que vous ne payiez {1}. »",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/the_tabernacle_at_pendrell_vale.jpeg",
    "id": 761
  },
  {
    "name": "Tolaria",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Legendary Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {U}. {T} : La créature ciblée perd le regroupement et toutes les capacités « regroupement avec » jusqu'à la fin du tour. N'activez cette capacité que pendant n'importe quelle étape d'entretien.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/tolaria.jpeg",
    "produces": "U",
    "activated": [{"cost": "", "tap": true, "onlyDuring": "anyUpkeep", "effect": {"type": "removeKeywordFamilyUntilEnd", "family": "banding", "target": "creature"}}],
    "id": 762
  },
  {
    "name": "Unholy Citadel",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Les créatures légendaires noires que vous contrôlez ont « regroupement avec d'autres créatures légendaires ». (N'importe quelles créatures légendaires peuvent attaquer en groupe tant qu'au moins l'une d'elles a « regroupement avec d'autres créatures légendaires ». Les groupes sont bloqués comme un tout. Si au moins deux créatures légendaires que vous contrôlez, dont l'une a « regroupement avec d'autres créatures légendaires », bloquent ou sont bloquées par la même créature, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/unholy_citadel.jpeg",
    "id": 763
  },
  {
    "name": "Urborg",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Legendary Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {B}. {T} : La créature ciblée perd l'initiative ou la traversée des marais jusqu'à la fin du tour.",
    "sets": [
      "LEG"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/urborg.jpeg",
    "produces": "B",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "removeChosenKeywordUntilEnd", "options": ["firstStrike", "swampwalk"], "target": "creature"}}],
    "id": 764
  },
  {
    "name": "Angry Mob",
    "static": [{"type": "dynamicPT", "powerSource": "basicLandCount", "landType": "Swamp", "controller": "opponent", "base": 2, "ownTurnOnly": true}],
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Piétinement. Pendant votre tour, la force et l'endurance d'Angry Mob sont chacune égales à 2 plus le nombre de marais contrôlés par vos adversaires. Pendant les tours autres que le vôtre, la force et l'endurance d'Angry Mob sont chacune de 2.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human",
    "power": "2+*",
    "toughness": "2+*",
    "img": "img/angry_mob.jpeg",
    "id": 765
  },
  {
    "name": "Blood of the Martyr",
    "cost": "{W}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Jusqu'à la fin du tour, si des blessures devaient être infligées à une créature, vous pouvez faire en sorte que ces blessures vous soient infligées à la place.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/blood_of_the_martyr.jpeg",
    "id": 766
  },
  {
    "name": "Brainwash",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature.\nLa créature enchantée ne peut pas attaquer à moins que son contrôleur ne paie {3}.",
    "sets": [
      "DRK"
    ],
    "effect": {"type": "addKeyword", "target": "creature", "keywords": ["attacktax3"]},
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/brainwash.jpeg",
    "effectStatus": "implemented",
    "id": 767
  },
  {
    "name": "Cleansing",
    "cost": "{W}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Détruisez tous les enchantements. Vous perdez 2 PV pour chaque enchantement détruit.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/cleansing.jpeg",
    "effectStatus": "unimplemented",
    "id": 768
  },
  {
    "name": "Dust to Dust",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Exilez deux artefacts ciblés.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/dust_to_dust.jpeg",
    "effectStatus": "unimplemented",
    "id": 769
  },
  {
    "name": "Exorcist",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{1}{W} : exilez un zombie ciblé.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/exorcist.jpeg",
    "effectStatus": "unimplemented",
    "id": 770
  },
  {
    "name": "Fasting",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, mettez un marqueur de faim sur cet enchantement. Ensuite, détruisez cet enchantement s'il a cinq marqueurs de faim ou plus. Si vous deviez commencer votre étape de pioche, vous pouvez sauter cette étape à la place. Si vous faites ainsi, vous gagnez 2 points de vie. Quand vous piochez une carte, détruisez cet enchantement.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/fasting.jpeg",
    "id": 771
  },
  {
    "name": "Festival",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Engagez X créatures ciblées.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/festival.jpeg",
    "effectStatus": "unimplemented",
    "id": 772
  },
  {
    "name": "Fire and Brimstone",
    "cost": "{3}{W}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "text_fr": "Inflige 4 blessures à une cible. Si c'est un gobelin, inflige 8 blessures.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/fire_and_brimstone.jpeg",
    "effectStatus": "unimplemented",
    "id": 773
  },
  {
    "name": "Holy Light",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Les créatures non blanches gagnent -1/-1 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "all", "filterNotColor": "W", "power": -1, "toughness": -1},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/holy_light.jpeg",
    "effectStatus": "implemented",
    "id": 774
  },
  {
    "name": "Knights of Thorn",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Knight",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "Banding. La protection contre le rouge.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "banding",
      "protectionR"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/knights_of_thorn.jpeg",
    "id": 775
  },
  {
    "name": "Martyr's Cry",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Exilez toutes les créatures blanches. Pour chaque créature exilée ainsi, son contrôleur pioche une carte.",
    "effect": {"type": "destroyAllMatching", "cardType": "Creature", "color": "W", "exile": true, "drawPerExiled": true},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/martyrs_cry.jpeg",
    "effectStatus": "implemented",
    "id": 776
  },
  {
    "name": "Miracle Worker",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "destroy", "target": "permanent", "requireSubtype": "Aura", "requireAttachedToControlled": true}}],
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{T} : Détruisez l'Aura ciblée attachée à une créature que vous contrôlez.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "img": "img/miracle_worker.jpeg",
    "id": 777
  },
  {
    "name": "Morale",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Les créatures attaquantes gagnent +1/+1 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "attacking", "power": 1, "toughness": 1},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/morale.jpeg",
    "id": 778
  },
  {
    "name": "Pikemen",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Initiative ; regroupement. (N'importe quelles créatures avec le regroupement, et jusqu'à une sans, peuvent attaquer en groupe. Les groupes sont bloqués comme un tout. Si une créature avec le regroupement que vous contrôlez bloque une créature ou est bloquée par elle, vous répartissez les blessures de combat de cette créature, et non son contrôleur, entre les créatures qu'elle bloque ou par lesquelles elle est bloquée.)",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "firstStrike",
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 1,
    "img": "img/pikemen.jpeg",
    "id": 779
  },
  {
    "name": "Preacher",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{T} : gagnez le contrôle d'une créature ciblée.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/preacher.jpeg",
    "effectStatus": "unimplemented",
    "id": 780
  },
  {
    "name": "Squire",
    "cost": "{1}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/squire.jpeg",
    "id": 781
  },
  {
    "name": "Tivadar's Crusade",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Détruisez tous les gobelins.",
    "effect": {"type": "destroyAllMatching", "cardType": "Creature", "subtype": "Goblin"},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/tivadars_crusade.jpeg",
    "effectStatus": "implemented",
    "id": 782
  },
  {
    "name": "Witch Hunter",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "damage", "amount": 1, "target": "player"}}, {"cost": "{1}{W}{W}", "tap": true, "effect": {"type": "bounce", "target": "opponentsCreature"}}],
    "cost": "{2}{W}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{T} : Le Chasseur de sorcière inflige 1 blessure au joueur ciblé.\n{1}{W}{W}, {T} : Renvoyez la créature ciblée contrôlée par un adversaire dans la main de son propriétaire.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/witch_hunter.jpeg",
    "effectStatus": "implemented",
    "id": 783
  },
  {
    "name": "Amnesia",
    "cost": "{3}{U}{U}{U}",
    "cmc": 6,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Le joueur ciblé révèle sa main et défausse toutes les cartes non-terrain.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "unimplemented",
    "img": "img/amnesia.jpeg",
    "id": 784
  },
  {
    "name": "Apprentice Wizard",
    "activated": [{"cost": "{U}", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "C", "amount": 3}}],
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{U}, {T} : Ajoutez {C}{C}{C}.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Wizard",
    "power": 0,
    "toughness": 1,
    "img": "img/apprentice_wizard.jpeg",
    "id": 785
  },
  {
    "name": "Dance of Many",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Quand cet enchantement arrive sur le champ de bataille, créez un jeton qui est une copie de la créature non-jeton ciblée. Quand cet enchantement quitte le champ de bataille, exilez le jeton. Quand le jeton quitte le champ de bataille, sacrifiez cet enchantement. Au début de votre entretien, sacrifiez cet enchantement à moins que vous ne payiez {U}{U}.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/dance_of_many.jpeg",
    "id": 786
  },
  {
    "name": "Deep Water",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Les îles que vous contrôlez produisent {U} ou {B}.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/deep_water.jpeg",
    "effectStatus": "unimplemented",
    "id": 787
  },
  {
    "name": "Drowned",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Zombie",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{B} : régénérez.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/drowned.jpeg",
    "id": 788
  },
  {
    "name": "Electric Eel",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Quand cette créature arrive sur le champ de bataille, elle vous inflige 1 blessure. {R}{R} : Cette créature gagne +2/+0 jusqu'à la fin du tour et vous inflige 1 blessure.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Fish",
    "power": 1,
    "toughness": 1,
    "img": "img/electric_eel.jpeg",
    "id": 789
  },
  {
    "name": "Erosion",
    "cost": "{U}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "À l'entretien du contrôleur du terrain enchanté, il perd 1 PV.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/erosion.jpeg",
    "effect": {"type": "enchant", "target": "land"},
    "triggers": [{"event": "upkeepStarted", "condition": {"enchantedControllerUpkeep": true, "sourceSelf": true}, "effect": {"type": "damageEventPlayer", "amount": 1}}],
    "effectStatus": "implemented",
    "id": 790
  },
  {
    "name": "Flood",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{U}{U} : engagez la créature ciblée sans vol.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/flood.jpeg",
    "effectStatus": "unimplemented",
    "id": 791
  },
  {
    "name": "Ghost Ship",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Spirit",
    "power": 2,
    "toughness": 4,
    "rarity": "Common",
    "keywords": [
      "flying",
      "regenerate"
    ],
    "text_fr": "Vol\n{U}{U}{U} : Régénérez le Navire fantôme.",
    "sets": [
      "DRK"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ghost_ship.jpeg",
    "id": 792
  },
  {
    "name": "Giant Shark",
    "cost": "{5}{U}",
    "cmc": 6,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Shark",
    "power": 4,
    "toughness": 4,
    "rarity": "Common",
    "text_fr": "Ne peut pas attaquer à moins que le défenseur ne contrôle une île.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/giant_shark.jpeg",
    "effectStatus": "unimplemented",
    "id": 793
  },
  {
    "name": "Leviathan",
    "cost": "{5}{U}{U}{U}{U}",
    "cmc": 9,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Leviathan",
    "power": 10,
    "toughness": 10,
    "rarity": "Rare",
    "text_fr": "Piétinement\nLe Léviathan arrive en jeu engagé et il ne se dégage pas pendant votre étape de dégagement.\nAu début de votre entretien, vous pouvez sacrifier deux îles. Si vous faites ainsi, dégagez le Léviathan.\nLe Léviathan ne peut pas attaquer à moins que vous ne sacrifiiez deux îles.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/leviathan.jpeg",
    "id": 794
  },
  {
    "name": "Mana Vortex",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Quand Mana Vortex arrive en jeu, sacrifiez un terrain. Au début de votre entretien, sacrifiez un terrain.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/mana_vortex.jpeg",
    "effectStatus": "unimplemented",
    "id": 795
  },
  {
    "name": "Merfolk Assassin",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "destroy", "target": "creature", "requireKeyword": "islandwalk"}}],
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Merfolk Assassin",
    "power": 1,
    "toughness": 2,
    "rarity": "Uncommon",
    "text_fr": "{T} : Détruisez la créature avec la traversée des îles ciblée.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/merfolk_assassin.jpeg",
    "effectStatus": "implemented",
    "id": 796
  },
  {
    "name": "Mind Bomb",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Chaque joueur peut défausser jusqu'à trois cartes. Mind Bomb inflige à chaque joueur des blessures égales à 3 moins le nombre de cartes qu'il a ainsi défaussées.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {
      "type": "mindBombDiscard",
      "maxDiscard": 3
    },
    "effectStatus": "implemented",
    "img": "img/mind_bomb.jpeg",
    "id": 797
  },
  {
    "name": "Psychic Allergy",
    "cost": "{3}{U}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Choisir une couleur. À l'entretien, inflige X blessures au joueur (X = cartes de cette couleur en jeu).",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/psychic_allergy.jpeg",
    "effectStatus": "unimplemented",
    "id": 798
  },
  {
    "name": "Riptide",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Engagez toutes les créatures bleues.",
    "effect": {"type": "tapAllMatching", "cardType": "Creature", "color": "U"},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/riptide.jpeg",
    "effectStatus": "implemented",
    "id": 799
  },
  {
    "name": "Sunken City",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Au début de votre entretien, sacrifiez cet enchantement à moins que vous ne payiez {U}{U}. Les créatures bleues gagnent +1/+1.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/sunken_city.jpeg",
    "id": 800
  },
  {
    "name": "Tangle Kelp",
    "effect": {"type": "addKeyword", "target": "creature", "keyword": "nountapifattackedlastturn"},
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature.\nÀ l'arrivée de Tangle Kelp, engagez la créature enchantée.\nLa créature enchantée ne se dégage pas pendant l'étape de dégagement de son contrôleur si elle a attaqué lors de son tour précédent.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "permanentEntered",
        "condition": {"sourceSelf": true},
        "effect": {"type": "tapEnchanted"}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/tangle_kelp.jpeg",
    "effectStatus": "implemented",
    "id": 801
  },
  {
    "name": "Water Wurm",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Wurm",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{B} : +0/+1 jusqu'à la fin du tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/water_wurm.jpeg",
    "effectStatus": "unimplemented",
    "id": 802
  },
  {
    "name": "Ashes to Ashes",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Exilez deux créatures ciblées. Perdez 5 PV.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/ashes_to_ashes.jpeg",
    "effectStatus": "unimplemented",
    "id": 803
  },
  {
    "name": "Banshee",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Spirit",
    "power": 0,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{X} : inflige X blessures à un joueur et X/2 à vous.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/banshee.jpeg",
    "effectStatus": "unimplemented",
    "id": 804
  },
  {
    "name": "Bog Imp",
    "cost": "{1}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Imp",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "keywords": [
      "flying"
    ],
    "text_fr": "Vol",
    "sets": [
      "DRK"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/bog_imp.jpeg",
    "id": 805
  },
  {
    "name": "Bog Rats",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Rat",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Ne peut pas être bloqué par des Murs.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "static": [{"type": "cantBeBlockedBySubtype", "subtype": "Wall"}],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/bog_rats.jpeg",
    "id": 806
  },
  {
    "name": "Curse Artifact",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/curse_artifact.jpeg",
    "text_fr": "Enchanter : artefact. Au début de l'entretien du contrôleur de l'artefact enchanté, Curse Artifact inflige 2 blessures à ce joueur, sauf s'il sacrifie cet artefact.",
    "effect": {"type": "enchant", "target": "artifact"},
    "triggers": [{"event": "upkeepStarted", "condition": {"enchantedControllerUpkeep": true, "sourceSelf": true}, "effect": {"type": "damageUnlessSacrificeEnchanted", "amount": 2}}],
    "effectStatus": "implemented",
    "id": 807
  },
  {
    "name": "Eater of the Dead",
    "cost": "{4}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{0} : Si cette créature est engagée, exilez la carte de créature ciblée d'un cimetière et dégagez cette créature.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Horror",
    "power": 3,
    "toughness": 4,
    "img": "img/eater_of_the_dead.jpeg",
    "id": 808
  },
  {
    "name": "Frankenstein's Monster",
    "cost": "{X}{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Au moment où cette créature arrive sur le champ de bataille, exilez X cartes de créature de votre cimetière. Si vous ne le pouvez pas, mettez cette créature dans le cimetière de son propriétaire au lieu du champ de bataille. Pour chaque carte de créature exilée ainsi, cette créature arrive avec un marqueur +2/+0, +1/+1 ou +0/+2 sur elle.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Zombie",
    "power": 0,
    "toughness": 1,
    "img": "img/frankensteins_monster.jpeg",
    "id": 809
  },
  {
    "name": "Grave Robbers",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Rogue",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{B}{B} : exilez une carte d'un cimetière. Gagnez 2 PV.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/grave_robbers.jpeg",
    "effectStatus": "unimplemented",
    "id": 810
  },
  {
    "name": "Inquisition",
    "effect": {"type": "damagePerColorInHand", "color": "W", "target": "player"},
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "Le joueur ciblé révèle sa main. Inquisition inflige à ce joueur autant de blessures que de cartes blanches dans sa main.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/inquisition.jpeg",
    "id": 811
  },
  {
    "name": "Marsh Gas",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Toutes les créatures gagnent -2/-0 jusqu'à la fin du tour.",
    "effect": {"type": "massPump", "scope": "all", "power": -2, "toughness": 0},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/marsh_gas.jpeg",
    "id": 812
  },
  {
    "name": "Murk Dwellers",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "À chaque fois que cette créature attaque et n'est pas bloquée, elle gagne +2/+0 jusqu'à la fin du combat.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Zombie",
    "power": 2,
    "toughness": 2,
    "img": "img/murk_dwellers.jpeg",
    "id": 813
  },
  {
    "name": "Nameless Race",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Piétinement. Au moment où cette créature arrive sur le champ de bataille, payez n'importe quel montant de points de vie. Le montant payé ne peut pas être supérieur au nombre total de permanents blancs non-jetons contrôlés par vos adversaires plus le nombre total de cartes blanches dans leurs cimetières. La force et l'endurance de Nameless Race sont chacune égales aux points de vie payés à son arrivée.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "",
    "power": "*",
    "toughness": "*",
    "img": "img/nameless_race.jpeg",
    "id": 814
  },
  {
    "name": "Rag Man",
    "cost": "{2}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human Minion",
    "power": 2,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{B}{B}{B}, {T}: L'adversaire ciblé révèle sa main et se défausse, au hasard, d'une carte de créature. Ne jouez cette capacité que pendant votre tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/rag_man.jpeg",
    "effectStatus": "unimplemented",
    "id": 815
  },
  {
    "name": "Season of the Witch",
    "cost": "{B}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, sacrifiez cet enchantement à moins que vous ne payiez 2 points de vie. Au début de l'étape de fin de tour, détruisez toutes les créatures non-engagées qui n'ont pas attaqué ce tour-ci, sauf les créatures qui ne pouvaient pas attaquer.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/season_of_the_witch.jpeg",
    "id": 816
  },
  {
    "name": "The Fallen",
    "cost": "{1}{B}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, cette créature inflige 1 blessure à chaque adversaire et planeswalker auquel elle a infligé des blessures au cours de cette partie.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Zombie",
    "power": 2,
    "toughness": 3,
    "img": "img/the_fallen.jpeg",
    "id": 817
  },
  {
    "name": "Uncle Istvan",
    "cost": "{1}{B}{B}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": 3,
    "rarity": "Uncommon",
    "text_fr": "Prévenez toutes les blessures qui devraient être infligées à l'Oncle Istvân par des créatures.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/uncle_istvan.jpeg",
    "effectStatus": "unimplemented",
    "id": 818
  },
  {
    "name": "Word of Binding",
    "cost": "{X}{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "xSpell": true,
    "text_fr": "Engagez X créatures ciblées.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effect": {
      "type": "tapTarget",
      "target": "creature",
      "tap": true
    },
    "effectStatus": "implemented",
    "img": "img/word_of_binding.jpeg",
    "id": 819
  },
  {
    "name": "Worms of the Earth",
    "static": [{"type": "cantPlayLands"}],
    "cost": "{2}{B}{B}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les joueurs ne peuvent pas jouer de terrains.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/worms_of_the_earth.jpeg",
    "effectStatus": "implemented",
    "id": 820
  },
  {
    "name": "Ball Lightning",
    "cost": "{R}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Elemental",
    "power": 6,
    "toughness": 1,
    "rarity": "Rare",
    "keywords": [
      "haste",
      "trample"
    ],
    "text_fr": "Piétinement (Si cette créature inflige suffisamment de blessures de combat à ses bloqueurs pour les détruire, vous pouvez faire qu'elle inflige le reste de ses blessures au joueur ou au planeswalker défenseur.)Célérité\n (Cette créature peut attaquer et {T} dès le tour où elle arrive sous votre contrôle.)\nAu début de l'étape de fin, sacrifiez la Boule fulgurante.",
    "sets": [
      "DRK"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ball_lightning.jpeg",
    "id": 821
  },
  {
    "name": "Blood Moon",
    "static": [{"type": "changeType", "subtype": "Mountain", "filterType": "Land", "nonBasic": true, "controllerFilter": "all"}],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Tous les terrains non-base sont des montagnes.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/blood_moon.jpeg",
    "effectStatus": "implemented",
    "id": 822
  },
  {
    "name": "Brothers of Fire",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{1}{R}{R} : Cette créature inflige 1 blessure à n'importe quelle cible et 1 blessure à vous.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Shaman",
    "power": 2,
    "toughness": 2,
    "img": "img/brothers_of_fire.jpeg",
    "id": 823
  },
  {
    "name": "Cave People",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": 4,
    "rarity": "Uncommon",
    "text_fr": "{1}{R}{R} : les créatures que vous contrôlez gagnent +1/-0.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/cave_people.jpeg",
    "effectStatus": "unimplemented",
    "id": 824
  },
  {
    "name": "Eternal Flame",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Eternal Flame inflige à l'adversaire ou au planeswalker ciblé X blessures et vous inflige la moitié de X blessures, arrondie au supérieur, X étant le nombre de montagnes que vous contrôlez.",
    "effect": {"type": "damageByCount", "target": "opponent", "count": "mountain", "whose": "caster", "selfDamageHalfRoundUp": true},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "effectStatus": "implemented",
    "img": "img/eternal_flame.jpeg",
    "id": 825
  },
  {
    "name": "Fire Drake",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "activated": [
      {
        "cost": "{R}",
        "tap": false,
        "maxPerTurn": 1,
        "effect": {
          "type": "pumpSelf",
          "power": 1,
          "toughness": 0
        }
      }
    ],
    "text_fr": "Vol. {R} : Cette créature gagne +1/+0 jusqu'à la fin du tour. N'activez cette capacité qu'une fois par tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "flying"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Drake",
    "power": 1,
    "toughness": 2,
    "img": "img/fire_drake.jpeg",
    "id": 826
  },
  {
    "name": "Fissure",
    "cost": "{3}{R}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Détruisez une créature ou un terrain ciblé. Il ne peut pas être régénéré.",
    "effectStatus": "implemented",
    "effect": {
      "type": "destroy",
      "target": "creatureOrLand",
      "noRegen": true
    },
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/fissure.jpeg",
    "id": 827
  },
  {
    "name": "Goblin Caves",
    "effect": {"type": "enchant", "target": "land"},
    "static": {"type": "anthem", "filterSubtype": "Goblin", "onlyCreatures": true, "power": 0, "toughness": 2, "enchantedIsBasic": "Mountain"},
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : terrain.\nTant que le terrain enchanté est une Montagne de base, les créatures Gobelin gagnent +0/+2.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/goblin_caves.jpeg",
    "effectStatus": "implemented",
    "id": 828
  },
  {
    "name": "Goblin Digging Team",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": "self"}, "tap": true, "effect": {"type": "destroy", "target": "creature", "requireSubtype": "Wall"}}],
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{T}, sacrifiez l'Équipe de minage gobeline : Détruisez le mur ciblé.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_digging_team.jpeg",
    "effectStatus": "implemented",
    "id": 829
  },
  {
    "name": "Goblin Hero",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "La bande.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_hero.jpeg",
    "effectStatus": "unimplemented",
    "id": 830
  },
  {
    "name": "Goblin Rock Sled",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 3,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Ne peut pas attaquer à moins que le défenseur ne contrôle une montagne.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_rock_sled.jpeg",
    "id": 831
  },
  {
    "name": "Goblin Shrine",
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : terrain.\nTant que le terrain enchanté est une Montagne de base, les créatures Gobelin gagnent +1/+0.\nQuand Goblin Shrine quitte le champ de bataille, elle inflige 1 blessure à chaque créature Gobelin.",
    "effect": {
      "type": "enchant",
      "target": "land"
    },
    "static": {
      "type": "anthem",
      "filterSubtype": "Goblin",
      "onlyCreatures": true,
      "power": 1,
      "toughness": 0,
      "enchantedIsBasic": "Mountain"
    },
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "permanentLeft",
        "condition": {
          "sourceSelf": true
        },
        "effect": {
          "type": "damageEachMatching",
          "amount": 1,
          "subtype": "Goblin"
        }
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/goblin_shrine.jpeg",
    "id": 832
  },
  {
    "name": "Goblin Wizard",
    "cost": "{2}{R}{R}",
    "cmc": 4,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin Wizard",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{R} : un gobelin ciblé gagne la montagne-marche.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_wizard.jpeg",
    "effectStatus": "unimplemented",
    "id": 833
  },
  {
    "name": "Goblins of the Flarg",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin Warrior",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "La montagne-marche. Si vous contrôlez un nain, sacrifiez Goblins of the Flarg.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "landwalk",
      "mountainwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblins_of_the_flarg.jpeg",
    "id": 834
  },
  {
    "name": "Inferno",
    "cost": "{5}{R}{R}",
    "cmc": 7,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Rare",
    "text_fr": "La Fournaise inflige 6 blessures à chaque créature et à chaque joueur.",
    "effect": {"type": "damageAllCreaturesAndPlayers", "amount": 6},
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/inferno.jpeg",
    "effectStatus": "implemented",
    "id": 835
  },
  {
    "name": "Mana Clash",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Vous et l'adversaire ciblé lancez chacun une pièce en l'air. Le Choc de mana inflige 1 blessure à chaque joueur dont la pièce retombe sur pile. Répétez la procédure jusqu'à ce que les deux pièces tombent sur face en même temps.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/mana_clash.jpeg",
    "effectStatus": "unimplemented",
    "id": 836
  },
  {
    "name": "Orc General",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": {"type": ["Orc", "Goblin"], "other": true}}, "tap": true, "effect": {"type": "massPump", "power": 1, "toughness": 1, "filterSubtype": "Orc", "excludeSource": true}}],
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T}, Sacrifiez un autre Orc ou Gobelin : Les autres créatures Orc gagnent +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Orc Warrior",
    "power": 2,
    "toughness": 2,
    "img": "img/orc_general.jpeg",
    "id": 837
  },
  {
    "name": "Sisters of the Flame",
    "tapAbility": {"produces": "R"},
    "cost": "{1}{R}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {R}.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human Shaman",
    "power": 2,
    "toughness": 2,
    "img": "img/sisters_of_the_flame.jpeg",
    "id": 838
  },
  {
    "name": "Carnivorous Plant",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Plant Wall",
    "power": 4,
    "toughness": 5,
    "rarity": "Common",
    "text_fr": "Défenseur.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/carnivorous_plant.jpeg",
    "id": 839
  },
  {
    "name": "Elves of Deep Shadow",
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "B", "amount": 1, "selfDamage": 1}}],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez {B} à votre réserve. Les Elfes de l'ombre profonde vous infligent 1 blessure.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Elf Druid",
    "power": 1,
    "toughness": 1,
    "img": "img/elves_of_deep_shadow.jpeg",
    "id": 840
  },
  {
    "name": "Gaea's Touch",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "{0} : Vous pouvez mettre une carte de forêt de base de votre main sur le champ de bataille. N'activez cette capacité qu'à la vitesse d'un rituel et seulement une fois par tour. Sacrifiez cet enchantement : Ajoutez {G}{G}.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/gaeas_touch.jpeg",
    "id": 841
  },
  {
    "name": "Hidden Path",
    "cost": "{2}{G}{G}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures vertes ont la forêt-marche.",
    "effectStatus": "implemented",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "static": [
      {
        "type": "grantKeyword",
        "filterColor": "G",
        "keyword": "forestwalk",
        "controllerFilter": "any"
      }
    ],
    "img": "img/hidden_path.jpeg",
    "id": 842
  },
  {
    "name": "Land Leeches",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Leech",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Initiative.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/land_leeches.jpeg",
    "id": 843
  },
  {
    "name": "Lurker",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Cette créature ne peut pas être la cible de sorts à moins qu'elle n'ait attaqué ou bloqué ce tour-ci.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Beast",
    "power": 2,
    "toughness": 3,
    "img": "img/lurker.jpeg",
    "id": 844
  },
  {
    "name": "Marsh Viper",
    "cost": "{3}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "À chaque fois que cette créature inflige des blessures à un joueur, ce joueur reçoit deux marqueurs de poison. (Un joueur avec dix marqueurs de poison ou plus perd la partie.)",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Snake",
    "power": 1,
    "toughness": 2,
    "img": "img/marsh_viper.jpeg",
    "id": 845
  },
  {
    "name": "Niall Silvain",
    "cost": "{G}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{G}{G}{G}{G}, {T} : Régénérez la créature ciblée.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Ouphe",
    "power": 2,
    "toughness": 2,
    "img": "img/niall_silvain.jpeg",
    "id": 846
  },
  {
    "name": "People of the Woods",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 1,
    "toughness": "*",
    "rarity": "Uncommon",
    "text_fr": "Endurance égale au nombre de forêts que vous contrôlez.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/people_of_the_woods.jpeg",
    "effectStatus": "unimplemented",
    "id": 847
  },
  {
    "name": "Savaen Elves",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elf",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{G}{G} : détruisez un enchantement ciblé sur un terrain.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/savaen_elves.jpeg",
    "effectStatus": "unimplemented",
    "id": 848
  },
  {
    "name": "Scarwood Bandits",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human Rogue",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "{T} : gagnez le contrôle d'un artefact ciblé.",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "landwalk",
      "forestwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/scarwood_bandits.jpeg",
    "id": 849
  },
  {
    "name": "Scarwood Hag",
    "activated": [{"cost": "{G}{G}{G}{G}", "tap": true, "effect": {"type": "addKeywordUntilEnd", "keyword": "forestwalk", "target": "creature"}}, {"cost": "", "tap": true, "effect": {"type": "removeKeywordUntilEnd", "keyword": "forestwalk", "target": "creature"}}],
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Hag",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{G}{G}{G}{G}, {T} : la créature ciblée gagne la forêt-marche jusqu'à la fin du tour. {T} : la créature ciblée perd la forêt-marche jusqu'à la fin du tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/scarwood_hag.jpeg",
    "effectStatus": "implemented",
    "id": 850
  },
  {
    "name": "Scavenger Folk",
    "activated": [{"cost": {"mana": "{G}", "tap": true, "sacrifice": "self"}, "tap": true, "effect": {"type": "destroy", "target": "artifact"}}],
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "{G}, {T}, sacrifiez ces Maraudeurs : Détruisez l'artefact ciblé.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Human",
    "power": 1,
    "toughness": 1,
    "img": "img/scavenger_folk.jpeg",
    "id": 851
  },
  {
    "name": "Spitting Slug",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Slug",
    "power": 2,
    "toughness": 4,
    "rarity": "Uncommon",
    "text_fr": "À chaque fois que la Limace cracheuse bloque ou devient bloquée, vous pouvez payer {1}{G}. Si vous faites ainsi, la Limace cracheuse acquiert l'initiative jusqu'à la fin du tour. Sinon, chaque créature qui bloque ou qui est bloquée par la Limace cracheuse acquiert l'initiative jusqu'à la fin du tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/spitting_slug.jpeg",
    "effectStatus": "unimplemented",
    "id": 852
  },
  {
    "name": "Tracker",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "{G}{G}, {T} : Tracker inflige à la créature ciblée un nombre de blessures égal à sa force. Cette créature inflige à Tracker un nombre de blessures égal à sa force.",
    "sets": [
      "DRK"
    ],
    "activated": [{ "cost": "{G}{G}", "tap": true, "effect": { "type": "mutualPowerDamage", "target": "creature" } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/tracker.jpeg",
    "id": 853
  },
  {
    "name": "Venom",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Enchanter : créature. À chaque fois que la créature enchantée bloque ou est bloquée par une créature non-Mur, détruisez l'autre créature à la fin du combat.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
        "effect": {
      "type": "enchant",
      "target": "creature"
    },
    "triggers": [
      {
        "event": "creatureBlocked",
        "condition": {"enchantedInBlock": true, "otherNotSubtype": "Wall"},
        "effect": {"type": "destroyOtherAtEndOfCombat"}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Aura",
    "img": "img/venom.jpeg",
    "id": 854
  },
  {
    "name": "Whippoorwill",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{G}{G}, {T} : La créature ciblée ne peut pas être régénérée ce tour-ci. Les blessures qui devraient être infligées à cette créature ce tour-ci ne peuvent pas être prévenues ni infligées à un autre permanent ou joueur à la place. Quand la créature meurt ce tour-ci, exilez-la.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Bird",
    "power": 1,
    "toughness": 1,
    "img": "img/whippoorwill.jpeg",
    "id": 855
  },
  {
    "name": "Wormwood Treefolk",
    "cost": "{3}{G}{G}",
    "cmc": 5,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{G}{G} : Cette créature gagne la traversée des forêts jusqu'à la fin du tour et vous inflige 2 blessures. (Elle ne peut pas être bloquée tant que le joueur défenseur contrôle une forêt.) {B}{B} : Cette créature gagne la traversée des marais jusqu'à la fin du tour et vous inflige 2 blessures. (Elle ne peut pas être bloquée tant que le joueur défenseur contrôle un marais.)",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Treefolk",
    "power": 4,
    "toughness": 4,
    "img": "img/wormwood_treefolk.jpeg",
    "id": 856
  },
  {
    "name": "Marsh Goblins",
    "cost": "{B}{R}",
    "cmc": 2,
    "color": [
      "B",
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Traversée des marais. (Cette créature ne peut pas être bloquée tant que le joueur défenseur contrôle un marais.)",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "landwalk",
      "swampwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Goblin",
    "power": 1,
    "toughness": 1,
    "img": "img/marsh_goblins.jpeg",
    "id": 857
  },
  {
    "name": "Scarwood Goblins",
    "cost": "{R}{G}",
    "cmc": 2,
    "color": [
      "R",
      "G"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/scarwood_goblins.jpeg",
    "id": 858
  },
  {
    "name": "Dark Heart of the Wood",
    "cost": "{B}{G}",
    "cmc": 2,
    "color": [
      "B",
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Sacrifiez une forêt : Vous gagnez 3 points de vie.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/dark_heart_of_the_wood.jpeg",
    "id": 859
  },
  {
    "name": "Barl's Cage",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3} : la créature ciblée ne peut pas attaquer ni bloquer ce tour-ci.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/barls_cage.jpeg",
    "effectStatus": "unimplemented",
    "id": 860
  },
  {
    "name": "Bone Flute",
    "activated": [{"cost": "{2}", "tap": true, "effect": {"type": "massPump", "power": -1, "toughness": 0}}],
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Toutes les créatures gagnent -1/-0 jusqu'à la fin du tour.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/bone_flute.jpeg",
    "id": 861
  },
  {
    "name": "Book of Rass",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2} : piochez une carte. Perdez 2 PV.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Book",
    "img": "img/book_of_rass.jpeg",
    "effectStatus": "unimplemented",
    "id": 862
  },
  {
    "name": "Coal Golem",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Golem",
    "power": 3,
    "toughness": 3,
    "rarity": "Uncommon",
    "text_fr": "{3} : sacrifiez Coal Golem. Ajoutez {R}{R}{R}.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "activated": [{"cost": "{3}", "tap": false, "effect": {"type": "sacrificeSelfAddMana", "color": "R", "amount": 3}}],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/coal_golem.jpeg",
    "effectStatus": "implemented",
    "id": 863
  },
  {
    "name": "Dark Sphere",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2} : annulez la moitié des blessures d'une source ciblée (arrondi au supérieur).",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/dark_sphere.jpeg",
    "effectStatus": "unimplemented",
    "id": 864
  },
  {
    "name": "Diabolic Machine",
    "cost": "{7}",
    "cmc": 7,
    "color": [],
    "type": "Artifact Creature",
    "rarity": "Uncommon",
    "text_fr": "{3} : Régénérez cette créature.",
    "activated": [
      {
        "cost": "{3}",
        "tap": false,
        "effect": {
          "type": "regenerateShield"
        }
      }
    ],
    "sets": [
      "DRK"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "power": 4,
    "toughness": 4,
    "subtype": "Construct",
    "img": "img/diabolic_machine.jpeg",
    "id": 865
  },
  {
    "name": "Fellwar Stone",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T} : Ajoutez à votre réserve un mana de n'importe quelle couleur qu'un terrain contrôlé par un adversaire pourrait produire.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/fellwar_stone.jpeg",
    "effectStatus": "implemented",
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "opponentLands", "amount": 1}}],
    "id": 866
  },
  {
    "name": "Fountain of Youth",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2}, {T} : Vous gagnez 1 point de vie.",
    "sets": [
      "DRK"
    ],
    "activated": [{ "cost": "{2}", "tap": true, "effect": { "type": "gainLife", "amount": 1, "target": "self" } }],
    "effectStatus": "implemented",
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/fountain_of_youth.jpeg",
    "id": 867
  },
  {
    "name": "Living Armor",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{3} : la créature ciblée gagne +0/+X (X = CMC d'une carte de votre cimetière).",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/living_armor.jpeg",
    "effectStatus": "unimplemented",
    "id": 868
  },
  {
    "name": "Necropolis",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "Défenseur. Force égale au nombre de créatures dans votre cimetière.",
    "effectStatus": "implemented",
    "sets": [
      "DRK"
    ],
    "keywords": [
      "defender"
    ],
    "static": [{"type": "dynamicPT", "powerSource": "graveyardCreatureCount", "onlyPower": true}],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/necropolis.jpeg",
    "id": 869
  },
  {
    "name": "Reflecting Mirror",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{X}, {T} : Changez la cible du sort ciblé n'ayant qu'une seule cible si cette cible est vous. La nouvelle cible doit être un joueur. X est le double de la valeur de mana de ce sort.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/reflecting_mirror.jpeg",
    "id": 870
  },
  {
    "name": "Runesword",
    "cost": "{6}",
    "cmc": 6,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{3}, {T} : La créature attaquante ciblée gagne +2/+0 jusqu'à la fin du tour. Quand cette créature quitte le champ de bataille ce tour-ci, sacrifiez cet artefact. Si la créature inflige des blessures à une créature ce tour-ci, la créature ayant subi ces blessures ne peut pas être régénérée ce tour-ci. Si une créature ayant subi des blessures de la créature ciblée devait mourir ce tour-ci, exilez-la à la place.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/runesword.jpeg",
    "id": 871
  },
  {
    "name": "Scarecrow",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact Creature",
    "rarity": "Uncommon",
    "text_fr": "{6}, {T} : Prévenez toutes les blessures qui devraient vous être infligées ce tour-ci par des créatures avec le vol.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "power": 2,
    "toughness": 2,
    "subtype": "Scarecrow",
    "img": "img/scarecrow.jpeg",
    "id": 872
  },
  {
    "name": "Skull of Orm",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{5}, {T} : Renvoyez la carte d'enchantement ciblée depuis votre cimetière dans votre main.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/skull_of_orm.jpeg",
    "id": 873
  },
  {
    "name": "Standing Stones",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{1} : ajoutez un mana d'une couleur de votre choix.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/standing_stones.jpeg",
    "effectStatus": "unimplemented",
    "id": 874
  },
  {
    "name": "Stone Calendar",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Les sorts que vous jouez coûtent {1} de moins.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/stone_calendar.jpeg",
    "effectStatus": "unimplemented",
    "id": 875
  },
  {
    "name": "Tormod's Crypt",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": "self"}, "tap": true, "effect": {"type": "exileGraveyard", "target": "player"}}],
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{T}, sacrifiez la Crypte de Tormod : Retirez de la partie le cimetière du joueur ciblé.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tormods_crypt.jpeg",
    "effectStatus": "implemented",
    "id": 876
  },
  {
    "name": "Tower of Coireall",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{3} : la créature ciblée ne peut pas être bloquée par des murailles ce tour-ci.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tower_of_coireall.jpeg",
    "effectStatus": "unimplemented",
    "id": 877
  },
  {
    "name": "Wand of Ith",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{2} : regardez une carte au hasard de la main adverse. Vous pouvez la défausser.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/wand_of_ith.jpeg",
    "effectStatus": "unimplemented",
    "id": 878
  },
  {
    "name": "War Barge",
    "cost": "{4}",
    "cmc": 4,
    "color": [],
    "type": "Artifact",
    "rarity": "Uncommon",
    "text_fr": "{3} : La créature ciblée acquiert la traversée des îles jusqu'à la fin du tour. Quand la Barge de guerre quitte le jeu ce tour-ci, détruisez cette créature. Une créature détruite de cette manière ne peut pas être régénérée.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/war_barge.jpeg",
    "effectStatus": "unimplemented",
    "id": 879
  },
  {
    "name": "City of Shadows",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T}, exilez une créature que vous contrôlez : mettez un marqueur de stockage sur City of Shadows.\n{T} : ajoutez {C} pour chaque marqueur de stockage sur City of Shadows.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "activated": [
      {"cost": {"mana": "", "tap": true, "exile": {"type": "Creature", "choose": true}}, "tap": true, "effect": {"type": "addCounter", "counter": "storage", "amount": 1}},
      {"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "C", "amount": 0, "perCounter": {"counter": "storage", "amount": 1}}}
    ],
    "img": "img/city_of_shadows.jpeg",
    "id": 880
  },
  {
    "name": "Maze of Ith",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "{T} : Dégagez la créature attaquante ciblée. Prévenez, ce tour-ci, toutes les blessures de combat qui devraient être infligées à et par cette créature.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "activated": [
      {
        "cost": "",
        "tap": true,
        "effect": {"type": "mazeOfIth", "target": "attackingCreature"}
      }
    ],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/maze_of_ith.jpeg",
    "id": 881
  },
  {
    "name": "Safe Haven",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{2}, {T} : Retirez de la partie une créature ciblée que vous contrôlez.\nAu début de votre entretien, vous pouvez sacrifier le Havre de paix. Si vous faites ainsi, renvoyez en jeu chaque carte retirée de la partie par le Havre de paix sous le contrôle de son propriétaire.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/safe_haven.jpeg",
    "id": 882
  },
  {
    "name": "Sorrow's Path",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T} : échangez deux créatures bloqueuses. Inflige 2 blessures à vous.",
    "sets": [
      "DRK"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/sorrows_path.jpeg",
    "id": 883
  },
  {
    "name": "Combat Medic",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Cleric Soldier",
    "power": 0,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "{1}{W} : prévenez les prochaines 1 blessures d'une cible.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "activated": [
      {
        "cost": "{1}{W}",
        "tap": false,
        "effect": {"type": "preventDamage", "amount": 1, "target": "anyTarget"}
      }
    ],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/combat_medic.jpeg",
    "effectStatus": "implemented",
    "id": 884
  },
  {
    "name": "Farrel's Mantle",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Enchanter : créature.\nÀ chaque fois que la créature enchantée attaque et n'est pas bloquée, son contrôleur peut lui faire infliger à une autre créature ciblée un nombre de blessures égal à sa force plus 2. Si ce joueur le fait, la créature enchantée n'assigne aucune blessure de combat ce tour-ci.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
        "effect": {
      "type": "enchant",
      "target": "creature"
    },
    "triggers": [
      {
        "event": "attackerUnblocked",
        "condition": {"enchantedUnblocked": true},
        "effect": {"type": "farrelStrike", "bonus": 2}
      }
    ],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/farrels_mantle.jpeg",
    "effectStatus": "implemented",
    "id": 885
  },
  {
    "name": "Farrel's Zealot",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Si Farrel's Zealot est bloqué, inflige 3 blessures au bloqueur après la résolution du combat.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/farrels_zealot.jpeg",
    "effectStatus": "unimplemented",
    "id": 886
  },
  {
    "name": "Farrelite Priest",
    "cost": "{1}{W}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{1} : Ajoutez {W}. Si cette capacité a été activée quatre fois ou plus ce tour-ci, sacrifiez cette créature au début de la prochaine étape de fin de tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 3,
    "img": "img/farrelite_priest.jpeg",
    "id": 887
  },
  {
    "name": "Hand of Justice",
    "cost": "{5}{W}",
    "cmc": 6,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Avatar",
    "power": 2,
    "toughness": 6,
    "rarity": "Rare",
    "text_fr": "{T} : sacrifiez trois Thrulls. Détruisez une créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/hand_of_justice.jpeg",
    "effectStatus": "unimplemented",
    "id": 888
  },
  {
    "name": "Heroism",
    "cost": "{2}{W}",
    "cmc": 3,
    "color": [
      "W"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez une créature blanche : détruisez une créature ciblée qui blesse un joueur.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/heroism.jpeg",
    "effectStatus": "unimplemented",
    "id": 889
  },
  {
    "name": "Icatian Infantry",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{1} : la bande.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_infantry.jpeg",
    "effectStatus": "unimplemented",
    "id": 890
  },
  {
    "name": "Icatian Javelineers",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Les Javeliniers icatians arrive en jeu avec, sur eux, un marqueur « javelot ».\n{T}, retirez un marqueur « javelot » des Javeliniers icatians : Les Javeliniers icatians infligent 1 blessure à une cible, créature ou joueur.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_javelineers.jpeg",
    "effectStatus": "unimplemented",
    "id": 891
  },
  {
    "name": "Icatian Lieutenant",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "{1} : un soldat ciblé gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_lieutenant.jpeg",
    "effectStatus": "unimplemented",
    "id": 892
  },
  {
    "name": "Icatian Moneychanger",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human",
    "power": 0,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Arrive avec trois marqueurs de crédit. À l'entretien, retirez un marqueur. Quand le dernier est retiré, gagnez 3 PV.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_moneychanger.jpeg",
    "effectStatus": "unimplemented",
    "id": 893
  },
  {
    "name": "Icatian Phalanx",
    "cost": "{4}{W}",
    "cmc": 5,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 2,
    "toughness": 4,
    "rarity": "Uncommon",
    "text_fr": "La bande.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_phalanx.jpeg",
    "id": 894
  },
  {
    "name": "Icatian Priest",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Cleric",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{1}{W}{W} : La créature ciblée gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_priest.jpeg",
    "effectStatus": "unimplemented",
    "id": 895
  },
  {
    "name": "Icatian Scout",
    "cost": "{W}",
    "cmc": 1,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier Scout",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{1} : une créature ciblée gagne la bande jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_scout.jpeg",
    "effectStatus": "unimplemented",
    "id": 896
  },
  {
    "name": "Icatian Skirmishers",
    "cost": "{3}{W}",
    "cmc": 4,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Soldier",
    "power": 1,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "Initiative. Quand Icatian Skirmishers attaque, les créatures attaquantes gagnent la bande.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "firstStrike",
      "banding"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/icatian_skirmishers.jpeg",
    "id": 897
  },
  {
    "name": "Icatian Town",
    "cost": "{5}{W}",
    "cmc": 6,
    "color": [
      "W"
    ],
    "type": "Sorcery",
    "rarity": "Rare",
    "text_fr": "Mettez en jeu quatre jetons Soldat 1/1.",
    "effect": {"type": "createToken", "amount": 4, "name": "Soldier", "subtype": "Soldier", "color": "W", "power": 1, "toughness": 1},
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/icatian_town.jpeg",
    "effectStatus": "implemented",
    "id": 898
  },
  {
    "name": "Order of Leitbur",
    "cost": "{W}{W}",
    "cmc": 2,
    "color": [
      "W"
    ],
    "type": "Creature",
    "subtype": "Human Cleric Knight",
    "power": 2,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Protection contre le noir.\n{W} : L’Ordre de Leitbur acquiert l’initiative jusqu’à la fin du tour.\n{W}{W} : L’Ordre de Leitbur gagne +1/+0 jusqu’à la fin du tour.",
    "activated": [{ "cost": "{W}", "tap": false, "effect": { "type": "addKeywordUntilEnd", "keyword": "first strike" } }, { "cost": "{W}{W}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 0 } }],
    "effectStatus": "implemented",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "protection"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/order_of_leitbur.jpeg",
    "id": 899
  },
  {
    "name": "Deep Spawn",
    "cost": "{5}{U}{U}{U}",
    "cmc": 8,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "Piétinement. Au début de votre entretien, sacrifiez cette créature à moins que vous ne meuliez deux cartes. {U} : Cette créature gagne le linceul jusqu'à la fin du tour et ne se dégage pas pendant votre prochaine étape de dégagement. Engagez cette créature. (Une créature avec le linceul ne peut pas être la cible de sorts ou de capacités.)",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "trample",
      "mill"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Homarid",
    "power": 6,
    "toughness": 6,
    "img": "img/deep_spawn.jpeg",
    "id": 900
  },
  {
    "name": "High Tide",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Jusqu'à la fin du tour, à chaque fois qu'un joueur engage une île pour du mana, ce joueur ajoute {U} supplémentaire.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/high_tide.jpeg",
    "effectStatus": "unimplemented",
    "id": 901
  },
  {
    "name": "Homarid",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Homarid",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Gagne +1/+1 pendant votre tour, -1/-1 pendant le tour adverse.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/homarid.jpeg",
    "effectStatus": "unimplemented",
    "id": 902
  },
  {
    "name": "Homarid Shaman",
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Homarid Shaman",
    "power": 2,
    "toughness": 1,
    "rarity": "Rare",
    "text_fr": "{U} : engagez la créature verte ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/homarid_shaman.jpeg",
    "effectStatus": "unimplemented",
    "id": 903
  },
  {
    "name": "Homarid Spawning Bed",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{1}{U}{U}, Sacrifiez une créature bleue : Créez X jetons de créature 1/1 bleus Camarid, X étant la valeur de mana de la créature sacrifiée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/homarid_spawning_bed.jpeg",
    "id": 904
  },
  {
    "name": "Homarid Warrior",
    "cost": "{4}{U}",
    "cmc": 5,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Homarid Warrior",
    "power": 3,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "{U} : +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/homarid_warrior.jpeg",
    "effectStatus": "unimplemented",
    "id": 905
  },
  {
    "name": "Merseine",
    "effect": {"type": "grantKeyword", "keyword": "cantAttack", "target": "creature"},
    "cost": "{2}{U}{U}",
    "cmc": 4,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "La créature enchantée ne peut pas attaquer.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/merseine.jpeg",
    "effectStatus": "implemented",
    "id": 906
  },
  {
    "name": "River Merfolk",
    "cost": "{U}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{U} : River Merfolk gagne la traversée des montagnes jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Merfolk",
    "power": 2,
    "toughness": 1,
    "img": "img/river_merfolk.jpeg",
    "id": 907
  },
  {
    "name": "Seasinger",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Merfolk",
    "power": 0,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "Vous pouvez choisir de ne pas détourner Seasinger pendant votre étape de détournement. {T} : gagnez le contrôle d'une créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/seasinger.jpeg",
    "effectStatus": "unimplemented",
    "id": 908
  },
  {
    "name": "Svyelunite Priest",
    "activated": [{"cost": "{U}{U}", "tap": true, "onlyDuring": "ownUpkeep", "effect": {"type": "addKeywordUntilEnd", "keyword": "shroud", "target": "creature"}}],
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Uncommon",
    "text_fr": "{U}{U}, {T} : la créature ciblée gagne le linceul jusqu'à la fin du tour. N'activez cette capacité que pendant votre entretien.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "implemented",
    "subtype": "Merfolk Cleric",
    "power": 1,
    "toughness": 1,
    "img": "img/svyelunite_priest.jpeg",
    "id": 909
  },
  {
    "name": "Tidal Flats",
    "cost": "{U}",
    "cmc": 1,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "{U} : jusqu'à la fin du tour, les créatures rouges gagnent +0/-1 et les créatures blanches gagnent +0/+1.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tidal_flats.jpeg",
    "effectStatus": "unimplemented",
    "id": 910
  },
  {
    "name": "Tidal Influence",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, mettez un marqueur de marée. Créatures bleues : +0/+1 (marée haute), -1/-0 (marée basse).",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tidal_influence.jpeg",
    "effectStatus": "unimplemented",
    "id": 911
  },
  {
    "name": "Vodalian Knights",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Initiative. Cette créature ne peut pas attaquer sauf si le joueur défenseur contrôle une île. Quand vous ne contrôlez aucune île, sacrifiez cette créature. {U} : Cette créature gagne le vol jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "firstStrike"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Merfolk Knight",
    "power": 2,
    "toughness": 2,
    "img": "img/vodalian_knights.jpeg",
    "id": 912
  },
  {
    "name": "Vodalian Mage",
    "cost": "{2}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Merfolk Wizard",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{U} : contrecarrez une capacité activée ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/vodalian_mage.jpeg",
    "effectStatus": "unimplemented",
    "id": 913
  },
  {
    "name": "Vodalian Soldiers",
    "cost": "{1}{U}",
    "cmc": 2,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Merfolk Soldier",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "functional",
    "img": "img/vodalian_soldiers.jpeg",
    "id": 914
  },
  {
    "name": "Vodalian War Machine",
    "cost": "{1}{U}{U}",
    "cmc": 3,
    "color": [
      "U"
    ],
    "type": "Creature",
    "subtype": "Wall",
    "power": 0,
    "toughness": 4,
    "rarity": "Rare",
    "text_fr": "Ne peut pas attaquer à moins de sacrifier un Merfolk. Force et endurance égales au nombre de Merfolk sacrifiés.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "defender"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/vodalian_war_machine.jpeg",
    "id": 915
  },
  {
    "name": "Armor Thrull",
    "activated": [{"cost": "", "tap": true, "effect": {"type": "pump", "power": 1, "toughness": 2, "target": "creature"}}],
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Thrull",
    "power": 1,
    "toughness": 3,
    "rarity": "Common",
    "text_fr": "{T} : une créature ciblée gagne +1/+2 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/armor_thrull.jpeg",
    "effectStatus": "implemented",
    "id": 916
  },
  {
    "name": "Basal Thrull",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": true}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "B", "amount": 2}}],
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Thrull",
    "power": 1,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "{T} : sacrifiez Basal Thrull. Ajoutez {B}{B}.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/basal_thrull.jpeg",
    "effectStatus": "implemented",
    "id": 917
  },
  {
    "name": "Breeding Pit",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "À l'entretien, mettez en jeu un jeton Thrull 0/1. À votre entretien, sacrifiez une créature ou Breeding Pit.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/breeding_pit.jpeg",
    "effectStatus": "unimplemented",
    "id": 918
  },
  {
    "name": "Derelor",
    "cost": "{3}{B}",
    "cmc": 4,
    "color": [
      "B"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Les sorts noirs que vous lancez coûtent {B} de plus à lancer.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Thrull",
    "power": 4,
    "toughness": 4,
    "img": "img/derelor.jpeg",
    "id": 919
  },
  {
    "name": "Ebon Praetor",
    "cost": "{4}{B}{B}",
    "cmc": 6,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Avatar Praetor",
    "power": 5,
    "toughness": 5,
    "rarity": "Rare",
    "text_fr": "Initiative, piétinement. Sacrifiez un Thrull : +2/+2.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "firstStrike",
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/ebon_praetor.jpeg",
    "id": 920
  },
  {
    "name": "Hymn to Tourach",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "L'adversaire défausse deux cartes au hasard.",
    "effectStatus": "implemented",
    "effect": {
      "type": "discardRandom",
      "amount": 2,
      "target": "opponent"
    },
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/hymn_to_tourach.jpeg",
    "id": 921
  },
  {
    "name": "Initiates of the Ebon Hand",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Cleric",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{1} : une créature noire ciblée gagne +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/initiates_of_the_ebon_hand.jpeg",
    "effectStatus": "unimplemented",
    "id": 922
  },
  {
    "name": "Mindstab Thrull",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Thrull",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Si Mindstab Thrull n'est pas bloqué, vous pouvez le sacrifier. Si vous le faites, l'adversaire défausse trois cartes.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/mindstab_thrull.jpeg",
    "effectStatus": "unimplemented",
    "id": 923
  },
  {
    "name": "Necrite",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Thrull",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Si Necrite n'est pas bloqué, vous pouvez le sacrifier. Si vous le faites, détruisez une créature ciblée bloquée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/necrite.jpeg",
    "effectStatus": "unimplemented",
    "id": 924
  },
  {
    "name": "Order of the Ebon Hand",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Cleric Knight",
    "power": 2,
    "toughness": 1,
    "rarity": "Common",
    "sets": [
      "FEM"
    ],
    "text_fr": "Protection contre le blanc.\n{B} : L’Ordre de la main d’ébène acquiert l’initiative jusqu’à la fin du tour.\n{B}{B} : L’Ordre de la main d’ébène gagne +1/+0 jusqu’à la fin du tour.",
    "activated": [{ "cost": "{B}", "tap": false, "effect": { "type": "addKeywordUntilEnd", "keyword": "first strike" } }, { "cost": "{B}{B}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 0 } }],
    "effectStatus": "implemented",
    "keywords": [
      "protection"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/order_of_the_ebon_hand.jpeg",
    "id": 925
  },
  {
    "name": "Soul Exchange",
    "cost": "{B}{B}",
    "cmc": 2,
    "color": [
      "B"
    ],
    "type": "Sorcery",
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez une créature. Ramenez une créature ciblée d'un cimetière. Si le sacrifice était un Thrull, mettez un marqueur +1/+1.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/soul_exchange.jpeg",
    "effectStatus": "unimplemented",
    "id": 926
  },
  {
    "name": "Thrull Champion",
    "cost": "{4}{B}",
    "cmc": 5,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Thrull",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "Les Thrulls gagnent +1/+1. {T} : gagnez le contrôle d'un Thrull ciblé.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thrull_champion.jpeg",
    "effectStatus": "unimplemented",
    "id": 927
  },
  {
    "name": "Thrull Retainer",
    "cost": "{B}",
    "cmc": 1,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "subtype": "Aura",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "Sacrifiez Thrull Retainer : régénérez une créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/thrull_retainer.jpeg",
    "id": 928
  },
  {
    "name": "Thrull Wizard",
    "cost": "{2}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Creature",
    "subtype": "Thrull Wizard",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{1}{B} : contrecarrez une capacité activée d'un artefact ciblé.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thrull_wizard.jpeg",
    "effectStatus": "unimplemented",
    "id": 929
  },
  {
    "name": "Tourach's Chant",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de l'entretien de l'adversaire, sacrifiez un terrain ou inflige 3 blessures à vous.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/tourachs_chant.jpeg",
    "effectStatus": "unimplemented",
    "id": 930
  },
  {
    "name": "Tourach's Gate",
    "cost": "{1}{B}{B}",
    "cmc": 3,
    "color": [
      "B"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Le terrain enchanté gagne : {T} : les créatures que vous contrôlez gagnent +2/+0.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "subtype": "Aura",
    "img": "img/tourachs_gate.jpeg",
    "effectStatus": "unimplemented",
    "id": 931
  },
  {
    "name": "Brassclaw Orcs",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orc",
    "power": 3,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Si Brassclaw Orcs est bloqué par une créature de force 2 ou moins, elle ne peut pas infliger de blessures de combat.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/brassclaw_orcs.jpeg",
    "effectStatus": "unimplemented",
    "id": 932
  },
  {
    "name": "Dwarven Armorer",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "{R}, {T}, Défaussez une carte : Mettez un marqueur +0/+1 ou un marqueur +1/+0 sur la créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Dwarf",
    "power": 0,
    "toughness": 2,
    "img": "img/dwarven_armorer.jpeg",
    "id": 933
  },
  {
    "name": "Dwarven Catapult",
    "cost": "{X}{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Instant",
    "rarity": "Uncommon",
    "xSpell": true,
    "text_fr": "Inflige X blessures réparties entre X créatures ciblées.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/dwarven_catapult.jpeg",
    "effectStatus": "unimplemented",
    "id": 934
  },
  {
    "name": "Dwarven Lieutenant",
    "cost": "{R}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Dwarf Soldier",
    "power": 1,
    "toughness": 2,
    "rarity": "Uncommon",
    "text_fr": "{1}{R} : un nain ciblé gagne +1/+0 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/dwarven_lieutenant.jpeg",
    "effectStatus": "unimplemented",
    "id": 935
  },
  {
    "name": "Dwarven Soldier",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Dwarf Soldier",
    "power": 2,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Si Dwarven Soldier bloque ou est bloqué par un Orc, gagne +0/+2.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/dwarven_soldier.jpeg",
    "effectStatus": "unimplemented",
    "id": 936
  },
  {
    "name": "Goblin Chirurgeon",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin Shaman",
    "power": 0,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "Sacrifiez une créature : régénérez une créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_chirurgeon.jpeg",
    "id": 937
  },
  {
    "name": "Goblin Flotilla",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Goblin",
    "power": 2,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "{Islandwalk}. {R} : +1/+1 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "activated": [{ "cost": "{R}", "tap": false, "effect": { "type": "pumpSelf", "power": 1, "toughness": 1 } }],
    "effectStatus": "implemented",
    "keywords": [
      "landwalk",
      "islandwalk"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/goblin_flotilla.jpeg",
    "id": 938
  },
  {
    "name": "Goblin Grenade",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Sorcery",
    "rarity": "Common",
    "text_fr": "En tant que coût supplémentaire pour lancer la Grenade gobeline, sacrifiez un gobelin.\nLa Grenade gobeline inflige 5 blessures à une cible, créature ou joueur.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/goblin_grenade.jpeg",
    "effectStatus": "unimplemented",
    "id": 939
  },
  {
    "name": "Goblin Kites",
    "cost": "{1}{R}",
    "cmc": 2,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "{R} : une créature ciblée gagne le vol jusqu'à la fin du tour. Lancez une pièce. Pile : sacrifiez-la.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/goblin_kites.jpeg",
    "effectStatus": "unimplemented",
    "id": 940
  },
  {
    "name": "Goblin War Drums",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "Chaque créature que vous contrôlez ne peut être bloquée excepté par deux créatures ou plus.",
    "static": [
      {
        "type": "grantKeyword",
        "keyword": "menace",
        "filterType": "Creature",
        "controllerFilter": "self"
      }
    ],
    "effectStatus": "implemented",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/goblin_war_drums.jpeg",
    "id": 941
  },
  {
    "name": "Goblin Warrens",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "{2}{R}, Sacrifiez deux Gobelins : Créez trois jetons de créature 1/1 rouges Gobelin.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/goblin_warrens.jpeg",
    "id": 942
  },
  {
    "name": "Orcish Captain",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orc Warrior",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{1} : lancez une pièce. Face : +2/+0. Pile : -0/-2.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/orcish_captain.jpeg",
    "effectStatus": "unimplemented",
    "id": 943
  },
  {
    "name": "Orcish Spy",
    "cost": "{R}",
    "cmc": 1,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orc Rogue",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{T} : Regardez les trois cartes du dessus de la bibliothèque du joueur ciblé. (Remettez-les dans le même ordre.)",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/orcish_spy.jpeg",
    "effectStatus": "unimplemented",
    "id": 944
  },
  {
    "name": "Orcish Veteran",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Creature",
    "rarity": "Common",
    "text_fr": "Cette créature ne peut pas bloquer les créatures blanches de force 2 ou plus. {R} : Cette créature gagne l'initiative jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Orc",
    "power": 2,
    "toughness": 2,
    "img": "img/orcish_veteran.jpeg",
    "id": 945
  },
  {
    "name": "Orgg",
    "cost": "{3}{R}{R}",
    "cmc": 5,
    "color": [
      "R"
    ],
    "type": "Creature",
    "subtype": "Orgg",
    "power": 6,
    "toughness": 6,
    "rarity": "Rare",
    "text_fr": "Piétinement\nL'Orgg ne peut pas attaquer si le joueur défenseur contrôle une créature dégagée dont la force est supérieure ou égale à 3.\nL'Orgg ne peut pas bloquer les créatures dont la force est supérieure ou égale à 3.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "trample"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "static": [
      {
        "type": "attackRestriction",
        "condition": "defenderControlsUntappedCreature"
      }
    ],
    "img": "img/orgg.jpeg",
    "id": 946
  },
  {
    "name": "Raiding Party",
    "cost": "{2}{R}",
    "cmc": 3,
    "color": [
      "R"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Cet enchantement ne peut pas être la cible de sorts blancs ni de capacités provenant de sources blanches. Sacrifiez un Orc : Chaque joueur peut engager n'importe quel nombre de créatures blanches non-engagées qu'il contrôle. Pour chaque créature engagée de cette manière, ce joueur choisit jusqu'à deux Plaines. Ensuite, détruisez toutes les Plaines qui n'ont été choisies ainsi par aucun joueur.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/raiding_party.jpeg",
    "id": 947
  },
  {
    "name": "Elven Fortress",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "{G} : une créature bloqueuse ciblée gagne +0/+1 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/elven_fortress.jpeg",
    "effectStatus": "unimplemented",
    "id": 948
  },
  {
    "name": "Elvish Farmer",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "rarity": "Rare",
    "text_fr": "Au début de votre entretien, mettez un marqueur de spore sur cette créature. Retirez trois marqueurs de spore de cette créature : Créez un jeton de créature 1/1 vert Saproling. Sacrifiez un Saproling : Vous gagnez 2 points de vie.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "subtype": "Elf",
    "power": 0,
    "toughness": 2,
    "img": "img/elvish_farmer.jpeg",
    "id": 949
  },
  {
    "name": "Elvish Hunter",
    "cost": "{1}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elf Archer",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{1}{G} : engagez la créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/elvish_hunter.jpeg",
    "effectStatus": "unimplemented",
    "id": 950
  },
  {
    "name": "Elvish Scout",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Elf Scout",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "{G} : dégagez la créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/elvish_scout.jpeg",
    "effectStatus": "unimplemented",
    "id": 951
  },
  {
    "name": "Feral Thallid",
    "cost": "{3}{G}{G}{G}",
    "cmc": 6,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Fungus",
    "power": 6,
    "toughness": 3,
    "rarity": "Uncommon",
    "text_fr": "{G}{G} : régénérez.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/feral_thallid.jpeg",
    "id": 952
  },
  {
    "name": "Fungal Bloom",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "{G}{G} : mettez un marqueur de croissance sur un Thallid ciblé.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/fungal_bloom.jpeg",
    "effectStatus": "unimplemented",
    "id": 953
  },
  {
    "name": "Night Soil",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Common",
    "text_fr": "{1}, exilez deux cartes de créature d'un cimetière unique : Mettez sur le champ de bataille un jeton de créature 1/1 verte Saprobionte.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/night_soil.jpeg",
    "effectStatus": "unimplemented",
    "id": 954
  },
  {
    "name": "Spore Cloud",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Instant",
    "rarity": "Common",
    "text_fr": "Engagez toutes les créatures bloqueuses et bloquées. Elles ne se dégagent pas au prochain dégagement.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": false,
    "img": "img/spore_cloud.jpeg",
    "effectStatus": "unimplemented",
    "id": 955
  },
  {
    "name": "Spore Flower",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Fungus",
    "power": 0,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{G}{G} : les créatures ne peuvent pas infliger de blessures de combat ce tour-ci.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/spore_flower.jpeg",
    "effectStatus": "unimplemented",
    "id": 956
  },
  {
    "name": "Thallid",
    "cost": "{G}",
    "cmc": 1,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Fungus",
    "power": 1,
    "toughness": 1,
    "rarity": "Common",
    "text_fr": "Au début de votre entretien, mettez un marqueur « spore » sur le Thallidé.\nRetirez trois marqueurs « spore » du Thallidé : Mettez en jeu un jeton de créature 1/1 verte Saprobionte.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thallid.jpeg",
    "effectStatus": "unimplemented",
    "id": 957
  },
  {
    "name": "Thallid Devourer",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Fungus",
    "power": 2,
    "toughness": 2,
    "rarity": "Uncommon",
    "text_fr": "{G} : mettez un marqueur de spore. Retirez un marqueur : +1/+2 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thallid_devourer.jpeg",
    "effectStatus": "unimplemented",
    "id": 958
  },
  {
    "name": "Thelon's Chant",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Uncommon",
    "text_fr": "Au début de votre entretien, sacrifiez cet enchantement à moins que vous ne payiez {G}. À chaque fois qu'un joueur met un Marais sur le champ de bataille, cet enchantement inflige 3 blessures à ce joueur à moins que le joueur ne mette un marqueur -1/-1 sur une créature qu'il contrôle.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/thelons_chant.jpeg",
    "id": 959
  },
  {
    "name": "Thelon's Curse",
    "cost": "{G}{G}",
    "cmc": 2,
    "color": [
      "G"
    ],
    "type": "Enchantment",
    "rarity": "Rare",
    "text_fr": "Les créatures bleues ne se dégagent pas pendant les étapes de dégagement de leurs contrôleurs. Au début de l'entretien de chaque joueur, ce joueur peut choisir n'importe quel nombre de créatures bleues engagées qu'il contrôle et payer {U} pour chaque créature ainsi choisie. S'il fait ainsi, dégagez ces créatures.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/thelons_curse.jpeg",
    "id": 960
  },
  {
    "name": "Thelonite Druid",
    "cost": "{2}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Human Cleric Druid",
    "power": 1,
    "toughness": 1,
    "rarity": "Uncommon",
    "text_fr": "{G}{G}{G} : sacrifiez une forêt. Les Thallids gagnent +2/+2.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thelonite_druid.jpeg",
    "effectStatus": "unimplemented",
    "id": 961
  },
  {
    "name": "Thelonite Monk",
    "cost": "{2}{G}{G}",
    "cmc": 4,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Insect Monk Cleric",
    "power": 1,
    "toughness": 2,
    "rarity": "Rare",
    "text_fr": "{T} : sacrifiez une forêt. Mettez un marqueur de spore sur chaque Thallid.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thelonite_monk.jpeg",
    "effectStatus": "unimplemented",
    "id": 962
  },
  {
    "name": "Thorn Thallid",
    "cost": "{1}{G}{G}",
    "cmc": 3,
    "color": [
      "G"
    ],
    "type": "Creature",
    "subtype": "Fungus",
    "power": 2,
    "toughness": 2,
    "rarity": "Common",
    "text_fr": "{1} : inflige 1 blessure à n'importe quelle cible.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": true,
    "isPermanent": true,
    "img": "img/thorn_thallid.jpeg",
    "effectStatus": "unimplemented",
    "id": 963
  },
  {
    "name": "Aeolipile",
    "activated": [{"cost": {"mana": "{1}", "tap": true, "sacrifice": "self"}, "tap": true, "effect": {"type": "damage", "amount": 2, "target": "anyTarget"}}],
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T}, Sacrifiez cet artefact : Il inflige 2 blessures à n'importe quelle cible.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/aeolipile.jpeg",
    "id": 964
  },
  {
    "name": "Balm of Restoration",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T}, Sacrifiez cet artefact : Choisissez l'un —\n• Vous gagnez 2 points de vie.\n• Prévenez les 2 prochaines blessures qui devraient être infligées à n'importe quelle cible ce tour-ci.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/balm_of_restoration.jpeg",
    "id": 965
  },
  {
    "name": "Conch Horn",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1} : sacrifiez Conch Horn. Piochez deux cartes, puis défaussez une carte.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/conch_horn.jpeg",
    "effectStatus": "unimplemented",
    "id": 966
  },
  {
    "name": "Delif's Cone",
    "cost": "{0}",
    "cmc": 0,
    "color": [],
    "type": "Artifact",
    "rarity": "Common",
    "text_fr": "{T} : la créature attaquante ciblée ne peut pas infliger de blessures de combat ce tour-ci. Piochez une carte à la fin du combat.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/delifs_cone.jpeg",
    "effectStatus": "unimplemented",
    "id": 967
  },
  {
    "name": "Delif's Cube",
    "cost": "{1}",
    "cmc": 1,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1} : prévenez toutes les blessures de combat d'une créature ciblée ce tour-ci. Mettez un marqueur +1/+1 sur elle.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/delifs_cube.jpeg",
    "id": 968
  },
  {
    "name": "Draconian Cylix",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{2}, {T}, Défaussez une carte au hasard : Régénérez la créature ciblée.",
    "sets": [
      "FEM"
    ],
    "keywords": [
      "regenerate"
    ],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/draconian_cylix.jpeg",
    "id": 969
  },
  {
    "name": "Elven Lyre",
    "activated": [{"cost": {"mana": "{1}", "tap": true, "sacrifice": "self"}, "tap": true, "effect": {"type": "pump", "power": 2, "toughness": 2, "target": "creature"}}],
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T}, Sacrifiez cet artefact : La créature ciblée gagne +2/+2 jusqu'à la fin du tour.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/elven_lyre.jpeg",
    "id": 970
  },
  {
    "name": "Implements of Sacrifice",
    "cost": "{2}",
    "cmc": 2,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{1}, {T}, Sacrifiez cet artefact : Ajoutez deux manas d'une même couleur.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/implements_of_sacrifice.jpeg",
    "activated": [{"cost": {"mana": "{1}", "tap": true, "sacrifice": true}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "any", "amount": 2}}],
    "id": 971
  },
  {
    "name": "Ring of Renewal",
    "cost": "{5}",
    "cmc": 5,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{5}, {T} : Défaussez une carte au hasard, puis piochez deux cartes.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/ring_of_renewal.jpeg",
    "id": 972
  },
  {
    "name": "Spirit Shield",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "Vous pouvez choisir de ne pas dégager cet artefact pendant votre étape de dégagement. {2}, {T} : La créature ciblée gagne +0/+2 tant que cet artefact reste engagé.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "unimplemented",
    "img": "img/spirit_shield.jpeg",
    "id": 973
  },
  {
    "name": "Zelyon Sword",
    "cost": "{3}",
    "cmc": 3,
    "color": [],
    "type": "Artifact",
    "rarity": "Rare",
    "text_fr": "{3} : la créature équipée gagne la protection contre le rouge et la protection contre le blanc.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": false,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/zelyon_sword.jpeg",
    "effectStatus": "unimplemented",
    "id": 974
  },
  {
    "name": "Bottomless Vault",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. Vous pouvez choisir de ne pas dégager ce terrain pendant votre étape de dégagement. Au début de votre entretien, si ce terrain est engagé, mettez un marqueur de stockage dessus. {T}, Retirez n'importe quel nombre de marqueurs de stockage de ce terrain : Ajoutez {B} pour chaque marqueur de stockage retiré ainsi.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {"controllerUpkeep": true, "sourceSelf": true, "sourceTapped": true},
        "effect": {"type": "addCounter", "counter": "storage", "amount": 1}
      }
    ],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/bottomless_vault.jpeg",
    "entersTapped": true,
    "mayNotUntap": true,
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "B", "amount": 0, "perCounterRemoved": {"counter": "storage", "amount": 1}}}],
    "effectStatus": "implemented",
    "id": 975
  },
  {
    "name": "Dwarven Hold",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. Vous pouvez choisir de ne pas dégager ce terrain pendant votre étape de dégagement. Au début de votre entretien, si ce terrain est engagé, mettez un marqueur de stockage dessus. {T}, Retirez n'importe quel nombre de marqueurs de stockage de ce terrain : Ajoutez {R} pour chaque marqueur de stockage retiré ainsi.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {"controllerUpkeep": true, "sourceSelf": true, "sourceTapped": true},
        "effect": {"type": "addCounter", "counter": "storage", "amount": 1}
      }
    ],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/dwarven_hold.jpeg",
    "entersTapped": true,
    "mayNotUntap": true,
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "R", "amount": 0, "perCounterRemoved": {"counter": "storage", "amount": 1}}}],
    "id": 976
  },
  {
    "name": "Dwarven Ruins",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": true}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "R", "amount": 2}}],
    "produces": "R",
    "entersTapped": true,
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. {T} : Ajoutez {R}. {T}, Sacrifiez ce terrain : Ajoutez {R}{R}.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/dwarven_ruins.jpeg",
    "id": 977
  },
  {
    "name": "Ebon Stronghold",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": true}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "B", "amount": 2}}],
    "produces": "B",
    "entersTapped": true,
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. {T} : Ajoutez {B}. {T}, Sacrifiez ce terrain : Ajoutez {B}{B}.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/ebon_stronghold.jpeg",
    "id": 978
  },
  {
    "name": "Havenwood Battleground",
    "effectStatus": "implemented",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": true}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "G", "amount": 2}}],
    "produces": "G",
    "entersTapped": true,
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Le Champ de bataille d'Havrebois arrive sur le champ de bataille engagé.\n{T} : Ajoutez {G} à votre réserve.\n{T}, sacrifiez le Champ de bataille d'Havrebois : Ajoutez {G}{G} à votre réserve.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/havenwood_battleground.jpeg",
    "id": 979
  },
  {
    "name": "Hollow Trees",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. Vous pouvez choisir de ne pas dégager ce terrain pendant votre étape de dégagement. Au début de votre entretien, si ce terrain est engagé, mettez un marqueur de stockage dessus. {T}, Retirez n'importe quel nombre de marqueurs de stockage de ce terrain : Ajoutez {G} pour chaque marqueur de stockage retiré ainsi.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {"controllerUpkeep": true, "sourceSelf": true, "sourceTapped": true},
        "effect": {"type": "addCounter", "counter": "storage", "amount": 1}
      }
    ],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/hollow_trees.jpeg",
    "entersTapped": true,
    "mayNotUntap": true,
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "G", "amount": 0, "perCounterRemoved": {"counter": "storage", "amount": 1}}}],
    "id": 980
  },
  {
    "name": "Icatian Store",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. Vous pouvez choisir de ne pas dégager ce terrain pendant votre étape de dégagement. Au début de votre entretien, si ce terrain est engagé, mettez un marqueur de stockage dessus. {T}, Retirez n'importe quel nombre de marqueurs de stockage de ce terrain : Ajoutez {W} pour chaque marqueur de stockage retiré ainsi.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {"controllerUpkeep": true, "sourceSelf": true, "sourceTapped": true},
        "effect": {"type": "addCounter", "counter": "storage", "amount": 1}
      }
    ],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/icatian_store.jpeg",
    "entersTapped": true,
    "mayNotUntap": true,
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "W", "amount": 0, "perCounterRemoved": {"counter": "storage", "amount": 1}}}],
    "effectStatus": "implemented",
    "id": 981
  },
  {
    "name": "Rainbow Vale",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "{T} : ajoutez un mana de la couleur de votre choix. Un adversaire prend le contrôle de Rainbow Vale au début de la prochaine étape de fin.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/rainbow_vale.jpeg",
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "any", "amount": 1, "passControlAtEndStep": true}}],
    "effectStatus": "implemented",
    "id": 982
  },
  {
    "name": "Ruins of Trokair",
    "effectStatus": "implemented",
    "produces": "W",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": "self"}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "W", "amount": 2}}],
    "entersTapped": true,
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Entre en jeu engagé. {T} : ajoutez {W}. {T}, sacrifiez ce terrain : ajoutez {W}{W}.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/ruins_of_trokair.jpeg",
    "id": 983
  },
  {
    "name": "Sand Silos",
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Rare",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. Vous pouvez choisir de ne pas dégager ce terrain pendant votre étape de dégagement. Au début de votre entretien, si ce terrain est engagé, mettez un marqueur de stockage dessus. {T}, Retirez n'importe quel nombre de marqueurs de stockage de ce terrain : Ajoutez {U} pour chaque marqueur de stockage retiré ainsi.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [
      {
        "event": "upkeepStarted",
        "condition": {"controllerUpkeep": true, "sourceSelf": true, "sourceTapped": true},
        "effect": {"type": "addCounter", "counter": "storage", "amount": 1}
      }
    ],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "img": "img/sand_silos.jpeg",
    "entersTapped": true,
    "mayNotUntap": true,
    "activated": [{"cost": "", "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "U", "amount": 0, "perCounterRemoved": {"counter": "storage", "amount": 1}}}],
    "effectStatus": "implemented",
    "id": 984
  },
  {
    "name": "Svyelunite Temple",
    "activated": [{"cost": {"mana": "", "tap": true, "sacrifice": true}, "tap": true, "manaAbility": true, "effect": {"type": "mana", "color": "U", "amount": 2}}],
    "produces": "U",
    "entersTapped": true,
    "cost": "",
    "cmc": 0,
    "color": [],
    "type": "Land",
    "rarity": "Uncommon",
    "text_fr": "Ce terrain arrive engagé sur le champ de bataille. {T} : Ajoutez {U}. {T}, Sacrifiez ce terrain : Ajoutez {U}{U}.",
    "sets": [
      "FEM"
    ],
    "keywords": [],
    "triggers": [],
    "isLand": true,
    "isCreature": false,
    "isPermanent": true,
    "effectStatus": "implemented",
    "img": "img/svyelunite_temple.jpeg",
    "id": 985
  }
];

export default CARDS.map(normalizeCard);
