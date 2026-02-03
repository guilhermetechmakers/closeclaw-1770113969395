import { supabase } from '@/lib/supabase';
import type {
  Secret,
  SecretInsert,
  SecretUpdate,
  SecretAuditLog,
  SecretAuditLogInsert,
  SecretStorageMethod,
} from '@/types/database';

/**
 * Placeholder for encrypted value. In production, the client would send the
 * secret to an Edge Function / backend that encrypts it before storing.
 * We never persist plaintext; this constant is stored when user provides a value.
 */
const ENCRYPTED_PLACEHOLDER = '[ENCRYPTED]';

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

async function logAudit(
  action: string,
  secretId: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  const user_id = await getCurrentUserId();
  const row: SecretAuditLogInsert = { user_id, secret_id: secretId, action, details };
  await supabase.from('secret_audit_logs').insert(row as never);
}

export const secretsApi = {
  getSecrets: async (): Promise<Secret[]> => {
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Secret[];
  },

  getSecret: async (id: string): Promise<Secret | null> => {
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as Secret;
  },

  createSecret: async (payload: {
    name: string;
    storage_method: SecretStorageMethod;
    value?: string;
    key_reference?: string | null;
  }): Promise<Secret> => {
    const user_id = await getCurrentUserId();
    const encrypted_value =
      payload.storage_method === 'encrypted_fallback' && payload.value != null
        ? ENCRYPTED_PLACEHOLDER
        : null;
    const row: SecretInsert = {
      user_id,
      name: payload.name.trim(),
      storage_method: payload.storage_method,
      encrypted_value,
      key_reference: payload.key_reference ?? null,
    };
    const { data, error } = await supabase
      .from('secrets')
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const secret = data as Secret;
    await logAudit('secret_created', secret.id, { name: secret.name });
    return secret;
  },

  updateSecret: async (id: string, payload: SecretUpdate): Promise<Secret> => {
    const { data, error } = await supabase
      .from('secrets')
      .update(payload as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const secret = data as Secret;
    await logAudit('secret_updated', id, { name: secret.name });
    return secret;
  },

  rotateSecret: async (
    id: string,
    payload: { value?: string }
  ): Promise<Secret> => {
    const encrypted_value =
      payload.value != null ? ENCRYPTED_PLACEHOLDER : undefined;
    const { data, error } = await supabase
      .from('secrets')
      .update({ encrypted_value } as never)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit('secret_rotated', id);
    return data as Secret;
  },

  deleteSecret: async (id: string): Promise<void> => {
    const secret = await secretsApi.getSecret(id);
    const { error } = await supabase.from('secrets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    if (secret) await logAudit('secret_deleted', null, { name: secret.name });
  },

  getAuditLogs: async (limit = 50): Promise<SecretAuditLog[]> => {
    const { data, error } = await supabase
      .from('secret_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as SecretAuditLog[];
  },
};
