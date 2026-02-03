import { useState } from 'react';
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
} from '@/hooks/useChannels';
import type { Channel, ChannelStatus, DeliveryLog } from '@/types/database';
import { AddChannelWizard, type AddChannelWizardPayload } from '@/components/channels/add-channel-wizard';
import { ChannelPolicyDialog } from '@/components/channels/channel-policy-dialog';
import { DeliveryErrorDialog } from '@/components/channels/delivery-error-dialog';

const providerLabels: Record<Channel['provider'], string> = {
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

export function Channels() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [errorLog, setErrorLog] = useState<DeliveryLog | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const { data: selectedChannel } = useChannel(selectedChannelId);
  const { data: adapterConfig } = useAdapterConfig(selectedChannelId);
  const { data: deliveryLogs = [] } = useDeliveryLogs(selectedChannelId, { limit: 50 });

  const createChannel = useCreateChannel();
  const deleteChannel = useDeleteChannel();
  const upsertConfig = useUpsertAdapterConfig();

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Channels & Adapters</h1>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="logs">Delivery logs</TabsTrigger>
          <TabsTrigger value="test">Test console</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
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
                      No channels added. Use Add Channel to connect WhatsApp, Telegram, Slack, or Discord.
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setWizardOpen(true)}
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
                            'flex w-full items-center justify-between gap-2 rounded-lg border p-4 transition-colors',
                            selectedChannelId === ch.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-card'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedChannelId(ch.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                            <span className="text-xs text-muted-foreground">
                              {ch.success_rate.toFixed(0)}% success
                            </span>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
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
                                onClick={() => {
                                  if (window.confirm('Remove this channel?')) {
                                    deleteChannel.mutate(ch.id);
                                    if (selectedChannelId === ch.id) setSelectedChannelId(null);
                                  }
                                }}
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

            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
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
                          className="w-full"
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
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Test console</CardTitle>
              <CardDescription>
                Send test messages through the selected channel.
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
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    disabled={!testMessage.trim()}
                    onClick={() => {
                      setTestMessage('');
                      // In production: call API to send test message; optionally create delivery_log
                      // For now we just clear the input
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send test message
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Test messages are sent through the gateway. Roundtrip and errors appear in Delivery logs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddChannelWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSubmit={handleWizardSubmit}
        isSubmitting={createChannel.isPending || upsertConfig.isPending}
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

      <DeliveryErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        log={errorLog}
      />
    </div>
  );
}
