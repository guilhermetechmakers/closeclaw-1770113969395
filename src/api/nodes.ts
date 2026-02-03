import { supabase } from '@/lib/supabase';
import type {
  Node,
  NodeInsert,
  NodeUpdate,
  NodeCapability,
  NodeCapabilityInsert,
  NodeCapabilityUpdate,
  NodeApproval,
  NodeApprovalInsert,
  NodeApprovalUpdate,
  PairingRequest,
  PairingRequestInsert,
} from '@/types/database';

const PAIRING_CODE_TTL_MINUTES = 10;
const CAPABILITY_KEYS = [
  'voice_wake',
  'talk_mode',
  'remote_exec',
  'browser_proxy',
  'camera_capture',
] as const;

function getCapabilityDescription(key: string): string {
  const map: Record<string, string> = {
    voice_wake: 'Wake word detection',
    talk_mode: 'Voice conversation mode',
    remote_exec: 'Remote command execution',
    browser_proxy: 'Browser/CDP proxy',
    camera_capture: 'Camera and screen capture',
  };
  return map[key] ?? key;
}

export const nodesApi = {
  // Nodes
  getNodes: async (): Promise<Node[]> => {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .order('last_active_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Node[];
  },

  getNode: async (id: string): Promise<Node | null> => {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as Node;
  },

  createNode: async (payload: Omit<NodeInsert, 'user_id'>): Promise<Node> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: NodeInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('nodes')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Node;
  },

  updateNode: async (id: string, payload: NodeUpdate): Promise<Node> => {
    const { data, error } = await supabase
      .from('nodes')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Node;
  },

  deleteNode: async (id: string): Promise<void> => {
    const { error } = await supabase.from('nodes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Node capabilities
  getNodeCapabilities: async (nodeId: string): Promise<NodeCapability[]> => {
    const { data, error } = await supabase
      .from('node_capabilities')
      .select('*')
      .eq('node_id', nodeId)
      .order('capability_key');
    if (error) throw new Error(error.message);
    return (data ?? []) as NodeCapability[];
  },

  getNodeCapability: async (
    nodeId: string,
    capabilityKey: string
  ): Promise<NodeCapability | null> => {
    const { data, error } = await supabase
      .from('node_capabilities')
      .select('*')
      .eq('node_id', nodeId)
      .eq('capability_key', capabilityKey)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as NodeCapability;
  },

  upsertNodeCapability: async (
    payload: NodeCapabilityInsert
  ): Promise<NodeCapability> => {
    const { data, error } = await supabase
      .from('node_capabilities')
      .upsert(
        {
          node_id: payload.node_id,
          capability_key: payload.capability_key,
          status: payload.status ?? 'enabled',
          description: payload.description ?? null,
          configurations: payload.configurations ?? {},
        } as never,
        { onConflict: 'node_id,capability_key' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as NodeCapability;
  },

  updateNodeCapability: async (
    id: string,
    payload: NodeCapabilityUpdate
  ): Promise<NodeCapability> => {
    const { data, error } = await supabase
      .from('node_capabilities')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as NodeCapability;
  },

  // Node approvals
  getNodeApprovals: async (params?: {
    nodeId?: string;
    status?: 'pending' | 'approved' | 'denied';
    limit?: number;
  }): Promise<NodeApproval[]> => {
    let query = supabase
      .from('node_approvals')
      .select('*')
      .order('created_at', { ascending: false });
    if (params?.nodeId) query = query.eq('node_id', params.nodeId);
    if (params?.status) query = query.eq('status', params.status);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as NodeApproval[];
  },

  createNodeApproval: async (
    payload: Omit<NodeApprovalInsert, 'requester_id'>
  ): Promise<NodeApproval> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: NodeApprovalInsert = { ...payload, requester_id: user.id };
    const { data, error } = await supabase
      .from('node_approvals')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as NodeApproval;
  },

  updateNodeApproval: async (
    id: string,
    payload: NodeApprovalUpdate
  ): Promise<NodeApproval> => {
    const { data, error } = await supabase
      .from('node_approvals')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as NodeApproval;
  },

  // Pairing
  startPairing: async (): Promise<PairingRequest> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const pairingCode = generatePairingCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PAIRING_CODE_TTL_MINUTES);
    const row: PairingRequestInsert = {
      user_id: user.id,
      pairing_code: pairingCode,
      expires_at: expiresAt.toISOString(),
    };
    const { data, error } = await supabase
      .from('pairing_requests')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PairingRequest;
  },

  claimPairing: async (
    pairingCode: string,
    nodeName?: string
  ): Promise<Node> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data: request, error: fetchError } = await supabase
      .from('pairing_requests')
      .select('*')
      .eq('pairing_code', pairingCode.trim())
      .eq('user_id', user.id)
      .is('node_id', null)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (fetchError || !request) {
      throw new Error('Invalid or expired pairing code');
    }
    const node = await nodesApi.createNode({
      name: nodeName ?? `Node ${pairingCode.slice(-6)}`,
      status: 'paired',
      connection_health: 'healthy',
      capabilities: CAPABILITY_KEYS as unknown as string[],
    });
    await supabase
      .from('pairing_requests')
      .update({ node_id: node.id } as never)
      .eq('id', (request as PairingRequest).id);
    for (const key of CAPABILITY_KEYS) {
      await nodesApi.upsertNodeCapability({
        node_id: node.id,
        capability_key: key,
        status: 'enabled',
        description: getCapabilityDescription(key),
      });
    }
    return node;
  },

  getDefaultCapabilityKeys: (): readonly string[] => CAPABILITY_KEYS,
  getCapabilityDescription,
};

function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
