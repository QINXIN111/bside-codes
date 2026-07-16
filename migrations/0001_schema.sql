PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  normalized_code TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '流行 · 其他',
  status TEXT NOT NULL DEFAULT 'ok'
    CHECK (status IN ('ok', 'bad', 'unk')),
  source TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  added_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_codes_normalized_code
  ON codes(normalized_code);
CREATE INDEX IF NOT EXISTS idx_codes_added_at
  ON codes(added_at);

CREATE TABLE IF NOT EXISTS discussion_posts (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL DEFAULT '匿名玩家',
  text TEXT NOT NULL,
  added_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES discussion_posts(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discussion_parent
  ON discussion_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussion_added_at
  ON discussion_posts(added_at);

CREATE TABLE IF NOT EXISTS votes (
  code TEXT PRIMARY KEY,
  up_count INTEGER NOT NULL DEFAULT 0 CHECK (up_count >= 0),
  down_count INTEGER NOT NULL DEFAULT 0 CHECK (down_count >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
