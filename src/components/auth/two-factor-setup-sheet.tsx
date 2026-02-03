/**
 * 2FA setup sheet: guides users through enabling two-factor authentication.
 * Can be opened from profile/security after signup or from account settings.
 * Supabase MFA can be enabled via auth.mfa when configured in the project.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Smartphone, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwoFactorSetupSheetProps {
  onEnable?: () => void | Promise<void>;
  onDismiss?: () => void;
  isEnabling?: boolean;
  className?: string;
}

export function TwoFactorSetupSheet({
  onEnable,
  onDismiss,
  isEnabling = false,
  className,
}: TwoFactorSetupSheetProps) {
  return (
    <Card
      className={cn(
        'rounded-[10px] border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <CardTitle className="text-lg">Two-factor authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security by requiring a second factor (e.g. authenticator app or SMS) when signing in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Use an authenticator app (e.g. Google Authenticator, 1Password) or SMS.
          </li>
          <li className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            You’ll be prompted for the code when signing in to your cloud account.
          </li>
        </ul>
        <div className="flex flex-wrap gap-2">
          {onEnable && (
            <Button
              type="button"
              onClick={onEnable}
              disabled={isEnabling}
              className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              {isEnabling ? 'Setting up…' : 'Enable 2FA'}
            </Button>
          )}
          {onDismiss && (
            <Button type="button" variant="outline" onClick={onDismiss}>
              Maybe later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
