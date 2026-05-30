import process from 'node:process';
import { subtle, getRandomValues } from 'node:crypto';

const inviteCode = process.argv[2];
if (!inviteCode) {
  console.error('Usage: node scripts/hash-invite.mjs <invite-code>');
  process.exit(1);
}

const data = new TextEncoder().encode(inviteCode.trim());
const digest = await subtle.digest('SHA-256', data);
const codeHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

const idBytes = new Uint8Array(6);
getRandomValues(idBytes);
const label = `invite-${Array.from(idBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
const now = new Date().toISOString();

console.log(`-- Run this with wrangler d1 execute <database-name> --remote --command "..."`);
console.log(`INSERT INTO invite_codes (code_hash, label, max_uses, used_count, status, created_at) VALUES ('${codeHash}', '${label}', 1, 0, 'active', '${now}');`);
