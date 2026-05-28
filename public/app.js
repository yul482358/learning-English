const state = {
  appData: null,
  articles: [],
  vocabulary: [],
  articleById: new Map(),
  vocabByWord: new Map(),
  activeArticleId: null,
  activeWordButton: null,
  selectionTimer: null,
  activeView: 'home',
};

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
  els.inspectPos.textContent = entry?.posList?.join(', ') || (mode === 'sentence' ? '句子' : '正在加载词性…');
  els.inspectTranslation.textContent = entry?.meaningCn || '正在请求翻译…';
  els.inspectExplanation.textContent = '正在请求上下文解释…';
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

function hidePopover() {
  floating.classList.add('hidden');
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
  const status = payload.source === 'model'
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
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, word: text, context, mode, articleId: state.activeArticleId }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function renderStats() {
  els.statArticles.textContent = state.appData.stats.articleCount;
  els.statVocab.textContent = state.appData.stats.vocabularyCount;
  els.statCoverage.textContent = `${Math.round(state.appData.stats.avgCoverageRate * 100)}%`;
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
  showPopoverLoading({ text, mode: 'word', rect: button.getBoundingClientRect() });

  try {
    const payload = await requestTranslation({ text, context, mode: 'word' });
    els.inspectWord.textContent = payload.word || payload.text || text;
    els.inspectPos.textContent = payload.pos || entry?.posList?.join(', ') || 'unknown';
    els.inspectTranslation.textContent = payload.translation || entry?.meaningCn || '暂无释义';
    els.inspectExplanation.textContent = payload.explanation || entry?.notes || 'No explanation returned.';
    els.inspectContext.textContent = context;
    els.inspectNote.textContent = payload.dictionary?.notes || entry?.notes || entry?.example || '–';
    updatePopover(payload, text);
  } catch (error) {
    els.inspectExplanation.textContent = `加载模型帮助失败：${error}`;
    popoverEls.translation.textContent = '翻译加载失败';
    popoverEls.explanation.textContent = String(error);
  }
}

async function translateSelection() {
  const article = currentArticle();
  const selection = window.getSelection();
  if (!article || !selection || selection.rangeCount === 0) return;
  const selectedText = cleanSelectedText(selection.toString());
  if (!selectedText) return;

  const range = selection.getRangeAt(0);
  if (!els.readerContent.contains(range.commonAncestorContainer)) return;

  const rect = selectionRect();
  if (!rect) return;

  const mode = countWords(selectedText) > 5 ? 'sentence' : 'word';
  const text = mode === 'sentence' ? sentenceForText(article.content, selectedText) : selectedText;
  const context = mode === 'sentence' ? text : sentenceForWord(article.content, text);
  const entry = mode === 'word' ? state.vocabByWord.get(normalizeWord(text)) : null;

  setInspectorLoading(text, context, entry, mode);
  showPopoverLoading({ text, mode, rect });

  try {
    const payload = await requestTranslation({ text, context, mode });
    els.inspectWord.textContent = payload.word || payload.text || text;
    els.inspectPos.textContent = payload.pos || entry?.posList?.join(', ') || mode;
    els.inspectTranslation.textContent = payload.translation || entry?.meaningCn || '暂无翻译';
    els.inspectExplanation.textContent = payload.explanation || entry?.notes || '';
    els.inspectContext.textContent = context;
    els.inspectNote.textContent = payload.dictionary?.notes || entry?.notes || entry?.example || '–';
    updatePopover(payload, text);
  } catch (error) {
    els.inspectExplanation.textContent = `加载翻译失败：${error}`;
    popoverEls.translation.textContent = '翻译加载失败';
    popoverEls.explanation.textContent = String(error);
  }
}

function scheduleSelectionTranslation() {
  clearTimeout(state.selectionTimer);
  state.selectionTimer = setTimeout(translateSelection, 160);
}

function decorateParagraph(article, paragraph) {
  const wrapper = document.createElement('p');
  const targetWords = article.targetWords.slice().sort((a, b) => b.length - a.length);

  let index = 0;
  while (index < paragraph.length) {
    let match = null;
    for (const word of targetWords) {
      const regex = new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z-])`, 'i');
      const slice = paragraph.slice(index);
      const result = slice.match(regex);
      if (result) {
        match = { word: result[0], length: result[0].length };
        break;
      }
    }

    if (match) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vocab-button';
      button.textContent = match.word;
      button.addEventListener('click', () => inspectWord(article, match.word, button));
      wrapper.appendChild(button);
      index += match.length;
    } else {
      wrapper.appendChild(document.createTextNode(paragraph[index]));
      index += 1;
    }
  }

  return wrapper;
}

function ensureArticleVisibleOrFallback() {
  const visibleIds = new Set(visibleArticleCards().map((card) => card.id));
  if (visibleIds.has(state.activeArticleId)) return;
  const first = visibleArticleCards()[0];
  if (first) {
    renderArticle(first.id);
  } else {
    state.activeArticleId = null;
    els.readerArticle.classList.add('hidden');
    els.readerEmpty.classList.remove('hidden');
  }
}

function renderArticle(articleId) {
  const article = state.articleById.get(articleId);
  if (!article) return;
  state.activeArticleId = articleId;
  hidePopover();
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

  article.content.split(/\n\n+/).forEach((paragraph) => {
    els.readerContent.appendChild(decorateParagraph(article, paragraph));
  });

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

  renderStats();
  renderModeOptions();
  renderThemeOptions();
  renderModeCards();
  renderArticleList();
  renderArticle(appData.articleCards[0]?.id);
  setActiveView('home');
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
els.modeFilter.addEventListener('change', handleFiltersChanged);
els.themeFilter.addEventListener('change', handleFiltersChanged);
popoverEls.close.addEventListener('click', hidePopover);
els.readerContent.addEventListener('mouseup', scheduleSelectionTranslation);
els.readerContent.addEventListener('touchend', scheduleSelectionTranslation);
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || !cleanSelectedText(selection.toString())) return;
  scheduleSelectionTranslation();
});
document.addEventListener('mousedown', (event) => {
  if (!floating.contains(event.target) && !els.readerContent.contains(event.target)) {
    hidePopover();
  }
});

init().catch((error) => {
  els.articleList.innerHTML = `<p>加载应用数据失败：${error}</p>`;
});
