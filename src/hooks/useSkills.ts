import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { skillsApi } from '@/api/skills';
import type { SkillInsert, SkillUpdate } from '@/types/database';

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
