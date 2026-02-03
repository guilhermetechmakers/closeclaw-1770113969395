import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { webhooksApi } from '@/api/webhooks';
import type {
  WebhookUpdate,
  HookScriptInsert,
  HookScriptUpdate,
  PayloadTemplateUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const WEBHOOKS_KEYS = {
  all: ['webhooks'] as const,
  list: () => [...WEBHOOKS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...WEBHOOKS_KEYS.all, 'detail', id] as const,
  hookScripts: (webhookId: string | null) =>
    [...WEBHOOKS_KEYS.all, 'hookScripts', webhookId] as const,
  payloadTemplate: (webhookId: string) =>
    [...WEBHOOKS_KEYS.all, 'payloadTemplate', webhookId] as const,
};

export function useWebhooks() {
  return useQuery({
    queryKey: WEBHOOKS_KEYS.list(),
    queryFn: () => safeGet(() => webhooksApi.getWebhooks(), []),
  });
}

export function useWebhook(id: string | null) {
  return useQuery({
    queryKey: WEBHOOKS_KEYS.detail(id ?? ''),
    queryFn: () => (id ? webhooksApi.getWebhook(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      route_name: string;
      mapping_template?: string | null;
      delivery_route?: string | null;
    }) => webhooksApi.createWebhook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEYS.list() });
      toast.success('Webhook created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create webhook');
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WebhookUpdate }) =>
      webhooksApi.updateWebhook(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEYS.detail(id) });
      toast.success('Webhook updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update webhook');
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => webhooksApi.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEYS.list() });
      toast.success('Webhook removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove webhook');
    },
  });
}

export function useHookScripts(webhookId: string | null) {
  return useQuery({
    queryKey: WEBHOOKS_KEYS.hookScripts(webhookId),
    queryFn: () => webhooksApi.getHookScripts(webhookId),
  });
}

export function useHookScript(id: string | null) {
  return useQuery({
    queryKey: [...WEBHOOKS_KEYS.all, 'hookScript', id] as const,
    queryFn: () => (id ? webhooksApi.getHookScript(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateHookScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<HookScriptInsert, 'user_id'>) =>
      webhooksApi.createHookScript(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: WEBHOOKS_KEYS.hookScripts(variables.webhook_id ?? null),
      });
      toast.success('Hook script added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add hook script');
    },
  });
}

export function useUpdateHookScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HookScriptUpdate }) =>
      webhooksApi.updateHookScript(id, data),
    onSuccess: (updated) => {
      if (updated?.webhook_id !== undefined) {
        queryClient.invalidateQueries({
          queryKey: WEBHOOKS_KEYS.hookScripts(updated.webhook_id),
        });
      }
      queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEYS.hookScripts(null) });
      toast.success('Hook script updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update hook script');
    },
  });
}

export function useDeleteHookScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => webhooksApi.deleteHookScript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOKS_KEYS.all });
      toast.success('Hook script removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove hook script');
    },
  });
}

export function usePayloadTemplate(webhookId: string | null) {
  return useQuery({
    queryKey: WEBHOOKS_KEYS.payloadTemplate(webhookId ?? ''),
    queryFn: () =>
      webhookId ? webhooksApi.getPayloadTemplate(webhookId) : Promise.resolve(null),
    enabled: !!webhookId,
  });
}

export function useUpsertPayloadTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { webhook_id: string; template_content?: string }) =>
      webhooksApi.upsertPayloadTemplate(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: WEBHOOKS_KEYS.payloadTemplate(variables.webhook_id),
      });
      toast.success('Payload template saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save payload template');
    },
  });
}

export function useUpdatePayloadTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayloadTemplateUpdate }) =>
      webhooksApi.updatePayloadTemplate(id, data),
    onSuccess: (updated) => {
      if (updated?.webhook_id) {
        queryClient.invalidateQueries({
          queryKey: WEBHOOKS_KEYS.payloadTemplate(updated.webhook_id),
        });
      }
      toast.success('Payload template updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update payload template');
    },
  });
}
