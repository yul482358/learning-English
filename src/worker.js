import articles from './generated/articles.json';
import vocabulary from './generated/vocabulary.json';
import appData from './generated/app-data.json';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {}),
    },
    status: init.status || 200,
  });
}

function badRequest(message, status = 400) {
  return json({ error: message }, { status });
}

function normalizeWord(input = '') {
  return String(input).trim().toLowerCase();
}

function findVocabularyEntry(word) {
  const normalized = normalizeWord(word);
  return vocabulary.find((entry) =>
    entry.normalizedWord === normalized || entry.aliases.includes(normalized),
  ) || null;
}

async function translateWord({ env, body }) {
  const rawText = body?.text ?? body?.word;
  const word = typeof rawText === 'string' ? rawText.trim() : '';
  const context = body?.context || '';
  const mode = body?.mode || (word.split(/\s+/).filter(Boolean).length > 5 ? 'sentence' : 'word');
  if (!word) return badRequest('Missing text');

  const entry = mode === 'word' ? findVocabularyEntry(word) : null;
  const fallback = {
    word,
    text: word,
    mode,
    translation: entry?.meaningCn || '暂无本地释义',
    explanation: entry?.notes || 'No model explanation available.',
    pos: entry?.posList?.[0] || (mode === 'sentence' ? 'sentence' : 'unknown'),
    source: entry ? 'local-fallback' : 'missing',
  };

  if (!env.OPENAI_API_KEY || !env.OPENAI_BASE_URL || !env.OPENAI_MODEL) {
    return json(fallback);
  }

  const systemPrompt = [
    'You are an IELTS reading translation assistant.',
    'Return concise JSON only with keys: translation, explanation, pos.',
    'If mode is sentence, translate the whole selected sentence/text into natural Chinese and set pos to sentence.',
    'For sentence mode, explanation should be a very brief Chinese note or an empty string.',
    'If mode is word, translate the selected English word or short phrase into concise Chinese, explain its meaning in this context, and set pos to a simple part of speech label.',
    'Do not add markdown.',
  ].join(' ');

  const userPrompt = {
    mode,
    text: word,
    context,
    dictionaryHint: entry
      ? {
          meaningCn: entry.meaningCn,
          posList: entry.posList,
          notes: entry.notes,
          example: entry.example,
        }
      : null,
  };

  try {
    const response = await fetch(`${env.OPENAI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPrompt) },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return json({ ...fallback, modelError: `HTTP ${response.status}` });
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) return json({ ...fallback, modelError: 'Empty model response' });

    const parsed = JSON.parse(content);
    return json({
      word,
      text: word,
      mode,
      translation: parsed.translation || fallback.translation,
      explanation: parsed.explanation || fallback.explanation,
      pos: parsed.pos || fallback.pos,
      source: 'model',
      dictionary: entry,
    });
  } catch (error) {
    return json({ ...fallback, modelError: String(error) });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/app-data') {
      return json(appData);
    }

    if (url.pathname === '/api/articles') {
      return json(articles);
    }

    if (url.pathname.startsWith('/api/articles/')) {
      const id = url.pathname.split('/').pop();
      const article = articles.find((item) => item.id === id);
      return article ? json(article) : badRequest('Article not found', 404);
    }

    if (url.pathname === '/api/vocabulary') {
      return json(vocabulary);
    }

    if (url.pathname === '/api/translate' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      return translateWord({ env, body });
    }

    return env.ASSETS.fetch(request);
  },
};
