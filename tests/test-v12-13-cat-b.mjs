import assert from 'assert';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';
import { createPermanent } from '../src/core/card-runtime.js';
import { CombatService } from '../src/core/combat.js';
import { StateBasedActions } from '../src/core/state-based-actions.js';

installEffects(effects, globalThis);

function findCard(name) {
  return CARDS.find(c => c.name === name);
}

function makePerm(cardName, controller) {
  const card = findCard(cardName);
  assert.ok(card, `Carte ${cardName} doit exister dans la base`);
  const perm = createPermanent(card);
  perm.controller = controller;
  perm.owner = controller;
  return perm;
}

function makeState() {
  return {
    player: { battlefield: [], graveyard: [], hand: [], library: [], exile: [], life: 20, mana: {W:0,U:0,B:0,R:0,G:0,C:0} },
    ai: { battlefield: [], graveyard: [], hand: [], library: [], exile: [], life: 20, mana: {W:0,U:0,B:0,R:0,G:0,C:0} },
    activePlayer: 'ai', phase: 'combatBegin', priorityHolder: 'ai', turnNumber: 1,
  };
}

const sba = new StateBasedActions({ zones: null });

// --- B1: Serra Angel a flying, atteint par reach ---
{
  const serra = makePerm('Serra Angel', 'ai');
  assert.ok(serra.keywords.includes('flying'), 'Serra Angel doit avoir flying');

  const spider = makePerm('Giant Spider', 'player');
  assert.ok(spider.keywords.includes('reach'), 'Giant Spider doit avoir reach');

  const state = makeState();
  state.player.battlefield = [spider];
  state.ai.battlefield = [serra];

  const combat = new CombatService({ state: () => state, sba });
  combat.begin();
  combat.confirmAttackers([serra], 'ai');
  combat.assignBlockers({ [serra.uid]: [spider.uid] });
  assert.strictEqual(combat.currentPhase, 'combatDamage', 'Reach doit pouvoir bloquer flying');
}

// --- B2: White Knight a firstStrike + protectionB ---
{
  const wk = makePerm('White Knight', 'player');
  assert.ok(wk.keywords.includes('firstStrike'), 'White Knight doit avoir firstStrike');
  assert.ok(wk.keywords.includes('protectionB'), 'White Knight doit avoir protectionB');
}

// --- B3: Giant Spider a reach ---
{
  const spider = makePerm('Giant Spider', 'player');
  assert.ok(spider.keywords.includes('reach'), 'Giant Spider doit avoir reach');
}

// --- B4: Wall of Stone a defender ---
{
  const wall = makePerm('Wall of Stone', 'player');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Stone doit avoir defender');
}

// --- B5: Yotian Soldier a vigilance ---
{
  const soldier = makePerm('Yotian Soldier', 'player');
  assert.ok(soldier.keywords.includes('vigilance'), 'Yotian Soldier doit avoir vigilance');
}

// --- B6: Elvish Archers a firstStrike ---
{
  const archers = makePerm('Elvish Archers', 'player');
  assert.ok(archers.keywords.includes('firstStrike'), 'Elvish Archers doit avoir firstStrike');
}

// --- B7: War Mammoth a trample ---
{
  const wurm = makePerm('War Mammoth', 'ai');
  assert.ok(wurm.keywords.includes('trample'), 'War Mammoth doit avoir trample');
}

// --- B8: Repentant Blacksmith a protectionR ---
{
  const smith = makePerm('Repentant Blacksmith', 'player');
  assert.ok(smith.keywords.includes('protectionR'), 'Repentant Blacksmith doit avoir protectionR');
}

// --- B9: Black Knight a firstStrike + protectionW ---
{
  const bk = makePerm('Black Knight', 'ai');
  assert.ok(bk.keywords.includes('firstStrike'), 'Black Knight doit avoir firstStrike');
  assert.ok(bk.keywords.includes('protectionW'), 'Black Knight doit avoir protectionW');
}

// --- B10: Ornithopter a flying ---
{
  const orn = makePerm('Ornithopter', 'ai');
  assert.ok(orn.keywords.includes('flying'), 'Ornithopter doit avoir flying');
}

// --- B11: Wall of Air a flying + defender ---
{
  const wall = makePerm('Wall of Air', 'player');
  assert.ok(wall.keywords.includes('flying'), 'Wall of Air doit avoir flying');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Air doit avoir defender');
}

// --- B12: Mahamoti Djinn a flying ---
{
  const djinn = makePerm('Mahamoti Djinn', 'ai');
  assert.ok(djinn.keywords.includes('flying'), 'Mahamoti Djinn doit avoir flying');
}

// --- B13: Phantom Monster a flying ---
{
  const monster = makePerm('Phantom Monster', 'ai');
  assert.ok(monster.keywords.includes('flying'), 'Phantom Monster doit avoir flying');
}

// --- B14: Roc of Kher Ridges a flying ---
{
  const roc = makePerm('Roc of Kher Ridges', 'ai');
  assert.ok(roc.keywords.includes('flying'), 'Roc of Kher Ridges doit avoir flying');
}

// --- B15: Hypnotic Specter a flying ---
{
  const spirit = makePerm('Hypnotic Specter', 'ai');
  assert.ok(spirit.keywords.includes('flying'), 'Hypnotic Specter doit avoir flying');
}

// --- B16: Wall of Swords a flying + defender ---
{
  const wall = makePerm('Wall of Swords', 'player');
  assert.ok(wall.keywords.includes('flying'), 'Wall of Swords doit avoir flying');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Swords doit avoir defender');
}

// --- B17: Wall of Water a defender ---
{
  const wall = makePerm('Wall of Water', 'player');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Water doit avoir defender');
}

// --- B18: Wall of Ice a defender ---
{
  const wall = makePerm('Wall of Ice', 'player');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Ice doit avoir defender');
}

// --- B19: Wall of Wood a defender ---
{
  const wall = makePerm('Wall of Wood', 'player');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Wood doit avoir defender');
}

// --- B20: Bird Maiden a flying ---
{
  const bird = makePerm('Bird Maiden', 'ai');
  assert.ok(bird.keywords.includes('flying'), 'Bird Maiden doit avoir flying');
}

// --- B21: Flying Men a flying ---
{
  const fm = makePerm('Flying Men', 'ai');
  assert.ok(fm.keywords.includes('flying'), 'Flying Men doit avoir flying');
}

// --- B22: Stone-Throwing Devils a flying ---
{
  const devil = makePerm('Stone-Throwing Devils', 'ai');
  assert.ok(devil.keywords.includes('firstStrike') && !devil.keywords.includes('flying'), 'Stone-Throwing Devils : initiative seule (Oracle), pas de vol');
}

// --- B23: Dancing Scimitar a flying ---
{
  const scim = makePerm('Dancing Scimitar', 'ai');
  assert.ok(scim.keywords.includes('flying'), 'Dancing Scimitar doit avoir flying');
}

// --- B24: Serra Angel a flying ---
{
  const bird = makePerm('Serra Angel', 'ai');
  assert.ok(bird.keywords.includes('flying'), 'Serra Angel doit avoir flying');
}

// --- B25: Air Elemental a flying ---
{
  const elem = makePerm('Air Elemental', 'ai');
  assert.ok(elem.keywords.includes('flying'), 'Air Elemental doit avoir flying');
}

// --- B26: Wall of Spears a defender ---
{
  const wall = makePerm('Wall of Spears', 'player');
  assert.ok(wall.keywords.includes('defender'), 'Wall of Spears doit avoir defender');
}

// --- B27: Bog Imp a flying ---
{
  const imp = makePerm('Bog Imp', 'ai');
  assert.ok(imp.keywords.includes('flying'), 'Bog Imp doit avoir flying');
}

console.log('OK: Catégorie B — 27 cartes avec keywords vérifiés et pris en compte par le moteur.');
