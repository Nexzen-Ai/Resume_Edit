-- Run this in Supabase SQL editor
CREATE TABLE IF NOT EXISTS llm_cache (
    cache_key  TEXT PRIMARY KEY,
    result     JSONB        NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Optional: auto-expire cache entries older than 30 days
-- (requires pg_cron extension, enable in Supabase dashboard)
-- SELECT cron.schedule('purge-llm-cache', '0 3 * * *',
--   $$DELETE FROM llm_cache WHERE created_at < NOW() - INTERVAL '30 days'$$);
