import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Search,
  ShoppingBag,
  Package,
  Download,
  Calendar,
  ShieldCheck,
  ToggleRight,
  ToggleLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useLibrarySkillsList,
  useRegistrySkills,
  useInstallLibrarySkill,
  useSetLibrarySkillEnabled,
  useUninstallLibrarySkill,
} from '@/hooks/useSkills';
import type { LibrarySkill } from '@/types/database';
import type { RegistrySkillItem, RegistryListParams } from '@/api/skills';
import { SkillDetailPanel } from '@/components/skills/skill-detail-panel';
import { InstallSkillModal } from '@/components/skills/install-skill-modal';
import { UninstallSkillDialog } from '@/components/skills/uninstall-skill-dialog';

type DetailSource =
  | { type: 'installed'; skill: LibrarySkill }
  | { type: 'registry'; item: RegistrySkillItem }
  | null;

const eligibilityVariants: Record<LibrarySkill['eligibility_status'], 'success' | 'warning' | 'secondary'> = {
  eligible: 'success',
  ineligible: 'warning',
  unknown: 'secondary',
};

export function Skills() {
  const [registrySearch, setRegistrySearch] = useState('');
  const [registrySort, setRegistrySort] = useState<RegistryListParams['sort']>('popularity');
  const [selectedDetail, setSelectedDetail] = useState<DetailSource>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installTarget, setInstallTarget] = useState<RegistrySkillItem | null>(null);
  const [uninstallDialogOpen, setUninstallDialogOpen] = useState(false);
  const [uninstallTarget, setUninstallTarget] = useState<LibrarySkill | null>(null);

  const { data: installed = [], isLoading: installedLoading } = useLibrarySkillsList();
  const { data: registryList = [], isLoading: registryLoading } = useRegistrySkills({
    search: registrySearch || undefined,
    sort: registrySort,
  });

  const installSkill = useInstallLibrarySkill();
  const setEnabled = useSetLibrarySkillEnabled();
  const uninstallSkill = useUninstallLibrarySkill();

  const handleInstallClick = (item: RegistrySkillItem) => {
    setInstallTarget(item);
    setInstallModalOpen(true);
  };

  const handleInstallConfirm = (_env?: Record<string, string>) => {
    if (!installTarget) return;
    installSkill.mutate(
      {
        name: installTarget.name,
        version: installTarget.version,
        registry_slug: installTarget.registry_slug,
        readme_content: installTarget.readme_content,
        frontmatter: installTarget.frontmatter ?? {},
        permissions: installTarget.permissions ?? [],
        binary_requirements: (installTarget.binary_requirements ?? []) as unknown[],
        environment_requirements: (installTarget.environment_requirements ?? []) as unknown[],
        signature_status: 'verified',
        enabled: true,
        eligibility_status: 'eligible',
      },
      {
        onSuccess: () => {
          setInstallModalOpen(false);
          setInstallTarget(null);
          setSelectedDetail(null);
        },
      }
    );
  };

  const handleUninstallClick = (skill: LibrarySkill) => {
    setUninstallTarget(skill);
    setUninstallDialogOpen(true);
  };

  const handleUninstallConfirm = () => {
    if (!uninstallTarget) return;
    uninstallSkill.mutate(uninstallTarget.id, {
      onSuccess: () => {
        setUninstallDialogOpen(false);
        setUninstallTarget(null);
        if (selectedDetail?.type === 'installed' && selectedDetail.skill.id === uninstallTarget.id) {
          setSelectedDetail(null);
        }
      },
    });
  };

  const gatingChecksForInstall = useMemo(() => {
    if (!installTarget) return [];
    const envReqs = (installTarget.environment_requirements ?? []) as string[];
    return [
      { id: 'permissions', label: 'Permissions reviewed', met: true },
      ...envReqs.map((k) => ({
        id: `env-${k}`,
        label: `Environment: ${k}`,
        met: true,
      })),
    ];
  }, [installTarget]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Skills Library</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/marketplace">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Marketplace
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/skill-editor">
              <BookOpen className="mr-2 h-4 w-4" />
              Skill Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* Installed skills grid */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Installed skills
          </CardTitle>
          <CardDescription>
            Enable/disable and manage installed skills. Last run and eligibility
            status shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {installedLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : installed.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No skills installed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Browse the registry below and install skills to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {installed.map((skill) => (
                <Card
                  key={skill.id}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30',
                    selectedDetail?.type === 'installed' &&
                      selectedDetail.skill.id === skill.id &&
                      'ring-2 ring-primary border-primary/50'
                  )}
                  onClick={() => setSelectedDetail({ type: 'installed', skill })}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium truncate">
                        {skill.name}
                      </CardTitle>
                      <button
                        type="button"
                        className="shrink-0 rounded p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnabled.mutate({ id: skill.id, enabled: !skill.enabled });
                        }}
                        disabled={setEnabled.isPending}
                        aria-label={skill.enabled ? 'Disable skill' : 'Enable skill'}
                      >
                        {setEnabled.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : skill.enabled ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <CardDescription className="text-xs font-mono">
                      v{skill.version}
                      {skill.registry_slug && ` · ${skill.registry_slug}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {skill.last_run_at && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(skill.last_run_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                      <Badge
                        variant={eligibilityVariants[skill.eligibility_status]}
                        className="text-xs"
                      >
                        {skill.eligibility_status}
                      </Badge>
                      {skill.signature_status === 'verified' && (
                        <ShieldCheck className="h-3.5 w-3.5 text-success" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registry browser */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Registry browser</CardTitle>
          <CardDescription>
            Search, filter, and install skills from the registry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                className="pl-9"
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
              />
            </div>
            <Select
              value={registrySort ?? 'popularity'}
              onValueChange={(v) => setRegistrySort(v as RegistryListParams['sort'])}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {registryLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : registryList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No registry skills found. Try a different search or sort.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {registryList.map((item) => {
                const isInstalled = installed.some(
                  (s) => s.registry_slug === item.registry_slug
                );
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30',
                      selectedDetail?.type === 'registry' &&
                        selectedDetail.item.registry_slug === item.registry_slug &&
                        'ring-2 ring-primary border-primary/50'
                    )}
                    onClick={() => setSelectedDetail({ type: 'registry', item })}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium truncate">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono">
                        v{item.version} · {item.registry_slug}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        {item.popularity != null && (
                          <Badge variant="secondary" className="text-xs">
                            {item.popularity}% popular
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={isInstalled ? 'secondary' : 'default'}
                          disabled={isInstalled}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isInstalled) handleInstallClick(item);
                          }}
                        >
                          {isInstalled ? (
                            'Installed'
                          ) : (
                            <>
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                              Install
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill detail panel */}
      <SkillDetailPanel
        source={selectedDetail}
        onInstall={handleInstallClick}
        onUninstall={handleUninstallClick}
        onToggleEnabled={(skill, enabled) =>
          setEnabled.mutate({ id: skill.id, enabled })
        }
        isInstalling={installSkill.isPending}
        isUninstalling={uninstallSkill.isPending}
        isUpdating={setEnabled.isPending}
      />

      <InstallSkillModal
        open={installModalOpen}
        onOpenChange={setInstallModalOpen}
        item={installTarget}
        gatingChecks={gatingChecksForInstall}
        onInstall={handleInstallConfirm}
        isInstalling={installSkill.isPending}
      />

      <UninstallSkillDialog
        open={uninstallDialogOpen}
        onOpenChange={setUninstallDialogOpen}
        skill={uninstallTarget}
        onConfirm={handleUninstallConfirm}
        isUninstalling={uninstallSkill.isPending}
      />
    </div>
  );
}
