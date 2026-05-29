import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

for (const needle of [
  'id="mobile-translation-sheet"',
  'id="mobile-sheet-title"',
  'id="mobile-sheet-original"',
  'id="mobile-sheet-translation"',
  'id="mobile-sheet-explanation"',
  'id="mobile-selection-action"',
  '翻译选中内容',
]) {
  assert.ok(html.includes(needle), `missing mobile translation HTML marker: ${needle}`);
}

for (const needle of [
  'function isTouchReading()',
  'function showMobileTranslationSheet',
  'function hideMobileTranslationSheet',
  'function showSelectionAction',
  'function hideSelectionAction',
  'function translateSelectionFromAction',
  "? 'sentence' : 'word'",
  'mobileSheet',
  'selectionAction',
]) {
  assert.ok(appJs.includes(needle), `missing mobile translation app marker: ${needle}`);
}

assert.ok(!appJs.includes("els.readerContent.addEventListener('mouseup', scheduleSelectionTranslation)"), 'mobile/tablet mouse events should not bypass manual selection action');
assert.ok(appJs.includes("els.readerContent.addEventListener('mouseup', handlePointerSelectionEnd)"), 'pointer selection should be gated before translating');
assert.ok(!appJs.includes("els.readerContent.addEventListener('touchend', scheduleSelectionTranslation)"), 'touch selection should not auto-translate on mobile/tablet');
assert.ok(appJs.includes("els.readerContent.addEventListener('touchend', handleTouchSelectionEnd)"), 'touch selection should show an explicit translate action');
assert.ok(appJs.includes('if (isTouchReading()) {\n    showMobileTranslationSheet'), 'touch word inspection should use bottom sheet');
assert.ok(appJs.includes('if (rect && isTouchReading()) {\n      showSelectionAction'), 'touch selection should show manual action before translating');

for (const needle of [
  '.mobile-translation-sheet',
  '.mobile-translation-sheet.open',
  '.mobile-selection-action',
  '.mobile-selection-action.visible',
  '@media (max-width: 900px)',
  'env(safe-area-inset-bottom)',
]) {
  assert.ok(css.includes(needle), `missing mobile translation CSS marker: ${needle}`);
}

console.log('mobile-translation.test.mjs passed');
