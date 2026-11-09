// Harnais de scénarios déclaratifs (V12.76) : une carte = un scénario de quelques lignes, joué en VRAIE partie (GameFacade).
//   given : état initial   { player:{ life, mana, hand:[…], battlefield:[…], graveyard:[…] }, ai:{…}, phase }
//           une entité = 'Nom'  ou  { name, id, tapped, sick, counters:['charge'], extra:{…} }   (id : référence pour les étapes)
//   when  : étapes         { cast:'Nom', on:ref, side, as, mana, x, illegal:/regex/ } { activate:ref, ability:0, on, side }
//                          { phase:'upkeep', turn:'player'|'ai'|'next' } { nextTurn:true } { choose:[valeurs] } { settle:true }
//                          { lethal:ref } { remove:ref } { set:ref, props:{…} } { pool:{side:'player', mana:{…}} }
//                          { attack:[refs], side } { block:{ ref:[refs] } }
//   then  : attendus       { stats:[ref,p,t] } { kw:[ref,'flying',true|false] } { zone:[nom|ref,'graveyard'|'hand'|'battlefield',side] }
//                          { attached:[aura,host|null] } { tapped:[ref,bool] } { life:[side,n] } { pool:[side,{…}] }
//                          { counter:[ref,type,n] } { controller:[ref,side] } { type:[ref,/re/] } { color:[ref,'WU'] }
import assert from 'node:assert/strict';
import { GameFacade } from '../../src/core/game-facade.js';
import { calculateCharacteristics } from '../../src/core/continuous-effects.js';
import { normalizeKeyword } from '../../src/core/keywords.js';
import CARDS from '../../src/data/cards-database.js';

export const cardOf = (n) => { const c = CARDS.find((x) => x.name === n); assert.ok(c, `carte absente de la base : ${n}`); return c; };
const FULL = { C: 12, W: 12, U: 12, B: 12, R: 12, G: 12 };
const ZERO = () => ({ C: 0, W: 0, U: 0, B: 0, R: 0, G: 0 });
let seq = 0;

export function world(given = {}) {
  const g = new GameFacade().connect();
  for (const p of ['player', 'ai']) { g.state[p].library = Array.from({ length: 40 }, (_, i) => ({ ...structuredClone(cardOf('Plains')), uid: `${p}F${i}`, owner: p })); g.state[p].hand = []; g.state[p].mana = ZERO(); }
  g.state.activePlayer = 'player'; g.state.phase = 'main1'; g.state.priorityHolder = 'player';
  g.turnManager.gotoPhase('main1'); g.turnManager.activePlayer = 'player'; g.state.turnNumber = 5; g.turnManager.turnNumber = 5;
  const refs = {}; const queue = [];
  const w = { g, refs, queue };
  const battlefield = (s) => g.state[s].battlefield;
  w.find = (id) => { const uid = refs[id] ?? id; return [...battlefield('player'), ...battlefield('ai')].find((p) => p.uid === uid || p.objectId === uid) || null; };
  w.get = (id) => { const p = w.find(id); assert.ok(p, `permanent introuvable : ${id}`); return p; };
  w.anywhere = (id) => { const uid = refs[id] ?? id; for (const s of ['player', 'ai']) for (const z of ['battlefield', 'hand', 'graveyard', 'exile', 'library']) { const f = g.state[s][z].find((p) => p.uid === uid || p.objectId === uid); if (f) return { card: f, side: s, zone: z }; } return null; };
  w.chars = (id) => calculateCharacteristics(g.state, w.get(id));
  w.kws = (id) => w.chars(id).keywords;
  w.place = (side, zone, ent) => {
    ent = typeof ent === 'string' ? { name: ent } : ent;
    const uid = `${ent.name}#${++seq}`;
    const p = { ...structuredClone(cardOf(ent.name)), uid, objectId: uid, owner: side, controller: side, zone, summoningSickness: !!ent.sick, tapped: !!ent.tapped, enteredTurn: 1, ...(ent.extra || {}) };
    if (ent.counters) p.counters = ent.counters.map((type) => ({ type }));
    g.state[side][zone].push(p); if (zone === 'battlefield') g.triggerCollector.registerSource(p, side);
    refs[ent.id || ent.name] = uid; return p;
  };
  for (const side of ['player', 'ai']) { const s = given[side] || {}; if (s.life != null) g.state[side].life = s.life; for (const z of ['graveyard', 'hand', 'battlefield']) for (const e of s[z] || []) w.place(side, z, e); if (s.mana) g.state[side].mana = { ...ZERO(), ...s.mana }; }
  if (given.phase) { g.turnManager.gotoPhase(given.phase); g.state.phase = given.phase; }

  const resolveChoice = (pe, choose) => { const next = queue.length ? queue.shift() : (choose ? choose(pe) : (pe.options?.[0] ?? [])); g.choices.resolve(typeof next === 'string' && refs[next] !== undefined && pe.options?.some((o) => o?.uid === refs[next]) ? w.get(next) : next); };
  w.settle = (choose) => { for (let i = 0; i < 14 && (g.stack.size > 0 || g.choices.getPending()); i++) { const pe = g.choices.getPending(); if (pe) { if (queue.length || choose) { resolveChoice(pe, choose); continue; } return; } g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); } }; // une question SANS réponse prévue reste en attente (étape `choose` explicite)
  w.targetOf = (on) => (on == null ? null : (on === 'player' || on === 'ai') ? { kind: 'player', side: on } : { kind: 'permanent', uid: w.get(on).uid, side: w.get(on).controller });
  w.zero = () => { for (const s of ['player', 'ai']) g.state[s].mana = ZERO(); };

  const withTurn = (side, fn) => { const a = g.state.activePlayer; g.state.activePlayer = side; g.turnManager.activePlayer = side; try { return fn(); } finally { g.state.activePlayer = a; g.turnManager.activePlayer = a; } };
  w.cast = (name, { on, side = 'player', as, mana, x = 0, illegal } = {}) => {
    const c = { ...structuredClone(cardOf(name)), uid: `${name}@${++seq}`, owner: side, controller: side };
    g.state[side].hand.push(c); g.state[side].mana = { ...(mana || FULL) }; g.state.priorityHolder = side;
    const run = () => (/Instant|Interrupt/.test(c.type) ? (g.dispatch('CAST_SPELL', { card: c, target: w.targetOf(on), xValue: x }, side), w.settle()) : withTurn(side, () => { g.dispatch('CAST_SPELL', { card: c, target: w.targetOf(on), xValue: x }, side); w.settle(); }));
    if (illegal) { assert.throws(run, illegal, `${name} : le lancer devait être refusé`); assert.ok(g.state[side].hand.some((h) => h.uid === c.uid), `${name} : reste en main après un refus`); return null; }
    run(); const p = [...battlefield(side), ...battlefield(side === 'player' ? 'ai' : 'player')].reverse().find((q) => q.name === name && q.zone !== 'graveyard');
    if (p) refs[as || name] = p.uid; return p || null;
  };
  w.activate = (id, { ability = 0, on, side } = {}) => { const p = w.get(id); const s = side || p.controller; g.state.priorityHolder = s; g.action('activateAbility', { permanent: p, controller: s, abilityIndex: ability, target: w.targetOf(on) }); w.settle(); };
  w.phase = (name, { turn } = {}) => {
    const t0 = g.state.turnNumber; const ok = () => g.state.phase === name && (turn === 'next' ? g.state.turnNumber !== t0 : (turn ? g.state.activePlayer === turn : true));
    for (let i = 0; i < 160 && !ok(); i++) { w.zero(); g.turnManager.nextPhase(); if (!ok()) w.settle(); }
    assert.ok(ok(), `phase ${name} non atteinte (phase ${g.state.phase}, tour de ${g.state.activePlayer})`);
  };
  w.nextTurn = () => { const t0 = g.state.turnNumber; for (let i = 0; i < 160 && g.state.turnNumber === t0; i++) { w.zero(); g.turnManager.nextPhase(); w.settle(); } w.settle(); };
  w.lethal = (id) => { w.get(id).damageMarked = 999; g.stateBasedActions.check(g.state); w.settle(); };
  w.remove = (id) => { const p = w.get(id); g.zones.moveToGraveyard(p, { toSide: p.owner, reason: 'destroy' }); g.stateBasedActions.check(g.state); w.settle(); };
  // Le moteur FILTRE les attaquants illégaux sans lever d'erreur : on vérifie la liste réellement déclarée.
  w.attack = (ids, side = 'player') => { g.state.activePlayer = side; g.turnManager.activePlayer = side; g.state.phase = 'declareAttackers'; g.combat.begin(); g.combat.confirmAttackers(ids.map((i) => w.get(i)), side); return (g.combat.combat?.attackers || []).map((a) => a.uid); };
  w.block = (map) => g.combat.assignBlockers(Object.fromEntries(Object.entries(map).map(([a, bs]) => [w.get(a).uid, bs.map((b) => w.get(b).uid)])));
  w.snapshot = (id) => { const c = w.chars(id); return { power: c.power, toughness: c.toughness, kw: [...c.keywords].sort(), type: String(c.type), color: [...(c.color || [])].sort().join(''), tapped: !!w.get(id).tapped, controller: w.get(id).controller }; };

  w.step = (s) => {
    if (s.expect) return w.expect(s.expect);
    if (s.tapMana) { const p = w.get(s.tapMana); g.state.priorityHolder = p.controller; return g.action('tapMana', { permanent: p, controller: p.controller }); }
    if (s.pass) { for (let i = 0; i < 14 && g.stack.size > 0 && !g.choices.getPending(); i++) g.dispatch('PASS_PRIORITY', {}, g.state.priorityHolder); return; } // passe la priorité JUSQU'À une question (sans y répondre)
    if (s.main) { g.state.phase = 'main1'; g.turnManager.gotoPhase('main1'); g.state.activePlayer = 'player'; g.turnManager.activePlayer = 'player'; g.state.priorityHolder = 'player'; return; } // retour en phase principale (après un combat simulé)
    if (s.cast) return w.cast(s.cast, s); if (s.activate) return s.illegal ? assert.throws(() => w.activate(s.activate, s), s.illegal) : w.activate(s.activate, s);
    if (s.phase) return w.phase(s.phase, s); if (s.nextTurn) return w.nextTurn(); if (s.settle) return w.settle();
    if (s.choose !== undefined) { const pe = g.choices.getPending(); assert.ok(pe, 'aucun choix en attente'); return s.illegal ? assert.throws(() => resolveChoice(pe, () => s.choose), s.illegal) : resolveChoice(pe, () => s.choose); }
    if (s.queue) return queue.push(...s.queue);
    if (s.lethal) return w.lethal(s.lethal); if (s.remove) return w.remove(s.remove);
    if (s.set) return Object.assign(w.get(s.set), s.props); if (s.pool) { g.state[s.pool.side].mana = { ...ZERO(), ...s.pool.mana }; return; }
    if (s.attack) { const declared = w.attack(s.attack, s.side); const want = s.attack.map((i) => w.get(i).uid);
      if (s.illegal) assert.ok(want.every((u) => !declared.includes(u)), `attaque refusée attendue pour ${s.attack} (déclarés : ${declared})`);
      else assert.ok(want.every((u) => declared.includes(u)), `attaque acceptée attendue pour ${s.attack} (déclarés : ${declared})`); return; }
    if (s.block) return s.illegal ? assert.throws(() => w.block(s.block), s.illegal) : w.block(s.block);
    throw new Error(`étape inconnue : ${JSON.stringify(s)}`);
  };
  w.expect = (e) => {
    const [k, a] = Object.entries(e)[0];
    if (k === 'stats') { const c = w.chars(a[0]); assert.deepEqual([c.power, c.toughness], [a[1], a[2]], `${a[0]} : force/endurance`); }
    else if (k === 'kw') { const has = w.kws(a[0]).includes(normalizeKeyword(a[1])); assert.equal(has, a[2], `${a[0]} : ${a[1]} ${a[2] ? 'attendu' : 'absent attendu'} (a : ${w.kws(a[0])})`); }
    else if (k === 'zone') { const r = w.anywhere(a[0]); const byName = () => g.state[a[2] || 'player'][a[1]].some((c) => c.name === a[0]); assert.ok((r && r.zone === a[1]) || (!r && byName()) || byName(), `${a[0]} : attendu en zone ${a[1]}${r ? ` (est en ${r.zone})` : ''}`); }
    else if (k === 'attached') { const au = w.find(a[0]); assert.ok(au, `${a[0]} : absente du champ`); assert.equal(au.attachedTo ?? null, a[1] == null ? null : w.get(a[1]).uid, `${a[0]} : attachée à ${a[1]}`); }
    else if (k === 'pending') { const pe = g.choices.getPending(); assert.ok(pe, `question attendue (${a[0]})`); assert.equal(pe.type, a[0], 'type de la question'); if (a[1]) assert.deepEqual(pe.options.map((o) => o?.name ?? o), a[1], 'options proposées'); if (a[2]) assert.equal(pe.controller, a[2], 'qui répond'); }
    else if (k === 'noPending') assert.equal(g.choices.getPending(), null, 'aucune question attendue');
    else if (k === 'tapped') assert.equal(!!w.get(a[0]).tapped, a[1], `${a[0]} : engagé=${a[1]}`);
    else if (k === 'life') assert.equal(g.state[a[0]].life, a[1], `vie de ${a[0]}`);
    else if (k === 'pool') assert.deepEqual({ ...g.state[a[0]].mana }, { ...ZERO(), ...a[1] }, `réserve de ${a[0]}`);
    else if (k === 'counter') assert.equal((w.get(a[0]).counters || []).filter((c) => c.type === a[1]).length, a[2], `${a[0]} : marqueurs ${a[1]}`);
    else if (k === 'controller') assert.equal(w.get(a[0]).controller, a[1], `contrôleur de ${a[0]}`);
    else if (k === 'type') assert.ok(a[1].test(String(w.chars(a[0]).type)), `${a[0]} : type ${w.chars(a[0]).type}`);
    else if (k === 'color') assert.equal([...(w.chars(a[0]).color || [])].sort().join(''), a[1], `${a[0]} : couleurs`);
    else throw new Error(`attendu inconnu : ${JSON.stringify(e)}`);
  };
  return w;
}

export function run(scn) {
  const w = world(scn.given || {});
  for (const s of scn.when || []) { try { w.step(s); } catch (err) { err.message = `[${scn.card || scn.name}] étape ${JSON.stringify(s)} : ${err.message}`; throw err; } }
  for (const e of scn.then || []) { try { w.expect(e); } catch (err) { err.message = `[${scn.card || scn.name}] attendu ${JSON.stringify(e)} : ${err.message}`; throw err; } }
  return w;
}

// ── Contrat d'AURA : vérifié pour TOUTE aura, en plus des attendus propres à la carte ──────────────────────────────────────────
const HOST = { creature: 'Grizzly Bears', land: 'Plains', artifact: 'Sol Ring', enchantment: 'Holy Strength' };
const WRONG = { creature: 'Plains', land: 'Grizzly Bears', artifact: 'Grizzly Bears', enchantment: 'Plains' };
export function hostKindOf(name) {
  const c = cardOf(name); const t = String(c.effect?.target || c.auraEffect?.target || '');
  if (/land/i.test(t)) return 'land'; if (/artifact/i.test(t)) return 'artifact'; if (/enchantment/i.test(t)) return 'enchantment'; return 'creature';
}
export function auraContract(name, { host, hostKind = hostKindOf(name), extraGiven = {}, then = [], when = [], mana, residual = [] } = {}) {
  const hostName = host || HOST[hostKind]; const isCreature = hostKind === 'creature';
  const fresh = () => { const w = world({ ai: { battlefield: [{ name: hostName, id: 'host' }] }, ...extraGiven }); return w; };
  // 1) lancer sur un hôte légal : arrive en jeu, attachée ; 2) attendus de la carte
  const w = fresh(); const base = w.snapshot('host');
  const au = w.cast(name, { on: 'host', as: 'aura', mana }); assert.ok(au, `${name} : doit arriver sur le champ de bataille`);
  assert.equal(au.attachedTo, w.get('host').uid, `${name} : attachée à l'hôte`);
  for (const s of when) w.step(s); for (const e of then) w.expect(e);
  // 3) l'aura quitte le champ (destruction) : l'hôte REDEVIENT ce qu'il était (aucun effet résiduel)
  const w2 = fresh(); const base2 = w2.snapshot('host'); w2.cast(name, { on: 'host', as: 'aura', mana }); for (const s of when) w2.step(s);
  w2.remove('aura'); const strip = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !residual.includes(k))); // `residual` : effet UNIQUE à l'arrivée qui persiste légitimement (ex. Paralyze engage la créature)
  assert.deepEqual(strip(w2.snapshot('host')), strip(base2), `${name} : après le départ de l'aura, l'hôte doit redevenir identique (effet résiduel)`);
  assert.ok(w2.g.state.player.graveyard.some((c) => c.name === name), `${name} : l'aura est au cimetière`); // (l'uid est renouvelé au changement de zone : on identifie par le nom)
  // 4) l'hôte quitte le champ : l'aura va au cimetière (règle 704.5m)
  const w3 = fresh(); w3.cast(name, { on: 'host', as: 'aura', mana });
  if (isCreature) w3.lethal('host'); else w3.remove('host');
  assert.ok(!w3.find('aura'), `${name} : l'aura ne reste pas en jeu sans hôte`); assert.ok(w3.g.state.player.graveyard.some((c) => c.name === name), `${name} : l'aura est au cimetière quand l'hôte disparaît`);
  // 5) hôte illégal : refusé, l'aura reste en main
  const w4 = world({ ai: { battlefield: [{ name: WRONG[hostKind], id: 'bad' }] } }); w4.cast(name, { on: 'bad', illegal: /./, mana });
  return { w, base };
}
