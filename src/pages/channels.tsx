import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  MessageCircle,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  Send,
  ExternalLink,
  MoreHorizontal,
  BookOpen,
  HelpCircle,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useChannels,
  useChannel,
  useAdapterConfig,
  useDeliveryLogs,
  useCreateChannel,
  useDeleteChannel,
  useUpsertAdapterConfig,
  useSendTestMessage,
} from '@/hooks/useChannels';
import type { Channel, ChannelProvider, ChannelStatus, DeliveryLog } from '@/types/database';
import { AddChannelWizard, type AddChannelWizardPayload } from '@/components/channels/add-channel-wizard';
import { ChannelPolicyDialog } from '@/components/channels/channel-policy-dialog';
import { DeliveryErrorDialog } from '@/components/channels/delivery-error-dialog';
import { DeleteChannelDialog } from '@/components/channels/delete-channel-dialog';

const providerLabels: Record<ChannelProvider, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  slack: 'Slack',
  discord: 'Discord',
};

const statusVariants: Record<ChannelStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  active: 'success',
  inactive: 'secondary',
  error: 'destructive',
  provisioning: 'warning',
};

const SUPPORTED_PLATFORMS: ChannelProvider[] = ['whatsapp', 'telegram', 'slack', 'discord'];

export function Channels() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardInitialProvider, setWizardInitialProvider] = useState<ChannelProvider | undefined>();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [errorLog, setErrorLog] = useState<DeliveryLog | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const { data: selectedChannel } = useChannel(selectedChannelId);
  const { data: adapterConfig } = useAdapterConfig(selectedChannelId);
  const { data: deliveryLogs = [] } = useDeliveryLogs(selectedChannelId, { limit: 50 });

  const createChannel = useCreateChannel();
  const deleteChannel = useDeleteChannel();
  const upsertConfig = useUpsertAdapterConfig();
  const sendTestMessage = useSendTestMessage();

  const openWizard = (provider?: ChannelProvider) => {
    setWizardInitialProvider(provider);
    setWizardOpen(true);
  };

  const handleWizardSubmit = async (payload: AddChannelWizardPayload) => {
    const channel = await createChannel.mutateAsync({
      provider: payload.provider,
      display_name: payload.display_name,
      status: 'provisioning',
    });
    await upsertConfig.mutateAsync({
      channel_id: channel.id,
      dm_policy: 'pairing',
      group_policy: 'mention',
      mention_gating: true,
      webhook_url: payload.webhook_url ?? null,
      polling_interval_seconds: payload.polling_interval_seconds ?? null,
    });
    setSelectedChannelId(channel.id);
    setWizardOpen(false);
    setWizardInitialProvider(undefined);
  };

  const handlePolicySubmit = (data: {
    dm_policy: 'pairing' | 'allowlist' | 'open' | 'disabled';
    group_policy: 'mention' | 'open' | 'disabled';
    mention_gating: boolean;
  }) => {
    if (!selectedChannelId) return;
    upsertConfig.mutate({
      channel_id: selectedChannelId,
      dm_policy: data.dm_policy,
      group_policy: data.group_policy,
      mention_gating: data.mention_gating,
    });
  };

  const handleShowError = (log: DeliveryLog) => {
    setErrorLog(log);
    setErrorDialogOpen(true);
  };

  const handleRemoveClick = (ch: Channel) => {
    setChannelToDelete(ch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!channelToDelete) return;
    deleteChannel.mutate(channelToDelete.id);
    if (selectedChannelId === channelToDelete.id) setSelectedChannelId(null);
    setChannelToDelete(null);
  };

  const handleSendTestMessage = () => {
    if (!selectedChannelId || !testMessage.trim()) return;
    sendTestMessage.mutate(
      { channelId: selectedChannelId, content: testMessage.trim() },
      { onSuccess: () => setTestMessage('') }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header: title, nav links, primary CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Channels & Adapters</h1>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link
              to="/chat"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Chat
            </Link>
            <Link
              to="/logs"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Logs
            </Link>
            <Link
              to="/settings"
              className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Settings
            </Link>
          </nav>
        </div>
        <Button onClick={() => openWizard()} className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6 min-w-0">
          {/* Channel Selection Panel: supported platforms + connected channels */}
          <Card className="shadow-card rounded-[10px] transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Supported platforms</CardTitle>
              <CardDescription>
                Connect chat surfaces. Select a provider to start the authorization flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUPPORTED_PLATFORMS.map((provider) => {
                  const connected = channels.some((c) => c.provider === provider);
                  return (
                    <div
                      key={provider}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-[10px] border p-4 transition-all duration-200',
                        'border-[rgb(var(--border))] bg-card hover:bg-card/80',
                        selectedChannelId && selectedChannel?.provider === provider && 'ring-2 ring-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{providerLabels[provider]}</p>
                          <p className="text-xs text-muted-foreground">
                            {connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={connected ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => (connected ? setSelectedChannelId(channels.find((c) => c.provider === provider)?.id ?? null) : openWizard(provider))}
                        className="shrink-0"
                      >
                        {connected ? 'Open' : 'Connect'}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="channels" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3 rounded-lg p-1 bg-secondary/50">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="logs">Delivery logs</TabsTrigger>
              <TabsTrigger value="test">Test console</TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="shadow-card rounded-[10px] transition-shadow hover:shadow-card-hover">
                  <CardHeader>
                    <CardTitle>Channels list</CardTitle>
                    <CardDescription>
                      Manage chat channel adapters and per-channel policies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {channelsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : channels.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                        <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No channels added. Use Connect above or Add Channel to connect WhatsApp, Telegram, Slack, or Discord.
                        </p>
                        <Button
                          className="mt-4"
                          variant="outline"
                          onClick={() => openWizard()}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Channel
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="h-[320px] pr-4">
                        <div className="space-y-2">
                          {channels.map((ch) => (
                            <div
                              key={ch.id}
                              className={cn(
                                'flex w-full items-center justify-between gap-2 rounded-lg border p-4 transition-colors duration-200',
                                selectedChannelId === ch.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:bg-card'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedChannelId(ch.id)}
                                className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium">
                                    {ch.display_name || providerLabels[ch.provider]}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {providerLabels[ch.provider]}
                                    {ch.last_event_at &&
                                      ` · Last event ${formatDistanceToNow(new Date(ch.last_event_at), { addSuffix: true })}`}
                                  </p>
                                </div>
                                <Badge variant={statusVariants[ch.status]} className="shrink-0">
                                  {ch.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {ch.success_rate.toFixed(0)}% success
                                </span>
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedChannelId(ch.id);
                                      setPolicyDialogOpen(true);
                                    }}
                                  >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configure policy
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleRemoveClick(ch)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card rounded-[10px] transition-shadow hover:shadow-card-hover">
                  <CardHeader>
                    <CardTitle>Channel config</CardTitle>
                    <CardDescription>
                      DM policy, group policy, mention gating.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedChannelId ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                        <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Select a channel to configure.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {adapterConfig === undefined ? (
                          <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">DM policy</span>
                                <span className="font-medium capitalize">
                                  {adapterConfig?.dm_policy ?? '—'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Group policy</span>
                                <span className="font-medium capitalize">
                                  {adapterConfig?.group_policy ?? '—'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Mention gating</span>
                                <span className="font-medium">
                                  {adapterConfig?.mention_gating ? 'On' : 'Off'}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99]"
                              onClick={() => setPolicyDialogOpen(true)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Edit policy
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card className="shadow-card rounded-[10px]">
                <CardHeader>
                  <CardTitle>Delivery logs</CardTitle>
                  <CardDescription>
                    Recent inbound/outbound events
                    {selectedChannelId && ' for selected channel'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedChannelId ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                      <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Select a channel on the Channels tab to view delivery logs.
                      </p>
                    </div>
                  ) : deliveryLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                      <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No delivery logs yet.</p>
                      <p className="mt-1 text-xs text-muted-foreground">Send a test message to see an entry.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {deliveryLogs.map((log) => (
                          <div
                            key={log.id}
                            className={cn(
                              'flex items-center justify-between rounded-lg border p-3 text-sm',
                              log.success ? 'border-border' : 'border-destructive/50 bg-destructive/5'
                            )}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              {log.success ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{log.event_type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              {!log.success && log.error_details && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShowError(log)}
                                  className="shrink-0"
                                >
                                  <ExternalLink className="mr-1 h-4 w-4" />
                                  Details
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Card className="shadow-card rounded-[10px]">
                <CardHeader>
                  <CardTitle>Test console</CardTitle>
                  <CardDescription>
                    Send test messages through the selected channel. Events appear in Delivery logs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedChannelId ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                      <Send className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Select a channel on the Channels tab to test.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label htmlFor="test-message" className="text-sm font-medium">
                          Test message
                        </label>
                        <Input
                          id="test-message"
                          placeholder="Type a message to send..."
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          className="min-h-[80px] rounded-lg border-border focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={sendTestMessage.isPending}
                        />
                      </div>
                      <Button
                        disabled={!testMessage.trim() || sendTestMessage.isPending}
                        onClick={handleSendTestMessage}
                        className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sendTestMessage.isPending ? 'Sending…' : 'Send test message'}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Test messages are logged to delivery logs. Roundtrip and errors appear there.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: quick links to docs, support, diagnostic tools */}
        <aside className="space-y-4 lg:order-last">
          <Card className="shadow-card rounded-[10px] p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick links</h3>
            <nav className="flex flex-col gap-2" aria-label="Channels quick links">
              <Link
                to="/help"
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                Documentation
              </Link>
              <Link
                to="/help"
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                Support
              </Link>
              <Link
                to="/logs"
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Activity className="h-4 w-4 shrink-0" />
                Diagnostic tools
              </Link>
            </nav>
          </Card>
        </aside>
      </div>

      <AddChannelWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSubmit={handleWizardSubmit}
        isSubmitting={createChannel.isPending || upsertConfig.isPending}
        initialProvider={wizardInitialProvider}
      />

      <ChannelPolicyDialog
        open={policyDialogOpen}
        onOpenChange={setPolicyDialogOpen}
        channelId={selectedChannelId ?? ''}
        channelName={selectedChannel?.display_name ?? selectedChannel?.provider}
        config={adapterConfig ?? null}
        onSubmit={handlePolicySubmit}
        isSubmitting={upsertConfig.isPending}
      />

      <DeleteChannelDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        channelName={
          channelToDelete
            ? channelToDelete.display_name || providerLabels[channelToDelete.provider]
            : ''
        }
        onConfirm={handleConfirmDelete}
        isDeleting={deleteChannel.isPending}
      />

      <DeliveryErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        log={errorLog}
      />
    </div>
  );
}
