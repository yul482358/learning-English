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

Set these with Wrangler before deployment. The preferred names are:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put OPENAI_BASE_URL
npx wrangler secret put OPENAI_MODEL
```

The Worker also accepts these aliases if your Cloudflare dashboard already uses custom names:

- API key: `OPENAI_API_KEY`, `API_KEY`, `LLM_API_KEY`, `MODEL_API_KEY`
- Base URL: `OPENAI_BASE_URL`, `API_BASE_URL`, `BASE_URL`, `LLM_BASE_URL`, `MODEL_BASE_URL`
- Model: `OPENAI_MODEL`, `MODEL`, `MODEL_NAME`, `LLM_MODEL`
- Full endpoint override: `OPENAI_ENDPOINT`, `API_ENDPOINT`, `LLM_ENDPOINT`

For OpenAI-compatible APIs, `OPENAI_BASE_URL` should be the API root, for example `https://api.openai.com/v1`; the Worker calls `/chat/completions` automatically.

If these are not set, the app still works with local dictionary fallback.

## Available API routes

- `GET /api/app-data`
- `GET /api/articles`
- `GET /api/articles/:id`
- `GET /api/model-status`
- `GET /api/vocabulary`
- `POST /api/translate`

## Deployment

```bash
npm install
npm run build
npx wrangler deploy
```
