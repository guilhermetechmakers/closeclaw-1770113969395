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
  GmailPubSubSetting,
  GmailPubSubSettingInsert,
  GmailPubSubSettingUpdate,
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
      rate_limit?: number | null;
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
      rate_limit: payload.rate_limit ?? null,
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

  /** Send a test request to the webhook endpoint (simulates incoming payload). */
  testWebhook: async (id: string): Promise<{ ok: boolean; message?: string }> => {
    const webhook = await webhooksApi.getWebhook(id);
    if (!webhook) throw new Error('Webhook not found');
    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _test: true,
          timestamp: new Date().toISOString(),
          source: 'control-ui',
        }),
      });
      return { ok: res.ok, message: res.ok ? 'Test request sent' : await res.text().catch(() => res.statusText) };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Request failed' };
    }
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

  // Gmail Pub/Sub settings
  getGmailPubSubSettings: async (): Promise<GmailPubSubSetting[]> => {
    const { data, error } = await supabase
      .from('gmail_pubsub_settings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as GmailPubSubSetting[];
  },

  getGmailPubSubSetting: async (id: string): Promise<GmailPubSubSetting | null> => {
    const { data, error } = await supabase
      .from('gmail_pubsub_settings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as GmailPubSubSetting;
  },

  createGmailPubSubSetting: async (
    payload: Omit<GmailPubSubSettingInsert, 'user_id'>
  ): Promise<GmailPubSubSetting> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: GmailPubSubSettingInsert = {
      user_id: user.id,
      name: payload.name ?? 'default',
      configuration_details: payload.configuration_details ?? {},
      is_active: payload.is_active ?? false,
      last_tested_at: payload.last_tested_at ?? null,
      metadata: payload.metadata ?? {},
    };
    const { data, error } = await supabase
      .from('gmail_pubsub_settings')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as GmailPubSubSetting;
  },

  updateGmailPubSubSetting: async (
    id: string,
    payload: GmailPubSubSettingUpdate
  ): Promise<GmailPubSubSetting> => {
    const { data, error } = await supabase
      .from('gmail_pubsub_settings')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as GmailPubSubSetting;
  },

  deleteGmailPubSubSetting: async (id: string): Promise<void> => {
    const { error } = await supabase.from('gmail_pubsub_settings').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  testGmailPubSubSetting: async (id: string): Promise<{ ok: boolean; message?: string }> => {
    const setting = await webhooksApi.getGmailPubSubSetting(id);
    if (!setting) throw new Error('Gmail Pub/Sub setting not found');
    const config = setting.configuration_details as { push_endpoint?: string };
    const endpoint = config?.push_endpoint;
    if (!endpoint) return { ok: false, message: 'Push endpoint not configured' };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { data: btoa(unescape(encodeURIComponent(JSON.stringify({ test: true })))) } }),
      });
      const ok = res.ok || res.status === 200;
      await webhooksApi.updateGmailPubSubSetting(id, { last_tested_at: new Date().toISOString() });
      return { ok, message: ok ? 'Test sent' : await res.text().catch(() => res.statusText) };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Request failed' };
    }
  },
};
