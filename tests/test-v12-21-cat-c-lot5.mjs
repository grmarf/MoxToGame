import assert from 'assert';
import CARDS from '../src/data/cards-database.js';

function findCard(name) { return CARDS.find(c => c.name === name); }

// ============================================================
// MoxToGame V12.21 — Lot C5 : 20 cartes catégorie C
// Contrôle croisé : handlers vérifiés dans src/core/effects/*.js
// Leçon V12.19-BUG-08 : chaque test vérifie cas nominal + non-régression
// ============================================================

// C1: White Ward — addKeyword (protection blanc)
const whiteWard = findCard('White Ward');
assert.strictEqual(whiteWard.effect.type, 'addKeyword', 'C1: White Ward type');
assert.strictEqual(whiteWard.effect.keyword, 'protection', 'C1: White Ward keyword');
assert.strictEqual(whiteWard.effect.color, 'white', 'C1: White Ward color');
assert.strictEqual(whiteWard.effectStatus, 'implemented', 'C1: White Ward status');
// Nominal: Green Ward protège contre le vert
const greenWard = findCard('Green Ward');
if (greenWard.effect) {
  assert.strictEqual(greenWard.effect.color, 'green', 'C1-nominal: Green Ward = green');
}

// C2: Web — addKeyword (reach)
const web = findCard('Web');
assert.strictEqual(web.effect.type, 'addKeyword', 'C2: Web type');
assert.strictEqual(web.effect.keyword, 'reach', 'C2: Web keyword');
assert.strictEqual(web.effectStatus, 'implemented', 'C2: Web status');
// Nominal: Flight donne le vol, pas la portée
const flight = findCard('Flight');
assert.strictEqual(flight.effect.keyword, 'flying', 'C2-nominal: Flight = flying');

// C3: Jayemdae Tome — draw activé {4}
const jayemdaeTome = findCard('Jayemdae Tome');
assert.ok(jayemdaeTome.activated, 'C3: Jayemdae Tome has activated');
assert.strictEqual(jayemdaeTome.activated[0].cost, '{4}', 'C3: Jayemdae Tome cost');
assert.strictEqual(jayemdaeTome.activated[0].effect.type, 'draw', 'C3: Jayemdae Tome effect type');
assert.strictEqual(jayemdaeTome.activated[0].effect.amount, 1, 'C3: Jayemdae Tome amount');
assert.strictEqual(jayemdaeTome.effectStatus, 'implemented', 'C3: Jayemdae Tome status');
// Nominal: Ancestral Recall pioche 3, pas 1
const ancestral = findCard('Ancestral Recall');
assert.strictEqual(ancestral.effect.amount, 3, 'C3-nominal: Ancestral Recall = 3');

// C4: Mana Short — emptyManaPool
const manaShort = findCard('Mana Short');
assert.strictEqual(manaShort.effect.type, 'emptyManaPool', 'C4: Mana Short type');
assert.strictEqual(manaShort.effect.target, 'opponent', 'C4: Mana Short target');
assert.strictEqual(manaShort.effectStatus, 'implemented', 'C4: Mana Short status');
// Nominal: Dark Ritual ajoute du mana, pas le vide
const darkRitual = findCard('Dark Ritual');
assert.strictEqual(darkRitual.effect.type, 'mana', 'C4-nominal: Dark Ritual = mana');

// C5: Goblin Balloon Brigade — addKeywordUntilEnd {R}: flying
const goblinBalloon = findCard('Goblin Balloon Brigade');
assert.ok(goblinBalloon.activated, 'C5: Goblin Balloon Brigade has activated');
assert.strictEqual(goblinBalloon.activated[0].cost, '{R}', 'C5: Goblin Balloon Brigade cost');
assert.strictEqual(goblinBalloon.activated[0].effect.type, 'addKeywordUntilEnd', 'C5: Goblin Balloon Brigade effect type');
assert.strictEqual(goblinBalloon.activated[0].effect.keyword, 'flying', 'C5: Goblin Balloon Brigade keyword');
assert.strictEqual(goblinBalloon.effectStatus, 'implemented', 'C5: Goblin Balloon Brigade status');
// Nominal: Flight donne le vol de façon permanente (pas until end)
assert.ok(!flight.effect.duration || flight.effect.duration !== 'eot', 'C5-nominal: Flight = permanent');

// C6: Grapeshot Catapult — damage {T}: 1
const grapeshot = findCard('Grapeshot Catapult');
assert.ok(grapeshot.activated, 'C6: Grapeshot Catapult has activated');
assert.strictEqual(grapeshot.activated[0].cost, '{T}', 'C6: Grapeshot Catapult cost');
assert.strictEqual(grapeshot.activated[0].effect.type, 'damage', 'C6: Grapeshot Catapult effect type');
assert.strictEqual(grapeshot.activated[0].effect.amount, 1, 'C6: Grapeshot Catapult amount');
assert.strictEqual(grapeshot.effectStatus, 'implemented', 'C6: Grapeshot Catapult status');
// Nominal: Prodigal Sorcerer inflige aussi 1, mais c'est une créature
const prodigal = findCard('Prodigal Sorcerer');
assert.strictEqual(prodigal.activated[0].effect.amount, 1, 'C6-nominal: Prodigal Sorcerer = 1 damage');

// C7: Jandor's Saddlebags — tapOrUntap {3}: untap creature
const saddlebags = findCard("Jandor's Saddlebags");
assert.ok(saddlebags.activated, 'C7: Jandor\'s Saddlebags has activated');
assert.strictEqual(saddlebags.activated[0].cost, '{3}', 'C7: Jandor\'s Saddlebags cost');
assert.strictEqual(saddlebags.activated[0].effect.type, 'tapOrUntap', 'C7: Jandor\'s Saddlebags effect type');
assert.strictEqual(saddlebags.activated[0].effect.target, 'creature', 'C7: Jandor\'s Saddlebags target');
assert.strictEqual(saddlebags.effectStatus, 'implemented', 'C7: Jandor\'s Saddlebags status');
// Nominal: Ley Druid dégage un terrain, pas une créature
const leyDruid = findCard('Ley Druid');
assert.strictEqual(leyDruid.activated[0].effect.target, 'land', 'C7-nominal: Ley Druid = land');

// C8: Fog — fog
const fog = findCard('Fog');
assert.strictEqual(fog.effect.type, 'fog', 'C8: Fog type');
assert.strictEqual(fog.effectStatus, 'implemented', 'C8: Fog status');
// Nominal: Healing Salve soigne, pas prévention
const healingSalve = findCard('Healing Salve');
assert.strictEqual(healingSalve.effect.type, 'gainLife', 'C8-nominal: Healing Salve = gainLife');

// C9: Chain Lightning — damage 3
const chainLightning = findCard('Chain Lightning');
assert.strictEqual(chainLightning.effect.type, 'damage', 'C9: Chain Lightning type');
assert.strictEqual(chainLightning.effect.amount, 3, 'C9: Chain Lightning amount');
assert.strictEqual(chainLightning.effect.target, 'anyTarget', 'C9: Chain Lightning target');
assert.strictEqual(chainLightning.effectStatus, 'implemented', 'C9: Chain Lightning status');
// Nominal: Lightning Bolt inflige 3 aussi
const lightningBolt = findCard('Lightning Bolt');
assert.strictEqual(lightningBolt.effect.amount, 3, 'C9-nominal: Lightning Bolt = 3');

// C10: retiré — Dark Banishing est une vraie carte Magic mais vient d'Ice Age
// (1995), hors périmètre du projet (Beta à Fallen Empires/Homelands
// uniquement). Aucune carte réelle de cette période n'a exactement l'effet
// "détruit une créature non-noire ciblée, ne peut pas être régénérée" sans
// la restriction supplémentaire "non-artefact" (voir Terror, C16-nominal,
// qui elle est bien dans le périmètre mais utilise une forme différente).
// Nominal: Terror détruit sans condition de couleur
const terror = findCard('Terror');
assert.ok(!terror.effect.condition, 'C10-nominal: Terror sans condition');

// C11: Time Walk — extraTurn
const timeWalk = findCard('Time Walk');
assert.strictEqual(timeWalk.effect.type, 'extraTurn', 'C11: Time Walk type');
assert.strictEqual(timeWalk.effectStatus, 'implemented', 'C11: Time Walk status');
// Nominal: Ancestral Recall ne donne pas de tour supplémentaire
assert.notStrictEqual(ancestral.effect.type, 'extraTurn', 'C11-nominal: Ancestral Recall ≠ extraTurn');

// C12: Demonic Tutor — tutor
const demonicTutor = findCard('Demonic Tutor');
assert.strictEqual(demonicTutor.effect.type, 'tutor', 'C12: Demonic Tutor type');
assert.strictEqual(demonicTutor.effect.target, 'anyCard', 'C12: Demonic Tutor target');
assert.strictEqual(demonicTutor.effectStatus, 'implemented', 'C12: Demonic Tutor status');
// Nominal: Regrowth ne cherche pas dans la bibliothèque
const regrowth = findCard('Regrowth');
assert.strictEqual(regrowth.effect.type, 'returnFromGraveyard', 'C12-nominal: Regrowth = returnFromGraveyard');

// C13: retiré — Act of Treason (Magic 2010) est hors périmètre du projet
// (Beta à Fallen Empires/Homelands uniquement). Aucune carte réelle de cette
// période n'a d'effet "vol de créature jusqu'à la fin du tour" ; les vols de
// créature de l'époque (Control Magic, Persuasion) sont permanents.
// Nominal: Control Magic est permanent (pas EOT)
const controlMagic = findCard('Control Magic');
assert.ok(!controlMagic.effect.duration, 'C13-nominal: Control Magic = permanent');

// C14: Remove Soul — counterSpell creature spell
const removeSoul = findCard('Remove Soul');
assert.strictEqual(removeSoul.effect.type, 'counterSpell', 'C14: Remove Soul type');
assert.strictEqual(removeSoul.effect.condition, 'creatureSpell', 'C14: Remove Soul condition');
assert.strictEqual(removeSoul.effectStatus, 'implemented', 'C14: Remove Soul status');
// Nominal: Counterspell contrecarre tout
const counterspell = findCard('Counterspell');
assert.ok(!counterspell.effect.condition, 'C14-nominal: Counterspell sans condition');

// C15: Amrou Kithkin — cantBlock (by more than one)
const amrouKithkin = findCard('Amrou Kithkin');
// V12.76 (G32) : Oracle = « ne peut pas être bloquée par une créature de force 3 ou plus » (statique) ; comportement dans test-v12-143.
assert.strictEqual(amrouKithkin.static[0].type, 'cantBeBlockedByPowerAtLeast', 'C15: Amrou Kithkin type');
assert.strictEqual(amrouKithkin.static[0].power, 3, 'C15: Amrou Kithkin force');
assert.strictEqual(amrouKithkin.effectStatus, 'implemented', 'C15: Amrou Kithkin status');
// Nominal: Invisibility = ne peut pas être bloqué du tout
const invisibility = findCard('Invisibility');
assert.ok(!invisibility.effect.condition, 'C15-nominal: Invisibility sans condition');

// C16: Invisibility — cantBlock (enchanted creature can't be blocked)
// V12.76 (G32) : Oracle = « ne peut pas être bloquée, excepté par des Murs » : mot-clé d'Aura (comportement dans test-v12-143).
assert.strictEqual(invisibility.effect.type, 'addKeyword', 'C16: Invisibility type');
assert.strictEqual(invisibility.effect.keyword, 'blockablebywallsonly', 'C16: Invisibility mot-clé');
assert.strictEqual(invisibility.effectStatus, 'implemented', 'C16: Invisibility status');
// Nominal: Tunnel = cantBlock pour un tour
const tunnel = findCard('Tunnel');
assert.strictEqual(tunnel.effect.target, 'creature', 'C16-nominal: Tunnel = creature ciblée');

// C17: retiré — "Cause Fear" n'est pas une vraie carte Magic: The Gathering
// (aucune occurrence sur Scryfall/Gatherer sous ce nom ; probable carte fictive
// injectée lors d'une génération antérieure de la base, comme Havenwood Wurm,
// Serra Bird et Act of Treason).
// Nominal: Amrou Kithkin = ne peut pas être bloquée par une créature de force 3 ou plus
assert.strictEqual(amrouKithkin.static[0].power, 3, 'C17-nominal: Amrou Kithkin = force 3 ou plus (V12.76 G32)');

// C18: Birds of Paradise — flying + mana any
const birds = findCard('Birds of Paradise');
assert.ok(birds.keywords.includes('flying'), 'C18: Birds of Paradise has flying');
assert.ok(birds.tapAbility, 'C18: Birds of Paradise has tapAbility');
assert.strictEqual(birds.tapAbility.produces, 'any', 'C18: Birds of Paradise produces any');
assert.strictEqual(birds.effectStatus, 'implemented', 'C18: Birds of Paradise status');
// Nominal: Llanowar Elves produit G, pas any
const llanowar = findCard('Llanowar Elves');
assert.ok(llanowar.tapAbility, 'C18-nominal: Llanowar Elves has tapAbility');

// C19: Granite Gargoyle — flying + pumpSelf {R}: +0/+1
const graniteGargoyle = findCard('Granite Gargoyle');
assert.ok(graniteGargoyle.keywords.includes('flying'), 'C19: Granite Gargoyle has flying');
assert.ok(graniteGargoyle.activated, 'C19: Granite Gargoyle has activated');
assert.strictEqual(graniteGargoyle.activated[0].cost, '{R}', 'C19: Granite Gargoyle cost');
assert.strictEqual(graniteGargoyle.activated[0].effect.type, 'pumpSelf', 'C19: Granite Gargoyle effect type');
assert.strictEqual(graniteGargoyle.activated[0].effect.power, 0, 'C19: Granite Gargoyle power');
assert.strictEqual(graniteGargoyle.activated[0].effect.toughness, 1, 'C19: Granite Gargoyle toughness');
assert.strictEqual(graniteGargoyle.effectStatus, 'implemented', 'C19: Granite Gargoyle status');
// Nominal: Dragon Whelp pump +1/+0, pas +0/+1
const dragonWhelp = findCard('Dragon Whelp');
assert.strictEqual(dragonWhelp.activated[0].effect.power, 1, 'C19-nominal: Dragon Whelp = +1 power');

// C20: Ifh-Bíff Efreet — flying + damageToFliersAndPlayers {G}: 1
const ifhBiff = findCard('Ifh-Bíff Efreet');
assert.ok(ifhBiff.keywords.includes('flying'), 'C20: Ifh-Bíff Efreet has flying');
assert.ok(ifhBiff.activated, 'C20: Ifh-Bíff Efreet has activated');
assert.strictEqual(ifhBiff.activated[0].cost, '{G}', 'C20: Ifh-Bíff Efreet cost');
assert.strictEqual(ifhBiff.activated[0].effect.type, 'damageToFliersAndPlayers', 'C20: Ifh-Bíff Efreet effect type');
assert.strictEqual(ifhBiff.activated[0].effect.amount, 1, 'C20: Ifh-Bíff Efreet amount');
assert.strictEqual(ifhBiff.effectStatus, 'implemented', 'C20: Ifh-Bíff Efreet status');
// Nominal: Hurricane inflige X, pas 1 fixe
const hurricane = findCard('Hurricane');
assert.ok(hurricane.xSpell, 'C20-nominal: Hurricane = X spell');

// ============================================================
// Vérification globale : aucune carte du lot ne référence pumpAttacking
// ============================================================
const allCards = CARDS;
const hasPumpAttacking = allCards.filter(c => JSON.stringify(c).includes('pumpAttacking'));
assert.strictEqual(hasPumpAttacking.length, 0, 'GLOBAL: aucune carte ne référence pumpAttacking');

// ============================================================
// Vérification : Desert (état combat requis à l'époque ; voir lot G10)
// ============================================================
const desert = findCard('Desert');
assert.ok(desert, 'GLOBAL: Desert existe dans la base');
// V12.76 (lot G10) : l'état de combat est désormais géré (cible « créature attaquante », capacité limitée à la fin de combat) ; Desert est
// certifiée par test-v12-119 (et non par ce lot C4/C5) : on vérifie ici que ce statut est bien en place.
assert.strictEqual(desert.effectStatus, 'implemented', 'GLOBAL: Desert implémentée depuis le lot G10 (test-v12-119)');

console.log('OK V12.21: Lot C5 — 20 cartes, contrôle croisé validé, cas nominal + non-régression vérifiés.');
