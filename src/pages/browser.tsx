import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Square,
  RefreshCw,
  Plus,
  Image,
  FileText,
  Code,
  Settings,
  Monitor,
  LayoutGrid,
  Upload,
  EyeOff,
  MousePointer,
  GripVertical,
  ChevronRight,
  Activity,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useBrowserProfiles,
  useBrowserProfile,
  useUpdateBrowserProfile,
  useCreateBrowserProfile,
  useBrowserTabs,
  useBrowserScripts,
  useCreateBrowserScript,
  useBrowserCaptureRecords,
  useCreateBrowserCaptureRecord,
  useDeleteBrowserCaptureRecord,
  useBrowserCdpTokens,
  useCreateBrowserCdpToken,
  useBrowserCommands,
  useCreateBrowserCommand,
  useDeleteBrowserCommand,
} from '@/hooks/useBrowser';
import { ProfileStartStopModal } from '@/components/browser/profile-start-stop-modal';
import { TabDetailsDialog } from '@/components/browser/tab-details-dialog';
import { ScriptUploadForm } from '@/components/browser/script-upload-form';
import { CaptureConfirmationDialog } from '@/components/browser/capture-confirmation-dialog';
import { CdpConfigDialog } from '@/components/browser/cdp-config-dialog';
import { CommandInputDialog } from '@/components/browser/command-input-dialog';
import { OutputManagementSheet } from '@/components/browser/output-management-sheet';
import type { BrowserTab, BrowserCaptureType, BrowserCommand, BrowserCommandType } from '@/types/database';

const PROFILE_STATUS_LABELS: Record<string, string> = {
  running: 'Running',
  stopped: 'Stopped',
  starting: 'Starting…',
  stopping: 'Stopping…',
  error: 'Error',
};

const COMMAND_TYPE_LABELS: Record<BrowserCommandType, string> = {
  click: 'Click',
  type: 'Type',
  select: 'Select',
  navigate: 'Navigate',
  scroll: 'Scroll',
  wait: 'Wait',
  screenshot: 'Screenshot',
};

export function Browser() {
  const [profileModal, setProfileModal] = useState<{ open: boolean; action: 'start' | 'stop' } | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<BrowserTab | null>(null);
  const [tabDetailsOpen, setTabDetailsOpen] = useState(false);
  const [scriptFormOpen, setScriptFormOpen] = useState(false);
  const [captureConfirm, setCaptureConfirm] = useState<{
    open: boolean;
    type: BrowserCaptureType;
    fileUrl?: string | null;
    filePath?: string | null;
  } | null>(null);
  const [cdpDialogOpen, setCdpDialogOpen] = useState(false);
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [outputSheetOpen, setOutputSheetOpen] = useState(false);

  const { data: profiles = [], isLoading: profilesLoading } = useBrowserProfiles();
  const activeProfile = useMemo(
    () => profiles.find((p) => p.status === 'running') ?? profiles[0] ?? null,
    [profiles]
  );
  const currentProfileId = selectedProfileId ?? activeProfile?.id ?? null;
  const { data: currentProfile } = useBrowserProfile(currentProfileId);
  const { data: tabs = [], isLoading: tabsLoading, refetch: refetchTabs } = useBrowserTabs(currentProfileId);
  const { data: scripts = [], isLoading: scriptsLoading } = useBrowserScripts();
  const { data: captures = [] } = useBrowserCaptureRecords(currentProfileId, { limit: 20 });
  const { data: cdpTokens = [] } = useBrowserCdpTokens();
  const { data: commands = [], isLoading: commandsLoading } = useBrowserCommands(currentProfileId);

  const updateProfile = useUpdateBrowserProfile();
  const createProfile = useCreateBrowserProfile();
  const createScript = useCreateBrowserScript();
  const createCapture = useCreateBrowserCaptureRecord();
  const deleteCapture = useDeleteBrowserCaptureRecord();
  const createCdpToken = useCreateBrowserCdpToken();
  const createCommand = useCreateBrowserCommand();
  const deleteCommand = useDeleteBrowserCommand();

  const isProfileRunning = currentProfile?.status === 'running';
  const nextSequenceOrder = useMemo(
    () => (commands.length === 0 ? 0 : Math.max(...commands.map((c) => c.sequence_order), 0) + 1),
    [commands]
  );

  const handleProfileAction = (action: 'start' | 'stop') => {
    if (!currentProfileId) return;
    setProfileModal({ open: true, action });
  };

  const confirmProfileAction = () => {
    if (!profileModal || !currentProfileId) return;
    const status = profileModal.action === 'start' ? 'running' : 'stopped';
    updateProfile.mutate(
      { id: currentProfileId, data: { status } },
      { onSettled: () => setProfileModal(null) }
    );
  };

  const handleCapture = (type: BrowserCaptureType) => {
    if (!currentProfileId) return;
    createCapture.mutate(
      {
        browser_profile_id: currentProfileId,
        capture_type: type,
        file_path: null,
        file_url: `/api/browser/captures/${type}-${Date.now()}`,
        tab_id: null,
      },
      {
        onSuccess: (record) => {
          setCaptureConfirm({
            open: true,
            type,
            fileUrl: record.file_url,
            filePath: record.file_path,
          });
        },
      }
    );
  };

  const handleDownloadCapture = (record: { file_url?: string | null; capture_type: BrowserCaptureType }) => {
    if (record.file_url) {
      const a = document.createElement('a');
      a.href = record.file_url;
      a.download = `capture-${record.capture_type}-${Date.now()}`;
      a.click();
    }
  };

  const actionLogEntries = useMemo(() => {
    const entries: { id: string; label: string; time: string; createdAt: string }[] = [];
    commands.slice(0, 5).forEach((c) => {
      entries.push({
        id: c.id,
        label: `${COMMAND_TYPE_LABELS[c.command_type]} — ${c.status}`,
        time: new Date(c.created_at).toLocaleTimeString(),
        createdAt: c.created_at,
      });
    });
    captures.slice(0, 3).forEach((c) => {
      entries.push({
        id: c.id,
        label: `Capture: ${c.capture_type}`,
        time: new Date(c.created_at).toLocaleTimeString(),
        createdAt: c.created_at,
      });
    });
    return entries
      .sort((a, b) => (b.createdAt.localeCompare(a.createdAt)))
      .slice(0, 8)
      .map(({ id, label, time }) => ({ id, label, time }));
  }, [commands, captures]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <header className="shrink-0 mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Browser Automation Console</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Managed Chromium profile, command queue, and capture tools. Control your session from the footer.
        </p>
      </header>

      {/* Main: Command Queue | Viewport | Output Capture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Command Queue Panel */}
        <Card className="lg:col-span-3 shadow-card transition-shadow hover:shadow-card-hover flex flex-col min-h-[280px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GripVertical className="h-5 w-5 text-primary" />
                Command Queue
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setCommandDialogOpen(true)}
                disabled={!currentProfileId || createCommand.isPending}
                className="transition-transform hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <CardDescription>
              Add and manage automation commands. They run in sequence.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {!currentProfileId ? (
              <p className="text-sm text-muted-foreground">Select or create a profile to add commands.</p>
            ) : commandsLoading ? (
              <ul className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </ul>
            ) : commands.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed border-border py-8 text-center">
                <MousePointer className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">No commands in queue</p>
                <p className="text-sm text-muted-foreground mt-1">Add a command to run automations.</p>
                <Button
                  className="mt-3 transition-transform hover:scale-[1.02]"
                  variant="outline"
                  size="sm"
                  onClick={() => setCommandDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add command
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-1 px-1">
                <ul className="space-y-1">
                  {commands.map((cmd: BrowserCommand) => (
                    <li
                      key={cmd.id}
                      className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5 group"
                    >
                      <span className="text-xs text-muted-foreground w-6 shrink-0">{cmd.sequence_order + 1}</span>
                      <span className="truncate text-sm flex-1">{COMMAND_TYPE_LABELS[cmd.command_type]}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">{cmd.status}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteCommand.mutate(cmd.id)}
                        disabled={deleteCommand.isPending}
                        aria-label="Remove command"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Center: Browser Viewport */}
        <Card className="lg:col-span-6 shadow-card transition-shadow hover:shadow-card-hover flex flex-col min-h-[280px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5 text-primary" />
                Browser Viewport
              </CardTitle>
              {currentProfileId && (
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={currentProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value || null)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        Profile — {PROFILE_STATUS_LABELS[p.status] ?? p.status}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => handleProfileAction('start')}
                    disabled={isProfileRunning || updateProfile.isPending}
                    className="transition-transform hover:scale-[1.02]"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProfileAction('stop')}
                    disabled={!isProfileRunning || updateProfile.isPending}
                    className="transition-transform hover:scale-[1.02]"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchTabs()}
                    disabled={tabsLoading || !isProfileRunning}
                  >
                    <RefreshCw className={cn('h-4 w-4', tabsLoading && 'animate-spin')} />
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              Tab inspector and active session. Start the profile to see tabs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {!currentProfileId ? (
              <p className="text-sm text-muted-foreground">Create a profile to start.</p>
            ) : tabsLoading ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : tabs.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed border-border py-12 text-center">
                <LayoutGrid className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">No tabs</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isProfileRunning ? 'Open pages in the managed browser or refresh.' : 'Start the profile to see tabs.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="grid gap-2 sm:grid-cols-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedTab(tab);
                        setTabDetailsOpen(true);
                      }}
                      className="flex flex-col overflow-hidden rounded-lg border border-border bg-secondary/30 text-left transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {tab.snapshot_url ? (
                        <img src={tab.snapshot_url} alt="" className="h-20 w-full object-cover object-top" />
                      ) : (
                        <div className="flex h-20 w-full items-center justify-center bg-muted">
                          <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="truncate text-sm font-medium" title={tab.title ?? tab.url}>
                          {tab.title || tab.url || 'Untitled'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground" title={tab.url}>
                          {tab.url || '—'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right: Output Capture Panel */}
        <Card className="lg:col-span-3 shadow-card transition-shadow hover:shadow-card-hover flex flex-col min-h-[280px]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-5 w-5 text-primary" />
              Output Capture
            </CardTitle>
            <CardDescription>
              Screenshot, PDF, or DOM snapshot. View and manage captures below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCapture('screenshot')}
                disabled={!currentProfileId || !isProfileRunning || createCapture.isPending}
                className="transition-transform hover:scale-[1.02]"
              >
                <Image className="h-4 w-4 mr-1" />
                Screenshot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCapture('pdf')}
                disabled={!currentProfileId || !isProfileRunning || createCapture.isPending}
                className="transition-transform hover:scale-[1.02]"
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCapture('dom')}
                disabled={!currentProfileId || !isProfileRunning || createCapture.isPending}
                className="transition-transform hover:scale-[1.02]"
              >
                <Code className="h-4 w-4 mr-1" />
                DOM
              </Button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Recent</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOutputSheetOpen(true)}
                  className="text-primary hover:text-primary"
                >
                  Manage
                  <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
              {captures.length === 0 ? (
                <p className="text-sm text-muted-foreground">No captures yet.</p>
              ) : (
                <ScrollArea className="flex-1">
                  <ul className="space-y-1">
                    {captures.slice(0, 5).map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-2 py-1.5 text-sm"
                      >
                        <span>{c.capture_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer: Session controls + Action log */}
      <footer className="shrink-0 mt-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Session</span>
            {profiles.length > 0 && currentProfileId && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleProfileAction('start')}
                  disabled={isProfileRunning || updateProfile.isPending}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProfileAction('stop')}
                  disabled={!isProfileRunning || updateProfile.isPending}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </>
            )}
            {profiles.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  createProfile.mutate({
                    status: 'stopped',
                    is_isolated: true,
                  })
                }
                disabled={createProfile.isPending}
              >
                {createProfile.isPending ? 'Creating…' : 'Create profile'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
            <ScrollArea className="max-w-full">
              <div className="flex gap-2 text-xs text-muted-foreground">
                {actionLogEntries.length === 0 ? (
                  <span>No activity yet</span>
                ) : (
                  actionLogEntries.map((e) => (
                    <span key={e.id} className="shrink-0 whitespace-nowrap" title={e.time}>
                      {e.label}
                    </span>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </footer>

      {/* Managed Profile creation when none */}
      {!profilesLoading && profiles.length === 0 && (
        <Card className="mt-4 shadow-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">
              No profile yet. Create a default profile to start the managed browser.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                createProfile.mutate({
                  status: 'stopped',
                  is_isolated: true,
                })
              }
              disabled={createProfile.isPending}
              className="transition-transform hover:scale-[1.02]"
            >
              {createProfile.isPending ? 'Creating…' : 'Create profile'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Automation Runner & CDP (compact section) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="shadow-card transition-shadow hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Code className="h-4 w-4 text-primary" />
                Automation Runner
              </CardTitle>
              <Button size="sm" onClick={() => setScriptFormOpen(true)} className="transition-transform hover:scale-[1.02]">
                <Upload className="h-4 w-4 mr-1" />
                Add script
              </Button>
            </div>
            <CardDescription>Upload and run automation scripts.</CardDescription>
          </CardHeader>
          <CardContent>
            {scriptsLoading ? (
              <Skeleton className="h-10 rounded-md" />
            ) : scripts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scripts. Add one to run automations.</p>
            ) : (
              <ul className="space-y-1">
                {scripts.slice(0, 3).map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{s.name}</span>
                    <Badge variant="secondary">{s.execution_status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-card transition-shadow hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4 text-primary" />
                CDP Connector
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setCdpDialogOpen(true)} className="transition-transform hover:scale-[1.02]">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <CardDescription>Local or node proxy CDP settings.</CardDescription>
          </CardHeader>
          <CardContent>
            {cdpTokens.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                No CDP connectors. Add one for remote CDP.
              </div>
            ) : (
              <ul className="space-y-1">
                {cdpTokens.slice(0, 3).map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono truncate">{t.token_preview || t.connection_type}</span>
                    <Badge variant="secondary">{t.connection_type}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals / Dialogs */}
      {profileModal && (
        <ProfileStartStopModal
          open={profileModal.open}
          onOpenChange={(open) => !open && setProfileModal(null)}
          action={profileModal.action}
          onConfirm={confirmProfileAction}
          isPending={updateProfile.isPending}
          profilePath={currentProfile?.footprint_path}
          isIsolated={currentProfile?.is_isolated}
        />
      )}
      <TabDetailsDialog open={tabDetailsOpen} onOpenChange={setTabDetailsOpen} tab={selectedTab} />
      <ScriptUploadForm
        open={scriptFormOpen}
        onOpenChange={setScriptFormOpen}
        onSubmit={(data) => createScript.mutate(data)}
        isSubmitting={createScript.isPending}
      />
      {captureConfirm && (
        <CaptureConfirmationDialog
          open={captureConfirm.open}
          onOpenChange={(open) => !open && setCaptureConfirm(null)}
          captureType={captureConfirm.type}
          fileUrl={captureConfirm.fileUrl}
          filePath={captureConfirm.filePath}
        />
      )}
      <CdpConfigDialog
        open={cdpDialogOpen}
        onOpenChange={setCdpDialogOpen}
        existing={null}
        onSubmit={(data) => createCdpToken.mutate(data as Omit<import('@/types/database').BrowserCdpTokenInsert, 'user_id'>)}
        isSubmitting={createCdpToken.isPending}
      />
      <CommandInputDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
        browserProfileId={currentProfileId}
        nextSequenceOrder={nextSequenceOrder}
        onSubmit={(data) => createCommand.mutate(data)}
        isSubmitting={createCommand.isPending}
      />
      <OutputManagementSheet
        open={outputSheetOpen}
        onOpenChange={setOutputSheetOpen}
        captures={captures}
        onDownload={handleDownloadCapture}
        onDelete={(id) => deleteCapture.mutate(id)}
        isDeleting={deleteCapture.isPending}
      />
    </div>
  );
}
