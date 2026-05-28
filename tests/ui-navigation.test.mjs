import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

for (const needle of [
  'nav-link',
  '序章',
  '选文',
  '阅读',
  '刷词模式',
  '平衡学习',
  '阅读训练',
  '词语侧记',
  'reading-side-panel',
  'reader-exit',
  '退出阅读，返回选文',
]) {
  assert.ok(html.includes(needle) || appJs.includes(needle), `missing UI/navigation marker: ${needle}`);
}

assert.ok(appJs.includes('setActiveView'), 'expected view switching logic');
assert.ok(html.includes('id="view-home"'), 'expected home view hook');
assert.ok(html.includes('id="view-library"'), 'expected library view hook');
assert.ok(html.includes('id="view-reader"'), 'expected reader view hook');
assert.ok(!html.includes('id="view-inspector"'), 'inspector should no longer be a standalone view');

console.log('ui-navigation.test.mjs passed');
