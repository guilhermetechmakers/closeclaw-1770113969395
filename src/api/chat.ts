import { supabase } from '@/lib/supabase';
import type {
  ChatSession,
  ChatSessionInsert,
  ChatSessionUpdate,
  ChatMessage,
  ChatMessageInsert,
  ToolInvocation,
  ToolInvocationInsert,
  ToolInvocationUpdate,
  SessionCommand,
  SessionCommandInsert,
} from '@/types/database';

export const chatApi = {
  // Sessions
  getSessions: async (): Promise<ChatSession[]> => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('started_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ChatSession[];
  },

  getSession: async (id: string): Promise<ChatSession | null> => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as ChatSession;
  },

  createSession: async (payload: Omit<ChatSessionInsert, 'user_id'>): Promise<ChatSession> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: ChatSessionInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ChatSession;
  },

  updateSession: async (
    id: string,
    payload: ChatSessionUpdate
  ): Promise<ChatSession> => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ChatSession;
  },

  deleteSession: async (id: string): Promise<void> => {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Messages
  getMessages: async (
    sessionId: string,
    params?: { limit?: number }
  ): Promise<ChatMessage[]> => {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as ChatMessage[];
  },

  sendMessage: async (payload: ChatMessageInsert): Promise<ChatMessage> => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ChatMessage;
  },

  // Tool invocations
  getToolInvocations: async (
    sessionId: string,
    params?: { messageId?: string; limit?: number }
  ): Promise<ToolInvocation[]> => {
    let query = supabase
      .from('tool_invocations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    if (params?.messageId)
      query = query.eq('message_id', params.messageId);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as ToolInvocation[];
  },

  createToolInvocation: async (
    payload: ToolInvocationInsert
  ): Promise<ToolInvocation> => {
    const { data, error } = await supabase
      .from('tool_invocations')
      .insert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ToolInvocation;
  },

  updateToolInvocation: async (
    id: string,
    payload: ToolInvocationUpdate
  ): Promise<ToolInvocation> => {
    const { data, error } = await supabase
      .from('tool_invocations')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ToolInvocation;
  },

  approveToolInvocation: async (id: string): Promise<ToolInvocation> =>
    chatApi.updateToolInvocation(id, { status: 'approved' }),

  denyToolInvocation: async (id: string): Promise<ToolInvocation> =>
    chatApi.updateToolInvocation(id, { status: 'denied' }),

  // Session commands (slash commands with permissions)
  getSessionCommands: async (params?: {
    userId?: string;
    sessionId?: string;
    limit?: number;
  }): Promise<SessionCommand[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = params?.userId ?? user?.id;
    if (!uid) return [];
    let query = supabase
      .from('session_commands')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (params?.sessionId) query = query.eq('session_id', params.sessionId);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as SessionCommand[];
  },

  createSessionCommand: async (
    payload: Omit<SessionCommandInsert, 'user_id'>
  ): Promise<SessionCommand> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: SessionCommandInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('session_commands')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SessionCommand;
  },
};
