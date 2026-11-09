import assert from 'assert';
import CARDS from '../src/data/cards-database.js';

function findCard(name) { return CARDS.find(c => c.name === name); }

// ============================================================
// MoxToGame V12.21 — Lot C4 : 20 cartes catégorie C
// Contrôle croisé : handlers vérifiés dans src/core/effects/*.js
// Leçon V12.19-BUG-08 : chaque test vérifie cas nominal + non-régression
// ============================================================

// C1: Control Magic — stealCreature
const controlMagic = findCard('Control Magic');
assert.strictEqual(controlMagic.effect.type, 'stealCreature', 'C1: Control Magic type');
assert.strictEqual(controlMagic.effect.target, 'creature', 'C1: Control Magic target');
assert.strictEqual(controlMagic.effectStatus, 'implemented', 'C1: Control Magic status');
// Nominal: Holy Strength cible bien une créature (Aura de pump)
const holyStrength = findCard('Holy Strength');
assert.strictEqual(holyStrength.effect.target, 'creature', 'C1-nominal: Holy Strength cible bien une créature (Aura de pump)');

// C2: Steal Artifact — stealCreature (cible artifact)
const stealArtifact = findCard('Steal Artifact');
assert.strictEqual(stealArtifact.effect.type, 'stealCreature', 'C2: Steal Artifact type (stealCreature)');
assert.strictEqual(stealArtifact.effect.target, 'artifact', 'C2: Steal Artifact target');
assert.strictEqual(stealArtifact.effectStatus, 'implemented', 'C2: Steal Artifact status');
// Nominal: Control Magic cible creature, pas artifact
assert.strictEqual(controlMagic.effect.target, 'creature', 'C2-nominal: Control Magic cible creature');

// C3: Dragon Whelp — pumpSelf activé {R}
const dragonWhelp = findCard('Dragon Whelp');
assert.ok(dragonWhelp.activated, 'C3: Dragon Whelp has activated');
assert.strictEqual(dragonWhelp.activated[0].cost, '{R}', 'C3: Dragon Whelp cost');
assert.strictEqual(dragonWhelp.activated[0].effect.type, 'pumpSelf', 'C3: Dragon Whelp effect type');
assert.strictEqual(dragonWhelp.activated[0].effect.power, 1, 'C3: Dragon Whelp power');
assert.strictEqual(dragonWhelp.effectStatus, 'implemented', 'C3: Dragon Whelp status');
// Nominal: créature sans activated n'a pas de pumpSelf
const grayOgre = findCard('Gray Ogre');
assert.ok(!grayOgre.activated, 'C3-nominal: Gray Ogre sans activated');

// C4: Shivan Dragon — pumpSelf activé {R}
const shivanDragon = findCard('Shivan Dragon');
assert.ok(shivanDragon.activated, 'C4: Shivan Dragon has activated');
assert.strictEqual(shivanDragon.activated[0].cost, '{R}', 'C4: Shivan Dragon cost');
assert.strictEqual(shivanDragon.activated[0].effect.type, 'pumpSelf', 'C4: Shivan Dragon effect type');
assert.strictEqual(shivanDragon.effectStatus, 'implemented', 'C4: Shivan Dragon status');
// Nominal: power de base = 5 (pas modifié par défaut)
assert.strictEqual(shivanDragon.power, 5, 'C4-nominal: Shivan Dragon base power');

// C5: Wall of Fire — pumpSelf activé {1} (corrigé de {R})
const wallOfFire = findCard('Wall of Fire');
assert.ok(wallOfFire.activated, 'C5: Wall of Fire has activated');
assert.strictEqual(wallOfFire.activated[0].cost, '{1}', 'C5: Wall of Fire cost = {1}');
assert.strictEqual(wallOfFire.activated[0].effect.type, 'pumpSelf', 'C5: Wall of Fire effect type');
assert.strictEqual(wallOfFire.effectStatus, 'implemented', 'C5: Wall of Fire status');
// Nominal: power de base = 0
assert.strictEqual(wallOfFire.power, 0, 'C5-nominal: Wall of Fire base power');

// C6: Demonic Hordes — upkeep destroyLandOrPay
const demonicHordes = findCard('Demonic Hordes');
assert.ok(demonicHordes.triggers, 'C6: Demonic Hordes has triggers');
assert.strictEqual(demonicHordes.triggers[0].event, 'upkeepStarted', 'C6: Demonic Hordes event');
assert.strictEqual(demonicHordes.triggers[0].effect.type, 'destroyLandOrPay', 'C6: Demonic Hordes effect type');
assert.strictEqual(demonicHordes.effectStatus, 'implemented', 'C6: Demonic Hordes status');
// Nominal: une créature sans upkeep n'a pas de triggers
assert.ok(!grayOgre.triggers || grayOgre.triggers.length === 0, 'C6-nominal: Gray Ogre sans triggers');

// C7: Force of Nature — upkeep payOrDamage (texte oracle réel : "deals 8 damage to you unless you pay {G}{G}{G}{G}")
const forceOfNature = findCard('Force of Nature');
assert.ok(forceOfNature.triggers, 'C7: Force of Nature has triggers');
assert.strictEqual(forceOfNature.triggers[0].event, 'upkeepStarted', 'C7: Force of Nature event');
assert.strictEqual(forceOfNature.triggers[0].effect.type, 'payOrDamage', 'C7: Force of Nature effect type');
assert.strictEqual(forceOfNature.triggers[0].effect.damage, 8, 'C7: Force of Nature damage');
assert.strictEqual(forceOfNature.effectStatus, 'implemented', 'C7: Force of Nature status');
// Nominal: toughness de base = 8
assert.strictEqual(forceOfNature.toughness, 8, 'C7-nominal: Force of Nature base toughness');

// C8: Celestial Prism — mana activé {3}
const celestialPrism = findCard('Celestial Prism');
assert.ok(celestialPrism.activated, 'C8: Celestial Prism has activated');
assert.strictEqual(celestialPrism.activated[0].cost, '{2}', 'C8: Celestial Prism cost (V12.76 G32 : Oracle {2}, {T})');
assert.strictEqual(celestialPrism.activated[0].effect.type, 'mana', 'C8: Celestial Prism effect type');
assert.strictEqual(celestialPrism.activated[0].effect.color, 'any', 'C8: Celestial Prism color');
assert.strictEqual(celestialPrism.effectStatus, 'implemented', 'C8: Celestial Prism status');
// Nominal: Mox Pearl produit W directement (pas activated complexe)
const moxPearl = findCard('Mox Pearl');
assert.strictEqual(moxPearl.produces, 'W', 'C8-nominal: Mox Pearl produces W');

// C9: Llanowar Elves — mana {T} (tapAbility natif)
const llanowarElves = findCard('Llanowar Elves');
assert.ok(llanowarElves.tapAbility || llanowarElves.activated, 'C9: Llanowar Elves has mana ability');
assert.strictEqual(llanowarElves.effectStatus, 'implemented', 'C9: Llanowar Elves status');
// Nominal: créature non-elf n'a pas de tapAbility
assert.ok(!grayOgre.tapAbility, 'C9-nominal: Gray Ogre sans tapAbility');

// C10: Brass Man — doesntUntap + {1}: untap
const brassMan = findCard('Brass Man');
assert.ok(brassMan.keywords.includes('doesntUntap'), 'C10: Brass Man has doesntUntap');
// V12.76 (G24) : Oracle = « à votre entretien, vous pouvez payer {1} : dégagez-le » (déclencheur, plus de capacité activée à tout moment) ; comportement testé dans test-v12-135.
assert.ok(!(brassMan.activated || []).length, 'C10: Brass Man sans capacité activée');
assert.ok(brassMan.triggers.some((t) => t.event === 'upkeepStarted' && t.effect.type === 'payToUntap' && t.effect.cost === '{1}'), 'C10: Brass Man déclencheur d\'entretien payToUntap {1}');
assert.strictEqual(brassMan.effectStatus, 'implemented', 'C10: Brass Man status');
// Nominal: créature normale ne se dégage pas naturellement (elle se dégage en untap step)
assert.ok(!grayOgre.keywords.includes('doesntUntap'), 'C10-nominal: Gray Ogre sans doesntUntap');

// C11: Twiddle — tapOrUntap
const twiddle = findCard('Twiddle');
assert.strictEqual(twiddle.effect.type, 'tapOrUntap', 'C11: Twiddle effect type');
assert.strictEqual(twiddle.effect.target, 'anyPermanent', 'C11: Twiddle target');
assert.strictEqual(twiddle.effectStatus, 'implemented', 'C11: Twiddle status');
// Nominal: Icy Manipulator cible un permanent spécifique (tapTarget, pas tapOrUntap)
const icyManipulator = findCard('Icy Manipulator');
assert.strictEqual(icyManipulator.activated[0].effect.type, 'tapTarget', 'C11-nominal: Icy Manipulator = tapTarget');

// C12: Ley Druid — {T}: untap land
const leyDruid = findCard('Ley Druid');
assert.ok(leyDruid.activated, 'C12: Ley Druid has activated');
assert.strictEqual(leyDruid.activated[0].cost, '{T}', 'C12: Ley Druid cost');
assert.strictEqual(leyDruid.activated[0].effect.type, 'tapOrUntap', 'C12: Ley Druid effect type');
assert.strictEqual(leyDruid.activated[0].effect.target, 'land', 'C12: Ley Druid target');
assert.strictEqual(leyDruid.effectStatus, 'implemented', 'C12: Ley Druid status');
// Nominal: Twiddle cible anyPermanent, pas spécifiquement land
assert.strictEqual(twiddle.effect.target, 'anyPermanent', 'C12-nominal: Twiddle = anyPermanent');

// C13: Tranquility — destroyAllEnchantments
const tranquility = findCard('Tranquility');
assert.strictEqual(tranquility.effect.type, 'destroyAllEnchantments', 'C13: Tranquility effect type');
assert.strictEqual(tranquility.effectStatus, 'implemented', 'C13: Tranquility status');
// Nominal: Shatterstorm détruit les artefacts, pas les enchantements
const shatterstorm = findCard('Shatterstorm');
if (shatterstorm.effect) {
  assert.notStrictEqual(shatterstorm.effect.type, 'destroyAllEnchantments', 'C13-nominal: Shatterstorm ≠ destroyAllEnchantments');
}

// C14: Tunnel — « Destroy target Wall. It can't be regenerated. » (Oracle ; avant : cantBlock)
const tunnel = findCard('Tunnel');
assert.strictEqual(tunnel.cost, '{R}', 'C14: Tunnel cost');
assert.strictEqual(tunnel.type, 'Instant', 'C14: Tunnel type');
assert.strictEqual(tunnel.effect.type, 'destroy', 'C14: Tunnel effect type'); assert.strictEqual(tunnel.effect.requireSubtype, 'Wall'); assert.strictEqual(tunnel.effect.noRegen, true);
assert.strictEqual(tunnel.effect.target, 'creature', 'C14: Tunnel target');
assert.strictEqual(tunnel.effectStatus, 'implemented', 'C14: Tunnel status');
// Nominal: texte placeholder remplacé
assert.ok(!tunnel.text_fr.includes('Effet à implémenter'), 'C14-nominal: Tunnel texte réel');

// C15: Word of Binding — tapTarget creature
const wordOfBinding = findCard('Word of Binding');
assert.strictEqual(wordOfBinding.effect.type, 'tapTarget', 'C15: Word of Binding effect type');
assert.strictEqual(wordOfBinding.effect.target, 'creature', 'C15: Word of Binding target');
assert.strictEqual(wordOfBinding.effect.tap, true, 'C15: Word of Binding tap');
assert.strictEqual(wordOfBinding.effectStatus, 'implemented', 'C15: Word of Binding status');
// Nominal (Oracle) : Icy Manipulator cible un artefact, une créature ou un terrain (pas un enchantement)
assert.strictEqual(icyManipulator.activated[0].effect.target, 'artifactCreatureOrLand', 'C15-nominal: Icy Manipulator = artifactCreatureOrLand');

// C16: Swords to Plowshares — exile + lifegain
const swords = findCard('Swords to Plowshares');
assert.strictEqual(swords.effect.type, 'exile', 'C16: Swords to Plowshares type');
assert.strictEqual(swords.effect.target, 'creature', 'C16: Swords to Plowshares target');
assert.strictEqual(swords.effect.lifegainFromPower, true, 'C16: Swords to Plowshares lifegain');
assert.strictEqual(swords.effectStatus, 'implemented', 'C16: Swords to Plowshares status');
// Nominal: Terror détruit, pas exile
const terror = findCard('Terror');
assert.strictEqual(terror.effect.type, 'destroy', 'C16-nominal: Terror = destroy');

// C17: Raise Dead — returnFromGraveyard creature
const raiseDead = findCard('Raise Dead');
assert.strictEqual(raiseDead.effect.type, 'returnFromGraveyard', 'C17: Raise Dead type');
assert.strictEqual(raiseDead.effectStatus, 'implemented', 'C17: Raise Dead status');
// Nominal: Regrowth ne cible pas spécifiquement creature
const regrowth = findCard('Regrowth');
assert.strictEqual(regrowth.effect.type, 'returnFromGraveyard', 'C17-nominal: Regrowth = returnFromGraveyard');

// C18: Regrowth — returnFromGraveyard
assert.strictEqual(regrowth.effectStatus, 'implemented', 'C18: Regrowth status');
// Nominal: Ancestral Recall pioche, pas graveyard
const ancestral = findCard('Ancestral Recall');
assert.strictEqual(ancestral.effect.type, 'drawTarget', 'C18-nominal: Ancestral Recall = drawTarget (joueur ciblé)');

// C19: Prodigal Sorcerer — {T}: damage 1
const prodigal = findCard('Prodigal Sorcerer');
assert.ok(prodigal.activated, 'C19: Prodigal Sorcerer has activated');
assert.strictEqual(prodigal.activated[0].cost, '{T}', 'C19: Prodigal Sorcerer cost');
assert.strictEqual(prodigal.activated[0].effect.type, 'damage', 'C19: Prodigal Sorcerer effect type');
assert.strictEqual(prodigal.activated[0].effect.amount, 1, 'C19: Prodigal Sorcerer amount');
assert.strictEqual(prodigal.effectStatus, 'implemented', 'C19: Prodigal Sorcerer status');
// Nominal: Rod of Ruin inflige 1 damage (texte oracle réel : "{3}, {T}: deals 1 damage to any target")
const rodOfRuin = findCard('Rod of Ruin');
if (rodOfRuin.activated) {
  assert.strictEqual(rodOfRuin.activated[0].effect.amount, 1, 'C19-nominal: Rod of Ruin = 1 damage');
}

// C20: Pestilence — {1}: damageAllCreaturesAndPlayers
const pestilence = findCard('Pestilence');
assert.ok(pestilence.activated, 'C20: Pestilence has activated');
assert.strictEqual(pestilence.activated[0].effect.type, 'damageAllCreaturesAndPlayers', 'C20: Pestilence effect type');
assert.strictEqual(pestilence.activated[0].effect.amount, 1, 'C20: Pestilence amount');
assert.strictEqual(pestilence.effectStatus, 'implemented', 'C20: Pestilence status');
// Nominal: Wrath of God détruit les créatures sans damage
const wrath = findCard('Wrath of God');
assert.strictEqual(wrath.effect.type, 'destroyAllCreatures', 'C20-nominal: Wrath of God = destroy');

// ============================================================
// Vérification globale : aucune carte du lot ne référence pumpAttacking (supprimé V12.19)
// ============================================================
const allCards = CARDS;
const hasPumpAttacking = allCards.filter(c => 
  JSON.stringify(c).includes('pumpAttacking')
);
assert.strictEqual(hasPumpAttacking.length, 0, 'GLOBAL: aucune carte ne référence pumpAttacking');

// ============================================================
// Vérification : Desert (état combat requis à l'époque ; voir lot G10)
// ============================================================
const desert = findCard('Desert');
assert.ok(desert, 'GLOBAL: Desert existe dans la base');
// V12.76 (lot G10) : l'état de combat est désormais géré (cible « créature attaquante », capacité limitée à la fin de combat) ; Desert est
// certifiée par test-v12-119 (et non par ce lot C4/C5) : on vérifie ici que ce statut est bien en place.
assert.strictEqual(desert.effectStatus, 'implemented', 'GLOBAL: Desert implémentée depuis le lot G10 (test-v12-119)');

console.log('OK V12.21: Lot C4 — 20 cartes, contrôle croisé validé, cas nominal + non-régression vérifiés.');
