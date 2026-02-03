/**
 * Supabase Database types for Clawgate profile and related tables.
 * Matches migrations in supabase/migrations/.
 */

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate };
      oauth_accounts: { Row: OAuthAccount; Insert: OAuthAccountInsert; Update: OAuthAccountUpdate };
      device_sessions: { Row: DeviceSession; Insert: DeviceSessionInsert; Update: DeviceSessionUpdate };
      api_keys: { Row: ApiKey; Insert: ApiKeyInsert; Update: ApiKeyUpdate };
      security_settings: { Row: SecuritySetting; Insert: SecuritySettingInsert; Update: SecuritySettingUpdate };
      password_reset_requests: {
        Row: PasswordResetRequest;
        Insert: PasswordResetRequestInsert;
        Update: PasswordResetRequestUpdate;
      };
      landing_features: {
        Row: LandingFeatureRow;
        Insert: LandingFeatureInsert;
        Update: LandingFeatureUpdate;
      };
      landing_integration_logos: {
        Row: LandingIntegrationLogoRow;
        Insert: LandingIntegrationLogoInsert;
        Update: LandingIntegrationLogoUpdate;
      };
      landing_pricing_plans: {
        Row: LandingPricingPlanRow;
        Insert: LandingPricingPlanInsert;
        Update: LandingPricingPlanUpdate;
      };
      activities: { Row: Activity; Insert: ActivityInsert };
      runs: { Row: Run; Insert: RunInsert; Update: RunUpdate };
      cron_jobs: { Row: CronJob; Insert: CronJobInsert; Update: CronJobUpdate };
      cron_run_history: { Row: CronRunHistory; Insert: CronRunHistoryInsert };
      nodes: { Row: Node; Insert: NodeInsert; Update: NodeUpdate };
      node_capabilities: { Row: NodeCapability; Insert: NodeCapabilityInsert; Update: NodeCapabilityUpdate };
      node_approvals: { Row: NodeApproval; Insert: NodeApprovalInsert; Update: NodeApprovalUpdate };
      pairing_requests: { Row: PairingRequest; Insert: PairingRequestInsert };
      alerts: { Row: Alert; Insert: AlertInsert; Update: AlertUpdate };
      chat_sessions: { Row: ChatSession; Insert: ChatSessionInsert; Update: ChatSessionUpdate };
      chat_messages: { Row: ChatMessage; Insert: ChatMessageInsert; Update: ChatMessageUpdate };
      tool_invocations: { Row: ToolInvocation; Insert: ToolInvocationInsert; Update: ToolInvocationUpdate };
      channels: { Row: Channel; Insert: ChannelInsert; Update: ChannelUpdate };
      adapter_configurations: { Row: AdapterConfiguration; Insert: AdapterConfigurationInsert; Update: AdapterConfigurationUpdate };
      delivery_logs: { Row: DeliveryLog; Insert: DeliveryLogInsert };
      browser_profiles: { Row: BrowserProfile; Insert: BrowserProfileInsert; Update: BrowserProfileUpdate };
      browser_tabs: { Row: BrowserTab; Insert: BrowserTabInsert; Update: BrowserTabUpdate };
      browser_scripts: { Row: BrowserScript; Insert: BrowserScriptInsert; Update: BrowserScriptUpdate };
      browser_capture_records: { Row: BrowserCaptureRecord; Insert: BrowserCaptureRecordInsert };
      browser_cdp_tokens: { Row: BrowserCdpToken; Insert: BrowserCdpTokenInsert; Update: BrowserCdpTokenUpdate };
      browser_commands: { Row: BrowserCommand; Insert: BrowserCommandInsert; Update: BrowserCommandUpdate };
      wake_words: { Row: WakeWord; Insert: WakeWordInsert; Update: WakeWordUpdate };
      talk_mode_settings: { Row: TalkModeSetting; Insert: TalkModeSettingInsert; Update: TalkModeSettingUpdate };
      transcription_backends: { Row: TranscriptionBackend; Insert: TranscriptionBackendInsert; Update: TranscriptionBackendUpdate };
      tts_provider_settings: { Row: TtsProviderSetting; Insert: TtsProviderSettingInsert; Update: TtsProviderSettingUpdate };
      media_settings: { Row: MediaSetting; Insert: MediaSettingInsert; Update: MediaSettingUpdate };
      skills: { Row: Skill; Insert: SkillInsert; Update: SkillUpdate };
      skill_test_runs: { Row: SkillTestRun; Insert: SkillTestRunInsert; Update: SkillTestRunUpdate };
      skill_versions: { Row: SkillVersion; Insert: SkillVersionInsert };
      webhooks: { Row: Webhook; Insert: WebhookInsert; Update: WebhookUpdate };
      hook_scripts: { Row: HookScript; Insert: HookScriptInsert; Update: HookScriptUpdate };
      payload_templates: { Row: PayloadTemplate; Insert: PayloadTemplateInsert; Update: PayloadTemplateUpdate };
      logs: { Row: Log; Insert: LogInsert };
      run_traces: { Row: RunTrace; Insert: RunTraceInsert; Update: RunTraceUpdate };
      log_retention_settings: {
        Row: LogRetentionSetting;
        Insert: LogRetentionSettingInsert;
        Update: LogRetentionSettingUpdate;
      };
      redaction_rules: {
        Row: RedactionRule;
        Insert: RedactionRuleInsert;
        Update: RedactionRuleUpdate;
      };
      privacy_policy_settings: {
        Row: PrivacyPolicySetting;
        Insert: PrivacyPolicySettingInsert;
        Update: PrivacyPolicySettingUpdate;
      };
      policy_documents: {
        Row: PolicyDocument;
        Insert: PolicyDocumentInsert;
        Update: PolicyDocumentUpdate;
      };
      error_logs: {
        Row: ErrorLog;
        Insert: ErrorLogInsert;
        Update: ErrorLogUpdate;
      };
      user_reports: {
        Row: UserReport;
        Insert: UserReportInsert;
        Update: never;
      };
      security_audits: {
        Row: SecurityAudit;
        Insert: SecurityAuditInsert;
        Update: SecurityAuditUpdate;
      };
      security_issues: {
        Row: SecurityIssue;
        Insert: SecurityIssueInsert;
        Update: SecurityIssueUpdate;
      };
      incident_actions: {
        Row: IncidentAction;
        Insert: IncidentActionInsert;
        Update: IncidentActionUpdate;
      };
      secrets: { Row: Secret; Insert: SecretInsert; Update: SecretUpdate };
      secret_audit_logs: {
        Row: SecretAuditLog;
        Insert: SecretAuditLogInsert;
        Update: never;
      };
      model_providers: { Row: ModelProvider; Insert: ModelProviderInsert; Update: ModelProviderUpdate };
      model_requests: { Row: ModelRequest; Insert: ModelRequestInsert; Update: ModelRequestUpdate };
      usage_metrics: { Row: UsageMetric; Insert: UsageMetricInsert; Update: never };
      configuration_overrides: {
        Row: ConfigurationOverride;
        Insert: ConfigurationOverrideInsert;
        Update: ConfigurationOverrideUpdate;
      };
      admin_workspaces: {
        Row: AdminWorkspace;
        Insert: AdminWorkspaceInsert;
        Update: AdminWorkspaceUpdate;
      };
      admin_workspace_members: {
        Row: AdminWorkspaceMember;
        Insert: AdminWorkspaceMemberInsert;
        Update: AdminWorkspaceMemberUpdate;
      };
      admin_licenses: {
        Row: AdminLicense;
        Insert: AdminLicenseInsert;
        Update: AdminLicenseUpdate;
      };
      admin_analytics_metrics: {
        Row: AdminAnalyticsMetric;
        Insert: AdminAnalyticsMetricInsert;
        Update: never;
      };
      marketplace_skills: {
        Row: MarketplaceSkill;
        Insert: MarketplaceSkillInsert;
        Update: MarketplaceSkillUpdate;
      };
      marketplace_transactions: {
        Row: MarketplaceTransaction;
        Insert: MarketplaceTransactionInsert;
        Update: MarketplaceTransactionUpdate;
      };
      marketplace_licenses: {
        Row: MarketplaceLicense;
        Insert: MarketplaceLicenseInsert;
        Update: MarketplaceLicenseUpdate;
      };
      help_faqs: {
        Row: HelpFaq;
        Insert: HelpFaqInsert;
        Update: HelpFaqUpdate;
      };
      help_doc_links: {
        Row: HelpDocLink;
        Insert: HelpDocLinkInsert;
        Update: HelpDocLinkUpdate;
      };
      support_requests: {
        Row: SupportRequest;
        Insert: SupportRequestInsert;
        Update: SupportRequestUpdate;
      };
      help_changelog: {
        Row: HelpChangelogEntry;
        Insert: HelpChangelogEntryInsert;
        Update: HelpChangelogEntryUpdate;
      };
    };
  };
}

// ========== Error Logs (404 / client errors) ==========

export interface ErrorLog {
  id: string;
  error_code: string;
  url_attempted: string;
  user_id: string | null;
  referrer_url: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ErrorLogInsert {
  id?: string;
  error_code: string;
  url_attempted: string;
  user_id?: string | null;
  referrer_url?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
}

export type ErrorLogUpdate = Partial<Omit<ErrorLogInsert, 'id'>>;

// ========== User Reports (error/support feedback) ==========

export interface UserReport {
  id: string;
  user_id: string | null;
  error_type: string;
  description: string;
  contact_email: string | null;
  context: Record<string, unknown>;
  created_at: string;
}

export interface UserReportInsert {
  id?: string;
  user_id?: string | null;
  error_type: string;
  description: string;
  contact_email?: string | null;
  context?: Record<string, unknown>;
}

// ========== Security Audit ==========

export interface SecurityAudit {
  id: string;
  user_id: string;
  risk_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SecurityAuditInsert {
  id?: string;
  user_id: string;
  risk_score?: number;
  metadata?: Record<string, unknown>;
}

export interface SecurityAuditUpdate {
  risk_score?: number;
  metadata?: Record<string, unknown>;
}

export type SecurityIssueSeverity = 'critical' | 'high' | 'medium' | 'low';

/** Category for findings: misconfigurations, risky_permissions, plaintext_secrets, open_binds */
export type SecurityIssueCategory =
  | 'misconfigurations'
  | 'risky_permissions'
  | 'plaintext_secrets'
  | 'open_binds'
  | string;

export interface SecurityIssue {
  id: string;
  audit_id: string;
  category?: string | null;
  description: string;
  severity: SecurityIssueSeverity;
  affected_files: string[];
  remediation: string | null;
  applied_fix?: string | null;
  auto_fix_available: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SecurityIssueInsert {
  id?: string;
  audit_id: string;
  category?: string | null;
  description: string;
  severity: SecurityIssueSeverity;
  affected_files?: string[];
  remediation?: string | null;
  applied_fix?: string | null;
  auto_fix_available?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SecurityIssueUpdate {
  description?: string;
  severity?: SecurityIssueSeverity;
  category?: string | null;
  affected_files?: string[];
  remediation?: string | null;
  applied_fix?: string | null;
  auto_fix_available?: boolean;
  metadata?: Record<string, unknown>;
}

export type IncidentActionType =
  | 'revoke_sessions'
  | 'rotate_secrets'
  | 'export_logs'
  | 'stop_blast_radius'
  | 'quarantine_skill';

export type IncidentActionStatus = 'pending' | 'completed' | 'failed';

export interface IncidentAction {
  id: string;
  audit_id: string | null;
  user_id: string;
  action_type: IncidentActionType;
  status: IncidentActionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IncidentActionInsert {
  id?: string;
  audit_id?: string | null;
  user_id: string;
  action_type: IncidentActionType;
  status?: IncidentActionStatus;
  metadata?: Record<string, unknown>;
}

export interface IncidentActionUpdate {
  status?: IncidentActionStatus;
  metadata?: Record<string, unknown>;
}

// ========== Audit Logs (compliance) ==========

export interface AuditLog {
  id: string;
  audit_id: string | null;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogInsert {
  id?: string;
  audit_id?: string | null;
  user_id: string;
  action: string;
  metadata?: Record<string, unknown>;
}

// ========== Logs & Tracing ==========

export type LogSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface Log {
  id: string;
  user_id: string;
  timestamp: string;
  severity: LogSeverity;
  message: string;
  redacted_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LogInsert {
  id?: string;
  user_id: string;
  timestamp?: string;
  severity: LogSeverity;
  message: string;
  redacted_message?: string | null;
  metadata?: Record<string, unknown>;
}

export interface RunTrace {
  id: string;
  log_id: string;
  user_id: string;
  tool_invocation: unknown[];
  model_calls: unknown[];
  duration_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RunTraceInsert {
  id?: string;
  log_id: string;
  user_id: string;
  tool_invocation?: unknown[];
  model_calls?: unknown[];
  duration_ms?: number | null;
  metadata?: Record<string, unknown>;
}

export interface RunTraceUpdate {
  tool_invocation?: unknown[];
  model_calls?: unknown[];
  duration_ms?: number | null;
  metadata?: Record<string, unknown>;
}

export interface LogRetentionSetting {
  user_id: string;
  retention_period_days: number;
  purge_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LogRetentionSettingInsert {
  user_id: string;
  retention_period_days?: number;
  purge_enabled?: boolean;
}

export interface LogRetentionSettingUpdate {
  retention_period_days?: number;
  purge_enabled?: boolean;
}

// ========== Redaction Rules (Logs & Tracing) ==========

export interface RedactionRule {
  id: string;
  user_id: string;
  field_name: string;
  is_redacted: boolean;
  created_at: string;
  updated_at: string;
}

export interface RedactionRuleInsert {
  id?: string;
  user_id: string;
  field_name: string;
  is_redacted?: boolean;
}

export interface RedactionRuleUpdate {
  field_name?: string;
  is_redacted?: boolean;
}

// ========== Webhooks & Hooks ==========

export interface Webhook {
  id: string;
  user_id: string;
  route_name: string;
  token_preview: string;
  token_hash: string | null;
  url: string;
  last_received_at: string | null;
  mapping_template: string | null;
  delivery_route: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebhookInsert {
  id?: string;
  user_id: string;
  route_name: string;
  token_preview: string;
  token_hash?: string | null;
  url: string;
  last_received_at?: string | null;
  mapping_template?: string | null;
  delivery_route?: string | null;
  metadata?: Record<string, unknown>;
}

export interface WebhookUpdate {
  route_name?: string;
  token_preview?: string;
  token_hash?: string | null;
  url?: string;
  last_received_at?: string | null;
  mapping_template?: string | null;
  delivery_route?: string | null;
  metadata?: Record<string, unknown>;
}

export type HookScriptLanguage = 'javascript' | 'python';

export interface HookScript {
  id: string;
  user_id: string;
  webhook_id: string | null;
  event_trigger: string;
  script_content: string;
  language: HookScriptLanguage;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HookScriptInsert {
  id?: string;
  user_id: string;
  webhook_id?: string | null;
  event_trigger: string;
  script_content?: string;
  language?: HookScriptLanguage;
  metadata?: Record<string, unknown>;
}

export interface HookScriptUpdate {
  webhook_id?: string | null;
  event_trigger?: string;
  script_content?: string;
  language?: HookScriptLanguage;
  metadata?: Record<string, unknown>;
}

export interface PayloadTemplate {
  id: string;
  user_id: string;
  webhook_id: string;
  template_content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PayloadTemplateInsert {
  id?: string;
  user_id: string;
  webhook_id: string;
  template_content?: string;
  metadata?: Record<string, unknown>;
}

export interface PayloadTemplateUpdate {
  template_content?: string;
  metadata?: Record<string, unknown>;
}

// ========== Skill Editor (skills, skill_test_runs, skill_versions) ==========

export type SkillStatus = 'draft' | 'published' | 'archived';

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  content: string;
  version: string;
  frontmatter: Record<string, unknown>;
  status: SkillStatus;
  created_at: string;
  updated_at: string;
}

export interface SkillInsert {
  id?: string;
  user_id: string;
  name: string;
  content?: string;
  version?: string;
  frontmatter?: Record<string, unknown>;
  status?: SkillStatus;
}

export interface SkillUpdate {
  name?: string;
  content?: string;
  version?: string;
  frontmatter?: Record<string, unknown>;
  status?: SkillStatus;
}

export type SkillTestRunStatus = 'running' | 'completed' | 'failed' | 'aborted';

export interface SkillTestRun {
  id: string;
  skill_id: string;
  user_id: string;
  status: SkillTestRunStatus;
  logs: string | null;
  outputs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SkillTestRunInsert {
  id?: string;
  skill_id: string;
  user_id: string;
  status?: SkillTestRunStatus;
  logs?: string | null;
  outputs?: Record<string, unknown>;
}

export interface SkillTestRunUpdate {
  status?: SkillTestRunStatus;
  logs?: string | null;
  outputs?: Record<string, unknown>;
}

export interface SkillVersion {
  id: string;
  skill_id: string;
  user_id: string;
  version_number: string;
  changes: string | null;
  content_snapshot: string | null;
  created_at: string;
}

export interface SkillVersionInsert {
  id?: string;
  skill_id: string;
  user_id: string;
  version_number: string;
  changes?: string | null;
  content_snapshot?: string | null;
}

// ========== Voice & Media ==========

export type WakeWordStatus = 'active' | 'inactive';

export interface WakeWord {
  id: string;
  user_id: string;
  word: string;
  status: WakeWordStatus;
  propagate_to_nodes: boolean;
  created_at: string;
  updated_at: string;
}

export interface WakeWordInsert {
  id?: string;
  user_id: string;
  word: string;
  status?: WakeWordStatus;
  propagate_to_nodes?: boolean;
}

export interface WakeWordUpdate {
  word?: string;
  status?: WakeWordStatus;
  propagate_to_nodes?: boolean;
}

export type InterruptSensitivity = 'low' | 'medium' | 'high';

export interface TalkModeSetting {
  id: string;
  user_id: string;
  node_id: string | null;
  enabled: boolean;
  interrupt_sensitivity: InterruptSensitivity;
  created_at: string;
  updated_at: string;
}

export interface TalkModeSettingInsert {
  id?: string;
  user_id: string;
  node_id?: string | null;
  enabled?: boolean;
  interrupt_sensitivity?: InterruptSensitivity;
}

export interface TalkModeSettingUpdate {
  node_id?: string | null;
  enabled?: boolean;
  interrupt_sensitivity?: InterruptSensitivity;
}

export interface TranscriptionBackend {
  id: string;
  user_id: string;
  provider_list: string[];
  cli_fallback: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscriptionBackendInsert {
  id?: string;
  user_id: string;
  provider_list?: string[];
  cli_fallback?: string | null;
}

export interface TranscriptionBackendUpdate {
  provider_list?: string[];
  cli_fallback?: string | null;
}

export interface TtsProviderSetting {
  id: string;
  user_id: string;
  provider: string;
  model: string | null;
  created_at: string;
  updated_at: string;
}

export interface TtsProviderSettingInsert {
  id?: string;
  user_id: string;
  provider?: string;
  model?: string | null;
}

export interface TtsProviderSettingUpdate {
  provider?: string;
  model?: string | null;
}

export type MediaFallbackStrategy = 'local' | 'cloud' | 'none';
export type AudioNoteHandling = 'store' | 'transcribe_and_store' | 'transcribe_only' | 'discard';

export interface MediaSetting {
  id: string;
  user_id: string;
  retention_days: number;
  size_cap_mb: number;
  fallback_strategy: MediaFallbackStrategy;
  audio_note_handling: AudioNoteHandling;
  created_at: string;
  updated_at: string;
}

export interface MediaSettingInsert {
  id?: string;
  user_id: string;
  retention_days?: number;
  size_cap_mb?: number;
  fallback_strategy?: MediaFallbackStrategy;
  audio_note_handling?: AudioNoteHandling;
}

export interface MediaSettingUpdate {
  retention_days?: number;
  size_cap_mb?: number;
  fallback_strategy?: MediaFallbackStrategy;
  audio_note_handling?: AudioNoteHandling;
}

// ========== Channels & Adapters ==========

export type ChannelProvider = 'whatsapp' | 'telegram' | 'slack' | 'discord';
export type ChannelStatus = 'active' | 'inactive' | 'error' | 'provisioning';

export interface Channel {
  id: string;
  user_id: string;
  provider: ChannelProvider;
  display_name: string | null;
  status: ChannelStatus;
  last_event_at: string | null;
  success_rate: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChannelInsert {
  id?: string;
  user_id: string;
  provider: ChannelProvider;
  display_name?: string | null;
  status?: ChannelStatus;
  last_event_at?: string | null;
  success_rate?: number;
  metadata?: Record<string, unknown>;
}

export interface ChannelUpdate {
  display_name?: string | null;
  status?: ChannelStatus;
  last_event_at?: string | null;
  success_rate?: number;
  metadata?: Record<string, unknown>;
}

export type DmPolicy = 'pairing' | 'allowlist' | 'open' | 'disabled';
export type GroupPolicy = 'mention' | 'open' | 'disabled';

export interface AdapterConfiguration {
  id: string;
  channel_id: string;
  dm_policy: DmPolicy;
  group_policy: GroupPolicy;
  mention_gating: boolean;
  webhook_url: string | null;
  polling_interval_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdapterConfigurationInsert {
  id?: string;
  channel_id: string;
  dm_policy?: DmPolicy;
  group_policy?: GroupPolicy;
  mention_gating?: boolean;
  webhook_url?: string | null;
  polling_interval_seconds?: number | null;
  metadata?: Record<string, unknown>;
}

export interface AdapterConfigurationUpdate {
  dm_policy?: DmPolicy;
  group_policy?: GroupPolicy;
  mention_gating?: boolean;
  webhook_url?: string | null;
  polling_interval_seconds?: number | null;
  metadata?: Record<string, unknown>;
}

export interface DeliveryLog {
  id: string;
  channel_id: string;
  event_type: string;
  success: boolean;
  error_details: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DeliveryLogInsert {
  id?: string;
  channel_id: string;
  event_type: string;
  success?: boolean;
  error_details?: string | null;
  metadata?: Record<string, unknown>;
}

// ========== Chat (chat_sessions, chat_messages, tool_invocations) ==========

export type ChatSessionStatus = 'active' | 'paused' | 'ended';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  status: ChatSessionStatus;
  settings: Record<string, unknown>;
  started_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionInsert {
  id?: string;
  user_id: string;
  title?: string;
  status?: ChatSessionStatus;
  settings?: Record<string, unknown>;
  started_at?: string;
}

export interface ChatSessionUpdate {
  title?: string;
  status?: ChatSessionStatus;
  settings?: Record<string, unknown>;
}

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  role: ChatMessageRole;
  text: string;
  attachment_links: { url: string; name?: string }[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessageInsert {
  id?: string;
  session_id: string;
  sender_id?: string | null;
  role?: ChatMessageRole;
  text: string;
  attachment_links?: { url: string; name?: string }[];
  metadata?: Record<string, unknown>;
}

export interface ChatMessageUpdate {
  text?: string;
  attachment_links?: { url: string; name?: string }[];
  metadata?: Record<string, unknown>;
}

export type ToolInvocationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'approved' | 'denied';

export interface ToolInvocation {
  id: string;
  session_id: string;
  message_id: string | null;
  tool_name: string;
  invocation_data: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: ToolInvocationStatus;
  run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolInvocationInsert {
  id?: string;
  session_id: string;
  message_id?: string | null;
  tool_name: string;
  invocation_data?: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  status?: ToolInvocationStatus;
  run_id?: string | null;
}

export interface ToolInvocationUpdate {
  output?: Record<string, unknown> | null;
  status?: ToolInvocationStatus;
  run_id?: string | null;
}

// ========== Dashboard (activities, runs, cron_jobs, nodes, alerts) ==========

export type ActivityType = 'message' | 'tool_run' | 'cron_run' | 'node_event' | 'alert';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ActivityInsert {
  id?: string;
  user_id: string;
  activity_type: ActivityType;
  details?: Record<string, unknown>;
}

export type RunStatus = 'running' | 'completed' | 'failed' | 'aborted';

export interface Run {
  id: string;
  user_id: string;
  status: RunStatus;
  start_time: string;
  end_time: string | null;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RunInsert {
  id?: string;
  user_id: string;
  status?: RunStatus;
  start_time?: string;
  end_time?: string | null;
  details?: Record<string, unknown>;
}

export interface RunUpdate {
  status?: RunStatus;
  end_time?: string | null;
  details?: Record<string, unknown>;
}

export type CronJobStatus = 'active' | 'paused' | 'failed';

export interface CronJob {
  id: string;
  user_id: string;
  name: string | null;
  schedule: string;
  status: CronJobStatus;
  next_run_time: string | null;
  description: string | null;
  payload: Record<string, unknown>;
  session_target: string | null;
  isolation_setting: boolean;
  created_at: string;
  updated_at: string;
}

export interface CronJobInsert {
  id?: string;
  user_id: string;
  name?: string | null;
  schedule: string;
  status?: CronJobStatus;
  next_run_time?: string | null;
  description?: string | null;
  payload?: Record<string, unknown>;
  session_target?: string | null;
  isolation_setting?: boolean;
}

export interface CronJobUpdate {
  name?: string | null;
  schedule?: string;
  status?: CronJobStatus;
  next_run_time?: string | null;
  description?: string | null;
  payload?: Record<string, unknown>;
  session_target?: string | null;
  isolation_setting?: boolean;
}

export type CronRunHistoryStatus = 'running' | 'completed' | 'failed' | 'aborted';

export interface CronRunHistory {
  id: string;
  job_id: string;
  execution_time: string;
  status: CronRunHistoryStatus;
  output: string | null;
  log: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CronRunHistoryInsert {
  id?: string;
  job_id: string;
  execution_time?: string;
  status?: CronRunHistoryStatus;
  output?: string | null;
  log?: string | null;
  metadata?: Record<string, unknown>;
}

export type NodeStatus = 'paired' | 'offline' | 'error';
export type ConnectionHealth = 'healthy' | 'degraded' | 'unknown' | 'offline';

export interface Node {
  id: string;
  user_id: string;
  name: string | null;
  status: NodeStatus;
  capabilities: string[];
  connection_health: ConnectionHealth;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeInsert {
  id?: string;
  user_id: string;
  name?: string | null;
  status?: NodeStatus;
  capabilities?: string[];
  connection_health?: ConnectionHealth;
  last_active_at?: string | null;
}

export interface NodeUpdate {
  name?: string | null;
  status?: NodeStatus;
  capabilities?: string[];
  connection_health?: ConnectionHealth;
  last_active_at?: string | null;
}

// ========== Node Capabilities (per-node capability definitions) ==========

export type NodeCapabilityStatus = 'enabled' | 'disabled' | 'pending_approval';

export interface NodeCapability {
  id: string;
  node_id: string;
  capability_key: string;
  status: NodeCapabilityStatus;
  description: string | null;
  configurations: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NodeCapabilityInsert {
  id?: string;
  node_id: string;
  capability_key: string;
  status?: NodeCapabilityStatus;
  description?: string | null;
  configurations?: Record<string, unknown>;
}

export interface NodeCapabilityUpdate {
  status?: NodeCapabilityStatus;
  description?: string | null;
  configurations?: Record<string, unknown>;
}

// ========== Node Approvals (approval workflow for remote exec / capability changes) ==========

export type NodeApprovalStatus = 'pending' | 'approved' | 'denied';

export interface NodeApproval {
  id: string;
  requester_id: string;
  node_id: string;
  capability_id: string | null;
  action_type: string;
  status: NodeApprovalStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NodeApprovalInsert {
  id?: string;
  requester_id: string;
  node_id: string;
  capability_id?: string | null;
  action_type: string;
  status?: NodeApprovalStatus;
  metadata?: Record<string, unknown>;
}

export interface NodeApprovalUpdate {
  status?: NodeApprovalStatus;
  metadata?: Record<string, unknown>;
}

// ========== Pairing Requests (temporary pairing codes for QR/code flow) ==========

export interface PairingRequest {
  id: string;
  user_id: string;
  pairing_code: string;
  expires_at: string;
  node_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PairingRequestInsert {
  id?: string;
  user_id: string;
  pairing_code: string;
  expires_at: string;
  node_id?: string | null;
  metadata?: Record<string, unknown>;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertResolutionStatus = 'open' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  user_id: string;
  node_id: string | null;
  type: string;
  severity: AlertSeverity;
  description: string;
  resolution_status: AlertResolutionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AlertInsert {
  id?: string;
  user_id: string;
  node_id?: string | null;
  type: string;
  severity: AlertSeverity;
  description: string;
  resolution_status?: AlertResolutionStatus;
  metadata?: Record<string, unknown>;
}

export interface AlertUpdate {
  resolution_status?: AlertResolutionStatus;
  metadata?: Record<string, unknown>;
}

export interface LandingFeatureRow {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingFeatureInsert {
  id?: string;
  name: string;
  description: string;
  icon_url?: string | null;
  sort_order?: number;
}

export interface LandingFeatureUpdate {
  name?: string;
  description?: string;
  icon_url?: string | null;
  sort_order?: number;
}

export interface LandingIntegrationLogoRow {
  id: string;
  provider_name: string;
  logo_url: string | null;
  category: 'chat' | 'model';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingIntegrationLogoInsert {
  id?: string;
  provider_name: string;
  logo_url?: string | null;
  category: 'chat' | 'model';
  sort_order?: number;
}

export interface LandingIntegrationLogoUpdate {
  provider_name?: string;
  logo_url?: string | null;
  category?: 'chat' | 'model';
  sort_order?: number;
}

export interface LandingPricingPlanRow {
  id: string;
  plan_name: string;
  description: string | null;
  price: string;
  features: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPricingPlanInsert {
  id?: string;
  plan_name: string;
  description?: string | null;
  price: string;
  features?: string[];
  sort_order?: number;
}

export interface LandingPricingPlanUpdate {
  plan_name?: string;
  description?: string | null;
  price?: string;
  features?: string[];
  sort_order?: number;
}

export interface PasswordResetRequest {
  id: string;
  user_id: string | null;
  request_time: string;
  status: 'requested' | 'completed' | 'expired';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PasswordResetRequestInsert {
  id?: string;
  user_id?: string | null;
  request_time?: string;
  status: 'requested' | 'completed' | 'expired';
  metadata?: Record<string, unknown>;
}

export interface PasswordResetRequestUpdate {
  user_id?: string | null;
  request_time?: string;
  status?: 'requested' | 'completed' | 'expired';
  metadata?: Record<string, unknown>;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  workspace_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id?: string;
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  workspace_path?: string | null;
}

export interface ProfileUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  workspace_path?: string | null;
}

export interface OAuthAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  status: 'active' | 'revoked';
  created_at: string;
  updated_at: string;
}

export interface OAuthAccountInsert {
  id?: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  status?: 'active' | 'revoked';
}

export interface OAuthAccountUpdate {
  status?: 'active' | 'revoked';
}

export interface DeviceSession {
  id: string;
  user_id: string;
  device_name: string;
  last_active_at: string;
  created_at: string;
}

export interface DeviceSessionInsert {
  id?: string;
  user_id: string;
  device_name: string;
  last_active_at?: string;
}

export interface DeviceSessionUpdate {
  device_name?: string;
  last_active_at?: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  scope: string;
  key_prefix: string;
  created_at: string;
}

export interface ApiKeyInsert {
  id?: string;
  user_id: string;
  name: string;
  scope: string;
  key_prefix: string;
}

export interface ApiKeyUpdate {
  name?: string;
  scope?: string;
}

export interface SecuritySetting {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  keychain_integration_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SecuritySettingInsert {
  id?: string;
  user_id: string;
  two_factor_enabled?: boolean;
  keychain_integration_enabled?: boolean;
}

export interface SecuritySettingUpdate {
  two_factor_enabled?: boolean;
  keychain_integration_enabled?: boolean;
}

// ========== Browser Automation ==========

export type BrowserProfileStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

export interface BrowserProfile {
  id: string;
  user_id: string;
  status: BrowserProfileStatus;
  footprint_path: string | null;
  is_isolated: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrowserProfileInsert {
  id?: string;
  user_id: string;
  status?: BrowserProfileStatus;
  footprint_path?: string | null;
  is_isolated?: boolean;
  metadata?: Record<string, unknown>;
}

export interface BrowserProfileUpdate {
  status?: BrowserProfileStatus;
  footprint_path?: string | null;
  is_isolated?: boolean;
  metadata?: Record<string, unknown>;
}

export interface BrowserTab {
  id: string;
  browser_profile_id: string;
  external_id: string | null;
  url: string;
  title: string | null;
  snapshot_url: string | null;
  snapshot_data: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrowserTabInsert {
  id?: string;
  browser_profile_id: string;
  external_id?: string | null;
  url?: string;
  title?: string | null;
  snapshot_url?: string | null;
  snapshot_data?: string | null;
  metadata?: Record<string, unknown>;
}

export interface BrowserTabUpdate {
  url?: string;
  title?: string | null;
  snapshot_url?: string | null;
  snapshot_data?: string | null;
  metadata?: Record<string, unknown>;
}

export type BrowserScriptStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BrowserScript {
  id: string;
  user_id: string;
  name: string;
  execution_status: BrowserScriptStatus;
  script_content: string | null;
  last_run_at: string | null;
  last_run_log: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrowserScriptInsert {
  id?: string;
  user_id: string;
  name: string;
  execution_status?: BrowserScriptStatus;
  script_content?: string | null;
  last_run_at?: string | null;
  last_run_log?: string | null;
  metadata?: Record<string, unknown>;
}

export interface BrowserScriptUpdate {
  name?: string;
  execution_status?: BrowserScriptStatus;
  script_content?: string | null;
  last_run_at?: string | null;
  last_run_log?: string | null;
  metadata?: Record<string, unknown>;
}

export type BrowserCaptureType = 'screenshot' | 'pdf' | 'dom';

export interface BrowserCaptureRecord {
  id: string;
  browser_profile_id: string;
  capture_type: BrowserCaptureType;
  file_path: string | null;
  file_url: string | null;
  tab_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BrowserCaptureRecordInsert {
  id?: string;
  browser_profile_id: string;
  capture_type: BrowserCaptureType;
  file_path?: string | null;
  file_url?: string | null;
  tab_id?: string | null;
  metadata?: Record<string, unknown>;
}

export type BrowserCdpConnectionType = 'local' | 'node_proxy';

export interface BrowserCdpToken {
  id: string;
  user_id: string;
  browser_profile_id: string | null;
  connection_type: BrowserCdpConnectionType;
  token_preview: string | null;
  config_json: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrowserCdpTokenInsert {
  id?: string;
  user_id: string;
  browser_profile_id?: string | null;
  connection_type?: BrowserCdpConnectionType;
  token_preview?: string | null;
  config_json?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface BrowserCdpTokenUpdate {
  browser_profile_id?: string | null;
  connection_type?: BrowserCdpConnectionType;
  token_preview?: string | null;
  config_json?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type BrowserCommandType =
  | 'click'
  | 'type'
  | 'select'
  | 'navigate'
  | 'scroll'
  | 'wait'
  | 'screenshot';

export type BrowserCommandStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface BrowserCommand {
  id: string;
  browser_profile_id: string;
  command_type: BrowserCommandType;
  parameters: Record<string, unknown>;
  sequence_order: number;
  status: BrowserCommandStatus;
  result_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrowserCommandInsert {
  id?: string;
  browser_profile_id: string;
  command_type: BrowserCommandType;
  parameters?: Record<string, unknown>;
  sequence_order?: number;
  status?: BrowserCommandStatus;
  result_message?: string | null;
}

export interface BrowserCommandUpdate {
  command_type?: BrowserCommandType;
  parameters?: Record<string, unknown>;
  sequence_order?: number;
  status?: BrowserCommandStatus;
  result_message?: string | null;
}

// ========== Privacy Policy ==========

export interface PrivacyPolicySetting {
  id: string;
  user_id: string;
  telemetry_opt_out: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicySettingInsert {
  id?: string;
  user_id: string;
  telemetry_opt_out?: boolean;
}

export interface PrivacyPolicySettingUpdate {
  telemetry_opt_out?: boolean;
}

export type PolicyDocumentType = 'privacy' | 'terms';

export interface PolicyDocument {
  id: string;
  document_type: PolicyDocumentType;
  version: string;
  content: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyDocumentInsert {
  id?: string;
  document_type?: PolicyDocumentType;
  version: string;
  content: string;
  effective_date: string;
}

export interface PolicyDocumentUpdate {
  version?: string;
  content?: string;
  effective_date?: string;
}

// ========== Secrets & Keychain ==========

export type SecretStorageMethod = 'os_keychain' | 'onepassword' | 'encrypted_fallback';

export interface Secret {
  id: string;
  user_id: string;
  name: string;
  encrypted_value: string | null;
  storage_method: SecretStorageMethod;
  key_reference: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SecretInsert {
  id?: string;
  user_id: string;
  name: string;
  encrypted_value?: string | null;
  storage_method?: SecretStorageMethod;
  key_reference?: string | null;
  metadata?: Record<string, unknown>;
}

export interface SecretUpdate {
  name?: string;
  encrypted_value?: string | null;
  storage_method?: SecretStorageMethod;
  key_reference?: string | null;
  metadata?: Record<string, unknown>;
}

export interface SecretAuditLog {
  id: string;
  user_id: string;
  secret_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface SecretAuditLogInsert {
  id?: string;
  user_id: string;
  secret_id?: string | null;
  action: string;
  details?: Record<string, unknown>;
}

// ========== Model Provider Abstraction ==========

export type ModelProviderSlug =
  | 'openai'
  | 'anthropic'
  | 'local'
  | 'ollama'
  | 'vllm'
  | 'custom';

export type ModelProviderStatus = 'active' | 'inactive' | 'error';

export interface ModelProvider {
  id: string;
  user_id: string;
  name: string;
  slug: ModelProviderSlug;
  api_endpoint_base: string | null;
  supported_features: Record<string, unknown>;
  is_default: boolean;
  priority: number;
  status: ModelProviderStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ModelProviderInsert {
  id?: string;
  user_id: string;
  name: string;
  slug: ModelProviderSlug;
  api_endpoint_base?: string | null;
  supported_features?: Record<string, unknown>;
  is_default?: boolean;
  priority?: number;
  status?: ModelProviderStatus;
  metadata?: Record<string, unknown>;
}

export interface ModelProviderUpdate {
  name?: string;
  slug?: ModelProviderSlug;
  api_endpoint_base?: string | null;
  supported_features?: Record<string, unknown>;
  is_default?: boolean;
  priority?: number;
  status?: ModelProviderStatus;
  metadata?: Record<string, unknown>;
}

export type ModelRequestStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ModelRequest {
  id: string;
  user_id: string;
  provider_id: string | null;
  status: ModelRequestStatus;
  request_metadata: Record<string, unknown>;
  response_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ModelRequestInsert {
  id?: string;
  user_id: string;
  provider_id?: string | null;
  status?: ModelRequestStatus;
  request_metadata?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
}

export interface ModelRequestUpdate {
  provider_id?: string | null;
  status?: ModelRequestStatus;
  request_metadata?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
}

export interface UsageMetric {
  id: string;
  user_id: string;
  request_id: string;
  provider_id: string | null;
  token_count_input: number;
  token_count_output: number;
  created_at: string;
}

export interface UsageMetricInsert {
  id?: string;
  user_id: string;
  request_id: string;
  provider_id?: string | null;
  token_count_input?: number;
  token_count_output?: number;
}

export interface ConfigurationOverride {
  id: string;
  user_id: string;
  request_id: string;
  model_name: string | null;
  temperature: number | null;
  max_tokens: number | null;
  parameters: Record<string, unknown>;
  created_at: string;
}

export interface ConfigurationOverrideInsert {
  id?: string;
  user_id: string;
  request_id: string;
  model_name?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  parameters?: Record<string, unknown>;
}

export interface ConfigurationOverrideUpdate {
  model_name?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  parameters?: Record<string, unknown>;
}

// ========== Admin & Analytics ==========

export type AdminWorkspaceStatus = 'active' | 'archived' | 'suspended';

export interface AdminWorkspace {
  id: string;
  name: string;
  active_users_count: number;
  configuration_details: Record<string, unknown>;
  status: AdminWorkspaceStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminWorkspaceInsert {
  id?: string;
  name: string;
  active_users_count?: number;
  configuration_details?: Record<string, unknown>;
  status?: AdminWorkspaceStatus;
}

export interface AdminWorkspaceUpdate {
  name?: string;
  active_users_count?: number;
  configuration_details?: Record<string, unknown>;
  status?: AdminWorkspaceStatus;
}

export type AdminWorkspaceMemberRole = 'admin' | 'member' | 'viewer';

export interface AdminWorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: AdminWorkspaceMemberRole;
  created_at: string;
  updated_at: string;
}

export interface AdminWorkspaceMemberInsert {
  id?: string;
  workspace_id: string;
  user_id: string;
  role?: AdminWorkspaceMemberRole;
}

export interface AdminWorkspaceMemberUpdate {
  role?: AdminWorkspaceMemberRole;
}

export type AdminLicenseType = 'seat' | 'pro' | 'enterprise' | 'trial';

export interface AdminLicense {
  id: string;
  workspace_id: string;
  user_id: string | null;
  license_type: AdminLicenseType;
  expiry_date: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminLicenseInsert {
  id?: string;
  workspace_id: string;
  user_id?: string | null;
  license_type: AdminLicenseType;
  expiry_date?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AdminLicenseUpdate {
  user_id?: string | null;
  license_type?: AdminLicenseType;
  expiry_date?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AdminAnalyticsMetric {
  id: string;
  workspace_id: string | null;
  metric_type: string;
  value: number;
  bucket_time: string;
  dimensions: Record<string, unknown>;
  created_at: string;
}

export interface AdminAnalyticsMetricInsert {
  id?: string;
  workspace_id?: string | null;
  metric_type: string;
  value: number;
  bucket_time: string;
  dimensions?: Record<string, unknown>;
}

// ========== Payments & Marketplace ==========

export type MarketplaceSkillStatus = 'active' | 'archived';

export interface MarketplaceSkill {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  currency: string;
  provider_id: string | null;
  image_url: string | null;
  is_subscription: boolean;
  status: MarketplaceSkillStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceSkillInsert {
  id?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price?: number;
  currency?: string;
  provider_id?: string | null;
  image_url?: string | null;
  is_subscription?: boolean;
  status?: MarketplaceSkillStatus;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceSkillUpdate {
  name?: string;
  description?: string | null;
  category?: string | null;
  price?: number;
  currency?: string;
  provider_id?: string | null;
  image_url?: string | null;
  is_subscription?: boolean;
  status?: MarketplaceSkillStatus;
  metadata?: Record<string, unknown>;
}

export type MarketplaceTransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface MarketplaceTransaction {
  id: string;
  user_id: string;
  skill_id: string;
  amount: number;
  currency: string;
  status: MarketplaceTransactionStatus;
  stripe_payment_id: string | null;
  stripe_subscription_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceTransactionInsert {
  id?: string;
  user_id: string;
  skill_id: string;
  amount: number;
  currency?: string;
  status?: MarketplaceTransactionStatus;
  stripe_payment_id?: string | null;
  stripe_subscription_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceTransactionUpdate {
  status?: MarketplaceTransactionStatus;
  stripe_payment_id?: string | null;
  stripe_subscription_id?: string | null;
  metadata?: Record<string, unknown>;
}

export type MarketplaceLicenseActivationStatus = 'active' | 'inactive' | 'expired';

export interface MarketplaceLicense {
  id: string;
  user_id: string;
  skill_id: string;
  transaction_id: string | null;
  activation_status: MarketplaceLicenseActivationStatus;
  expiration_date: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceLicenseInsert {
  id?: string;
  user_id: string;
  skill_id: string;
  transaction_id?: string | null;
  activation_status?: MarketplaceLicenseActivationStatus;
  expiration_date?: string | null;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceLicenseUpdate {
  activation_status?: MarketplaceLicenseActivationStatus;
  expiration_date?: string | null;
  metadata?: Record<string, unknown>;
}

// ========== About / Help ==========

export interface HelpFaq {
  id: string;
  question_text: string;
  answer_text: string;
  category: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HelpFaqInsert {
  id?: string;
  question_text: string;
  answer_text: string;
  category?: string | null;
  sort_order?: number;
}

export interface HelpFaqUpdate {
  question_text?: string;
  answer_text?: string;
  category?: string | null;
  sort_order?: number;
}

export interface HelpDocLink {
  id: string;
  title: string;
  url: string;
  category: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HelpDocLinkInsert {
  id?: string;
  title: string;
  url: string;
  category?: string | null;
  sort_order?: number;
}

export interface HelpDocLinkUpdate {
  title?: string;
  url?: string;
  category?: string | null;
  sort_order?: number;
}

export type SupportRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  issue_description: string;
  context_info: Record<string, unknown>;
  status: SupportRequestStatus;
  created_at: string;
}

export interface SupportRequestInsert {
  id?: string;
  user_id?: string | null;
  name: string;
  email: string;
  issue_description: string;
  context_info?: Record<string, unknown>;
  status?: SupportRequestStatus;
}

export interface SupportRequestUpdate {
  status?: SupportRequestStatus;
}

export interface HelpChangelogEntry {
  id: string;
  version_number: string | null;
  date: string;
  description: string;
  created_at: string;
}

export interface HelpChangelogEntryInsert {
  id?: string;
  version_number?: string | null;
  date: string;
  description: string;
}

export interface HelpChangelogEntryUpdate {
  version_number?: string | null;
  date?: string;
  description?: string;
}
