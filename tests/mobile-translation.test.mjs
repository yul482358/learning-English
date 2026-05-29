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

for (const needle of [
  'function tokenizeParagraphForTranslation',
  'function createWordButton',
  'function isIeltsTargetWord',
  'function closeReadingOverlays',
  'className = isTarget ? \'vocab-button target-word\' : \'vocab-button plain-word\'',
  'function beginSwipeSelection',
  'function updateSwipeSelection',
  'function finishSwipeSelection',
  'function wordNodeClosestToPoint',
  'function wordNodeAtSelectionPoint',
  'function clearPendingSwipeSelection',
  'function closeOverlaysFromReaderBlankTap',
  'clearPendingSwipeSelection();',
  'els.readerContent.addEventListener(\'pointerdown\', closeOverlaysFromReaderBlankTap)',
  'state.swipeSelect',
  'function clearNativeMobileSelection',
  'function disableNativeMobileSelection',
  'clearNativeMobileSelection();',
  'els.readerContent.addEventListener(\'selectstart\', disableNativeMobileSelection)',
  'els.readerContent.addEventListener(\'contextmenu\', disableNativeMobileSelection)',
  'els.readerContent.classList.add(\'swipe-selecting\')',
  'els.readerContent.classList.remove(\'swipe-selecting\')',
  'event.preventDefault();',
  'event.currentTarget.setPointerCapture?.(event.pointerId)',
  'wordNodeAtSelectionPoint(event)',
  'els.readerContent.addEventListener(\'pointermove\', updateSwipeSelectionFromPoint)',
  'wordNode.addEventListener(\'pointerdown\', beginSwipeSelection)',
  'wordNode.addEventListener(\'pointerenter\', (event) => updateSwipeSelection(wordNode, event))',
  'wordNode.addEventListener(\'click\', (event) => inspectWordFromInlineTap(article, token, wordNode, event))',
  'function inspectWordFromInlineTap',
  'window.getSelection()?.toString()',
  'translateSelection({ forceSheet: true })',
]) {
  assert.ok(appJs.includes(needle), `missing all-word translation app marker: ${needle}`);
}

assert.ok(!appJs.includes('const targetWords = article.targetWords.slice().sort'), 'paragraph rendering should no longer only wrap IELTS target words');
assert.ok(appJs.includes('for (const token of tokenizeParagraphForTranslation(paragraph))'), 'paragraph rendering should tokenize every English word for click translation');
assert.ok(appJs.includes('showMobileTranslationSheet({ title: text, mode: translationMode'), 'selected text should open the translation sheet on mobile');
assert.ok(appJs.includes('hideMobileTranslationSheet();'), 'blank-space close should retract the translation sheet');

for (const needle of [
  '.vocab-button.target-word',
  '.vocab-button.plain-word',
  '.vocab-button.plain-word:hover',
  'box-shadow: inset 0 -0.5em 0 rgba(201, 100, 66, 0.18)',
]) {
  assert.ok(css.includes(needle), `missing all-word translation CSS marker: ${needle}`);
}

assert.ok(appJs.includes('translateSelection({ forceSheet: true, overrideText'), 'swipe-selected words should translate by explicit override text instead of native long-press selection');
assert.ok(appJs.includes('els.readerContent.addEventListener(\'pointermove\', updateSwipeSelectionFromPoint)'), 'dragging across word spans should update selection from pointer coordinates');
assert.ok(appJs.includes('els.readerContent.addEventListener(\'pointerup\', finishSwipeSelection)'), 'swipe selection should finish on pointerup');
assert.ok(css.includes('.vocab-button.swipe-selected'), 'swipe-selected words need visible selection styling');
assert.ok(appJs.includes('wordNode.dataset.wordIndex'), 'word spans should keep sequential indices so cross-line ranges can be reconstructed');
assert.ok(appJs.includes('document.elementsFromPoint'), 'cross-line swipe selection should hit-test by viewport coordinates, not depend on same-line pointerenter only');
assert.ok(!appJs.includes("addEventListener('touchstart', disableNativeMobileSelection"), 'native selection blocking should not suppress touchstart because tap-to-translate relies on normal click synthesis');
assert.ok(!appJs.includes("addEventListener('touchmove', disableNativeMobileSelection"), 'native selection blocking should not suppress touchmove globally because custom pointer selection owns drag handling');
assert.ok(!appJs.includes("addEventListener('touchend', disableNativeMobileSelection"), 'native selection blocking should not clear selection before touchend handlers or suppress click synthesis');
assert.ok(!appJs.includes('event.stopPropagation();'), 'mobile native selection prevention must not stop propagation and break word tap/click handlers');
assert.ok(css.includes('@media (max-width: 900px), (pointer: coarse)'), 'native text selection should only be disabled on mobile/touch reading contexts');
assert.ok(css.includes('.reader-content {\n    user-select: none;'), 'mobile reader content should disable native text selection');
assert.ok(css.includes('-webkit-touch-callout: none;'), 'mobile reader content should disable iOS text callout/native selection handles');
assert.ok(css.includes('.reader-content.swipe-selecting'), 'reader content should lock touch scrolling while actively swiping across words');
assert.ok(css.includes('touch-action: none;'), 'active swipe selection should disable browser panning to avoid page sliding during cross-line selection');

console.log('mobile-translation.test.mjs passed');
