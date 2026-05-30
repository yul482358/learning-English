import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
const wrangler = fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../migrations/0001_auth_progress.sql', import.meta.url), 'utf8');
const createInviteSql = fs.readFileSync(new URL('../scripts/create-invite-sql.mjs', import.meta.url), 'utf8');

for (const marker of [
  'CREATE TABLE IF NOT EXISTS users',
  'CREATE TABLE IF NOT EXISTS invite_codes',
  'code TEXT PRIMARY KEY',
  'max_uses INTEGER NOT NULL DEFAULT 10',
  'CREATE TABLE IF NOT EXISTS sessions',
  'CREATE TABLE IF NOT EXISTS article_progress',
  'CREATE TABLE IF NOT EXISTS word_progress',
  'CREATE TABLE IF NOT EXISTS lookup_history',
]) {
  assert.ok(migration.includes(marker), `missing migration marker: ${marker}`);
}

for (const marker of [
  'async function requireAuth',
  "url.pathname === '/api/register'",
  "url.pathname === '/api/login'",
  "url.pathname === '/api/logout'",
  "url.pathname === '/api/me'",
  "url.pathname === '/api/progress'",
  "url.pathname === '/api/progress/article'",
  "url.pathname === '/api/progress/word'",
  "url.pathname === '/api/lookup-history'",
  'consumeInviteCode',
  "SELECT * FROM invite_codes WHERE code = ? LIMIT 1",
  "WHERE code = ?",
  '邀请码使用人数已满',
  'setSessionCookie',
  'hashPassword',
]) {
  assert.ok(worker.includes(marker), `missing worker auth/progress marker: ${marker}`);
}

const publicApiIndex = worker.indexOf("url.pathname === '/api/register'");
const protectedApiIndex = worker.indexOf("const auth = await requireAuth(request, env);");
const translateIndex = worker.indexOf("url.pathname === '/api/translate'");
assert.ok(publicApiIndex > -1 && protectedApiIndex > publicApiIndex, 'public auth endpoints should be declared before requireAuth');
assert.ok(translateIndex > protectedApiIndex, 'translation API must be behind requireAuth');

for (const marker of [
  'id="auth-gate"',
  'id="login-form"',
  'id="register-form"',
  'name="inviteCode"',
  'id="current-user-name"',
  'id="logout-button"',
]) {
  assert.ok(html.includes(marker), `missing auth UI marker: ${marker}`);
}

for (const marker of [
  'async function bootstrapAuth',
  'async function loginUser',
  'async function registerUser',
  'async function logoutUser',
  'async function apiFetch',
  'async function loadCloudProgress',
  'async function saveArticleProgress',
  'async function saveWordProgress',
  'bootstrapAuth().then',
]) {
  assert.ok(app.includes(marker), `missing app auth/progress marker: ${marker}`);
}

for (const marker of [
  '.auth-gate',
  '.auth-card',
  '.auth-form',
  '.user-chip',
  '.page-shell.locked',
]) {
  assert.ok(styles.includes(marker), `missing auth style marker: ${marker}`);
}

assert.ok(!wrangler.includes('REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID'), 'wrangler should not contain a placeholder D1 database id');
assert.ok(!wrangler.includes('"d1_databases"'), 'D1 is bound in Cloudflare Dashboard for this deployment path');
assert.ok(createInviteSql.includes('INSERT INTO invite_codes (code, label, max_uses'), 'invite helper should emit plaintext invite insert SQL');
assert.ok(!worker.includes('code_hash'), 'worker should not require hashed invite codes');
assert.ok(!migration.includes('code_hash'), 'migration should not require hashed invite codes');

console.log('auth and progress structure checks passed');
