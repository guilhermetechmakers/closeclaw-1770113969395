import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { voiceApi } from '@/api/voice';
import type {
  WakeWordInsert,
  WakeWordUpdate,
  TalkModeSettingInsert,
  TalkModeSettingUpdate,
  TranscriptionBackendInsert,
  TranscriptionBackendUpdate,
  TtsProviderSettingInsert,
  TtsProviderSettingUpdate,
  MediaSettingInsert,
  MediaSettingUpdate,
} from '@/types/database';

function safeGet<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback);
}

export const VOICE_KEYS = {
  all: ['voice'] as const,
  wakeWords: () => [...VOICE_KEYS.all, 'wakeWords'] as const,
  talkModeSettings: () => [...VOICE_KEYS.all, 'talkModeSettings'] as const,
  talkModeSetting: (nodeId: string | null) => [...VOICE_KEYS.all, 'talkModeSetting', nodeId] as const,
  transcriptionBackends: () => [...VOICE_KEYS.all, 'transcriptionBackends'] as const,
  ttsProviderSetting: () => [...VOICE_KEYS.all, 'ttsProviderSetting'] as const,
  mediaSetting: () => [...VOICE_KEYS.all, 'mediaSetting'] as const,
};

export function useWakeWords() {
  return useQuery({
    queryKey: VOICE_KEYS.wakeWords(),
    queryFn: () => safeGet(() => voiceApi.getWakeWords(), []),
  });
}

export function useCreateWakeWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<WakeWordInsert, 'user_id'>) => voiceApi.createWakeWord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.wakeWords() });
      toast.success('Wake word added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add wake word');
    },
  });
}

export function useUpdateWakeWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WakeWordUpdate }) =>
      voiceApi.updateWakeWord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.wakeWords() });
      toast.success('Wake word updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update wake word');
    },
  });
}

export function useDeleteWakeWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voiceApi.deleteWakeWord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.wakeWords() });
      toast.success('Wake word removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove wake word');
    },
  });
}

export function useTalkModeSettings() {
  return useQuery({
    queryKey: VOICE_KEYS.talkModeSettings(),
    queryFn: () => safeGet(() => voiceApi.getTalkModeSettings(), []),
  });
}

export function useTalkModeSetting(nodeId: string | null) {
  return useQuery({
    queryKey: VOICE_KEYS.talkModeSetting(nodeId),
    queryFn: () => voiceApi.getTalkModeSetting(nodeId),
    enabled: true,
  });
}

export function useUpsertTalkModeSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<TalkModeSettingInsert, 'user_id'>) =>
      voiceApi.upsertTalkModeSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.talkModeSettings() });
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.all });
      toast.success('Talk mode saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save talk mode');
    },
  });
}

export function useUpdateTalkModeSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TalkModeSettingUpdate }) =>
      voiceApi.updateTalkModeSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.talkModeSettings() });
      toast.success('Talk mode updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update talk mode');
    },
  });
}

export function useTranscriptionBackends() {
  return useQuery({
    queryKey: VOICE_KEYS.transcriptionBackends(),
    queryFn: () => voiceApi.getTranscriptionBackends(),
  });
}

export function useUpsertTranscriptionBackends() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<TranscriptionBackendInsert, 'user_id'>) =>
      voiceApi.upsertTranscriptionBackends(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.transcriptionBackends() });
      toast.success('Transcription backends saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save transcription backends');
    },
  });
}

export function useUpdateTranscriptionBackends() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TranscriptionBackendUpdate) =>
      voiceApi.updateTranscriptionBackends(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.transcriptionBackends() });
      toast.success('Transcription backends updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update transcription backends');
    },
  });
}

export function useTtsProviderSetting() {
  return useQuery({
    queryKey: VOICE_KEYS.ttsProviderSetting(),
    queryFn: () => voiceApi.getTtsProviderSetting(),
  });
}

export function useUpsertTtsProviderSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<TtsProviderSettingInsert, 'user_id'>) =>
      voiceApi.upsertTtsProviderSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.ttsProviderSetting() });
      toast.success('TTS provider saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save TTS provider');
    },
  });
}

export function useUpdateTtsProviderSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TtsProviderSettingUpdate) =>
      voiceApi.updateTtsProviderSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.ttsProviderSetting() });
      toast.success('TTS provider updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update TTS provider');
    },
  });
}

export function useMediaSetting() {
  return useQuery({
    queryKey: VOICE_KEYS.mediaSetting(),
    queryFn: () => voiceApi.getMediaSetting(),
  });
}

export function useUpsertMediaSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<MediaSettingInsert, 'user_id'>) =>
      voiceApi.upsertMediaSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.mediaSetting() });
      toast.success('Media settings saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save media settings');
    },
  });
}

export function useUpdateMediaSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MediaSettingUpdate) => voiceApi.updateMediaSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOICE_KEYS.mediaSetting() });
      toast.success('Media settings updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update media settings');
    },
  });
}
