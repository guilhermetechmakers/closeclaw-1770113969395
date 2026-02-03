import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up py-8">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-sm text-muted-foreground">
          <p>Full terms text. Accept/decline controls for cloud features. Document download.</p>
        </CardContent>
      </Card>
      <Button variant="outline" asChild>
        <Link to="/">Back</Link>
      </Button>
    </div>
  );
}
