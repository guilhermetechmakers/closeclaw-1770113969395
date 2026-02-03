import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export function Channels() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Channels & Adapters</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <Tabs defaultValue="channels">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="logs">Delivery logs</TabsTrigger>
          <TabsTrigger value="test">Test console</TabsTrigger>
        </TabsList>
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channels list</CardTitle>
              <CardDescription>Manage chat channel adapters and per-channel policies.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No channels added. Use Add Channel to connect WhatsApp, Telegram, Slack, or Discord.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Channel config</CardTitle>
              <CardDescription>DM policy, group policy, mention gating.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Select a channel to configure.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Delivery logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No delivery logs.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test console</CardTitle>
              <CardDescription>Send test messages to channels.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Select a channel to test.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
