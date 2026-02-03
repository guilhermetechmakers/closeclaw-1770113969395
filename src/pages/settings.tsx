import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Settings() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">Settings / Preferences</h1>

      <Tabs defaultValue="network">
        <TabsList>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="remote">Remote access</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="tools">Tool policies</TabsTrigger>
          <TabsTrigger value="model">Model defaults</TabsTrigger>
        </TabsList>
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network binding / TLS</CardTitle>
              <CardDescription>Bind address and TLS certificate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bind address</Label>
                <Input placeholder="0.0.0.0:3000" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="remote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remote access (tailnet / proxy)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure Tailscale or proxy for remote access.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Secrets management</CardTitle>
              <CardDescription>Keychain, 1Password CLI, encrypted fallback.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Never write long-lived tokens to plaintext.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tool policies</CardTitle>
              <CardDescription>Exec allowlist, sandbox toggle.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="sandbox">Sandbox tools</Label>
                <Switch id="sandbox" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model defaults</CardTitle>
              <CardDescription>Default provider and model for runs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Default model</Label>
                <Input placeholder="gpt-4" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Button>Restart / Apply</Button>
          <p className="mt-2 text-sm text-muted-foreground">Restart gateway to apply some settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
