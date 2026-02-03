import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Plus, RotateCcw, Square, Paperclip } from 'lucide-react';

export function Chat() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chat Session</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            /new
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-1 h-4 w-4" />
            /reset
          </Button>
          <Button variant="outline" size="sm">
            <Square className="mr-1 h-4 w-4" />
            /stop
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-lg border border-border bg-card">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages yet. Send a message or use a slash command.
              </p>
            </div>
          </ScrollArea>
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" aria-label="Attach">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Session info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Main session (default)
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Routing targets</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No channels configured.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Run trace</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No active run.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
