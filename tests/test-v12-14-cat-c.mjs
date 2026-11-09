import assert from 'assert';
import CARDS from '../src/data/cards-database.js';

function findCard(name) { return CARDS.find(c => c.name === name); }

// C1: Lightning Bolt = damage 3
const bolt = findCard('Lightning Bolt');
assert.strictEqual(bolt.effect.type, 'damage', 'C1: Lightning Bolt type');
assert.strictEqual(bolt.effect.amount, 3, 'C1: Lightning Bolt amount');
assert.strictEqual(bolt.effectStatus, 'implemented', 'C1: Lightning Bolt status');

// C2: Giant Growth = pump +3/+3
const growth = findCard('Giant Growth');
assert.strictEqual(growth.effect.type, 'pump', 'C2: Giant Growth type');
assert.strictEqual(growth.effect.power, 3, 'C2: Giant Growth power');
assert.strictEqual(growth.effect.toughness, 3, 'C2: Giant Growth toughness');

// C3: Healing Salve = gainLife 3
const salve = findCard('Healing Salve');
assert.strictEqual(salve.effect.type, 'gainLife', 'C3: Healing Salve type');
assert.strictEqual(salve.effect.amount, 3, 'C3: Healing Salve amount');

// C4: Dark Ritual = mana BBB
const ritual = findCard('Dark Ritual');
assert.strictEqual(ritual.effect.type, 'mana', 'C4: Dark Ritual type');

// C5: Shatter = destroy artifact
const shatter = findCard('Shatter');
assert.strictEqual(shatter.effect.type, 'destroy', 'C5: Shatter type');

// C6: Wrath of God = destroyAllCreatures
const wrath = findCard('Wrath of God');
assert.strictEqual(wrath.effect.type, 'destroyAllCreatures', 'C6: Wrath of God type');

// C7: Armageddon = destroyAllLands
const armageddon = findCard('Armageddon');
assert.strictEqual(armageddon.effect.type, 'destroyAllLands', 'C7: Armageddon type');

// C8: Counterspell = counterSpell
const counter = findCard('Counterspell');
assert.strictEqual(counter.effect.type, 'counterSpell', 'C8: Counterspell type');

// C9: Icy Manipulator = activated tapTarget
const icy = findCard('Icy Manipulator');
assert.ok(icy.activated, 'C9: Icy Manipulator has activated');
assert.strictEqual(icy.activated[0].effect.type, 'tapTarget', 'C9: Icy Manipulator effect type');

// C10: Sol Ring = activated mana CC
const sol = findCard('Sol Ring');
assert.ok(sol.activated, 'C10: Sol Ring has activated');
assert.strictEqual(sol.activated[0].effect.type, 'mana', 'C10: Sol Ring effect type');
assert.ok(sol.activated[0].effect.amount.includes('C'), 'C10: Sol Ring produces C');

// C11: Bad Moon = static anthem B
const moon = findCard('Bad Moon');
assert.ok(moon.static, 'C11: Bad Moon has static');
const moonStatic = moon.static.type || moon.static[0]?.type;
assert.strictEqual(moonStatic, 'anthem', 'C11: Bad Moon static type');

// C12: Crusade = static anthem W
const crusade = findCard('Crusade');
assert.ok(crusade.static, 'C12: Crusade has static');
const crusadeStatic = crusade.static.type || crusade.static[0]?.type;
assert.strictEqual(crusadeStatic, 'anthem', 'C12: Crusade static type');

// C13: Ancestral Recall = draw 3
const recall = findCard('Ancestral Recall');
assert.strictEqual(recall.effect.type, 'drawTarget', 'C13: Ancestral Recall type (joueur ciblé — Oracle « Target player draws three cards »)');
assert.strictEqual(recall.effect.amount, 3, 'C13: Ancestral Recall amount');

// C14: Abu Ja'far = death trigger destroy
const abu = findCard("Abu Ja'far");
assert.ok(abu.triggers, "C14: Abu Ja'far has triggers");
assert.strictEqual(abu.triggers[0].event, 'creatureDied', "C14: Abu Ja'far event");

// C15: Disenchant = destroy
const disenchant = findCard('Disenchant');
assert.strictEqual(disenchant.effect.type, 'destroy', 'C15: Disenchant type');

// C16: Howling Mine = trigger drawStepStarted
const mine = findCard('Howling Mine');
assert.ok(mine.triggers, 'C16: Howling Mine has triggers');
assert.strictEqual(mine.triggers[0].event, 'drawStepStarted', 'C16: Howling Mine event');

// C17: Terror = destroy creature
const terror = findCard('Terror');
assert.strictEqual(terror.effect.type, 'destroy', 'C17: Terror type');

// C18: Sinkhole = destroy land
const sinkhole = findCard('Sinkhole');
assert.strictEqual(sinkhole.effect.type, 'destroy', 'C18: Sinkhole type');

// C19: Unsummon = bounce creature
const unsummon = findCard('Unsummon');
assert.strictEqual(unsummon.effect.type, 'bounce', 'C19: Unsummon type');

// C20: Hymn to Tourach = discard 2 opponent au hasard (Fallen Empires, remplace
// Mind Rot qui est en réalité une carte Fourth Edition, hors périmètre)
const hymn = findCard('Hymn to Tourach');
assert.strictEqual(hymn.effect.type, 'discardRandom', 'C20: Hymn to Tourach type');
assert.strictEqual(hymn.effect.amount, 2, 'C20: Hymn to Tourach amount');

console.log('OK: Catégorie C — 20 cartes du lot 1 vérifiées.');
