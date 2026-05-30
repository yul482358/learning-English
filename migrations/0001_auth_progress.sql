CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  label TEXT,
  max_uses INTEGER NOT NULL DEFAULT 10,
  used_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  used_at TEXT,
  last_used_by TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS article_progress (
  user_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reading',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_position TEXT,
  read_count INTEGER NOT NULL DEFAULT 0,
  first_opened_at TEXT NOT NULL,
  last_opened_at TEXT NOT NULL,
  completed_at TEXT,
  PRIMARY KEY (user_id, article_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS word_progress (
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'learning',
  familiarity INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  article_id TEXT,
  last_context TEXT,
  last_translation TEXT,
  first_lookup_at TEXT NOT NULL,
  last_lookup_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, word),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lookup_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  article_id TEXT,
  word TEXT NOT NULL,
  context TEXT,
  translation TEXT,
  mode TEXT NOT NULL DEFAULT 'word',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lookup_history_user_created ON lookup_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_progress_user_last_opened ON article_progress(user_id, last_opened_at DESC);
