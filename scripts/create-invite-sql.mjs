import process from 'node:process';

const inviteCode = process.argv[2];
const maxUses = Number(process.argv[3] || 10);

if (!inviteCode) {
  console.error('Usage: node scripts/create-invite-sql.mjs <invite-code> [max-uses]');
  process.exit(1);
}

function sqlString(value) {
  return String(value).replaceAll("'", "''");
}

const code = inviteCode.trim();
const label = process.argv[4] || code;

console.log(`INSERT INTO invite_codes (code, label, max_uses, used_count, status, created_at) VALUES ('${sqlString(code)}', '${sqlString(label)}', ${Number.isFinite(maxUses) && maxUses > 0 ? Math.floor(maxUses) : 10}, 0, 'active', datetime('now'));`);
