# IELTS Reading Lab

A Cloudflare Workers web app that turns an IELTS vocabulary book into themed reading passages with clickable vocabulary support.

## Features

- 5 IELTS-style sample passages built from the provided vocabulary book
- Normalized vocabulary dataset generated from the uploaded `word.json`
- Click vocabulary in context to inspect dictionary meaning and request model-based explanation
- Cloudflare Worker API endpoints for articles, vocabulary, app metadata, and translation
- Warm neutral UI inspired by Claude's design language

## Project Structure

- `scripts/build-data.mjs` — normalizes vocabulary and generates app JSON assets
- `src/generated/` — generated JSON data used by the worker
- `src/worker.js` — Worker API and asset handler
- `public/` — frontend assets
- `wrangler.jsonc` — Worker config

## Local development

```bash
npm install
npm run build
npm run dev
```

## Environment variables for translation

Set these with Wrangler before deployment:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put OPENAI_BASE_URL
npx wrangler secret put OPENAI_MODEL
```

If these are not set, the app still works with local dictionary fallback.

## Available API routes

- `GET /api/app-data`
- `GET /api/articles`
- `GET /api/articles/:id`
- `GET /api/vocabulary`
- `POST /api/translate`

## Deployment

```bash
npm install
npm run build
npx wrangler deploy
```
