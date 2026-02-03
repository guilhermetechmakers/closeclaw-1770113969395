import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mic,
  Plus,
  Pencil,
  Trash2,
  Settings,
  HelpCircle,
  ChevronRight,
  ListOrdered,
  Speaker,
} from 'lucide-react';
import { useWakeWords, useCreateWakeWord, useUpdateWakeWord, useDeleteWakeWord } from '@/hooks/useVoice';
import { useTalkModeSettings, useUpsertTalkModeSetting } from '@/hooks/useVoice';
import { useTranscriptionBackends, useUpsertTranscriptionBackends } from '@/hooks/useVoice';
import { useTtsProviderSetting, useUpsertTtsProviderSetting } from '@/hooks/useVoice';
import { useMediaSetting, useUpsertMediaSetting } from '@/hooks/useVoice';
import { useNodes } from '@/hooks/useDashboard';
import { WakeWordsModal } from '@/components/voice/wake-words-modal';
import { TalkModeForm } from '@/components/voice/talk-mode-form';
import { TranscriptionBackendDialog } from '@/components/voice/transcription-backend-dialog';
import { TtsProviderDialog } from '@/components/voice/tts-provider-dialog';
import { MediaSettingsForm } from '@/components/voice/media-settings-form';
import { cn } from '@/lib/utils';
import type { WakeWord } from '@/types/database';

export function Voice() {
  const [wakeModalOpen, setWakeModalOpen] = useState(false);
  const [editingWakeWord, setEditingWakeWord] = useState<WakeWord | null>(null);
  const [transcriptionDialogOpen, setTranscriptionDialogOpen] = useState(false);
  const [ttsDialogOpen, setTtsDialogOpen] = useState(false);

  const { data: wakeWords = [], isLoading: wakeWordsLoading } = useWakeWords();
  const createWake = useCreateWakeWord();
  const updateWake = useUpdateWakeWord();
  const deleteWake = useDeleteWakeWord();

  const { data: talkSettings = [], isLoading: talkSettingsLoading } = useTalkModeSettings();
  const upsertTalkMode = useUpsertTalkModeSetting();
  const defaultTalkSetting = talkSettings.find((s) => s.node_id === null) ?? null;

  const { data: nodes = [] } = useNodes();
  const { data: transcription, isLoading: transcriptionLoading } = useTranscriptionBackends();
  const upsertTranscription = useUpsertTranscriptionBackends();

  const { data: ttsSetting, isLoading: ttsLoading } = useTtsProviderSetting();
  const upsertTts = useUpsertTtsProviderSetting();

  const { data: mediaSetting, isLoading: mediaLoading } = useMediaSetting();
  const upsertMedia = useUpsertMediaSetting();

  const handleOpenAddWake = () => {
    setEditingWakeWord(null);
    setWakeModalOpen(true);
  };

  const handleOpenEditWake = (w: WakeWord) => {
    setEditingWakeWord(w);
    setWakeModalOpen(true);
  };

  const handleWakeSubmit = (data: { word: string; status: 'active' | 'inactive'; propagate_to_nodes: boolean }) => {
    if (editingWakeWord) {
      updateWake.mutate(
        { id: editingWakeWord.id, data: { word: data.word, status: data.status, propagate_to_nodes: data.propagate_to_nodes } },
        { onSuccess: () => setWakeModalOpen(false) }
      );
    } else {
      createWake.mutate(
        { word: data.word, status: data.status, propagate_to_nodes: data.propagate_to_nodes },
        { onSuccess: () => setWakeModalOpen(false) }
      );
    }
  };

  const handleTalkModeSave = (data: {
    node_id: string | null;
    enabled: boolean;
    interrupt_sensitivity: 'low' | 'medium' | 'high';
  }) => {
    upsertTalkMode.mutate({
      node_id: data.node_id,
      enabled: data.enabled,
      interrupt_sensitivity: data.interrupt_sensitivity,
    });
  };

  const handleTranscriptionSave = (providerList: string[], cliFallback: string | null) => {
    upsertTranscription.mutate({ provider_list: providerList, cli_fallback: cliFallback });
  };

  const handleTtsSave = (data: { provider: string; model: string | null }) => {
    upsertTts.mutate({ provider: data.provider, model: data.model });
  };

  const handleMediaSave = (data: {
    retention_days: number;
    size_cap_mb: number;
    fallback_strategy: 'local' | 'cloud' | 'none';
    audio_note_handling: 'store' | 'transcribe_and_store' | 'transcribe_only' | 'discard';
  }) => {
    upsertMedia.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header + breadcrumb */}
      <header className="space-y-2">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground font-medium">Voice & Media</span>
        </nav>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Mic className="h-7 w-7 text-primary" aria-hidden />
          Voice & Media
        </h1>
        <p className="text-muted-foreground">
          Configure wake words, talk mode, transcription, TTS, and media storage.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          {/* Wake words */}
          <Card className="transition-shadow duration-200 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Wake words</CardTitle>
                <CardDescription>
                  Voice activation phrases; optionally propagated to nodes.
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleOpenAddWake}
                className="shrink-0 transition-transform hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {wakeWordsLoading ? (
                <Skeleton className="h-24 w-full rounded-lg" />
              ) : wakeWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                  <Mic className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No wake words configured</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleOpenAddWake}>
                    Add wake word
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {wakeWords.map((w) => (
                    <li
                      key={w.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{w.word}</span>
                        <Badge variant={w.status === 'active' ? 'success' : 'secondary'}>
                          {w.status}
                        </Badge>
                        {w.propagate_to_nodes && (
                          <span className="text-muted-foreground text-xs">→ nodes</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEditWake(w)}
                          aria-label="Edit wake word"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteWake.mutate(w.id)}
                          aria-label="Delete wake word"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Talk mode */}
          {talkSettingsLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <TalkModeForm
              nodes={nodes}
              settings={talkSettings}
              defaultSetting={defaultTalkSetting}
              onSave={handleTalkModeSave}
              isSubmitting={upsertTalkMode.isPending}
            />
          )}

          {/* Transcription backends */}
          <Card className="transition-shadow duration-200 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  Transcription backends
                </CardTitle>
                <CardDescription>
                  Provider order and CLI fallback for voice-to-text.
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setTranscriptionDialogOpen(true)}
                className="shrink-0 transition-transform hover:scale-[1.02]"
              >
                Edit order
              </Button>
            </CardHeader>
            <CardContent>
              {transcriptionLoading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : !transcription ? (
                <p className="text-sm text-muted-foreground">
                  No backends configured. Use default order or set your preference.
                </p>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Order: {transcription.provider_list?.length ? transcription.provider_list.join(' → ') : 'default'}
                  </p>
                  {transcription.cli_fallback && (
                    <p className="text-muted-foreground">
                      CLI fallback: <code className="rounded bg-secondary px-1">{transcription.cli_fallback}</code>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TTS provider */}
          <Card className="transition-shadow duration-200 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Speaker className="h-5 w-5 text-primary" />
                  TTS provider
                </CardTitle>
                <CardDescription>
                  Text-to-speech provider and model for voice output.
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setTtsDialogOpen(true)}
                className="shrink-0 transition-transform hover:scale-[1.02]"
              >
                Configure
              </Button>
            </CardHeader>
            <CardContent>
              {ttsLoading ? (
                <Skeleton className="h-12 w-full rounded-lg" />
              ) : ttsSetting ? (
                <p className="text-sm">
                  <span className="font-medium">{ttsSetting.provider}</span>
                  {ttsSetting.model && (
                    <span className="text-muted-foreground"> / {ttsSetting.model}</span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Default (system)</p>
              )}
            </CardContent>
          </Card>

          {/* Media storage */}
          {mediaLoading ? (
            <Skeleton className="h-80 w-full rounded-lg" />
          ) : (
            <MediaSettingsForm
              initial={mediaSetting ?? null}
              onSave={handleMediaSave}
              isSubmitting={upsertMedia.isPending}
            />
          )}
        </div>

        {/* Sidebar: related + help */}
        <aside className="space-y-4 lg:order-last">
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Related</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Settings className="h-4 w-4 shrink-0" />
                Settings
              </Link>
              <Link
                to="/nodes"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Nodes
              </Link>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Help
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to="/help"
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Docs &amp; quick start
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Modals / dialogs */}
      <WakeWordsModal
        open={wakeModalOpen}
        onOpenChange={setWakeModalOpen}
        onSubmit={handleWakeSubmit}
        isSubmitting={createWake.isPending || updateWake.isPending}
        initial={editingWakeWord}
      />
      <TranscriptionBackendDialog
        open={transcriptionDialogOpen}
        onOpenChange={setTranscriptionDialogOpen}
        providerList={transcription?.provider_list ?? []}
        cliFallback={transcription?.cli_fallback ?? null}
        onSave={handleTranscriptionSave}
        isSubmitting={upsertTranscription.isPending}
      />
      <TtsProviderDialog
        open={ttsDialogOpen}
        onOpenChange={setTtsDialogOpen}
        onSubmit={handleTtsSave}
        isSubmitting={upsertTts.isPending}
        initialProvider={ttsSetting?.provider ?? 'default'}
        initialModel={ttsSetting?.model ?? null}
      />
    </div>
  );
}
