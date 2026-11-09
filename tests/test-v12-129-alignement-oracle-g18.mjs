// V12.76 (G18) — alignement sur l'Oracle (relecture Scryfall) : 13 cartes jouables dont le comportement ne suivait pas le texte officiel.
// Army of Allah +2/+0 ; Holy Light non-blanches ; Living Lands 1/1 ; Kormus Bell noires ; Riptide bleues ; Keldon Warlord non-Mur ;
// Bog Rats / Land Leeches / Carnivorous Plant / Stone-Throwing Devils (mots-clés) ; Goblin King / Lord of Atlantis (« autres ») ; Martyr's Cry (pioche).
// Parties réelles : pile, combat, caractéristiques calculées. (Army of Allah, Holy Light, Riptide, Living Lands, Goblin King, Lord of Atlantis :
// scénarios détaillés dans test-v12-96/98/99/106, mis à jour dans ce lot.)
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const FULL = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 };
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai');
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; return g;
}
const put = (g, side, name) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false }; g.state[side].battlefield.push(p); return p; };
const ch = (g, p) => calculateCharacteristics(g.state, p);
const pt = (g, p) => { const c = ch(g, p); return [c.power, c.toughness]; };
const onBf = (g, name) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).filter((p) => p.name === name).length;
function cast(g, name, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side;
  g.dispatch('CAST_SPELL', { card, xValue: 0 }, side);
  for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
}
const attackWith = (g, atts, side = 'player') => { g.state.activePlayer = side; g.combat.begin(); g.combat.confirmAttackers(atts, side); };
const blockersOf = (g, att, side = 'ai') => g.combat.getValidBlockers(side, att).map((p) => p.uid);

const LOT = ['Army of Allah', 'Holy Light', 'Living Lands', 'Kormus Bell', 'Riptide', 'Keldon Warlord', 'Bog Rats', 'Land Leeches', 'Carnivorous Plant', 'Stone-Throwing Devils', 'Goblin King', 'Lord of Atlantis', "Martyr's Cry"];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Kormus Bell : les marais sont des créatures NOIRES 1/1 qui restent des terrains ─────────────────────
{
  const g = newGame(); const sw = put(g, 'ai', 'Swamp'); const fo = put(g, 'player', 'Forest'); cast(g, 'Kormus Bell');
  assert.deepEqual(pt(g, sw), [1, 1]); assert.ok(/Creature/.test(ch(g, sw).type) && /Land/.test(ch(g, sw).type), 'créature ET terrain');
  assert.deepEqual(ch(g, sw).color, ['B'], 'le marais animé est NOIR'); assert.ok(!/Creature/.test(ch(g, fo).type), 'la forêt n\'est pas touchée'); assert.deepEqual(ch(g, fo).color, [], 'et reste incolore');
  g.state.player.battlefield = g.state.player.battlefield.filter((p) => p.name !== 'Kormus Bell');
  assert.deepEqual(ch(g, sw).color, [], 'Kormus Bell parti : plus de couleur');
}
// ── Keldon Warlord : créatures NON-MUR que vous contrôlez ──────────────────────────────────────────────
{
  const g = newGame(); const k = put(g, 'player', 'Keldon Warlord'); assert.deepEqual(pt(g, k), [1, 1], 'seul : lui-même');
  put(g, 'player', 'Grizzly Bears'); assert.deepEqual(pt(g, k), [2, 2]);
  put(g, 'player', 'Wall of Stone'); put(g, 'player', 'Wall of Wood'); assert.deepEqual(pt(g, k), [2, 2], 'les Murs ne comptent pas');
  put(g, 'ai', 'Grizzly Bears'); assert.deepEqual(pt(g, k), [2, 2], 'les créatures adverses ne comptent pas');
}
// ── Bog Rats : ne peut pas être bloqué par des Murs (plus de marécage-marche) ──────────────────────────
{
  const g = newGame(); const rats = put(g, 'player', 'Bog Rats'); const wall = put(g, 'ai', 'Wall of Stone'); const giant = put(g, 'ai', 'Hill Giant'); put(g, 'ai', 'Swamp');
  attackWith(g, [rats]); const b = blockersOf(g, rats);
  assert.ok(!b.includes(wall.uid), 'un Mur ne peut pas bloquer Bog Rats'); assert.ok(b.includes(giant.uid), 'une autre créature le peut, même face à un marais (pas de marécage-marche)');
  assert.ok(!ch(g, rats).keywords.includes('swampwalk'));
}
// ── Mots-clés ramenés à l'Oracle ───────────────────────────────────────────────────────────────────────
{
  const g = newGame(); const kw = (n) => ch(g, put(g, 'player', n)).keywords;
  assert.ok(kw('Land Leeches').includes('first strike') && !kw('Land Leeches').includes('forestwalk'), 'Land Leeches : initiative seule');
  assert.ok(kw('Carnivorous Plant').includes('defender') && !kw('Carnivorous Plant').includes('forestwalk'), 'Carnivorous Plant : défenseur seul');
  assert.ok(kw('Stone-Throwing Devils').includes('first strike') && !kw('Stone-Throwing Devils').includes('flying'), 'Stone-Throwing Devils : initiative sans vol');
}
// ── Martyr's Cry : exile les créatures blanches ; le contrôleur de CHAQUE créature exilée pioche ───────
{
  const g = newGame(); put(g, 'player', 'Savannah Lions'); put(g, 'player', 'Savannah Lions'); put(g, 'ai', 'Savannah Lions'); const bears = put(g, 'ai', 'Grizzly Bears');
  const h = (s) => g.state[s].hand.length; const p0 = h('player'), a0 = h('ai');
  cast(g, "Martyr's Cry");
  assert.equal(onBf(g, 'Savannah Lions'), 0, 'les créatures blanches sont exilées'); assert.equal(g.state.player.exile.filter((c) => c.name === 'Savannah Lions').length + g.state.ai.exile.filter((c) => c.name === 'Savannah Lions').length, 3, 'en exil');
  assert.equal(h('player'), p0 + 2, 'le joueur pioche 2 cartes (2 de ses créatures exilées)'); assert.equal(h('ai'), a0 + 1, 'l\'adversaire en pioche 1');
  assert.ok(g.state.ai.battlefield.includes(bears), 'créature non blanche intacte');
}
console.log(`OK V12.76.129 : ${LOT.length} cartes alignées sur l'Oracle (Kormus, Keldon, Bog Rats, mots-clés, Martyr's Cry en partie réelle).`);
