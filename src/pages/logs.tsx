import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shield,
  ListTree,
  Package,
} from 'lucide-react';
import { useLogs, useTraceByLogId, useExportLogs } from '@/hooks/useLogs';
import type { LogsFilterParams } from '@/api/logs';
import type { Log, LogSeverity } from '@/types/database';
import { LogFilterModal } from '@/components/logs/filter-modal';
import { LogExportDialog } from '@/components/logs/export-dialog';
import { RedactionRulesModal } from '@/components/logs/redaction-rules-modal';
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
  isExportSelected,
  onExportSelect,
}: {
  log: Log;
  isSelected: boolean;
  onSelect: () => void;
  isExportSelected?: boolean;
  onExportSelect?: () => void;
}) {
  const config = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG.info;
  const Icon = config.icon;
  const displayMessage = log.redacted_message ?? log.message;
  const truncated =
    displayMessage.length > 200 ? displayMessage.slice(0, 200) + '…' : displayMessage;

  return (
    <div
      className={cn(
        'flex items-start gap-2 w-full text-left rounded-lg border px-3 py-2.5 transition-colors hover:bg-secondary/50 focus-within:ring-2 focus-within:ring-ring',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card/50'
      )}
    >
      {onExportSelect && (
        <button
          type="button"
          role="checkbox"
          aria-checked={isExportSelected}
          onClick={(e) => {
            e.stopPropagation();
            onExportSelect();
          }}
          className="shrink-0 mt-0.5 rounded border border-border p-1 hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isExportSelected ? 'Deselect for export' : 'Select for export'}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded border-2 border-current',
              isExportSelected ? 'bg-primary border-primary' : 'bg-transparent'
            )}
            aria-hidden
          />
        </button>
      )}
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-0 text-left"
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
    </div>
  );
}

export function Logs() {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [redactionModalOpen, setRedactionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [filterParams, setFilterParams] = useState<LogsFilterParams | undefined>({
    limit: 100,
  });
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [exportSelectedIds, setExportSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleExportSelect = (logId: string) => {
    setExportSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  };

  const selectAllForExport = () => {
    if (exportSelectedIds.size === logList.length) {
      setExportSelectedIds(new Set());
    } else {
      setExportSelectedIds(new Set(logList.map((l) => l.id)));
    }
  };

  const exportSelectedLogIds = useMemo(
    () => (exportSelectedIds.size > 0 ? Array.from(exportSelectedIds) : undefined),
    [exportSelectedIds]
  );

  const openExportWithSelection = (withSelection: boolean) => {
    if (withSelection && exportSelectedIds.size > 0) {
      setExportDialogOpen(true);
    } else {
      setExportSelectedIds(new Set());
      setExportDialogOpen(true);
    }
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-lg bg-muted p-1">
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="traces" className="gap-2">
            <ListTree className="h-4 w-4" />
            Traces
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Package className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
                        [1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))
                      ) : logList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-foreground">No logs yet</p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Connect the gateway to stream logs, or logs will appear here once
                            available.
                          </p>
                        </div>
                      ) : (
                        logList.map((log) => (
                          <LogRow
                            key={log.id}
                            log={log}
                            isSelected={selectedLogId === log.id}
                            onSelect={() =>
                              setSelectedLogId((prev) => (prev === log.id ? null : log.id))
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
            <aside className="space-y-4 lg:max-w-[320px]">
              <Card className="transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Filters & actions</CardTitle>
                  <CardDescription>
                    Refine the log view, export, and redaction rules.
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
                    onClick={() => {
                      setExportSelectedIds(new Set());
                      setExportDialogOpen(true);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export logs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setRedactionModalOpen(true)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Redaction rules
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="traces" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6 min-w-0">
              <Card className="transition-shadow duration-200 hover:shadow-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Run traces</CardTitle>
                    <CardDescription>
                      Select a log entry to view its run trace (tool invocations and model
                      calls).
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-md border border-border">
                    <div className="p-3 space-y-2">
                      {logsLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))
                      ) : logList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <ListTree className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-foreground">
                            No log entries
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Logs appear here when available. Select one to view its run
                            trace.
                          </p>
                        </div>
                      ) : (
                        logList.map((log) => (
                          <LogRow
                            key={log.id}
                            log={log}
                            isSelected={selectedLogId === log.id}
                            onSelect={() =>
                              setSelectedLogId((prev) => (prev === log.id ? null : log.id))
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
            <aside className="space-y-4 lg:max-w-[320px]">
              <Card className="transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Trace actions</CardTitle>
                  <CardDescription>
                    View run trace details and configure redaction for exports.
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
                    onClick={() => setRedactionModalOpen(true)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Redaction rules
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6 min-w-0">
              <Card className="transition-shadow duration-200 hover:shadow-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Export logs</CardTitle>
                    <CardDescription>
                      Select logs to export, or export all filtered results. Choose format and
                      redaction in the confirmation dialog.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllForExport()}
                      aria-pressed={logList.length > 0 && exportSelectedIds.size === logList.length}
                    >
                      {exportSelectedIds.size === logList.length && logList.length > 0
                        ? 'Deselect all'
                        : 'Select all'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openExportWithSelection(exportSelectedIds.size > 0)}
                      disabled={logsLoading || logList.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {exportSelectedIds.size > 0
                        ? `Export ${exportSelectedIds.size} selected`
                        : 'Export all (filtered)'}
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px] rounded-md border border-border">
                    <div className="p-3 space-y-2">
                      {logsLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))
                      ) : logList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-foreground">
                            No logs to export
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Apply filters or wait for logs to appear, then select and export.
                          </p>
                        </div>
                      ) : (
                        logList.map((log) => (
                          <LogRow
                            key={log.id}
                            log={log}
                            isSelected={selectedLogId === log.id}
                            onSelect={() =>
                              setSelectedLogId((prev) => (prev === log.id ? null : log.id))
                            }
                            isExportSelected={exportSelectedIds.has(log.id)}
                            onExportSelect={() => toggleExportSelect(log.id)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            <aside className="space-y-4 lg:max-w-[320px]">
              <Card className="transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Export options</CardTitle>
                  <CardDescription>
                    Configure redaction rules and retention. Export uses your selected format
                    and redaction settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setRedactionModalOpen(true)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Redaction rules
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setFilterModalOpen(true)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>
      </Tabs>

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
        selectedLogIds={exportSelectedLogIds}
      />
      <RedactionRulesModal
        open={redactionModalOpen}
        onOpenChange={setRedactionModalOpen}
      />
    </div>
  );
}
