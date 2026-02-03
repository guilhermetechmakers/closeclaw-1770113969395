import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApi } from '@/api/chat';
import type {
  ChatSessionInsert,
  ChatSessionUpdate,
  ChatMessageInsert,
  ToolInvocationInsert,
  ToolInvocationUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const CHAT_KEYS = {
  all: ['chat'] as const,
  sessions: () => [...CHAT_KEYS.all, 'sessions'] as const,
  session: (id: string) => [...CHAT_KEYS.all, 'session', id] as const,
  messages: (sessionId: string, params?: { limit?: number }) =>
    [...CHAT_KEYS.all, 'messages', sessionId, params] as const,
  toolInvocations: (
    sessionId: string,
    params?: { messageId?: string; limit?: number }
  ) => [...CHAT_KEYS.all, 'toolInvocations', sessionId, params] as const,
};

export function useChatSessions() {
  return useQuery({
    queryKey: CHAT_KEYS.sessions(),
    queryFn: () => safeGet(() => chatApi.getSessions(), []),
  });
}

export function useChatSession(id: string | null) {
  return useQuery({
    queryKey: CHAT_KEYS.session(id ?? ''),
    queryFn: () =>
      id ? chatApi.getSession(id) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ChatSessionInsert, 'user_id'>) => chatApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
      toast.success('Session created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create session');
    },
  });
}

export function useUpdateChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChatSessionUpdate }) =>
      chatApi.updateSession(id, data),
    onSuccess: (_, { id: sessionId }) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.session(sessionId) });
      toast.success('Session updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update session');
    },
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApi.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
      toast.success('Session deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete session');
    },
  });
}

export function useChatMessages(sessionId: string | null, limit?: number) {
  return useQuery({
    queryKey: CHAT_KEYS.messages(sessionId ?? '', { limit }),
    queryFn: () =>
      sessionId
        ? chatApi.getMessages(sessionId, { limit })
        : Promise.resolve([]),
    enabled: !!sessionId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChatMessageInsert) => chatApi.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.messages(variables.session_id),
      });
      toast.success('Message sent');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to send message');
    },
  });
}

export function useToolInvocations(
  sessionId: string | null,
  params?: { messageId?: string; limit?: number }
) {
  return useQuery({
    queryKey: CHAT_KEYS.toolInvocations(sessionId ?? '', params),
    queryFn: () =>
      sessionId
        ? chatApi.getToolInvocations(sessionId, params)
        : Promise.resolve([]),
    enabled: !!sessionId,
  });
}

export function useCreateToolInvocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ToolInvocationInsert) =>
      chatApi.createToolInvocation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.toolInvocations(variables.session_id),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to invoke tool');
    },
  });
}

export function useUpdateToolInvocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      sessionId: _sessionId,
      data,
    }: {
      id: string;
      sessionId: string;
      data: ToolInvocationUpdate;
    }) => chatApi.updateToolInvocation(id, data),
    onSuccess: (_, { sessionId: sid }) => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.toolInvocations(sid),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update tool invocation');
    },
  });
}

export function useApproveToolInvocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sessionId: _sessionId }: { id: string; sessionId: string }) =>
      chatApi.approveToolInvocation(id),
    onSuccess: (_, { sessionId: sid }) => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.toolInvocations(sid),
      });
      toast.success('Tool output approved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to approve');
    },
  });
}

export function useDenyToolInvocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sessionId: _sessionId }: { id: string; sessionId: string }) =>
      chatApi.denyToolInvocation(id),
    onSuccess: (_, { sessionId: sid }) => {
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.toolInvocations(sid),
      });
      toast.success('Tool output denied');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to deny');
    },
  });
}
