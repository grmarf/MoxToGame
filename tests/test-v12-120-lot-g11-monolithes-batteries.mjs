// V12.76 — Chantier 2, lot G11 : « ne se dégage pas » et marqueurs de charge (7 cartes).
// Mana Vault, Basalt Monolith, Black/Blue/Green/Red/White Mana Battery.
// Parties réelles : mana natif (tapMana), capacités activées, vrai choix du nombre de marqueurs, vraie progression des tours
// (étape de dégagement, entretien avec déclencheur, étape de pioche).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
const COLORS = { Black: 'B', Blue: 'U', Green: 'G', Red: 'R', White: 'W' };
const BATTERIES = Object.keys(COLORS).map((c) => `${c} Mana Battery`);
for (const n of ['Mana Vault', 'Basalt Monolith', ...BATTERIES]) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 40 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
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
const tapMana = (g, p, side = 'player') => { g.state.priorityHolder = side; g.action('tapMana', { permanent: get(g, p), controller: side }); };
const ability = (g, p, i, side = 'player') => { g.state.priorityHolder = side; g.action('activateAbility', { permanent: get(g, p), controller: side, abilityIndex: i, target: null }); settle(g); };
const total = (m) => Object.values(m).reduce((a, b) => a + b, 0);
const step = (g) => { g.turnManager.nextPhase(); settle(g); };
// La pile n'est résolue qu'APRÈS avoir testé la condition : arrivé en entretien, le déclencheur reste sur la pile (on peut alimenter la réserve avant qu'il ne résolve).
const advanceUntil = (g, pred, max = 80) => { for (let i = 0; i < max && !pred(); i++) { g.turnManager.nextPhase(); if (!pred()) settle(g); } assert.ok(pred(), `condition non atteinte (phase ${g.state.phase}, tour de ${g.state.activePlayer})`); };
const ownUpkeepNextTurn = (g) => { const t = g.state.turnNumber; advanceUntil(g, () => g.state.turnNumber !== t && g.state.activePlayer === 'player' && g.state.phase === 'upkeep'); };
const counters = (p, type = 'charge') => (p.counters || []).filter((c) => c.type === type).length;

// ── 1) Mana Vault ───────────────────────────────────────────────────────────────────────────────────────────
{
  const g = newGame(); const v = put(g, 'player', 'Mana Vault');
  tapMana(g, v); assert.deepEqual(g.state.player.mana, { ...EMPTY(), C: 3 }, '{T} : {C}{C}{C}'); assert.ok(get(g, v).tapped);
  assert.throws(() => tapMana(g, v), /engagé/i, 'déjà engagée');
  // Ne se dégage pas à son étape de dégagement ; au dernier tour : pas de paiement possible -> reste engagée ; blessure à la pioche.
  ownUpkeepNextTurn(g); assert.ok(get(g, v).tapped, "ne se dégage pas pendant l'étape de dégagement");
  console.log("OK V12.76.120.1 : Mana Vault -- {T} : {C}{C}{C} (3 mana), ne se dégage pas à l'étape de dégagement.");
}
{ // Entretien : pouvoir payer {4} pour la dégager (vrai choix) ; blessure à la pioche seulement si elle est toujours engagée.
  const run = (pool, decision) => {
    const g = newGame(); const v = put(g, 'player', 'Mana Vault'); tapMana(g, v); g.state.player.mana = EMPTY();
    ownUpkeepNextTurn(g); g.state.player.mana = { ...EMPTY(), ...pool }; settle(g);
    const p = g.choices.getPending(); assert.equal(p?.type, 'payToUntap', 'choix de payer {4}');
    return { g, v, p, finish: () => { g.choices.resolve(decision); } };
  };
  { const { g, v, p, finish } = run({ C: 4 }, 'pay'); assert.deepEqual(p.options, ['pay', 'decline']); finish();
    assert.ok(!get(g, v).tapped, 'payée : dégagée'); assert.equal(total(g.state.player.mana), 0, 'exactement {4} payé');
    advanceUntil(g, () => g.state.phase === 'draw'); assert.equal(g.state.player.life, 20, 'dégagée : aucune blessure à la pioche'); }
  { const { g, v, finish } = run({ C: 4 }, 'decline'); finish();
    assert.ok(get(g, v).tapped, 'refus : reste engagée'); assert.equal(total(g.state.player.mana), 4, 'rien payé');
    g.state.player.mana = EMPTY(); // (les 4 mana inutilisés brûleraient à la fin de la phase : règle de la brûlure de mana, hors sujet ici)
    advanceUntil(g, () => g.state.phase === 'draw'); assert.equal(g.state.player.life, 19, 'toujours engagée à la pioche : 1 blessure'); assert.equal(g.state.ai.life, 20); }
  { const { g, v, p } = run({ W: 1, U: 1, B: 1, R: 1 }, 'pay'); assert.deepEqual(p.options, ['pay', 'decline'], 'les {4} génériques se paient avec des couleurs'); g.choices.resolve('pay'); assert.ok(!get(g, v).tapped); }
  { const { p } = run({ C: 3 }, 'decline'); assert.deepEqual(p.options, ['decline'], '3 mana : le paiement est impossible'); }
  // Non engagée à l'entretien : aucun choix ; l'entretien de l'adversaire ne la concerne pas.
  { const g = newGame(); const v = put(g, 'player', 'Mana Vault'); ownUpkeepNextTurn(g); settle(g); assert.equal(g.choices.getPending(), null, 'non engagée : rien à payer'); assert.ok(!get(g, v).tapped); }
  { const g = newGame(); const v = put(g, 'player', 'Mana Vault'); tapMana(g, v); g.state.player.mana = EMPTY();
    advanceUntil(g, () => g.state.activePlayer === 'ai' && g.state.phase === 'upkeep'); g.state.player.mana = { ...EMPTY(), C: 4 }; settle(g); assert.equal(g.choices.getPending(), null, "entretien de l'adversaire : pas de paiement"); g.state.player.mana = EMPTY();
    advanceUntil(g, () => g.state.activePlayer === 'ai' && g.state.phase === 'draw'); assert.equal(g.state.player.life, 20, "pas de blessure à la pioche de l'adversaire"); }
  console.log("OK V12.76.120.2 : Mana Vault -- entretien : choix de payer {4} (couleurs mélangées ok, impossible à 3), blessure à la pioche seulement si engagée, jamais pendant le tour adverse.");
}

// ── 2) Basalt Monolith ──────────────────────────────────────────────────────────────────────────────────────
{
  const g = newGame(); const b = put(g, 'player', 'Basalt Monolith');
  tapMana(g, b); assert.deepEqual(g.state.player.mana, { ...EMPTY(), C: 3 }, '{T} : {C}{C}{C}'); assert.ok(get(g, b).tapped);
  g.state.player.mana = { ...EMPTY(), C: 2 }; assert.throws(() => ability(g, b, 0), /illégale|invalide/i, '{3} exigé : 2 mana ne suffisent pas'); assert.ok(get(g, b).tapped); assert.equal(total(g.state.player.mana), 2, 'rien dépensé sur un refus');
  g.state.player.mana = { ...EMPTY(), R: 1, G: 1, W: 1 }; ability(g, b, 0);
  assert.ok(!get(g, b).tapped, '{3} payés avec des couleurs : dégagé'); assert.equal(total(g.state.player.mana), 0, 'exactement {3} payé');
  tapMana(g, b); assert.equal(g.state.player.mana.C, 3, 'réutilisable après dégagement'); assert.ok(get(g, b).tapped);
  const g2 = newGame(); const b2 = put(g2, 'player', 'Basalt Monolith'); tapMana(g2, b2); g2.state.player.mana = EMPTY();
  ownUpkeepNextTurn(g2); settle(g2); assert.ok(get(g2, b2).tapped, 'ne se dégage pas pendant l\'étape de dégagement'); assert.equal(g2.choices.getPending(), null, 'pas de paiement à l\'entretien (≠ Mana Vault)');
  advanceUntil(g2, () => g2.state.phase === 'draw'); assert.equal(g2.state.player.life, 20, 'aucune blessure (≠ Mana Vault)');
  console.log("OK V12.76.120.3 : Basalt Monolith -- 3 mana, {3} (couleurs mélangées) pour le dégager, ne se dégage pas seul, pas de blessure.");
}

// ── 3) Les cinq Mana Batteries ──────────────────────────────────────────────────────────────────────────────
for (const [name, color] of Object.entries(COLORS).map(([n, c]) => [`${n} Mana Battery`, c])) {
  // a) {2},{T} : un marqueur de charge ; refus à 1 mana ; payable avec des couleurs ; engagée -> refusé
  { const g = newGame(); const b = put(g, 'player', name);
    g.state.player.mana = { ...EMPTY(), C: 1 }; assert.throws(() => ability(g, b, 0), /illégale|invalide/i, `${name} : {2} exigé`); assert.equal(counters(get(g, b)), 0); assert.ok(!get(g, b).tapped);
    g.state.player.mana = { ...EMPTY(), W: 1, U: 1 }; ability(g, b, 0);
    assert.equal(counters(get(g, b)), 1, 'un marqueur de charge'); assert.ok(get(g, b).tapped); assert.equal(total(g.state.player.mana), 0, 'exactement {2} payé');
    g.state.player.mana = { ...EMPTY(), C: 2 }; assert.throws(() => ability(g, b, 0), /illégale|invalide|engagé/i, 'engagée : refusé');
    assert.throws(() => ability(g, b, 1), /illégale|invalide|engagé/i, 'engagée : pas de mana non plus'); }
  // b) sans marqueur : 1 mana de SA couleur, aucun choix
  { const g = newGame(); const b = put(g, 'player', name); ability(g, b, 1);
    assert.equal(g.choices.getPending(), null, 'aucun marqueur : aucun choix'); assert.equal(g.state.player.mana[color], 1); assert.equal(total(g.state.player.mana), 1); assert.ok(get(g, b).tapped); }
  // c) avec N marqueurs : vrai choix 0..N, 1 + k mana de sa couleur, k marqueurs retirés
  for (const N of [1, 2, 3]) for (let k = 0; k <= N; k++) {
    const g = newGame(); const b = put(g, 'player', name, { counters: Array.from({ length: N }, () => ({ type: 'charge' })) });
    ability(g, b, 1); const p = g.choices.getPending();
    assert.equal(p?.type, 'number'); assert.deepEqual(p.options, Array.from({ length: N + 1 }, (_, i) => i), `${name} : choix 0..${N}`);
    assert.throws(() => g.choices.resolve(N + 1), /invalide/i, 'plus de marqueurs que disponibles : refusé');
    assert.equal(total(g.state.player.mana), 0, 'aucun mana avant le choix'); g.choices.resolve(k);
    assert.equal(g.state.player.mana[color], 1 + k, `${name} : ${N} marqueurs, ${k} retirés -> ${1 + k} mana ${color}`); assert.equal(total(g.state.player.mana), 1 + k, 'rien d\'autre');
    assert.equal(counters(get(g, b)), N - k, `${N - k} marqueurs restants`); assert.ok(get(g, b).tapped);
  }
}
{ // Accumulation sur plusieurs tours réels (elle se dégage normalement) ; marqueurs d'un autre type ignorés ; côté IA.
  const g = newGame(); const b = put(g, 'player', 'Red Mana Battery', { counters: [{ type: '+1/+1' }] });
  g.state.player.mana = { ...EMPTY(), C: 2 }; ability(g, b, 0); assert.equal(counters(get(g, b)), 1); assert.equal(counters(get(g, b), '+1/+1'), 1);
  ownUpkeepNextTurn(g); assert.ok(!get(g, b).tapped, 'se dégage normalement'); g.state.player.mana = { ...EMPTY(), C: 2 }; ability(g, b, 0); assert.equal(counters(get(g, b)), 2);
  g.state.player.mana = EMPTY(); get(g, b).tapped = false; ability(g, b, 1); const p = g.choices.getPending(); assert.deepEqual(p.options, [0, 1, 2], 'seuls les marqueurs de CHARGE comptent'); g.choices.resolve(2);
  assert.equal(g.state.player.mana.R, 3); assert.equal(counters(get(g, b), '+1/+1'), 1, 'l\'autre marqueur reste'); assert.equal(counters(get(g, b)), 0);
  const g2 = newGame(); const ai = put(g2, 'ai', 'Blue Mana Battery', { counters: [{ type: 'charge' }, { type: 'charge' }] }); ability(g2, ai, 1, 'ai'); g2.choices.resolve(2);
  assert.equal(g2.state.ai.mana.U, 3); assert.equal(total(g2.state.player.mana), 0, 'le mana va au contrôleur');
  console.log('OK V12.76.120.4 : Mana Batteries -- {2},{T} : marqueur ; {T} : 1 + k mana (choix réel 0..N, 5 couleurs, 18 combinaisons chacune), accumulation sur plusieurs tours, marqueurs d\'un autre type ignorés, côté IA.');
}
