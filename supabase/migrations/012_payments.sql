-- Agent wallet address for x402 payments
ALTER TABLE agents ADD COLUMN IF NOT EXISTS payment_address TEXT;

-- Payment log — tracks every paid relay call
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  target_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  network         TEXT NOT NULL,
  asset           TEXT NOT NULL,
  amount          TEXT NOT NULL,
  pay_to          TEXT NOT NULL,
  tx_hash         TEXT,
  status          TEXT NOT NULL DEFAULT 'challenged'
                    CHECK (status IN ('challenged', 'settled', 'failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at      TIMESTAMPTZ
);

CREATE INDEX idx_payments_caller ON payments (caller_agent_id, created_at DESC);
CREATE INDEX idx_payments_target ON payments (target_agent_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments (status) WHERE status = 'challenged';
