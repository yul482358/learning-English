import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

for (const forbidden of [
  'mobile-selection-action',
  'swipeSelect',
  'pendingSwipeSelection',
  'beginSwipeSelection',
  'updateSwipeSelection',
  'finishSwipeSelection',
  'swipe-selected',
  'swipe-selecting',
  'translateSelectionFromAction',
]) {
  assert.ok(!html.includes(forbidden), `HTML should remove obsolete swipe selection marker: ${forbidden}`);
  assert.ok(!appJs.includes(forbidden), `app.js should remove obsolete swipe selection marker: ${forbidden}`);
  assert.ok(!css.includes(forbidden), `CSS should remove obsolete swipe selection marker: ${forbidden}`);
}

for (const forbidden of [
  "addEventListener('pointermove'",
  "addEventListener('pointerup'",
  "addEventListener('pointercancel'",
  "addEventListener('touchend', handleTouchSelectionEnd)",
]) {
  assert.ok(!appJs.includes(forbidden), `custom drag selection event should be removed: ${forbidden}`);
}

for (const needle of [
  'function splitParagraphIntoSentences',
  'function createSentenceTranslateButton',
  'function inspectSentence',
  'sentence-translate-button',
  'aria-label="翻译这一句"',
  'title="翻译这一句"',
  "mode: 'sentence'",
  "wordNode.addEventListener('click', (event) => inspectWordFromInlineTap(article, token, wordNode, event))",
]) {
  assert.ok(appJs.includes(needle), `missing sentence-dot translation marker: ${needle}`);
}

for (const needle of [
  '.sentence-wrapper',
  '.sentence-translate-button',
  '.sentence-translate-button:hover',
]) {
  assert.ok(css.includes(needle), `missing sentence-dot CSS marker: ${needle}`);
}

for (const needle of [
  'function speakText',
  'speechSynthesis',
  'window.SpeechSynthesisUtterance',
  'lang = \'en-US\'',
  'data-speak-source',
  'aria-label="播放原文发音"',
  '🔊',
  'speakText(text);',
  'popoverSpeak',
  'mobileSheetSpeak',
]) {
  assert.ok(appJs.includes(needle) || html.includes(needle), `missing TTS/speaker marker: ${needle}`);
}

assert.ok(css.includes('.speak-button'), 'speaker buttons need styling');
assert.ok(css.includes('.mobile-sheet-tools'), 'mobile sheet should reserve a toolbar for speaker action');
assert.ok(css.includes('.popover-actions'), 'desktop popover should reserve action area for speaker action');

console.log('sentence-dot-tts.test.mjs passed');
