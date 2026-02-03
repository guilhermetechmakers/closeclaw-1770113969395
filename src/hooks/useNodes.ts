import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { nodesApi } from '@/api/nodes';
import type {
  NodeInsert,
  NodeUpdate,
  NodeCapabilityInsert,
  NodeCapabilityUpdate,
  NodeApprovalInsert,
  NodeApprovalUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const NODES_KEYS = {
  all: ['nodes'] as const,
  list: () => [...NODES_KEYS.all, 'list'] as const,
  detail: (id: string) => [...NODES_KEYS.all, 'detail', id] as const,
  capabilities: (nodeId: string) =>
    [...NODES_KEYS.all, 'capabilities', nodeId] as const,
  approvals: (params?: { nodeId?: string; status?: string }) =>
    [...NODES_KEYS.all, 'approvals', params] as const,
  pairing: () => [...NODES_KEYS.all, 'pairing'] as const,
};

export function useNodes() {
  return useQuery({
    queryKey: NODES_KEYS.list(),
    queryFn: () => safeGet(() => nodesApi.getNodes(), []),
  });
}

export function useNode(id: string | null) {
  return useQuery({
    queryKey: NODES_KEYS.detail(id ?? ''),
    queryFn: () => (id ? nodesApi.getNode(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<NodeInsert, 'user_id'>) => nodesApi.createNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.list() });
      toast.success('Node added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add node');
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NodeUpdate }) =>
      nodesApi.updateNode(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.detail(id) });
      toast.success('Node updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update node');
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => nodesApi.deleteNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.approvals() });
      toast.success('Node removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove node');
    },
  });
}

export function useNodeCapabilities(nodeId: string | null) {
  return useQuery({
    queryKey: NODES_KEYS.capabilities(nodeId ?? ''),
    queryFn: () =>
      nodeId ? nodesApi.getNodeCapabilities(nodeId) : Promise.resolve([]),
    enabled: !!nodeId,
  });
}

export function useUpsertNodeCapability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NodeCapabilityInsert) =>
      nodesApi.upsertNodeCapability(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: NODES_KEYS.capabilities(variables.node_id),
      });
      queryClient.invalidateQueries({
        queryKey: NODES_KEYS.detail(variables.node_id),
      });
      toast.success('Capability updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update capability');
    },
  });
}

export function useUpdateNodeCapability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      nodeId: string;
      data: NodeCapabilityUpdate;
    }) => nodesApi.updateNodeCapability(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: NODES_KEYS.capabilities(variables.nodeId),
      });
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.detail(variables.nodeId) });
      toast.success('Capability updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update capability');
    },
  });
}

export function useNodeApprovals(params?: {
  nodeId?: string;
  status?: 'pending' | 'approved' | 'denied';
  limit?: number;
}) {
  return useQuery({
    queryKey: NODES_KEYS.approvals(params),
    queryFn: () =>
      safeGet(() => nodesApi.getNodeApprovals(params), []),
  });
}

export function useCreateNodeApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<NodeApprovalInsert, 'requester_id'>) =>
      nodesApi.createNodeApproval(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.approvals() });
      toast.success('Approval request sent');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create approval request');
    },
  });
}

export function useUpdateNodeApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NodeApprovalUpdate }) =>
      nodesApi.updateNodeApproval(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.approvals() });
      toast.success('Approval updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update approval');
    },
  });
}

export function useStartPairing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => nodesApi.startPairing(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.pairing() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start pairing');
    },
  });
}

export function useClaimPairing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, nodeName }: { code: string; nodeName?: string }) =>
      nodesApi.claimPairing(code, nodeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: NODES_KEYS.pairing() });
      toast.success('Device paired');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to pair device');
    },
  });
}
