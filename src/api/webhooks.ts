import { supabase } from '@/lib/supabase';
import type {
  Webhook,
  WebhookInsert,
  WebhookUpdate,
  HookScript,
  HookScriptInsert,
  HookScriptUpdate,
  PayloadTemplate,
  PayloadTemplateInsert,
  PayloadTemplateUpdate,
} from '@/types/database';

function generateTokenPreview(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'wh_';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const webhooksApi = {
  // Webhooks
  getWebhooks: async (): Promise<Webhook[]> => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Webhook[];
  },

  getWebhook: async (id: string): Promise<Webhook | null> => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as Webhook;
  },

  createWebhook: async (
    payload: Omit<WebhookInsert, 'user_id' | 'token_preview' | 'url'> & {
      route_name: string;
      mapping_template?: string | null;
      delivery_route?: string | null;
    }
  ): Promise<Webhook> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const tokenPreview = generateTokenPreview();
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks`
      : '/api/webhooks';
    const url = `${baseUrl}/${encodeURIComponent(payload.route_name)}?token=${encodeURIComponent(tokenPreview)}`;
    const row: WebhookInsert = {
      user_id: user.id,
      route_name: payload.route_name,
      token_preview: tokenPreview,
      token_hash: null,
      url,
      mapping_template: payload.mapping_template ?? null,
      delivery_route: payload.delivery_route ?? null,
    };
    const { data, error } = await supabase
      .from('webhooks')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Webhook;
  },

  updateWebhook: async (id: string, payload: WebhookUpdate): Promise<Webhook> => {
    const { data, error } = await supabase
      .from('webhooks')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Webhook;
  },

  deleteWebhook: async (id: string): Promise<void> => {
    const { error } = await supabase.from('webhooks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Hook scripts
  getHookScripts: async (webhookId: string | null): Promise<HookScript[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    let query = supabase
      .from('hook_scripts')
      .select('*')
      .eq('user_id', user.id)
      .order('event_trigger');
    if (webhookId === null) {
      query = query.is('webhook_id', null);
    } else if (webhookId) {
      query = query.or(`webhook_id.eq.${webhookId},webhook_id.is.null`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as HookScript[];
  },

  getHookScript: async (id: string): Promise<HookScript | null> => {
    const { data, error } = await supabase
      .from('hook_scripts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as HookScript;
  },

  createHookScript: async (
    payload: Omit<HookScriptInsert, 'user_id'>
  ): Promise<HookScript> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: HookScriptInsert = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from('hook_scripts')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as HookScript;
  },

  updateHookScript: async (
    id: string,
    payload: HookScriptUpdate
  ): Promise<HookScript> => {
    const { data, error } = await supabase
      .from('hook_scripts')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as HookScript;
  },

  deleteHookScript: async (id: string): Promise<void> => {
    const { error } = await supabase.from('hook_scripts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Payload templates
  getPayloadTemplates: async (
    webhookId: string | null
  ): Promise<PayloadTemplate[]> => {
    if (!webhookId) return [];
    const { data, error } = await supabase
      .from('payload_templates')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as PayloadTemplate[];
  },

  getPayloadTemplate: async (
    webhookId: string
  ): Promise<PayloadTemplate | null> => {
    const { data, error } = await supabase
      .from('payload_templates')
      .select('*')
      .eq('webhook_id', webhookId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as PayloadTemplate | null;
  },

  upsertPayloadTemplate: async (
    payload: Omit<PayloadTemplateInsert, 'user_id'> & { webhook_id: string }
  ): Promise<PayloadTemplate> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const existing = await webhooksApi.getPayloadTemplate(payload.webhook_id);
    if (existing) {
      const { data, error } = await supabase
        .from('payload_templates')
        .update({
          template_content: payload.template_content ?? existing.template_content,
        } as PayloadTemplateUpdate as never)
        .eq('webhook_id', payload.webhook_id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as PayloadTemplate;
    }
    const row: PayloadTemplateInsert = {
      user_id: user.id,
      webhook_id: payload.webhook_id,
      template_content: payload.template_content ?? '',
    };
    const { data, error } = await supabase
      .from('payload_templates')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PayloadTemplate;
  },

  updatePayloadTemplate: async (
    id: string,
    payload: PayloadTemplateUpdate
  ): Promise<PayloadTemplate> => {
    const { data, error } = await supabase
      .from('payload_templates')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PayloadTemplate;
  },
};
