// Usage : node tools/bench-selfplay.mjs [nbParties=50] [graineDepart=1] [--verbose]
// Fait jouer des parties IA-vs-IA reproductibles et agrège violations d'invariants / échecs d'actions.
import { playGame } from '../src/sim/selfplay.js';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const verbose = process.argv.includes('--verbose');
const games = Number(args[0] || 50), start = Number(args[1] || 1);
const agg = { violations: new Map(), soft: new Map(), ends: {}, winners: {}, turns: 0, steps: 0 };
const t0 = Date.now();
for (let seed = start; seed < start + games; seed++) {
  const r = playGame({ seed });
  agg.ends[r.endReason] = (agg.ends[r.endReason] || 0) + 1;
  agg.winners[r.winner || 'none'] = (agg.winners[r.winner || 'none'] || 0) + 1;
  agg.turns += r.turns; agg.steps += r.steps;
  for (const [k, v] of r.violations) { const c = agg.violations.get(k) || { games: 0, count: 0, firstSeed: seed, where: `T${v.turn} ${v.phase}` }; c.games += 1; c.count += v.count; agg.violations.set(k, c); }
  for (const [k, v] of r.softFailures) { const c = agg.soft.get(k) || { games: 0, count: 0, firstSeed: seed, where: `T${v.turn} ${v.phase}`, examples: new Set() }; c.games += 1; c.count += v.count; if (v.example && c.examples.size < 6) c.examples.add(v.example.replace(/^(cast|counter|land):/, '')); agg.soft.set(k, c); }
  if (verbose) console.log(`seed ${seed}: ${r.endReason} ${r.winner || '-'} T${r.turns} ${r.hash}`);
}
const fmt = (m) => [...m].sort((a, b) => b[1].games - a[1].games).map(([k, v]) => `  ${String(v.games).padStart(3)} parties / ${String(v.count).padStart(4)}x  ${k}   [1re graine ${v.firstSeed}, ${v.where}]${v.examples?.size ? '  ex: ' + [...v.examples].join(', ') : ''}`).join('\n') || '  (aucune)';
console.log(`\n=== Banc IA-vs-IA : ${games} parties (graines ${start}..${start + games - 1}) en ${((Date.now() - t0) / 1000).toFixed(1)}s ===`);
console.log('Fins       :', JSON.stringify(agg.ends), '| Vainqueurs :', JSON.stringify(agg.winners), '| Tours moyens :', (agg.turns / games).toFixed(1));
console.log('\nVIOLATIONS D\'INVARIANTS :\n' + fmt(agg.violations));
console.log('\nÉCHECS D\'ACTIONS (exceptions du moteur sur ordre de l\'IA) :\n' + fmt(agg.soft));
process.exit(agg.violations.size ? 1 : 0);
