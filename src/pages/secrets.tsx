import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Key,
  Shield,
  MoreHorizontal,
  Trash2,
  Pencil,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
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
  useSecrets,
  useSecretAuditLogs,
  useCreateSecret,
  useUpdateSecret,
  useDeleteSecret,
  useRotateSecret,
} from '@/hooks/useSecrets';
import type { Secret, SecretAuditLog } from '@/types/database';
import { AddSecretModal, type AddSecretPayload } from '@/components/secrets/add-secret-modal';
import { EditSecretModal, type EditSecretPayload } from '@/components/secrets/edit-secret-modal';
import {
  KeychainConfigForm,
  type KeychainConfigValues,
} from '@/components/secrets/keychain-config-form';

const STORAGE_LABELS: Record<string, string> = {
  os_keychain: 'OS Keychain',
  onepassword: '1Password',
  encrypted_fallback: 'Encrypted fallback',
};

export function Secrets() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [config, setConfig] = useState<KeychainConfigValues>({
    keychainEnabled: true,
    onepasswordEnabled: false,
    encryptedFallbackEnabled: true,
  });

  const { data: secrets = [], isLoading: secretsLoading } = useSecrets();
  const { data: auditLogs = [], isLoading: auditLoading } = useSecretAuditLogs(50);

  const createSecret = useCreateSecret();
  const updateSecret = useUpdateSecret();
  const deleteSecret = useDeleteSecret();
  const rotateSecret = useRotateSecret();

  const handleAddSecret = async (payload: AddSecretPayload) => {
    await createSecret.mutateAsync(payload);
    setAddModalOpen(false);
  };

  const handleEditSecret = async (payload: EditSecretPayload) => {
    if (!editingSecret) return;
    await updateSecret.mutateAsync({ id: editingSecret.id, data: payload });
    setEditModalOpen(false);
    setEditingSecret(null);
  };

  const openEdit = (secret: Secret) => {
    setEditingSecret(secret);
    setEditModalOpen(true);
  };

  const handleRotate = (secret: Secret) => {
    rotateSecret.mutate(
      { id: secret.id },
      {
        onSuccess: () => setEditModalOpen(false),
      }
    );
  };

  const handleDelete = (secret: Secret) => {
    if (window.confirm(`Remove secret "${secret.name}"? This cannot be undone.`)) {
      deleteSecret.mutate(secret.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Secrets &amp; Keychain</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store and manage secrets securely. No plaintext on disk.
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add secret
        </Button>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" aria-hidden />
            <CardTitle className="text-base">Keychain status</CardTitle>
          </div>
          <CardDescription>
            {config.keychainEnabled || config.onepasswordEnabled
              ? 'Keychain or 1Password is configured. Secrets can be stored in the vault.'
              : 'Using encrypted fallback only. Enable OS keychain or 1Password for stronger isolation.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {config.keychainEnabled && (
            <Badge variant="secondary" className="bg-success/15 text-success border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              OS Keychain
            </Badge>
          )}
          {config.onepasswordEnabled && (
            <Badge variant="secondary" className="bg-success/15 text-success border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              1Password
            </Badge>
          )}
          {!config.keychainEnabled && !config.onepasswordEnabled && (
            <Badge variant="secondary" className="bg-warning/15 text-warning border-0">
              <AlertCircle className="h-3 w-3 mr-1" />
              Fallback only
            </Badge>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="secrets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="secrets">Secrets management</TabsTrigger>
          <TabsTrigger value="setup">Setup &amp; configuration</TabsTrigger>
          <TabsTrigger value="audit">Audit logs</TabsTrigger>
        </TabsList>

        <TabsContent value="secrets" className="space-y-4">
          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="text-lg">Stored secrets</CardTitle>
              <CardDescription>
                Add, edit, or rotate secrets. Values are never shown after save.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {secretsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : secrets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <Key className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
                  <p className="text-sm font-medium text-foreground">No secrets yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Add a secret to store API keys, tokens, or other credentials securely.
                  </p>
                  <Button
                    variant="default"
                    className="mt-4 transition-transform hover:scale-[1.02]"
                    onClick={() => setAddModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add secret
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[320px] pr-4">
                  <ul className="space-y-2">
                    {secrets.map((secret) => (
                      <li
                        key={secret.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg border border-border p-4',
                          'transition-colors hover:bg-secondary/50'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Key className="h-5 w-5 text-primary" aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{secret.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {STORAGE_LABELS[secret.storage_method] ?? secret.storage_method} · Updated{' '}
                              {formatDistanceToNow(new Date(secret.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {STORAGE_LABELS[secret.storage_method] ?? secret.storage_method}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(secret)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRotate(secret)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Rotate secret
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(secret)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <KeychainConfigForm values={config} onChange={setConfig} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" aria-hidden />
                <CardTitle className="text-lg">Audit logs</CardTitle>
              </div>
              <CardDescription>
                Recent secret access, rotation, and configuration changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
                  <p className="text-sm font-medium text-foreground">No audit entries yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Actions on secrets will appear here.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-4">
                  <ul className="space-y-2" role="list">
                    {auditLogs.map((log: SecretAuditLog) => (
                      <li
                        key={log.id}
                        className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                      >
                        <span className="font-medium capitalize">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddSecretModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddSecret}
        isSubmitting={createSecret.isPending}
      />
      <EditSecretModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        secret={editingSecret}
        onSubmit={handleEditSecret}
        isSubmitting={updateSecret.isPending}
      />
    </div>
  );
}
