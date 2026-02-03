import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { User, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types/database';

export interface MessageThreadProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  currentUserId?: string | null;
  className?: string;
}

function MessageBubble({
  message,
  currentUserId,
}: {
  message: ChatMessageType;
  currentUserId?: string | null;
}) {
  const isUser = message.role === 'user' || message.sender_id === currentUserId;
  const displayName =
    message.role === 'assistant' ? 'Assistant' : message.role === 'system' ? 'System' : 'You';
  const hasAttachments =
    Array.isArray(message.attachment_links) && message.attachment_links.length > 0;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-3 transition-colors duration-200 hover:bg-card/80',
        isUser && 'flex-row-reverse'
      )}
      data-message-id={message.id}
    >
      <Avatar className="h-8 w-8 shrink-0 rounded-full border border-border bg-secondary">
        <AvatarFallback className="text-xs text-muted-foreground">
          {message.role === 'assistant' ? (
            <Bot className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className={cn('flex min-w-0 flex-1 flex-col gap-1', isUser && 'items-end')}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{displayName}</span>
          <span
            className="text-xs text-muted-foreground"
            title={new Date(message.created_at).toLocaleString()}
          >
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-foreground">
          {message.text}
        </p>
        {hasAttachments && (
          <div className="mt-1 flex flex-wrap gap-1">
            {(message.attachment_links as { url: string; name?: string }[]).map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-border bg-secondary px-2 py-1 text-xs text-primary hover:underline"
              >
                {att.name ?? 'Attachment'}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageThread({
  messages,
  isLoading,
  currentUserId,
  className,
}: MessageThreadProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <ScrollArea
      className={cn('flex-1', className)}
      data-testid="message-thread"
    >
      <div className="space-y-1 p-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full max-w-md rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Send a message or use a slash command.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id}
              ref={i === messages.length - 1 ? lastMessageRef : undefined}
            >
              <MessageBubble
                message={msg}
                currentUserId={currentUserId}
              />
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
