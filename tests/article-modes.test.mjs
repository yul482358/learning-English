import assert from 'node:assert/strict';
import fs from 'node:fs';

const appData = JSON.parse(fs.readFileSync(new URL('../src/generated/app-data.json', import.meta.url)));
const articles = JSON.parse(fs.readFileSync(new URL('../src/generated/articles.json', import.meta.url)));

const modeRanges = {
  fast: { minTargets: 30, maxTargets: 60, minDensity: 0.07, maxDensity: 0.16 },
  core: { minTargets: 18, maxTargets: 35, minDensity: 0.035, maxDensity: 0.095 },
  read: { minTargets: 8, maxTargets: 18, minDensity: 0.012, maxDensity: 0.045 },
};

assert.ok(appData.modes?.length >= 3, 'appData.modes should include fast/core/read');
for (const mode of ['fast', 'core', 'read']) {
  assert.ok(appData.modes.some((item) => item.id === mode), `missing mode ${mode}`);
}

const grouped = new Map();
for (const article of articles) {
  assert.ok(article.mode, `article ${article.id} missing mode`);
  assert.ok(modeRanges[article.mode], `article ${article.id} has unsupported mode ${article.mode}`);
  const range = modeRanges[article.mode];
  const density = article.targetWordIds.length / article.wordCount;
  assert.ok(article.targetWordIds.length >= range.minTargets, `${article.id} too few targets for ${article.mode}`);
  assert.ok(article.targetWordIds.length <= range.maxTargets, `${article.id} too many targets for ${article.mode}`);
  assert.ok(density >= range.minDensity, `${article.id} density too low for ${article.mode}: ${density}`);
  assert.ok(density <= range.maxDensity, `${article.id} density too high for ${article.mode}: ${density}`);
  if (!grouped.has(article.mode)) grouped.set(article.mode, []);
  grouped.get(article.mode).push(article.id);
}

for (const mode of ['fast', 'core', 'read']) {
  assert.ok((grouped.get(mode) || []).length >= 1, `expected at least one ${mode} article`);
}

console.log('article-modes.test.mjs passed');
