const state = {
  appData: null,
  articles: [],
  vocabulary: [],
  articleById: new Map(),
  vocabByWord: new Map(),
  activeArticleId: null,
  activeWordButton: null,
};

const els = {
  statArticles: document.getElementById('stat-articles'),
  statVocab: document.getElementById('stat-vocab'),
  statCoverage: document.getElementById('stat-coverage'),
  themeFilter: document.getElementById('theme-filter'),
  articleList: document.getElementById('article-list'),
  readerEmpty: document.getElementById('reader-empty'),
  readerArticle: document.getElementById('reader-article'),
  readerTheme: document.getElementById('reader-theme'),
  readerTitle: document.getElementById('reader-title'),
  readerSummary: document.getElementById('reader-summary'),
  readerWordcount: document.getElementById('reader-wordcount'),
  readerTargets: document.getElementById('reader-targets'),
  readerContent: document.getElementById('reader-content'),
  inspectWord: document.getElementById('inspect-word'),
  inspectPos: document.getElementById('inspect-pos'),
  inspectTranslation: document.getElementById('inspect-translation'),
  inspectExplanation: document.getElementById('inspect-explanation'),
  inspectContext: document.getElementById('inspect-context'),
  inspectNote: document.getElementById('inspect-note'),
};

function normalizeWord(word) {
  return String(word || '').trim().toLowerCase();
}

function sentenceForWord(articleContent, word) {
  const sentences = articleContent.split(/(?<=[.!?])\s+/);
  const normalized = normalizeWord(word);
  return sentences.find((sentence) => normalizeWord(sentence).includes(normalized)) || 'Context unavailable.';
}

function setInspectorLoading(word, context, entry) {
  els.inspectWord.textContent = word;
  els.inspectPos.textContent = entry?.posList?.join(', ') || 'Loading part of speech…';
  els.inspectTranslation.textContent = entry?.meaningCn || 'Loading translation…';
  els.inspectExplanation.textContent = 'Requesting context-aware explanation…';
  els.inspectContext.textContent = context;
  els.inspectNote.textContent = entry?.notes || entry?.example || '–';
}

function renderStats() {
  els.statArticles.textContent = state.appData.stats.articleCount;
  els.statVocab.textContent = state.appData.stats.vocabularyCount;
  els.statCoverage.textContent = `${Math.round(state.appData.stats.avgCoverageRate * 100)}%`;
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

function renderArticleList() {
  const activeTheme = els.themeFilter.value;
  els.articleList.innerHTML = '';
  const cards = state.appData.articleCards.filter((card) => activeTheme === 'all' || card.theme === activeTheme);

  for (const card of cards) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `article-card ${card.id === state.activeArticleId ? 'active' : ''}`;
    button.innerHTML = `
      <div>
        <p class="eyebrow">${card.themeLabel}</p>
        <h3>${card.title}</h3>
        <p>${card.summary}</p>
        <div class="card-meta">
          <span class="badge">${card.wordCount} words</span>
          <span class="badge">${card.targetWordCount} targets</span>
          <span class="badge">${Math.round(card.coverageRate * 100)}% coverage</span>
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
  const entry = state.vocabByWord.get(normalizeWord(word));
  const context = sentenceForWord(article.content, word);
  setInspectorLoading(word, context, entry);

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ word, context, articleId: article.id }),
    });
    const payload = await response.json();
    els.inspectWord.textContent = payload.word || word;
    els.inspectPos.textContent = payload.pos || entry?.posList?.join(', ') || 'unknown';
    els.inspectTranslation.textContent = payload.translation || entry?.meaningCn || '暂无释义';
    els.inspectExplanation.textContent = payload.explanation || entry?.notes || 'No explanation returned.';
    els.inspectContext.textContent = context;
    els.inspectNote.textContent = payload.dictionary?.notes || entry?.notes || entry?.example || '–';
  } catch (error) {
    els.inspectExplanation.textContent = `Failed to load model help: ${error}`;
  }
}

function decorateParagraph(article, paragraph) {
  const wrapper = document.createElement('p');
  const targetWords = article.targetWords
    .slice()
    .sort((a, b) => b.length - a.length);

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

function renderArticle(articleId) {
  const article = state.articleById.get(articleId);
  if (!article) return;
  state.activeArticleId = articleId;
  renderArticleList();

  els.readerEmpty.classList.add('hidden');
  els.readerArticle.classList.remove('hidden');
  els.readerTheme.textContent = state.appData.themes.find((theme) => theme.id === article.theme)?.label || article.theme;
  els.readerTitle.textContent = article.title;
  els.readerSummary.textContent = article.readingGoal;
  els.readerWordcount.textContent = `${article.wordCount} words`;
  els.readerTargets.textContent = `${article.targetWords.length} target words`;
  els.readerContent.innerHTML = '';

  article.content.split(/\n\n+/).forEach((paragraph) => {
    els.readerContent.appendChild(decorateParagraph(article, paragraph));
  });
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
  renderThemeOptions();
  renderArticleList();
  renderArticle(appData.articleCards[0]?.id);
}

els.themeFilter.addEventListener('change', renderArticleList);
init().catch((error) => {
  els.articleList.innerHTML = `<p>Failed to load app data: ${error}</p>`;
});
