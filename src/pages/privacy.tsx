import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up py-8">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-sm text-muted-foreground">
          <p>Full policy text. Accept/decline controls for cloud features. Document download.</p>
          <p className="mt-4">Clawgate is local-first. Data stays on your devices unless you use cloud-linked features. We do not sell your data.</p>
        </CardContent>
      </Card>
      <Button variant="outline" asChild>
        <Link to="/">Back</Link>
      </Button>
    </div>
  );
}
