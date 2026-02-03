import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Paperclip, Wrench, Slash } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SLASH_COMMANDS = [
  { id: 'new', name: 'new', description: 'Start a new session' },
  { id: 'reset', name: 'reset', description: 'Reset current session' },
  { id: 'stop', name: 'stop', description: 'Stop/pause session' },
] as const;

export type SlashCommandId = (typeof SLASH_COMMANDS)[number]['id'];

export interface ComposerWithSlashProps {
  sessionId: string | null;
  onSend: (
    text: string,
    options?: { toolName?: string; attachmentUrls?: { url: string; name?: string }[] }
  ) => void;
  onSlashCommand?: (command: SlashCommandId) => void;
  onAttachClick: () => void;
  onToolSelect?: (toolName: string) => void;
  disabled?: boolean;
  isSending?: boolean;
  availableTools?: { id: string; name: string }[];
  className?: string;
}

export function ComposerWithSlash({
  sessionId,
  onSend,
  onSlashCommand,
  onAttachClick,
  onToolSelect,
  disabled,
  isSending,
  availableTools = [],
  className,
}: ComposerWithSlashProps) {
  const [text, setText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [slashSuggestionsOpen, setSlashSuggestionsOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const filteredCommands = React.useMemo(() => {
    if (!slashFilter) return [...SLASH_COMMANDS];
    const lower = slashFilter.toLowerCase();
    return SLASH_COMMANDS.filter(
      (c) => c.name.toLowerCase().startsWith(lower) || c.name.toLowerCase().includes(lower)
    );
  }, [slashFilter]);

  const openSlashSuggestions = useCallback((filter: string) => {
    setSlashFilter(filter);
    setSlashSuggestionsOpen(true);
    setSelectedSuggestionIndex(0);
  }, []);

  const closeSlashSuggestions = useCallback(() => {
    setSlashSuggestionsOpen(false);
    setSlashFilter('');
    setSelectedSuggestionIndex(0);
  }, []);

  useEffect(() => {
    if (!text.startsWith('/')) {
      closeSlashSuggestions();
      return;
    }
    const afterSlash = text.slice(1).split(/\s/)[0] ?? '';
    openSlashSuggestions(afterSlash);
  }, [text, openSlashSuggestions, closeSlashSuggestions]);

  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [slashFilter]);

  useEffect(() => {
    if (!slashSuggestionsOpen || filteredCommands.length === 0) return;
    const el = suggestionsRef.current?.querySelector(`[data-index="${selectedSuggestionIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [slashSuggestionsOpen, selectedSuggestionIndex, filteredCommands.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!slashSuggestionsOpen || filteredCommands.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((i) =>
          i < filteredCommands.length - 1 ? i + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((i) =>
          i > 0 ? i - 1 : filteredCommands.length - 1
        );
        return;
      }
      if (e.key === 'Enter' && filteredCommands[selectedSuggestionIndex]) {
        e.preventDefault();
        const cmd = filteredCommands[selectedSuggestionIndex];
        if (onSlashCommand && (cmd.id === 'new' || cmd.id === 'reset' || cmd.id === 'stop')) {
          onSlashCommand(cmd.id);
          setText('');
          closeSlashSuggestions();
        } else {
          setText(`/${cmd.name} `);
          closeSlashSuggestions();
        }
        return;
      }
      if (e.key === 'Escape') {
        closeSlashSuggestions();
      }
    },
    [
      slashSuggestionsOpen,
      filteredCommands,
      selectedSuggestionIndex,
      onSlashCommand,
      closeSlashSuggestions,
    ]
  );

  const handleSelectSuggestion = useCallback(
    (cmd: (typeof SLASH_COMMANDS)[number]) => {
      if (onSlashCommand && (cmd.id === 'new' || cmd.id === 'reset' || cmd.id === 'stop')) {
        onSlashCommand(cmd.id);
        setText('');
      } else {
        setText(`/${cmd.name} `);
      }
      closeSlashSuggestions();
      inputRef.current?.focus();
    },
    [onSlashCommand, closeSlashSuggestions]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || !sessionId) return;
      if (trimmed.startsWith('/')) {
        const cmdName = trimmed.slice(1).split(/\s/)[0]?.toLowerCase();
        const cmd = SLASH_COMMANDS.find((c) => c.name === cmdName);
        if (cmd && onSlashCommand && (cmd.id === 'new' || cmd.id === 'reset' || cmd.id === 'stop')) {
          onSlashCommand(cmd.id);
          setText('');
          return;
        }
      }
      onSend(trimmed, { toolName: selectedTool ?? undefined });
      setText('');
      setSelectedTool(null);
    },
    [text, sessionId, onSend, selectedTool, onSlashCommand]
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
      <div className="relative flex items-end gap-2">
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
        <div className="relative flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or / for commands..."
              disabled={disabled || !sessionId}
              className="min-h-10 flex-1 rounded-md border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring pr-8"
              aria-label="Message input"
              aria-autocomplete="list"
              aria-expanded={slashSuggestionsOpen}
              aria-controls="slash-suggestions"
            />
            {text.startsWith('/') && (
              <Slash className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            )}
            {slashSuggestionsOpen && filteredCommands.length > 0 && (
              <ul
                id="slash-suggestions"
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-card py-1 shadow-lg"
                role="listbox"
              >
                {filteredCommands.map((cmd, idx) => (
                  <li key={cmd.id} role="option" aria-selected={idx === selectedSuggestionIndex}>
                    <button
                      type="button"
                      data-index={idx}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                        idx === selectedSuggestionIndex
                          ? 'bg-primary/15 text-primary'
                          : 'text-foreground hover:bg-secondary'
                      )}
                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                      onClick={() => handleSelectSuggestion(cmd)}
                    >
                      <span className="font-medium">/{cmd.name}</span>
                      <span className="text-muted-foreground">{cmd.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
