import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useProfile,
  useUpdateProfile,
  useOAuthAccounts,
  useUnlinkOAuthAccount,
  useDeviceSessions,
  useRevokeSession,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useSecuritySettings,
  useUpdateSecuritySettings,
} from '@/hooks/useProfile';
import {
  User,
  Key,
  Shield,
  Unlink,
  Monitor,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(64),
  scope: z.string().min(1, 'Scope is required').max(128),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const OAUTH_PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub',
  google: 'Google',
  discord: 'Discord',
  slack: 'Slack',
};

function ProfileSummaryCard() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    profile?.display_name ?? ''
  );
  useEffect(() => {
    if (!editing && profile?.display_name !== undefined) {
      setDisplayName(profile.display_name ?? '');
    }
  }, [profile?.display_name, editing]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const name = profile?.display_name || 'User';
  const email = (profile as { email?: string })?.email ?? '—';
  const workspacePath = profile?.workspace_path ?? '—';
  const initials = name.slice(0, 2).toUpperCase();

  const handleSaveDisplayName = () => {
    updateProfile.mutate(
      { display_name: displayName || null },
      {
        onSuccess: () => setEditing(false),
      }
    );
  };

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile summary
        </CardTitle>
        <CardDescription>Account and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt={name} />
          <AvatarFallback className="text-lg bg-primary/20 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="max-w-xs"
                aria-label="Display name"
              />
              <Button
                size="sm"
                onClick={handleSaveDisplayName}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setDisplayName(profile?.display_name ?? '');
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{name}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground"
                onClick={() => {
                  setDisplayName(profile?.display_name ?? '');
                  setEditing(true);
                }}
                aria-label="Edit display name"
              >
                Edit
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          <p className="text-xs text-muted-foreground">
            Workspace: <span className="font-mono truncate">{workspacePath}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectedAccountsCard() {
  const { data: accounts, isLoading } = useOAuthAccounts();
  const unlink = useUnlinkOAuthAccount();
  const [unlinkId, setUnlinkId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full mt-2" />
        </CardContent>
      </Card>
    );
  }

  const list = Array.isArray(accounts) ? accounts : [];

  return (
    <>
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlink className="h-5 w-5" />
            Connected accounts
          </CardTitle>
          <CardDescription>
            OAuth and linked accounts; unlink here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No connected accounts.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect GitHub, Google, or other providers from Settings.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {list.map((acc) => (
                <li
                  key={acc.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
                >
                  <span className="font-medium">
                    {OAUTH_PROVIDER_LABELS[acc.provider] ?? acc.provider}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUnlinkId(acc.id)}
                    disabled={unlink.isPending}
                    aria-label={`Unlink ${acc.provider}`}
                  >
                    Unlink
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!unlinkId} onOpenChange={() => setUnlinkId(null)}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Unlink account</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink this account? You may need to
              sign in again with this provider to reconnect.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (unlinkId) {
                  unlink.mutate(unlinkId, {
                    onSuccess: () => setUnlinkId(null),
                  });
                }
              }}
              disabled={unlink.isPending}
            >
              {unlink.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Unlink'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SecurityCard() {
  const { data: sessions, isLoading: sessionsLoading } = useDeviceSessions();
  const { data: security, isLoading: securityLoading } = useSecuritySettings();
  const updateSecurity = useUpdateSecuritySettings();
  const revokeSession = useRevokeSession();
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const isLoading = sessionsLoading || securityLoading;
  const twoFactorEnabled = security?.two_factor_enabled ?? false;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  const sessionList = Array.isArray(sessions) ? sessions : [];

  return (
    <>
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Password, 2FA, active sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/forgot-password">Change password</Link>
          </Button>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <Label htmlFor="2fa" className="cursor-pointer">
              Two-factor authentication
            </Label>
            <Switch
              id="2fa"
              checked={twoFactorEnabled}
              onCheckedChange={(checked) =>
                updateSecurity.mutate({ two_factor_enabled: checked })
              }
              disabled={updateSecurity.isPending}
            />
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2">Active sessions</p>
            {sessionList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No other sessions.
              </p>
            ) : (
              <ul className="space-y-2">
                {sessionList.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{s.device_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(s.last_active_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevokeId(s.id)}
                      disabled={revokeSession.isPending}
                      aria-label={`Revoke ${s.device_name}`}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Revoke session</DialogTitle>
            <DialogDescription>
              This device will be signed out. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (revokeId) {
                  revokeSession.mutate(revokeId, {
                    onSuccess: () => setRevokeId(null),
                  });
                }
              }}
              disabled={revokeSession.isPending}
            >
              {revokeSession.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Revoke'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ApiKeysCard() {
  const { data: keys, isLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: '', scope: 'read' },
  });

  const onSubmit = (values: ApiKeyFormValues) => {
    createKey.mutate(values, {
      onSuccess: (data) => {
        setCreatedKey(data.key);
        form.reset();
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-12 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  const keyList = Array.isArray(keys) ? keys : [];

  return (
    <>
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Create and manage scoped API keys for integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCreateOpen(true);
              setCreatedKey(null);
            }}
          >
            Create API key
          </Button>
          {keyList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-6 text-center">
              <KeyRound className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                No API keys yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a key to use with external tools or scripts.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {keyList.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{k.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {k.key_prefix}…
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevokeId(k.id)}
                    disabled={revokeKey.isPending}
                    aria-label={`Revoke key ${k.name}`}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            Keychain / 1Password integration can be enabled below.
          </p>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Choose a name and scope. The key value is shown only once.
            </DialogDescription>
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-2">
              <Label>Your new key (copy now)</Label>
              <Input
                readOnly
                value={createdKey}
                className="font-mono text-sm"
                aria-label="API key value"
              />
              <p className="text-xs text-muted-foreground">
                Store this securely; it won&apos;t be shown again.
              </p>
              <DialogFooter>
                <Button onClick={() => setCreateOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  {...form.register('name')}
                  placeholder="e.g. CI pipeline"
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-scope">Scope</Label>
                <Input
                  id="key-scope"
                  {...form.register('scope')}
                  placeholder="e.g. read, write"
                  aria-invalid={!!form.formState.errors.scope}
                />
                {form.formState.errors.scope && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.scope.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createKey.isPending}>
                  {createKey.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Revoke API key</DialogTitle>
            <DialogDescription>
              This key will stop working immediately. Any integrations using it
              will need a new key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (revokeId) {
                  revokeKey.mutate(revokeId, {
                    onSuccess: () => setRevokeId(null),
                  });
                }
              }}
              disabled={revokeKey.isPending}
            >
              {revokeKey.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Revoke'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function KeychainCard() {
  const { data: security, isLoading } = useSecuritySettings();
  const updateSecurity = useUpdateSecuritySettings();

  const keychainEnabled = security?.keychain_integration_enabled ?? false;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Keychain / 1Password
        </CardTitle>
        <CardDescription>
          Use 1Password or system keychain for secure login and autofill.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <Label htmlFor="keychain" className="cursor-pointer">
            Enable 1Password integration
          </Label>
          <Switch
            id="keychain"
            checked={keychainEnabled}
            onCheckedChange={(checked) =>
              updateSecurity.mutate({
                keychain_integration_enabled: checked,
              })
            }
            disabled={updateSecurity.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function Profile() {
  return (
    <div
      className={cn(
        'mx-auto max-w-3xl space-y-6 animate-fade-in-up'
      )}
    >
      <h1 className="text-2xl font-semibold">Profile</h1>

      <ProfileSummaryCard />
      <ConnectedAccountsCard />
      <SecurityCard />
      <ApiKeysCard />
      <KeychainCard />

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
