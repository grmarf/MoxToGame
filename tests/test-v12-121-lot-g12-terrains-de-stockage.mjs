// V12.76 — Chantier 2, lot G12 : les cinq terrains de stockage (Bottomless Vault, Dwarven Hold, Hollow Trees, Icatian Store, Sand Silos).
// Texte (Oracle) : « Arrive engagé. Vous pouvez choisir de ne pas dégager ce terrain pendant votre étape de dégagement. Au début de votre
// entretien, si ce terrain est engagé, mettez un marqueur de stockage dessus. {T}, retirez n'importe quel nombre de marqueurs de stockage :
// ajoutez {X} pour chaque marqueur retiré. »  Parties réelles : entrée en jeu depuis la main, vraie progression des tours, vrai choix.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const LANDS = { 'Bottomless Vault': 'B', 'Dwarven Hold': 'R', 'Hollow Trees': 'G', 'Icatian Store': 'W', 'Sand Silos': 'U' };
const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
for (const n of Object.keys(LANDS)) { assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`); assert.ok(/marqueur de stockage/.test(by(n).text_fr), `${n} : texte`); }
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 60 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY();
  return g;
}
function put(g, side, name, extra = {}) {
  const uid = `${name}#${++seq}`;
  const p = { ...structuredClone(by(name)), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); g.triggerCollector.registerSource(p, side); return p;
}
const get = (g, p) => ['player', 'ai'].map((s) => g.state[s].battlefield.find((x) => x.uid === p.uid)).find(Boolean);
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const total = (m) => Object.values(m).reduce((a, b) => a + b, 0);
const storage = (p) => (p.counters || []).filter((c) => c.type === 'storage').length;
const advanceUntil = (g, pred, max = 120) => { for (let i = 0; i < max && !pred(); i++) { g.turnManager.nextPhase(); if (!pred()) settle(g); } assert.ok(pred(), `condition non atteinte (phase ${g.state.phase}, tour de ${g.state.activePlayer})`); };
// Arrive à l'étape de dégagement du prochain tour du JOUEUR : le choix « ne pas dégager » est alors en attente (ou non).
const nextOwnUntap = (g) => { const t = g.state.turnNumber; advanceUntil(g, () => g.state.turnNumber !== t && g.state.activePlayer === 'player' && g.state.phase === 'untap'); };
const toUpkeepAndSettle = (g) => { advanceUntil(g, () => g.state.phase === 'upkeep'); settle(g); };
const activate = (g, p) => { g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: get(g, p), controller: 'player', abilityIndex: 0, target: null }); settle(g); };

for (const [name, color] of Object.entries(LANDS)) {
  // 1) Arrive engagé quand on le joue depuis la main ; ne produit rien tant qu'il est engagé.
  {
    const g = newGame(); const card = { ...structuredClone(by(name)), uid: `${name}#hand`, owner: 'player', zone: 'hand' }; g.state.player.hand = [card];
    g.state.priorityHolder = 'player'; g.action('playLand', { card, controller: 'player' });
    const land = g.state.player.battlefield.find((p) => p.name === name); assert.ok(land, `${name} en jeu`); assert.ok(land.tapped, `${name} arrive engagé`);
    assert.throws(() => activate(g, land), /illégale|invalide|engagé/i, 'engagé : sa capacité est inutilisable');
  }
  // 2) Choix « ne pas dégager » : vraie question, une seule, aucune pour l'IA ; les autres permanents se dégagent normalement.
  {
    const g = newGame(); const land = put(g, 'player', name, { tapped: true }); const plains = put(g, 'player', 'Plains', { tapped: true });
    nextOwnUntap(g); const p = g.choices.getPending();
    assert.equal(p?.type, 'keepTapped', `${name} : choix à l'étape de dégagement`); assert.deepEqual(p.options.map((o) => o.uid), [land.uid], 'seul le terrain de stockage engagé est concerné');
    assert.ok(!get(g, plains).tapped, 'un terrain ordinaire se dégage sans question'); assert.ok(get(g, land).tapped, 'en attente de la réponse : toujours engagé');
    assert.throws(() => g.choices.resolve([plains]), /invalide/i, 'seuls les permanents proposés sont acceptés');
    g.choices.resolve([]); assert.ok(!get(g, land).tapped, 'aucun gardé engagé : il se dégage');
  }
  {
    const g = newGame(); const land = put(g, 'player', name, { tapped: true }); nextOwnUntap(g); g.choices.resolve([get(g, land)]);
    assert.ok(get(g, land).tapped, 'gardé engagé'); toUpkeepAndSettle(g); assert.equal(storage(get(g, land)), 1, 'engagé à l\'entretien : un marqueur de stockage');
  }
  { // Non engagé à l'entretien : aucun marqueur, aucune question ; l'IA ne reçoit pas de question et dégage toujours.
    const g = newGame(); const land = put(g, 'player', name); nextOwnUntap(g); assert.equal(g.choices.getPending(), null, 'rien d\'engagé : aucune question'); toUpkeepAndSettle(g); assert.equal(storage(get(g, land)), 0, 'non engagé : pas de marqueur');
    const g2 = newGame(); const ai = put(g2, 'ai', name, { tapped: true }); advanceUntil(g2, () => g2.state.activePlayer === 'ai' && g2.state.phase === 'untap'); assert.equal(g2.choices.getPending(), null, "pas de question pour l'IA"); assert.ok(!get(g2, ai).tapped, "l'IA dégage toujours");
    const g3 = newGame(); const mine = put(g3, 'player', name, { tapped: true }); advanceUntil(g3, () => g3.state.activePlayer === 'ai' && g3.state.phase === 'upkeep'); settle(g3); assert.equal(storage(get(g3, mine)), 0, "l'entretien de l'adversaire ne donne pas de marqueur");
  }
  // 3) {T}, retirez k marqueurs (0..N) : k mana de SA couleur, jamais d'autre chose ; vrai choix, k > N refusé.
  for (const N of [0, 1, 2, 3]) for (let k = 0; k <= N; k++) {
    const g = newGame(); const land = put(g, 'player', name, { counters: Array.from({ length: N }, () => ({ type: 'storage' })) });
    g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: get(g, land), controller: 'player', abilityIndex: 0, target: null });
    if (N === 0) { assert.equal(g.choices.getPending(), null, 'aucun marqueur : aucun choix'); assert.equal(total(g.state.player.mana), 0, 'aucun marqueur : aucun mana'); assert.ok(get(g, land).tapped, 'la capacité est quand même payée (engagé)'); continue; }
    const p = g.choices.getPending(); assert.equal(p?.type, 'number'); assert.deepEqual(p.options, Array.from({ length: N + 1 }, (_, i) => i), `${name} : choix 0..${N}`);
    assert.throws(() => g.choices.resolve(N + 1), /invalide/i); assert.equal(total(g.state.player.mana), 0, 'aucun mana avant le choix'); g.choices.resolve(k);
    assert.equal(g.state.player.mana[color], k, `${name} : ${N} marqueurs, ${k} retirés -> ${k} mana ${color}`); assert.equal(total(g.state.player.mana), k, 'rien d\'autre');
    assert.equal(storage(get(g, land)), N - k, 'marqueurs restants'); assert.ok(get(g, land).tapped, 'engagé');
  }
}
console.log('OK V12.76.121.1 : 5 terrains -- arrivent engagés, choix « ne pas dégager » (humain seulement), marqueur à l\'entretien seulement si engagé, {T} + retrait de 0..N marqueurs -> k mana de leur couleur.');

// 4) Cycle complet sur plusieurs tours réels : jouer, garder engagé deux fois (2 marqueurs), dégager, tirer 2 mana ; un deuxième terrain de stockage garde sa propre décision.
{
  const g = newGame(); const card = { ...structuredClone(by('Dwarven Hold')), uid: 'DH#hand', owner: 'player', zone: 'hand' }; g.state.player.hand = [card];
  g.state.priorityHolder = 'player'; g.action('playLand', { card, controller: 'player' }); const hold = g.state.player.battlefield.find((p) => p.name === 'Dwarven Hold');
  const trees = put(g, 'player', 'Hollow Trees', { tapped: true });
  nextOwnUntap(g); assert.deepEqual(g.choices.getPending().options.map((o) => o.name).sort(), ['Dwarven Hold', 'Hollow Trees'], 'un seul choix pour les deux terrains');
  g.choices.resolve([get(g, hold)]); assert.ok(get(g, hold).tapped); assert.ok(!get(g, trees).tapped, 'Hollow Trees se dégage, Dwarven Hold reste engagé'); toUpkeepAndSettle(g); assert.equal(storage(get(g, hold)), 1); assert.equal(storage(get(g, trees)), 0);
  nextOwnUntap(g); assert.deepEqual(g.choices.getPending().options.map((o) => o.name), ['Dwarven Hold'], 'seul le terrain encore engagé'); g.choices.resolve([get(g, hold)]); toUpkeepAndSettle(g); assert.equal(storage(get(g, hold)), 2, 'deux tours engagé : deux marqueurs');
  nextOwnUntap(g); g.choices.resolve([]); assert.ok(!get(g, hold).tapped, 'dégagé'); assert.equal(storage(get(g, hold)), 2, 'les marqueurs restent');
  g.state.player.mana = EMPTY(); advanceUntil(g, () => g.state.phase === 'main1'); g.state.player.mana = EMPTY();
  g.state.priorityHolder = 'player'; g.action('activateAbility', { permanent: get(g, hold), controller: 'player', abilityIndex: 0, target: null });
  assert.deepEqual(g.choices.getPending().options, [0, 1, 2]); g.choices.resolve(2); assert.equal(g.state.player.mana.R, 2); assert.equal(storage(get(g, hold)), 0);
  console.log('OK V12.76.121.2 : cycle complet -- jouer engagé, garder engagé deux tours (2 marqueurs), dégager, retirer 2 -> 2 mana {R}; un seul choix pour plusieurs terrains.');
}
