import { supabase } from '@/lib/supabase';
import type {
  PolicyDocument,
  UserAgreement,
  UserAgreementInsert,
  UserAgreementStatus,
  TermsDeclineFeedbackInsert,
} from '@/types/database';

export const termsApi = {
  /**
   * Get the current (latest) terms of service document. Public read.
   */
  getCurrentTerms: async (): Promise<PolicyDocument | null> => {
    const { data, error } = await supabase
      .from('policy_documents')
      .select('*')
      .eq('document_type', 'terms')
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as PolicyDocument | null;
  },

  /**
   * Get the current user's agreement for a given terms version (policy_document_id), if any.
   */
  getUserAgreement: async (
    policyDocumentId: string
  ): Promise<{ data: UserAgreement | null }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null };
    const { data, error } = await supabase
      .from('user_agreements')
      .select('*')
      .eq('user_id', user.id)
      .eq('policy_document_id', policyDocumentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { data: (data ?? null) as UserAgreement | null };
  },

  /**
   * Record user acceptance or declination of the terms (for the given policy_document_id).
   */
  recordAgreement: async (
    policyDocumentId: string,
    status: UserAgreementStatus
  ): Promise<UserAgreement> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: UserAgreementInsert = {
      user_id: user.id,
      policy_document_id: policyDocumentId,
      status,
    };
    const { data, error } = await supabase
      .from('user_agreements')
      .upsert(row as never, {
        onConflict: 'user_id,policy_document_id',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as UserAgreement;
  },

  /**
   * Submit feedback when user declines the terms. Optional user_agreement_id to link to the declined agreement.
   */
  submitDeclineFeedback: async (
    payload: Omit<TermsDeclineFeedbackInsert, 'user_id'> & { user_agreement_id?: string | null }
  ): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row: TermsDeclineFeedbackInsert = {
      user_id: user.id,
      comments: payload.comments,
      user_agreement_id: payload.user_agreement_id ?? null,
    };
    const { error } = await supabase.from('terms_decline_feedback').insert(row as never);
    if (error) throw new Error(error.message);
  },
};
