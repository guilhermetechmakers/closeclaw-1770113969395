import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';

export function Browser() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">Browser Automation Console</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile controls</CardTitle>
          <CardDescription>Start/stop managed Chromium profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button size="sm">
            <Play className="mr-1 h-4 w-4" />
            Start
          </Button>
          <Button variant="outline" size="sm">
            <Square className="mr-1 h-4 w-4" />
            Stop
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tab inspector</CardTitle>
          <CardDescription>Thumbnails and tab list.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No profile running. Start profile to inspect tabs.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation runner</CardTitle>
          <CardDescription>Run automation scripts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Capture tools: screenshot, PDF, DOM.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CDP connector settings</CardTitle>
          <CardDescription>Remote CDP proxies; CDP token as secret.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Configure CDP connection.</p>
        </CardContent>
      </Card>
    </div>
  );
}
