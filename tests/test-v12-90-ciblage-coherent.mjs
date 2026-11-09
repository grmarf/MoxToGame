import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { pickAiTarget, pickStackTarget } from '../src/app/ai-controller.js';
import CARDS from '../src/data/cards-database.js';

// v12.74 — le ciblage est COHÉRENT : ce que l'énumérateur propose (UI ou IA) est exactement ce que le
// lancement accepte. Trois défauts trouvés par le banc IA-vs-IA :
//  1. validTargets() ne connaissait que le type d'effet : Control Magic « proposait » terrains et
//     enchantements, Blue Elemental Blast des cibles non rouges -> « Cible illégale » au lancement.
//  2. Demonic Tutor était injouable par le chemin de l'UI (cible de bibliothèque énumérée avec `_kind`
//     alors que le contrôle de légalité lit `kind`).
//  3. La réponse de l'IA à un sort (contresort) passait l'élément de pile BRUT comme cible -> refusée.

const card = (name, extra = {}) => ({ ...CARDS.find(c => c.name === name), uid: `u_${name}`, ...extra });
const land = (p, i) => ({ uid: `${p}L${i}`, name: `${p}Land${i}`, type: 'Land', cmc: 0, owner: p[0] === 'p' ? 'player' : 'ai' });
const perm = (o, name, type, extra = {}) => ({ uid: `${name}_${o}`, name, type, owner: o, controller: o, zone: 'battlefield', cmc: 2, keywords: [], color: [], ...extra });
function newGame(active = 'player') {
  const g = new GameFacade().connect();
  g.state.player.library = Array.from({ length: 8 }, (_, i) => land('p', i)); g.state.ai.library = Array.from({ length: 8 }, (_, i) => land('a', i));
  g.turnManager.activePlayer = active; g.state.activePlayer = active; g.turnManager.gotoPhase('main1'); g.state.priorityHolder = active;
  g.state.player.battlefield = [perm('player', 'Grizzly Bears', 'Creature', { power: 2, toughness: 2, color: ['G'], subtype: 'Bear' }), perm('player', 'Forest', 'Land', { subtype: 'Forest' }), perm('player', 'Evil Presence', 'Enchantment')];
  g.state.ai.battlefield = [perm('ai', 'Hill Giant', 'Creature', { power: 3, toughness: 3, color: ['R'], subtype: 'Giant' }), perm('ai', 'Mountain', 'Land', { subtype: 'Mountain' })];
  return g;
}
const mana = (g, side) => { g.state[side].mana = { W: 9, U: 9, B: 9, R: 9, G: 9, C: 9 }; };
const enumerate = (g, c, side) => g.targeting.validTargets(c.effect.type, side, [], c.effect);

// 1. Les cibles proposées respectent la restriction de la carte.
{
  const g = newGame();
  const cm = card('Control Magic');
  const t = enumerate(g, cm, 'player');
  assert.ok(t.length > 0 && t.every(o => /Creature/i.test(String(o.perm?.type))), 'Control Magic : uniquement des créatures : ' + t.map(o => o.name).join(','));
  const beb = card('Blue Elemental Blast');
  const r = enumerate(g, beb, 'player').map(o => o.name);
  assert.deepEqual(r.sort(), ['Hill Giant'].sort(), 'Blue Elemental Blast : uniquement les cibles rouges : ' + r.join(','));
  console.log('OK V12.90.1: validTargets filtre selon la carte (créatures, restriction de couleur).');
}
// 2. Chaque cible proposée est ACCEPTÉE au lancement (cohérence énumérateur / légalité).
for (const [name, side] of [['Control Magic', 'player'], ['Flight', 'player'], ['Jump', 'ai'], ['Lightning Bolt', 'player'], ['Terror', 'ai']]) {
  const g = newGame(side);
  const c = card(name, { owner: side, controller: side });
  g.state[side].hand = [c]; mana(g, side);
  const options = enumerate(g, c, side);
  assert.ok(options.length > 0, `${name} : au moins une cible proposée`);
  for (const o of options) {
    const g2 = newGame(side); const c2 = card(name, { owner: side, controller: side }); g2.state[side].hand = [c2]; mana(g2, side);
    const pick = enumerate(g2, c2, side).find(x => (x.uid ?? x.perm?.uid ?? x.side) === (o.uid ?? o.perm?.uid ?? o.side) && x.kind === o.kind);
    assert.doesNotThrow(() => g2.dispatch('castSpell', { card: c2, target: pick }, side), `${name} -> cible proposée ${o.name || o.side} refusée au lancement`);
  }
}
console.log('OK V12.90.2: toute cible proposée est acceptée au lancement (5 cartes).');

// 3. Demonic Tutor : jouable avec une cible énumérée (chemin de l'UI), la carte arrive en main.
{
  const g = newGame();
  const dt = card('Demonic Tutor', { owner: 'player', controller: 'player' });
  g.state.player.hand = [dt]; g.state.player.mana = { W: 0, U: 0, B: 5, R: 0, G: 0, C: 5 };
  const wanted = g.state.player.library[2];
  const target = enumerate(g, dt, 'player').find(o => o.uid === wanted.uid);
  assert.ok(target, 'Demonic Tutor propose les cartes de la bibliothèque.');
  g.dispatch('castSpell', { card: dt, target }, 'player');
  for (let i = 0; i < 4 && g.stack.items.length; i++) g.dispatch('passPriority', {}, g.state.priorityHolder);
  assert.ok(g.state.player.hand.some(c => c.name === wanted.name && c.owner === 'player'), 'La carte cherchée est en main.');
  console.log('OK V12.90.3: Demonic Tutor jouable par le chemin de l\'UI.');
}
// 4. pickAiTarget ne propose que des cibles légales ; pickStackTarget vise l'élément de pile adverse.
{
  const g = newGame('ai');
  const cm = card('Control Magic', { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [cm]; mana(g, 'ai');
  const t = pickAiTarget(g, cm, 'ai');
  assert.equal(t?.perm?.name, 'Grizzly Bears', "L'IA prend la créature adverse (pas un terrain).");
  assert.doesNotThrow(() => g.dispatch('castSpell', { card: cm, target: t }, 'ai'));
  console.log('OK V12.90.4: pickAiTarget -> cible légale.');
}
{
  const g = newGame('player');
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; g.state.player.mana = { W: 0, U: 0, B: 0, R: 1, G: 0, C: 0 };
  g.dispatch('castSpell', { card: bolt, target: { kind: 'player', side: 'ai' } }, 'player');
  const cs = card('Counterspell', { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [cs]; g.state.ai.mana = { W: 0, U: 2, B: 0, R: 0, G: 0, C: 0 };
  const target = pickStackTarget(g, cs, 'ai', g.stack.top);
  assert.ok(target, "pickStackTarget renvoie une cible valide pour l'élément de pile visé.");
  g.dispatch('castSpell', { card: cs, target }, 'ai');
  for (let i = 0; i < 6 && g.stack.items.length; i++) g.dispatch('passPriority', {}, g.state.priorityHolder);
  assert.equal(g.state.ai.life, 20, 'Le contresort de l\'IA a réellement contré Lightning Bolt.');
  console.log('OK V12.90.5: la réponse de l\'IA (contresort) est acceptée et contre réellement.');
}
// 5b. Remove Soul ne peut contrer qu'un sort de créature : jamais Lightning Bolt.
{
  const g = newGame('player');
  const bolt = card('Lightning Bolt', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bolt]; g.state.player.mana = { W: 0, U: 0, B: 0, R: 1, G: 0, C: 0 };
  g.dispatch('castSpell', { card: bolt, target: { kind: 'player', side: 'ai' } }, 'player');
  const rs = card('Remove Soul', { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [rs]; g.state.ai.mana = { W: 0, U: 2, B: 0, R: 0, G: 0, C: 1 };
  assert.equal(pickStackTarget(g, rs, 'ai', g.stack.top), null, 'Remove Soul : Lightning Bolt n\'est PAS une cible légale.');
  assert.throws(() => g.dispatch('castSpell', { card: rs, target: g.stack.top }, 'ai'), /Cible illégale/);
  console.log('OK V12.90.5b: pickStackTarget respecte la restriction de la carte (Remove Soul vs Lightning Bolt).');
}

// 6. Capacité activée avec cible ILLÉGALE : refusée sans rien coûter (ni mana perdu, ni permanent engagé).
//    Note : `engine.action` restaure l'état sur exception ; ce test garde donc le comportement OBSERVABLE
//    (on relit toujours le permanent sur le champ de bataille, jamais une référence périmée).
{
  const g = newGame('player');
  const { createPermanent } = await import('../src/core/card-runtime.js');
  g.zones.enterBattlefield(createPermanent({ ...card('Icy Manipulator'), owner: 'player', controller: 'player' }), 'player', { controller: 'player', reason: 'test' });
  // On relit toujours le permanent SUR le champ de bataille (l'objet renvoyé à l'entrée n'est pas forcément celui stocké).
  const icyNow = () => g.state.player.battlefield.find(p => p.name === 'Icy Manipulator');
  assert.ok(icyNow(), 'Icy Manipulator est sur le champ de bataille.');
  icyNow().summoningSickness = false;
  g.state.player.mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 1 };
  assert.throws(() => g.dispatch('activateAbility', { permanent: icyNow(), target: { kind: 'player', side: 'ai' }, abilityIndex: 0 }, 'player'), /Cible illégale/);
  assert.equal(icyNow().tapped === true, false, 'Cible illégale : Icy Manipulator ne doit PAS être engagé.');
  assert.equal(g.state.player.mana.C, 1, 'Cible illégale : le mana ne doit PAS être dépensé.');
  assert.equal(g.stack.items.length, 0, 'Rien sur la pile.');
  // Cible légale : le coût est bien payé et la capacité est sur la pile.
  const legal = g.targeting.validTargets('tapTarget', 'player', [], { type: 'tapTarget', target: 'anyPermanent' }).find(o => o.perm?.name === 'Hill Giant');
  g.dispatch('activateAbility', { permanent: icyNow(), target: legal, abilityIndex: 0 }, 'player');
  assert.equal(icyNow().tapped, true, 'Cible légale : Icy Manipulator est engagé.');
  assert.equal(g.state.player.mana.C, 0, 'Cible légale : {1} dépensé.');
  assert.equal(g.stack.items.length, 1, 'Cible légale : la capacité est sur la pile.');
  console.log('OK V12.90.6: une cible illégale ne coûte rien (ni mana, ni engagement) ; une cible légale est payée.');
}

// 7. Contresorts : ne ciblent que des SORTS (jamais une capacité), Remove Soul que des sorts de créature,
//    et Mana Drain est énuméré comme les autres contresorts.
{
  const g = newGame('player');
  const bears = card('Grizzly Bears', { owner: 'player', controller: 'player' });
  g.state.player.hand = [bears]; g.state.player.mana = { W: 0, U: 0, B: 0, R: 0, G: 1, C: 1 };
  g.dispatch('castSpell', { card: bears, target: null }, 'player');
  const spellId = g.stack.top.id;
  // Une capacité activée sur la pile (Icy Manipulator) : ce n'est pas un sort.
  const { createPermanent } = await import('../src/core/card-runtime.js');
  g.zones.enterBattlefield(createPermanent({ ...card('Icy Manipulator'), owner: 'ai', controller: 'ai' }), 'ai', { controller: 'ai', reason: 'test' });
  const icy = g.state.ai.battlefield.find(p => p.name === 'Icy Manipulator'); icy.summoningSickness = false;
  g.state.ai.mana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 1 };
  g.turnManager.activePlayer = 'ai'; g.state.activePlayer = 'ai'; g.state.priorityHolder = 'ai';
  g.dispatch('activateAbility', { permanent: icy, target: g.targeting.validTargets('tapTarget', 'ai', [], { type: 'tapTarget', target: 'anyPermanent' }).find(o => o.perm?.name === 'Grizzly Bears'), abilityIndex: 0 }, 'ai');
  const abilityItem = g.stack.items.find(i => i.type === 'ability');
  assert.ok(abilityItem, 'Une capacité activée est sur la pile.');
  for (const name of ['Counterspell', 'Remove Soul', 'Mana Drain', 'Force Spike']) {
    const c = card(name, { owner: 'ai', controller: 'ai' });
    const ids = g.targeting.validTargets(c.effect.type, 'ai', [], c.effect).map(o => o.id);
    assert.ok(ids.includes(spellId), `${name} peut cibler un sort de créature.`);
    assert.ok(!ids.includes(abilityItem.id), `${name} ne peut PAS cibler une capacité activée.`);
    g.state.ai.mana = { W: 0, U: 9, B: 0, R: 0, G: 0, C: 9 };
  }
  const cs = card('Counterspell', { owner: 'ai', controller: 'ai' });
  g.state.ai.hand = [cs]; g.state.ai.mana = { W: 0, U: 2, B: 0, R: 0, G: 0, C: 0 };
  g.state.priorityHolder = 'ai';   // l'IA a la priorité : seule la légalité de la cible est en jeu
  assert.throws(() => g.dispatch('castSpell', { card: cs, target: { kind: 'stackItem', id: abilityItem.id } }, 'ai'), /Cible illégale/, 'Counterspell sur une capacité : refusé.');
  assert.equal(g.state.ai.mana.U, 2, 'Cible illégale : le mana n\'est pas dépensé.');
  console.log('OK V12.90.7: les contresorts ne visent que des sorts ; Remove Soul vise les sorts de créature ; Mana Drain énuméré.');
}
