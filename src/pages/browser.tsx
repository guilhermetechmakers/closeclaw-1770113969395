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
  List,
  Upload,
  EyeOff,
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
  useBrowserCdpTokens,
  useCreateBrowserCdpToken,
} from '@/hooks/useBrowser';
import { ProfileStartStopModal } from '@/components/browser/profile-start-stop-modal';
import { TabDetailsDialog } from '@/components/browser/tab-details-dialog';
import { ScriptUploadForm } from '@/components/browser/script-upload-form';
import { CaptureConfirmationDialog } from '@/components/browser/capture-confirmation-dialog';
import { CdpConfigDialog } from '@/components/browser/cdp-config-dialog';
import type { BrowserTab, BrowserCaptureType } from '@/types/database';

const PROFILE_STATUS_LABELS: Record<string, string> = {
  running: 'Running',
  stopped: 'Stopped',
  starting: 'Starting…',
  stopping: 'Stopping…',
  error: 'Error',
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

  const { data: profiles = [], isLoading: profilesLoading } = useBrowserProfiles();
  const activeProfile = useMemo(
    () => profiles.find((p) => p.status === 'running') ?? profiles[0] ?? null,
    [profiles]
  );
  const currentProfileId = selectedProfileId ?? activeProfile?.id ?? null;
  const { data: currentProfile } = useBrowserProfile(currentProfileId);
  const { data: tabs = [], isLoading: tabsLoading, refetch: refetchTabs } = useBrowserTabs(currentProfileId);
  const { data: scripts = [], isLoading: scriptsLoading } = useBrowserScripts();
  const { data: captures = [] } = useBrowserCaptureRecords(currentProfileId, { limit: 10 });
  const { data: cdpTokens = [] } = useBrowserCdpTokens();

  const updateProfile = useUpdateBrowserProfile();
  const createProfile = useCreateBrowserProfile();
  const createScript = useCreateBrowserScript();
  const createCapture = useCreateBrowserCaptureRecord();
  const createCdpToken = useCreateBrowserCdpToken();

  const isProfileRunning = currentProfile?.status === 'running';

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

  return (
    <div className="mx-auto max-w-content space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Browser Automation Console</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage Chromium profile, inspect tabs, run automations, and capture screenshots or PDFs.
        </p>
      </header>

      {/* Managed Profile Controls */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="h-5 w-5 text-primary" />
            Managed Profile Controls
          </CardTitle>
          <CardDescription>
            Start or stop the managed Chromium profile. Profile footprint and isolation are shown below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profilesLoading ? (
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-6 flex-1 min-w-[200px] rounded" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                {profiles.length > 0 && (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={currentProfileId ?? ''}
                    onChange={(e) => setSelectedProfileId(e.target.value || null)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        Profile {p.id.slice(0, 8)}… — {PROFILE_STATUS_LABELS[p.status] ?? p.status}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  size="sm"
                  onClick={() => handleProfileAction('start')}
                  disabled={!currentProfileId || isProfileRunning || updateProfile.isPending}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Play className="mr-1 h-4 w-4" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProfileAction('stop')}
                  disabled={!currentProfileId || !isProfileRunning || updateProfile.isPending}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Square className="mr-1 h-4 w-4" />
                  Stop
                </Button>
              </div>
              {currentProfile && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {currentProfile.footprint_path && (
                    <span className="truncate font-mono" title={currentProfile.footprint_path}>
                      Path: {currentProfile.footprint_path}
                    </span>
                  )}
                  <Badge variant={currentProfile.is_isolated ? 'default' : 'secondary'} className="shrink-0">
                    {currentProfile.is_isolated ? 'Isolated' : 'Not isolated'}
                  </Badge>
                </div>
              )}
              {profiles.length === 0 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="text-sm text-muted-foreground">
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
                  >
                    {createProfile.isPending ? 'Creating…' : 'Create profile'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Tab Inspector */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Tab Inspector
            </CardTitle>
            {currentProfileId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchTabs()}
                disabled={tabsLoading || !isProfileRunning}
              >
                <RefreshCw className={cn('h-4 w-4', tabsLoading && 'animate-spin')} />
                <span className="ml-1 sr-only sm:not-sr-only">Refresh</span>
              </Button>
            )}
          </div>
          <CardDescription>
            Open tabs with snapshot thumbnails. Click a tab for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentProfileId ? (
            <p className="text-sm text-muted-foreground">Select or start a profile to inspect tabs.</p>
          ) : tabsLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : tabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <List className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No tabs</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isProfileRunning ? 'Open pages in the managed browser or refresh.' : 'Start the profile to see tabs.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                      <img
                        src={tab.snapshot_url}
                        alt=""
                        className="h-20 w-full object-cover object-top"
                      />
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

      {/* Automation Runner */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5 text-primary" />
              Automation Runner
            </CardTitle>
            <Button size="sm" onClick={() => setScriptFormOpen(true)} className="transition-transform hover:scale-[1.02]">
              <Upload className="mr-1 h-4 w-4" />
              Add script
            </Button>
          </div>
          <CardDescription>
            Upload and run automation scripts. Actions are logged deterministically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scriptsLoading ? (
            <ul className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </ul>
          ) : scripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No scripts</p>
              <p className="text-sm text-muted-foreground mt-1">Add a script to run automations against the profile.</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => setScriptFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add script
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {scripts.map((script) => (
                <li
                  key={script.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2"
                >
                  <span className="font-medium truncate">{script.name}</span>
                  <Badge variant="secondary">{script.execution_status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Capture Tools */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="h-5 w-5 text-primary" />
            Capture Tools
          </CardTitle>
          <CardDescription>
            Screenshot, full-page PDF, or DOM snapshot of the current view.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleCapture('screenshot')}
            disabled={!currentProfileId || !isProfileRunning || createCapture.isPending}
            className="transition-transform hover:scale-[1.02]"
          >
            <Image className="mr-2 h-4 w-4" />
            Screenshot
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCapture('pdf')}
            disabled={!currentProfileId || !isProfileRunning || createCapture.isPending}
            className="transition-transform hover:scale-[1.02]"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCapture('dom')}
            disabled={!currentProfileId || !isProfileRunning || createCapture.isPending}
            className="transition-transform hover:scale-[1.02]"
          >
            <Code className="mr-2 h-4 w-4" />
            DOM snapshot
          </Button>
          {!currentProfileId && (
            <p className="text-sm text-muted-foreground self-center">Start a profile to capture.</p>
          )}
        </CardContent>
        {captures.length > 0 && (
          <CardContent className="border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Recent captures</p>
            <ul className="flex flex-wrap gap-2">
              {captures.slice(0, 5).map((c) => (
                <Badge key={c.id} variant="outline">
                  {c.capture_type} — {new Date(c.created_at).toLocaleDateString()}
                </Badge>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* CDP Connector Settings */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              CDP Connector Settings
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setCdpDialogOpen(true)} className="transition-transform hover:scale-[1.02]">
              <Plus className="mr-1 h-4 w-4" />
              Add connector
            </Button>
          </div>
          <CardDescription>
            Local or node proxy CDP settings. Tokens are stored with sensitive data redacted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cdpTokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <EyeOff className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No CDP connectors</p>
              <p className="text-sm text-muted-foreground mt-1">Add a connector to use remote CDP or node proxy.</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => setCdpDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add connector
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {cdpTokens.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2"
                >
                  <span className="font-mono text-sm">{t.token_preview || t.connection_type}</span>
                  <Badge variant="secondary">{t.connection_type}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

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
      <TabDetailsDialog
        open={tabDetailsOpen}
        onOpenChange={setTabDetailsOpen}
        tab={selectedTab}
      />
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
    </div>
  );
}
