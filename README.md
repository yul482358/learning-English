# 雅思阅读实验室

面向中文母语者的雅思阅读与词汇训练网站。项目把雅思词汇整理成主题化阅读材料，让学习者在安静、中文优先的阅读空间里练习词汇、句子理解与长文耐心。

## 当前内容规模

- 收录词汇：3673 个
- 阅读篇章：229 篇
- 词汇覆盖：100%
- 学习模式：高频刷词、平衡精读、长文阅读
- 主题体系：环境与气候、地理与地球、教育与学习、科学与技术、健康与生物、社会与治理、经济与商业、文化与媒介、食物与农业、日常生活、通识学术

## 产品特性

- 中文优先 UI，适合中文母语雅思学习者
- 三种阅读路径：
  - **高频刷词**：高密度目标词，适合快速覆盖主题词群
  - **平衡精读**：中等密度，兼顾词汇记忆与篇章理解
  - **长文阅读**：低密度自然语境，训练阅读耐心与语感
- 点击高亮词显示浮动翻译，并同步更新右侧“词语侧记”
- 支持选中句子或短语进行整句翻译
- 最近阅读记录与“继续上次阅读”入口
- 翻译结果本地缓存，减少重复模型请求
- PWA 支持，可安装到移动设备或桌面
- Cloudflare Worker API 提供文章、词汇、元数据与翻译接口

## Project Structure

- `scripts/build-data.mjs` — 规范化词汇、生成文章数据和应用元数据
- `src/generated/` — 构建生成的 JSON 数据
- `src/worker.js` — Cloudflare Worker API 与静态资源入口
- `public/` — 前端页面、样式、PWA manifest 和 service worker
- `tests/` — 数据、导航、PWA 与学习体验回归测试
- `wrangler.jsonc` — Cloudflare Worker 配置

## Local development

```bash
npm install
npm run build
npm run dev
```

> 当前 Wrangler 版本要求 Node.js 22+。如果本地 `npm run dev` 提示 Node 版本过低，请先切换到 Node.js 22 或更新运行环境。

## Verification

常用验证命令：

```bash
npm run check
node tests/article-modes.test.mjs
node tests/ui-navigation.test.mjs
node tests/filter-no-autoread.test.mjs
node tests/pwa-install.test.mjs
node tests/learning-experience.test.mjs
```

## Environment variables for translation

Set these in Cloudflare Workers **Production / Preview environment variables** or with Wrangler. Recommended:

```bash
npx wrangler secret put OPENAI_API_KEY
```

Then add these as plain text variables in the deployed Worker environment:

```text
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=your-model-name
```

Important:

- `OPENAI_API_KEY` should be a **Secret**.
- `OPENAI_BASE_URL` and `OPENAI_MODEL` should usually be **plain text variables**, not secrets.
- If Cloudflare auto-created a new Worker/Version from Git deploy and the text variables disappeared, re-add them under the deployed Worker project's **Settings → Variables and Secrets**, separately for Production/Preview if needed.
- This repository does **not** define `OPENAI_BASE_URL` or `OPENAI_MODEL` inside `wrangler.jsonc`, so the code itself is not overwriting them.

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
