CREATE TABLE IF NOT EXISTS listening_episodes (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT,
  description TEXT,
  published_at TEXT,
  accent TEXT,
  difficulty TEXT,
  topic TEXT,
  duration_seconds REAL,
  audio_r2_key TEXT NOT NULL,
  subtitle_json_r2_key TEXT,
  subtitle_bilingual_json_r2_key TEXT,
  notes_r2_key TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listening_progress (
  user_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  position_seconds REAL NOT NULL DEFAULT 0,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'listening',
  play_count INTEGER NOT NULL DEFAULT 0,
  first_opened_at TEXT NOT NULL,
  last_opened_at TEXT NOT NULL,
  completed_at TEXT,
  PRIMARY KEY (user_id, episode_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES listening_episodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listening_episodes_published ON listening_episodes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_progress_user_last_opened ON listening_progress(user_id, last_opened_at DESC);
