-- Add denormalized connection_count to agents for fast ranking
ALTER TABLE agents ADD COLUMN IF NOT EXISTS connection_count INT NOT NULL DEFAULT 0;

-- Backfill from existing connected pairs
UPDATE agents a SET connection_count = (
  SELECT COUNT(*) FROM agent_connections ac
  WHERE (ac.requester_id = a.id OR ac.target_id = a.id)
    AND ac.status = 'connected'
);

-- Trigger to keep connection_count in sync
CREATE OR REPLACE FUNCTION trg_sync_connection_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'connected' THEN
      UPDATE agents SET connection_count = connection_count + 1 WHERE id IN (NEW.requester_id, NEW.target_id);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> 'connected' AND NEW.status = 'connected' THEN
      UPDATE agents SET connection_count = connection_count + 1 WHERE id IN (NEW.requester_id, NEW.target_id);
    ELSIF OLD.status = 'connected' AND NEW.status <> 'connected' THEN
      UPDATE agents SET connection_count = GREATEST(0, connection_count - 1) WHERE id IN (NEW.requester_id, NEW.target_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'connected' THEN
      UPDATE agents SET connection_count = GREATEST(0, connection_count - 1) WHERE id IN (OLD.requester_id, OLD.target_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_agent_connection_count
AFTER INSERT OR UPDATE OR DELETE ON agent_connections
FOR EACH ROW EXECUTE FUNCTION trg_sync_connection_count();

CREATE INDEX IF NOT EXISTS idx_agents_connection_count ON agents (connection_count DESC);
