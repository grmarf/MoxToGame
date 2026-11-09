// V12.26 — Regroupement (banding, Comprehensive Rules 702.22c/h/j/k)
import { CombatService } from '../src/core/combat.js';

let failed = false;
function check(cond, msg) {
  if (!cond) { console.error(`FAIL: ${msg}`); failed = true; }
  else console.log(`PASS: ${msg}`);
}
function expectThrow(fn, msg) {
  try { fn(); console.error(`FAIL: ${msg} (aucune erreur levée)`); failed = true; }
  catch (e) { console.log(`PASS: ${msg} (${e.message})`); }
}

const noopReplacements = {
  preventDamage: (side, amount) => ({ prevented: 0, remaining: amount }),
  applyDamageToPlayer: (side, amount, meta) => {},
  replaceDamageLifeLoss: (side, amount) => ({ replaced: false, loss: amount })
};

// Stats vérifiées contre cards-database.js (v12.25) :
// Benalish Hero {W} 1/1 banding | Grizzly Bears {1}{G} 2/2 sans banding | Hill Giant {3}{R} 3/3 sans banding
function makeCreature(uid, name, power, toughness, keywords = []) {
  return { uid, name, type: 'Creature', power, toughness, tapped: false, keywords, damageMarked: 0, tempBuffs: [], auraBuffs: [] };
}

// ============================================================
// Scénario A — 702.22h (propagation du blocage) + 702.22k (répartition d'un bloqueur partagé)
// ============================================================
function setupScenarioA() {
  const benalish = makeCreature('bh', 'Benalish Hero', 1, 1, ['banding']);
  const bears = makeCreature('gb', 'Grizzly Bears', 2, 2, []);
  const hill = makeCreature('hg', 'Hill Giant', 3, 3, []);
  const state = {
    activePlayer: 'player',
    player: { battlefield: [benalish, bears], life: 20 },
    ai: { battlefield: [hill], life: 20 }
  };
  const combat = new CombatService({ state: () => state, sba: null, replacements: noopReplacements });
  combat.begin();
  combat.confirmAttackers([benalish, bears], 'player', [['bh', 'gb']]);
  combat.assignBlockers({ gb: ['hg'] }); // seul Grizzly Bears est déclaré bloqué
  return { combat, benalish, bears, hill };
}

{
  const { combat, benalish, hill } = setupScenarioA();
  const benalishBlockers = (combat.combat.blockers['bh'] || []).map(b => b.uid);
  check(benalishBlockers.includes('hg'), '702.22h : Benalish Hero (non déclaré bloqué) devient bloqué par Hill Giant via le groupe');
}

{
  const { combat, benalish, bears } = setupScenarioA();
  combat.resolveDamage({ hg: { bh: 1, gb: 2 } });
  check(benalish.damageMarked === 1, '702.22k : Benalish Hero reçoit exactement 1 blessure (pas 3)');
  check(bears.damageMarked === 2, '702.22k : Grizzly Bears reçoit exactement 2 blessures (pas 3)');
}

{
  const { combat } = setupScenarioA();
  expectThrow(
    () => combat.resolveDamage({ hg: { bh: 1, gb: 1 } }),
    '702.22k : répartition dont la somme (2) ne correspond pas à la force effective de Hill Giant (3) -> erreur'
  );
}

{
  const { combat } = setupScenarioA();
  expectThrow(
    () => combat.resolveDamage(),
    '702.22k : bloqueur partagé sans blockerDamageSplit fourni -> erreur (le moteur ne devine pas)'
  );
}

// ============================================================
// 702.22c : un groupe doit contenir au moins une créature avec banding
// ============================================================
{
  const bears = makeCreature('gb4', 'Grizzly Bears', 2, 2, []);
  const hill = makeCreature('hg4', 'Hill Giant', 3, 3, []);
  const state = {
    activePlayer: 'player',
    player: { battlefield: [bears, hill], life: 20 },
    ai: { battlefield: [], life: 20 }
  };
  const combat = new CombatService({ state: () => state, sba: null, replacements: noopReplacements });
  combat.begin();
  expectThrow(
    () => combat.confirmAttackers([bears, hill], 'player', [['gb4', 'hg4']]),
    "702.22c : un groupe sans aucune créature banding n'est pas un vrai groupe -> erreur"
  );
}

{
  // Cas précis du correctif : UNE SEULE créature sans banding déclarée comme "groupe" à elle seule.
  const bears = makeCreature('gb5', 'Grizzly Bears', 2, 2, []);
  const state = {
    activePlayer: 'player',
    player: { battlefield: [bears], life: 20 },
    ai: { battlefield: [], life: 20 }
  };
  const combat = new CombatService({ state: () => state, sba: null, replacements: noopReplacements });
  combat.begin();
  expectThrow(
    () => combat.confirmAttackers([bears], 'player', [['gb5']]),
    "702.22c : un groupe d'une seule créature SANS banding -> erreur (correctif du point 2 signalé par Qwen)"
  );
}

// ============================================================
// Scénario B — 702.22j (ordre attaquant -> bloqueurs), non-régression
// ============================================================
{
  const hill = makeCreature('hg2', 'Hill Giant', 3, 3, []);
  const benalish = makeCreature('bh2', 'Benalish Hero', 1, 1, ['banding']);
  const bears = makeCreature('gb2', 'Grizzly Bears', 2, 2, []);
  const state = {
    activePlayer: 'player',
    player: { battlefield: [hill], life: 20 },
    ai: { battlefield: [benalish, bears], life: 20 }
  };
  const combat = new CombatService({ state: () => state, sba: null, replacements: noopReplacements });
  combat.begin();
  combat.confirmAttackers([hill], 'player', []); // pas de groupe : Hill Giant attaque seul
  combat.assignBlockers({ hg2: ['bh2', 'gb2'] }); // ordre : Benalish Hero d'abord
  const events = combat.resolveDamage();

  check(benalish.damageMarked === 1, "702.22j : Benalish Hero (1/1, en tête d'ordre) reçoit 1 blessure létale");
  check(bears.damageMarked === 2, '702.22j : Grizzly Bears reçoit les 2 blessures restantes');
  const hits = events.filter(e => e.type === 'combatDamageToCreature' && e.sourceId === 'hg2').map(e => e.targetId);
  check(JSON.stringify(hits) === JSON.stringify(['bh2', 'gb2']), "702.22j : l'ordre des blessures suit l'ordre du tableau de bloqueurs fourni (aucun nouveau code nécessaire pour cette règle)");
}

// ============================================================
// Scénario C — non-régression : combat normal sans banding ni groupe
// ============================================================
{
  const attacker = makeCreature('atk3', 'Grizzly Bears', 2, 2, []);
  const blocker = makeCreature('blk3', 'Hill Giant', 3, 3, []);
  const state = {
    activePlayer: 'player',
    player: { battlefield: [attacker], life: 20 },
    ai: { battlefield: [blocker], life: 20 }
  };
  const combat = new CombatService({ state: () => state, sba: null, replacements: noopReplacements });
  combat.begin();
  combat.confirmAttackers([attacker], 'player', []);
  combat.assignBlockers({ atk3: ['blk3'] });
  combat.resolveDamage(); // aucun blockerDamageSplit nécessaire : un seul attaquant, un seul bloqueur
  check(blocker.damageMarked === 2, 'Non-régression : un bloqueur unique reçoit toujours la pleine force de son attaquant sans paramètre supplémentaire');
  check(attacker.damageMarked === 3, 'Non-régression : un attaquant unique reçoit toujours la pleine force de son bloqueur sans paramètre supplémentaire');
}

if (failed) {
  console.error('V12.26 banding: ÉCHEC — voir les FAIL ci-dessus');
  process.exit(1);
}
console.log('V12.26 banding: PASS');
