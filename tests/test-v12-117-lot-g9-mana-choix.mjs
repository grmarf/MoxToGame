// V12.76 — Chantier 2, lot G9 : mana « au choix » et conditionnel (7 cartes).
// Black Lotus, Implements of Sacrifice, City of Brass, Urza's Mine / Power Plant / Tower, Fellwar Stone.
// Parties réelles : activation par le moteur, vrai choix de couleur (game.choices), coûts, sacrifice, blessure.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
const COLORS = ['W', 'U', 'B', 'R', 'G'];
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY();
  return g;
}
function put(g, side, name, extra = {}) {
  const uid = `${name}#${++seq}`;
  const p = { ...structuredClone(by(name)), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
const live = (g, p) => g.state[p.controller].battlefield.find((x) => x.uid === p.uid);
const inGy = (g, p) => g.state[p.owner].graveyard.some((x) => x.name === p.name);
const act = (g, p, side = 'player') => { g.state.priorityHolder = side; g.action('activateAbility', { permanent: live(g, p) || p, controller: side, abilityIndex: 0, target: null }); };
const tap = (g, p, side = 'player') => { g.state.priorityHolder = side; g.action('tapMana', { permanent: live(g, p), controller: side }); };
const ILLEGAL = /illégale|invalide/i;
const LOT = ['Black Lotus', 'Implements of Sacrifice', 'City of Brass', "Urza's Mine", "Urza's Power Plant", "Urza's Tower", 'Fellwar Stone'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const total = (m) => COLORS.reduce((a, c) => a + m[c], 0) + m.C;

// ── 1) Mana d'une couleur au choix : choix réel, quantité, coût, sacrifice, blessure ────────────────────────
//   n = quantité produite ; pay = mana du coût ; sac = la source est sacrifiée ; dmg = blessure à son contrôleur
const CHOICE = [
  { name: 'Black Lotus',             n: 3, pay: {},        sac: true },
  { name: 'Implements of Sacrifice', n: 2, pay: { C: 1 },  sac: true },
  { name: 'City of Brass',           n: 1, pay: {},        sac: false, dmg: 1 },
];
for (const row of CHOICE) {
  for (const color of COLORS) {
    const g = newGame(); const src = put(g, 'player', row.name); g.state.player.mana = { ...EMPTY(), ...row.pay };
    act(g, src);
    const pending = g.choices.getPending();
    assert.ok(pending && pending.type === 'manaColor', `${row.name} : un vrai choix de couleur est demandé`);
    assert.deepEqual(pending.options, COLORS, `${row.name} : les cinq couleurs sont proposées (pas de mana incolore)`);
    assert.equal(total(g.state.player.mana), 0, `${row.name} : aucun mana tant que la couleur n'est pas choisie (coût payé : pool vidé)`);
    if (row.sac) assert.ok(!live(g, src) && inGy(g, src), `${row.name} : sacrifiée au paiement du coût`); else assert.ok(live(g, src).tapped, `${row.name} : engagée`);
    assert.throws(() => g.choices.resolve('C'), /invalide/i, `${row.name} : le mana incolore n'est pas une couleur au choix`);
    g.choices.resolve(color);
    const m = g.state.player.mana;
    assert.equal(m[color], row.n, `${row.name} : ${row.n} mana ${color}`);
    assert.equal(total(m), row.n, `${row.name} : rien d'autre dans la réserve (${JSON.stringify(m)})`);
    assert.equal(g.state.player.life, 20 - (row.dmg || 0), `${row.name} : blessure à son contrôleur`);
    assert.equal(g.state.ai.life, 20, `${row.name} : l'adversaire n'est pas touché`);
  }
  console.log(`OK V12.76.117.1 : ${row.name} -> ${row.n} mana de la couleur choisie (5 couleurs), coût et ${row.sac ? 'sacrifice' : 'blessure'} vérifiés.`);
}
// Coûts : Implements exige {1} ; City of Brass ne se réactive pas engagée ; une source sacrifiée ne se réactive pas.
{ const g = newGame(); const s = put(g, 'player', 'Implements of Sacrifice'); g.state.player.mana = EMPTY(); assert.throws(() => act(g, s), ILLEGAL, 'Implements : {1} exigé'); assert.ok(live(g, s), 'Implements intacte'); }
{ const g = newGame(); const s = put(g, 'player', 'City of Brass'); act(g, s); g.choices.resolve('W'); assert.throws(() => act(g, s), ILLEGAL, 'City of Brass déjà engagée'); assert.equal(g.state.player.life, 19, 'une seule blessure'); }
{ const g = newGame(); const s = put(g, 'player', 'Black Lotus'); act(g, s); g.choices.resolve('R'); assert.throws(() => act(g, s), /introuvable|illégale|invalide/i, 'Black Lotus sacrifiée : plus d\'activation'); assert.equal(g.state.player.mana.R, 3); }
// City de l'IA : la blessure frappe l'IA, pas le joueur humain.
{ const g = newGame(); const s = put(g, 'ai', 'City of Brass'); g.state.ai.mana = EMPTY(); act(g, s, 'ai'); g.choices.resolve('B'); assert.equal(g.state.ai.life, 19); assert.equal(g.state.player.life, 20); assert.equal(g.state.ai.mana.B, 1); }
console.log("OK V12.76.117.2 : coûts exigés, pas de réactivation, la blessure de City of Brass frappe son contrôleur (humain ou IA).");

// ── 2) Urza's Mine / Power Plant / Tower : montant conditionnel (tous les sous-ensembles) ──────────────────
const URZA = ["Urza's Mine", "Urza's Power Plant", "Urza's Tower"];
const BONUS = { "Urza's Mine": 2, "Urza's Power Plant": 2, "Urza's Tower": 3 };
let cases = 0;
for (let mask = 1; mask < 8; mask++) {
  const owned = URZA.filter((_, i) => mask & (1 << i));
  for (const tapped of owned) {
    const g = newGame(); const perms = Object.fromEntries(owned.map((n) => [n, put(g, 'player', n, n === tapped ? {} : { tapped: true })])); // les autres peuvent être engagés : « contrôler » suffit
    tap(g, perms[tapped]);
    const others = URZA.filter((n) => n !== tapped);
    const full = others.every((n) => owned.includes(n));
    assert.equal(g.state.player.mana.C, full ? BONUS[tapped] : 1, `${tapped} avec ${owned.join('+')} : ${full ? BONUS[tapped] : 1} mana`);
    assert.equal(total(g.state.player.mana), g.state.player.mana.C, 'mana incolore uniquement');
    assert.ok(live(g, perms[tapped]).tapped, 'engagé');
    cases++;
  }
}
{ // Les terrains Urza de l'ADVERSAIRE ne comptent pas.
  const g = newGame(); const mine = put(g, 'player', "Urza's Mine"); put(g, 'ai', "Urza's Power Plant"); put(g, 'ai', "Urza's Tower");
  tap(g, mine); assert.equal(g.state.player.mana.C, 1, "les terrains d'Urza de l'adversaire ne comptent pas");
  assert.throws(() => tap(g, mine), /engagé/i, 'déjà engagé');
}
console.log(`OK V12.76.117.3 : Urza's Mine/Power Plant/Tower -- ${cases} configurations (tous les sous-ensembles) + terrains adverses ignorés.`);

// ── 3) Fellwar Stone : couleurs que les terrains de l'ADVERSAIRE pourraient produire ────────────────────────
const fellwar = ({ opp = [], own = [], side = 'player' } = {}) => {
  const g = newGame(); const other = side === 'player' ? 'ai' : 'player';
  const stone = put(g, side, 'Fellwar Stone'); own.forEach((n) => put(g, side, n)); opp.forEach((n) => put(g, other, n));
  g.state[side].mana = EMPTY(); act(g, stone, side);
  return { g, stone, side, pending: g.choices.getPending() };
};
{ const r = fellwar({ opp: ['Plains', 'Island'] }); assert.deepEqual(r.pending?.options, ['W', 'U'], 'Plains + Island -> W ou U'); assert.throws(() => r.g.choices.resolve('R'), /invalide/i, 'R (non proposée) refusée'); assert.throws(() => r.g.choices.resolve('C'), /invalide/i, 'incolore refusé'); r.g.choices.resolve('U'); assert.equal(r.g.state.player.mana.U, 1); assert.equal(total(r.g.state.player.mana), 1); assert.ok(live(r.g, r.stone).tapped); }
{ const r = fellwar({ opp: ['Mountain'] }); assert.equal(r.pending, null, 'une seule couleur : pas de choix'); assert.equal(r.g.state.player.mana.R, 1); assert.equal(total(r.g.state.player.mana), 1); }
{ const r = fellwar({ opp: [] }); assert.equal(r.pending, null); assert.equal(total(r.g.state.player.mana), 0, "l'adversaire n'a aucun terrain : aucun mana"); assert.ok(live(r.g, r.stone).tapped, 'la capacité est quand même activée (engagée)'); }
{ const r = fellwar({ opp: ['City of Brass'] }); assert.deepEqual(r.pending?.options, COLORS, 'City of Brass adverse -> les cinq couleurs'); }
{ const r = fellwar({ opp: ['Tundra'] }); assert.deepEqual(r.pending?.options, ['W', 'U'], 'terrain double W/U'); }
{ const r = fellwar({ opp: ["Urza's Mine"] }); assert.equal(r.pending, null); assert.equal(total(r.g.state.player.mana), 0, 'un terrain incolore ne donne aucune COULEUR'); }
{ const r = fellwar({ opp: ['Mox Pearl'] }); assert.equal(r.pending, null); assert.equal(total(r.g.state.player.mana), 0, "un Mox adverse n'est pas un terrain"); }
{ const r = fellwar({ opp: ['Island'], own: ['Forest', 'Swamp'] }); assert.equal(r.pending, null); assert.equal(r.g.state.player.mana.U, 1, 'seule la couleur des terrains adverses compte'); assert.equal(r.g.state.player.mana.G + r.g.state.player.mana.B, 0, 'mes propres terrains ne comptent pas'); }
{ const r = fellwar({ opp: ['Plains', 'Swamp'], side: 'ai' }); assert.deepEqual(r.pending?.options, ['W', 'B'], "Fellwar de l'IA : les terrains du JOUEUR comptent"); r.g.choices.resolve('B'); assert.equal(r.g.state.ai.mana.B, 1); assert.equal(total(r.g.state.player.mana), 0); }
{ const g = newGame(); const stone = put(g, 'player', 'Fellwar Stone'); put(g, 'ai', 'Plains'); act(g, stone); assert.equal(g.state.player.mana.W, 1, 'une seule couleur possible : mana immédiat'); assert.throws(() => act(g, stone), ILLEGAL, 'déjà engagée'); }
console.log("OK V12.76.117.4 : Fellwar Stone -- couleurs des terrains adverses (simple, double, 5 couleurs, incolore, Mox, aucun terrain, camp IA).");
