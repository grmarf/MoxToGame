import { ReplacementService } from '../src/core/replacement-effects.js';

// Scenario 1: player at 3 life, prevention shield 2, Ali from Cairo on battlefield.
// Damage 5 arrives. Shield prevents 2 -> 3 remaining.
// 3 - 3 = 0 < 1, so Ali limits loss to 2 (life goes to 1).
// Total prevented = 2 (shield) + 1 (Ali) = 3. Final life = 1.
const state = {
  player: {
    life: 3,
    battlefield: [{ uid: 'ali', name: 'Ali from Cairo', controller: 'player' }],
    prevention: [{ amount: 2, scope: 'controller', until: 'nextMatchingDamage' }]
  },
  ai: { life: 20, battlefield: [], prevention: [] }
};

const r = new ReplacementService({ state: () => state });
const result = r.applyDamageToPlayer('player', 5, { source: { name: 'Bolt' }, color: 'R' });

if (state.player.life !== 1) throw new Error(`Expected life=1, got ${state.player.life}`);
if (result.amount !== 2) throw new Error(`Expected final amount=2, got ${result.amount}`);
if (result.prevented !== 3) throw new Error(`Expected prevented=3, got ${result.prevented}`);
if (!result.event.lifeLossReplaced) throw new Error(`Expected Ali replacement to be recorded`);

// Scenario 2: multiple shields, no Ali.
// Shield A prevents 1, Shield B prevents 3. Total 5 damage -> 1 remaining.
state.player.life = 20;
state.player.battlefield = [];
state.player.prevention = [
  { amount: 1, scope: 'controller', until: 'nextMatchingDamage' },
  { amount: 3, scope: 'controller', until: 'nextMatchingDamage' }
];
const r2 = new ReplacementService({ state: () => state });
const result2 = r2.applyDamageToPlayer('player', 5, { source: { name: 'Test' } });
if (state.player.life !== 19) throw new Error(`Expected life=19, got ${state.player.life}`);
if (result2.prevented !== 4) throw new Error(`Expected prevented=4, got ${result2.prevented}`);

console.log('OK: V12.3 multiple replacements -- prevention ordering + Ali pipeline.');

// V12.6 — when two non-prevention replacements are simultaneously applicable,
// the affected player can choose which one is applied first; each replacement
// is then consumed for this event.
import { ChoiceService } from '../src/core/choice-service.js';
const choiceService = new ChoiceService({ state: () => ({}) });
choiceService.setChooser(choice => choice.options[1]);
const choiceState = { player: { life: 20, battlefield: [], prevention: [] }, ai: { life: 20, battlefield: [] } };
const choiceOrder = [];
choiceState.player.battlefield.push(
  { uid: 'r1', name: 'R1', controller: 'player', replacementEffects: [{ event: 'testChoice', transform: event => { choiceOrder.push('r1'); return { marker: `${event.marker || ''}1` }; } }] },
  { uid: 'r2', name: 'R2', controller: 'player', replacementEffects: [{ event: 'testChoice', transform: event => { choiceOrder.push('r2'); return { marker: `${event.marker || ''}2` }; } }] }
);
const choiceReplacements = new ReplacementService({ state: () => choiceState, choiceService });
const choiceResult = choiceReplacements.replaceEvent({ kind: 'testChoice', targetType: 'player', targetSide: 'player' });
if (choiceOrder.join(',') !== 'r2,r1') throw new Error(`Expected player-selected replacement order r2,r1, got ${choiceOrder.join(',')}`);
if (choiceResult.event.marker !== '21') throw new Error(`Expected both replacements once, got ${JSON.stringify(choiceResult.event)}`);

console.log('OK: V12.6 multiple replacements -- player choice + one-shot replacement consumption.');
