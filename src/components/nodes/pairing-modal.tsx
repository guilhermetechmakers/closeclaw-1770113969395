import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Clock, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PairingRequest } from '@/types/database';
import { useClaimPairing } from '@/hooks/useNodes';

interface PairingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pairingRequest: PairingRequest | null;
  onStartPairing: () => void;
  isStartingPairing: boolean;
  onPaired?: () => void;
}

function formatExpiry(expiresAt: string): string {
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const s = Math.max(0, Math.floor((end - now) / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function PairingModal({
  open,
  onOpenChange,
  pairingRequest,
  onStartPairing,
  isStartingPairing,
  onPaired,
}: PairingModalProps) {
  const [countdown, setCountdown] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [copied, setCopied] = useState(false);

  const claimPairing = useClaimPairing();

  useEffect(() => {
    if (!pairingRequest || !open) return;
    const tick = () => setCountdown(formatExpiry(pairingRequest.expires_at));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pairingRequest, open]);

  const handleCopy = () => {
    if (!pairingRequest) return;
    navigator.clipboard.writeText(pairingRequest.pairing_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimManual = async () => {
    if (!manualCode.trim()) return;
    try {
      await claimPairing.mutateAsync({ code: manualCode.trim() });
      onPaired?.();
      onOpenChange(false);
      setManualCode('');
    } catch {
      // toast from hook
    }
  };

  const expired =
    pairingRequest &&
    new Date(pairingRequest.expires_at).getTime() <= Date.now();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px]"
        aria-describedby="pairing-description"
      >
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Pair device</DialogTitle>
            <DialogDescription id="pairing-description">
              Scan the QR code or enter the code on your device to pair. Code
              expires in 10 minutes.
            </DialogDescription>
          </DialogHeader>

          {!pairingRequest ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <p className="text-sm text-muted-foreground">
                Start pairing to generate a QR code and one-time code.
              </p>
              <Button
                onClick={onStartPairing}
                disabled={isStartingPairing}
                className="min-w-[160px]"
              >
                {isStartingPairing ? 'Generating…' : 'Start pairing'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    'flex h-40 w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30',
                    expired && 'opacity-60'
                  )}
                >
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                  <span className="mt-2 text-xs text-muted-foreground">
                    QR code
                  </span>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Scan with your device app
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {expired ? 'Expired' : `Expires in ${countdown}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    One-time code
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded border border-border bg-muted/50 px-3 py-2 text-lg font-mono tracking-widest">
                      {pairingRequest.pairing_code}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      aria-label="Copy code"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter this code on your device if you cannot scan the QR code.
                </p>

                <div className="border-t border-border pt-4">
                  <Label htmlFor="manual-code" className="text-muted-foreground">
                    Or enter a code from another device
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="manual-code"
                      placeholder="e.g. ABCD1234"
                      value={manualCode}
                      onChange={(e) =>
                        setManualCode(e.target.value.toUpperCase().slice(0, 12))
                      }
                      className="font-mono uppercase tracking-wider"
                    />
                    <Button
                      onClick={handleClaimManual}
                      disabled={!manualCode.trim() || claimPairing.isPending}
                    >
                      {claimPairing.isPending ? 'Pairing…' : 'Pair'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {pairingRequest && !expired && (
              <Button variant="outline" onClick={onStartPairing} disabled={isStartingPairing}>
                New code
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
