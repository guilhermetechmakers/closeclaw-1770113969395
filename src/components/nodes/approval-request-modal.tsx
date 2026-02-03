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
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NodeApproval, Node } from '@/types/database';

interface ApprovalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: NodeApproval | null;
  node: Node | null;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  isUpdating?: boolean;
}

const statusConfig: Record<
  NodeApproval['status'],
  { label: string; variant: 'success' | 'destructive' | 'secondary'; icon: typeof CheckCircle2 }
> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    variant: 'success',
    icon: CheckCircle2,
  },
  denied: {
    label: 'Denied',
    variant: 'destructive',
    icon: XCircle,
  },
};

export function ApprovalRequestModal({
  open,
  onOpenChange,
  approval,
  node,
  onApprove,
  onDeny,
  isUpdating = false,
}: ApprovalRequestModalProps) {
  if (!approval) return null;

  const { label, variant, icon: Icon } = statusConfig[approval.status];
  const isPending = approval.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="approval-description"
      >
        <DialogHeader>
          <DialogTitle>Approval request</DialogTitle>
          <DialogDescription id="approval-description">
            Review and approve or deny this capability or execution request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={variant} className="gap-1">
              <Icon className="h-3 w-3" />
              {label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(approval.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Action</dt>
              <dd className="font-medium capitalize">
                {approval.action_type.replace(/_/g, ' ')}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Node</dt>
              <dd className="font-medium">
                {node?.name ?? node?.id?.slice(0, 8) ?? '—'}
              </dd>
            </div>
            {approval.capability_id && (
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Capability</dt>
                <dd className="font-medium">{approval.capability_id.slice(0, 8)}…</dd>
              </div>
            )}
          </dl>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isPending && (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDeny(approval.id)}
                disabled={isUpdating}
              >
                Deny
              </Button>
              <Button
                onClick={() => onApprove(approval.id)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating…' : 'Approve'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
