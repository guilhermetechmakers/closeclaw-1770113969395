import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Key, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KeychainConfigValues {
  keychainEnabled: boolean;
  onepasswordEnabled: boolean;
  encryptedFallbackEnabled: boolean;
}

interface KeychainConfigFormProps {
  values: KeychainConfigValues;
  onChange: (values: KeychainConfigValues) => void;
  disabled?: boolean;
  className?: string;
}

export function KeychainConfigForm({
  values,
  onChange,
  disabled = false,
  className,
}: KeychainConfigFormProps) {
  return (
    <Card className={cn('shadow-card transition-shadow hover:shadow-card-hover', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-accent" aria-hidden />
          <CardTitle>Setup &amp; configuration</CardTitle>
        </div>
        <CardDescription>
          Choose where secrets are stored. OS keychain and 1Password keep
          credentials out of the database; encrypted fallback is used when
          keychain is unavailable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="keychain" className="text-base font-medium">
              OS Keychain
            </Label>
            <p className="text-sm text-muted-foreground">
              macOS Keychain, Windows Credential Manager, or Linux secret store
            </p>
          </div>
          <Switch
            id="keychain"
            checked={values.keychainEnabled}
            onCheckedChange={(checked) =>
              onChange({ ...values, keychainEnabled: checked })
            }
            disabled={disabled}
            aria-label="Toggle OS keychain"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="onepassword" className="text-base font-medium">
              1Password integration
            </Label>
            <p className="text-sm text-muted-foreground">
              Store and retrieve secrets via 1Password CLI
            </p>
          </div>
          <Switch
            id="onepassword"
            checked={values.onepasswordEnabled}
            onCheckedChange={(checked) =>
              onChange({ ...values, onepasswordEnabled: checked })
            }
            disabled={disabled}
            aria-label="Toggle 1Password"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="fallback" className="text-base font-medium">
              Encrypted fallback
            </Label>
            <p className="text-sm text-muted-foreground">
              Encrypt and store in database when keychain is unavailable
            </p>
          </div>
          <Switch
            id="fallback"
            checked={values.encryptedFallbackEnabled}
            onCheckedChange={(checked) =>
              onChange({ ...values, encryptedFallbackEnabled: checked })
            }
            disabled={disabled}
            aria-label="Toggle encrypted fallback"
          />
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Long-lived tokens are never written to plaintext. Runtime retrieval
          uses least-privilege scoping.
        </p>
      </CardContent>
    </Card>
  );
}
