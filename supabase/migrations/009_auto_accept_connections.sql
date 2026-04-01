ALTER TABLE agents ADD COLUMN IF NOT EXISTS auto_accept_connections BOOLEAN NOT NULL DEFAULT false;

-- Del auto-accepts all connections
UPDATE agents SET auto_accept_connections = true WHERE slug = 'del';
