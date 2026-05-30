import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../migrations/0002_listening.sql', import.meta.url), 'utf8');

for (const marker of [
  'CREATE TABLE IF NOT EXISTS listening_episodes',
  'CREATE TABLE IF NOT EXISTS listening_progress',
  'audio_r2_key TEXT NOT NULL',
  'subtitle_json_r2_key TEXT',
  'PRIMARY KEY (user_id, episode_id)',
]) {
  assert.ok(migration.includes(marker), `missing listening migration marker: ${marker}`);
}

for (const marker of [
  'async function listListeningEpisodes',
  'async function getListeningEpisode',
  'async function streamListeningAudio',
  'async function getListeningSubtitles',
  'async function saveListeningProgress',
  "url.pathname === '/api/listening/episodes'",
  "url.pathname.startsWith('/api/listening/episodes/')",
  "url.pathname === '/api/progress/listening'",
  "request.headers.get('Range')",
  "status: 206",
  "Accept-Ranges",
  'LISTENING_BUCKET',
]) {
  assert.ok(worker.includes(marker), `missing worker listening marker: ${marker}`);
}

const protectedApiIndex = worker.indexOf('const auth = await requireAuth(request, env);');
const listeningIndex = worker.indexOf("url.pathname === '/api/listening/episodes'");
assert.ok(listeningIndex > protectedApiIndex, 'listening APIs must be behind requireAuth');

for (const marker of [
  'data-view="listening"',
  'id="view-listening"',
  'id="listening-list"',
  'id="listening-player"',
  'id="subtitle-list"',
  '回到当前句',
]) {
  assert.ok(html.includes(marker), `missing listening HTML marker: ${marker}`);
}

for (const marker of [
  'listeningEpisodes: []',
  'currentEpisodeId: null',
  'autoFollowSubtitles: true',
  'async function loadListeningEpisodes',
  'function renderListeningList',
  'async function openListeningEpisode',
  'function renderSubtitleList',
  'function syncSubtitleToAudio',
  'function jumpToSubtitle',
  'function saveListeningProgress',
  "safeView = ['home', 'library', 'reader', 'listening']",
]) {
  assert.ok(app.includes(marker), `missing listening app marker: ${marker}`);
}

for (const marker of [
  '.listening-layout',
  '.episode-card',
  '.listening-player-card',
  '.subtitle-line.active',
  '.subtitle-controls',
]) {
  assert.ok(styles.includes(marker), `missing listening style marker: ${marker}`);
}

console.log('listening module structure checks passed');
