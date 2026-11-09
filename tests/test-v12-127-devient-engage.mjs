// V12.76 (G16) — « devient engagé » : événement `permanentTapped` à chaque point d'engagement + Psychic Venom / Blight (vraie partie).
import assert from 'node:assert/strict';
import { run, auraContract, cardOf, world } from './lib/scenario.mjs';
import { gameEvents } from '../src/core/event-bus.js';
import { tapPermanent } from '../src/core/permanent-tap.js';
import { SCENARIOS } from './scenarios/auras-lot3.mjs';

let n = 0;
for (const sc of SCENARIOS) {
  const c = cardOf(sc.card); if (c.effectStatus !== 'implemented') throw new Error(`${sc.card} : statut ${c.effectStatus}`);
  auraContract(sc.card, sc.contract || {});
  for (const r of sc.runs) run({ card: sc.card, ...r });
  n++; console.log(`OK V12.76.127 : ${sc.card} -- contrat d'aura + ${sc.runs.length} scénario(s).`);
}

// L'événement lui-même : émis UNE fois, seulement au passage dégagé -> engagé, jamais pour « arrive engagé ».
const spy = () => { const evs = []; const off = gameEvents.on('permanentTapped', (e) => evs.push({ name: e.permanent.name, side: e.side, controller: e.controller, reason: e.reason })); return { evs, off }; };
{ // coût {T} / mana
  const w = world({ ai: { battlefield: [{ name: 'Island', id: 'l' }] } }); const s = spy();
  w.step({ tapMana: 'l' }); s.off();
  assert.deepEqual(s.evs, [{ name: 'Island', side: 'ai', controller: 'ai', reason: 'cost' }], 'tapMana : un seul événement, bon contrôleur');
  console.log('OK V12.76.127 : tapMana émet permanentTapped (1 fois, côté du contrôleur).');
}
{ // attaque : non-vigilance engage et émet ; vigilance n'émet pas
  const w = world({ player: { battlefield: [{ name: 'Grizzly Bears', id: 'a' }, { name: 'Serra Angel', id: 'v' }] } }); const s = spy();
  const declared = w.attack(['a', 'v']); s.off();
  const names = s.evs.map((e) => e.name);
  assert.ok(declared.length >= 1 && names.includes('Grizzly Bears'), 'un attaquant sans vigilance émet l\'événement');
  assert.ok(!names.includes('Serra Angel'), 'la vigilance n\'engage pas : aucun événement');
  assert.equal(s.evs.find((e) => e.name === 'Grizzly Bears').reason, 'attack');
  console.log('OK V12.76.127 : l\'attaque émet permanentTapped (sauf vigilance).');
}
{ // « arrive engagé » et déjà engagé : rien
  const w = world({ ai: { battlefield: [{ name: 'Island', id: 'l', tapped: true }] } }); const s = spy();
  assert.throws(() => w.step({ tapMana: 'l' }), /engag/i); s.off();
  assert.equal(s.evs.length, 0, 'un permanent déjà engagé ne ré-émet pas');
  const w2 = world({}); const s2 = spy(); const t = w2.place('player', 'battlefield', { name: 'Island', tapped: true }); s2.off();
  assert.equal(s2.evs.length, 0, 'placé engagé : pas d\'événement'); void t;
  console.log('OK V12.76.127 : déjà engagé / arrive engagé n\'émettent rien.');
}
{ // le helper lui-même : engager deux fois = un seul événement ; la source de l'engagement (effet) respecte la même garde
  const w = world({ ai: { battlefield: [{ name: 'Island', id: 'l' }] } }); const s = spy(); const p = w.get('l');
  assert.equal(tapPermanent(w.g.state, p, { reason: 'effect' }), true); assert.equal(tapPermanent(w.g.state, p, { reason: 'effect' }), false);
  s.off(); assert.equal(s.evs.length, 1, 'deux engagements successifs : un seul événement');
  console.log('OK V12.76.127 : tapPermanent n\'émet qu\'au passage dégagé -> engagé.');
}
console.log(`OK V12.76.127 : ${n} auras « devient engagé » certifiées.`);
