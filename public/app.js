const RECENT_READING_KEY = 'ielts-reading-lab:recent-reading';
const TRANSLATION_CACHE_KEY = 'ielts-reading-lab:translation-cache';
const RECENT_READING_LIMIT = 5;
const TRANSLATION_CACHE_LIMIT = 120;

const state = {
  appData: null,
  articles: [],
  vocabulary: [],
  articleById: new Map(),
  vocabByWord: new Map(),
  activeArticleId: null,
  activeWordButton: null,
  selectionTimer: null,
  swipeSelect: {
    active: false,
    pointerId: null,
    startNode: null,
    lastNode: null,
    startX: 0,
    startY: 0,
    hasDragged: false,
  },
  pendingSwipeSelection: null,
  activeView: 'home',
  recentReading: [],
  translationCache: new Map(),
};

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

registerServiceWorker();

const els = {
  statArticles: document.getElementById('stat-articles'),
  statVocab: document.getElementById('stat-vocab'),
  statCoverage: document.getElementById('stat-coverage'),
  modeStrip: document.getElementById('mode-strip'),
  modeFilter: document.getElementById('mode-filter'),
  themeFilter: document.getElementById('theme-filter'),
  articleList: document.getElementById('article-list'),
  readerEmpty: document.getElementById('reader-empty'),
  readerArticle: document.getElementById('reader-article'),
  readerTheme: document.getElementById('reader-theme'),
  readerTitle: document.getElementById('reader-title'),
  readerSummary: document.getElementById('reader-summary'),
  readerMode: document.getElementById('reader-mode'),
  readerWordcount: document.getElementById('reader-wordcount'),
  readerTargets: document.getElementById('reader-targets'),
  readerDensity: document.getElementById('reader-density'),
  readerContent: document.getElementById('reader-content'),
  inspectWord: document.getElementById('inspect-word'),
  inspectPos: document.getElementById('inspect-pos'),
  inspectTranslation: document.getElementById('inspect-translation'),
  inspectExplanation: document.getElementById('inspect-explanation'),
  inspectContext: document.getElementById('inspect-context'),
  inspectNote: document.getElementById('inspect-note'),
  continueReading: document.getElementById('continue-reading'),
  recentReadingList: document.getElementById('recent-reading-list'),
  mobileSheet: document.getElementById('mobile-translation-sheet'),
  mobileSheetMode: document.getElementById('mobile-sheet-mode'),
  mobileSheetTitle: document.getElementById('mobile-sheet-title'),
  mobileSheetOriginal: document.getElementById('mobile-sheet-original'),
  mobileSheetTranslation: document.getElementById('mobile-sheet-translation'),
  mobileSheetExplanation: document.getElementById('mobile-sheet-explanation'),
  mobileSheetContext: document.getElementById('mobile-sheet-context'),
  mobileSheetClose: document.getElementById('mobile-sheet-close'),
  selectionAction: document.getElementById('mobile-selection-action'),
  navLinks: Array.from(document.querySelectorAll('.nav-link')),
  jumpButtons: Array.from(document.querySelectorAll('[data-view-jump]')),
  viewSections: Array.from(document.querySelectorAll('.view-section')),
};

const floating = document.createElement('div');
floating.className = 'translation-popover hidden';
floating.innerHTML = `
  <div class="popover-topline">
    <span id="popover-mode">翻译</span>
    <button type="button" id="popover-close" aria-label="关闭翻译浮窗">×</button>
  </div>
  <div id="popover-text" class="popover-text"></div>
  <div id="popover-translation" class="popover-translation">加载中…</div>
  <div id="popover-explanation" class="popover-explanation"></div>
`;
document.body.appendChild(floating);

const popoverEls = {
  mode: document.getElementById('popover-mode'),
  text: document.getElementById('popover-text'),
  translation: document.getElementById('popover-translation'),
  explanation: document.getElementById('popover-explanation'),
  close: document.getElementById('popover-close'),
};

function normalizeWord(word) {
  return String(word || '').trim().toLowerCase();
}

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    window.localStorage?.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Local storage can be unavailable in private browsing; the app should keep reading.
  }
}

function translationCacheKey({ articleId, text, context, mode }) {
  return JSON.stringify({ articleId: articleId || state.activeArticleId || '', text: cleanSelectedText(text), context: cleanSelectedText(context), mode });
}

function getCachedTranslation(request) {
  return state.translationCache.get(translationCacheKey(request)) || null;
}

function cacheTranslationResult(request, payload) {
  const key = translationCacheKey(request);
  state.translationCache.delete(key);
  state.translationCache.set(key, { ...payload, cached: true });
  while (state.translationCache.size > TRANSLATION_CACHE_LIMIT) {
    state.translationCache.delete(state.translationCache.keys().next().value);
  }
  writeJsonStorage(TRANSLATION_CACHE_KEY, Array.from(state.translationCache.entries()));
}

function hydrateTranslationCache() {
  const entries = readJsonStorage(TRANSLATION_CACHE_KEY, []);
  const safeEntries = Array.isArray(entries)
    ? entries.filter((entry) => Array.isArray(entry) && entry.length === 2 && typeof entry[0] === 'string' && entry[1] && typeof entry[1] === 'object')
    : [];
  state.translationCache = new Map(safeEntries.slice(-TRANSLATION_CACHE_LIMIT));
}

function saveRecentArticle(article) {
  const item = {
    articleId: article.id,
    title: article.title,
    modeLabel: article.modeLabel,
    themeLabel: state.appData.themes.find((theme) => theme.id === article.theme)?.label || article.theme,
    readAt: new Date().toISOString(),
  };
  state.recentReading = [item, ...state.recentReading.filter((recent) => recent.articleId !== article.id)].slice(0, RECENT_READING_LIMIT);
  writeJsonStorage(RECENT_READING_KEY, state.recentReading);
  renderRecentReading();
}

function hydrateRecentReading() {
  const stored = readJsonStorage(RECENT_READING_KEY, []);
  state.recentReading = Array.isArray(stored)
    ? stored.filter((item) => item?.articleId && state.articleById.has(item.articleId)).slice(0, RECENT_READING_LIMIT)
    : [];
}

function renderRecentReading() {
  if (!els.recentReadingList) return;
  els.recentReadingList.innerHTML = '';
  if (!state.recentReading.length) {
    els.recentReadingList.innerHTML = '<p class="recent-empty">还没有阅读记录。先去挑一篇文章吧。</p>';
    if (els.continueReading) els.continueReading.disabled = true;
    return;
  }

  if (els.continueReading) els.continueReading.disabled = false;
  for (const item of state.recentReading) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recent-reading-card';

    const meta = document.createElement('span');
    meta.textContent = `${item.modeLabel} · ${item.themeLabel}`;
    const title = document.createElement('strong');
    title.textContent = item.title;
    const date = document.createElement('small');
    date.textContent = new Date(item.readAt).toLocaleDateString('zh-CN');

    button.append(meta, title, date);
    button.addEventListener('click', () => renderArticle(item.articleId));
    els.recentReadingList.appendChild(button);
  }
}

function countWords(text) {
  return (String(text).match(/[A-Za-z]+(?:[-'][A-Za-z]+)?/g) || []).length;
}

function cleanSelectedText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function sentenceForText(articleContent, selectedText) {
  const normalizedSelection = normalizeWord(selectedText);
  const sentences = articleContent.split(/(?<=[.!?])\s+/);
  return sentences.find((sentence) => normalizeWord(sentence).includes(normalizedSelection)) || selectedText;
}

function sentenceForWord(articleContent, word) {
  const sentences = articleContent.split(/(?<=[.!?])\s+/);
  const normalized = normalizeWord(word);
  return sentences.find((sentence) => normalizeWord(sentence).includes(normalized)) || '暂时没有找到上下文。';
}

function currentArticle() {
  return state.articleById.get(state.activeArticleId) || null;
}

function isTouchReading() {
  return window.matchMedia('(pointer: coarse), (max-width: 900px)').matches;
}

function showMobileTranslationSheet({ title, mode, original, translation, explanation, context }) {
  if (!els.mobileSheet) return;
  els.mobileSheetMode.textContent = mode === 'sentence' ? '整句翻译' : '单词释义';
  els.mobileSheetTitle.textContent = title || (mode === 'sentence' ? '整句翻译' : '单词释义');
  els.mobileSheetOriginal.textContent = original || '–';
  els.mobileSheetTranslation.textContent = translation || '加载中…';
  els.mobileSheetExplanation.textContent = explanation || '';
  els.mobileSheetContext.textContent = context || '–';
  els.mobileSheet.classList.remove('hidden');
  requestAnimationFrame(() => els.mobileSheet.classList.add('open'));
}

function hideMobileTranslationSheet() {
  if (!els.mobileSheet) return;
  els.mobileSheet.classList.remove('open');
  els.mobileSheet.classList.add('hidden');
}

function showSelectionAction(rect) {
  if (!els.selectionAction) return;
  const bottom = Math.max(18, window.innerHeight - rect.bottom + 18);
  els.selectionAction.style.bottom = `calc(${bottom}px + env(safe-area-inset-bottom))`;
  els.selectionAction.classList.remove('hidden');
  els.selectionAction.classList.add('visible');
}

function hideSelectionAction() {
  if (!els.selectionAction) return;
  els.selectionAction.classList.remove('visible');
  els.selectionAction.classList.add('hidden');
}

function setMobileSheetFromPayload({ payload, text, context, mode, entry }) {
  showMobileTranslationSheet({
    title: payload.word || payload.text || text,
    mode,
    original: payload.text || payload.word || text,
    translation: payload.translation || entry?.meaningCn || '暂无翻译',
    explanation: payload.explanation || entry?.notes || '暂时没有更多解释。',
    context,
  });
}

function setActiveView(viewId) {
  state.activeView = viewId;
  for (const section of els.viewSections) {
    section.classList.toggle('active', section.id === `view-${viewId}`);
  }
  for (const link of els.navLinks) {
    link.classList.toggle('active', link.dataset.view === viewId);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setInspectorLoading(word, context, entry, mode = 'word') {
  els.inspectWord.textContent = word;
  els.inspectPos.textContent = entry?.posList?.join(', ') || (mode === 'sentence' ? '句子' : '正在辨认词性…');
  els.inspectTranslation.textContent = entry?.meaningCn || '正在请求翻译…';
  els.inspectExplanation.textContent = '正在把语境慢慢展开…';
  els.inspectContext.textContent = context;
  els.inspectNote.textContent = entry?.notes || entry?.example || '–';
}

function positionPopoverFromRect(rect) {
  floating.classList.remove('hidden');
  const margin = 12;
  const popoverWidth = Math.min(360, window.innerWidth - margin * 2);
  floating.style.width = `${popoverWidth}px`;

  const measured = floating.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - popoverWidth / 2 + window.scrollX;
  left = Math.max(margin + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - popoverWidth - margin));

  let top = rect.bottom + margin + window.scrollY;
  const estimatedHeight = measured.height || 190;
  if (top + estimatedHeight > window.scrollY + window.innerHeight - margin) {
    top = Math.max(window.scrollY + margin, rect.top + window.scrollY - estimatedHeight - margin);
  }

  floating.style.left = `${left}px`;
  floating.style.top = `${top}px`;
}

function selectionRect() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width || rect.height) return rect;
  const rects = range.getClientRects();
  return rects[0] || null;
}

function closeReadingOverlays() {
  hidePopover();
  hideMobileTranslationSheet();
}

function closeOverlaysFromReaderBlankTap(event) {
  if (event.target.closest?.('.vocab-button') || event.target.closest?.('.translation-popover') || event.target.closest?.('.mobile-translation-sheet') || event.target.closest?.('.mobile-selection-action')) return;
  closeReadingOverlays();
}

function hidePopover() {
  floating.classList.add('hidden');
  hideSelectionAction();
  clearSwipeSelectionClasses();
  state.pendingSwipeSelection = null;
  els.selectionAction.onclick = null;
}

function showPopoverLoading({ text, mode, rect }) {
  popoverEls.mode.textContent = mode === 'sentence' ? '整句翻译' : '单词翻译';
  popoverEls.text.textContent = text;
  popoverEls.translation.textContent = '翻译中…';
  popoverEls.explanation.textContent = '正在调用你配置的模型接口。';
  positionPopoverFromRect(rect);
}

function updatePopover(payload, fallbackText) {
  popoverEls.translation.textContent = payload.translation || '暂无翻译';
  const status = payload.cached
    ? '已从本地缓存读取，避免重复请求模型。'
    : payload.source === 'model'
      ? `模型：${payload.config?.model || '已配置模型'} @ ${payload.config?.endpointHost || '已配置接口'}`
      : payload.config?.ready === false
        ? '未检测到完整模型配置，请检查 Cloudflare 的变量与机密配置'
        : payload.modelError
          ? `模型调用失败：${payload.modelError}`
          : '';
  popoverEls.explanation.textContent = [payload.explanation || '', status].filter(Boolean).join('\n');
  popoverEls.text.textContent = payload.text || payload.word || fallbackText;
  const rect = floating.getBoundingClientRect();
  positionPopoverFromRect({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height });
}

async function requestTranslation({ text, context, mode }) {
  const request = { articleId: state.activeArticleId, text, context, mode };
  const cached = getCachedTranslation(request);
  if (cached) return cached;

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, word: text, context, mode, articleId: request.articleId }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  cacheTranslationResult(request, payload);
  return payload;
}

function renderStats() {
  els.statArticles.textContent = state.appData.stats.articleCount;
  els.statVocab.textContent = state.appData.stats.vocabularyCount;
  els.statCoverage.textContent = `${Math.round(state.appData.stats.vocabularyCoverageRate * 100)}%`;
}

function renderModeCards() {
  els.modeStrip.innerHTML = '';
  for (const mode of state.appData.modes) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `mode-card ${els.modeFilter.value === mode.id ? 'active' : ''}`;
    card.innerHTML = `
      <p class="eyebrow">${mode.label}</p>
      <h3>${mode.articleCount} 篇文章</h3>
      <p>${mode.description}</p>
      <div class="card-meta">
        <span class="badge">${mode.targetRange}</span>
        <span class="badge">${mode.densityHint}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      els.modeFilter.value = mode.id;
      renderModeCards();
      renderArticleList();
      const first = visibleArticleCards()[0];
      if (first) renderArticle(first.id);
      setActiveView('library');
    });
    els.modeStrip.appendChild(card);
  }
}

function renderModeOptions() {
  const fragment = document.createDocumentFragment();
  for (const mode of state.appData.modes) {
    const option = document.createElement('option');
    option.value = mode.id;
    option.textContent = mode.label;
    fragment.appendChild(option);
  }
  els.modeFilter.appendChild(fragment);
}

function renderThemeOptions() {
  const fragment = document.createDocumentFragment();
  for (const theme of state.appData.themes) {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.label;
    fragment.appendChild(option);
  }
  els.themeFilter.appendChild(fragment);
}

function visibleArticleCards() {
  const activeTheme = els.themeFilter.value;
  const activeMode = els.modeFilter.value;
  return state.appData.articleCards.filter((card) => (activeTheme === 'all' || card.theme === activeTheme) && (activeMode === 'all' || card.mode === activeMode));
}

function renderArticleList() {
  els.articleList.innerHTML = '';
  const cards = visibleArticleCards();

  if (!cards.length) {
    els.articleList.innerHTML = '<p>当前筛选条件下还没有文章。</p>';
    return;
  }

  for (const card of cards) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `article-card ${card.id === state.activeArticleId ? 'active' : ''}`;
    button.innerHTML = `
      <div>
        <p class="eyebrow">${card.modeLabel} · ${card.themeLabel}</p>
        <h3>${card.title}</h3>
        <p>${card.summary}</p>
        <div class="card-meta">
          <span class="badge">${card.wordCount} 词</span>
          <span class="badge">${card.targetWordCount} 个目标词</span>
          <span class="badge">${Math.round(card.density * 100)}% 密度</span>
        </div>
      </div>`;
    button.addEventListener('click', () => renderArticle(card.id));
    els.articleList.appendChild(button);
  }
}

function markActiveWord(button) {
  if (state.activeWordButton) state.activeWordButton.classList.remove('active');
  state.activeWordButton = button;
  if (state.activeWordButton) state.activeWordButton.classList.add('active');
}

async function inspectWord(article, word, button) {
  markActiveWord(button);
  const text = cleanSelectedText(word);
  const entry = state.vocabByWord.get(normalizeWord(text));
  const context = sentenceForWord(article.content, text);
  setInspectorLoading(text, context, entry, 'word');
  hideSelectionAction();
  if (isTouchReading()) {
    showMobileTranslationSheet({ title: text, mode: 'word', original: text, translation: entry?.meaningCn || '加载中…', explanation: '正在把语境慢慢展开…', context });
  } else {
    showPopoverLoading({ text, mode: 'word', rect: button.getBoundingClientRect() });
  }

  try {
    const payload = await requestTranslation({ text, context, mode: 'word' });
    els.inspectWord.textContent = payload.word || payload.text || text;
    els.inspectPos.textContent = payload.pos || entry?.posList?.join(', ') || '未知';
    els.inspectTranslation.textContent = payload.translation || entry?.meaningCn || '暂无释义';
    els.inspectExplanation.textContent = payload.explanation || entry?.notes || '暂时没有更多解释。';
    els.inspectContext.textContent = context;
    els.inspectNote.textContent = payload.dictionary?.notes || entry?.notes || entry?.example || '–';
    if (isTouchReading()) {
      setMobileSheetFromPayload({ payload, text, context, mode: 'word', entry });
    } else {
      updatePopover(payload, text);
    }
  } catch (error) {
    els.inspectExplanation.textContent = `加载模型帮助失败：${error}`;
    if (isTouchReading()) {
      showMobileTranslationSheet({ title: text, mode: 'word', original: text, translation: '翻译加载失败', explanation: String(error), context });
    } else {
      popoverEls.translation.textContent = '翻译加载失败';
      popoverEls.explanation.textContent = String(error);
    }
  }
}

async function translateSelection({ forceSheet = false, overrideText = '', overrideRect = null } = {}) {
  const article = currentArticle();
  const selection = window.getSelection();
  if (!article) return;
  const selectedText = cleanSelectedText(overrideText || selection?.toString() || '');
  if (!selectedText) return;

  let rect = overrideRect;
  if (!rect) {
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!els.readerContent.contains(range.commonAncestorContainer)) return;
    rect = selectionRect();
  }
  if (!rect) return;

  const translationMode = countWords(selectedText) > 5 ? 'sentence' : 'word';
  const text = translationMode === 'sentence' ? sentenceForText(article.content, selectedText) : selectedText;
  const context = translationMode === 'sentence' ? text : sentenceForWord(article.content, text);
  const entry = translationMode === 'word' ? state.vocabByWord.get(normalizeWord(text)) : null;

  setInspectorLoading(text, context, entry, translationMode);
  hideSelectionAction();
  if (isTouchReading() || forceSheet) {
    showMobileTranslationSheet({ title: text, mode: translationMode, original: text, translation: entry?.meaningCn || '翻译中…', explanation: '正在调用你配置的模型接口。', context });
  } else {
    showPopoverLoading({ text, mode: translationMode, rect });
  }

  try {
    const payload = await requestTranslation({ text, context, mode: translationMode });
    els.inspectWord.textContent = payload.word || payload.text || text;
    els.inspectPos.textContent = payload.pos || entry?.posList?.join(', ') || translationMode;
    els.inspectTranslation.textContent = payload.translation || entry?.meaningCn || '暂无翻译';
    els.inspectExplanation.textContent = payload.explanation || entry?.notes || '';
    els.inspectContext.textContent = context;
    els.inspectNote.textContent = payload.dictionary?.notes || entry?.notes || entry?.example || '–';
    if (isTouchReading() || forceSheet) {
      setMobileSheetFromPayload({ payload, text, context, mode: translationMode, entry });
    } else {
      updatePopover(payload, text);
    }
  } catch (error) {
    els.inspectExplanation.textContent = `加载翻译失败：${error}`;
    if (isTouchReading() || forceSheet) {
      showMobileTranslationSheet({ title: text, mode: translationMode, original: text, translation: '翻译加载失败', explanation: String(error), context });
    } else {
      popoverEls.translation.textContent = '翻译加载失败';
      popoverEls.explanation.textContent = String(error);
    }
  }
}

function scheduleSelectionTranslation() {
  clearTimeout(state.selectionTimer);
  state.selectionTimer = setTimeout(translateSelection, 160);
}

function handlePointerSelectionEnd() {
  if (isTouchReading()) {
    handleTouchSelectionEnd();
    return;
  }
  scheduleSelectionTranslation();
}

function handleTouchSelectionEnd() {
  clearTimeout(state.selectionTimer);
  state.selectionTimer = setTimeout(() => {
    const article = currentArticle();
    const selection = window.getSelection();
    if (!article || !selection || selection.rangeCount === 0) return;
    const selectedText = cleanSelectedText(selection.toString());
    if (!selectedText) return;
    const range = selection.getRangeAt(0);
    if (!els.readerContent.contains(range.commonAncestorContainer)) return;
    const rect = selectionRect();
    if (rect && isTouchReading()) {
      showSelectionAction(rect);
    } else if (rect) {
      translateSelection();
    }
  }, 180);
}

function clearSwipeSelectionClasses() {
  els.readerContent.querySelectorAll('.vocab-button.swipe-selected').forEach((node) => node.classList.remove('swipe-selected'));
}

function clearPendingSwipeSelection() {
  state.pendingSwipeSelection = null;
  clearSwipeSelectionClasses();
  hideSelectionAction();
}

function resetSwipeSelection() {
  state.swipeSelect.active = false;
  state.swipeSelect.pointerId = null;
  state.swipeSelect.startNode = null;
  state.swipeSelect.lastNode = null;
  state.swipeSelect.startX = 0;
  state.swipeSelect.startY = 0;
  state.swipeSelect.hasDragged = false;
}

function wordNodeFromPoint(x, y) {
  return document.elementsFromPoint(x, y).find((node) => node.classList?.contains('vocab-button') && els.readerContent.contains(node)) || null;
}

function wordNodesInRange(startNode, endNode) {
  const words = Array.from(els.readerContent.querySelectorAll('.vocab-button'));
  const startIndex = Number(startNode?.dataset.wordIndex);
  const endIndex = Number(endNode?.dataset.wordIndex);
  if (!Number.isFinite(startIndex) || !Number.isFinite(endIndex)) return [];
  const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
  return words.filter((wordNode) => {
    const index = Number(wordNode.dataset.wordIndex);
    return index >= from && index <= to;
  });
}

function selectedTextFromWordRange(startNode, endNode) {
  return wordNodesInRange(startNode, endNode).map((wordNode) => wordNode.textContent).join(' ');
}

function updateSwipeSelectionHighlight() {
  clearSwipeSelectionClasses();
  if (!state.swipeSelect.startNode || !state.swipeSelect.lastNode) return;
  for (const wordNode of wordNodesInRange(state.swipeSelect.startNode, state.swipeSelect.lastNode)) {
    wordNode.classList.add('swipe-selected');
  }
}

function beginSwipeSelection(event) {
  if (!isTouchReading() || event.pointerType === 'mouse') return;
  clearPendingSwipeSelection();
  state.swipeSelect.active = true;
  state.swipeSelect.pointerId = event.pointerId;
  state.swipeSelect.startNode = event.currentTarget;
  state.swipeSelect.lastNode = event.currentTarget;
  state.swipeSelect.startX = event.clientX;
  state.swipeSelect.startY = event.clientY;
  state.swipeSelect.hasDragged = false;
}

function updateSwipeSelection(wordNode, event) {
  if (!state.swipeSelect.active || state.swipeSelect.pointerId !== event.pointerId || !wordNode) return;
  const dx = Math.abs(event.clientX - state.swipeSelect.startX);
  const dy = Math.abs(event.clientY - state.swipeSelect.startY);
  if (dx + dy > 12 || wordNode !== state.swipeSelect.startNode) {
    state.swipeSelect.hasDragged = true;
  }
  state.swipeSelect.lastNode = wordNode;
  if (state.swipeSelect.hasDragged) updateSwipeSelectionHighlight();
}

function updateSwipeSelectionFromPoint(event) {
  if (!state.swipeSelect.active || state.swipeSelect.pointerId !== event.pointerId) return;
  const wordNode = wordNodeFromPoint(event.clientX, event.clientY);
  updateSwipeSelection(wordNode, event);
}

function finishSwipeSelection(event) {
  if (!state.swipeSelect.active || state.swipeSelect.pointerId !== event.pointerId) return;
  const text = selectedTextFromWordRange(state.swipeSelect.startNode, state.swipeSelect.lastNode);
  const rect = state.swipeSelect.startNode && state.swipeSelect.lastNode
    ? state.swipeSelect.startNode.getBoundingClientRect()
    : null;
  const shouldTranslate = state.swipeSelect.hasDragged && countWords(text) > 1;
  resetSwipeSelection();
  if (!shouldTranslate) {
    clearPendingSwipeSelection();
    return;
  }
  state.pendingSwipeSelection = { text, rect };
  showSelectionAction(rect);
}

function translateSelectionFromAction() {
  if (state.pendingSwipeSelection) {
    const { text, rect } = state.pendingSwipeSelection;
    state.pendingSwipeSelection = null;
    clearSwipeSelectionClasses();
    return translateSelection({ forceSheet: true, overrideText: text, overrideRect: rect });
  }
  return translateSelection({ forceSheet: true });
}

function isIeltsTargetWord(article, word) {
  const normalized = normalizeWord(word);
  return article.targetWords.some((target) => normalizeWord(target) === normalized);
}

function tokenizeParagraphForTranslation(paragraph) {
  return paragraph.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*|[^A-Za-z]+/g) || [];
}

function inspectWordFromInlineTap(article, token, wordNode, event) {
  if (cleanSelectedText(window.getSelection()?.toString() || '')) return;
  inspectWord(article, token, wordNode, event);
}

function createWordButton(article, token) {
  const wordNode = document.createElement('span');
  const isTarget = isIeltsTargetWord(article, token);
  wordNode.className = isTarget ? 'vocab-button target-word' : 'vocab-button plain-word';
  wordNode.dataset.wordIndex = String(article._wordRenderIndex = (article._wordRenderIndex || 0) + 1);
  wordNode.textContent = token;
  wordNode.addEventListener('pointerdown', beginSwipeSelection);
  wordNode.addEventListener('pointerenter', (event) => updateSwipeSelection(wordNode, event));
  wordNode.addEventListener('click', (event) => inspectWordFromInlineTap(article, token, wordNode, event));
  return wordNode;
}

function decorateParagraph(article, paragraph) {
  const wrapper = document.createElement('p');

  for (const token of tokenizeParagraphForTranslation(paragraph)) {
    if (/^[A-Za-z]/.test(token)) {
      wrapper.appendChild(createWordButton(article, token));
    } else {
      wrapper.appendChild(document.createTextNode(token));
    }
  }

  return wrapper;
}

function resetReaderToEmpty() {
  state.activeArticleId = null;
  if (state.activeWordButton) state.activeWordButton.classList.remove('active');
  state.activeWordButton = null;
  hidePopover();
  els.readerArticle.classList.add('hidden');
  els.readerEmpty.classList.remove('hidden');
}

function ensureArticleVisibleOrFallback() {
  const visibleIds = new Set(visibleArticleCards().map((card) => card.id));
  if (visibleIds.has(state.activeArticleId)) return;
  resetReaderToEmpty();
}

function renderArticle(articleId) {
  const article = state.articleById.get(articleId);
  if (!article) return;
  state.activeArticleId = articleId;
  hidePopover();
  hideMobileTranslationSheet();
  renderArticleList();
  renderModeCards();

  els.readerEmpty.classList.add('hidden');
  els.readerArticle.classList.remove('hidden');
  els.readerTheme.textContent = `${article.modeLabel} · ${state.appData.themes.find((theme) => theme.id === article.theme)?.label || article.theme}`;
  els.readerTitle.textContent = article.title;
  els.readerSummary.textContent = article.readingGoal;
  els.readerMode.textContent = article.modeLabel;
  els.readerWordcount.textContent = `${article.wordCount} 词`;
  els.readerTargets.textContent = `${article.targetWords.length} 个目标词`;
  els.readerDensity.textContent = `${Math.round(article.density * 100)}% 密度`;
  els.readerContent.innerHTML = '';
  article._wordRenderIndex = 0;

  article.content.split(/\n\n+/).forEach((paragraph) => {
    els.readerContent.appendChild(decorateParagraph(article, paragraph));
  });

  saveRecentArticle(article);
  setActiveView('reader');
}

async function init() {
  const [appData, articles, vocabulary] = await Promise.all([
    fetch('/api/app-data').then((res) => res.json()),
    fetch('/api/articles').then((res) => res.json()),
    fetch('/api/vocabulary').then((res) => res.json()),
  ]);

  state.appData = appData;
  state.articles = articles;
  state.vocabulary = vocabulary;
  state.articleById = new Map(articles.map((article) => [article.id, article]));
  state.vocabByWord = new Map();
  for (const entry of vocabulary) {
    state.vocabByWord.set(entry.normalizedWord, entry);
    for (const alias of entry.aliases) state.vocabByWord.set(alias, entry);
  }
  hydrateRecentReading();
  hydrateTranslationCache();

  renderStats();
  renderModeOptions();
  renderThemeOptions();
  renderModeCards();
  renderArticleList();
  renderRecentReading();
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get('view');
  const safeView = ['home', 'library', 'reader'].includes(requestedView) ? requestedView : 'home';
  resetReaderToEmpty();
  setActiveView(safeView);
}

function handleFiltersChanged() {
  renderModeCards();
  renderArticleList();
  ensureArticleVisibleOrFallback();
}

els.navLinks.forEach((link) => {
  link.addEventListener('click', () => setActiveView(link.dataset.view));
});
els.jumpButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveView(button.dataset.viewJump));
});
els.continueReading?.addEventListener('click', () => {
  const last = state.recentReading[0];
  if (last?.articleId) renderArticle(last.articleId);
  else setActiveView('library');
});
els.modeFilter.addEventListener('change', handleFiltersChanged);
els.themeFilter.addEventListener('change', handleFiltersChanged);
popoverEls.close.addEventListener('click', hidePopover);
els.mobileSheetClose?.addEventListener('click', hideMobileTranslationSheet);
els.selectionAction?.addEventListener('click', translateSelectionFromAction);
els.readerContent.addEventListener('mouseup', handlePointerSelectionEnd);
els.readerContent.addEventListener('touchend', handleTouchSelectionEnd);
els.readerContent.addEventListener('pointerdown', closeOverlaysFromReaderBlankTap);
els.readerContent.addEventListener('pointermove', updateSwipeSelectionFromPoint);
els.readerContent.addEventListener('pointerup', finishSwipeSelection);
els.readerContent.addEventListener('pointercancel', finishSwipeSelection);
document.addEventListener('selectionchange', () => {
  if (isTouchReading()) return;
  const selection = window.getSelection();
  if (!selection || !cleanSelectedText(selection.toString())) return;
  scheduleSelectionTranslation();
});
document.addEventListener('mousedown', (event) => {
  if (!floating.contains(event.target) && !els.mobileSheet?.contains(event.target) && !els.selectionAction?.contains(event.target) && !els.readerContent.contains(event.target)) {
    closeReadingOverlays();
  }
});

document.addEventListener('pointerdown', (event) => {
  if (!floating.contains(event.target) && !els.mobileSheet?.contains(event.target) && !els.selectionAction?.contains(event.target) && !els.readerContent.contains(event.target)) {
    closeReadingOverlays();
  }
});

init().catch((error) => {
  els.articleList.innerHTML = `<p>加载应用数据失败：${error}</p>`;
});
