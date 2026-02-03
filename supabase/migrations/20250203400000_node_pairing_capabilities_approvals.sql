-- =====================================================
-- Migration: Node pairing, capabilities, and approvals
-- Created: 2025-02-03T40:00:00Z
-- Tables: nodes (alter), node_capabilities, node_approvals, pairing_requests
-- Purpose: Last active on nodes; per-node capabilities; approval workflow; pairing codes/QR
-- =====================================================

-- Add last_active_at to nodes (paired devices)
ALTER TABLE nodes
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS nodes_last_active_at_idx ON nodes(last_active_at DESC NULLS LAST)
  WHERE last_active_at IS NOT NULL;

COMMENT ON COLUMN nodes.last_active_at IS 'Last heartbeat or activity from this node';

-- =====================================================
-- TABLE: node_capabilities
-- Purpose: Per-node capability definitions (voice_wake, talk_mode, remote_exec, browser_proxy, camera_capture) with status and config
-- =====================================================
CREATE TABLE IF NOT EXISTS node_capabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE NOT NULL,
  capability_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled', 'pending_approval')),
  description TEXT,
  configurations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT node_capabilities_node_key_unique UNIQUE (node_id, capability_key),
  CONSTRAINT node_capabilities_key_not_empty CHECK (length(trim(capability_key)) > 0)
);

CREATE INDEX IF NOT EXISTS node_capabilities_node_id_idx ON node_capabilities(node_id);
CREATE INDEX IF NOT EXISTS node_capabilities_status_idx ON node_capabilities(status);

DROP TRIGGER IF EXISTS update_node_capabilities_updated_at ON node_capabilities;
CREATE TRIGGER update_node_capabilities_updated_at
  BEFORE UPDATE ON node_capabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE node_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "node_capabilities_select_own"
  ON node_capabilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_capabilities.node_id AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "node_capabilities_insert_own"
  ON node_capabilities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_capabilities.node_id AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "node_capabilities_update_own"
  ON node_capabilities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_capabilities.node_id AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_capabilities.node_id AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "node_capabilities_delete_own"
  ON node_capabilities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_capabilities.node_id AND n.user_id = auth.uid()
    )
  );

COMMENT ON TABLE node_capabilities IS 'Per-node capabilities (voice_wake, talk_mode, remote_exec, etc.) with status and config';

-- =====================================================
-- TABLE: node_approvals
-- Purpose: Approval workflow for remote execution or capability changes (requester, node, capability, status)
-- =====================================================
CREATE TABLE IF NOT EXISTS node_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE NOT NULL,
  capability_id UUID REFERENCES node_capabilities(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT node_approvals_action_not_empty CHECK (length(trim(action_type)) > 0)
);

CREATE INDEX IF NOT EXISTS node_approvals_requester_id_idx ON node_approvals(requester_id);
CREATE INDEX IF NOT EXISTS node_approvals_node_id_idx ON node_approvals(node_id);
CREATE INDEX IF NOT EXISTS node_approvals_capability_id_idx ON node_approvals(capability_id) WHERE capability_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS node_approvals_status_idx ON node_approvals(status);
CREATE INDEX IF NOT EXISTS node_approvals_created_at_idx ON node_approvals(created_at DESC);

DROP TRIGGER IF EXISTS update_node_approvals_updated_at ON node_approvals;
CREATE TRIGGER update_node_approvals_updated_at
  BEFORE UPDATE ON node_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE node_approvals ENABLE ROW LEVEL SECURITY;

-- Requester can see own; node owner can see approvals for their nodes (for approve/deny)
CREATE POLICY "node_approvals_select_own_or_node_owner"
  ON node_approvals FOR SELECT
  USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_approvals.node_id AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "node_approvals_insert_own"
  ON node_approvals FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "node_approvals_update_own_or_node_owner"
  ON node_approvals FOR UPDATE
  USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM nodes n
      WHERE n.id = node_approvals.node_id AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (true);

CREATE POLICY "node_approvals_delete_own"
  ON node_approvals FOR DELETE
  USING (auth.uid() = requester_id);

COMMENT ON TABLE node_approvals IS 'Approval requests for remote execution or capability changes';

-- =====================================================
-- TABLE: pairing_requests
-- Purpose: Temporary pairing codes/QR for device pairing (code, expiry, optional node_id when claimed)
-- =====================================================
CREATE TABLE IF NOT EXISTS pairing_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pairing_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT pairing_requests_code_not_empty CHECK (length(trim(pairing_code)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS pairing_requests_code_unique ON pairing_requests(pairing_code)
  WHERE node_id IS NULL;

CREATE INDEX IF NOT EXISTS pairing_requests_user_id_idx ON pairing_requests(user_id);
CREATE INDEX IF NOT EXISTS pairing_requests_expires_at_idx ON pairing_requests(expires_at);

ALTER TABLE pairing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pairing_requests_select_own"
  ON pairing_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "pairing_requests_insert_own"
  ON pairing_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pairing_requests_update_own"
  ON pairing_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pairing_requests_delete_own"
  ON pairing_requests FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE pairing_requests IS 'Temporary pairing codes for QR/code device pairing flow';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS pairing_requests CASCADE;
-- DROP TABLE IF EXISTS node_approvals CASCADE;
-- DROP TABLE IF EXISTS node_capabilities CASCADE;
-- ALTER TABLE nodes DROP COLUMN IF EXISTS last_active_at;