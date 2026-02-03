import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings as SettingsIcon,
  Wifi,
  Globe,
  KeyRound,
  Shield,
  Cpu,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNetworkSettings,
  useUpsertNetworkSettings,
  useRemoteAccess,
  useUpsertRemoteAccess,
  useSecretsPrefs,
  useUpsertSecretsPrefs,
  useToolPolicies,
  useUpsertToolPolicies,
  useModelDefaults,
  useUpsertModelDefaults,
  useApplySettings,
} from '@/hooks/useSettings';

const networkSchema = z.object({
  bind_address: z.string().min(1, 'Bind address is required'),
  port: z.coerce.number().int().min(1).max(65535),
  tls_enabled: z.boolean().optional(),
  tls_cert_path: z.string().optional(),
  tls_key_path: z.string().optional(),
});

const remoteAccessSchema = z.object({
  tailnet_enabled: z.boolean().optional(),
  tailnet_name: z.string().optional(),
  relay_enabled: z.boolean().optional(),
  pairing_require_approval: z.boolean().optional(),
});

const secretsPrefsSchema = z.object({
  os_keychain_enabled: z.boolean(),
  onepassword_integration: z.boolean(),
});

const toolPoliciesSchema = z.object({
  exec_allowlist_text: z.string().optional(),
  sandbox_mode: z.boolean(),
  docker_enabled: z.boolean().optional(),
  docker_image: z.string().optional(),
});

const modelDefaultsSchema = z.object({
  provider_priority_text: z.string().optional(),
  usage_cap_daily: z.coerce.number().min(0).optional(),
  failover_enabled: z.boolean().optional(),
});

type NetworkFormValues = z.infer<typeof networkSchema>;
type RemoteAccessFormValues = z.infer<typeof remoteAccessSchema>;
type SecretsPrefsFormValues = z.infer<typeof secretsPrefsSchema>;
type ToolPoliciesFormValues = z.infer<typeof toolPoliciesSchema>;
type ModelDefaultsFormValues = z.infer<typeof modelDefaultsSchema>;

const defaultNetwork: NetworkFormValues = {
  bind_address: '0.0.0.0',
  port: 3000,
  tls_enabled: false,
  tls_cert_path: '',
  tls_key_path: '',
};

const defaultRemoteAccess: RemoteAccessFormValues = {
  tailnet_enabled: false,
  tailnet_name: '',
  relay_enabled: false,
  pairing_require_approval: true,
};

const defaultSecretsPrefs: SecretsPrefsFormValues = {
  os_keychain_enabled: true,
  onepassword_integration: false,
};

const defaultToolPolicies: ToolPoliciesFormValues = {
  exec_allowlist_text: '',
  sandbox_mode: true,
  docker_enabled: false,
  docker_image: '',
};

const defaultModelDefaults: ModelDefaultsFormValues = {
  provider_priority_text: '',
  usage_cap_daily: 0,
  failover_enabled: true,
};

export function Settings() {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [auditWarnings, setAuditWarnings] = useState<string[]>([]);

  const { data: networkData, isLoading: networkLoading } = useNetworkSettings();
  const { data: remoteData, isLoading: remoteLoading } = useRemoteAccess();
  const { data: secretsPrefsData, isLoading: secretsPrefsLoading } = useSecretsPrefs();
  const { data: toolPoliciesData, isLoading: toolPoliciesLoading } = useToolPolicies();
  const { data: modelDefaultsData, isLoading: modelDefaultsLoading } = useModelDefaults();

  const upsertNetwork = useUpsertNetworkSettings();
  const upsertRemote = useUpsertRemoteAccess();
  const upsertSecretsPrefs = useUpsertSecretsPrefs();
  const upsertToolPolicies = useUpsertToolPolicies();
  const upsertModelDefaults = useUpsertModelDefaults();
  const applySettings = useApplySettings();

  const networkForm = useForm<NetworkFormValues>({
    resolver: zodResolver(networkSchema),
    defaultValues: defaultNetwork,
  });

  const remoteForm = useForm<RemoteAccessFormValues>({
    resolver: zodResolver(remoteAccessSchema),
    defaultValues: defaultRemoteAccess,
  });

  const secretsPrefsForm = useForm<SecretsPrefsFormValues>({
    resolver: zodResolver(secretsPrefsSchema),
    defaultValues: defaultSecretsPrefs,
  });

  const toolPoliciesForm = useForm<ToolPoliciesFormValues>({
    resolver: zodResolver(toolPoliciesSchema),
    defaultValues: defaultToolPolicies,
  });

  const modelDefaultsForm = useForm<ModelDefaultsFormValues>({
    resolver: zodResolver(modelDefaultsSchema),
    defaultValues: defaultModelDefaults,
  });

  useEffect(() => {
    if (networkData) {
      const tls = (networkData.tls_options || {}) as Record<string, unknown>;
      networkForm.reset({
        bind_address: networkData.bind_address ?? defaultNetwork.bind_address,
        port: networkData.port ?? defaultNetwork.port,
        tls_enabled: !!tls.enabled,
        tls_cert_path: (tls.cert_path as string) ?? '',
        tls_key_path: (tls.key_path as string) ?? '',
      });
    }
  }, [networkData, networkForm]);

  useEffect(() => {
    if (remoteData) {
      const tailnet = (remoteData.tailnet_config || {}) as Record<string, unknown>;
      const relay = (remoteData.relay_settings || {}) as Record<string, unknown>;
      const pairing = (remoteData.pairing_policies || {}) as Record<string, unknown>;
      remoteForm.reset({
        tailnet_enabled: !!tailnet.enabled,
        tailnet_name: (tailnet.name as string) ?? '',
        relay_enabled: !!relay.enabled,
        pairing_require_approval: pairing.require_approval !== false,
      });
    }
  }, [remoteData, remoteForm]);

  useEffect(() => {
    if (secretsPrefsData) {
      secretsPrefsForm.reset({
        os_keychain_enabled: secretsPrefsData.os_keychain_enabled,
        onepassword_integration: secretsPrefsData.onepassword_integration,
      });
    }
  }, [secretsPrefsData, secretsPrefsForm]);

  useEffect(() => {
    if (toolPoliciesData) {
      const allowlist = toolPoliciesData.exec_allowlist || [];
      const docker = (toolPoliciesData.docker_config || {}) as Record<string, unknown>;
      toolPoliciesForm.reset({
        exec_allowlist_text: Array.isArray(allowlist) ? allowlist.join('\n') : '',
        sandbox_mode: toolPoliciesData.sandbox_mode,
        docker_enabled: !!docker.enabled,
        docker_image: (docker.image as string) ?? '',
      });
    }
  }, [toolPoliciesData, toolPoliciesForm]);

  useEffect(() => {
    if (modelDefaultsData) {
      const priority = modelDefaultsData.provider_priority || [];
      const caps = (modelDefaultsData.usage_caps || {}) as Record<string, unknown>;
      const failover = (modelDefaultsData.failover_rules || {}) as Record<string, unknown>;
      modelDefaultsForm.reset({
        provider_priority_text: Array.isArray(priority) ? priority.join('\n') : '',
        usage_cap_daily: (caps.daily as number) ?? 0,
        failover_enabled: failover.enabled !== false,
      });
    }
  }, [modelDefaultsData, modelDefaultsForm]);

  const onApplyClick = () => {
    setAuditWarnings([]);
    setApplyDialogOpen(true);
  };

  const onConfirmApply = async () => {
    await applySettings.mutateAsync();
    setApplyDialogOpen(false);
    if (auditWarnings.length > 0) setAuditWarnings([]);
  };

  const onSaveNetwork = (values: NetworkFormValues) => {
    upsertNetwork.mutate({
      bind_address: values.bind_address,
      port: values.port,
      tls_options: {
        enabled: values.tls_enabled,
        cert_path: values.tls_cert_path || undefined,
        key_path: values.tls_key_path || undefined,
      },
    });
  };

  const onSaveRemote = (values: RemoteAccessFormValues) => {
    upsertRemote.mutate({
      tailnet_config: {
        enabled: values.tailnet_enabled,
        name: values.tailnet_name || undefined,
      },
      relay_settings: { enabled: values.relay_enabled },
      pairing_policies: { require_approval: values.pairing_require_approval },
    });
  };

  const onSaveSecretsPrefs = (values: SecretsPrefsFormValues) => {
    upsertSecretsPrefs.mutate({
      os_keychain_enabled: values.os_keychain_enabled,
      onepassword_integration: values.onepassword_integration,
    });
  };

  const onSaveToolPolicies = (values: ToolPoliciesFormValues) => {
    const allowlist = values.exec_allowlist_text
      ? values.exec_allowlist_text.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
    upsertToolPolicies.mutate({
      exec_allowlist: allowlist,
      sandbox_mode: values.sandbox_mode,
      docker_config: {
        enabled: values.docker_enabled,
        image: values.docker_image || undefined,
      },
    });
  };

  const onSaveModelDefaults = (values: ModelDefaultsFormValues) => {
    const priority = values.provider_priority_text
      ? values.provider_priority_text.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
    upsertModelDefaults.mutate({
      provider_priority: priority,
      usage_caps: { daily: values.usage_cap_daily ?? 0 },
      failover_rules: { enabled: values.failover_enabled },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" aria-hidden />
          Settings / Preferences
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global gateway and workspace configuration. Restart may be required for some changes.
        </p>
      </div>

      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 bg-card border border-border rounded-lg p-1">
          <TabsTrigger value="network" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Network
          </TabsTrigger>
          <TabsTrigger value="remote">Remote access</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="tools">Tool policies</TabsTrigger>
          <TabsTrigger value="model">Model defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <Card className="border-border shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-accent" aria-hidden />
                <CardTitle className="text-lg">Network binding / TLS</CardTitle>
              </div>
              <CardDescription>
                Bind address, port, and TLS options. Save or reset to defaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {networkLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-1/3 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ) : (
                <form
                  onSubmit={networkForm.handleSubmit(onSaveNetwork)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bind_address">Bind address</Label>
                      <Input
                        id="bind_address"
                        placeholder="0.0.0.0"
                        className="focus-visible:ring-primary"
                        {...networkForm.register('bind_address')}
                      />
                      {networkForm.formState.errors.bind_address && (
                        <p className="text-sm text-destructive">
                          {networkForm.formState.errors.bind_address.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        placeholder="3000"
                        className="focus-visible:ring-primary"
                        {...networkForm.register('port')}
                      />
                      {networkForm.formState.errors.port && (
                        <p className="text-sm text-destructive">
                          {networkForm.formState.errors.port.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label htmlFor="tls_enabled">Enable TLS</Label>
                      <p className="text-xs text-muted-foreground">Use HTTPS with certificate.</p>
                    </div>
                    <Switch
                      id="tls_enabled"
                      checked={networkForm.watch('tls_enabled')}
                      onCheckedChange={(v) => networkForm.setValue('tls_enabled', v)}
                    />
                  </div>
                  {networkForm.watch('tls_enabled') && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tls_cert_path">Certificate path</Label>
                        <Input
                          id="tls_cert_path"
                          placeholder="/path/to/cert.pem"
                          {...networkForm.register('tls_cert_path')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tls_key_path">Key path</Label>
                        <Input
                          id="tls_key_path"
                          placeholder="/path/to/key.pem"
                          {...networkForm.register('tls_key_path')}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={upsertNetwork.isPending}
                    className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {upsertNetwork.isPending ? 'Saving…' : 'Save network settings'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <Card className="border-border shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-accent" aria-hidden />
                <CardTitle className="text-lg">Remote access (tailnet / proxy)</CardTitle>
              </div>
              <CardDescription>
                Configure Tailscale or relay for remote access; device pairing policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {remoteLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : (
                <form
                  onSubmit={remoteForm.handleSubmit(onSaveRemote)}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label>Tailnet (Tailscale)</Label>
                      <p className="text-xs text-muted-foreground">Enable tailnet for remote access.</p>
                    </div>
                    <Switch
                      checked={remoteForm.watch('tailnet_enabled')}
                      onCheckedChange={(v) => remoteForm.setValue('tailnet_enabled', v)}
                    />
                  </div>
                  {remoteForm.watch('tailnet_enabled') && (
                    <div className="space-y-2">
                      <Label htmlFor="tailnet_name">Tailnet name</Label>
                      <Input
                        id="tailnet_name"
                        placeholder="my-tailnet"
                        {...remoteForm.register('tailnet_name')}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label>Relay / proxy</Label>
                      <p className="text-xs text-muted-foreground">Use relay for device access.</p>
                    </div>
                    <Switch
                      checked={remoteForm.watch('relay_enabled')}
                      onCheckedChange={(v) => remoteForm.setValue('relay_enabled', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label>Pairing require approval</Label>
                      <p className="text-xs text-muted-foreground">New devices need approval.</p>
                    </div>
                    <Switch
                      checked={remoteForm.watch('pairing_require_approval')}
                      onCheckedChange={(v) => remoteForm.setValue('pairing_require_approval', v)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={upsertRemote.isPending}
                    className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {upsertRemote.isPending ? 'Saving…' : 'Save remote access'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secrets" className="space-y-4">
          <Card className="border-border shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-accent" aria-hidden />
                <CardTitle className="text-lg">Secrets management</CardTitle>
              </div>
              <CardDescription>
                OS keychain and 1Password CLI integration. Never write long-lived tokens to plaintext.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {secretsPrefsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : (
                <>
                  <form
                    onSubmit={secretsPrefsForm.handleSubmit(onSaveSecretsPrefs)}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <Label>OS keychain</Label>
                        <p className="text-xs text-muted-foreground">Use system keychain for secrets.</p>
                      </div>
                      <Switch
                        checked={secretsPrefsForm.watch('os_keychain_enabled')}
                        onCheckedChange={(v) => secretsPrefsForm.setValue('os_keychain_enabled', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <Label>1Password integration</Label>
                        <p className="text-xs text-muted-foreground">Use 1Password CLI for vault.</p>
                      </div>
                      <Switch
                        checked={secretsPrefsForm.watch('onepassword_integration')}
                        onCheckedChange={(v) => secretsPrefsForm.setValue('onepassword_integration', v)}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={upsertSecretsPrefs.isPending}
                      className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {upsertSecretsPrefs.isPending ? 'Saving…' : 'Save preferences'}
                    </Button>
                  </form>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Manage stored secrets and keychain.</p>
                    <Button asChild variant="secondary" className="transition-transform hover:scale-[1.02]">
                      <Link to="/secrets">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Secrets &amp; Keychain
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card className="border-border shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" aria-hidden />
                <CardTitle className="text-lg">Tool policies</CardTitle>
              </div>
              <CardDescription>
                Exec allowlist, sandbox mode, and Docker sandbox settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {toolPoliciesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : (
                <form
                  onSubmit={toolPoliciesForm.handleSubmit(onSaveToolPolicies)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="exec_allowlist">Exec allowlist (one path per line)</Label>
                    <Textarea
                      id="exec_allowlist"
                      placeholder="/usr/bin/python3&#10;/usr/bin/node"
                      rows={4}
                      className="font-mono text-sm focus-visible:ring-primary resize-y"
                      {...toolPoliciesForm.register('exec_allowlist_text')}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label>Sandbox tools</Label>
                      <p className="text-xs text-muted-foreground">Run tools in sandbox when possible.</p>
                    </div>
                    <Switch
                      checked={toolPoliciesForm.watch('sandbox_mode')}
                      onCheckedChange={(v) => toolPoliciesForm.setValue('sandbox_mode', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label>Docker sandbox</Label>
                      <p className="text-xs text-muted-foreground">Use Docker for isolation.</p>
                    </div>
                    <Switch
                      checked={toolPoliciesForm.watch('docker_enabled')}
                      onCheckedChange={(v) => toolPoliciesForm.setValue('docker_enabled', v)}
                    />
                  </div>
                  {toolPoliciesForm.watch('docker_enabled') && (
                    <div className="space-y-2">
                      <Label htmlFor="docker_image">Docker image</Label>
                      <Input
                        id="docker_image"
                        placeholder="sandbox:latest"
                        {...toolPoliciesForm.register('docker_image')}
                      />
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={upsertToolPolicies.isPending}
                    className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {upsertToolPolicies.isPending ? 'Saving…' : 'Save tool policies'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card className="border-border shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-accent" aria-hidden />
                <CardTitle className="text-lg">Model defaults</CardTitle>
              </div>
              <CardDescription>
                Provider priority, failover rules, and usage caps for runs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelDefaultsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-10 w-1/3 rounded-lg" />
                </div>
              ) : (
                <form
                  onSubmit={modelDefaultsForm.handleSubmit(onSaveModelDefaults)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="provider_priority">Provider priority (one per line, first = default)</Label>
                    <Textarea
                      id="provider_priority"
                      placeholder="openai&#10;anthropic&#10;ollama"
                      rows={4}
                      className="font-mono text-sm focus-visible:ring-primary resize-y"
                      {...modelDefaultsForm.register('provider_priority_text')}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <Label>Failover enabled</Label>
                      <p className="text-xs text-muted-foreground">Try next provider on failure.</p>
                    </div>
                    <Switch
                      checked={modelDefaultsForm.watch('failover_enabled')}
                      onCheckedChange={(v) => modelDefaultsForm.setValue('failover_enabled', v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage_cap_daily">Daily usage cap (requests)</Label>
                    <Input
                      id="usage_cap_daily"
                      type="number"
                      min={0}
                      placeholder="0 = no cap"
                      {...modelDefaultsForm.register('usage_cap_daily')}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={upsertModelDefaults.isPending}
                    className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {upsertModelDefaults.isPending ? 'Saving…' : 'Save model defaults'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-border shadow-card">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-medium">Apply configuration</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Validate and apply settings. Restart gateway if needed for network or tool changes.
            </p>
          </div>
          <Button
            onClick={onApplyClick}
            disabled={applySettings.isPending}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <RotateCw className={cn('h-4 w-4 mr-2', applySettings.isPending && 'animate-spin')} aria-hidden />
            Restart / Apply
          </Button>
        </CardContent>
      </Card>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-md" showClose={true}>
          <DialogHeader>
            <DialogTitle>Apply settings</DialogTitle>
            <DialogDescription>
              This will validate your configuration and apply changes. Some options may require a gateway restart to take effect.
            </DialogDescription>
          </DialogHeader>
          {auditWarnings.length > 0 && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-foreground">
              <p className="font-medium mb-1">Warnings</p>
              <ul className="list-disc list-inside space-y-0.5">
                {auditWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={() => setApplyDialogOpen(false)}
              className="transition-transform hover:scale-[1.02]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmApply}
              disabled={applySettings.isPending}
              className="transition-transform hover:scale-[1.02]"
            >
              {applySettings.isPending ? 'Applying…' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
