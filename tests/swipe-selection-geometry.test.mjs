import assert from 'node:assert/strict';
import fs from 'node:fs';

const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

for (const needle of [
  'function wordNodeClosestToPoint',
  'function wordNodeAtSelectionPoint',
  'function mergedWordRangeRect',
  'wordNodeAtSelectionPoint(event)',
  'const lineDistance = Math.max(0, rect.top - y, y - rect.bottom)',
  'const horizontalDistance = Math.max(0, rect.left - x, x - rect.right)',
  'lineDistance > 28',
  'const selectedNodes = wordNodesInRange(state.swipeSelect.startNode, state.swipeSelect.lastNode)',
  'mergedWordRangeRect(selectedNodes)',
]) {
  assert.ok(appJs.includes(needle), `missing robust swipe selection geometry marker: ${needle}`);
}

assert.ok(
  !appJs.includes('function wordNodeFromPoint(x, y) {\n  return document.elementsFromPoint(x, y).find'),
  'swipe selection must not depend only on exact elementsFromPoint hits; finger drags often pass through spaces, punctuation, and line gaps',
);

assert.ok(
  !appJs.includes('rect = state.swipeSelect.startNode.getBoundingClientRect()'),
  'selection action should be positioned from the selected range, not only the first word',
);

console.log('swipe-selection-geometry.test.mjs passed');
