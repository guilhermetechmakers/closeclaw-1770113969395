import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ServerError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <AlertTriangle className="h-24 w-24 text-destructive" />
      <h1 className="text-2xl font-semibold">500 Server Error</h1>
      <p className="text-center text-muted-foreground">Something went wrong. Retry or report.</p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>Retry</Button>
        <Button variant="outline" asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
