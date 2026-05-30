import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');

for (const marker of [
  'function rangeForR2',
  'offset: range.start',
  'length: range.end - range.start + 1',
  "'content-type': 'audio/mpeg'",
  'Cache-Control',
]) {
  assert.ok(worker.includes(marker), `missing audio streaming marker: ${marker}`);
}

assert.ok(!worker.includes('env.LISTENING_BUCKET.get(located.key, range ? { range } : undefined)'), 'R2 get should use offset/length range shape, not start/end directly');

console.log('listening audio streaming checks passed');
