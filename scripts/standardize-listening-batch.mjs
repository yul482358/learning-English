#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const inputDir = path.resolve(getArg('--input', ''));
const outputDir = path.resolve(getArg('--output', './standardized_listening'));
const source = getArg('--source', 'BBC Learning English - 6 Minute English');
const accent = getArg('--accent', 'British');
const difficulty = getArg('--difficulty', 'B1-B2');

if (!inputDir || !fs.existsSync(inputDir)) {
  console.error('Usage: node scripts/standardize-listening-batch.mjs --input=/path/to/unpacked --output=/path/to/standardized');
  process.exit(1);
}

function walkDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const childDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(dir, entry.name));
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const hasAudio = files.some((name) => /\.(mp3|m4a|wav)$/i.test(name));
  const hasSubtitles = files.some((name) => /\.srt$/i.test(name));
  if (hasAudio && hasSubtitles) return [dir];
  return childDirs.flatMap(walkDirs);
}

function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function parseEpisodeName(dir) {
  const base = path.basename(dir);
  const match = base.match(/^(\d{8})-(.+)$/);
  if (!match) throw new Error(`Cannot parse episode directory name: ${base}`);
  const [, compactDate, rawTitle] = match;
  const [titlePart, titleZhPart = ''] = rawTitle.split('_');
  const date = `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`;
  return {
    compactDate,
    date,
    title: titlePart.trim(),
    titleZh: titleZhPart.trim(),
  };
}

function parseTimecode(value) {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
  if (!match) throw new Error(`Invalid SRT timecode: ${value}`);
  const [, hh, mm, ss, ms] = match;
  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms.padEnd(3, '0')) / 1000;
}

function parseSrt(content) {
  return String(content)
    .replace(/^\uFEFF/, '')
    .replace(/\r/g, '')
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      const timeLineIndex = lines.findIndex((line) => line.includes('-->'));
      if (timeLineIndex < 0) return null;
      const [startRaw, endRaw] = lines[timeLineIndex].split('-->').map((part) => part.trim().split(/\s+/)[0]);
      const text = lines.slice(timeLineIndex + 1).join(' ').replace(/\s+/g, ' ').trim();
      return { start: parseTimecode(startRaw), end: parseTimecode(endRaw), text };
    })
    .filter((item) => item && item.text && item.end > item.start);
}

function durationSeconds(audioPath) {
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    audioPath,
  ], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  const value = Number(result.stdout.trim());
  return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
}

function sqlString(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const episodeDirs = walkDirs(inputDir).sort();
const episodes = [];

for (const dir of episodeDirs) {
  const parsed = parseEpisodeName(dir);
  const id = `bbc-6min-${parsed.compactDate}-${slugify(parsed.title)}`;
  const outDir = path.join(outputDir, id);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(dir);
  const audio = files.find((name) => /\.(mp3|m4a|wav)$/i.test(name));
  const englishSrt = files.find((name) => /英语\.srt$/i.test(name)) || files.find((name) => /english\.srt$/i.test(name));
  const bilingualSrt = files.find((name) => /双语|bilingual/i.test(name) && /\.srt$/i.test(name));
  const pdf = files.find((name) => /\.pdf$/i.test(name));
  if (!audio || !englishSrt) throw new Error(`Missing required audio/English SRT in ${dir}`);

  fs.copyFileSync(path.join(dir, audio), path.join(outDir, 'audio.mp3'));
  fs.copyFileSync(path.join(dir, englishSrt), path.join(outDir, 'subtitles.en.srt'));
  if (bilingualSrt) fs.copyFileSync(path.join(dir, bilingualSrt), path.join(outDir, 'subtitles.bilingual.srt'));
  if (pdf) fs.copyFileSync(path.join(dir, pdf), path.join(outDir, 'notes.pdf'));

  const enSubtitles = parseSrt(fs.readFileSync(path.join(dir, englishSrt), 'utf8'));
  const bilingualSubtitles = bilingualSrt ? parseSrt(fs.readFileSync(path.join(dir, bilingualSrt), 'utf8')) : [];
  fs.writeFileSync(path.join(outDir, 'subtitles.en.json'), `${JSON.stringify(enSubtitles, null, 2)}\n`);
  if (bilingualSrt) fs.writeFileSync(path.join(outDir, 'subtitles.bilingual.json'), `${JSON.stringify(bilingualSubtitles, null, 2)}\n`);

  const duration = durationSeconds(path.join(outDir, 'audio.mp3')) ?? (enSubtitles.at(-1)?.end || 0);
  const r2Base = `listening/bbc-6-minute-english/${id}`;
  const episode = {
    id,
    source,
    title: parsed.title,
    titleZh: parsed.titleZh,
    publishedAt: parsed.date,
    accent,
    difficulty,
    topic: '',
    durationSeconds: duration,
    files: {
      audio: 'audio.mp3',
      subtitlesEn: 'subtitles.en.json',
      ...(bilingualSrt ? { subtitlesBilingual: 'subtitles.bilingual.json' } : {}),
      ...(pdf ? { pdf: 'notes.pdf' } : {}),
    },
    r2Keys: {
      audio: `${r2Base}/audio.mp3`,
      subtitlesEn: `${r2Base}/subtitles.en.json`,
      ...(bilingualSrt ? { subtitlesBilingual: `${r2Base}/subtitles.bilingual.json` } : {}),
    },
  };
  fs.writeFileSync(path.join(outDir, 'meta.json'), `${JSON.stringify(episode, null, 2)}\n`);
  episodes.push(episode);
}

fs.writeFileSync(path.join(outputDir, 'index.json'), `${JSON.stringify(episodes, null, 2)}\n`);
const sql = [
  `CREATE TABLE IF NOT EXISTS listening_episodes (\n  id TEXT PRIMARY KEY,\n  source TEXT NOT NULL,\n  title TEXT NOT NULL,\n  title_zh TEXT,\n  published_at TEXT,\n  accent TEXT,\n  difficulty TEXT,\n  topic TEXT,\n  duration_seconds REAL,\n  audio_r2_key TEXT NOT NULL,\n  subtitle_json_r2_key TEXT,\n  subtitle_bilingual_json_r2_key TEXT,\n  created_at TEXT DEFAULT CURRENT_TIMESTAMP\n);`,
  ...episodes.map((episode) => `INSERT OR REPLACE INTO listening_episodes (id, source, title, title_zh, published_at, accent, difficulty, duration_seconds, audio_r2_key, subtitle_json_r2_key, subtitle_bilingual_json_r2_key) VALUES (${sqlString(episode.id)}, ${sqlString(episode.source)}, ${sqlString(episode.title)}, ${sqlString(episode.titleZh)}, ${sqlString(episode.publishedAt)}, ${sqlString(episode.accent)}, ${sqlString(episode.difficulty)}, ${Number(episode.durationSeconds || 0)}, ${sqlString(episode.r2Keys.audio)}, ${sqlString(episode.r2Keys.subtitlesEn)}, ${sqlString(episode.r2Keys.subtitlesBilingual || '')});`),
  '',
].join('\n');
fs.writeFileSync(path.join(outputDir, 'import.sql'), sql);

console.log(JSON.stringify({ inputDir, outputDir, episodeCount: episodes.length, episodes: episodes.map(({ id, title, titleZh, durationSeconds }) => ({ id, title, titleZh, durationSeconds })) }, null, 2));
