import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  X,
  Wrench,
  Cpu,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RunTrace } from '@/types/database';

export interface RunTraceViewerProps {
  trace: RunTrace | null | undefined;
  isLoading?: boolean;
  onClose?: () => void;
  onExport?: () => void;
  className?: string;
}

function formatMs(ms: number | null | undefined): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function TraceNode({
  label,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded border border-border bg-secondary/30 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-secondary/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2 font-mono text-xs text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

export function RunTraceViewer({
  trace,
  isLoading,
  onClose,
  onExport,
  className,
}: RunTraceViewerProps) {
  if (isLoading) {
    return (
      <Card
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-200',
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Run trace
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trace) {
    return (
      <Card
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-200',
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Run trace
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-sm text-muted-foreground">
            Select a log entry to view its trace.
          </p>
        </CardContent>
      </Card>
    );
  }

  const toolInvocation = Array.isArray(trace.tool_invocation) ? trace.tool_invocation : [];
  const modelCalls = Array.isArray(trace.model_calls) ? trace.model_calls : [];

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-200',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Run trace
        </CardTitle>
        <div className="flex items-center gap-1">
          {onExport && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              aria-label="Export trace"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Duration: {formatMs(trace.duration_ms)}
        </div>
        <ScrollArea className="h-[320px]">
          <div className="space-y-2 p-3">
            <TraceNode
              label="Tool invocations"
              icon={Wrench}
              defaultOpen
            >
              {toolInvocation.length === 0 ? (
                <p className="text-muted-foreground">None</p>
              ) : (
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(toolInvocation, null, 2)}
                </pre>
              )}
            </TraceNode>
            <TraceNode
              label="Model calls"
              icon={Cpu}
              defaultOpen
            >
              {modelCalls.length === 0 ? (
                <p className="text-muted-foreground">None</p>
              ) : (
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(modelCalls, null, 2)}
                </pre>
              )}
            </TraceNode>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
