import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, FileJson } from 'lucide-react';
import type { Webhook } from '@/types/database';
import { usePayloadTemplate, useUpsertPayloadTemplate } from '@/hooks/useWebhooks';
import { cn } from '@/lib/utils';

interface PayloadTransformerSectionProps {
  webhooks: Webhook[];
  isLoadingWebhooks?: boolean;
}

export function PayloadTransformerSection({
  webhooks,
  isLoadingWebhooks = false,
}: PayloadTransformerSectionProps) {
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<string | null>(null);
  const { data: template, isLoading: templateLoading } = usePayloadTemplate(selectedWebhookId);
  const upsert = useUpsertPayloadTemplate();

  const displayContent = draftContent !== null ? draftContent : (template?.template_content ?? '');
  const handleSave = () => {
    if (!selectedWebhookId) return;
    upsert.mutate(
      { webhook_id: selectedWebhookId, template_content: displayContent },
      {
        onSuccess: () => setDraftContent(null),
      }
    );
  };

  const hasChanges =
    selectedWebhookId && displayContent !== (template?.template_content ?? '');

  return (
    <Card className="rounded-[10px] border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-muted-foreground" />
          Payload transformer
        </CardTitle>
        <CardDescription>
          Edit transformation templates per webhook. Preview and save to apply.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="payload-webhook">Webhook</Label>
          {isLoadingWebhooks ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <Select
              value={selectedWebhookId ?? ''}
              onValueChange={(v) => {
                setSelectedWebhookId(v || null);
                setDraftContent(null);
              }}
            >
              <SelectTrigger id="payload-webhook">
                <SelectValue placeholder="Select a webhook" />
              </SelectTrigger>
              <SelectContent>
                {webhooks.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No webhooks — create one first
                  </SelectItem>
                ) : (
                  webhooks.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.route_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        {selectedWebhookId && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="template_content">Template content</Label>
              {templateLoading ? (
                <Skeleton className="h-[200px] w-full rounded-md" />
              ) : (
                <textarea
                  id="template_content"
                  rows={10}
                  className={cn(
                    'flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  placeholder="JSON or template (e.g. Handlebars) for payload mapping"
                  value={displayContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  spellCheck={false}
                />
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={upsert.isPending || (!hasChanges && !template)}
              >
                {upsert.isPending ? (
                  'Saving…'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save template
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        {!selectedWebhookId && webhooks.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Select a webhook above to edit its payload transformation template.
          </p>
        )}
        {!selectedWebhookId && webhooks.length === 0 && !isLoadingWebhooks && (
          <p className="text-sm text-muted-foreground">
            Create a webhook in the Endpoints tab first, then select it here to add a transformation template.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
