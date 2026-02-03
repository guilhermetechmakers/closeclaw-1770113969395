import { api } from '@/lib/api';
import type {
  Skill,
  SkillInsert,
  SkillUpdate,
  SkillTestRun,
  SkillVersion,
  SkillVersionInsert,
  LibrarySkill,
  LibrarySkillInsert,
  LibrarySkillUpdate,
} from '@/types/database';

const SKILLS_BASE = '/skills';
const LIBRARY_SKILLS_BASE = '/library-skills';

export interface GatingCheckResult {
  passed: boolean;
  requirements: { id: string; label: string; met: boolean; message?: string }[];
}

export interface RunSkillResult {
  run_id: string;
  status: SkillTestRun['status'];
  logs?: string | null;
  outputs?: Record<string, unknown>;
}

export const skillsApi = {
  list: (params?: { status?: string }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<Skill[]>(
      `${SKILLS_BASE}${search ? `?${search}` : ''}`
    );
  },
  get: (id: string) =>
    api.get<Skill | null>(`${SKILLS_BASE}/${id}`),
  create: (data: SkillInsert) =>
    api.post<Skill>(SKILLS_BASE, data),
  update: (id: string, data: SkillUpdate) =>
    api.patch<Skill>(`${SKILLS_BASE}/${id}`, data),
  delete: (id: string) =>
    api.delete(`${SKILLS_BASE}/${id}`),

  getTestRuns: (skillId: string, params?: { limit?: number }) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)] as [string, string])
        ).toString()
      : '';
    return api.get<SkillTestRun[]>(
      `${SKILLS_BASE}/${skillId}/test-runs${search ? `?${search}` : ''}`
    );
  },
  getTestRun: (skillId: string, runId: string) =>
    api.get<SkillTestRun | null>(`${SKILLS_BASE}/${skillId}/test-runs/${runId}`),
  runTest: (skillId: string, payload?: { env?: Record<string, string> }) =>
    api.post<RunSkillResult>(`${SKILLS_BASE}/${skillId}/test-run`, payload ?? {}),
  abortTestRun: (skillId: string, runId: string) =>
    api.post<SkillTestRun>(`${SKILLS_BASE}/${skillId}/test-runs/${runId}/abort`, {}),

  checkRequirements: (skillId: string) =>
    api.get<GatingCheckResult>(`${SKILLS_BASE}/${skillId}/check-requirements`),

  getVersions: (skillId: string) =>
    api.get<SkillVersion[]>(`${SKILLS_BASE}/${skillId}/versions`),
  createVersion: (skillId: string, data: Omit<SkillVersionInsert, 'skill_id' | 'user_id'>) =>
    api.post<SkillVersion>(`${SKILLS_BASE}/${skillId}/versions`, data),

  commit: (skillId: string, payload: { message?: string; sign?: boolean }) =>
    api.post<{ version_id: string; version_number: string }>(
      `${SKILLS_BASE}/${skillId}/commit`,
      payload
    ),
};

// ========== Skills Library (installed from registry) ==========

export interface RegistrySkillItem {
  id: string;
  name: string;
  version: string;
  registry_slug: string;
  description: string | null;
  readme_content: string;
  frontmatter: Record<string, unknown>;
  permissions: string[];
  binary_requirements: string[];
  environment_requirements: string[];
  popularity?: number;
  updated_at: string;
}

export interface RegistryListParams {
  search?: string;
  sort?: 'popularity' | 'recent' | 'name';
}

export const librarySkillsApi = {
  list: () =>
    api.get<LibrarySkill[]>(LIBRARY_SKILLS_BASE),
  get: (id: string) =>
    api.get<LibrarySkill | null>(`${LIBRARY_SKILLS_BASE}/${id}`),
  install: (data: Omit<LibrarySkillInsert, 'user_id'>) =>
    api.post<LibrarySkill>(LIBRARY_SKILLS_BASE, data),
  update: (id: string, data: LibrarySkillUpdate) =>
    api.patch<LibrarySkill>(`${LIBRARY_SKILLS_BASE}/${id}`, data),
  delete: (id: string) =>
    api.delete(`${LIBRARY_SKILLS_BASE}/${id}`),
  setEnabled: (id: string, enabled: boolean) =>
    api.patch<LibrarySkill>(`${LIBRARY_SKILLS_BASE}/${id}`, { enabled }),

  registry: (params?: RegistryListParams) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([_, v]) => v != null) as [string, string][]
        ).toString()
      : '';
    return api.get<RegistrySkillItem[]>(
      `${LIBRARY_SKILLS_BASE}/registry${search ? `?${search}` : ''}`
    );
  },
  checkProvenance: (registrySlug: string, version: string) =>
    api.get<{ verified: boolean; message?: string }>(
      `${LIBRARY_SKILLS_BASE}/registry/provenance?slug=${encodeURIComponent(registrySlug)}&version=${encodeURIComponent(version)}`
    ),
};
