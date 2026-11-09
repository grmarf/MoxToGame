// V12.76 — Chantier 2, lot G7 : destruction / exil / sacrifice avec {T} (11 cartes).
// Dwarven Demolition Team, Goblin Digging Team, King Suleiman, Spinal Villain, Ramses Overdark, Merfolk Assassin, Scavenger Folk,
// Tormod's Crypt, Nevinyrral's Disk, Chaos Orb, Miracle Worker. Partie réelle : activation par le moteur, coûts structurés, cibles légales.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0;
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) g.state[p].library = Array.from({ length: 15 }, (_, i) => ({ uid: `${p}F${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player';
  g.state.turnNumber = 5; g.turnManager.turnNumber = 5; g.state.player.mana = EMPTY();
  return g;
}
function put(g, side, name, extra = {}) {
  const uid = `${name}#${++seq}`; // objectId distinct : le moteur retrouve une carte par uid OU objectId
  const p = { ...by(name), uid, objectId: uid, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, enteredTurn: 1, ...extra };
  g.state[side].battlefield.push(p); return p;
}
const live = (g, p) => g.state[p.controller].battlefield.find((x) => x.uid === p.uid);
const inPlay = (g, p) => !!live(g, p);
const inGy = (g, p) => g.state[p.owner].graveyard.some((x) => x.name === p.name);
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const tgtC = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
const tgtP = (side) => ({ kind: 'player', side });
function act(g, p, target = null, idx = 0) {
  g.state.priorityHolder = 'player';
  g.action('activateAbility', { permanent: live(g, p), controller: 'player', abilityIndex: idx, target });
  settle(g);
}
function cast(g, name) {
  const card = { ...by(name), uid: `${name}#${++seq}`, objectId: `${name}#${seq}`, owner: 'player', controller: 'player' };
  g.state.player.hand.push(card); g.state.player.mana = { C: 10, W: 10, U: 10, B: 10, R: 10, G: 10 }; g.state.priorityHolder = 'player';
  g.dispatch('CAST_SPELL', { card, xValue: 0 }, 'player'); settle(g);
  return g.state.player.battlefield.find((p) => p.uid === card.uid) || null;
}
const ILLEGAL = /illégale/i;
const LOT = ['Dwarven Demolition Team', 'Goblin Digging Team', 'King Suleiman', 'Spinal Villain', 'Ramses Overdark', 'Merfolk Assassin', 'Scavenger Folk', "Tormod's Crypt", "Nevinyrral's Disk", 'Chaos Orb', 'Miracle Worker'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Tableau : une capacité {T} qui détruit UNE cible d'un type précis ────
//   ok : cible légale (détruite) ; no : cibles refusées ; src : la source quitte-t-elle le jeu (sacrifice) ; cost : mana exigé
const TABLE = [
  { name: 'Dwarven Demolition Team', ok: ['ai', 'Wall of Stone'],       no: [['ai', 'Hill Giant']] },
  { name: 'Goblin Digging Team',     ok: ['ai', 'Wall of Wood'],        no: [['ai', 'Hill Giant']], sac: true },
  { name: 'King Suleiman',           ok: ['ai', 'Mahamoti Djinn'],      no: [['ai', 'Hill Giant'], ['ai', 'Wall of Stone']] },
  { name: 'King Suleiman',           ok: ['ai', 'Serendib Efreet'],     no: [['ai', 'Gray Ogre']] },
  { name: 'Spinal Villain',          ok: ['ai', 'Air Elemental'],       no: [['ai', 'Hill Giant'], ['ai', 'Serra Angel']] },
  { name: 'Merfolk Assassin',        ok: ['ai', 'Segovian Leviathan'],  no: [['ai', 'Hill Giant']] },
  { name: 'Scavenger Folk',          ok: ['ai', 'Sol Ring'],            no: [['ai', 'Hill Giant']], sac: true, cost: { G: 1 } },
];
for (const row of TABLE) {
  const g = newGame(); put(g, 'player', 'Forest'); put(g, 'player', 'Grizzly Bears');   // permanents posés AVANT la source
  const src = put(g, 'player', row.name); const victim = put(g, row.ok[0], row.ok[1]); const bystander = put(g, 'ai', 'Gray Ogre');
  g.state.player.mana = { ...EMPTY(), ...(row.cost || {}) };
  try { act(g, src, tgtC(victim)); } catch (e) { throw new Error(`${row.name} -> ${row.ok[1]} : ${e.message}`); }
  assert.ok(!inPlay(g, victim), `${row.name} : détruit ${row.ok[1]}`); assert.ok(inPlay(g, bystander), `${row.name} : rien d'autre n'est détruit`);
  if (row.sac) { assert.ok(!inPlay(g, src) && inGy(g, src), `${row.name} : se sacrifie`); assert.ok(g.state.player.battlefield.some((p) => p.name === 'Forest') && g.state.player.battlefield.some((p) => p.name === 'Grizzly Bears'), `${row.name} : les permanents posés avant ne sont pas sacrifiés`); }
  else assert.ok(live(g, src).tapped, `${row.name} : engagée`);
  for (const [side, nm] of row.no) {
    const h = newGame(); const s2 = put(h, 'player', row.name); const t2 = put(h, side, nm); h.state.player.mana = { ...EMPTY(), ...(row.cost || {}) };
    assert.throws(() => act(h, s2, tgtC(t2)), ILLEGAL, `${row.name} : ${nm} n'est pas une cible légale`); assert.ok(inPlay(h, t2));
  }
  if (row.cost) { const h = newGame(); const s2 = put(h, 'player', row.name); const t2 = put(h, row.ok[0], row.ok[1]); h.state.player.mana = EMPTY(); assert.throws(() => act(h, s2, tgtC(t2)), ILLEGAL, `${row.name} : mana du coût exigé`); }
  if (/Creature/.test(by(row.name).type)) { const h = newGame(); const s2 = put(h, 'player', row.name, { summoningSickness: true }); const t2 = put(h, row.ok[0], row.ok[1]); h.state.player.mana = { ...EMPTY(), ...(row.cost || {}) }; assert.throws(() => act(h, s2, tgtC(t2)), ILLEGAL, `${row.name} : mal d'invocation`); }
}

// ── Ramses Overdark : « créature enchantée » ────────────────────────────
{
  const g = newGame(); const ram = put(g, 'player', 'Ramses Overdark'); const host = put(g, 'ai', 'Hill Giant'); const bare = put(g, 'ai', 'Gray Ogre');
  put(g, 'ai', 'Giant Strength', { isAura: true, attachedTo: host.uid });
  assert.throws(() => act(g, ram, tgtC(bare)), ILLEGAL, 'Ramses : une créature sans Aura n\'est pas une cible');
  act(g, ram, tgtC(host)); assert.ok(!inPlay(g, host), 'Ramses : la créature enchantée est détruite'); assert.ok(inPlay(g, bare));
  // une Aura attachée à une AUTRE chose qu'une créature ne compte pas pour une créature voisine
  const h = newGame(); const ram2 = put(h, 'player', 'Ramses Overdark'); const a = put(h, 'ai', 'Hill Giant'); const b = put(h, 'ai', 'Gray Ogre');
  put(h, 'ai', 'Giant Strength', { isAura: true, attachedTo: a.uid }); assert.throws(() => act(h, ram2, tgtC(b)), ILLEGAL, 'Ramses : l\'Aura d\'une autre créature ne rend pas celle-ci enchantée');
}

// ── Miracle Worker : « l'Aura ciblée attachée à une créature que vous contrôlez » ──
{
  const g = newGame(); const mw = put(g, 'player', 'Miracle Worker'); const mine = put(g, 'player', 'Grizzly Bears'); const theirs = put(g, 'ai', 'Hill Giant');
  const myAura = put(g, 'ai', 'Weakness', { isAura: true, attachedTo: mine.uid }); const theirAura = put(g, 'player', 'Giant Strength', { isAura: true, attachedTo: theirs.uid });
  assert.throws(() => act(g, mw, tgtC(theirAura)), ILLEGAL, 'Miracle Worker : pas l\'Aura posée sur une créature adverse');
  assert.throws(() => act(g, mw, tgtC(mine)), ILLEGAL, 'Miracle Worker : une créature n\'est pas une Aura');
  act(g, mw, tgtC(myAura)); assert.ok(!inPlay(g, myAura), 'Miracle Worker : l\'Aura sur MA créature est détruite'); assert.ok(inPlay(g, mine) && inPlay(g, theirAura));
}

// ── Tormod's Crypt : exile le cimetière du joueur ciblé ──────────────────
{
  const g = newGame(); put(g, 'player', 'Forest'); const crypt = put(g, 'player', "Tormod's Crypt");
  g.state.ai.graveyard = ['Hill Giant', 'Gray Ogre', 'Forest'].map((n, i) => ({ ...by(n), uid: `AG${i}`, objectId: `AG${i}`, owner: 'ai', zone: 'graveyard' }));
  g.state.player.graveyard = [{ ...by('Grizzly Bears'), uid: 'PG0', objectId: 'PG0', owner: 'player', zone: 'graveyard' }];
  act(g, crypt, tgtP('ai'));
  assert.equal(g.state.ai.graveyard.length, 0, 'Crypt : cimetière adverse vidé'); assert.ok(g.state.ai.exile.length >= 3, 'Crypt : cartes retirées de la partie');
  assert.ok(g.state.player.graveyard.some((c) => c.name === 'Grizzly Bears'), 'Crypt : mon cimetière intact');
  assert.ok(!inPlay(g, crypt), 'Crypt : se sacrifie'); assert.ok(g.state.player.battlefield.some((p) => p.name === 'Forest'), 'Crypt : les permanents posés avant ne sont pas sacrifiés');
  const h = newGame(); const c2 = put(h, 'player', "Tormod's Crypt"); h.state.player.graveyard = [{ ...by('Grizzly Bears'), uid: 'PG1', objectId: 'PG1', owner: 'player', zone: 'graveyard' }];
  act(h, c2, tgtP('player')); assert.equal(h.state.player.graveyard.length, 0, 'Crypt : peut cibler mon propre cimetière');
}

// ── Nevinyrral's Disk : arrive engagé ; {1},{T} détruit artefacts, créatures et enchantements ──
{
  const g = newGame(); const disk = cast(g, "Nevinyrral's Disk"); assert.ok(disk, 'Disk résolu'); assert.equal(disk.tapped, true, 'Disk : arrive engagé');
  g.state.player.mana = { ...EMPTY(), C: 1 }; assert.throws(() => act(g, disk), ILLEGAL, 'Disk : engagé, inutilisable le tour où il arrive');
}
{
  const g = newGame(); const disk = put(g, 'player', "Nevinyrral's Disk");
  const killed = [put(g, 'player', 'Grizzly Bears'), put(g, 'ai', 'Hill Giant'), put(g, 'ai', 'Sol Ring'), put(g, 'player', 'Pestilence')];
  const kept = [put(g, 'player', 'Forest'), put(g, 'ai', 'Island')];
  g.state.player.mana = { ...EMPTY(), C: 1 }; act(g, disk);
  for (const p of killed) assert.ok(!inPlay(g, p), `Disk : ${p.name} (${p.type}) détruit`);
  assert.ok(!inPlay(g, disk) && inGy(g, disk), 'Disk : se détruit lui-même (artefact)');
  for (const p of kept) assert.ok(inPlay(g, p), `Disk : ${p.name} (terrain) épargné`);
  const h = newGame(); const d2 = put(h, 'player', "Nevinyrral's Disk"); h.state.player.mana = EMPTY(); assert.throws(() => act(h, d2), ILLEGAL, 'Disk : {1} exigé');
}

// ── Chaos Orb : détruit un permanent AU HASARD ──────────────────────────
{
  const hit = { 'Chaos Orb': 0, 'Hill Giant': 0, 'Forest': 0 };
  for (let i = 0; i < 80; i++) {
    const g = newGame(); const orb = put(g, 'player', 'Chaos Orb'); put(g, 'ai', 'Hill Giant'); put(g, 'player', 'Forest'); g.state.player.mana = { ...EMPTY(), C: 1 };
    act(g, orb);
    const left = [...g.state.player.battlefield, ...g.state.ai.battlefield].map((p) => p.name);
    const gone = Object.keys(hit).filter((n) => !left.includes(n));
    assert.equal(gone.length, 1, 'Chaos Orb : exactement UN permanent détruit'); hit[gone[0]]++;
  }
  for (const [n, k] of Object.entries(hit)) assert.ok(k > 0, `Chaos Orb : ${n} peut être détruit (au hasard parmi tous les permanents)`);
  const h = newGame(); const o2 = put(h, 'player', 'Chaos Orb'); h.state.player.mana = EMPTY(); assert.throws(() => act(h, o2), ILLEGAL, 'Chaos Orb : {1} exigé');
}
console.log('test-v12-110 OK');
