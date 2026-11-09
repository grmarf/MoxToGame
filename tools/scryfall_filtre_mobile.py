#!/usr/bin/env python3
"""
Version SMARTPHONE : AUCUN argument, il suffit de l'exécuter (Pydroid 3, Termux...).

Cherche dans le dossier Téléchargements les deux exports Scryfall (formats .json, .jsonl ou .jsonl.gz acceptés, noms avec ou sans chiffres) :
    default-cards*   (« Default Cards »)      rulings*   (« Rulings »)
et écrit, dans ce MÊME dossier, scryfall-perimetre.json (quelques Mo) : à envoyer à Claude. Lit le .gz directement (rien à décompresser).

Une carte est gardée si elle a été imprimée dans une extension du périmètre (Alpha -> Homelands) OU si son nom figure dans la base MoxToGame
(985 noms intégrés ci-dessous) : cela marche aussi si le fichier est « Oracle Cards » (une impression par carte).
Optionnel : python scryfall_filtre_mobile.py /chemin/du/dossier
Version 3 : code de premier niveau (aucune fonction « main » à définir ni à appeler).
"""
import glob
import gzip
import json
import os
import sys

# Extensions du périmètre (modifiable). lea=Alpha, leb=Beta, 2ed=Unlimited, arn=Arabian Nights, atq=Antiquities, 3ed=Revised,
# leg=Legends, drk=The Dark, fem=Fallen Empires, 4ed=Fourth Edition, hml=Homelands.
SETS = {"lea", "leb", "2ed", "arn", "atq", "3ed", "leg", "drk", "fem", "4ed", "hml"}

# Noms des cartes de la base MoxToGame (pour reconnaître une carte même si le fichier ne liste que sa dernière impression).
NOMS_BASE = set(json.loads(r'''["Abomination","Abu Ja'far","Acid Rain","Active Volcano","Adun Oakenshield","Adventurers' Guildhouse","Aeolipile","Aerathi Berserker","Air Elemental","Aisling Leprechaun","Akron Legionnaire","Al-abara's Carpet","Alabaster Potion","Aladdin","Aladdin's Lamp","Aladdin's Ring","Alchor's Tomb","Ali Baba","Ali from Cairo","All Hallow's Eve","Amnesia","Amrou Kithkin","Amulet of Kroog","Ancestral Recall","Angelic Voices","Angry Mob","Angus Mackenzie","Animate Artifact","Animate Dead","Animate Wall","Ankh of Mishra","Anti-Magic Aura","Apprentice Wizard","Arboria","Arcades Sabboth","Arena of the Ancients","Argivian Archaeologist","Argivian Blacksmith","Argothian Pixies","Argothian Treefolk","Armageddon","Armageddon Clock","Armor Thrull","Army of Allah","Artifact Blast","Artifact Possession","Artifact Ward","Ashes to Ashes","Ashnod's Altar","Ashnod's Battle Gear","Ashnod's Transmogrant","Aspect of Wolf","Atog","Avoid Fate","Axelrod Gunnarson","Ayesha Tanaka","Azure Drake","Backdraft","Backfire","Bad Moon","Badlands","Balance","Ball Lightning","Balm of Restoration","Banshee","Barbary Apes","Barktooth Warbeard","Barl's Cage","Bartel Runeaxe","Basal Thrull","Basalt Monolith","Battering Ram","Bayou","Bazaar of Baghdad","Beasts of Bogardan","Benalish Hero","Berserk","Bird Maiden","Birds of Paradise","Black Knight","Black Lotus","Black Mana Battery","Black Vise","Black Ward","Blaze of Glory","Blazing Effigy","Blessing","Blight","Blood Lust","Blood Moon","Blood of the Martyr","Blue Elemental Blast","Blue Mana Battery","Blue Ward","Bog Imp","Bog Rats","Bog Wraith","Bone Flute","Book of Rass","Boomerang","Boris Devilboon","Bottle of Suleiman","Bottomless Vault","Braingeyser","Brainwash","Brass Man","Brassclaw Orcs","Breeding Pit","Brine Hag","Bronze Horse","Bronze Tablet","Brothers of Fire","Burrowing","Camel","Camouflage","Candelabra of Tawnos","Carnivorous Plant","Carrion Ants","Castle","Cat Warriors","Cathedral of Serra","Cave People","Caverns of Despair","Celestial Prism","Chain Lightning","Chains of Mephistopheles","Channel","Chaos Orb","Chaoslace","Chromium","Circle of Protection: Artifacts","Circle of Protection: Black","Circle of Protection: Blue","Circle of Protection: Green","Circle of Protection: Red","Circle of Protection: White","Citanul Druid","City in a Bottle","City of Brass","City of Shadows","Clay Statue","Cleanse","Cleansing","Clergy of the Holy Nimbus","Clockwork Avian","Clockwork Beast","Clone","Coal Golem","Cockatrice","Cocoon","Colossus of Sardia","Combat Medic","Conch Horn","Concordant Crossroads","Consecrate Land","Conservator","Contract from Below","Control Magic","Conversion","Copper Tablet","Copy Artifact","Coral Helm","Cosmic Horror","Counterspell","Craw Giant","Craw Wurm","Creature Bond","Crevasse","Crimson Kobolds","Crimson Manticore","Crookshank Kobolds","Crumble","Crusade","Crystal Rod","Cuombajj Witches","Curse Artifact","Cursed Land","Cursed Rack","Cyclone","Cyclopean Mummy","Cyclopean Tomb","D'Avenant Archer","Dakkon Blackblade","Damping Field","Dance of Many","Dancing Scimitar","Dandân","Dark Heart of the Wood","Dark Ritual","Dark Sphere","Darkness","Darkpact","Deadfall","Death Ward","Deathgrip","Deathlace","Deep Spawn","Deep Water","Delif's Cone","Delif's Cube","Demonic Attorney","Demonic Hordes","Demonic Torment","Demonic Tutor","Derelor","Desert","Desert Nomads","Desert Twister","Detonate","Devouring Deep","Diabolic Machine","Diamond Valley","Dingus Egg","Disenchant","Disharmony","Disintegrate","Disrupting Scepter","Divine Intervention","Divine Offering","Divine Transformation","Draconian Cylix","Drafna's Restoration","Dragon Engine","Dragon Whelp","Drain Life","Drain Power","Dream Coat","Drop of Honey","Drowned","Drudge Skeletons","Durkwood Boars","Dust to Dust","Dwarven Armorer","Dwarven Catapult","Dwarven Demolition Team","Dwarven Hold","Dwarven Lieutenant","Dwarven Ruins","Dwarven Soldier","Dwarven Song","Dwarven Warriors","Dwarven Weaponsmith","Earth Elemental","Earthbind","Earthquake","Eater of the Dead","Ebon Praetor","Ebon Stronghold","Ebony Horse","El-Hajjâj","Elder Land Wurm","Elder Spawn","Electric Eel","Elephant Graveyard","Elven Fortress","Elven Lyre","Elven Riders","Elves of Deep Shadow","Elvish Archers","Elvish Farmer","Elvish Hunter","Elvish Scout","Emerald Dragonfly","Enchanted Being","Enchantment Alteration","Energy Flux","Energy Tap","Equinox","Erg Raiders","Erhnam Djinn","Erosion","Eternal Flame","Eternal Warrior","Eureka","Evil Eye of Orms-by-Gore","Evil Presence","Exorcist","Eye for an Eye","Fallen Angel","Falling Star","False Orders","Farmstead","Farrel's Mantle","Farrel's Zealot","Farrelite Priest","Fastbond","Fasting","Fear","Feedback","Feint","Feldon's Cane","Fellwar Stone","Feral Thallid","Festival","Field of Dreams","Fire Drake","Fire Elemental","Fire Sprites","Fire and Brimstone","Fireball","Firebreathing","Firestorm Phoenix","Fishliver Oil","Fissure","Flash Counter","Flash Flood","Flashfires","Flight","Flood","Floral Spuzzem","Flying Carpet","Flying Men","Fog","Force Spike","Force of Nature","Forcefield","Forest","Forethought Amulet","Fork","Fortified Area","Fountain of Youth","Frankenstein's Monster","Frost Giant","Frozen Shade","Fungal Bloom","Fungusaur","Gabriel Angelfire","Gaea's Avenger","Gaea's Liege","Gaea's Touch","Gaseous Form","Gate to Phyrexia","Gauntlet of Might","Gauntlets of Chaos","Ghazbán Ogre","Ghost Ship","Ghosts of the Damned","Giant Growth","Giant Shark","Giant Slug","Giant Spider","Giant Strength","Giant Tortoise","Giant Turtle","Glasses of Urza","Gloom","Glyph of Delusion","Glyph of Destruction","Glyph of Doom","Glyph of Life","Glyph of Reincarnation","Goblin Artisans","Goblin Balloon Brigade","Goblin Caves","Goblin Chirurgeon","Goblin Digging Team","Goblin Flotilla","Goblin Grenade","Goblin Hero","Goblin King","Goblin Kites","Goblin Rock Sled","Goblin Shrine","Goblin War Drums","Goblin Warrens","Goblin Wizard","Goblins of the Flarg","Golgothian Sylex","Gosta Dirk","Granite Gargoyle","Grapeshot Catapult","Grave Robbers","Gravity Sphere","Gray Ogre","Great Defender","Great Wall","Greater Realm of Preservation","Greed","Green Mana Battery","Green Ward","Grizzly Bears","Guardian Angel","Guardian Beast","Gwendlyn Di Corci","Halfdane","Hammerheim","Hand of Justice","Hasran Ogress","Haunting Wind","Havenwood Battleground","Hazezon Tamar","Headless Horseman","Healing Salve","Heaven's Gate","Hell Swarm","Hell's Caretaker","Hellfire","Helm of Chatzuk","Heroism","Hidden Path","High Tide","Hill Giant","Hollow Trees","Holy Armor","Holy Day","Holy Light","Holy Strength","Homarid","Homarid Shaman","Homarid Spawning Bed","Homarid Warrior","Horn of Deafening","Hornet Cobra","Horror of Horrors","Howl from Beyond","Howling Mine","Hunding Gjornersen","Hurkyl's Recall","Hurloon Minotaur","Hurr Jackal","Hurricane","Hymn to Tourach","Hyperion Blacksmith","Hypnotic Specter","Icatian Infantry","Icatian Javelineers","Icatian Lieutenant","Icatian Moneychanger","Icatian Phalanx","Icatian Priest","Icatian Scout","Icatian Skirmishers","Icatian Store","Icatian Town","Ice Storm","Ichneumon Druid","Icy Manipulator","Ifh-Bíff Efreet","Illusionary Mask","Immolation","Implements of Sacrifice","Imprison","In the Eye of Chaos","Indestructible Aura","Infernal Medusa","Inferno","Infinite Authority","Initiates of the Ebon Hand","Inquisition","Instill Energy","Invisibility","Invoke Prejudice","Iron Star","Ironclaw Orcs","Ironroot Treefolk","Island","Island Fish Jasconius","Island Sanctuary","Island of Wak-Wak","Ivory Cup","Ivory Guardians","Ivory Tower","Jacques le Vert","Jade Monolith","Jade Statue","Jalum Tome","Jandor's Ring","Jandor's Saddlebags","Jasmine Boreal","Jayemdae Tome","Jedit Ojanen","Jerrard of the Closed Fist","Jeweled Bird","Jihad","Johan","Jovial Evil","Juggernaut","Jump","Junún Efreet","Juxtapose","Juzám Djinn","Karakas","Karma","Kasimir the Lone Wolf","Keepers of the Faith","Kei Takahashi","Keldon Warlord","Khabál Ghoul","Killer Bees","King Suleiman","Kird Ape","Kismet","Knights of Thorn","Knowledge Vault","Kobold Drill Sergeant","Kobold Overlord","Kobold Taskmaster","Kobolds of Kher Keep","Kormus Bell","Kry Shield","Kudzu","Lady Caleria","Lady Evangela","Lady Orca","Lance","Land Equilibrium","Land Leeches","Land Tax","Land's Edge","Lesser Werewolf","Leviathan","Ley Druid","Library of Alexandria","Library of Leng","Lich","Life Chisel","Life Matrix","Lifeblood","Lifeforce","Lifelace","Lifetap","Lightning Bolt","Living Armor","Living Artifact","Living Lands","Living Plane","Living Wall","Livonya Silone","Llanowar Elves","Lord Magnus","Lord of Atlantis","Lord of the Pit","Lost Soul","Lure","Lurker","Magical Hack","Magnetic Mountain","Mahamoti Djinn","Mana Clash","Mana Drain","Mana Flare","Mana Matrix","Mana Short","Mana Vault","Mana Vortex","Manabarbs","Marble Priest","Marhault Elsdragon","Marsh Gas","Marsh Goblins","Marsh Viper","Martyr's Cry","Martyrs of Korlis","Master of the Hunt","Maze of Ith","Meekstone","Merchant Ship","Merfolk Assassin","Merfolk of the Pearl Trident","Merseine","Mesa Pegasus","Metamorphosis","Mightstone","Mijae Djinn","Millstone","Mind Bomb","Mind Twist","Mindstab Thrull","Miracle Worker","Mirror Universe","Mishra's Factory","Mishra's War Machine","Mishra's Workshop","Moat","Mold Demon","Mons's Goblin Raiders","Moorish Cavalry","Morale","Moss Monster","Mountain","Mountain Stronghold","Mountain Yeti","Mox Emerald","Mox Jet","Mox Pearl","Mox Ruby","Mox Sapphire","Murk Dwellers","Nafs Asp","Nameless Race","Natural Selection","Nebuchadnezzar","Necrite","Necropolis","Nether Shadow","Nether Void","Nettling Imp","Nevinyrral's Disk","Niall Silvain","Nicol Bolas","Night Soil","Nightmare","North Star","Northern Paladin","Nova Pentacle","Oasis","Obelisk of Undoing","Obsianus Golem","Old Man of the Sea","Onulet","Orc General","Orcish Artillery","Orcish Captain","Orcish Mechanics","Orcish Oriflamme","Orcish Spy","Orcish Veteran","Order of Leitbur","Order of the Ebon Hand","Orgg","Ornithopter","Osai Vultures","Oubliette","Palladia-Mors","Paralyze","Part Water","Pavel Maliki","Pearled Unicorn","Pendelhaven","People of the Woods","Personal Incarnation","Pestilence","Petra Sphinx","Phantasmal Forces","Phantasmal Terrain","Phantom Monster","Phyrexian Gremlins","Piety","Pikemen","Pirate Ship","Pit Scorpion","Pixie Queen","Plague Rats","Plains","Planar Gate","Plateau","Power Artifact","Power Leak","Power Sink","Power Surge","Powerleech","Pradesh Gypsies","Preacher","Presence of the Master","Priest of Yawgmoth","Primal Clay","Primordial Ooze","Princess Lucrezia","Prodigal Sorcerer","Psionic Blast","Psionic Entity","Psychic Allergy","Psychic Purge","Psychic Venom","Puppet Master","Purelace","Pyramids","Pyrotechnics","Quagmire","Quarum Trench Gnomes","Rabid Wombat","Radjan Spirit","Rag Man","Raging Bull","Raging River","Ragnar","Raiding Party","Rainbow Vale","Raise Dead","Rakalite","Ramirez DePietro","Ramses Overdark","Rapid Fire","Rasputin Dreamweaver","Rebirth","Recall","Reconstruction","Red Elemental Blast","Red Mana Battery","Red Ward","Reflecting Mirror","Regeneration","Regrowth","Reincarnation","Relic Barrier","Relic Bind","Remove Enchantments","Remove Soul","Repentant Blacksmith","Reset","Resurrection","Revelation","Reverberation","Reverse Damage","Reverse Polarity","Righteous Avengers","Righteousness","Ring of Immortals","Ring of Ma'rûf","Ring of Renewal","Riptide","Riven Turnbull","River Merfolk","Roc of Kher Ridges","Rock Hydra","Rocket Launcher","Rod of Ruin","Rohgahh of Kher Keep","Royal Assassin","Rubinia Soulsinger","Ruins of Trokair","Rukh Egg","Runesword","Rust","Sacrifice","Safe Haven","Sage of Lat-Nam","Samite Healer","Sand Silos","Sandals of Abdallah","Sandstorm","Savaen Elves","Savannah","Savannah Lions","Scarecrow","Scarwood Bandits","Scarwood Goblins","Scarwood Hag","Scathe Zombies","Scavenger Folk","Scavenging Ghoul","Scrubland","Scryb Sprites","Sea Kings' Blessing","Sea Serpent","Seafarer's Quay","Seasinger","Season of the Witch","Sedge Troll","Seeker","Segovian Leviathan","Sengir Vampire","Sentinel","Serendib Djinn","Serendib Efreet","Serpent Generator","Serra Angel","Shahrazad","Shanodin Dryads","Shapeshifter","Shatter","Shatterstorm","Shelkin Brownie","Shield Wall","Shimian Night Stalker","Shivan Dragon","Silhouette","Simulacrum","Sindbad","Singing Tree","Sinkhole","Sir Shandlar of Eberyn","Siren's Call","Sisters of the Flame","Sivitri Scarzam","Skull of Orm","Sleight of Mind","Smoke","Sol Ring","Sol'kanar the Swamp King","Sorceress Queen","Sorrow's Path","Soul Exchange","Soul Net","Spectral Cloak","Spell Blast","Spinal Villain","Spirit Link","Spirit Shackle","Spirit Shield","Spiritual Sanctuary","Spitting Slug","Spore Cloud","Spore Flower","Squire","Staff of Zegon","Standing Stones","Stangg","Stasis","Steal Artifact","Stone Calendar","Stone Giant","Stone Rain","Stone-Throwing Devils","Storm Seeker","Storm World","Stream of Life","Strip Mine","Su-Chi","Subdue","Sunastian Falconer","Sunglasses of Urza","Sunken City","Svyelunite Priest","Svyelunite Temple","Swamp","Sword of the Ages","Swords to Plowshares","Sylvan Library","Sylvan Paradise","Syphon Soul","Tablet of Epityr","Taiga","Takklemaggot","Tangle Kelp","Tawnos's Coffin","Tawnos's Wand","Tawnos's Weaponry","Telekinesis","Teleport","Tempest Efreet","Terror","Tetravus","Tetsuo Umezawa","Thallid","Thallid Devourer","The Abyss","The Brute","The Fallen","The Hive","The Lady of the Mountain","The Rack","The Tabernacle at Pendrell Vale","The Wretched","Thelon's Chant","Thelon's Curse","Thelonite Druid","Thelonite Monk","Thicket Basilisk","Thorn Thallid","Thoughtlace","Throne of Bone","Thrull Champion","Thrull Retainer","Thrull Wizard","Thunder Spirit","Tidal Flats","Tidal Influence","Timber Wolves","Time Elemental","Time Vault","Time Walk","Timetwister","Titania's Song","Tivadar's Crusade","Tobias Andrion","Tolaria","Tor Wauki","Tormod's Crypt","Torsten Von Ursus","Touch of Darkness","Tourach's Chant","Tourach's Gate","Tower of Coireall","Tracker","Tranquility","Transmutation","Transmute Artifact","Triassic Egg","Triskelion","Tropical Island","Tsunami","Tuknir Deathlock","Tundra","Tundra Wolves","Tunnel","Twiddle","Two-Headed Giant of Foriys","Typhoon","Uncle Istvan","Underground Sea","Undertow","Underworld Dreams","Unholy Citadel","Unholy Strength","Unstable Mutation","Unsummon","Untamed Wilds","Ur-Drago","Urborg","Urza's Avenger","Urza's Chalice","Urza's Mine","Urza's Miter","Urza's Power Plant","Urza's Tower","Uthden Troll","Vaevictis Asmadi","Vampire Bats","Venarian Gold","Venom","Verduran Enchantress","Vesuvan Doppelganger","Veteran Bodyguard","Visions","Vodalian Knights","Vodalian Mage","Vodalian Soldiers","Vodalian War Machine","Volcanic Eruption","Volcanic Island","Voodoo Doll","Walking Dead","Wall of Air","Wall of Bone","Wall of Brambles","Wall of Caltrops","Wall of Dust","Wall of Earth","Wall of Fire","Wall of Heat","Wall of Ice","Wall of Light","Wall of Opposition","Wall of Putrid Flesh","Wall of Shadows","Wall of Spears","Wall of Stone","Wall of Swords","Wall of Tombstones","Wall of Vapor","Wall of Water","Wall of Wonder","Wall of Wood","Wand of Ith","Wanderlust","War Barge","War Elephant","War Mammoth","Warp Artifact","Water Elemental","Water Wurm","Weakness","Weakstone","Web","Wheel of Fortune","Whippoorwill","Whirling Dervish","White Knight","White Mana Battery","White Ward","Wild Growth","Will-o'-the-Wisp","Willow Satyr","Winds of Change","Winter Blast","Winter Orb","Witch Hunter","Wolverine Pack","Wood Elemental","Wooden Sphere","Word of Binding","Word of Command","Worms of the Earth","Wormwood Treefolk","Wrath of God","Wyluli Wolf","Xenic Poltergeist","Xira Arien","Yawgmoth Demon","Ydwen Efreet","Yotian Soldier","Zelyon Sword","Zephyr Falcon","Zombie Master"]'''))
NOMS_BASE_MIN = {n.lower() for n in NOMS_BASE}

DOSSIERS = [
    "/storage/emulated/0/Download", "/storage/emulated/0/Downloads",
    os.path.expanduser("~/storage/downloads"),   # Termux après `termux-setup-storage`
    os.path.expanduser("~/Downloads"), os.path.expanduser("~/Download"), os.getcwd(),
]
MOTIFS_CARTES = ["default-cards*.json*", "default_cards*.json*", "oracle-cards*.json*", "oracle_cards*.json*"]
MOTIFS_RULINGS = ["rulings*.json*"]


def plus_recent(dossier, motifs):
    trouves = [f for m in motifs for f in glob.glob(os.path.join(dossier, m))]
    return max(trouves, key=os.path.getmtime) if trouves else None


def trouver_fichiers():
    candidats = ([sys.argv[1]] if len(sys.argv) > 1 else []) + DOSSIERS
    for d in candidats:
        if not os.path.isdir(d):
            continue
        cartes, rulings = plus_recent(d, MOTIFS_CARTES), plus_recent(d, MOTIFS_RULINGS)
        if cartes and rulings:
            return d, cartes, rulings
    sys.exit("Fichiers introuvables : il me faut default-cards* ET rulings* (.json, .jsonl ou .jsonl.gz) dans l'un de ces dossiers :\n  "
             + "\n  ".join(candidats) + "\n(ou : python scryfall_filtre_mobile.py /dossier/qui/contient/les/deux)")


def ouvrir(chemin):
    """Ouvre en texte, en décompressant à la volée si le fichier est en .gz."""
    return gzip.open(chemin, "rt", encoding="utf-8") if chemin.lower().endswith(".gz") else open(chemin, encoding="utf-8")


def lignes_objets(chemin, etiquette):
    """Itère sur les objets JSON, UN PAR LIGNE (formats JSON de Scryfall avec crochets et virgules, ou JSON Lines)."""
    with ouvrir(chemin) as f:
        for i, ligne in enumerate(f, 1):
            if i % 50000 == 0:
                print(f"  {etiquette} : {i} lignes lues...", flush=True)
            ligne = ligne.strip().rstrip(",")
            if ligne in ("", "[", "]"):
                continue
            yield json.loads(ligne)


def texte_oracle(carte):
    if "oracle_text" in carte:
        return carte["oracle_text"]
    return "\n//\n".join(face.get("oracle_text", "") for face in carte.get("card_faces", []))


# ───────────────────────────── Programme ─────────────────────────────
print("scryfall_filtre_mobile — version 3", flush=True)
dossier, f_cartes, f_rulings = trouver_fichiers()
sortie = os.path.join(dossier, "scryfall-perimetre.json")
print(f"Dossier : {dossier}\n  cartes  : {os.path.basename(f_cartes)}\n  rulings : {os.path.basename(f_rulings)}", flush=True)
cartes, lus, par_set, par_nom = {}, 0, 0, 0
for c in lignes_objets(f_cartes, "cartes"):
    lus += 1
    if c.get("lang", "en") != "en":
        continue
    dans_set = c.get("set") in SETS
    dans_base = (c.get("name") or "").lower() in NOMS_BASE_MIN
    if not (dans_set or dans_base):
        continue
    oid = c.get("oracle_id") or c.get("card_faces", [{}])[0].get("oracle_id")
    if not oid:
        continue
    if oid not in cartes:
        par_set += 1 if dans_set else 0
        par_nom += 0 if dans_set else 1
    fiche = cartes.setdefault(oid, {
        "oracle_id": oid, "name": c.get("name"), "in_base": dans_base,
        "mana_cost": c.get("mana_cost", c.get("card_faces", [{}])[0].get("mana_cost", "")),
        "cmc": c.get("cmc"), "type_line": c.get("type_line"), "oracle_text": texte_oracle(c),
        "power": c.get("power"), "toughness": c.get("toughness"), "colors": c.get("colors", []),
        "keywords": c.get("keywords", []), "printings": [], "rulings": [],
    })
    if dans_set:  # on ne liste que les impressions du périmètre (les terrains de base en ont des centaines ailleurs)
        fiche["printings"].append({"set": c["set"], "collector_number": c.get("collector_number"), "rarity": c.get("rarity")})
print(f"{lus} lignes lues, {len(cartes)} cartes gardées ({par_set} reconnues par extension, {par_nom} par le nom seulement). Lecture des rulings...", flush=True)
for r in lignes_objets(f_rulings, "rulings"):
    fiche = cartes.get(r.get("oracle_id"))
    if fiche:
        fiche["rulings"].append({"date": r.get("published_at"), "comment": r.get("comment")})
resultat = sorted(cartes.values(), key=lambda x: x["name"] or "")
with open(sortie, "w", encoding="utf-8") as f:
    json.dump(resultat, f, ensure_ascii=False, indent=1)
trouves = {(x["name"] or "").lower() for x in resultat}
manquants = sorted(n for n in NOMS_BASE if n.lower() not in trouves)
print(f"TERMINÉ : {len(resultat)} cartes écrites dans {sortie} ({os.path.getsize(sortie) // 1024} Ko).")
print(f"Noms de la base introuvables chez Scryfall : {len(manquants)}" + (" -> " + "; ".join(manquants[:40]) if manquants else ""))
print("Envoie scryfall-perimetre.json à Claude.")

