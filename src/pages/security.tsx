import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Play } from 'lucide-react';

export function Security() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Security Audit</h1>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Run audit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit summary / risk score</CardTitle>
          <CardDescription>Automated security checks and remediation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-success" />
            <span className="text-lg font-medium">No critical issues</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Run audit to get current score.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issue list</CardTitle>
          <CardDescription>Remediation and auto-fix toggle for each finding.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No issues. (Checks: plaintext secrets, open binds, risky skill permissions.)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident response</CardTitle>
          <CardDescription>Quick actions for security incidents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Revoke sessions</Button>
            <Button variant="outline" size="sm">Rotate secrets</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
