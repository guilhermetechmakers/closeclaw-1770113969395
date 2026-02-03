import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolOption {
  id: string;
  name: string;
  description?: string;
}

export interface ToolInvocationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tools: ToolOption[];
  onSelect: (toolId: string) => void;
  className?: string;
}

export function ToolInvocationSheet({
  open,
  onOpenChange,
  tools,
  onSelect,
  className,
}: ToolInvocationSheetProps) {
  const handleSelect = (toolId: string) => {
    onSelect(toolId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[480px]', className)}
        aria-describedby="tool-sheet-description"
      >
        <DialogHeader>
          <DialogTitle>Invoke tool</DialogTitle>
          <DialogDescription id="tool-sheet-description">
            Select a tool to invoke with your message.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-64">
          <ul className="space-y-1 pr-2">
            {tools.length === 0 ? (
              <li className="py-4 text-center text-sm text-muted-foreground">
                No tools available.
              </li>
            ) : (
              tools.map((t) => (
                <li key={t.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2 py-2.5 text-left"
                    onClick={() => handleSelect(t.id)}
                  >
                    <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{t.name}</span>
                      {t.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </Button>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
