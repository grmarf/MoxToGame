// V12.76 (G26) — Auras de combat et de ciblage : Gaseous Form, Demonic Torment, Seeker, Brainwash, Artifact Ward, Spirit Shackle, Spectral Cloak.
// Oracle : Gaseous Form et Demonic Torment vérifiés (Scryfall 4ED n°74, Legends n°95) ; Seeker, Brainwash, Artifact Ward, Spirit Shackle, Spectral Cloak : texte de la base concordant avec l'Oracle connu (à confirmer sur fiche).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
const EMPTY = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 30 }, (_, i) => ({ uid: `${p}F${i}`, objectId: `${p}FO${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai'); g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; g.state.player.mana = EMPTY(); g.state.ai.mana = EMPTY(); return g;
}
const put = (g, side, name, extra = {}) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false, ...extra }; g.state[side].battlefield.push(p); g.triggerEngine?.syncBattlefield?.(g.state); return p; };
const pT = (p) => ({ kind: 'permanent', uid: p.uid });
const live = (g, p) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((q) => q.uid === p.uid);
const has = (g, p) => !!live(g, p);
const inGy = (g, p) => g.state[p.owner].graveyard.some((c) => c.name === p.name);
function cast(g, name, target, x = 0, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side);
  for (let i = 0; i < 6 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; g.state[side].mana = EMPTY(); return card;
}
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const act = (g, p, side = 'player', extra = {}, mana = FULL) => { g.state.priorityHolder = side; g.state[side].mana = { ...mana }; g.action('activateAbility', { permanent: live(g, p), controller: side, abilityIndex: 0, ...extra }); settle(g); };
const advanceUntil = (g, pred, max = 90) => { for (let i = 0; i < max && !pred(); i++) { g.turnManager.nextPhase(); if (!pred()) settle(g); } assert.ok(pred(), `condition non atteinte (phase ${g.state.phase}, tour de ${g.state.activePlayer})`); };
const upkeepOf = (g, side) => { const t = g.state.turnNumber; advanceUntil(g, () => g.state.turnNumber !== t && g.state.activePlayer === side && g.state.phase === 'upkeep'); };
const order = (g, n = 3) => { const out = []; for (let i = 0; i < 80 && out.length < n; i++) { g.turnManager.nextPhase(); if (g.state.phase === 'upkeep') out.push(g.state.activePlayer); } return out; };

import { calculateCharacteristics } from '../src/core/continuous-effects.js';

const NAMES = ['Gaseous Form', 'Demonic Torment', 'Seeker', 'Brainwash', 'Artifact Ward', 'Spirit Shackle', 'Spectral Cloak'];
for (const n of NAMES) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const fight = (g, atts, blocks = {}, side = 'player') => { g.state.activePlayer = side; g.turnManager.activePlayer = side; g.combat.begin(); g.combat.confirmAttackers(atts, side); settle(g); g.combat.assignBlockers(blocks); g.combat.resolveDamage(); settle(g); };
const dmg = (g, p) => (live(g, p) ? live(g, p).damageMarked || 0 : -1); // -1 = la créature n'existe plus (jamais « 0 blessure » par omission)
const tough = (g, p) => calculateCharacteristics(g.state, live(g, p)).toughness;
const attackers = (g, side = 'player') => g.combat.getValidAttackers(side).map((p) => p.uid);
const blockers = (g, attacker, side = 'ai') => g.combat.getValidBlockers(side, attacker).map((p) => p.name);
const mana = (g, side, pool) => { g.state[side].mana = { ...EMPTY(), ...pool }; };

// ── Gaseous Form : toute blessure de combat INFLIGÉE ou SUBIE par la créature enchantée est prévenue ───────────
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Gaseous Form', pT(giant)); const bears = put(g, 'ai', 'Grizzly Bears');
  fight(g, [giant], { [giant.uid]: [bears.uid] }); assert.equal(dmg(g, bears), 0, 'attaquante enchantée : n\'inflige rien au bloqueur'); assert.equal(dmg(g, giant), 0, 'et ne subit rien'); assert.ok(has(g, bears) && has(g, giant)); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Gaseous Form', pT(giant)); const l0 = g.state.ai.life; fight(g, [giant], {}); assert.equal(g.state.ai.life, l0, 'non bloquée : aucune blessure au joueur'); }
{ const g = newGame(); const bears = put(g, 'player', 'Grizzly Bears'); cast(g, 'Gaseous Form', pT(bears)); const giant = put(g, 'ai', 'Hill Giant');
  fight(g, [giant], { [giant.uid]: [bears.uid] }, 'ai'); assert.equal(dmg(g, bears), 0, 'bloqueur enchanté : ne subit rien (un 3/3 le frappe)'); assert.equal(dmg(g, giant), 0, 'et n\'inflige rien'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); const bears = put(g, 'ai', 'Grizzly Bears'); fight(g, [giant], { [giant.uid]: [bears.uid] }); assert.ok(!has(g, bears), 'témoin sans Aura : le Grizzly meurt'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Gaseous Form', pT(giant)); const bears = put(g, 'ai', 'Grizzly Bears'); const aura = g.state.player.battlefield.find((p) => p.name === 'Gaseous Form'); cast(g, 'Disenchant', pT(aura));
  fight(g, [giant], { [giant.uid]: [bears.uid] }); assert.ok(!has(g, bears), 'Aura partie : les blessures de combat reviennent'); }

// ── Demonic Torment : ne peut pas attaquer ; ses blessures de combat sont prévenues (mais il subit les siennes) ────
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); const other = put(g, 'player', 'Grizzly Bears'); cast(g, 'Demonic Torment', pT(giant));
  assert.deepEqual(attackers(g), [other.uid], 'la créature enchantée n\'est pas une attaquante légale'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([giant], 'player'); assert.equal(g.combat.combat.attackers.length, 0, 'la déclarer ne l\'ajoute pas'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Demonic Torment', pT(giant)); const bears = put(g, 'ai', 'Grizzly Bears');
  fight(g, [bears], { [bears.uid]: [giant.uid] }, 'ai'); assert.equal(dmg(g, bears), 0, 'bloqueur enchanté : n\'inflige AUCUNE blessure'); assert.equal(dmg(g, giant), 2, 'mais subit celles du Grizzly (seules les blessures INFLIGÉES sont prévenues)'); }

// ── Seeker : bloquée seulement par des créatures-artefacts et/ou blanches ──────────────────────────────────────
{ const g = newGame(); const s = put(g, 'player', 'Grizzly Bears'); cast(g, 'Seeker', pT(s)); const giant = put(g, 'ai', 'Hill Giant'); const clay = put(g, 'ai', 'Clay Statue'); const lions = put(g, 'ai', 'Savannah Lions'); const bat = put(g, 'ai', 'Scathe Zombies');
  g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([s], 'player'); const b = blockers(g, s);
  assert.ok(b.includes('Clay Statue') && b.includes('Savannah Lions'), 'créature-artefact et créature blanche : peuvent bloquer'); assert.ok(!b.includes('Hill Giant') && !b.includes('Scathe Zombies'), 'rouge et noire : non'); void giant; void bat; }
{ const g = newGame(); const s = put(g, 'player', 'Grizzly Bears'); const giant = put(g, 'ai', 'Hill Giant'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([s], 'player'); assert.ok(blockers(g, s).includes('Hill Giant'), 'témoin : sans Seeker, le Géant bloque'); }

// ── Brainwash : ne peut pas attaquer À MOINS que son contrôleur ne paie {3} ────────────────────────────────────
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Brainwash', pT(giant)); mana(g, 'player', {});
  assert.ok(!attackers(g).includes(giant.uid), 'sans mana : ne peut pas attaquer'); mana(g, 'player', { C: 2 }); assert.ok(!attackers(g).includes(giant.uid), '2 mana : insuffisant');
  mana(g, 'player', { C: 3 }); assert.ok(attackers(g).includes(giant.uid), '3 mana : peut attaquer'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([giant], 'player'); settle(g);
  assert.equal(g.combat.combat.attackers.length, 1, 'attaque déclarée'); assert.equal(Object.values(g.state.player.mana).reduce((a, b) => a + b, 0), 0, '{3} payés exactement'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); const bears = put(g, 'player', 'Grizzly Bears'); cast(g, 'Brainwash', pT(giant)); mana(g, 'player', { R: 3, G: 2 }); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([giant, bears], 'player'); settle(g);
  assert.equal(g.combat.combat.attackers.length, 2, 'la taxe ne frappe que la créature enchantée'); assert.equal(Object.values(g.state.player.mana).reduce((a, b) => a + b, 0), 2, '{3} payés, 2 restent (les {3} se paient avec n\'importe quelles couleurs)'); }
{ const g = newGame(); const bears = put(g, 'ai', 'Grizzly Bears'); cast(g, 'Brainwash', pT(bears)); mana(g, 'ai', { C: 3 }); assert.ok(attackers(g, 'ai').includes(bears.uid), 'Aura posée sur la créature ADVERSE : c\'est SON contrôleur qui paie'); mana(g, 'ai', {}); assert.ok(!attackers(g, 'ai').includes(bears.uid)); }

// ── Artifact Ward : protection contre les artefacts ────────────────────────────────────────────────────────────
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Artifact Ward', pT(giant)); put(g, 'ai', 'Clay Statue'); put(g, 'ai', 'Grizzly Bears'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([giant], 'player');
  const b = blockers(g, giant); assert.ok(!b.includes('Clay Statue'), 'ne peut pas être bloquée par une créature-artefact'); assert.ok(b.includes('Grizzly Bears'), 'mais par les autres'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Artifact Ward', pT(giant)); const clay = put(g, 'ai', 'Clay Statue');
  fight(g, [clay], { [clay.uid]: [giant.uid] }, 'ai'); assert.equal(dmg(g, giant), 0, 'les blessures d\'une créature-artefact sont prévenues'); assert.ok(dmg(g, clay) >= 3 || !has(g, clay), 'et elle subit les blessures du Géant'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Artifact Ward', pT(giant)); const icy = put(g, 'ai', 'Icy Manipulator');
  assert.throws(() => act(g, icy, 'ai', { target: pT(giant) }), /illégale/i, 'une capacité d\'artefact ne peut pas la cibler'); assert.equal(live(g, giant).tapped, false);
  cast(g, 'Lightning Bolt', pT(giant), 0, 'ai'); assert.ok(!has(g, giant), 'témoin : un sort NON artefact (Éclair) la cible légalement et tue le 3/3'); }

// ── Spirit Shackle : à CHAQUE fois que la créature enchantée s'engage, marqueur -0/-2 ─────────────────────────
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Spirit Shackle', pT(giant)); assert.equal(tough(g, giant), 3);
  fight(g, [giant], {}); assert.equal(live(g, giant).counters.filter((c) => c.type === '-0/-2').length, 1, 'un marqueur après s\'être engagée (attaque)'); assert.equal(tough(g, giant), 1, '3/3 -> 3/1');
  live(g, giant).tapped = false; g.state.player.mana = EMPTY(); fight(g, [giant], {}); assert.ok(!has(g, giant), 'second marqueur : endurance -1 : meurt aux actions d\'état'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); put(g, 'player', 'Sol Ring'); cast(g, 'Spirit Shackle', pT(giant)); assert.equal(live(g, giant).counters?.length || 0, 0, 'aucun marqueur tant qu\'elle n\'est pas engagée'); }

// ── Spectral Cloak : linceul tant que la créature est NON ENGAGÉE ───────────────────────────────────────────────
{ const g = newGame(); const bears = put(g, 'player', 'Grizzly Bears'); cast(g, 'Spectral Cloak', pT(bears)); assert.throws(() => cast(g, 'Lightning Bolt', pT(bears), 0, 'ai'), /illégale/i, 'non engagée : linceul, ne peut pas être ciblée'); assert.ok(has(g, bears));
  live(g, bears).tapped = true; cast(g, 'Lightning Bolt', pT(bears), 0, 'ai'); assert.ok(!has(g, bears), 'engagée : plus de linceul'); }

// Non-régression : l'énumération des cibles d'une capacité d'artefact (IA/UI) exclut la créature protégée par Artifact Ward
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); const bears = put(g, 'player', 'Grizzly Bears'); cast(g, 'Artifact Ward', pT(giant)); const icy = put(g, 'ai', 'Icy Manipulator'); const ab = icy.activated[0];
  const ids = g.targeting.validTargets(ab.effect.type, 'ai', [], ab.effect, icy).map((o) => o.perm?.uid || o.id); assert.ok(!ids.includes(giant.uid) && ids.includes(bears.uid), 'Icy Manipulator : la créature protégée n\'est plus proposée'); }

console.log('OK test-v12-137-g26-auras-restrictions');
