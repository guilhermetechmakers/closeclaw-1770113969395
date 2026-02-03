import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Node } from '@/types/database';
import { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff } from 'lucide-react';

interface NodeHealthDialogProps {
  node: Node | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateHealth?: (id: string, connection_health: Node['connection_health']) => void;
  isUpdating?: boolean;
}

const healthLabels: Record<Node['connection_health'], string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unknown: 'Unknown',
  offline: 'Offline',
};

const healthVariants: Record<Node['connection_health'], 'success' | 'warning' | 'secondary' | 'destructive'> = {
  healthy: 'success',
  degraded: 'warning',
  unknown: 'secondary',
  offline: 'destructive',
};

const statusVariants: Record<Node['status'], 'success' | 'warning' | 'secondary' | 'destructive'> = {
  paired: 'success',
  offline: 'destructive',
  error: 'warning',
};

export function NodeHealthDialog({
  node,
  open,
  onOpenChange,
  onUpdateHealth,
  isUpdating = false,
}: NodeHealthDialogProps) {
  const [health, setHealth] = useState<Node['connection_health']>(
    node?.connection_health ?? 'unknown'
  );

  useEffect(() => {
    if (node) setHealth(node.connection_health);
  }, [node, open]);

  if (!node) return null;

  const currentHealth = node.connection_health;
  const handleSave = () => {
    onUpdateHealth?.(node.id, health);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="node-health-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {node.name ?? 'Node'} — Connection health
          </DialogTitle>
          <DialogDescription id="node-health-description">
            View and update node connection health and capabilities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Badge variant={statusVariants[node.status]}>{node.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Current health:</span>
            <Badge variant={healthVariants[currentHealth]}>
              {currentHealth === 'healthy' && <Wifi className="mr-1 h-3 w-3" />}
              {currentHealth === 'offline' && <WifiOff className="mr-1 h-3 w-3" />}
              {healthLabels[currentHealth]}
            </Badge>
          </div>
          {node.capabilities?.length ? (
            <div className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {node.capabilities.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
          {onUpdateHealth && (
            <div className="grid gap-2">
              <Label>Update connection health</Label>
              <Select
                value={health}
                onValueChange={(v) => setHealth(v as Node['connection_health'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(healthLabels) as Node['connection_health'][]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {healthLabels[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {onUpdateHealth && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || health === currentHealth}>
              {isUpdating ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
