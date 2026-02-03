import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function Voice() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-semibold">Voice & Media</h1>

      <Card>
        <CardHeader>
          <CardTitle>Wake words</CardTitle>
          <CardDescription>Configure wake words for voice activation.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No wake words configured.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Talk mode</CardTitle>
          <CardDescription>Enable/disable voice interaction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="talk">Talk mode</Label>
            <Switch id="talk" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcription backends</CardTitle>
          <CardDescription>Order and configure transcription providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No backends configured.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TTS provider</CardTitle>
          <CardDescription>Text-to-speech configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No TTS provider configured.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media storage</CardTitle>
          <CardDescription>Where to store recordings and media.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Default local storage.</p>
        </CardContent>
      </Card>
    </div>
  );
}
