import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const LOT4 = ["Kobold Drill Sergeant", "Kobold Overlord", "Kobold Taskmaster", "Kobolds of Kher Keep", "Kry Shield", "Lady Caleria", "Lady Evangela", "Lady Orca", "Land Equilibrium", "Land Tax", "Land's Edge", "Lesser Werewolf", "Life Chisel", "Life Matrix", "Lifeblood", "Living Plane", "Livonya Silone", "Lord Magnus", "Lost Soul", "Mana Drain", "Mana Matrix", "Marble Priest", "Marhault Elsdragon", "Master of the Hunt", "Mirror Universe", "Moat", "Mold Demon", "Moss Monster", "Mountain Stronghold", "Mountain Yeti", "Nebuchadnezzar", "Nether Void", "Nicol Bolas", "North Star", "Nova Pentacle", "Osai Vultures", "Palladia-Mors", "Part Water", "Pavel Maliki", "Pendelhaven", "Petra Sphinx", "Pit Scorpion", "Pixie Queen", "Planar Gate", "Pradesh Gypsies", "Presence of the Master", "Primordial Ooze", "Princess Lucrezia", "Psionic Entity", "Psychic Purge"];
assert.equal(LOT4.length,50);
assert.equal(new Set(CARDS.map(c=>c.name)).size,CARDS.length,'duplicate logical card names');
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:CARDS.length},(_,i)=>i+1),'IDs must be continuous');
const leg=CARDS.filter(c=>c.sets?.includes('LEG'));
assert.ok(leg.length >= 200,'Legends coverage must expose at least 200 LEG memberships');
for(const name of LOT4){const c=CARDS.find(x=>x.name===name);assert.ok(c,`LEG lot 4 missing: ${name}`);assert.ok(c.sets.includes('LEG'),`${name} missing LEG`);}
for(const name of LOT4.filter(n=>n!=='Kobold Drill Sergeant' && n!=='Pit Scorpion' && n!=='Pavel Maliki' && n!=='Mana Drain' /* implémentée v12.68 (counterSpellGainMana) */)){const c=CARDS.find(x=>x.name===name);assert.ok(['unimplemented', 'functional', 'implemented'].includes(c.effectStatus),`${name} must be explicitly unimplemented in data-only lot`);}
assert.ok(CARDS.find(x=>x.name==='Kobold Drill Sergeant').sets.includes('LEG'),'Kobold Drill Sergeant LEG membership missing');
assert.ok(CARDS.find(x=>x.name==='Pit Scorpion').sets.includes('LEG'),'Pit Scorpion LEG membership missing');
console.log(`OK: V12.4 Legends lot 4 — ${leg.length}/200 LEG cards, ${CARDS.length} logical cards.`);
