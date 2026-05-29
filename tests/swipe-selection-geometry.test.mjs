import assert from 'node:assert/strict';
import fs from 'node:fs';

const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

for (const forbidden of [
  'function wordNodeClosestToPoint',
  'function wordNodeAtSelectionPoint',
  'function mergedWordRangeRect',
  'wordNodeClosestToPoint(event.clientX, event.clientY)',
  'const lineDistance = Math.max(0, rect.top - y, y - rect.bottom)',
  'const horizontalDistance = Math.max(0, rect.left - x, x - rect.right)',
  'const selectedNodes = wordNodesInRange(state.swipeSelect.startNode, state.swipeSelect.lastNode)',
  'mergedWordRangeRect(selectedNodes)',
  "addEventListener('pointermove'",
  "addEventListener('pointerup'",
  "addEventListener('pointercancel'",
  '.swipe-selected',
  '.swipe-selecting',
]) {
  assert.ok(!appJs.includes(forbidden), `obsolete swipe geometry should be removed from app.js: ${forbidden}`);
  assert.ok(!css.includes(forbidden), `obsolete swipe geometry should be removed from CSS: ${forbidden}`);
}

for (const needle of [
  'function splitParagraphIntoSentences',
  'function createSentenceTranslateButton',
  'button.textContent = \'•\'',
  'button.addEventListener(\'click\', () => inspectSentence(article, sentence, button))',
]) {
  assert.ok(appJs.includes(needle), `sentence-dot translation should replace swipe geometry: ${needle}`);
}

console.log('swipe-selection-geometry.test.mjs passed');
