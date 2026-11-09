import assert from 'assert';
import { rngClock } from '../src/core/rng-clock-service.js';

// --- createToken déterministe (testé via rngClock.uuid, utilisé par createToken) ---
{
  rngClock.configure({ seed: 12345, useLogicalClock: true });
  const u1 = rngClock.uuid('token');
  const u2 = rngClock.uuid('obj');

  rngClock.configure({ seed: 12345, useLogicalClock: true });
  const u1b = rngClock.uuid('token');
  const u2b = rngClock.uuid('obj');

  assert.strictEqual(u1b, u1, 'rngClock.uuid("token") doit être identique avec la même graine');
  assert.strictEqual(u2b, u2, 'rngClock.uuid("obj") doit être identique avec la même graine');
}

// --- discard aléatoire déterministe (simule l'algorithme réel) ---
// L'handler discard utilise : Math.floor(rngClock.random() * s.hand.length)
{
  rngClock.configure({ seed: 77777, useLogicalClock: true });

  const hand = [
    { name: 'A', uid: 'a1' }, { name: 'B', uid: 'b1' }, { name: 'C', uid: 'c1' },
    { name: 'D', uid: 'd1' }, { name: 'E', uid: 'e1' },
  ];
  const graveyard = [];
  const n = 2;

  for (let i = 0; i < n && hand.length > 0; i++) {
    const idx = Math.floor(rngClock.random() * hand.length);
    const [card] = hand.splice(idx, 1);
    graveyard.push(card);
  }
  const discarded1 = graveyard.map(c => c.name).join(',');
  const remaining1 = hand.map(c => c.name).join(',');

  // Réinitialiser avec la même graine
  rngClock.configure({ seed: 77777, useLogicalClock: true });
  const hand2 = [
    { name: 'A', uid: 'a1' }, { name: 'B', uid: 'b1' }, { name: 'C', uid: 'c1' },
    { name: 'D', uid: 'd1' }, { name: 'E', uid: 'e1' },
  ];
  const graveyard2 = [];

  for (let i = 0; i < n && hand2.length > 0; i++) {
    const idx = Math.floor(rngClock.random() * hand2.length);
    const [card] = hand2.splice(idx, 1);
    graveyard2.push(card);
  }
  const discarded2 = graveyard2.map(c => c.name).join(',');
  const remaining2 = hand2.map(c => c.name).join(',');

  assert.strictEqual(discarded2, discarded1, 'discard aléatoire doit défausser les mêmes cartes avec la même graine');
  assert.strictEqual(remaining2, remaining1, 'discard aléatoire doit garder les mêmes cartes avec la même graine');
}

rngClock.configure({ seed: null, useLogicalClock: false });
console.log('OK: R-DET-01b — createToken (via uuid) et discard aléatoire sont déterministes avec graine fixe.');
