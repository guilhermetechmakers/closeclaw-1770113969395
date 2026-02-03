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
    };
  };
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
