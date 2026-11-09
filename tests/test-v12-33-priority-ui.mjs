import fs from 'node:fs';
import assert from 'node:assert/strict';

const turnUi = fs.readFileSync(new URL('../src/ui/turn-ui.js', import.meta.url), 'utf8');
const bootstrap = fs.readFileSync(new URL('../src/app/bootstrap.js', import.meta.url), 'utf8');
const gameUi = fs.readFileSync(new URL('../src/ui/game-ui.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(turnUi, /getPriorityHolder/);
assert.match(turnUi, /priority-indicator/);
assert.match(turnUi, /Votre priorité/);
assert.match(turnUi, /Priorité à l’IA/);
assert.match(turnUi, /playerHasPriority/);
assert.match(turnUi, /disabled/);
assert.match(bootstrap, /getPriorityHolder:\s*\(\)\s*=>\s*game\.state\?\.priorityHolder/);
assert.match(gameUi, /dispatch\('passPriority'/);
assert.match(gameUi, /priorityHolder\s*!==\s*'player'/);
assert.match(html, /id="resolve-stack"/);

console.log('OK: V12.33 UI expose explicit priority ownership and disables player controls when AI owns priority.');
