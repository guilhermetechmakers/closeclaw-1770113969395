/**
 * Help API: FAQs, documentation links, support requests, changelog.
 * Uses Supabase client; RLS allows public read for FAQs, doc links, changelog;
 * support_requests: insert anyone, select own.
 */

import { supabase } from '@/lib/supabase';
import type {
  HelpFaq,
  HelpDocLink,
  SupportRequest,
  SupportRequestInsert,
  HelpChangelogEntry,
} from '@/types/database';

const FAQ_TABLE = 'help_faqs';
const DOC_LINKS_TABLE = 'help_doc_links';
const SUPPORT_REQUESTS_TABLE = 'support_requests';
const CHANGELOG_TABLE = 'help_changelog';

export const helpApi = {
  getFaqs: async (): Promise<HelpFaq[]> => {
    const { data, error } = await supabase
      .from(FAQ_TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as HelpFaq[];
  },

  getDocLinks: async (): Promise<HelpDocLink[]> => {
    const { data, error } = await supabase
      .from(DOC_LINKS_TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as HelpDocLink[];
  },

  submitSupportRequest: async (
    payload: SupportRequestInsert
  ): Promise<SupportRequest> => {
    const row = {
      ...payload,
      user_id: payload.user_id ?? null,
      context_info: payload.context_info ?? {},
      status: payload.status ?? 'open',
    };
    const { data, error } = await supabase
      .from(SUPPORT_REQUESTS_TABLE)
      .insert(row as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SupportRequest;
  },

  getChangelog: async (limit = 50): Promise<HelpChangelogEntry[]> => {
    const { data, error } = await supabase
      .from(CHANGELOG_TABLE)
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as HelpChangelogEntry[];
  },
};
