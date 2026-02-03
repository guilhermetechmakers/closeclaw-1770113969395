import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Plus } from 'lucide-react';

export function Nodes() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Nodes (Paired Devices)</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Pair node
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nodes list</CardTitle>
          <CardDescription>Capability badges, pair flow (QR/code), node details (exec allowlist, wake/config, tokens), approval history, revoke/unpair.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No paired nodes. Use Pair node to add a device via QR or code.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pair node</CardTitle>
          <CardDescription>QR on left, code & instructions on right, expiry countdown.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
            <div className="text-center">
              <QrCode className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Start pairing to show QR and code.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
