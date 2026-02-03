import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  BarChart3,
  Send,
  Cpu,
  TrendingUp,
  Hash,
  Activity,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import {
  useModelProviders,
  useModelRequests,
  useUsageSummary,
  useUsageMetrics,
  useCreateModelProvider,
  useCreateModelRequest,
  useCreateUsageMetric,
  useUpsertConfigurationOverride,
  useUpdateModelProvider,
  useDeleteModelProvider,
} from '@/hooks/useModelProviders';
import type { ModelProvider, ModelRequestStatus } from '@/types/database';
import { AddProviderDialog, type AddProviderDialogPayload } from '@/components/model-providers/add-provider-dialog';

const requestFormSchema = z.object({
  provider_id: z.string().uuid().optional().nullable(),
  model_name: z.string().max(128).optional(),
  temperature: z.coerce.number().min(0).max(2).optional(),
  max_tokens: z.coerce.number().int().min(1).max(128000).optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

const statusVariants: Record<
  ModelRequestStatus,
  'default' | 'secondary' | 'destructive' | 'warning'
> = {
  pending: 'secondary',
  running: 'default',
  completed: 'secondary',
  failed: 'destructive',
};

const providerStatusVariants: Record<
  ModelProvider['status'],
  'success' | 'warning' | 'destructive' | 'secondary'
> = {
  active: 'success',
  inactive: 'secondary',
  error: 'destructive',
};

export function ModelProviders() {
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null);
  const [usageSince] = useState<string>(() =>
    subDays(new Date(), 7).toISOString()
  );

  const { data: providers = [], isLoading: providersLoading } = useModelProviders();
  const { data: requests = [], isLoading: requestsLoading } = useModelRequests({
    limit: 50,
  });
  const { data: usageSummary, isLoading: summaryLoading } = useUsageSummary({
    since: usageSince,
  });
  const { data: usageMetrics = [] } = useUsageMetrics({ limit: 100, since: usageSince });

  const createProvider = useCreateModelProvider();
  const updateProvider = useUpdateModelProvider();
  const deleteProvider = useDeleteModelProvider();
  const createRequest = useCreateModelRequest();
  const createUsageMetric = useCreateUsageMetric();
  const upsertConfig = useUpsertConfigurationOverride();

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      provider_id: null,
      model_name: '',
      temperature: 0.7,
      max_tokens: 4096,
    },
  });

  const handleAddOrEditProvider = (payload: AddProviderDialogPayload) => {
    if (editingProvider) {
      updateProvider.mutate(
        {
          id: editingProvider.id,
          data: {
            name: payload.name,
            slug: payload.slug,
            api_endpoint_base: payload.api_endpoint_base ?? undefined,
            priority: payload.priority,
            is_default: payload.is_default,
            status: payload.status,
          },
        },
        {
          onSettled: () => {
            setEditingProvider(null);
            setAddProviderOpen(false);
          },
        }
      );
    } else {
      createProvider.mutate(
        {
          name: payload.name,
          slug: payload.slug,
          api_endpoint_base: payload.api_endpoint_base ?? null,
          priority: payload.priority,
          is_default: payload.is_default,
          status: payload.status,
        },
        { onSuccess: () => setAddProviderOpen(false) }
      );
    }
  };

  const handleSubmitRequest = requestForm.handleSubmit(async (values) => {
    const providerId = values.provider_id ?? providers.find((p) => p.is_default)?.id ?? providers[0]?.id ?? null;
    const request = await createRequest.mutateAsync({
      provider_id: providerId,
      status: 'pending',
    });
    await upsertConfig.mutateAsync({
      request_id: request.id,
      model_name: values.model_name ?? null,
      temperature: values.temperature ?? null,
      max_tokens: values.max_tokens ?? null,
    });
    await createUsageMetric.mutateAsync({
      request_id: request.id,
      provider_id: providerId,
      token_count_input: 0,
      token_count_output: 0,
    });
    requestForm.reset();
  });

  const chartData = usageMetrics
    .slice()
    .reverse()
    .reduce(
      (acc, m) => {
        const day = format(m.created_at, 'yyyy-MM-dd');
        if (!acc.find((d) => d.date === day)) {
          acc.push({
            date: day,
            tokens: 0,
            requests: 0,
          });
        }
        const entry = acc.find((d) => d.date === day);
        if (entry) {
          entry.tokens += m.token_count_input + m.token_count_output;
          entry.requests += 1;
        }
        return acc;
      },
      [] as { date: string; tokens: number; requests: number }[]
    );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Model Providers</h1>
      </div>

      <Tabs defaultValue="request" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="request" className="gap-2">
            <Send className="h-4 w-4" />
            Request
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="providers" className="gap-2">
            <Cpu className="h-4 w-4" />
            Providers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>New request</CardTitle>
              <CardDescription>
                Select provider and optional overrides. Request will be logged for usage and history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmitRequest}
                className="flex flex-col gap-4 sm:max-w-lg"
              >
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={requestForm.watch('provider_id') ?? ''}
                    onValueChange={(v) =>
                      requestForm.setValue('provider_id', v || null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Default provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.is_default && '(default)'}
                        </SelectItem>
                      ))}
                      {providers.length === 0 && (
                        <SelectItem value="_none" disabled>
                          Add a provider first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model_name">Model (optional)</Label>
                  <Input
                    id="model_name"
                    placeholder="e.g. gpt-4o"
                    {...requestForm.register('model_name')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step={0.1}
                      min={0}
                      max={2}
                      {...requestForm.register('temperature')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_tokens">Max tokens</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      {...requestForm.register('max_tokens')}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={
                    createRequest.isPending ||
                    providers.length === 0
                  }
                >
                  {createRequest.isPending ? 'Submitting…' : 'Log request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent requests</CardTitle>
              <CardDescription>Last 50 model requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : requests.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No requests yet. Submit a request above or run from chat/skills.
                </p>
              ) : (
                <ScrollArea className="h-64">
                  <ul className="space-y-2">
                    {requests.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {r.provider_id
                                ? providers.find((p) => p.id === r.provider_id)?.name ?? 'Unknown'
                                : 'No provider'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(r.created_at, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusVariants[r.status]}>{r.status}</Badge>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {summaryLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total input tokens
                  </CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {usageSummary?.totalInputTokens ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total output tokens
                  </CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {usageSummary?.totalOutputTokens ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Requests (period)
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {usageSummary?.requestCount ?? 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Usage over time</CardTitle>
              <CardDescription>
                Tokens and request count (last 7 days by default)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No usage data in this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'rgb(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'rgb(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      labelStyle={{ color: 'rgb(var(--foreground))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      stroke="rgb(var(--primary))"
                      fill="rgb(var(--primary))"
                      fillOpacity={0.2}
                      name="Tokens"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Configure AI model providers (OpenAI, Anthropic, local). Priority and default control routing and failover.
            </p>
            <Button onClick={() => { setEditingProvider(null); setAddProviderOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add provider
            </Button>
          </div>

          {providersLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : providers.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  No providers yet. Add one to start logging requests and usage.
                </p>
                <Button onClick={() => setAddProviderOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className="shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/30"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {provider.name}
                        {provider.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {provider.api_endpoint_base ?? provider.slug}
                          · Priority {provider.priority}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProvider(provider);
                            setAddProviderOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteProvider.mutate(provider.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={providerStatusVariants[provider.status]}>
                      {provider.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddProviderDialog
        open={addProviderOpen}
        onOpenChange={setAddProviderOpen}
        onSubmit={handleAddOrEditProvider}
        isSubmitting={createProvider.isPending || updateProvider.isPending}
        provider={editingProvider}
      />
    </div>
  );
}
