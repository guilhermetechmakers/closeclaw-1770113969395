import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types/database';

export interface ChatSidebarProps {
  session: ChatSession | null;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  currentSessionId: string | null;
  routingTargets?: { id: string; name: string; type: string }[];
  className?: string;
}

export function ChatSidebar({
  session,
  sessions,
  onSelectSession,
  currentSessionId,
  routingTargets = [],
  className,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        'flex w-full flex-col gap-4 lg:w-72 lg:shrink-0',
        className
      )}
      aria-label="Chat sidebar"
    >
      <Card className="rounded-lg border border-border bg-card shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Session</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {session ? (
            <p className="font-medium text-foreground">{session.title}</p>
          ) : (
            <p>Main session (default)</p>
          )}
          {session && (
            <p className="mt-1 text-xs">
              Status: <Badge variant="outline">{session.status}</Badge>
            </p>
          )}
        </CardContent>
      </Card>

      {sessions.length > 1 && (
        <Card className="rounded-lg border border-border bg-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <ul className="space-y-1">
                {sessions.slice(0, 10).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelectSession(s.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                        currentSessionId === s.id
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-lg border border-border bg-card shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Routing targets</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {routingTargets.length === 0 ? (
            <p>No channels configured.</p>
          ) : (
            <ul className="space-y-1">
              {routingTargets.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <Radio className="h-4 w-4 shrink-0" />
                  <span>{t.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {t.type}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
