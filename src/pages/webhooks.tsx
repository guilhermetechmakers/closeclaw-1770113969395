import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Webhook as WebhookIcon,
  Code2,
  Mail,
  MoreHorizontal,
  Trash2,
  Copy,
  Check,
  Calendar,
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
  useWebhooks,
  useHookScripts,
  useCreateWebhook,
  useDeleteWebhook,
  useCreateHookScript,
  useUpdateHookScript,
  useDeleteHookScript,
} from '@/hooks/useWebhooks';
import type { Webhook, HookScript } from '@/types/database';
import { CreateWebhookModal, type CreateWebhookPayload } from '@/components/webhooks/create-webhook-modal';
import { HookScriptEditorDialog } from '@/components/webhooks/hook-script-editor-dialog';
import { PayloadTransformerSection } from '@/components/webhooks/payload-transformer-section';
import { toast } from 'sonner';

export function Webhooks() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<HookScript | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data: webhooks = [], isLoading: webhooksLoading } = useWebhooks();
  const { data: hookScripts = [], isLoading: scriptsLoading } = useHookScripts(null);

  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const createHookScript = useCreateHookScript();
  const updateHookScript = useUpdateHookScript();
  const deleteHookScript = useDeleteHookScript();

  const handleCreateWebhook = async (payload: CreateWebhookPayload) => {
    await createWebhook.mutateAsync(payload);
    setCreateModalOpen(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleScriptSubmit = (data: {
    event_trigger: string;
    language: 'javascript' | 'python';
    script_content: string;
    webhook_id: string | null;
  }) => {
    if (editingScript) {
      updateHookScript.mutate(
        {
          id: editingScript.id,
          data: {
            event_trigger: data.event_trigger,
            language: data.language,
            script_content: data.script_content,
            webhook_id: data.webhook_id,
          },
        },
        {
          onSuccess: () => {
            setEditingScript(null);
            setScriptDialogOpen(false);
          },
        }
      );
    } else {
      createHookScript.mutate(
        {
          event_trigger: data.event_trigger,
          language: data.language,
          script_content: data.script_content,
          webhook_id: data.webhook_id,
        },
        {
          onSuccess: () => setScriptDialogOpen(false),
        }
      );
    }
  };

  const openEditScript = (script: HookScript) => {
    setEditingScript(script);
    setScriptDialogOpen(true);
  };

  const openAddScript = () => {
    setEditingScript(null);
    setScriptDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Webhooks & Hooks</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create webhook
        </Button>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="hooks">Hook scripts</TabsTrigger>
          <TabsTrigger value="transform">Payload transformer</TabsTrigger>
          <TabsTrigger value="gmail">Gmail Pub/Sub</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card className="rounded-[10px] border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WebhookIcon className="h-5 w-5 text-muted-foreground" />
                Webhook endpoints
              </CardTitle>
              <CardDescription>
                List (token), create webhook modal. URL, token preview, last received, mapping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhooksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : webhooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <WebhookIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No webhooks. Create one to receive inbound events.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create webhook
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {webhooks.map((w: Webhook) => (
                      <div
                        key={w.id}
                        className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-card/80"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{w.route_name}</p>
                            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                              {w.url}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">Token: {w.token_preview}</span>
                              {w.last_received_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Last received{' '}
                                  {formatDistanceToNow(new Date(w.last_received_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              )}
                            </div>
                            {w.mapping_template && (
                              <Badge variant="secondary" className="mt-2">
                                Mapping
                              </Badge>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyUrl(w.url)}
                              aria-label="Copy URL"
                            >
                              {copiedUrl === w.url ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    if (window.confirm('Remove this webhook?')) {
                                      deleteWebhook.mutate(w.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card className="rounded-[10px] border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-muted-foreground" />
                Hook scripts editor
              </CardTitle>
              <CardDescription>
                Sandbox environment for lifecycle hooks (restricted JS/Python). Event triggers: /new, /reset, start, end.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end">
                <Button onClick={openAddScript}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add hook script
                </Button>
              </div>
              {scriptsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : hookScripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <Code2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No hook scripts. Add one for lifecycle events (/new, /reset, start, end).
                  </p>
                  <Button className="mt-4" variant="outline" onClick={openAddScript}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add hook script
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-4">
                  <div className="space-y-2">
                    {hookScripts.map((s: HookScript) => (
                      <div
                        key={s.id}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-card/80'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{s.event_trigger}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.language}
                            {s.webhook_id
                              ? ` · Webhook: ${webhooks.find((w) => w.id === s.webhook_id)?.route_name ?? s.webhook_id}`
                              : ' · Global'}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditScript(s)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (window.confirm('Remove this hook script?')) {
                                deleteHookScript.mutate(s.id);
                              }
                            }}
                            aria-label="Remove script"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transform" className="space-y-4">
          <PayloadTransformerSection
            webhooks={webhooks}
            isLoadingWebhooks={webhooksLoading}
          />
        </TabsContent>

        <TabsContent value="gmail" className="space-y-4">
          <Card className="rounded-[10px] border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                Gmail Pub/Sub guided setup
              </CardTitle>
              <CardDescription>
                Guided flow for Gmail Pub/Sub integration. Connect your Gmail account and configure webhook delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Gmail Pub/Sub setup will be available here. Create a webhook first, then link it to Gmail.
                </p>
                <Button className="mt-4" variant="outline" disabled>
                  Coming soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateWebhookModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateWebhook}
        isSubmitting={createWebhook.isPending}
      />

      <HookScriptEditorDialog
        open={scriptDialogOpen}
        onOpenChange={(open) => {
          setScriptDialogOpen(open);
          if (!open) setEditingScript(null);
        }}
        onSubmit={handleScriptSubmit}
        isSubmitting={createHookScript.isPending || updateHookScript.isPending}
        script={editingScript}
        webhooks={webhooks}
      />
    </div>
  );
}
