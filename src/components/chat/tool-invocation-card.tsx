import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, Loader2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { ToolInvocation as ToolInvocationType } from '@/types/database';

export interface ToolInvocationCardProps {
  invocation: ToolInvocationType;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  className?: string;
}

const statusVariants: Record<
  ToolInvocationType['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  running: 'default',
  completed: 'outline',
  failed: 'destructive',
  approved: 'outline',
  denied: 'destructive',
};

export function ToolInvocationCard({
  invocation,
  onApprove,
  onDeny,
  className,
}: ToolInvocationCardProps) {
  const isRunning = invocation.status === 'running';
  const canApproveDeny =
    invocation.status === 'completed' || invocation.status === 'running';

  const outputStr =
    invocation.output && typeof invocation.output === 'object'
      ? JSON.stringify(invocation.output, null, 2)
      : invocation.output != null
        ? String(invocation.output)
        : '';

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
      data-invocation-id={invocation.id}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border py-3 px-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{invocation.tool_name}</span>
          <Badge variant={statusVariants[invocation.status]} className="text-xs">
            {invocation.status}
          </Badge>
        </div>
        <span
          className="text-xs text-muted-foreground"
          title={new Date(invocation.created_at).toLocaleString()}
        >
          {formatDistanceToNow(new Date(invocation.created_at), { addSuffix: true })}
        </span>
      </CardHeader>
      <CardContent className="p-4">
        {isRunning && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Running…</span>
            <Progress value={undefined} className="h-1.5 flex-1" />
          </div>
        )}
        {outputStr && (
          <pre className="max-h-48 overflow-auto rounded border border-border bg-secondary/50 p-3 text-xs text-foreground">
            {outputStr}
          </pre>
        )}
        {canApproveDeny && onApprove && onDeny && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => onDeny(invocation.id)}
            >
              <X className="h-4 w-4" />
              Deny
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onApprove(invocation.id)}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
