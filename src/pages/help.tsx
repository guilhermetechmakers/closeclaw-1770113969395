import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileQuestion, Mail } from 'lucide-react';

export function Help() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">About / Help</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick start
            </CardTitle>
            <CardDescription>Get started with Clawgate.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
              <li>Install and start the gateway.</li>
              <li>Open Control UI and add a channel.</li>
              <li>Message your agent from chat.</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/">Landing</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Docs
            </CardTitle>
            <CardDescription>Documentation links.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Documentation (external link placeholder).</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Support
            </CardTitle>
            <CardDescription>Contact support with context.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Support form with context autofill.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
