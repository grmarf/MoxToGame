// V12.76 (G20) — Haunting Wind (artefact engagé / capacité sans {T}, 1 blessure), Creature Bond (blessures = endurance), Terror (sans régénération), Icy Manipulator (artefact, créature ou terrain ; engage seulement).
import assert from 'node:assert/strict';
import { GameFacade } from '../src/core/game-facade.js';
import { calculateCharacteristics } from '../src/core/continuous-effects.js';
import CARDS from '../src/data/cards-database.js';

const by = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente : ${n}`); return c; };
let seq = 0; const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
function newGame() {
  const g = new GameFacade().connect();
  const filler = (p) => Array.from({ length: 20 }, (_, i) => ({ uid: `${p}F${i}`, objectId: `${p}FO${i}`, name: 'Plains', type: 'Land', cmc: 0, owner: p }));
  g.state.player.library = filler('player'); g.state.ai.library = filler('ai'); g.state.player.hand = []; g.state.ai.hand = [];
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; return g;
}
const put = (g, side, name) => { const p = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side, zone: 'battlefield', summoningSickness: false, tapped: false }; g.state[side].battlefield.push(p); g.triggerEngine?.syncBattlefield?.(g.state); return p; };
const pT = (p) => ({ kind: 'permanent', uid: p.uid });
const live = (g, p) => ['player', 'ai'].flatMap((s) => g.state[s].battlefield).find((q) => q.uid === p.uid);
const has = (g, p) => !!live(g, p);
function cast(g, name, target, x = 0, side = 'player') {
  const card = { ...structuredClone(by(name)), uid: `${name}#${++seq}`, objectId: `${name}#o${seq}`, owner: side, controller: side };
  g.state[side].hand.push(card); g.state[side].mana = { ...FULL }; g.state.priorityHolder = side; g.state.activePlayer = side; g.turnManager.activePlayer = side;
  g.dispatch('CAST_SPELL', { card, target, xValue: x }, side);
  for (let i = 0; i < 6 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder);
  g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; return card;
}
const settle = (g) => { for (let i = 0; i < 8 && g.stack.size > 0; i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); };
const act = (g, p, side = 'player', extra = {}) => { g.state.priorityHolder = side; g.state[side].mana = { ...FULL }; g.action('activateAbility', { permanent: live(g, p), controller: side, abilityIndex: 0, ...extra }); settle(g); };

for (const n of ['Terror', 'Icy Manipulator', 'Haunting Wind', 'Creature Bond']) assert.equal(by(n).effectStatus, 'implemented', n);

// ── Haunting Wind : « artifact becomes tapped » = 1 blessure à SON contrôleur, une seule fois ─────────────
{ const g = newGame(); cast(g, 'Haunting Wind'); const ring = put(g, 'ai', 'Sol Ring'); const icy = put(g, 'player', 'Icy Manipulator');
  act(g, icy, 'player', { target: pT(ring) });
  assert.ok(live(g, ring).tapped, 'Icy engage le Sol Ring'); assert.equal(g.state.ai.life, 19, 'artefact adverse engagé par un EFFET : 1 blessure à son contrôleur (pas au lanceur de l\'enchantement)');
  assert.equal(g.state.player.life, 19, 'Icy lui-même devient engagé (coût {T}) : 1 blessure à moi — sans double comptage');
}
// capacité SANS {T} dans le coût : Clay Statue ({2} : régénération) -> 1 blessure, une fois
{ const g = newGame(); cast(g, 'Haunting Wind'); const clay = put(g, 'player', 'Clay Statue'); act(g, clay);
  assert.equal(g.state.player.life, 19, 'capacité d\'artefact sans {T} : 1 blessure'); assert.ok(!live(g, clay).tapped, 'et la statue n\'est pas engagée (pas de double déclenchement)'); }
// un artefact-créature qui ATTAQUE devient engagé
{ const g = newGame(); cast(g, 'Haunting Wind'); const clay = put(g, 'player', 'Clay Statue'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([clay], 'player'); settle(g);
  assert.ok(live(g, clay).tapped); assert.equal(g.state.player.life, 19, 'attaquer engage l\'artefact : 1 blessure'); }
// un terrain engagé, une créature non artefact engagée : rien
{ const g = newGame(); cast(g, 'Haunting Wind'); const f = put(g, 'player', 'Forest'); g.action('tapMana', { permanent: live(g, f), controller: 'player', color: 'G' }); settle(g);
  const bears = put(g, 'player', 'Grizzly Bears'); g.state.activePlayer = 'player'; g.combat.begin(); g.combat.confirmAttackers([bears], 'player'); settle(g);
  assert.equal(g.state.player.life, 20, 'ni terrain ni créature ordinaire'); }
// témoin
{ const g = newGame(); const ring = put(g, 'player', 'Sol Ring'); act(g, ring); assert.equal(g.state.player.life, 20, 'sans Haunting Wind : rien'); }

// ── Creature Bond : blessures = endurance de la créature morte, à SON contrôleur ───────────────────────
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Creature Bond', pT(giant)); const l0 = g.state.player.life;
  cast(g, 'Lightning Bolt', pT(giant), 0, 'ai'); assert.ok(!has(g, giant), 'mort par blessures létales'); assert.equal(g.state.player.life, l0 - 3, 'Hill Giant 3/3 : 3 blessures à son contrôleur'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Creature Bond', pT(giant)); cast(g, 'Giant Growth', pT(giant)); const l0 = g.state.player.life;
  assert.equal(calculateCharacteristics(g.state, live(g, giant)).toughness, 6); cast(g, 'Fissure', pT(giant), 0, 'ai'); assert.ok(!has(g, giant)); assert.equal(g.state.player.life, l0 - 6, 'endurance EFFECTIVE à la mort (6 avec Giant Growth), par le chemin « détruire »'); }
{ const g = newGame(); const giant = put(g, 'player', 'Hill Giant'); cast(g, 'Creature Bond', pT(giant)); cast(g, 'Giant Growth', pT(giant)); const l0 = g.state.player.life;
  cast(g, 'Lightning Bolt', pT(giant), 0, 'ai'); assert.ok(has(g, giant), 'un seul éclair ne tue pas un 6/6'); cast(g, 'Lightning Bolt', pT(giant), 0, 'ai'); assert.ok(!has(g, giant), 'deux éclairs : blessures létales (actions d\'état)');
  assert.equal(g.state.player.life, l0 - 6, 'endurance EFFECTIVE (6) aussi par le chemin des blessures létales'); }
{ const g = newGame(); const bears = put(g, 'ai', 'Grizzly Bears'); cast(g, 'Creature Bond', pT(bears)); const lp = g.state.player.life, la = g.state.ai.life;
  cast(g, 'Fissure', pT(bears)); assert.equal(g.state.ai.life, la - 2, 'l\'Aura posée sur la créature ADVERSE blesse son contrôleur (l\'adversaire)'); assert.equal(g.state.player.life, lp, 'pas le propriétaire de l\'Aura'); }

// ── Terror : « It can't be regenerated » ───────────────────────────────────────────────────────────────
{ const g = newGame(); const giant = put(g, 'ai', 'Hill Giant'); giant.regenShield = true; cast(g, 'Terror', pT(giant)); assert.ok(!has(g, giant), 'le bouclier de régénération ne sauve pas'); }
{ const g = newGame(); const art = put(g, 'ai', 'Clay Statue'); try { cast(g, 'Terror', pT(art)); } catch { /* refusé à la cible : très bien */ } assert.ok(has(g, art), 'Terror ne détruit toujours pas un artefact (non-artefact exigé)'); }

// Terror : « nonartifact, nonblack » — défaut découvert en vraie partie : la restriction n'était lue nulle part
{ const g = newGame(); const blk = put(g, 'ai', 'Scathe Zombies'); try { cast(g, 'Terror', pT(blk)); } catch { /* refusé à la cible */ } assert.ok(has(g, blk), 'une créature NOIRE n\'est pas une cible légale'); }
{ const g = newGame(); const ok = put(g, 'ai', 'Grizzly Bears'); cast(g, 'Terror', pT(ok)); assert.ok(!has(g, ok), 'une créature verte meurt'); }

// ── Icy Manipulator : artefact, créature OU terrain ; engage seulement ─────────────────────────────────
{ const g = newGame(); const icy = put(g, 'player', 'Icy Manipulator'); const land = put(g, 'ai', 'Island'); act(g, icy, 'player', { target: pT(land) }); assert.ok(live(g, land).tapped, 'terrain engagé'); }
{ const g = newGame(); const icy = put(g, 'player', 'Icy Manipulator'); const b = put(g, 'ai', 'Grizzly Bears'); act(g, icy, 'player', { target: pT(b) }); assert.ok(live(g, b).tapped, 'créature engagée'); }
{ const g = newGame(); const icy = put(g, 'player', 'Icy Manipulator'); const icy2 = put(g, 'player', 'Icy Manipulator'); const b = put(g, 'ai', 'Grizzly Bears'); b.tapped = true;
  act(g, icy, 'player', { target: pT(b) }); assert.ok(live(g, b).tapped, 'Oracle : « Tap » seulement — une cible déjà engagée ne se dégage pas'); void icy2; }
{ const g = newGame(); cast(g, 'Wild Growth', pT(put(g, 'ai', 'Forest'))); const ench = g.state.player.battlefield.concat(g.state.ai.battlefield).find((p) => p.name === 'Wild Growth');
  const icy = put(g, 'player', 'Icy Manipulator'); assert.throws(() => act(g, icy, 'player', { target: pT(ench) }), /illégale|cible/i, 'un enchantement n\'est pas une cible légale'); }
console.log('OK V12.76.131 : Haunting Wind (1 blessure, artefact engagé / capacité sans {T}), Creature Bond (endurance), Terror (sans régénération), Icy Manipulator (types de cible, engage seulement).');
