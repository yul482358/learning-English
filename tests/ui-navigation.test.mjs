import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

for (const needle of [
  'nav-link',
  '首页',
  '刷词模式',
  '平衡学习',
  '阅读训练',
  '学习空间',
  '阅读空间',
  '词汇面板',
]) {
  assert.ok(html.includes(needle) || appJs.includes(needle), `missing UI/navigation marker: ${needle}`);
}

assert.ok(appJs.includes('setActiveView'), 'expected view switching logic');
assert.ok(html.includes('id="view-home"'), 'expected home view hook');
assert.ok(html.includes('id="view-library"'), 'expected library view hook');
assert.ok(html.includes('id="view-reader"'), 'expected reader view hook');

console.log('ui-navigation.test.mjs passed');
