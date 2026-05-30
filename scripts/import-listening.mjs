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

const sourceDir = path.resolve(getArg('--source', './standardized_listening_jan'));
const bucket = getArg('--bucket', 'ielts-listening-private');
const database = getArg('--database', 'DB');
const dryRun = args.includes('--dry-run');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

const indexPath = path.join(sourceDir, 'index.json');
const sqlPath = path.join(sourceDir, 'import.sql');
if (!fs.existsSync(indexPath) || !fs.existsSync(sqlPath)) {
  console.error('Source directory must contain index.json and import.sql');
  process.exit(1);
}

const episodes = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const uploads = [];
for (const episode of episodes) {
  const episodeDir = path.join(sourceDir, episode.id);
  for (const [kind, filename] of Object.entries(episode.files || {})) {
    if (!filename || kind === 'pdf') continue;
    const key = episode.r2Keys?.[kind];
    if (!key) continue;
    const filePath = path.join(episodeDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skip missing file: ${filePath}`);
      continue;
    }
    uploads.push({ filePath, key });
  }
}

console.log(`Listening import source: ${sourceDir}`);
console.log(`R2 bucket: ${bucket}`);
console.log(`D1 database binding/name: ${database}`);
console.log(`Files to upload: ${uploads.length}`);

for (const item of uploads) {
  const cmd = ['wrangler', 'r2', 'object', 'put', `${bucket}/${item.key}`, '--file', item.filePath];
  console.log(cmd.join(' '));
  if (!dryRun) {
    const result = spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

const d1Cmd = ['wrangler', 'd1', 'execute', database, '--file', sqlPath, '--remote'];
console.log(d1Cmd.join(' '));
if (!dryRun) {
  const result = spawnSync(d1Cmd[0], d1Cmd.slice(1), { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(dryRun ? 'Dry run complete.' : 'Listening materials imported.');
