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
  'id="mobile-sheet-speak"',
  'data-speak-source="mobile-sheet"',
]) {
  assert.ok(html.includes(needle), `missing mobile translation HTML marker: ${needle}`);
}

for (const needle of [
  'function isTouchReading()',
  'function showMobileTranslationSheet',
  'function hideMobileTranslationSheet',
  'function speakText',
  'function inspectSentence',
  'function createSentenceTranslateButton',
  'mobileSheet',
  'mobileSheetSpeak',
]) {
  assert.ok(appJs.includes(needle), `missing mobile translation app marker: ${needle}`);
}

assert.ok(!appJs.includes("els.readerContent.addEventListener('mouseup', scheduleSelectionTranslation)"), 'mobile/tablet mouse events should not bypass gated selection behavior');
assert.ok(appJs.includes("els.readerContent.addEventListener('mouseup', handlePointerSelectionEnd)"), 'desktop pointer selection should be gated before translating');
assert.ok(!appJs.includes("els.readerContent.addEventListener('touchend', scheduleSelectionTranslation)"), 'touch selection should not auto-translate on mobile/tablet');
assert.ok(!appJs.includes("els.readerContent.addEventListener('touchend', handleTouchSelectionEnd)"), 'obsolete mobile touch selection action should be removed');
assert.ok(appJs.includes('if (isTouchReading()) {\n    showMobileTranslationSheet'), 'touch word inspection should use bottom sheet');
assert.ok(appJs.includes("if (isTouchReading()) return;\n  scheduleSelectionTranslation();"), 'touch text selection should not trigger native/manual selection translation');

for (const needle of [
  '.mobile-translation-sheet',
  '.mobile-translation-sheet.open',
  '@media (max-width: 900px)',
  'env(safe-area-inset-bottom)',
  '.speak-button',
  '.mobile-sheet-tools',
]) {
  assert.ok(css.includes(needle), `missing mobile translation CSS marker: ${needle}`);
}

for (const needle of [
  'function tokenizeParagraphForTranslation',
  'function splitParagraphIntoSentences',
  'function createWordButton',
  'function isIeltsTargetWord',
  'function closeReadingOverlays',
  'className = isTarget ? \'vocab-button target-word\' : \'vocab-button plain-word\'',
  'function closeOverlaysFromReaderBlankTap',
  'els.readerContent.addEventListener(\'pointerdown\', closeOverlaysFromReaderBlankTap)',
  'wordNode.addEventListener(\'click\', (event) => inspectWordFromInlineTap(article, token, wordNode, event))',
  'function inspectWordFromInlineTap',
  'window.getSelection()?.toString()',
]) {
  assert.ok(appJs.includes(needle), `missing all-word translation app marker: ${needle}`);
}

assert.ok(!appJs.includes('const targetWords = article.targetWords.slice().sort'), 'paragraph rendering should no longer only wrap IELTS target words');
assert.ok(appJs.includes('for (const token of tokenizeParagraphForTranslation(sentence))'), 'sentence rendering should tokenize every English word for click translation');
assert.ok(appJs.includes('showMobileTranslationSheet({ title: text, mode: translationMode'), 'desktop selected text path should still support mobile bottom sheet fallback');
assert.ok(appJs.includes('hideMobileTranslationSheet();'), 'blank-space close should retract the translation sheet');

for (const needle of [
  '.vocab-button.target-word',
  '.vocab-button.plain-word',
  '.vocab-button.plain-word:hover',
  'box-shadow: inset 0 -0.5em 0 rgba(201, 100, 66, 0.18)',
]) {
  assert.ok(css.includes(needle), `missing all-word translation CSS marker: ${needle}`);
}

for (const forbidden of [
  'mobile-selection-action',
  'selectionAction',
  'swipeSelect',
  'pendingSwipeSelection',
  'beginSwipeSelection',
  'updateSwipeSelection',
  'finishSwipeSelection',
  'swipe-selected',
  'swipe-selecting',
  'translateSelectionFromAction',
  "addEventListener('touchstart', disableNativeMobileSelection",
  "addEventListener('touchmove', disableNativeMobileSelection",
  "addEventListener('touchend', disableNativeMobileSelection",
  'disableNativeMobileSelection',
  'event.stopPropagation();',
]) {
  assert.ok(!html.includes(forbidden), `HTML should not include obsolete marker: ${forbidden}`);
  assert.ok(!appJs.includes(forbidden), `app.js should not include obsolete marker: ${forbidden}`);
  assert.ok(!css.includes(forbidden), `CSS should not include obsolete marker: ${forbidden}`);
}

assert.ok(css.includes('@media (max-width: 900px), (pointer: coarse)'), 'native text selection should only be disabled on mobile/touch reading contexts');
assert.ok(css.includes('.reader-content {\n    user-select: none;'), 'mobile reader content should disable native text selection');
assert.ok(css.includes('-webkit-touch-callout: none;'), 'mobile reader content should disable iOS text callout/native selection handles');

console.log('mobile-translation.test.mjs passed');
