import articles from './generated/articles.json';
import vocabulary from './generated/vocabulary.json';
import appData from './generated/app-data.json';

const SESSION_COOKIE = 'ielts_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

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

function plainText(message, status = 500) {
  return new Response(message, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...corsHeaders },
  });
}

function objectHeaders(object, extra = {}) {
  const headers = new Headers(extra);
  if (!headers.has('content-type')) headers.set('content-type', object.httpMetadata?.contentType || 'application/octet-stream');
  if (object.httpEtag) headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'private, max-age=3600');
  return headers;
}

function nowIso() {
  return new Date().toISOString();
}

function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function normalizeWord(input = '') {
  return String(input).trim().toLowerCase();
}

function sanitizeDisplayName(input, email) {
  const cleaned = String(input || '').trim().slice(0, 40);
  return cleaned || email.split('@')[0] || '读者';
}

function safeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name || user.displayName || user.email,
    role: user.role || 'user',
    status: user.status || 'active',
  };
}

function timingSafeEqualString(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt = randomToken(16)) {
  const passwordHash = await sha256Hex(`${salt}:${password}`);
  return `sha256$${salt}$${passwordHash}`;
}

async function verifyPassword(password, storedHash) {
  const [, salt, expected] = String(storedHash || '').split('$');
  if (!salt || !expected) return false;
  const actual = await sha256Hex(`${salt}:${password}`);
  return timingSafeEqualString(actual, expected);
}

function parseCookies(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  return Object.fromEntries(cookieHeader.split(';').map((part) => {
    const [name, ...rest] = part.trim().split('=');
    return [name, rest.join('=')];
  }).filter(([name]) => name));
}

function setSessionCookie(token, expiresAt) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function createSession({ request, env, userId }) {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await env.DB.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, user_agent, ip, expires_at, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    userId,
    tokenHash,
    request.headers.get('User-Agent') || '',
    request.headers.get('CF-Connecting-IP') || '',
    expiresAt,
    createdAt,
    createdAt,
  ).run();
  return { token, expiresAt };
}

async function requireAuth(request, env) {
  if (!env.DB) return { error: badRequest('数据库尚未配置，请先绑定 Cloudflare D1。', 503) };
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return { error: badRequest('请先登录后再使用。', 401) };
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(`
    SELECT sessions.id AS session_id, sessions.expires_at, users.*
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first();

  if (!row || new Date(row.expires_at).getTime() <= Date.now() || row.status !== 'active') {
    if (row?.session_id) await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(row.session_id).run();
    return { error: badRequest('登录状态已失效，请重新登录。', 401) };
  }

  await env.DB.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').bind(nowIso(), row.session_id).run();
  return { user: safeUser(row), sessionId: row.session_id };
}

async function consumeInviteCode(env, inviteCode, userId) {
  const code = String(inviteCode || '').trim();
  if (!code) return { ok: false, error: '请输入邀请码。' };
  const invite = await env.DB.prepare('SELECT * FROM invite_codes WHERE code = ? LIMIT 1').bind(code).first();
  if (!invite || invite.status !== 'active') return { ok: false, error: '邀请码无效。' };
  if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) return { ok: false, error: '邀请码已过期。' };
  if (Number(invite.used_count || 0) >= Number(invite.max_uses || 10)) return { ok: false, error: '邀请码使用人数已满。' };

  await env.DB.prepare(`
    UPDATE invite_codes
    SET used_count = used_count + 1,
        status = CASE WHEN used_count + 1 >= max_uses THEN 'used' ELSE status END,
        used_at = ?,
        last_used_by = ?
    WHERE code = ?
  `).bind(nowIso(), userId, code).run();
  return { ok: true };
}

async function registerUser(request, env) {
  if (!env.DB) return badRequest('数据库尚未配置，请先绑定 Cloudflare D1。', 503);
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || '');
  if (!email || !email.includes('@')) return badRequest('请输入有效邮箱。');
  if (password.length < 8) return badRequest('密码至少需要 8 位。');

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? LIMIT 1').bind(email).first();
  if (existing) return badRequest('这个邮箱已经注册，请直接登录。', 409);

  const id = crypto.randomUUID();
  const invite = await consumeInviteCode(env, body?.inviteCode, id);
  if (!invite.ok) return badRequest(invite.error, 403);

  const createdAt = nowIso();
  const passwordHash = await hashPassword(password);
  const displayName = sanitizeDisplayName(body?.displayName, email);
  await env.DB.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'user', 'active', ?, ?)
  `).bind(id, email, displayName, passwordHash, createdAt, createdAt).run();

  const session = await createSession({ request, env, userId: id });
  return json({ user: { id, email, displayName, role: 'user', status: 'active' } }, {
    headers: { 'Set-Cookie': setSessionCookie(session.token, session.expiresAt) },
  });
}

async function loginUser(request, env) {
  if (!env.DB) return badRequest('数据库尚未配置，请先绑定 Cloudflare D1。', 503);
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || '');
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? LIMIT 1').bind(email).first();
  if (!user || user.status !== 'active' || !(await verifyPassword(password, user.password_hash))) {
    return badRequest('邮箱或密码不正确。', 401);
  }
  const session = await createSession({ request, env, userId: user.id });
  return json({ user: safeUser(user) }, {
    headers: { 'Set-Cookie': setSessionCookie(session.token, session.expiresAt) },
  });
}

async function logoutUser(request, env) {
  if (env.DB) {
    const token = parseCookies(request)[SESSION_COOKIE];
    if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  }
  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}

async function getProgress(env, userId) {
  const [articlesResult, wordsResult, lookupsResult] = await Promise.all([
    env.DB.prepare('SELECT * FROM article_progress WHERE user_id = ? ORDER BY last_opened_at DESC').bind(userId).all(),
    env.DB.prepare('SELECT * FROM word_progress WHERE user_id = ? ORDER BY last_lookup_at DESC LIMIT 500').bind(userId).all(),
    env.DB.prepare('SELECT * FROM lookup_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').bind(userId).all(),
  ]);
  return json({
    articleProgress: articlesResult.results || [],
    wordProgress: wordsResult.results || [],
    lookupHistory: lookupsResult.results || [],
  });
}

async function saveArticleProgress(request, env, userId) {
  const body = await request.json().catch(() => null);
  const articleId = String(body?.articleId || '').trim();
  if (!articleId) return badRequest('缺少文章 ID。');
  const timestamp = nowIso();
  const progressPercent = Math.max(0, Math.min(100, Number(body?.progressPercent || 0)));
  const status = ['reading', 'completed'].includes(body?.status) ? body.status : (progressPercent >= 95 ? 'completed' : 'reading');
  await env.DB.prepare(`
    INSERT INTO article_progress (user_id, article_id, status, progress_percent, last_position, read_count, first_opened_at, last_opened_at, completed_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(user_id, article_id) DO UPDATE SET
      status = excluded.status,
      progress_percent = MAX(article_progress.progress_percent, excluded.progress_percent),
      last_position = excluded.last_position,
      read_count = article_progress.read_count + 1,
      last_opened_at = excluded.last_opened_at,
      completed_at = COALESCE(article_progress.completed_at, excluded.completed_at)
  `).bind(
    userId,
    articleId,
    status,
    progressPercent,
    String(body?.lastPosition || '').slice(0, 200),
    timestamp,
    timestamp,
    status === 'completed' ? timestamp : null,
  ).run();
  return json({ ok: true });
}

async function saveWordProgress(request, env, userId) {
  const body = await request.json().catch(() => null);
  const word = normalizeWord(body?.word || body?.text);
  if (!word) return badRequest('缺少单词。');
  const timestamp = nowIso();
  const status = ['new', 'learning', 'familiar', 'mastered', 'ignored'].includes(body?.status) ? body.status : 'learning';
  const familiarity = Math.max(0, Math.min(5, Number(body?.familiarity || 0)));
  await env.DB.prepare(`
    INSERT INTO word_progress (user_id, word, status, familiarity, lookup_count, article_id, last_context, last_translation, first_lookup_at, last_lookup_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, word) DO UPDATE SET
      status = excluded.status,
      familiarity = MAX(word_progress.familiarity, excluded.familiarity),
      lookup_count = word_progress.lookup_count + 1,
      article_id = excluded.article_id,
      last_context = excluded.last_context,
      last_translation = excluded.last_translation,
      last_lookup_at = excluded.last_lookup_at,
      updated_at = excluded.updated_at
  `).bind(
    userId,
    word,
    status,
    familiarity,
    String(body?.articleId || '').slice(0, 120),
    String(body?.context || '').slice(0, 1000),
    String(body?.translation || '').slice(0, 1000),
    timestamp,
    timestamp,
    timestamp,
  ).run();
  return json({ ok: true });
}

async function saveLookupHistory(request, env, userId) {
  const body = await request.json().catch(() => null);
  const word = normalizeWord(body?.word || body?.text);
  if (!word) return badRequest('缺少查询内容。');
  await env.DB.prepare(`
    INSERT INTO lookup_history (id, user_id, article_id, word, context, translation, mode, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    String(body?.articleId || '').slice(0, 120),
    word,
    String(body?.context || '').slice(0, 1000),
    String(body?.translation || '').slice(0, 1000),
    body?.mode === 'sentence' ? 'sentence' : 'word',
    nowIso(),
  ).run();
  return json({ ok: true });
}

async function listListeningEpisodes(env, userId) {
  const result = await env.DB.prepare(`
    SELECT listening_episodes.*,
           listening_progress.position_seconds,
           listening_progress.progress_percent,
           listening_progress.status AS progress_status,
           listening_progress.last_opened_at
    FROM listening_episodes
    LEFT JOIN listening_progress
      ON listening_progress.episode_id = listening_episodes.id
     AND listening_progress.user_id = ?
    ORDER BY COALESCE(listening_episodes.published_at, listening_episodes.created_at) DESC
  `).bind(userId).all();
  return json({ episodes: result.results || [] });
}

async function getListeningEpisode(env, userId, episodeId) {
  const episode = await env.DB.prepare(`
    SELECT listening_episodes.*,
           listening_progress.position_seconds,
           listening_progress.progress_percent,
           listening_progress.status AS progress_status,
           listening_progress.last_opened_at
    FROM listening_episodes
    LEFT JOIN listening_progress
      ON listening_progress.episode_id = listening_episodes.id
     AND listening_progress.user_id = ?
    WHERE listening_episodes.id = ?
    LIMIT 1
  `).bind(userId, episodeId).first();
  if (!episode) return badRequest('没有找到这段听力。', 404);
  return json({ episode });
}

function parseRangeHeader(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return null;
  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : size - 1;
  if (!match[1] && match[2]) {
    const suffixLength = Number(match[2]);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

async function getListeningObject(env, episodeId, fieldName) {
  const episode = await env.DB.prepare('SELECT * FROM listening_episodes WHERE id = ? LIMIT 1').bind(episodeId).first();
  if (!episode) return { error: badRequest('没有找到这段听力。', 404) };
  const key = episode[fieldName];
  if (!key) return { error: badRequest('这段素材还没有配置对应文件。', 404) };
  if (!env.LISTENING_BUCKET) return { error: badRequest('听力素材 R2 存储桶尚未绑定。', 503) };
  return { episode, key };
}

function rangeForR2(range) {
  if (!range) return undefined;
  return {
    offset: range.start,
    length: range.end - range.start + 1,
  };
}

function audioResponseHeaders(object, extra = {}) {
  return objectHeaders(object, {
    'content-type': 'audio/mpeg',
    'Cache-Control': 'private, max-age=0, must-revalidate',
    ...extra,
  });
}

async function streamListeningAudio(request, env, episodeId) {
  const located = await getListeningObject(env, episodeId, 'audio_r2_key');
  if (located.error) return located.error;
  const head = await env.LISTENING_BUCKET.head(located.key);
  if (!head) return badRequest('没有找到音频文件。', 404);

  const range = parseRangeHeader(request.headers.get('Range'), Number(head.size));
  const object = await env.LISTENING_BUCKET.get(located.key, range ? { range: rangeForR2(range) } : undefined);
  if (!object) return badRequest('没有找到音频文件。', 404);

  if (range) {
    return new Response(object.body, {
      status: 206,
      headers: audioResponseHeaders(object, {
        'Content-Range': `bytes ${range.start}-${range.end}/${head.size}`,
        'Content-Length': String(range.end - range.start + 1),
        'Accept-Ranges': 'bytes',
      }),
    });
  }

  return new Response(object.body, {
    headers: audioResponseHeaders(object, {
      'Content-Length': String(head.size),
      'Accept-Ranges': 'bytes',
    }),
  });
}

async function getListeningSubtitles(env, episodeId, bilingual = false) {
  const fieldName = bilingual ? 'subtitle_bilingual_json_r2_key' : 'subtitle_json_r2_key';
  const located = await getListeningObject(env, episodeId, fieldName);
  if (located.error) return located.error;
  const object = await env.LISTENING_BUCKET.get(located.key);
  if (!object) return badRequest('没有找到字幕文件。', 404);
  return new Response(object.body, {
    headers: objectHeaders(object, { 'content-type': 'application/json; charset=utf-8' }),
  });
}

async function saveListeningProgress(request, env, userId) {
  const body = await request.json().catch(() => null);
  const episodeId = String(body?.episodeId || '').trim();
  if (!episodeId) return badRequest('缺少听力素材 ID。');
  const episode = await env.DB.prepare('SELECT duration_seconds FROM listening_episodes WHERE id = ? LIMIT 1').bind(episodeId).first();
  if (!episode) return badRequest('没有找到这段听力。', 404);
  const timestamp = nowIso();
  const duration = Math.max(0, Number(episode.duration_seconds || body?.durationSeconds || 0));
  const position = Math.max(0, Number(body?.positionSeconds || 0));
  const progressPercent = duration ? Math.max(0, Math.min(100, Math.round((position / duration) * 100))) : Math.max(0, Math.min(100, Number(body?.progressPercent || 0)));
  const status = progressPercent >= 95 ? 'completed' : 'listening';
  await env.DB.prepare(`
    INSERT INTO listening_progress (user_id, episode_id, position_seconds, progress_percent, status, play_count, first_opened_at, last_opened_at, completed_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(user_id, episode_id) DO UPDATE SET
      position_seconds = excluded.position_seconds,
      progress_percent = MAX(listening_progress.progress_percent, excluded.progress_percent),
      status = excluded.status,
      play_count = listening_progress.play_count + 1,
      last_opened_at = excluded.last_opened_at,
      completed_at = COALESCE(listening_progress.completed_at, excluded.completed_at)
  `).bind(
    userId,
    episodeId,
    position,
    progressPercent,
    status,
    timestamp,
    timestamp,
    status === 'completed' ? timestamp : null,
  ).run();
  return json({ ok: true, progressPercent, status });
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

    if (url.pathname === '/api/register' && request.method === 'POST') return registerUser(request, env);
    if (url.pathname === '/api/login' && request.method === 'POST') return loginUser(request, env);
    if (url.pathname === '/api/logout' && request.method === 'POST') return logoutUser(request, env);
    if (url.pathname === '/api/me') {
      const auth = await requireAuth(request, env);
      if (auth.error) return auth.error;
      return json({ user: auth.user });
    }

    if (url.pathname.startsWith('/api/')) {
      const auth = await requireAuth(request, env);
      if (auth.error) return auth.error;

      if (url.pathname === '/api/app-data') return json(appData);
      if (url.pathname === '/api/model-status') return json(modelConfigStatus(env));
      if (url.pathname === '/api/articles') return json(articles);
      if (url.pathname.startsWith('/api/articles/')) {
        const id = url.pathname.split('/').pop();
        const article = articles.find((item) => item.id === id);
        return article ? json(article) : badRequest('Article not found', 404);
      }
      if (url.pathname === '/api/vocabulary') return json(vocabulary);
      if (url.pathname === '/api/listening/episodes') return listListeningEpisodes(env, auth.user.id);
      if (url.pathname.startsWith('/api/listening/episodes/')) {
        const parts = url.pathname.split('/').filter(Boolean);
        const episodeId = parts[3];
        const action = parts[4];
        if (!episodeId) return badRequest('缺少听力素材 ID。');
        if (!action) return getListeningEpisode(env, auth.user.id, episodeId);
        if (action === 'audio') return streamListeningAudio(request, env, episodeId);
        if (action === 'subtitles') return getListeningSubtitles(env, episodeId, url.searchParams.get('kind') === 'bilingual');
      }
      if (url.pathname === '/api/progress') return getProgress(env, auth.user.id);
      if (url.pathname === '/api/progress/article' && request.method === 'POST') return saveArticleProgress(request, env, auth.user.id);
      if (url.pathname === '/api/progress/listening' && request.method === 'POST') return saveListeningProgress(request, env, auth.user.id);
      if (url.pathname === '/api/progress/word' && request.method === 'POST') return saveWordProgress(request, env, auth.user.id);
      if (url.pathname === '/api/lookup-history' && request.method === 'POST') return saveLookupHistory(request, env, auth.user.id);
      if (url.pathname === '/api/translate' && request.method === 'POST') {
        const body = await request.json().catch(() => null);
        const translated = await translateWord({ env, body });
        return translated;
      }

      return badRequest('API not found', 404);
    }

    return env.ASSETS.fetch(request);
  },
};
