import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <FileQuestion className="h-24 w-24 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">404 Not Found</h1>
      <p className="text-center text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
