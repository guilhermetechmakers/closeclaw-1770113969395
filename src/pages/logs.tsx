import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Filter } from 'lucide-react';

export function Logs() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Logs & Tracing</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log stream</CardTitle>
          <CardDescription>Structured logs with filters and redaction preview.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border border-border p-4 font-mono text-xs">
            <pre className="text-muted-foreground">No logs. Connect gateway to stream logs.</pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run trace viewer</CardTitle>
          <CardDescription>Per-run tracing: tool invocation → model calls → outputs. Timestamps, run IDs, costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a run to view trace.</p>
        </CardContent>
      </Card>
    </div>
  );
}
