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
  const word = body?.word;
  const context = body?.context || '';
  if (!word) return badRequest('Missing word');

  const entry = findVocabularyEntry(word);
  const fallback = {
    word,
    translation: entry?.meaningCn || '暂无本地释义',
    explanation: entry?.notes || 'No model explanation available.',
    pos: entry?.posList?.[0] || 'unknown',
    source: entry ? 'local-fallback' : 'missing',
  };

  if (!env.OPENAI_API_KEY || !env.OPENAI_BASE_URL || !env.OPENAI_MODEL) {
    return json(fallback);
  }

  const systemPrompt = [
    'You are an IELTS vocabulary assistant.',
    'Return concise JSON only with keys: translation, explanation, pos.',
    'translation should be concise Chinese.',
    'explanation should be a short English learner-friendly explanation.',
    'pos should be a simple part of speech label such as noun, verb, adjective, adverb, phrase.',
  ].join(' ');

  const userPrompt = {
    word,
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
