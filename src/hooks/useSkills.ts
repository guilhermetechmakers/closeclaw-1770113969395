import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { skillsApi, librarySkillsApi, type RegistrySkillItem, type RegistryListParams } from '@/api/skills';
import type { SkillInsert, SkillUpdate, LibrarySkillInsert, LibrarySkillUpdate } from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const SKILLS_KEYS = {
  all: ['skills'] as const,
  list: (params?: { status?: string }) =>
    [...SKILLS_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...SKILLS_KEYS.all, 'detail', id] as const,
  testRuns: (skillId: string, params?: { limit?: number }) =>
    [...SKILLS_KEYS.all, 'test-runs', skillId, params] as const,
  testRun: (skillId: string, runId: string) =>
    [...SKILLS_KEYS.all, 'test-run', skillId, runId] as const,
  versions: (skillId: string) =>
    [...SKILLS_KEYS.all, 'versions', skillId] as const,
  gating: (skillId: string) =>
    [...SKILLS_KEYS.all, 'gating', skillId] as const,
};

export function useSkillsList(params?: { status?: string }) {
  return useQuery({
    queryKey: SKILLS_KEYS.list(params),
    queryFn: () => safeGet(() => skillsApi.list(params), []),
  });
}

export function useSkill(id: string | null) {
  return useQuery({
    queryKey: SKILLS_KEYS.detail(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => skillsApi.get(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SkillInsert) => skillsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.list() });
      toast.success('Skill created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create skill');
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SkillUpdate }) =>
      skillsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.detail(id) });
      toast.success('Skill saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save skill');
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.list() });
      toast.success('Skill deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete skill');
    },
  });
}

export function useSkillTestRuns(skillId: string | null, params?: { limit?: number }) {
  return useQuery({
    queryKey: SKILLS_KEYS.testRuns(skillId ?? '', params),
    queryFn: () =>
      skillId
        ? safeGet(() => skillsApi.getTestRuns(skillId, params), [])
        : Promise.resolve([]),
    enabled: !!skillId,
  });
}

export function useRunSkillTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      skillId,
      payload,
    }: {
      skillId: string;
      payload?: { env?: Record<string, string> };
    }) => skillsApi.runTest(skillId, payload),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.testRuns(skillId) });
      toast.success('Test run started');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to run skill test');
    },
  });
}

export function useSkillVersions(skillId: string | null) {
  return useQuery({
    queryKey: SKILLS_KEYS.versions(skillId ?? ''),
    queryFn: () =>
      skillId
        ? safeGet(() => skillsApi.getVersions(skillId), [])
        : Promise.resolve([]),
    enabled: !!skillId,
  });
}

export function useCheckGating(skillId: string | null) {
  return useQuery({
    queryKey: SKILLS_KEYS.gating(skillId ?? ''),
    queryFn: () =>
      skillId
        ? skillsApi.checkRequirements(skillId)
        : Promise.resolve({ passed: true, requirements: [] }),
    enabled: !!skillId,
  });
}

export function useCommitSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      skillId,
      message,
      sign,
    }: {
      skillId: string;
      message?: string;
      sign?: boolean;
    }) => skillsApi.commit(skillId, { message, sign }),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.detail(skillId) });
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.versions(skillId) });
      toast.success('Changes committed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to commit');
    },
  });
}

// ========== Skills Library (installed from registry) ==========

export const LIBRARY_SKILLS_KEYS = {
  all: ['library-skills'] as const,
  list: () => [...LIBRARY_SKILLS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...LIBRARY_SKILLS_KEYS.all, 'detail', id] as const,
  registry: (params?: RegistryListParams) =>
    [...LIBRARY_SKILLS_KEYS.all, 'registry', params] as const,
};

export function useLibrarySkillsList() {
  return useQuery({
    queryKey: LIBRARY_SKILLS_KEYS.list(),
    queryFn: () => safeGet(() => librarySkillsApi.list(), []),
  });
}

export function useLibrarySkill(id: string | null) {
  return useQuery({
    queryKey: LIBRARY_SKILLS_KEYS.detail(id ?? ''),
    queryFn: () =>
      id ? safeGet(() => librarySkillsApi.get(id), null) : Promise.resolve(null),
    enabled: !!id,
  });
}

export function useInstallLibrarySkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<LibrarySkillInsert, 'user_id'>) =>
      librarySkillsApi.install(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_SKILLS_KEYS.list() });
      toast.success('Skill installed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to install skill');
    },
  });
}

export function useUpdateLibrarySkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LibrarySkillUpdate }) =>
      librarySkillsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_SKILLS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: LIBRARY_SKILLS_KEYS.detail(id) });
      toast.success('Skill updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update skill');
    },
  });
}

export function useSetLibrarySkillEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      librarySkillsApi.setEnabled(id, enabled),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_SKILLS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: LIBRARY_SKILLS_KEYS.detail(id) });
      toast.success('Skill status updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update skill status');
    },
  });
}

export function useUninstallLibrarySkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => librarySkillsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_SKILLS_KEYS.list() });
      toast.success('Skill uninstalled');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to uninstall skill');
    },
  });
}

/** Registry browser: list from API; falls back to mock list when API is unavailable */
const MOCK_REGISTRY: RegistrySkillItem[] = [
  {
    id: 'gmail-watcher',
    name: 'Gmail Watcher',
    version: '1.0.0',
    registry_slug: 'gmail-watcher',
    description: 'Watch Gmail via Pub/Sub and deliver events to chat.',
    readme_content: '# Gmail Watcher\n\nUses Gmail Pub/Sub. Requires env: `GMAIL_CREDENTIALS`, `GMAIL_TOPIC`.\n',
    frontmatter: { permissions: ['network'], env: ['GMAIL_CREDENTIALS', 'GMAIL_TOPIC'] },
    permissions: ['network'],
    binary_requirements: [],
    environment_requirements: ['GMAIL_CREDENTIALS', 'GMAIL_TOPIC'],
    popularity: 95,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'url-summarizer',
    name: 'URL Summarizer',
    version: '1.0.0',
    registry_slug: 'url-summarizer',
    description: 'Fetch a URL and summarize content via browser tool.',
    readme_content: '# URL Summarizer\n\nUses browser automation. No extra env required.\n',
    frontmatter: { permissions: ['browser'] },
    permissions: ['browser'],
    binary_requirements: [],
    environment_requirements: [],
    popularity: 88,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cron-reminder',
    name: 'Cron Reminder',
    version: '1.0.0',
    registry_slug: 'cron-reminder',
    description: 'Schedule reminders and deliver to chat.',
    readme_content: '# Cron Reminder\n\nSchedule cron jobs. No extra env.\n',
    frontmatter: { permissions: [] },
    permissions: [],
    binary_requirements: [],
    environment_requirements: [],
    popularity: 72,
    updated_at: new Date().toISOString(),
  },
];

export function useRegistrySkills(params?: RegistryListParams) {
  return useQuery({
    queryKey: LIBRARY_SKILLS_KEYS.registry(params),
    queryFn: async () => {
      try {
        return await librarySkillsApi.registry(params);
      } catch {
        let list = [...MOCK_REGISTRY];
        const search = params?.search?.toLowerCase();
        if (search) {
          list = list.filter(
            (s) =>
              s.name.toLowerCase().includes(search) ||
              s.registry_slug.toLowerCase().includes(search)
          );
        }
        const sort = params?.sort ?? 'popularity';
        if (sort === 'name') {
          list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'recent') {
          list.sort((a, b) => (b.updated_at > a.updated_at ? 1 : -1));
        } else {
          list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
        }
        return list;
      }
    },
  });
}
