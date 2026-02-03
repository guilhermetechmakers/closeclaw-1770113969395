import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Terminal,
  Mic,
  Volume2,
  Key,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Node, NodeCapability } from '@/types/database';

interface NodeDetailsCardProps {
  node: Node | null;
  capabilities: NodeCapability[];
  className?: string;
}

function getExecAllowlist(capabilities: NodeCapability[]): string[] {
  const cap = capabilities.find((c) => c.capability_key === 'remote_exec');
  if (!cap?.configurations || typeof cap.configurations !== 'object') return [];
  const allowlist = (cap.configurations as { allowlist?: string[] }).allowlist;
  return Array.isArray(allowlist) ? allowlist : [];
}

function getVoiceWakeConfig(capabilities: NodeCapability[]): Record<string, unknown> | null {
  const cap = capabilities.find((c) => c.capability_key === 'voice_wake');
  return cap?.configurations && typeof cap.configurations === 'object' ? (cap.configurations as Record<string, unknown>) : null;
}

function getTtsConfig(capabilities: NodeCapability[]): Record<string, unknown> | null {
  const cap = capabilities.find((c) => c.capability_key === 'talk_mode');
  return cap?.configurations && typeof cap.configurations === 'object' ? (cap.configurations as Record<string, unknown>) : null;
}

export function NodeDetailsCard({ node, capabilities, className }: NodeDetailsCardProps) {
  if (!node) {
    return (
      <Card className={cn('shadow-card transition-shadow hover:shadow-card-hover', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Node details
          </CardTitle>
          <CardDescription>
            Exec allowlist, voice wake, TTS preferences, and stored tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select a node to view details and configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const execAllowlist = getExecAllowlist(capabilities);
  const voiceWake = getVoiceWakeConfig(capabilities);
  const ttsConfig = getTtsConfig(capabilities);

  return (
    <Card className={cn('shadow-card transition-shadow hover:shadow-card-hover', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Node details
        </CardTitle>
        <CardDescription>
          Exec allowlist, voice wake, TTS preferences, and stored tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            Remote exec allowlist
          </div>
          {execAllowlist.length > 0 ? (
            <ScrollArea className="h-[72px] rounded-md border border-border px-3 py-2">
              <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                {execAllowlist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-xs text-muted-foreground">
              No allowlist configured. Edit remote_exec capability to set allowed commands.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Mic className="h-4 w-4 text-muted-foreground" />
            Voice wake
          </div>
          {voiceWake && Object.keys(voiceWake).length > 0 ? (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <pre className="whitespace-pre-wrap font-mono">
                {JSON.stringify(voiceWake, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Default. Configure in Voice & Media or via capability.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            TTS preferences
          </div>
          {ttsConfig && Object.keys(ttsConfig).length > 0 ? (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <pre className="whitespace-pre-wrap font-mono">
                {JSON.stringify(ttsConfig, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Default. Configure in Voice & Media.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Key className="h-4 w-4 text-muted-foreground" />
            Stored tokens
          </div>
          <p className="text-xs text-muted-foreground">
            CDP and auth tokens are stored securely. Rotate from Settings or when unpairing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
