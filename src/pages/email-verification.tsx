import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

export function EmailVerification() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verify your email
          </CardTitle>
          <CardDescription>
            Required for signup and sensitive operations (e.g. skill install).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Verification status: Pending
          </div>
          <Button variant="outline" className="w-full">
            Resend verification email
          </Button>
          <div className="space-y-2">
            <Label htmlFor="token">Or enter code manually</Label>
            <Input id="token" placeholder="Verification code" />
          </div>
          <Button asChild className="w-full">
            <Link to="/dashboard">Continue</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
