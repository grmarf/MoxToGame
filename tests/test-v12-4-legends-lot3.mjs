import assert from 'node:assert/strict';
import CARDS from '../src/data/cards-database.js';

const LOT3 = ['Glyph of Delusion','Glyph of Destruction','Glyph of Doom','Glyph of Life','Glyph of Reincarnation','Gosta Dirk','Gravity Sphere','Great Defender','Great Wall','Greater Realm of Preservation','Greed','Green Mana Battery','Gwendlyn Di Corci','Halfdane','Hammerheim','Hazezon Tamar','Headless Horseman','Heaven\'s Gate','Hell Swarm','Hellfire',"Hell's Caretaker",'Holy Day','Horn of Deafening','Hornet Cobra','Horror of Horrors','Hunding Gjornersen','Hyperion Blacksmith','Ichneumon Druid','Immolation','Imprison','In the Eye of Chaos','Indestructible Aura','Infernal Medusa','Infinite Authority','Invoke Prejudice','Ivory Guardians','Jacques le Vert','Jasmine Boreal','Jedit Ojanen','Jerrard of the Closed Fist','Johan','Jovial Evil','Juxtapose','Karakas','Kasimir the Lone Wolf','Keepers of the Faith','Kei Takahashi','Killer Bees','Kismet','Knowledge Vault'];
assert.equal(LOT3.length,50);
assert.equal(new Set(CARDS.map(c=>c.name)).size,CARDS.length,'duplicate logical card names');
assert.deepEqual(CARDS.map(c=>c.id),Array.from({length:CARDS.length},(_,i)=>i+1),'IDs must be continuous');
const leg=CARDS.filter(c=>c.sets?.includes('LEG'));
assert.ok(leg.length >= 150,'Legends coverage must expose at least 150 LEG memberships');
for(const name of LOT3){const c=CARDS.find(x=>x.name===name);assert.ok(c,`LEG lot 3 missing: ${name}`);assert.ok(c.sets.includes('LEG'),`${name} missing LEG`);}
for(const name of LOT3.filter(n=>n!=="Heaven's Gate")){const c=CARDS.find(x=>x.name===name);if(c.id>=754) assert.ok(['unimplemented', 'functional', 'implemented'].includes(c.effectStatus));}
console.log(`OK: V12.4 Legends lot 3 — ${leg.length}/at least 150 LEG cards, ${CARDS.length} logical cards.`);
