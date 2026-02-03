import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Key, Shield, Unlink } from 'lucide-react';

export function Profile() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile summary
          </CardTitle>
          <CardDescription>Account and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">U</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">user@example.com</p>
            <p className="text-sm text-muted-foreground">Cloud-linked</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlink className="h-5 w-5" />
            Connected accounts
          </CardTitle>
          <CardDescription>OAuth and linked accounts; unlink here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No connected accounts.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Password, 2FA, active sessions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" size="sm">Change password</Button>
          <div className="flex items-center justify-between">
            <Label htmlFor="2fa">Two-factor authentication</Label>
            <Switch id="2fa" />
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">Active sessions: 1</p>
          <Button variant="outline" size="sm">Revoke other sessions</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>Create and manage API keys.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">Create API key</Button>
          <p className="mt-2 text-sm text-muted-foreground">Keychain / 1Password integration can be enabled in Settings.</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
