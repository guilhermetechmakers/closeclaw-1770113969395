import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types/database';
import type { SessionRoutingType } from '@/types/database';

export interface SessionConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ChatSession | null;
  routingType: SessionRoutingType;
  peerId: string | null;
  onSave: (routingType: SessionRoutingType, peerId: string | null) => void;
  isLoading?: boolean;
  peerOptions?: { id: string; name: string }[];
  className?: string;
}

export function SessionConfigurationModal({
  open,
  onOpenChange,
  session,
  routingType: initialRoutingType,
  peerId: initialPeerId,
  onSave,
  isLoading,
  peerOptions = [],
  className,
}: SessionConfigurationModalProps) {
  const [routingType, setRoutingType] = React.useState<SessionRoutingType>(initialRoutingType);
  const [peerId, setPeerId] = React.useState<string | null>(initialPeerId);

  React.useEffect(() => {
    if (open) {
      setRoutingType(initialRoutingType);
      setPeerId(initialPeerId);
    }
  }, [open, initialRoutingType, initialPeerId]);

  const handleSave = () => {
    onSave(routingType, peerId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[640px]', className)}
        aria-describedby="session-config-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Session configuration
          </DialogTitle>
          <DialogDescription id="session-config-description">
            Choose how messages are routed: shared (main session) or isolated per peer/channel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="routing-type">Routing mode</Label>
            <Select
              value={routingType}
              onValueChange={(v) => setRoutingType(v as SessionRoutingType)}
              disabled={!session}
            >
              <SelectTrigger id="routing-type" className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared (main session)</SelectItem>
                <SelectItem value="isolate">Isolated (per peer/channel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {routingType === 'isolate' && peerOptions.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="peer">Peer / channel</Label>
              <Select
                value={peerId ?? ''}
                onValueChange={(v) => setPeerId(v || null)}
              >
                <SelectTrigger id="peer" className="w-full">
                  <SelectValue placeholder="Select peer" />
                </SelectTrigger>
                <SelectContent>
                  {peerOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !session}>
            {isLoading ? (
              <span className="h-4 w-4 animate-pulse rounded-full bg-primary-foreground" />
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
