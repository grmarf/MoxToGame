// V12.76 — Chantier 2, lot G6 : dégâts à cible avec {T} (10 cartes) + correctifs de coûts.
// Orcish Artillery (correction : ses 3 blessures à son contrôleur manquaient), Pirate Ship, Aladdin's Ring, Island of Wak-Wak,
// Orcish Mechanics, D'Avenant Archer, Lady Caleria, Tor Wauki, Psionic Entity, Witch Hunter, Aeolipile.
// Partie réelle : activation par le moteur, pile, coûts structurés (sacrifice), combat du moteur, actions d'état.
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
const inGy = (g, p) => g.state[p.owner].graveyard.some((x) => x.name === p.name); // le passage au cimetière peut renouveler l'uid : on compare le nom
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const tgtP = (side) => ({ kind: 'player', side });
const tgtC = (p) => ({ kind: 'permanent', uid: p.uid, side: p.controller });
function act(g, p, target = null, idx = 0) {
  g.state.priorityHolder = 'player';
  g.action('activateAbility', { permanent: live(g, p), controller: 'player', abilityIndex: idx, target });
  settle(g);
}
const dmg = (g, p) => live(g, p)?.damageMarked || 0;
const LOT = ['Orcish Artillery', 'Pirate Ship', "Aladdin's Ring", 'Island of Wak-Wak', 'Orcish Mechanics', "D'Avenant Archer", 'Lady Caleria', 'Tor Wauki', 'Psionic Entity', 'Witch Hunter', 'Aeolipile'];
for (const n of LOT) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);

// ── 1. Orcish Artillery : 2 blessures à la cible ET 3 à son contrôleur ───
{
  const g = newGame(); const a = put(g, 'player', 'Orcish Artillery');
  act(g, a, tgtP('ai')); assert.equal(g.state.ai.life, 18, 'Artillery : 2 blessures au joueur ciblé'); assert.equal(g.state.player.life, 17, 'Artillery : 3 blessures à son contrôleur');
  assert.ok(live(g, a).tapped);
  const h = newGame(); const a2 = put(h, 'player', 'Orcish Artillery'); const giant = put(h, 'ai', 'Hill Giant');
  act(h, a2, tgtC(giant)); assert.equal(dmg(h, giant), 2, 'Artillery : 2 blessures à la créature'); assert.equal(h.state.player.life, 17, 'et toujours 3 à son contrôleur');
  const k = newGame(); put(k, 'player', 'Ali from Cairo'); const a3 = put(k, 'player', 'Orcish Artillery'); k.state.player.life = 2;
  act(k, a3, tgtP('ai')); assert.equal(k.state.player.life, 1, 'Artillery + Ali : la blessure de retour passe par le circuit canonique');
}

// ── 2. Aladdin's Ring : {8},{T} -> 4 blessures ──────────────────────────
{
  const g = newGame(); const r = put(g, 'player', "Aladdin's Ring"); g.state.player.mana = { ...EMPTY(), C: 8 };
  act(g, r, tgtP('ai')); assert.equal(g.state.ai.life, 16, 'Ring : 4 blessures'); assert.ok(live(g, r).tapped, 'Ring : engagé'); assert.equal(g.state.player.mana.C, 0, 'Ring : {8} payés');
  const h = newGame(); const r2 = put(h, 'player', "Aladdin's Ring"); h.state.player.mana = { ...EMPTY(), C: 7 };
  assert.throws(() => act(h, r2, tgtP('ai')), /illégale|insuffisant|Mana/i, 'Ring : 7 mana ne suffisent pas');
}

// ── 3. Island of Wak-Wak : 1 blessure à une créature avec vol ───────────
{
  const g = newGame(); const l = put(g, 'player', 'Island of Wak-Wak'); const air = put(g, 'ai', 'Air Elemental'); const giant = put(g, 'ai', 'Hill Giant');
  act(g, l, tgtC(air)); assert.equal(dmg(g, air), 1, 'Wak-Wak : 1 blessure à la créature volante'); assert.ok(live(g, l).tapped);
  const h = newGame(); const l2 = put(h, 'player', 'Island of Wak-Wak'); const g2 = put(h, 'ai', 'Hill Giant');
  assert.throws(() => act(h, l2, tgtC(g2)), /illégale/i, 'Wak-Wak : une créature sans vol n\'est pas une cible');
}

// ── 4. Aeolipile : {1},{T}, sacrifice de LUI-MÊME -> 2 blessures ────────
{
  const g = newGame(); put(g, 'player', 'Forest'); put(g, 'player', 'Grizzly Bears'); const ae = put(g, 'player', 'Aeolipile'); g.state.player.mana = { ...EMPTY(), C: 1 };
  act(g, ae, tgtP('ai')); assert.equal(g.state.ai.life, 18, 'Aeolipile : 2 blessures');
  assert.ok(!inPlay(g, ae) && inGy(g, ae), 'Aeolipile : c\'est ELLE qui est sacrifiée');
  assert.ok(g.state.player.battlefield.some((p) => p.name === 'Forest') && g.state.player.battlefield.some((p) => p.name === 'Grizzly Bears'), 'les autres permanents (posés AVANT) ne sont pas sacrifiés');
  const h = newGame(); const ae2 = put(h, 'player', 'Aeolipile'); h.state.player.mana = EMPTY();
  assert.throws(() => act(h, ae2, tgtP('ai')), /illégale|insuffisant|Mana/i, 'Aeolipile : {1} exigé');
}

// ── 5. Orcish Mechanics : sacrifier UN ARTEFACT (pas n'importe quel permanent) ──
{
  const g = newGame(); put(g, 'player', 'Forest'); const om = put(g, 'player', 'Orcish Mechanics'); const bear = put(g, 'player', 'Grizzly Bears'); const ring = put(g, 'player', 'Sol Ring');
  act(g, om, tgtP('ai')); assert.equal(g.state.ai.life, 18, 'Mechanics : 2 blessures');
  assert.ok(!inPlay(g, ring) && inGy(g, ring), 'Mechanics : l\'artefact est sacrifié');
  assert.ok(inPlay(g, bear) && inPlay(g, om) && g.state.player.battlefield.some((p) => p.name === 'Forest'), 'rien d\'autre n\'est sacrifié');
  const h = newGame(); put(h, 'player', 'Forest'); const om2 = put(h, 'player', 'Orcish Mechanics'); put(h, 'player', 'Grizzly Bears');
  assert.throws(() => act(h, om2, tgtP('ai')), /illégale/i, 'Mechanics : sans artefact, la capacité est illégale');
  assert.equal(h.state.ai.life, 20, 'Mechanics : et rien ne se passe');
}

// ── 6. Psionic Entity : 2 blessures à la cible, 3 à elle-même ───────────
{
  const g = newGame(); const pe = put(g, 'player', 'Psionic Entity'); const giant = put(g, 'ai', 'Hill Giant');
  act(g, pe, tgtC(giant)); assert.equal(dmg(g, giant), 2, 'Entity : 2 blessures à la cible');
  assert.ok(!inPlay(g, pe) && inGy(g, pe), 'Entity : 3 blessures à elle-même (2/2) -> meurt');
  assert.equal(g.state.player.life, 20, 'Entity : le joueur n\'est pas touché');
}

// ── 7. Pirate Ship : 1 blessure ; n'attaque que si le défenseur contrôle une Île ; sacrifiée sans Île ──
{
  const g = newGame(); put(g, 'player', 'Island'); const ps = put(g, 'player', 'Pirate Ship');
  act(g, ps, tgtP('ai')); assert.equal(g.state.ai.life, 19, 'Pirate Ship : 1 blessure');
  assert.ok(inPlay(g, ps), 'Pirate Ship : reste en jeu quand on contrôle une Île');
}
{ // restriction d'attaque : lue sur les Îles du DÉFENSEUR
  const g = newGame(); put(g, 'player', 'Island'); const ps = put(g, 'player', 'Pirate Ship');
  assert.ok(!g.combat.getValidAttackers('player').some((p) => p.uid === ps.uid), 'sans Île adverse : ne peut pas attaquer');
  put(g, 'ai', 'Swamp'); assert.ok(!g.combat.getValidAttackers('player').some((p) => p.uid === ps.uid), 'un Marais n\'est pas une Île');
  put(g, 'ai', 'Island'); assert.ok(g.combat.getValidAttackers('player').some((p) => p.uid === ps.uid), 'avec une Île adverse : peut attaquer');
}
{ // sacrifice quand on ne contrôle pas d'Île
  const g = newGame(); const ps = put(g, 'player', 'Pirate Ship'); g.stateBasedActions.check(g.state);
  assert.ok(!inPlay(g, ps) && inGy(g, ps), 'sans Île : le Navire est sacrifié');
  const h = newGame(); const isl = put(h, 'player', 'Island'); const ps2 = put(h, 'player', 'Pirate Ship'); h.stateBasedActions.check(h.state); assert.ok(inPlay(h, ps2), 'avec une Île : reste');
  h.state.player.battlefield = h.state.player.battlefield.filter((p) => p.uid !== isl.uid); h.stateBasedActions.check(h.state);
  assert.ok(!inPlay(h, ps2) && inGy(h, ps2), 'l\'Île disparaît : le Navire est sacrifié');
  const k = newGame(); put(k, 'ai', 'Island'); const ps3 = put(k, 'player', 'Pirate Ship'); k.stateBasedActions.check(k.state);
  assert.ok(!inPlay(k, ps3), 'l\'Île de l\'ADVERSAIRE ne compte pas pour « vous contrôlez »');
}

// ── 8. D'Avenant Archer / Lady Caleria / Tor Wauki : créature ATTAQUANTE OU BLOQUEUSE ──
// cibles à 4 d'endurance (Air Elemental 4/4) : la créature survit aux 3 blessures de Lady Caleria, on peut donc les compter
for (const [name, n] of [["D'Avenant Archer", 1], ['Lady Caleria', 3], ['Tor Wauki', 2]]) {
  const g = newGame(); const src = put(g, 'player', name); const atk = put(g, 'ai', 'Air Elemental'); const idle = put(g, 'ai', 'Gray Ogre');
  g.state.activePlayer = 'ai'; g.combat.begin(); g.combat.confirmAttackers([atk], 'ai');
  act(g, src, tgtC(atk)); assert.equal(dmg(g, atk), n, `${name} : ${n} blessure(s) à l'attaquante`); assert.ok(live(g, src).tapped);
  const h = newGame(); const s2 = put(h, 'player', name); const idle2 = put(h, 'ai', 'Gray Ogre'); const atk2 = put(h, 'ai', 'Air Elemental');
  h.state.activePlayer = 'ai'; h.combat.begin(); h.combat.confirmAttackers([atk2], 'ai');
  assert.throws(() => act(h, s2, tgtC(idle2)), /illégale/i, `${name} : une créature qui n'attaque pas n'est pas une cible`);
  // bloqueuse
  const k = newGame(); const s3 = put(k, 'ai', name); const atk3 = put(k, 'player', 'Gray Ogre'); const blk = put(k, 'ai', 'Air Elemental');
  k.combat.begin(); k.combat.confirmAttackers([atk3], 'player'); k.combat.assignBlockers({ [atk3.uid]: [blk.uid] });
  k.state.priorityHolder = 'ai'; k.action('activateAbility', { permanent: live(k, s3), controller: 'ai', abilityIndex: 0, target: tgtC(blk) }); settle(k);
  assert.equal(dmg(k, blk), n, `${name} : vaut aussi sur une créature BLOQUEUSE`);
}

// ── 9. Witch Hunter : 1 blessure au joueur / renvoie une créature adverse en main ──
{
  const g = newGame(); const wh = put(g, 'player', 'Witch Hunter');
  act(g, wh, tgtP('ai'), 0); assert.equal(g.state.ai.life, 19, 'Witch Hunter : 1 blessure au joueur ciblé');
  const h = newGame(); const wh2 = put(h, 'player', 'Witch Hunter'); const giant = put(h, 'ai', 'Hill Giant'); const mine = put(h, 'player', 'Grizzly Bears');
  h.state.player.mana = { ...EMPTY(), W: 2, C: 1 };
  act(h, wh2, tgtC(giant), 1);
  assert.ok(!inPlay(h, giant) && h.state.ai.hand.some((c) => c.name === 'Hill Giant'), 'Witch Hunter : la créature adverse retourne dans la main de son propriétaire');
  assert.deepEqual(Object.values(h.state.player.mana), [0, 0, 0, 0, 0, 0], 'Witch Hunter : {1}{W}{W} payés');
  const k = newGame(); const wh3 = put(k, 'player', 'Witch Hunter'); const mine2 = put(k, 'player', 'Grizzly Bears'); k.state.player.mana = { ...EMPTY(), W: 2, C: 1 };
  assert.throws(() => act(k, wh3, tgtC(mine2), 1), /illégale/i, 'Witch Hunter : pas sur sa propre créature');
}
console.log('test-v12-109 OK');
