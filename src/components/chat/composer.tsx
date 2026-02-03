import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Paperclip, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComposerProps {
  sessionId: string | null;
  onSend: (text: string, options?: { toolName?: string; attachmentUrls?: { url: string; name?: string }[] }) => void;
  onAttachClick: () => void;
  onToolSelect?: (toolName: string) => void;
  disabled?: boolean;
  isSending?: boolean;
  availableTools?: { id: string; name: string }[];
  className?: string;
}

export function Composer({
  sessionId,
  onSend,
  onAttachClick,
  onToolSelect,
  disabled,
  isSending,
  availableTools = [],
  className,
}: ComposerProps) {
  const [text, setText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || !sessionId) return;
      onSend(trimmed, { toolName: selectedTool ?? undefined });
      setText('');
      setSelectedTool(null);
    },
    [text, sessionId, onSend, selectedTool]
  );

  const canSend = Boolean(sessionId && text.trim() && !disabled && !isSending);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-2 border-t border-border bg-card p-4 transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onAttachClick}
          disabled={disabled || !sessionId}
          aria-label="Attach file"
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            disabled={disabled || !sessionId}
            className="min-h-10 flex-1 rounded-md border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Message input"
          />
          {availableTools.length > 0 && (
            <Select
              value={selectedTool ?? ''}
              onValueChange={(v) => {
                setSelectedTool(v || null);
                if (v && onToolSelect) onToolSelect(v);
              }}
              disabled={disabled || !sessionId}
            >
              <SelectTrigger
                className="w-full sm:w-[140px]"
                aria-label="Select tool"
              >
                <Wrench className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Tool" />
              </SelectTrigger>
              <SelectContent>
                {availableTools.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label="Send message"
          className="shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          {isSending ? (
            <span className="h-4 w-4 animate-pulse rounded-full bg-primary-foreground" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
