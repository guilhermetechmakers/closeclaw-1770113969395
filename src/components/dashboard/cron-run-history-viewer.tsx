import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { History, CheckCircle2, XCircle, Loader2, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CronRunHistory } from '@/types/database';

interface CronRunHistoryViewerProps {
  jobId: string | null;
  runs: CronRunHistory[];
  isLoading?: boolean;
  className?: string;
}

const statusConfig: Record<
  CronRunHistory['status'],
  { label: string; icon: typeof CheckCircle2; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  running: { label: 'Running', icon: Loader2, variant: 'secondary' },
  completed: { label: 'Completed', icon: CheckCircle2, variant: 'default' },
  failed: { label: 'Failed', icon: XCircle, variant: 'destructive' },
  aborted: { label: 'Aborted', icon: Ban, variant: 'outline' },
};

export function CronRunHistoryViewer({
  jobId,
  runs,
  isLoading = false,
  className,
}: CronRunHistoryViewerProps) {
  if (!jobId) {
    return (
      <Card className={cn('rounded-[10px] border border-border bg-card shadow-card', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Run history
          </CardTitle>
          <CardDescription>
            Select a job to view its run history, or run a job to see entries here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No job selected. Run a job from the list above to see execution logs and output.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn('rounded-[10px] border border-border bg-card shadow-card', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!runs.length) {
    return (
      <Card className={cn('rounded-[10px] border border-border bg-card shadow-card', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Run history
          </CardTitle>
          <CardDescription>
            Past executions for this job. Run the job to see entries here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <History className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No runs yet</p>
            <p className="text-xs text-muted-foreground">
              Use &quot;Run now&quot; on a job to execute it and record history.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('rounded-[10px] border border-border bg-card shadow-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-muted-foreground" />
          Run history
        </CardTitle>
        <CardDescription>
          Past executions with output and logs. Newest first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <ul className="space-y-3">
            {runs.map((run) => {
              const config = statusConfig[run.status];
              const Icon = config.icon;
              return (
                <li
                  key={run.id}
                  className="rounded-lg border border-border bg-secondary/30 p-4 transition-shadow hover:shadow-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant} className="gap-1">
                        {run.status === 'running' ? (
                          <Icon className="h-3 w-3 animate-spin" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(run.execution_time), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(run.execution_time).toLocaleString()}
                    </span>
                  </div>
                  {(run.output != null && run.output !== '') || (run.log != null && run.log !== '') ? (
                    <div className="mt-3 space-y-2">
                      {run.output != null && run.output !== '' && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Output</p>
                          <pre className="mt-1 max-h-24 overflow-auto rounded bg-background/80 p-2 text-xs font-mono">
                            {run.output}
                          </pre>
                        </div>
                      )}
                      {run.log != null && run.log !== '' && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Log</p>
                          <pre className="mt-1 max-h-24 overflow-auto rounded bg-background/80 p-2 text-xs font-mono whitespace-pre-wrap">
                            {run.log}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
