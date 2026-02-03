import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play,
  Save,
  FolderOpen,
  FileText,
  GitCommit,
  Settings2,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useSkillsList, useSkill, useUpdateSkill, useRunSkillTest, useSkillTestRuns, useSkillVersions, useCheckGating, useCommitSkill, useCreateSkill } from '@/hooks/useSkills';
import { EditFrontmatterDialog } from '@/components/skill-editor/edit-frontmatter-dialog';
import { CommitChangesDialog } from '@/components/skill-editor/commit-changes-dialog';
import { GatingCheckOverlay } from '@/components/skill-editor/gating-check-overlay';
import { cn } from '@/lib/utils';

const DEFAULT_SKILL_CONTENT = `# Skill name

Short description of what this skill does.

## Requirements

- List gating requirements (env vars, permissions, etc.)

## Usage

How to use this skill from chat or cron.
`;

export function SkillEditor() {
  const { skillId } = useParams<{ skillId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('editor');
  const [localContent, setLocalContent] = useState('');
  const [localName, setLocalName] = useState('');
  const [showFrontmatterDialog, setShowFrontmatterDialog] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showGatingOverlay, setShowGatingOverlay] = useState(false);

  const { data: skills = [], isLoading: skillsLoading } = useSkillsList();
  const { data: skill, isLoading: skillLoading } = useSkill(skillId ?? null);
  const { data: testRuns = [] } = useSkillTestRuns(skillId ?? null, { limit: 5 });
  const { data: versions = [] } = useSkillVersions(skillId ?? null);
  const { data: gating } = useCheckGating(skillId ?? null);

  const updateSkill = useUpdateSkill();
  const runTest = useRunSkillTest();
  const commitSkill = useCommitSkill();
  const createSkill = useCreateSkill();

  const selectedSkill = skill ?? null;
  const isDirty =
    selectedSkill &&
    (localContent !== selectedSkill.content || localName !== selectedSkill.name);

  const syncFromSkill = useCallback(() => {
    if (selectedSkill) {
      setLocalContent(selectedSkill.content || DEFAULT_SKILL_CONTENT);
      setLocalName(selectedSkill.name || '');
    } else {
      setLocalContent(DEFAULT_SKILL_CONTENT);
      setLocalName('');
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (selectedSkill) {
      setLocalContent(selectedSkill.content || DEFAULT_SKILL_CONTENT);
      setLocalName(selectedSkill.name || '');
    } else if (!skillId) {
      setLocalContent(DEFAULT_SKILL_CONTENT);
      setLocalName('');
    }
  }, [skillId, selectedSkill?.id, selectedSkill?.content, selectedSkill?.name]);

  const handleSelectSkill = (id: string) => {
    navigate(`/skill-editor/${id}`);
  };

  const handleSave = () => {
    if (!skillId || !selectedSkill) return;
    updateSkill.mutate(
      {
        id: skillId,
        data: { content: localContent, name: localName || selectedSkill.name },
      },
      {
        onSuccess: () => syncFromSkill(),
      }
    );
  };

  const handleRunTest = () => {
    if (!skillId) return;
    runTest.mutate({ skillId });
  };

  const handleCommit = (payload: { message?: string; sign?: boolean }) => {
    if (!skillId) return;
    commitSkill.mutate(
      { skillId, ...payload },
      { onSuccess: () => setShowCommitDialog(false) }
    );
  };

  const handleFrontmatterSubmit = (values: Record<string, unknown>) => {
    if (!skillId || !selectedSkill) return;
    updateSkill.mutate(
      {
        id: skillId,
        data: { frontmatter: { ...selectedSkill.frontmatter, ...values } },
      },
      {
        onSuccess: () => {
          setShowFrontmatterDialog(false);
        },
      }
    );
  };

  const latestRun = testRuns[0];
  const gatingFailed = gating && !gating.passed;
  const requirements = gating?.requirements ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Skill Editor</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/skill-editor')}
            aria-label="Clear selection"
          >
            <FolderOpen className="mr-1 h-4 w-4" />
            All skills
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFrontmatterDialog(true)}
            disabled={!skillId}
            aria-label="Edit frontmatter"
          >
            <Settings2 className="mr-1 h-4 w-4" />
            Frontmatter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!skillId || !isDirty || updateSkill.isPending}
          >
            <Save className="mr-1 h-4 w-4" />
            {updateSkill.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGatingOverlay(true)}
            className={gatingFailed ? 'border-warning text-warning' : ''}
            aria-label="Gating checks"
          >
            <AlertCircle className="mr-1 h-4 w-4" />
            Gating
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommitDialog(true)}
            disabled={!skillId}
          >
            <GitCommit className="mr-1 h-4 w-4" />
            Commit
          </Button>
          <Button
            size="sm"
            onClick={handleRunTest}
            disabled={!skillId || runTest.isPending}
          >
            <Play className="mr-1 h-4 w-4" />
            {runTest.isPending ? 'Running…' : 'Test run'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* File Explorer */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Skills</CardTitle>
            <CardDescription>Select a skill to edit.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {skillsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-4/5" />
              </div>
            ) : skills.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No skills yet.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    createSkill.mutate(
                      {
                        user_id: '',
                        name: 'Untitled Skill',
                        content: DEFAULT_SKILL_CONTENT,
                      },
                      {
                        onSuccess: (skill) => {
                          navigate(`/skill-editor/${skill.id}`);
                        },
                      }
                    )
                  }
                  disabled={createSkill.isPending}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {createSkill.isPending ? 'Creating…' : 'New skill'}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[200px] pr-2">
                <ul className="space-y-0.5" role="list">
                  {skills.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectSkill(s.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary',
                          skillId === s.id && 'bg-primary/15 text-primary'
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{s.name}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Versions</p>
              {skillId && (
                <ScrollArea className="h-[120px] pr-2">
                  {versions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No versions yet.</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {versions.slice(0, 5).map((v) => (
                        <li key={v.id} className="flex justify-between gap-2">
                          <span className="truncate font-mono">{v.version_number}</span>
                          <span className="text-muted-foreground shrink-0">
                            {v.changes ? '•' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              )}
              {!skillId && (
                <p className="text-xs text-muted-foreground">Select a skill to see versions.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main: Editor + Test Runner */}
        <div className="space-y-4 lg:col-span-1">
          {skillLoading && skillId ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Skeleton className="h-8 w-48" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="editor">SKILL.md editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="frontmatter">Frontmatter</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="mt-4">
                  <Card className="relative overflow-hidden">
                    {showGatingOverlay && (
                      <GatingCheckOverlay
                        open={showGatingOverlay}
                        onClose={() => setShowGatingOverlay(false)}
                        requirements={requirements.map((r) => ({
                          id: r.id,
                          label: r.label,
                          met: r.met,
                          message: r.message,
                        }))}
                        passed={gating?.passed ?? true}
                      />
                    )}
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <Label htmlFor="skill-name" className="text-muted-foreground">
                          Skill name
                        </Label>
                        <Input
                          id="skill-name"
                          value={localName}
                          onChange={(e) => setLocalName(e.target.value)}
                          placeholder="my-skill"
                          className="mt-1 max-w-xs font-medium"
                        />
                      </div>
                      <textarea
                        aria-label="SKILL.md content"
                        className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={DEFAULT_SKILL_CONTENT}
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-p:text-muted-foreground prose-code:text-sm">
                        <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-sans text-sm">
                          {localContent || 'Nothing to preview.'}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="frontmatter" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Edit YAML frontmatter (name, version, permissions, env) via the
                        Frontmatter button in the header, or open the &quot;Frontmatter&quot;
                        dialog.
                      </p>
                      {selectedSkill?.frontmatter &&
                        Object.keys(selectedSkill.frontmatter).length > 0 && (
                          <pre className="mt-4 rounded-md bg-muted/50 p-4 font-mono text-xs">
                            {JSON.stringify(selectedSkill.frontmatter, null, 2)}
                          </pre>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Test runner</CardTitle>
                  <CardDescription>Run skill in sandbox and view logs.</CardDescription>
                </CardHeader>
                <CardContent>
                  {latestRun ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Status: {latestRun.status}</span>
                        <span>•</span>
                        <span>{new Date(latestRun.created_at).toLocaleString()}</span>
                      </div>
                      <pre className="max-h-48 overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
                        {latestRun.logs || 'No logs.'}
                      </pre>
                    </div>
                  ) : (
                    <pre className="rounded-md bg-muted p-4 text-xs text-muted-foreground">
                      No test runs yet. Click &quot;Test run&quot; to execute.
                    </pre>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <EditFrontmatterDialog
        open={showFrontmatterDialog}
        onOpenChange={setShowFrontmatterDialog}
        initialValues={selectedSkill?.frontmatter}
        onSubmit={handleFrontmatterSubmit}
        isSubmitting={updateSkill.isPending}
      />
      <CommitChangesDialog
        open={showCommitDialog}
        onOpenChange={setShowCommitDialog}
        skillName={selectedSkill?.name}
        onSubmit={handleCommit}
        isSubmitting={commitSkill.isPending}
      />
    </div>
  );
}
