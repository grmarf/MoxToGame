// V12.76 — Chantier 2, lot G8 : bonus de force/endurance et mots-clés avec {T} (10 cartes) + primitive « linceul » (shroud).
// Pixie Queen, Pradesh Gypsies, Tuknir Deathlock, Armor Thrull, Radjan Spirit, Bone Flute, Orc General, Elven Lyre, Svyelunite Priest,
// Scarwood Hag. Partie réelle : activation par le moteur, caractéristiques EFFECTIVES (couches), fin de tour, ciblage, combat.
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import { keywordsOf } from '../src/core/keywords.js';
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
const chars = (g, p) => calculateCharacteristics(g.state, live(g, p));
const pt = (g, p) => { const c = chars(g, p); return `${c.power}/${c.toughness}`; };
const kws = (g, p) => chars(g, p).keywords;
// vraie fin de tour : on fait avancer les phases du gestionnaire de tour jusqu'au nettoyage (les effets « jusqu'à la fin du tour » y sont retirés)
const endTurn = (g) => { for (let i = 0; i < 14 && g.state.phase !== 'cleanup'; i++) g.turnManager.nextPhase(); assert.equal(g.state.phase, 'cleanup'); };
const ILLEGAL = /illégale/i;
const bump = (v, dp, dt) => { const [a, b] = v.split('/').map(Number); return `${a + dp}/${b + dt}`; };
const LOT = ['Pixie Queen', 'Pradesh Gypsies', 'Tuknir Deathlock', 'Armor Thrull', 'Radjan Spirit', 'Bone Flute', 'Orc General', 'Elven Lyre', 'Svyelunite Priest', 'Scarwood Hag'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── Tableau : une capacité {T} qui change UNE créature ciblée (Hill Giant 3/3 comme cible neutre) ──
//   pt : caractéristiques attendues de la cible ; kw : mot-clé gagné ; cost : mana exigé
const TABLE = [
  { name: 'Pixie Queen',      cost: { G: 3 },        kw: 'flying' },
  { name: 'Pradesh Gypsies',  cost: { G: 1, C: 1 },  pt: '1/3' },
  { name: 'Tuknir Deathlock', cost: { R: 1, G: 1 },  pt: '5/5' },
  { name: 'Armor Thrull',     cost: {},              pt: '4/5' },
];
for (const row of TABLE) {
  const g = newGame(); put(g, 'player', 'Forest'); const src = put(g, 'player', row.name); const target = put(g, 'ai', 'Hill Giant'); const other = put(g, 'ai', 'Gray Ogre');
  g.state.player.mana = { ...EMPTY(), ...row.cost }; act(g, src, tgtC(target));
  if (row.pt) assert.equal(pt(g, target), row.pt, `${row.name} : la cible passe à ${row.pt}`);
  if (row.kw) assert.ok(kws(g, target).includes(row.kw), `${row.name} : la cible gagne ${row.kw}`);
  assert.equal(pt(g, other), '2/2', `${row.name} : l'autre créature n'est pas touchée`); assert.ok(live(g, src).tapped, `${row.name} : engagée`);
  assert.deepEqual(Object.values(g.state.player.mana), [0, 0, 0, 0, 0, 0], `${row.name} : coût payé exactement`);
  endTurn(g); assert.equal(pt(g, target), '3/3', `${row.name} : l'effet cesse à la fin du tour`); assert.ok(!kws(g, target).includes('flying'), `${row.name} : le mot-clé cesse à la fin du tour`);
  const h = newGame(); const s2 = put(h, 'player', row.name); const t2 = put(h, 'ai', 'Hill Giant');
  if (Object.keys(row.cost).length) { h.state.player.mana = EMPTY(); assert.throws(() => act(h, s2, tgtC(t2)), ILLEGAL, `${row.name} : mana du coût exigé`); }
  const k = newGame(); const s3 = put(k, 'player', row.name, { summoningSickness: true }); const t3 = put(k, 'ai', 'Hill Giant'); k.state.player.mana = { ...EMPTY(), ...row.cost };
  assert.throws(() => act(k, s3, tgtC(t3)), ILLEGAL, `${row.name} : mal d'invocation`);
  const m = newGame(); const s4 = put(m, 'player', row.name); m.state.player.mana = { ...EMPTY(), ...row.cost }; assert.throws(() => act(m, s4, tgtP('ai')), ILLEGAL, `${row.name} : un joueur n'est pas une cible`);
}
{ const g = newGame(); const q = put(g, 'player', 'Pixie Queen'); assert.ok(kws(g, q).includes('flying'), 'Pixie Queen : vol propre'); }
{ const g = newGame(); const d = put(g, 'player', 'Tuknir Deathlock'); assert.ok(kws(g, d).includes('flying'), 'Tuknir Deathlock : vol propre'); }

// ── Radjan Spirit : « perd le vol jusqu'à la fin du tour » (temporaire) ─────────
{
  const g = newGame(); const rs = put(g, 'player', 'Radjan Spirit'); const air = put(g, 'ai', 'Air Elemental'); const ground = put(g, 'ai', 'Hill Giant');
  assert.ok(kws(g, air).includes('flying'));
  act(g, rs, tgtC(air)); assert.ok(!kws(g, air).includes('flying'), 'Radjan Spirit : la créature perd le vol');
  assert.equal(pt(g, air), '4/4', 'caractéristiques intactes');
  endTurn(g); assert.ok(kws(g, air).includes('flying'), 'Radjan Spirit : le vol revient à la fin du tour (perte TEMPORAIRE)');
  // le vol perdu n'est plus compté en combat : un attaquant sans vol peut être bloqué par... et la créature perd son évasion
  const h = newGame(); const rs2 = put(h, 'player', 'Radjan Spirit'); const flyer = put(h, 'player', 'Air Elemental'); const wall = put(h, 'ai', 'Wall of Stone');
  h.combat.begin(); h.combat.confirmAttackers([flyer], 'player'); assert.ok(!h.combat.getValidBlockers('ai', flyer).some((b) => b.uid === wall.uid), 'témoin : un Mur sans vol/allonge ne bloque pas un volant');
  const k = newGame(); const rs3 = put(k, 'player', 'Radjan Spirit'); const fl2 = put(k, 'ai', 'Air Elemental'); const w2 = put(k, 'player', 'Wall of Stone');
  act(k, rs3, tgtC(fl2)); k.state.activePlayer = 'ai'; k.combat.begin(); k.combat.confirmAttackers([fl2], 'ai');
  assert.ok(k.combat.getValidBlockers('player', fl2).some((b) => b.uid === w2.uid), 'Radjan Spirit : le Mur peut bloquer la créature qui a perdu le vol');
}

{ // la lecture « brute » des mots-clés (aide historique) tient compte de la perte temporaire
  const p = { ...by('Air Elemental'), tempLostKeywords: ['flying'], tempKeywords: [] };
  assert.ok(!keywordsOf(p).includes('flying'), 'keywordsOf : le vol perdu jusqu\'à la fin du tour n\'est plus compté');
  assert.ok(keywordsOf({ ...by('Air Elemental') }).includes('flying'), 'témoin : sans perte, le vol est compté');
}

// ── Bone Flute : -1/-0 pour TOUTES les créatures ───────────────────────────
{
  const g = newGame(); const bf = put(g, 'player', 'Bone Flute'); const mine = put(g, 'player', 'Hill Giant'); const theirs = put(g, 'ai', 'Gray Ogre'); const land = put(g, 'ai', 'Forest');
  g.state.player.mana = { ...EMPTY(), C: 2 }; act(g, bf);
  assert.equal(pt(g, mine), '2/3', 'Bone Flute : mes créatures aussi'); assert.equal(pt(g, theirs), '1/2', 'Bone Flute : celles de l\'adversaire');
  assert.ok(!/Creature/.test(chars(g, land).type), 'les terrains ne sont pas touchés'); assert.ok(live(g, bf).tapped);
  endTurn(g); assert.equal(pt(g, mine), '3/3', 'Bone Flute : fin de tour'); assert.equal(pt(g, theirs), '2/2');
  const h = newGame(); const b2 = put(h, 'player', 'Bone Flute'); h.state.player.mana = { ...EMPTY(), C: 1 }; assert.throws(() => act(h, b2), ILLEGAL, 'Bone Flute : {2} exigés');
}

// ── Orc General : sacrifier UN AUTRE Orc ou Gobelin ; les AUTRES Orcs gagnent +1/+1 ──
{
  const g = newGame(); put(g, 'player', 'Forest'); put(g, 'player', 'Grizzly Bears');
  const gen = put(g, 'player', 'Orc General'); const orcA = put(g, 'player', 'Ironclaw Orcs'); const orcB = put(g, 'ai', 'Brassclaw Orcs'); const gob = put(g, 'player', "Mons's Goblin Raiders");
  const bears = live(g, put(g, 'player', 'Hill Giant'));
  const before = { A: pt(g, orcA), B: pt(g, orcB), G: pt(g, gen), gob: pt(g, gob) };
  act(g, gen);
  const sacrificed = [orcA, gob].filter((p) => !inPlay(g, p));
  assert.equal(sacrificed.length, 1, 'Orc General : exactement UN autre Orc ou Gobelin est sacrifié');
  assert.ok(inPlay(g, gen), 'Orc General : ne se sacrifie pas lui-même'); assert.ok(g.state.player.battlefield.some((p) => p.name === 'Forest') && g.state.player.battlefield.some((p) => p.name === 'Grizzly Bears'), 'les permanents posés avant ne sont pas sacrifiés');
  assert.equal(pt(g, gen), before.G, 'Orc General : lui-même non touché'); assert.equal(pt(g, orcB), bump(before.B, 1, 1), 'Orc General : l\'Orc adverse gagne +1/+1 aussi'); assert.equal(pt(g, bears), '3/3', 'une créature non Orc/Gobelin n\'est pas touchée');
  if (inPlay(g, orcA)) assert.equal(pt(g, orcA), bump(before.A, 1, 1), 'Orc General : l\'autre Orc gagne +1/+1'); else assert.equal(pt(g, gob), before.gob, 'le Gobelin (non Orc) n\'est pas pompé');
  endTurn(g); assert.equal(pt(g, orcB), before.B, 'Orc General : fin de tour');
  const h = newGame(); const g2 = put(h, 'player', 'Orc General'); put(h, 'player', 'Grizzly Bears');
  assert.throws(() => act(h, g2), ILLEGAL, 'Orc General : sans autre Orc ou Gobelin à sacrifier, la capacité est illégale'); assert.ok(inPlay(h, g2));
}

{ // le sacrifice accepte un Orc OU un Gobelin : un Gobelin seul suffit (et un Orc seul aussi)
  const g = newGame(); const gen = put(g, 'player', 'Orc General'); const gob = put(g, 'player', "Mons's Goblin Raiders"); put(g, 'player', 'Grizzly Bears');
  act(g, gen); assert.ok(!inPlay(g, gob) && inGy(g, gob), 'Orc General : un Gobelin seul peut être sacrifié'); assert.ok(inPlay(g, gen));
  const h = newGame(); const g2 = put(h, 'player', 'Orc General'); const orc = put(h, 'player', 'Ironclaw Orcs');
  act(h, g2); assert.ok(!inPlay(h, orc) && inGy(h, orc), 'Orc General : un Orc seul peut être sacrifié');
}

// ── Elven Lyre : {1},{T}, sacrifice de LUI-MÊME : +2/+2 ───────────────────
{
  const g = newGame(); put(g, 'player', 'Forest'); put(g, 'player', 'Grizzly Bears'); const lyre = put(g, 'player', 'Elven Lyre'); const t = put(g, 'ai', 'Hill Giant');
  g.state.player.mana = { ...EMPTY(), C: 1 }; act(g, lyre, tgtC(t));
  assert.equal(pt(g, t), '5/5', 'Elven Lyre : +2/+2'); assert.ok(!inPlay(g, lyre) && inGy(g, lyre), 'Elven Lyre : se sacrifie');
  assert.ok(g.state.player.battlefield.some((p) => p.name === 'Forest') && g.state.player.battlefield.some((p) => p.name === 'Grizzly Bears'), 'rien d\'autre n\'est sacrifié');
  const h = newGame(); const l2 = put(h, 'player', 'Elven Lyre'); const t2 = put(h, 'ai', 'Hill Giant'); h.state.player.mana = EMPTY(); assert.throws(() => act(h, l2, tgtC(t2)), ILLEGAL, 'Elven Lyre : {1} exigé');
}

// ── Svyelunite Priest : linceul, seulement pendant VOTRE entretien ─────────
{
  const g = newGame(); const sp = put(g, 'player', 'Svyelunite Priest'); const t = put(g, 'player', 'Grizzly Bears'); g.state.player.mana = { ...EMPTY(), U: 2 };
  assert.throws(() => act(g, sp, tgtC(t)), ILLEGAL, 'Priest : illégale en dehors de l\'entretien');
  g.state.phase = 'upkeep'; act(g, sp, tgtC(t)); assert.ok(kws(g, t).includes('shroud'), 'Priest : la cible gagne le linceul');
  g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  // le linceul interdit tout ciblage : sort ET capacité, par l'un ou l'autre camp
  const bolt = { ...by('Lightning Bolt'), uid: `bolt#${++seq}`, objectId: `bolt#${seq}`, owner: 'ai', controller: 'ai' };
  g.state.ai.hand.push(bolt); g.state.ai.mana = { ...EMPTY(), R: 1 }; g.state.priorityHolder = 'ai'; g.state.activePlayer = 'ai';
  assert.throws(() => g.dispatch('CAST_SPELL', { card: bolt, xValue: 0, target: tgtC(t) }, 'ai'), /illégale|cible/i, 'linceul : un sort ne peut pas cibler la créature');
  const art = put(g, 'ai', 'Orcish Artillery'); g.state.priorityHolder = 'ai';
  assert.throws(() => g.action('activateAbility', { permanent: live(g, art), controller: 'ai', abilityIndex: 0, target: tgtC(t) }), ILLEGAL, 'linceul : une capacité ne peut pas la cibler');
  assert.ok(inPlay(g, t) && !(live(g, t).damageMarked > 0), 'la créature n\'a subi aucun dégât');
  endTurn(g); assert.ok(!kws(g, t).includes('shroud'), 'Priest : le linceul cesse à la fin du tour');
  // sans linceul : ciblable
  const h = newGame(); const t2 = put(h, 'ai', 'Hill Giant'); const art2 = put(h, 'player', 'Orcish Artillery'); act(h, art2, tgtC(t2)); assert.equal(live(h, t2).damageMarked, 2, 'témoin : sans linceul, la créature est ciblable');
  // le linceul n'empêche pas les effets qui ne ciblent pas
  const k = newGame(); const t3 = put(k, 'ai', 'Grizzly Bears', { tempKeywords: ['shroud'] }); const bf = put(k, 'player', 'Bone Flute'); k.state.player.mana = { ...EMPTY(), C: 2 }; act(k, bf);
  assert.equal(pt(k, t3), '1/2', 'linceul : un effet de masse (sans cible) l\'affecte quand même');
}

// ── Scarwood Hag : forestwalk jusqu'à la fin du tour (réel : combat) ──────
{
  const g = newGame(); const hag = put(g, 'player', 'Scarwood Hag'); const att = put(g, 'player', 'Hill Giant'); const blocker = put(g, 'ai', 'Gray Ogre'); put(g, 'ai', 'Forest');
  g.combat.begin(); g.combat.confirmAttackers([att], 'player');
  assert.ok(g.combat.getValidBlockers('ai', att).some((b) => b.uid === blocker.uid), 'témoin : sans forestwalk, le blocage est possible');
  const h = newGame(); const hag2 = put(h, 'player', 'Scarwood Hag'); const att2 = put(h, 'player', 'Hill Giant'); const blk2 = put(h, 'ai', 'Gray Ogre'); put(h, 'ai', 'Forest');
  h.state.player.mana = { ...EMPTY(), G: 4 }; act(h, hag2, tgtC(att2)); assert.ok(kws(h, att2).includes('forestwalk'), 'Scarwood Hag : la cible gagne forestwalk ({G}{G}{G}{G},{T})');
  h.combat.begin(); h.combat.confirmAttackers([att2], 'player');
  assert.ok(!h.combat.getValidBlockers('ai', att2).some((b) => b.uid === blk2.uid), 'Scarwood Hag : l\'attaquant ne peut pas être bloqué si le défenseur contrôle une Forêt');
  const k = newGame(); const hag3 = put(k, 'player', 'Scarwood Hag'); const att3 = put(k, 'player', 'Hill Giant'); const blk3 = put(k, 'ai', 'Gray Ogre'); put(k, 'ai', 'Island');
  k.state.player.mana = { ...EMPTY(), G: 4 }; act(k, hag3, tgtC(att3)); k.combat.begin(); k.combat.confirmAttackers([att3], 'player');
  assert.ok(k.combat.getValidBlockers('ai', att3).some((b) => b.uid === blk3.uid), 'Scarwood Hag : sans Forêt chez le défenseur, le blocage reste possible');
  endTurn(h); assert.ok(!kws(h, att2).includes('forestwalk'), 'Scarwood Hag : fin de tour');
}
console.log('test-v12-111 OK');
