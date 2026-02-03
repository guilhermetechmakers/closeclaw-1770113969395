import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export function Webhooks() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Webhooks & Hooks</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create webhook
        </Button>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="hooks">Hook scripts</TabsTrigger>
          <TabsTrigger value="transform">Payload transformer</TabsTrigger>
          <TabsTrigger value="gmail">Gmail Pub/Sub</TabsTrigger>
        </TabsList>
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook endpoints</CardTitle>
              <CardDescription>List (token), create webhook modal.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No webhooks. Create one to receive inbound events.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hooks">
          <Card>
            <CardHeader>
              <CardTitle>Hook scripts editor</CardTitle>
              <CardDescription>Sandbox environment for lifecycle hooks.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure hook scripts (restricted JS/Python).</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transform">
          <Card>
            <CardHeader>
              <CardTitle>Payload transformer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Transform webhook payloads before routing.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gmail">
          <Card>
            <CardHeader>
              <CardTitle>Gmail Pub/Sub guided setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Guided flow for Gmail Pub/Sub integration.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
