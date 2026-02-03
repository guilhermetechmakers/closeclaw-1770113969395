import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  Download,
  ShieldCheck,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LibrarySkill } from '@/types/database';
import type { RegistrySkillItem } from '@/api/skills';

type DetailSource = { type: 'installed'; skill: LibrarySkill } | { type: 'registry'; item: RegistrySkillItem };

interface SkillDetailPanelProps {
  source: DetailSource | null;
  onInstall?: (item: RegistrySkillItem) => void;
  onUninstall?: (skill: LibrarySkill) => void;
  onToggleEnabled?: (skill: LibrarySkill, enabled: boolean) => void;
  isInstalling?: boolean;
  isUninstalling?: boolean;
  isUpdating?: boolean;
}

export function SkillDetailPanel({
  source,
  onInstall,
  onUninstall,
  onToggleEnabled,
  isInstalling = false,
  isUninstalling = false,
  isUpdating = false,
}: SkillDetailPanelProps) {
  if (!source) {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            Skill detail
          </CardTitle>
          <CardDescription>
            SKILL.md, frontmatter, permissions, provenance. Select a skill from
            the grid or registry to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a skill to view details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isInstalled = source.type === 'installed';
  const skill = source.type === 'installed' ? source.skill : null;
  const item = source.type === 'registry' ? source.item : null;
  const name = skill?.name ?? item?.name ?? '';
  const version = skill?.version ?? item?.version ?? '';
  const readme = skill?.readme_content ?? item?.readme_content ?? '';
  const frontmatter = skill?.frontmatter ?? item?.frontmatter ?? {};
  const permissions = (skill?.permissions ?? item?.permissions ?? []) as string[];
  const envReqs = (skill?.environment_requirements ?? item?.environment_requirements ?? []) as string[];
  const signatureStatus = skill?.signature_status ?? null;

  return (
    <Card className="animate-fade-in-up overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            {name}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              v{version}
            </Badge>
            {signatureStatus && (
              <Badge
                variant={
                  signatureStatus === 'verified' ? 'default' : 'secondary'
                }
                className={cn(
                  signatureStatus === 'verified' && 'bg-success/20 text-success border-success/30'
                )}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                {signatureStatus}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          SKILL.md content, frontmatter, permissions, and provenance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isInstalled && skill && onToggleEnabled && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
            {skill.enabled ? (
              <ToggleRight
                className="h-5 w-5 text-primary"
                aria-hidden
              />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" aria-hidden />
            )}
            <span className="text-sm font-medium">
              {skill.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              disabled={isUpdating}
              onClick={() => onToggleEnabled(skill, !skill.enabled)}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Toggle'
              )}
            </Button>
          </div>
        )}

        {permissions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Permissions
            </h4>
            <div className="flex flex-wrap gap-1">
              {permissions.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {envReqs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Environment
            </h4>
            <p className="text-sm text-muted-foreground">
              {envReqs.join(', ')}
            </p>
          </div>
        )}

        {Object.keys(frontmatter).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Frontmatter
            </h4>
            <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs overflow-x-auto">
              {JSON.stringify(frontmatter, null, 2)}
            </pre>
          </div>
        )}

        {readme && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              SKILL.md
            </h4>
            <ScrollArea className="h-[240px] w-full rounded-md border border-border bg-muted/20 p-3">
              <div className="prose prose-invert prose-sm max-w-none text-foreground">
                <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                  {readme}
                </pre>
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {!isInstalled && item && onInstall && (
            <Button
              size="sm"
              onClick={() => onInstall(item)}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Installing…
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </>
              )}
            </Button>
          )}
          {isInstalled && skill && onUninstall && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onUninstall(skill)}
              disabled={isUninstalling}
            >
              {isUninstalling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Uninstall
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
