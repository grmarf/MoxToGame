// V12.76 — l'IA déclare TOUJOURS les créatures obligées d'attaquer (Juggernaut ; V12.76 G30 : Juggernaut n'est plus obligé d'attaquer), même à force nulle.
// Avant : elle n'attaquait qu'avec les créatures de force > 0 ; la déclaration était alors refusée par le moteur (échec d'action de l'IA,
// révélé par la graine 3 du banc dès que le pool de cartes a changé).
import assert from 'node:assert/strict';
import { world } from './lib/scenario.mjs';

const mk = (given) => { const w = world(given); w.g.state.activePlayer = 'ai'; w.g.turnManager.activePlayer = 'ai'; w.g.turnManager.gotoPhase('declareAttackers'); w.g.state.phase = 'declareAttackers'; w.g.state.priorityHolder = 'ai'; return w; };
const decide = (w) => { const ai = w.g.aiFor('ai'); const mv = ai.chooseAction(); return mv?.action === 'declareAttackers' ? mv.data.attackers.map((a) => a.name) : []; };

// 1) Juggernaut (obligé d'attaquer) à force 0 : déclaré quand même, et la déclaration est acceptée par le moteur.
{
  const w = mk({ ai: { battlefield: [{ name: 'Juggernaut', id: 'erg', extra: { tempBuffs: [{ power: -9, toughness: 0 }] } }, { name: 'Hill Giant', id: 'giant' }] } });
  assert.equal(w.chars('erg').power <= 0, true, 'Juggernaut est à force nulle');
  const chosen = decide(w); assert.ok(chosen.includes('Juggernaut'), `Juggernaut est déclaré (${chosen})`); assert.ok(chosen.includes('Hill Giant'));
  w.g.combat.begin(); w.g.combat.confirmAttackers(['erg', 'giant'].map((i) => w.get(i)), 'ai');   // ne lève pas
}
// 2) Une créature à force nulle SANS obligation d'attaquer n'attaque toujours pas.
{
  const w = mk({ ai: { battlefield: [{ name: 'Grizzly Bears', id: 'bear', extra: { tempBuffs: [{ power: -9, toughness: 0 }] } }, { name: 'Hill Giant', id: 'giant' }] } });
  const chosen = decide(w); assert.deepEqual(chosen, ['Hill Giant'], `seule la créature de force > 0 attaque (${chosen})`);
}
// 3) Limite d'attaquants (Caverns of Despair : « pas plus de DEUX créatures ») : l'obligatoire est gardé en premier, puis la plus forte.
{
  const w = mk({ ai: { battlefield: [{ name: 'Juggernaut', id: 'erg', extra: { tempBuffs: [{ power: -9, toughness: 0 }] } }, { name: 'Hill Giant', id: 'giant' }, { name: 'Grizzly Bears', id: 'bear' }] }, player: { battlefield: ['Caverns of Despair'] } });
  const chosen = decide(w); assert.equal(chosen.length, 2, `limite de 2 attaquants (${chosen})`);
  assert.deepEqual([...chosen].sort(), ['Hill Giant', 'Juggernaut'], `l'obligatoire est gardé, puis la plus forte (${chosen})`);
}
console.log("OK V12.76.126 : l'IA déclare toujours les attaquants obligatoires (même à force nulle), jamais une créature inutile ; limite d'attaquants respectée.");
