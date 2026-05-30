import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

for (const marker of [
  'function startAppOnce',
  'state.appStarted',
  'bootstrapAuth().then',
  'startAppOnce().catch',
  'alreadyBootstrapped',
]) {
  assert.ok(app.includes(marker), `missing bootstrap marker: ${marker}`);
}

assert.ok(!app.includes('bootstrapAuth().then((user) => {\n  if (!user) return;\n  init().catch'), 'bootstrap should not skip init when a previous script instance is still bootstrapping auth');

console.log('app bootstrap resilience checks passed');
