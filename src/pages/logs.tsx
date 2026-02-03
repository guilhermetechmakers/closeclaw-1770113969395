import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Filter,
  Download,
  ChevronRight,
  Settings,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  XCircle,
} from 'lucide-react';
import { useLogs, useTraceByLogId, useExportLogs } from '@/hooks/useLogs';
import type { LogsFilterParams } from '@/api/logs';
import type { Log, LogSeverity } from '@/types/database';
import { LogFilterModal } from '@/components/logs/filter-modal';
import { LogExportDialog } from '@/components/logs/export-dialog';
import { RunTraceViewer } from '@/components/logs/run-trace-viewer';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG: Record<
  LogSeverity,
  { label: string; icon: React.ElementType; className: string }
> = {
  debug: {
    label: 'debug',
    icon: Bug,
    className: 'text-muted-foreground',
  },
  info: {
    label: 'info',
    icon: Info,
    className: 'text-primary',
  },
  warning: {
    label: 'warning',
    icon: AlertTriangle,
    className: 'text-warning',
  },
  error: {
    label: 'error',
    icon: AlertCircle,
    className: 'text-destructive',
  },
  critical: {
    label: 'critical',
    icon: XCircle,
    className: 'text-destructive font-semibold',
  },
};

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return ts;
  }
}

function LogRow({
  log,
  isSelected,
  onSelect,
}: {
  log: Log;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const config = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG.info;
  const Icon = config.icon;
  const displayMessage = log.redacted_message ?? log.message;
  const truncated =
    displayMessage.length > 200 ? displayMessage.slice(0, 200) + '…' : displayMessage;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-lg border px-3 py-2.5 transition-colors hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card/50'
      )}
      aria-pressed={isSelected}
      aria-label={`View trace for log ${log.id}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Icon className={cn('h-4 w-4 shrink-0', config.className)} aria-hidden />
        <Badge
          variant="secondary"
          className={cn('text-xs font-mono shrink-0', config.className)}
        >
          {config.label}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {formatTimestamp(log.timestamp)}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-xs text-foreground break-words line-clamp-2">
        {truncated}
      </p>
    </button>
  );
}

export function Logs() {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filterParams, setFilterParams] = useState<LogsFilterParams | undefined>({
    limit: 100,
  });
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { data: logList = [], isLoading: logsLoading } = useLogs(filterParams);
  const { data: trace, isLoading: traceLoading } = useTraceByLogId(selectedLogId);
  const exportLogs = useExportLogs();

  const handleApplyFilters = (params: LogsFilterParams) => {
    setFilterParams(params);
  };

  const handleExport = (params: Parameters<typeof exportLogs.mutate>[0]) => {
    exportLogs.mutate(params, {
      onSuccess: (res) => {
        if (res?.download_url) {
          window.open(res.download_url, '_blank');
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header + breadcrumb */}
      <header className="space-y-2">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground font-medium">Logs & Tracing</span>
        </nav>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" aria-hidden />
          Logs & Tracing
        </h1>
        <p className="text-muted-foreground">
          Structured logs and per-run traces. Filter, view traces, and export with redaction.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main: log stream + trace viewer */}
        <div className="space-y-6 min-w-0">
          <Card className="transition-shadow duration-200 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Log stream</CardTitle>
                <CardDescription>
                  Real-time logs with severity. Select a row to view its run trace.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border border-border">
                <div className="p-3 space-y-2">
                  {logsLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))}
                    </>
                  ) : logList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium text-foreground">
                        No logs yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Connect the gateway to stream logs, or logs will appear here once available.
                      </p>
                    </div>
                  ) : (
                    logList.map((log) => (
                      <LogRow
                        key={log.id}
                        log={log}
                        isSelected={selectedLogId === log.id}
                        onSelect={() =>
                          setSelectedLogId((prev) =>
                            prev === log.id ? null : log.id
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <RunTraceViewer
            trace={trace ?? null}
            isLoading={traceLoading}
            onClose={() => setSelectedLogId(null)}
            onExport={undefined}
          />
        </div>

        {/* Sidebar: filter + export */}
        <aside className="space-y-4 lg:max-w-[320px]">
          <Card className="transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Filters & export</CardTitle>
              <CardDescription>
                Refine the log view and export with redaction options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setFilterModalOpen(true)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export logs
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Footer: retention settings link */}
      <footer className="pt-4 border-t border-border">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <Settings className="h-4 w-4" />
          Manage retention settings
        </Link>
      </footer>

      <LogFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        currentFilters={filterParams}
        onApply={handleApplyFilters}
      />
      <LogExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
        isExporting={exportLogs.isPending}
      />
    </div>
  );
}
