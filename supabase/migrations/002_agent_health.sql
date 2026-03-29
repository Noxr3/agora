-- Agent health check columns
-- Populated by /api/cron/health-check running every 5 minutes (Vercel cron)
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS health_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (health_status IN ('online', 'offline', 'unknown')),
  ADD COLUMN IF NOT EXISTS health_checked_at TIMESTAMPTZ;
