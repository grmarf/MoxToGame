// V12.76 (G30) — Erg Raiders (2 blessures à la fin de mon tour s'il n'a pas attaqué, sauf s'il est arrivé ou passé sous mon contrôle ce tour) et Nettling Imp ({T} : force une créature adverse à attaquer, détruite à la fin du tour sinon ; timing et ciblage).
// Oracle vérifié : Erg Raiders (Scryfall ARN n°25 + ruling 2018 « passe sous votre contrôle ») ; Nettling Imp (Scryfall CEI n°118 + rulings 2004/2013).
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

for (const n of ['Erg Raiders', 'Nettling Imp']) assert.equal(by(n).effectStatus, 'implemented', `${n} : statut`);
const at = (g, active, phase) => { g.state.activePlayer = active; g.turnManager.activePlayer = active; g.turnManager.gotoPhase(phase); g.state.phase = phase; g.state.priorityHolder = 'player'; g.turnManager.phaseStarted = false; };
const tn = (g, n) => { g.state.turnNumber = n; g.turnManager.turnNumber = n; };
const toEndStep = (g) => { for (let i = 0; i < 6 && g.state.phase !== 'endStep'; i++) { g.turnManager.nextPhase(); settle(g); } assert.equal(g.state.phase, 'endStep'); };
const attackWith = (g, atts, side) => { g.state.activePlayer = side; g.turnManager.activePlayer = side; g.turnManager.gotoPhase('main1'); g.turnManager.beginCombat(); g.turnManager.declareAttackers(atts); settle(g); g.turnManager.declareBlockers({}); settle(g); g.turnManager.runPhase(); settle(g); };

// ── Erg Raiders ──────────────────────────────────────────────────────────────────────────────────────────────
assert.ok(!(by('Erg Raiders').static || []).some((e) => e.type === 'mustAttack'), 'plus de « doit attaquer » (ce n\'est pas l\'Oracle)');
const raiders = (side = 'player', extra = {}) => { const g = newGame(); tn(g, 5); const r = put(g, side, 'Erg Raiders', { enteredTurn: 1, ...extra }); return { g, r }; };
{ const { g } = raiders(); const l0 = g.state.player.life; at(g, 'player', 'main2'); toEndStep(g); assert.equal(g.state.player.life, l0 - 2, 'n\'a pas attaqué : 2 blessures à son contrôleur à la fin de MON tour'); }
{ const { g, r } = raiders(); const l0 = g.state.player.life; attackWith(g, [r], 'player'); toEndStep(g); assert.equal(g.state.player.life, l0 - 0, 'a attaqué : aucune blessure'); }
{ const { g } = raiders('player', { enteredTurn: 5 }); const l0 = g.state.player.life; at(g, 'player', 'main2'); toEndStep(g); assert.equal(g.state.player.life, l0, 'arrivé CE tour : exempté'); }
{ const { g, r } = raiders('ai'); const l0 = g.state.player.life; g.zones.changeController(r, 'player', { reason: 'test' }); at(g, 'player', 'main2'); toEndStep(g); assert.equal(g.state.player.life, l0, 'passé sous mon contrôle CE tour (ruling 2018) : exempté'); }
{ const { g } = raiders(); const l0 = g.state.player.life; at(g, 'ai', 'main2'); toEndStep(g); assert.equal(g.state.player.life, l0, 'À la fin du tour de l\'ADVERSAIRE : rien'); }
{ const { g } = raiders('ai'); const a0 = g.state.ai.life, l0 = g.state.player.life; at(g, 'ai', 'main2'); toEndStep(g); assert.equal(g.state.ai.life, a0 - 2, 'Raiders de l\'adversaire : c\'est LUI qui subit'); assert.equal(g.state.player.life, l0); }
{ const { g } = raiders(); const l0 = g.state.player.life; g.zones.changeController(g.state.player.battlefield.find((p) => p.name === 'Erg Raiders'), 'ai', { reason: 'test' }); at(g, 'player', 'main2'); toEndStep(g); assert.equal(g.state.player.life, l0, 'sous le contrôle de l\'adversaire : ce n\'est plus MA fin de tour pour lui'); }

// ── Nettling Imp ────────────────────────────────────────────────────────────────────────────────────────────
assert.equal(by('Nettling Imp').activated[0].cost, '', 'aucun coût de mana (seulement {T})');
const imp = () => { const g = newGame(); tn(g, 5); const i = put(g, 'player', 'Nettling Imp', { enteredTurn: 1 }); const foe = put(g, 'ai', 'Grizzly Bears', { enteredTurn: 1 }); return { g, i, foe }; };
const useImp = (g, i, target, mana = EMPTY()) => { g.state.priorityHolder = 'player'; g.state.player.mana = { ...mana }; g.action('activateAbility', { permanent: live(g, i), controller: 'player', abilityIndex: 0, target }); settle(g); };
// timing : uniquement pendant un tour adverse, avant la déclaration des attaquants
{ const { g, i, foe } = imp(); at(g, 'player', 'main1'); assert.throws(() => useImp(g, i, pT(foe)), /.+/, 'mon tour : refusé'); }
{ const { g, i, foe } = imp(); at(g, 'ai', 'declareAttackers'); assert.throws(() => useImp(g, i, pT(foe)), /.+/, 'après la déclaration des attaquants : refusé'); }
{ const { g, i, foe } = imp(); at(g, 'ai', 'main1'); const m0 = JSON.stringify(g.state.player.mana); useImp(g, i, pT(foe)); assert.equal(live(g, i).tapped, true, 'le Diablotin s\'engage'); assert.equal(live(g, foe).mustAttack, true, 'la créature doit attaquer'); assert.equal(JSON.stringify(g.state.player.mana), JSON.stringify(EMPTY()), 'aucun mana dépensé'); void m0; }
// ciblage : créature non-Mur du joueur actif, contrôlée depuis le début du tour
{ const { g, i } = imp(); const mine = put(g, 'player', 'Grizzly Bears', { enteredTurn: 1 }); at(g, 'ai', 'main1'); assert.throws(() => useImp(g, i, pT(mine)), /illégale/i, 'ma créature : cible illégale'); }
{ const { g, i } = imp(); const wall = put(g, 'ai', 'Wall of Stone', { enteredTurn: 1 }); at(g, 'ai', 'main1'); assert.throws(() => useImp(g, i, pT(wall)), /illégale/i, 'un Mur : cible illégale'); }
{ const { g, i } = imp(); const fresh = put(g, 'ai', 'Scathe Zombies', { enteredTurn: 5 }); at(g, 'ai', 'main1'); assert.throws(() => useImp(g, i, pT(fresh)), /illégale/i, 'arrivée CE tour : cible illégale'); }
{ const { g, i, foe } = imp(); live(g, foe).tapped = true; at(g, 'ai', 'main1'); useImp(g, i, pT(foe)); assert.equal(live(g, foe).mustAttack, true, 'une créature ENGAGÉE reste ciblable (ruling 2004)'); }
// conséquences : attaque -> survit ; n'attaque pas (illégal car engagée) -> détruite à la prochaine étape finale, même si le Diablotin est parti
{ const { g, i, foe } = imp(); at(g, 'ai', 'main1'); useImp(g, i, pT(foe)); attackWith(g, [live(g, foe)], 'ai'); toEndStep(g); assert.ok(has(g, foe), 'a attaqué : survit'); }
{ const { g, i, foe } = imp(); live(g, foe).tapped = true; at(g, 'ai', 'main1'); useImp(g, i, pT(foe)); at(g, 'ai', 'main2'); assert.ok(has(g, foe), 'encore là avant l\'étape finale'); toEndStep(g); assert.ok(!has(g, foe), 'n\'a pas pu attaquer : détruite'); }
{ const { g, i, foe } = imp(); live(g, foe).tapped = true; at(g, 'ai', 'main1'); useImp(g, i, pT(foe)); g.zones.moveToGraveyard(live(g, i), { reason: 'test' }); at(g, 'ai', 'main2'); toEndStep(g); assert.ok(!has(g, foe), 'le Diablotin est parti : la destruction a lieu quand même (ruling 2004)'); }
{ const { g, i, foe } = imp(); const other = put(g, 'ai', 'Hill Giant', { enteredTurn: 1 }); at(g, 'ai', 'main1'); useImp(g, i, pT(foe)); attackWith(g, [live(g, foe)], 'ai'); toEndStep(g); assert.ok(has(g, other), 'une AUTRE créature adverse n\'est pas visée'); }

console.log('OK test-v12-141-g30-erg-raiders-nettling-imp');
