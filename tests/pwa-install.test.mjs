import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../public/service-worker.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));

assert.equal(manifest.display, 'standalone', 'manifest should launch as a standalone app');
assert.equal(manifest.scope, '/', 'manifest should cover the whole app scope');
assert.ok(manifest.start_url.startsWith('/'), 'manifest start_url should be same-origin');
assert.ok(manifest.theme_color, 'manifest should define a theme color');
assert.ok(manifest.background_color, 'manifest should define a background color');
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'), 'manifest should include a 192 icon');
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'), 'manifest should include a 512 icon');
assert.ok(manifest.icons.some((icon) => icon.purpose?.includes('maskable')), 'manifest should include a maskable icon');

for (const needle of [
  'rel="manifest" href="/manifest.webmanifest"',
  'name="theme-color"',
  'name="mobile-web-app-capable" content="yes"',
  'name="apple-mobile-web-app-capable" content="yes"',
  'rel="apple-touch-icon"',
  'viewport-fit=cover',
]) {
  assert.ok(html.includes(needle), `missing PWA/iOS HTML marker: ${needle}`);
}

for (const needle of [
  "navigator.serviceWorker.register('/service-worker.js')",
  'function registerServiceWorker()',
  "params.get('view')",
]) {
  assert.ok(appJs.includes(needle), `missing PWA app marker: ${needle}`);
}

for (const needle of [
  'self.addEventListener(\'install\'',
  'self.addEventListener(\'activate\'',
  'self.addEventListener(\'fetch\'',
  'CACHE_NAME',
  '/api/app-data',
  '/api/articles',
  '/api/vocabulary',
]) {
  assert.ok(serviceWorker.includes(needle), `missing service worker marker: ${needle}`);
}

for (const iconPath of [
  '../public/icons/icon-192.svg',
  '../public/icons/icon-512.svg',
  '../public/icons/maskable-icon.svg',
  '../public/icons/apple-touch-icon.svg',
]) {
  assert.ok(fs.existsSync(new URL(iconPath, import.meta.url)), `missing icon file: ${iconPath}`);
}

console.log('pwa-install.test.mjs passed');
