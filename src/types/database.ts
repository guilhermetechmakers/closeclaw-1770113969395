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
      nodes: { Row: Node; Insert: NodeInsert; Update: NodeUpdate };
      alerts: { Row: Alert; Insert: AlertInsert; Update: AlertUpdate };
      chat_sessions: { Row: ChatSession; Insert: ChatSessionInsert; Update: ChatSessionUpdate };
      chat_messages: { Row: ChatMessage; Insert: ChatMessageInsert; Update: ChatMessageUpdate };
      tool_invocations: { Row: ToolInvocation; Insert: ToolInvocationInsert; Update: ToolInvocationUpdate };
      channels: { Row: Channel; Insert: ChannelInsert; Update: ChannelUpdate };
      adapter_configurations: { Row: AdapterConfiguration; Insert: AdapterConfigurationInsert; Update: AdapterConfigurationUpdate };
      delivery_logs: { Row: DeliveryLog; Insert: DeliveryLogInsert };
    };
  };
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
  schedule: string;
  status: CronJobStatus;
  next_run_time: string | null;
  description: string | null;
  payload: Record<string, unknown>;
  session_target: string | null;
  created_at: string;
  updated_at: string;
}

export interface CronJobInsert {
  id?: string;
  user_id: string;
  schedule: string;
  status?: CronJobStatus;
  next_run_time?: string | null;
  description?: string | null;
  payload?: Record<string, unknown>;
  session_target?: string | null;
}

export interface CronJobUpdate {
  schedule?: string;
  status?: CronJobStatus;
  next_run_time?: string | null;
  description?: string | null;
  payload?: Record<string, unknown>;
  session_target?: string | null;
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
}

export interface NodeUpdate {
  name?: string | null;
  status?: NodeStatus;
  capabilities?: string[];
  connection_health?: ConnectionHealth;
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
