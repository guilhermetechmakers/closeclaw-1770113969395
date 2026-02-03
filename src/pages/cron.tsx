import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Cron() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Cron Jobs & Scheduler</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cron list</CardTitle>
          <CardDescription>CRUD scheduled jobs. Create/edit modal: cron builder, payload, session target, isolation.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No cron jobs. Create one to run skills on a schedule.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run history</CardTitle>
          <CardDescription>Run now / abort controls.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No run history.</p>
        </CardContent>
      </Card>
    </div>
  );
}
