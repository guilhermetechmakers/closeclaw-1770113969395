import { api } from '@/lib/api';
import type {
  Profile,
  ProfileUpdate,
  OAuthAccount,
  DeviceSession,
  ApiKey,
  SecuritySetting,
  SecuritySettingUpdate,
} from '@/types/database';

const PROFILE_BASE = '/profile';

export interface ProfileWithEmail extends Profile {
  email?: string;
}

export const profileApi = {
  getProfile: () =>
    api.get(`${PROFILE_BASE}`) as Promise<ProfileWithEmail | null>,
  updateProfile: (data: ProfileUpdate) =>
    api.patch(`${PROFILE_BASE}`, data) as Promise<Profile>,

  getOAuthAccounts: () =>
    api.get(`${PROFILE_BASE}/oauth-accounts`) as Promise<OAuthAccount[]>,
  unlinkOAuthAccount: (id: string) =>
    api.delete(`${PROFILE_BASE}/oauth-accounts/${id}`),

  getDeviceSessions: () =>
    api.get(`${PROFILE_BASE}/sessions`) as Promise<DeviceSession[]>,
  revokeSession: (id: string) =>
    api.delete(`${PROFILE_BASE}/sessions/${id}`),

  getApiKeys: () =>
    api.get(`${PROFILE_BASE}/api-keys`) as Promise<ApiKey[]>,
  createApiKey: (data: { name: string; scope: string }) =>
    api.post(`${PROFILE_BASE}/api-keys`, data) as Promise<{
      id: string;
      key: string;
      key_prefix: string;
    }>,
  revokeApiKey: (id: string) =>
    api.delete(`${PROFILE_BASE}/api-keys/${id}`),

  getSecuritySettings: () =>
    api.get(`${PROFILE_BASE}/security-settings`) as Promise<SecuritySetting | null>,
  updateSecuritySettings: (data: SecuritySettingUpdate) =>
    api.patch(`${PROFILE_BASE}/security-settings`, data) as Promise<SecuritySetting>,
};
