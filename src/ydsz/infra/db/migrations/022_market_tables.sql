-- Schema v22: unified marketplace tables — market_items, install registry, audit log, search cache.

CREATE TABLE IF NOT EXISTS market_items (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id             TEXT UNIQUE NOT NULL,
    item_type             TEXT NOT NULL
                          CHECK (item_type IN ('skill','expert','plugin','connector')),
    source                TEXT NOT NULL DEFAULT 'ILTIN'
                          CHECK (source IN ('ILTIN','skillhub','clawhub','github','community','local')),
    identity              TEXT NOT NULL,
    name                  TEXT NOT NULL,
    description           TEXT NOT NULL DEFAULT '',
    icon_url              TEXT,
    icon_name             TEXT,
    color                 TEXT,
    version               TEXT NOT NULL DEFAULT '',
    author                TEXT NOT NULL DEFAULT '',
    author_url            TEXT,
    category              TEXT NOT NULL DEFAULT '',
    tags_json             TEXT NOT NULL DEFAULT '[]',
    rating                REAL,
    downloads             INTEGER NOT NULL DEFAULT 0,
    installed             INTEGER NOT NULL DEFAULT 0,
    installed_version     TEXT,
    source_url            TEXT,
    license               TEXT,
    metadata_json         TEXT NOT NULL DEFAULT '{}',
    published_at          TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
    refreshed_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_market_items_type ON market_items(item_type);
CREATE INDEX IF NOT EXISTS idx_market_items_source ON market_items(source);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category);
CREATE INDEX IF NOT EXISTS idx_market_items_installed ON market_items(installed);
CREATE INDEX IF NOT EXISTS idx_market_items_updated ON market_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_market_items_published ON market_items(published_at);

CREATE TABLE IF NOT EXISTS market_install_registry (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id             TEXT NOT NULL,
    user_id               INTEGER NOT NULL,
    target_type           TEXT NOT NULL
                          CHECK (target_type IN ('agent','package','plugin_dir','connector_instance')),
    target_id             TEXT NOT NULL,
    installed_version     TEXT NOT NULL,
    installed_at          TEXT NOT NULL DEFAULT (datetime('now')),
    install_source        TEXT NOT NULL DEFAULT 'manual',
    rollback_snapshot     TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_market_install_registry_market_id ON market_install_registry(market_id);
CREATE INDEX IF NOT EXISTS idx_market_install_registry_user ON market_install_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_market_install_registry_target ON market_install_registry(target_type, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_market_install_unique
    ON market_install_registry(market_id, target_type, target_id);

CREATE TABLE IF NOT EXISTS market_install_log (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id             TEXT NOT NULL,
    target_type           TEXT NOT NULL,
    target_id             TEXT,
    user_id               INTEGER NOT NULL,
    action                TEXT NOT NULL
                          CHECK (action IN ('install','update','rollback','uninstall')),
    from_version          TEXT,
    to_version            TEXT,
    snapshot_id           TEXT,
    error_code            TEXT,
    error_message         TEXT,
    ip_address            TEXT,
    user_agent            TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_market_install_log_market_id ON market_install_log(market_id);
CREATE INDEX IF NOT EXISTS idx_market_install_log_user ON market_install_log(user_id);
CREATE INDEX IF NOT EXISTS idx_market_install_log_action ON market_install_log(action);
CREATE INDEX IF NOT EXISTS idx_market_install_log_created ON market_install_log(created_at);

CREATE TABLE IF NOT EXISTS market_search_cache (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key             TEXT UNIQUE NOT NULL,
    item_type             TEXT,
    query                 TEXT NOT NULL DEFAULT '',
    category              TEXT,
    sort                  TEXT NOT NULL DEFAULT 'relevance',
    locale                TEXT NOT NULL DEFAULT 'zh',
    results_json          TEXT NOT NULL,
    total                 INTEGER NOT NULL DEFAULT 0,
    per_type_json         TEXT,
    expires_at            TEXT NOT NULL,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_market_search_cache_expires ON market_search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_market_search_cache_key ON market_search_cache(cache_key);

UPDATE _schema_version SET version = 22;
