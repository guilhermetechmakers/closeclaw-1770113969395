import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Building2, Shield, Calendar, Pencil, UserX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AdminWorkspaceMember, AdminWorkspace } from '@/types/database';
import { useAdminProfile } from '@/hooks/useAdmin';

const roleVariants: Record<AdminWorkspaceMember['role'], 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  member: 'secondary',
  viewer: 'outline',
};

export interface AdminUserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: AdminWorkspaceMember | null;
  workspace: AdminWorkspace | null;
  onEdit: () => void;
  onRevoke: () => void;
  isRevoking?: boolean;
}

export function AdminUserDetailModal({
  open,
  onOpenChange,
  member,
  workspace,
  onEdit,
  onRevoke,
  isRevoking = false,
}: AdminUserDetailModalProps) {
  const userId = member?.user_id ?? null;
  const { data: profile, isLoading: profileLoading } = useAdminProfile(userId);

  if (!member) return null;

  const displayName = profile?.display_name ?? null;
  const memberSince = member.created_at
    ? format(parseISO(member.created_at), 'MMM d, yyyy')
    : '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            User details
          </DialogTitle>
          <DialogDescription>
            View and manage this user&apos;s workspace access and role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-3 rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              {profileLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <span className="font-medium">
                  {displayName || '—'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium text-muted-foreground">User ID</span>
              <code className="rounded bg-muted/50 px-2 py-0.5 text-xs font-mono">
                {member.user_id}
              </code>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium text-muted-foreground">Workspace</span>
              <span>{workspace?.name ?? member.workspace_id}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium text-muted-foreground">Role</span>
              <Badge variant={roleVariants[member.role]} className={cn('capitalize')}>
                {member.role}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium text-muted-foreground">Member since</span>
              <span>{memberSince}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onEdit();
              onOpenChange(false);
            }}
            className="transition-transform hover:scale-[1.02]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit role
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onRevoke();
              onOpenChange(false);
            }}
            disabled={isRevoking}
            className="transition-transform hover:scale-[1.02]"
          >
            <UserX className="mr-2 h-4 w-4" />
            {isRevoking ? 'Revoking…' : 'Revoke access'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
