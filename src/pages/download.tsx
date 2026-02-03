import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function DownloadPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install Gateway
          </CardTitle>
          <CardDescription>
            Download the Clawgate gateway for your platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gateway binaries and installers will be available here. For now, use the Open Local UI button if you have the gateway running.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">Open Local UI</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
