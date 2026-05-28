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

function getModelConfig(env) {
  const apiKey = env.OPENAI_API_KEY || env.API_KEY || env.LLM_API_KEY || env.MODEL_API_KEY;
  const baseUrl = env.OPENAI_BASE_URL || env.API_BASE_URL || env.BASE_URL || env.LLM_BASE_URL || env.MODEL_BASE_URL;
  const model = env.OPENAI_MODEL || env.MODEL || env.MODEL_NAME || env.LLM_MODEL;
  const endpoint = env.OPENAI_ENDPOINT || env.API_ENDPOINT || env.LLM_ENDPOINT;

  return {
    apiKey,
    baseUrl,
    model,
    endpoint: endpoint || (baseUrl ? `${baseUrl.replace(/\/$/, '')}/chat/completions` : ''),
    hasApiKey: Boolean(apiKey),
    hasBaseUrl: Boolean(baseUrl || endpoint),
    hasModel: Boolean(model),
  };
}

function modelConfigStatus(env) {
  const config = getModelConfig(env);
  return {
    ready: config.hasApiKey && config.hasBaseUrl && config.hasModel,
    hasApiKey: config.hasApiKey,
    hasBaseUrl: config.hasBaseUrl,
    hasModel: config.hasModel,
    endpointHost: config.endpoint ? new URL(config.endpoint).host : null,
    supportedVariableNames: {
      apiKey: ['OPENAI_API_KEY', 'API_KEY', 'LLM_API_KEY', 'MODEL_API_KEY'],
      baseUrl: ['OPENAI_BASE_URL', 'API_BASE_URL', 'BASE_URL', 'LLM_BASE_URL', 'MODEL_BASE_URL'],
      model: ['OPENAI_MODEL', 'MODEL', 'MODEL_NAME', 'LLM_MODEL'],
      endpoint: ['OPENAI_ENDPOINT', 'API_ENDPOINT', 'LLM_ENDPOINT'],
    },
  };
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

  const modelConfig = getModelConfig(env);
  if (!modelConfig.hasApiKey || !modelConfig.hasBaseUrl || !modelConfig.hasModel) {
    return json({
      ...fallback,
      config: {
        ready: false,
        hasApiKey: modelConfig.hasApiKey,
        hasBaseUrl: modelConfig.hasBaseUrl,
        hasModel: modelConfig.hasModel,
      },
    });
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
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: modelConfig.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPrompt) },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return json({
        ...fallback,
        source: 'model-error',
        modelError: `HTTP ${response.status}`,
        config: { ready: true, endpointHost: new URL(modelConfig.endpoint).host, model: modelConfig.model },
      });
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
      config: { ready: true, endpointHost: new URL(modelConfig.endpoint).host, model: modelConfig.model },
      dictionary: entry,
    });
  } catch (error) {
    return json({
      ...fallback,
      source: 'model-error',
      modelError: String(error),
      config: { ready: true, endpointHost: new URL(modelConfig.endpoint).host, model: modelConfig.model },
    });
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

    if (url.pathname === '/api/model-status') {
      return json(modelConfigStatus(env));
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
