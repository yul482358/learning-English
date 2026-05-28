import assert from 'node:assert/strict';
import fs from 'node:fs';

const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

assert.ok(appJs.includes('function resetReaderToEmpty()'), 'expected explicit empty-reader reset helper');
assert.ok(appJs.includes('resetReaderToEmpty();\n  setActiveView(safeView)'), 'init should not auto-open the first article');
assert.ok(!appJs.includes('if (first) {\n    renderArticle(first.id);'), 'filter fallback must not auto-open first article');
assert.ok(appJs.includes('function handleFiltersChanged()'), 'expected filter change handler');
assert.ok(appJs.includes('ensureArticleVisibleOrFallback();'), 'filter change should still reconcile stale active article');

console.log('filter-no-autoread.test.mjs passed');
