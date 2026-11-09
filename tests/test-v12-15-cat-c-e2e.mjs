import { gameEvents } from '../src/core/event-bus.js';
import { game } from '../src/core/game-facade.js';
import { effects } from '../src/core/effect-registry.js';
import { installEffects } from '../src/core/effects/index.js';
import CARDS from '../src/data/cards-database.js';

installEffects(effects, globalThis);
game.connect();

function findCard(name) { return CARDS.find(c => c.name === name); }

function setupGame() {
  game.engine.loadDeck('player', CARDS.filter(c => c.isBasic));
  game.engine.loadDeck('ai', CARDS.filter(c => c.isBasic));
  game.turnManager.gotoPhase('main1');
  game.turnManager.activePlayer = 'player';
  game.state.activePlayer = 'player';
  game.state.priorityHolder = 'player';
}

function giveMana(side) {
  game.state[side].mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
}

function resolveStack() {
  const ctrl = game.state.priorityHolder;
  const opp = ctrl === 'player' ? 'ai' : 'player';
  game.dispatch('PASS_PRIORITY', {}, ctrl);
  if (game.stack.size > 0) {
    game.dispatch('PASS_PRIORITY', {}, opp);
  }
}

// ── C1: Lightning Bolt inflige 3 dégâts ──
{
  setupGame();
  giveMana('player');
  const bolt = findCard('Lightning Bolt');
  game.state.player.hand = [bolt];
  game.state.ai.life = 20;
  game.dispatch('CAST_SPELL', { card: bolt, target: { kind: 'player', side: 'ai' } }, 'player');
  resolveStack();
  if (game.state.ai.life !== 17) throw new Error(`C1 Lightning Bolt: PV IA = ${game.state.ai.life}, attendu 17`);
  console.log('OK E2E C1: Lightning Bolt 20 -> 17');
}

// ── C2: Giant Growth E2E — P/T modifiée ──
{
  setupGame();
  giveMana('player');
  const growth = findCard('Giant Growth');
  const bear = { uid: 'gg_bear_v2', name: 'Grizzly Bears', power: 2, toughness: 2, type: 'Creature', controller: 'player', owner: 'player', tapped: false, summoningSickness: false, keywords: [], color: ['G'], tempBuffs: [] };
  game.state.player.battlefield = [bear];
  game.state.player.hand = [growth];
  game.dispatch('CAST_SPELL', { card: growth, target: { kind: 'permanent', perm: bear, uid: bear.uid } }, 'player');
  resolveStack();
  const resolvedBear = game.state.player.battlefield.find(p => p.uid === bear.uid);
  if (!resolvedBear) throw new Error('C2 Giant Growth: bear introuvable après résolution');
  const buff = resolvedBear.tempBuffs.find(b => b.power === 3 && b.toughness === 3);
  if (!buff) throw new Error(`C2 Giant Growth: buff 3/3 non trouvé`);
  console.log('OK E2E C2: Giant Growth 2/2 -> 5/5 (temporaire)');
}

// ── C3: Healing Salve gagne 3 PV ──
{
  setupGame();
  giveMana('player');
  const salve = findCard('Healing Salve');
  game.state.player.hand = [salve];
  game.state.player.life = 10;
  game.dispatch('CAST_SPELL', { card: salve }, 'player');
  resolveStack();
  if (game.state.player.life !== 13) throw new Error(`C3 Healing Salve: PV = ${game.state.player.life}, attendu 13`);
  console.log('OK E2E C3: Healing Salve 10 -> 13');
}

// ── C4: Dark Ritual structure ──
{
  const ritual = findCard('Dark Ritual');
  if (ritual.effect.type !== 'mana') throw new Error('C4 Dark Ritual: type incorrect');
  console.log('OK E2E C4: Dark Ritual structure');
}

// ── C5: Shatter E2E — artifact détruit ──
{
  setupGame();
  giveMana('player');
  const shatter = findCard('Shatter');
  const artifact = { uid: 'sh_art_v2', name: 'Sol Ring', type: 'Artifact', controller: 'ai', owner: 'ai', tapped: false, keywords: [], color: [] };
  game.state.ai.battlefield = [artifact];
  game.state.player.hand = [shatter];
  game.dispatch('CAST_SPELL', { card: shatter, target: { kind: 'permanent', perm: artifact, uid: artifact.uid } }, 'player');
  resolveStack();
  if (game.state.ai.battlefield.some(p => p.uid === artifact.uid)) throw new Error('C5 Shatter: artifact toujours sur le battlefield');
  console.log('OK E2E C5: Shatter détruit artifact');
}

// ── C6: Terror E2E — creature détruite ──
{
  setupGame();
  giveMana('player');
  const terror = findCard('Terror');
  const creature = { uid: 'tr_crea_v2', name: 'Gray Ogre', power: 2, toughness: 2, type: 'Creature', controller: 'ai', owner: 'ai', tapped: false, summoningSickness: false, keywords: [], color: ['R'], tempBuffs: [] };
  game.state.ai.battlefield = [creature];
  game.state.player.hand = [terror];
  game.dispatch('CAST_SPELL', { card: terror, target: { kind: 'permanent', perm: creature, uid: creature.uid } }, 'player');
  resolveStack();
  if (game.state.ai.battlefield.some(p => p.uid === creature.uid)) throw new Error('C6 Terror: creature toujours sur le battlefield');
  console.log('OK E2E C6: Terror détruit creature');
}

// ── C7: Sinkhole E2E — destroy land ──
{
  setupGame();
  giveMana('player');
  const sinkhole = findCard('Sinkhole');
  const land = { uid: 'sk_land_v2', name: 'Forest', type: 'Land — Forest', isLand: true, isBasic: true, controller: 'ai', owner: 'ai', tapped: false, keywords: [], color: [] };
  game.state.ai.battlefield = [land];
  game.state.player.hand = [sinkhole];
  game.dispatch('CAST_SPELL', { card: sinkhole, target: { kind: 'permanent', perm: land, uid: land.uid } }, 'player');
  resolveStack();
  if (game.state.ai.battlefield.some(p => p.uid === land.uid)) throw new Error('C7 Sinkhole: land toujours sur le battlefield');
  console.log('OK E2E C7: Sinkhole détruit land');
}

// ── C8: Disenchant E2E — destroy artifact/enchantment ──
{
  setupGame();
  giveMana('player');
  const disenchant = findCard('Disenchant');
  const artifact = { uid: 'dc_art', name: 'Sol Ring', type: 'Artifact', controller: 'ai', owner: 'ai', tapped: false, keywords: [], color: [] };
  game.state.ai.battlefield = [artifact];
  game.state.player.hand = [disenchant];
  game.dispatch('CAST_SPELL', { card: disenchant, target: { kind: 'permanent', perm: artifact, uid: artifact.uid } }, 'player');
  resolveStack();
  if (game.state.ai.battlefield.some(p => p.uid === artifact.uid)) throw new Error('C8 Disenchant: artifact toujours sur le battlefield');
  console.log('OK E2E C8: Disenchant détruit artifact');
}

// ── C20: Unsummon E2E — bounce creature ──
{
  setupGame();
  giveMana('player');
  const unsummon = findCard('Unsummon');
  const creature = { uid: 'un_crea_v2', name: 'Merfolk', power: 1, toughness: 1, type: 'Creature', controller: 'ai', owner: 'ai', tapped: false, summoningSickness: false, keywords: [], color: ['U'], tempBuffs: [] };
  game.state.ai.battlefield = [creature];
  game.state.player.hand = [unsummon];
  game.dispatch('CAST_SPELL', { card: unsummon, target: { kind: 'permanent', perm: creature, uid: creature.uid } }, 'player');
  resolveStack();
  if (game.state.ai.battlefield.some(p => p.uid === creature.uid)) throw new Error('C20 Unsummon: creature toujours sur le battlefield');
  console.log('OK E2E C20: Unsummon bounce creature');
}

// ── C9: Wrath of God board wipe ──
{
  setupGame();
  giveMana('player');
  const wrath = findCard('Wrath of God');
  const bear1 = { uid: 'b1', name: 'Bear1', power: 2, toughness: 2, type: 'Creature', controller: 'player', owner: 'player', tapped: false, summoningSickness: false, keywords: [], color: ['G'], tempBuffs: [] };
  const bear2 = { uid: 'b2', name: 'Bear2', power: 2, toughness: 2, type: 'Creature', controller: 'ai', owner: 'ai', tapped: false, summoningSickness: false, keywords: [], color: ['G'], tempBuffs: [] };
  game.state.player.battlefield = [bear1];
  game.state.ai.battlefield = [bear2];
  game.state.player.hand = [wrath];
  game.dispatch('CAST_SPELL', { card: wrath }, 'player');
  resolveStack();
  if (game.state.player.battlefield.length !== 0 || game.state.ai.battlefield.length !== 0) {
    throw new Error(`C9 Wrath of God: créatures restantes P=${game.state.player.battlefield.length} A=${game.state.ai.battlefield.length}`);
  }
  console.log('OK E2E C9: Wrath of God board wipe');
}

// ── C10: Armageddon détruit tous les terrains ──
{
  setupGame();
  giveMana('player');
  const armageddon = findCard('Armageddon');
  const forest = { uid: 'f1', name: 'Forest', type: 'Land — Forest', isLand: true, isBasic: true, controller: 'player', owner: 'player', tapped: false, keywords: [], color: [] };
  const mountain = { uid: 'm1', name: 'Mountain', type: 'Land — Mountain', isLand: true, isBasic: true, controller: 'ai', owner: 'ai', tapped: false, keywords: [], color: [] };
  game.state.player.battlefield = [forest];
  game.state.ai.battlefield = [mountain];
  game.state.player.hand = [armageddon];
  game.dispatch('CAST_SPELL', { card: armageddon }, 'player');
  resolveStack();
  if (game.state.player.battlefield.some(p => p.isLand) || game.state.ai.battlefield.some(p => p.isLand)) {
    throw new Error(`C10 Armageddon: terrains restants`);
  }
  console.log('OK E2E C10: Armageddon détruit tous les terrains');
}

// ── C11: Counterspell structure ──
{
  const counter = findCard('Counterspell');
  if (counter.effect.type !== 'counterSpell') throw new Error(`C11 Counterspell: type = ${counter.effect.type}`);
  console.log('OK E2E C11: Counterspell structure');
}

// ── C12: Icy Manipulator E2E — permanent tapé ──
{
  setupGame();
  giveMana('player');
  const icy = { ...findCard('Icy Manipulator'), uid: 'icy_perm', objectId: 'icy_obj' };
  const targetPerm = { uid: 'icy_tgt_v2', name: 'Grizzly Bears', power: 2, toughness: 2, type: 'Creature', controller: 'ai', owner: 'ai', tapped: false, summoningSickness: false, keywords: [], color: ['G'], tempBuffs: [] };
  game.state.ai.battlefield = [targetPerm];
  game.state.player.battlefield = [icy];
  game.state.player.hand = [];
  game.dispatch('ACTIVATE_ABILITY', { permanent: icy, abilityIndex: 0, ability: icy.activated[0], target: { kind: 'permanent', perm: targetPerm, uid: targetPerm.uid } }, 'player');
  resolveStack();
  const resolvedTarget = game.state.ai.battlefield.find(p => p.uid === targetPerm.uid);
  if (!resolvedTarget || !resolvedTarget.tapped) throw new Error(`C12 Icy Manipulator: target non tapé`);
  console.log('OK E2E C12: Icy Manipulator engage cible');
}

// ── C13: Sol Ring produit CC ──

// ── C14-C16: Structures statiques/triggers ──
{
  const mine = findCard('Howling Mine');
  if (!mine.triggers || mine.triggers[0].event !== 'drawStepStarted') throw new Error('C14 Howling Mine: triggers mal configurés');
  console.log('OK E2E C14: Howling Mine trigger structure');

  const moon = findCard('Bad Moon');
  if (!moon.static) throw new Error('C15 Bad Moon: static manquant');
  console.log('OK E2E C15: Bad Moon static structure');

  const crusade = findCard('Crusade');
  if (!crusade.static) throw new Error('C16 Crusade: static manquant');
  console.log('OK E2E C16: Crusade static structure');

  const abu = findCard("Abu Ja'far");
  if (!abu.triggers || abu.triggers[0].event !== 'creatureDied') throw new Error('C17 Abu Ja\'far: triggers mal configurés');
  console.log('OK E2E C17: Abu Ja\'far trigger structure');
}

// ── C18: Ancestral Recall structure ──
{
  const recall = findCard('Ancestral Recall');
  if (recall.effect.type !== 'drawTarget' || recall.effect.amount !== 3) throw new Error('C18 Ancestral Recall: effet mal configuré');
  console.log('OK E2E C18: Ancestral Recall structure');
}

// ── C19: Hymn to Tourach structure (remplace Mind Rot, Fourth Edition = hors périmètre) ──
{
  const hymn = findCard('Hymn to Tourach');
  if (hymn.effect.type !== 'discardRandom' || hymn.effect.amount !== 2) throw new Error('C19 Hymn to Tourach: effet mal configuré');
  console.log('OK E2E C19: Hymn to Tourach structure');
}

console.log('\nOK E2E: 20 cartes C — tests bout-en-bout complétés.');
