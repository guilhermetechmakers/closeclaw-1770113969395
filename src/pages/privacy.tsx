import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import {
  usePrivacySettings,
  useUpdatePrivacySettings,
  usePolicyDocument,
} from '@/hooks/usePrivacy';
import { PreferencesModal } from '@/components/privacy/preferences-modal';
import { DownloadConfirmationDialog } from '@/components/privacy/download-confirmation-dialog';

/** Default policy content when no document is in the database (local-first, telemetry, third-party). */
const DEFAULT_PRIVACY_SECTIONS = [
  {
    id: 'intro',
    title: 'Introduction',
    content:
      'Clawgate is a local-first, chat-native personal agent platform. This policy explains how we handle your data when you use the Control UI and optional cloud-linked features. We are committed to transparency and putting you in control.',
  },
  {
    id: 'data-collection',
    title: 'Data collection',
    content:
      'When you use local-only mode, data stays on your devices. We do not collect or transmit personal data from your gateway. If you link a cloud account, we store only what is necessary to provide that service (e.g. profile, session tokens). Optional telemetry—anonymous usage and diagnostic data—may be collected only if you have not opted out. We do not sell your data.',
  },
  {
    id: 'storage',
    title: 'Storage and local-first',
    content:
      'Session transcripts, skill definitions, cron jobs, and node pairings are stored locally by default. Cloud-backed features (e.g. sync, backup) store only what you explicitly enable. Credentials and long-lived tokens are stored in your system keychain or an encrypted fallback when available.',
  },
  {
    id: 'retention',
    title: 'Retention',
    content:
      'Local data is retained according to your settings (e.g. log retention, media caps). Cloud-stored data is retained only as long as your account is active and in line with our terms. You can request deletion of cloud data at any time.',
  },
  {
    id: 'third-party',
    title: 'Third-party services and APIs',
    content:
      'Channel adapters (e.g. Telegram, Slack) and model providers (e.g. OpenAI, Anthropic) process data according to their policies when you use those integrations. We pass only the minimum data required. We recommend reviewing each provider’s privacy policy.',
  },
];

function PolicySection({
  id,
  title,
  content,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      id={id}
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 py-4 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 -mx-1">
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span>{title}</span>
      </summary>
      <div className="prose prose-invert prose-sm max-w-none pb-4 pl-6 text-muted-foreground">
        <p className="m-0 leading-relaxed">{content}</p>
      </div>
    </details>
  );
}

export function Privacy() {
  const { data: settings, isLoading: settingsLoading } = usePrivacySettings();
  const updateSettings = useUpdatePrivacySettings();
  const { data: policyDoc } = usePolicyDocument('privacy');

  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [pendingTelemetryOptOut, setPendingTelemetryOptOut] = useState<boolean | null>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const telemetryOptOut = settings?.telemetry_opt_out ?? false;

  const handleTelemetryToggle = useCallback(
    (checked: boolean) => {
      setPendingTelemetryOptOut(checked);
      setPreferencesModalOpen(true);
    },
    []
  );

  const handleConfirmPreferences = useCallback(() => {
    if (pendingTelemetryOptOut === null) return;
    updateSettings.mutate(
      { telemetry_opt_out: pendingTelemetryOptOut },
      {
        onSuccess: () => setPendingTelemetryOptOut(null),
      }
    );
  }, [pendingTelemetryOptOut, updateSettings]);

  const policyContent =
    policyDoc?.content ??
    DEFAULT_PRIVACY_SECTIONS.map((s) => `${s.title}\n\n${s.content}`).join('\n\n');

  const policySections = policyDoc?.content
    ? [{ id: 'policy', title: 'Full policy', content: policyDoc.content }]
    : DEFAULT_PRIVACY_SECTIONS;

  const handleDownload = useCallback(() => {
    const blob = new Blob([policyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privacy-policy.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [policyContent]);

  const handleOpenInNewTab = useCallback(() => {
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Privacy Policy - Clawgate</title><style>body{font-family:Inter,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#e2e8f0;} h1{font-size:1.75rem;} h2{font-size:1.25rem;margin-top:1.5rem;} p{white-space:pre-wrap;}</style></head><body><h1>Privacy Policy</h1><p>${policyContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p></body></html>`,
      ],
      { type: 'text/html;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [policyContent]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in-up">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            How we collect, store, and use your data. Clawgate is local-first; your data stays on
            your devices unless you use cloud-linked features.
          </p>
        </header>

        {/* Policy text with sections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Policy sections</CardTitle>
            <CardDescription>
              Expand each section for details on data collection, storage, retention, and
              third-party services.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="divide-y-0">
              {policySections.map((section, i) => (
                <PolicySection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  content={section.content}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opt-out controls (only show when user can be authenticated; optional) */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">Opt-out controls</CardTitle>
            </div>
            <CardDescription>
              Manage your data collection preferences. Changes are saved to your account and
              reflected in Settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="telemetry-opt-out" className="text-sm font-medium text-foreground">
                  Opt out of telemetry
                </Label>
                <p className="text-xs text-muted-foreground">
                  When on, we do not send anonymous usage or diagnostic data from your account.
                </p>
              </div>
              <Switch
                id="telemetry-opt-out"
                checked={telemetryOptOut}
                onCheckedChange={handleTelemetryToggle}
                disabled={settingsLoading}
                aria-describedby="telemetry-opt-out-description"
              />
            </div>
            {settingsLoading && (
              <p id="telemetry-opt-out-description" className="mt-2 text-xs text-muted-foreground">
                Loading preferences…
              </p>
            )}
          </CardContent>
        </Card>

        {/* Download policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Download policy</CardTitle>
            <CardDescription>
              Save a copy for your records or open in a new tab to print or save as PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setDownloadDialogOpen(true)}
              className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download Privacy Policy
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Back to home</Link>
            </Button>
            <nav className="flex flex-wrap gap-6">
              <Link
                to="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Help &amp; support
              </Link>
            </nav>
          </div>
        </footer>
      </div>

      {/* Preferences confirmation modal */}
      <PreferencesModal
        open={preferencesModalOpen}
        onOpenChange={setPreferencesModalOpen}
        telemetryOptOut={pendingTelemetryOptOut ?? telemetryOptOut}
        onConfirm={handleConfirmPreferences}
        isUpdating={updateSettings.isPending}
      />

      {/* Download confirmation dialog */}
      <DownloadConfirmationDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        onDownload={handleDownload}
        onOpenInNewTab={handleOpenInNewTab}
        title="Download Privacy Policy"
        description="Save a copy for your records. You can open it in a new tab to print or save as PDF using your browser."
      />
    </div>
  );
}
