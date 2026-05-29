import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const buildScript = fs.readFileSync(new URL('../scripts/build-data.mjs', import.meta.url), 'utf8');
const appData = JSON.parse(fs.readFileSync(new URL('../src/generated/app-data.json', import.meta.url), 'utf8'));
const articles = JSON.parse(fs.readFileSync(new URL('../src/generated/articles.json', import.meta.url), 'utf8'));
const vocabulary = JSON.parse(fs.readFileSync(new URL('../src/generated/vocabulary.json', import.meta.url), 'utf8'));

const modeLabels = appData.modes.map((mode) => mode.label);
assert.deepEqual(modeLabels, ['高频刷词', '平衡精读', '长文阅读'], 'mode labels should be Chinese-first');

for (const mode of appData.modes) {
  assert.ok(!/[A-Za-z]/.test(mode.targetRange), `target range should be Chinese: ${mode.targetRange}`);
  assert.ok(mode.densityHint.includes('词汇密度'), `density hint should be localized: ${mode.densityHint}`);
}

for (const theme of appData.themes) {
  assert.ok(/[\u4e00-\u9fff]/.test(theme.label), `theme label should contain Chinese: ${theme.label}`);
  assert.ok(/[\u4e00-\u9fff]/.test(theme.description), `theme description should contain Chinese: ${theme.description}`);
}

const covered = new Set();
for (const article of articles) {
  for (const id of article.coverage?.exactMatches || []) covered.add(id);
}
assert.equal(appData.stats.vocabularyCoverageCount, vocabulary.length, 'generated stats should expose full vocabulary coverage count');
assert.equal(appData.stats.vocabularyCoverageRate, 1, 'generated stats should expose full vocabulary coverage rate');
assert.equal(covered.size, appData.stats.vocabularyCoverageCount, 'coverage stat should match exact-match union');

for (const needle of [
  'id="stat-coverage-label"',
  '词汇覆盖',
  '继续上次阅读',
  '最近读过',
  'id="recent-reading-list"',
]) {
  assert.ok(html.includes(needle), `missing learning-experience HTML marker: ${needle}`);
}

for (const needle of [
  'RECENT_READING_KEY',
  'TRANSLATION_CACHE_KEY',
  'function saveRecentArticle',
  'function renderRecentReading',
  'function cacheTranslationResult',
  'function getCachedTranslation',
  'renderArticle(last.articleId)',
]) {
  assert.ok(appJs.includes(needle), `missing learning-experience app marker: ${needle}`);
}

assert.ok(!buildScript.includes("label: 'Fast Vocabulary'"), 'build metadata should no longer expose English mode labels');
assert.ok(!html.includes('命中覆盖'), 'homepage should not show misleading average-hit wording');

console.log('learning-experience.test.mjs passed');
