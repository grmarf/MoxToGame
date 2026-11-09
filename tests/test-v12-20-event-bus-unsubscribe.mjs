// V12.20 — Un listener qui se désinscrit pendant emit casse-t-il l'itération ?
import { gameEvents } from '../src/core/event-bus.js';

let log = [];
const handlerA = () => { log.push('A'); unsubB(); };
const handlerB = () => { log.push('B'); };
const handlerC = () => { log.push('C'); };

const unsubA = gameEvents.on('test', handlerA);
const unsubB = gameEvents.on('test', handlerB);
const unsubC = gameEvents.on('test', handlerC);

gameEvents.emit({ type: 'test' });

console.log('Emit log:', log);
if (log.join(',') === 'A,C' || log.join(',') === 'A,B,C') {
  console.log(`PASS: désinscription pendant emit ne corrompt pas l'itération`);
} else {
  console.error(`BUG: itération corrompue par désinscription`);
  process.exit(1);
}
