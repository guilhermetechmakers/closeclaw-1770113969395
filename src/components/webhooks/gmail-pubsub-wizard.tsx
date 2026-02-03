import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  ChevronRight,
  ChevronLeft,
  Check,
  Play,
  Trash2,
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
import type { GmailPubSubSetting } from '@/types/database';
import {
  useGmailPubSubSettings,
  useCreateGmailPubSubSetting,
  useUpdateGmailPubSubSetting,
  useDeleteGmailPubSubSetting,
  useTestGmailPubSubSetting,
} from '@/hooks/useWebhooks';

const step1Schema = z.object({
  name: z.string().min(1, 'Name is required').max(64),
  push_endpoint: z.string().url('Enter a valid push endpoint URL'),
});

type Step1Values = z.infer<typeof step1Schema>;

const STEPS = [
  { id: 'connect', title: 'Connect', description: 'Push endpoint URL' },
  { id: 'configure', title: 'Configure', description: 'Optional topic and subscription' },
  { id: 'test', title: 'Test', description: 'Verify delivery' },
];

interface GmailPubSubWizardProps {
  onComplete?: () => void;
}

export function GmailPubSubWizard({ onComplete }: GmailPubSubWizardProps) {
  const [step, setStep] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data: settings = [], isLoading } = useGmailPubSubSettings();
  const createSetting = useCreateGmailPubSubSetting();
  const updateSetting = useUpdateGmailPubSubSetting();
  const deleteSetting = useDeleteGmailPubSubSetting();
  const testSetting = useTestGmailPubSubSetting();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: 'default', push_endpoint: '' },
  });

  const handleStep1Submit = (data: Step1Values) => {
    const config = { push_endpoint: data.push_endpoint };
    if (editingId) {
      updateSetting.mutate(
        {
          id: editingId,
          data: {
            name: data.name,
            configuration_details: config,
            is_active: true,
          },
        },
        {
          onSuccess: () => {
            setStep(2);
            setEditingId(null);
            reset({ name: 'default', push_endpoint: '' });
          },
        }
      );
    } else {
      createSetting.mutate(
        {
          name: data.name,
          configuration_details: config,
          is_active: true,
        },
        {
          onSuccess: () => {
            setStep(2);
            reset({ name: 'default', push_endpoint: '' });
            onComplete?.();
          },
        }
      );
    }
  };

  const handleTest = (s: GmailPubSubSetting) => {
    setTestingId(s.id);
    testSetting.mutate(s.id, { onSettled: () => setTestingId(null) });
  };

  const handleEdit = (s: GmailPubSubSetting) => {
    setEditingId(s.id);
    const details = s.configuration_details as { push_endpoint?: string };
    setValue('name', s.name);
    setValue('push_endpoint', details?.push_endpoint ?? '');
    setStep(0);
  };

  const handleDelete = (id: string) => {
    deleteSetting.mutate(id);
  };

  const handleStartOver = () => {
    setStep(0);
    setEditingId(null);
    reset({ name: 'default', push_endpoint: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                step === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                {i + 1}
              </span>
              {s.title}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <Card className="rounded-[10px] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Push endpoint</CardTitle>
            <CardDescription>
              Enter the URL where Gmail Pub/Sub will send push notifications. Create a webhook first
              and use its URL, or your own HTTPS endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="gmail-name">Configuration name</Label>
                <Input
                  id="gmail-name"
                  placeholder="e.g. default"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="push_endpoint">Push endpoint URL</Label>
                <Input
                  id="push_endpoint"
                  type="url"
                  placeholder="https://your-gateway/api/webhooks/gmail-pubsub"
                  {...register('push_endpoint')}
                  className={errors.push_endpoint ? 'border-destructive' : ''}
                />
                {errors.push_endpoint && (
                  <p className="text-xs text-destructive">{errors.push_endpoint.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createSetting.isPending || updateSetting.isPending}>
                  {createSetting.isPending || updateSetting.isPending ? (
                    'Saving…'
                  ) : editingId ? (
                    'Update & continue'
                  ) : (
                    <>
                      Save & continue
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleStartOver}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="rounded-[10px] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Configure (optional)</CardTitle>
            <CardDescription>
              In Google Cloud Console, create a Pub/Sub topic and subscription, and set the push
              endpoint to the URL you saved. Messages will be routed to your chat when configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)}>
                Continue to test
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="rounded-[10px] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Step 3: Test</CardTitle>
            <CardDescription>
              Send a test message to your push endpoint to verify the integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleStartOver} variant="outline">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Add another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing settings list */}
      {settings.length > 0 && (
        <Card className="rounded-[10px] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Gmail Pub/Sub configurations
            </CardTitle>
            <CardDescription>
              Manage push handler endpoints and test delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {settings.map((s) => {
                const details = s.configuration_details as { push_endpoint?: string };
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{s.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {details?.push_endpoint ?? 'No endpoint'}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        {s.is_active && (
                          <span className="inline-flex items-center gap-1 text-success">
                            <Check className="h-3 w-3" />
                            Active
                          </span>
                        )}
                        {s.last_tested_at && (
                          <span>
                            Tested {formatDistanceToNow(new Date(s.last_tested_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(s)}
                        disabled={testSetting.isPending && testingId === s.id}
                        className="transition-transform hover:scale-[1.02]"
                      >
                        {testSetting.isPending && testingId === s.id ? (
                          <span className="animate-pulse">Testing…</span>
                        ) : (
                          <>
                            <Play className="mr-1 h-4 w-4" />
                            Test
                          </>
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
                          <DropdownMenuItem onClick={() => handleEdit(s)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {settings.length === 0 && step !== 0 && (
        <p className="text-sm text-muted-foreground">
          No Gmail Pub/Sub configurations yet. Complete Step 1 to add one.
        </p>
      )}
    </div>
  );
}
