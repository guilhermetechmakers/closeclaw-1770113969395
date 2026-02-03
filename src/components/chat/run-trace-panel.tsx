import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TraceEntry {
  id: string;
  runId?: string;
  timestamp: string;
  type: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface RunTracePanelProps {
  traces: TraceEntry[];
  isLoading?: boolean;
  onExport?: () => void;
  className?: string;
}

export function RunTracePanel({
  traces,
  isLoading,
  onExport,
  className,
}: RunTracePanelProps) {
  const [expanded, setExpanded] = useState(false);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-0">
          <ScrollArea className="h-48">
            <div className="space-y-1 p-2">
              {isLoading ? (
                <div className="flex flex-col gap-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-full rounded bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : traces.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No active run.
                </p>
              ) : (
                traces.map((t) => (
                  <div
                    key={t.id}
                    className="rounded border border-border bg-secondary/30 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{t.type}</span>
                      <span className="text-muted-foreground">{t.timestamp}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{t.summary}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
