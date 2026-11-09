import assert from 'node:assert/strict';
import { TriggerCollector } from '../src/core/triggers/trigger-collector.js';
import { gameEvents } from '../src/core/event-bus.js';

const source = {
  uid: 'perm_current_1',
  id: 9001,
  triggers: [{
    event: 'damageDealt',
    condition: { kind: 'combatDamageToPlayer', sourceSelf: true },
    effect: { type: 'noop' },
  }],
};
const collector = new TriggerCollector({ eventBus: gameEvents, stack: null, getGameState: () => ({}) });
collector.registerSource(source, 'player');

const trigger = collector.collect({
  type: 'damageDealt',
  damageKind: 'combat',
  targetType: 'player',
  target: 'ai',
  source: { uid: source.uid },
  sourceId: source.uid,
});

assert.equal(trigger.length, 1, 'sourceSelf doit matcher par uid même si l’objet source est une autre instance');
console.log('OK V12.17: sourceSelf résout l’identité stable de la source.');
