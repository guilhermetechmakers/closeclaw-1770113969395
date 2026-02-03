import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wrench,
  BookOpen,
  Play,
  Search,
  Loader2,
  ShieldCheck,
  Clock,
  ChevronRight,
  Terminal,
  MessageSquare,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useRuntimeToolsList,
  useRuntimeRunsList,
  useRuntimeRun,
  useRuntimeOutputs,
  useStartRuntimeRun,
  useAbortRuntimeRun,
  useRuntimeFeedback,
  useSubmitRuntimeFeedback,
  useUpdateRuntimeFeedback,
  useCheckToolPolicy,
  useCheckSkillPolicy,
} from '@/hooks/useRuntime';
import { useLibrarySkillsList } from '@/hooks/useSkills';
import { useProfile } from '@/hooks/useProfile';
import type { RuntimeTool, RuntimeRun } from '@/types/database';
import type { LibrarySkill } from '@/types/database';
import { RunConfigurationModal, type RunTarget } from '@/components/runtime/run-configuration-modal';
import { FeedbackForm } from '@/components/runtime/feedback-form';

const runStatusVariants: Record<RuntimeRun['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  running: 'default',
  completed: 'outline',
  failed: 'destructive',
  aborted: 'secondary',
};

export function ToolSkillRuntime() {
  const [searchTools, setSearchTools] = useState('');
  const [searchSkills, setSearchSkills] = useState('');
  const [runConfigOpen, setRunConfigOpen] = useState(false);
  const [runTarget, setRunTarget] = useState<RunTarget>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: tools = [], isLoading: toolsLoading } = useRuntimeToolsList({ status: 'active' });
  const { data: librarySkills = [], isLoading: skillsLoading } = useLibrarySkillsList();
  const { data: runs = [], isLoading: runsLoading } = useRuntimeRunsList({ limit: 50 });
  const { data: selectedRun, isLoading: runLoading } = useRuntimeRun(selectedRunId);
  const { data: outputs = [] } = useRuntimeOutputs(selectedRunId, { limit: 200 });
  const { data: feedback } = useRuntimeFeedback(selectedRunId);

  const { data: profile } = useProfile();
  const userId = profile?.user_id ?? '';
  const startRun = useStartRuntimeRun();
  const abortRun = useAbortRuntimeRun();
  const submitFeedback = useSubmitRuntimeFeedback();
  const updateFeedback = useUpdateRuntimeFeedback();

  const toolId = runTarget?.type === 'tool' ? runTarget.item.id : null;
  const skillId = runTarget?.type === 'skill' ? runTarget.item.id : null;
  const { data: toolPolicy } = useCheckToolPolicy(toolId);
  const { data: skillPolicy } = useCheckSkillPolicy(skillId);
  const policyResult = runTarget?.type === 'tool' ? toolPolicy : skillPolicy;

  const filteredTools = useMemo(() => {
    if (!searchTools.trim()) return tools;
    const q = searchTools.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tool_type.toLowerCase().includes(q)
    );
  }, [tools, searchTools]);

  const filteredSkills = useMemo(() => {
    if (!searchSkills.trim()) return librarySkills;
    const q = searchSkills.toLowerCase();
    return librarySkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.registry_slug ?? '').toLowerCase().includes(q)
    );
  }, [librarySkills, searchSkills]);

  const activeRuns = useMemo(
    () => runs.filter((r) => r.status === 'running'),
    [runs]
  );

  const handleRunClick = (target: RunTarget) => {
    setRunTarget(target);
    setRunConfigOpen(true);
  };

  const handleStartRun = (payload: { parameters?: Record<string, unknown>; env?: Record<string, string> }) => {
    if (!runTarget) return;
    const startPayload =
      runTarget.type === 'tool'
        ? { tool_id: runTarget.item.id, parameters: payload.parameters, env: payload.env }
        : { skill_id: runTarget.item.id, parameters: payload.parameters, env: payload.env };
    startRun.mutate(startPayload, {
      onSuccess: (data) => {
        setRunConfigOpen(false);
        setRunTarget(null);
        setSelectedRunId(data.run_id);
      },
    });
  };

  const handleSubmitFeedback = (data: { rating: number; comment: string }) => {
    if (!selectedRunId || !userId) return;
    if (feedback?.id) {
      updateFeedback.mutate({
        id: feedback.id,
        data: { rating: data.rating, comment: data.comment || null },
        runId: selectedRunId,
      });
    } else {
      submitFeedback.mutate({
        user_id: userId,
        run_id: selectedRunId,
        rating: data.rating,
        comment: data.comment || null,
      });
    }
  };

  const handleUpdateFeedback = (data: { rating: number; comment: string }) => {
    if (!selectedRunId || !feedback?.id) return;
    updateFeedback.mutate({
      id: feedback.id,
      data: { rating: data.rating, comment: data.comment || null },
      runId: selectedRunId,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Header & breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Tool & Skill Runtime</span>
          </nav>
          <h1 className="text-2xl font-semibold text-foreground">
            Tool & Skill Runtime
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main: selection + execution console */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tool/Skill selection panel */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-muted-foreground" />
                Run a tool or skill
              </CardTitle>
              <CardDescription>
                Select a tool or installed skill, configure parameters and
                environment, then start a run. Policy checks run before execution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tools" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search tools..."
                      className="pl-9"
                      value={searchTools}
                      onChange={(e) => setSearchTools(e.target.value)}
                    />
                  </div>
                  {toolsLoading ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                  ) : filteredTools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-8 text-center">
                      <Wrench className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        No tools available
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tools are defined in settings or via API. Add tools to run
                        them here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {filteredTools.map((tool: RuntimeTool) => (
                        <Card
                          key={tool.id}
                          className={cn(
                            'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30',
                            runTarget?.type === 'tool' &&
                              runTarget.item.id === tool.id &&
                              'ring-2 ring-primary border-primary/50'
                          )}
                          onClick={() => handleRunClick({ type: 'tool', item: tool })}
                        >
                          <CardHeader className="pb-2 pt-3 px-4">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm font-medium truncate">
                                {tool.name}
                              </CardTitle>
                              <Button
                                size="sm"
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRunClick({ type: 'tool', item: tool });
                                }}
                              >
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Run
                              </Button>
                            </div>
                            <CardDescription className="text-xs font-mono">
                              {tool.tool_type}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="skills" className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search skills..."
                      className="pl-9"
                      value={searchSkills}
                      onChange={(e) => setSearchSkills(e.target.value)}
                    />
                  </div>
                  {skillsLoading ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                  ) : filteredSkills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-8 text-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        No skills installed
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Install skills from the Skills Library to run them here.
                      </p>
                      <Button variant="outline" asChild className="mt-3">
                        <Link to="/skills">Skills Library</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {filteredSkills
                        .filter((s: LibrarySkill) => s.enabled)
                        .map((skill: LibrarySkill) => (
                          <Card
                            key={skill.id}
                            className={cn(
                              'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30',
                              runTarget?.type === 'skill' &&
                                runTarget.item.id === skill.id &&
                                'ring-2 ring-primary border-primary/50'
                            )}
                            onClick={() =>
                              handleRunClick({ type: 'skill', item: skill })
                            }
                          >
                            <CardHeader className="pb-2 pt-3 px-4">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm font-medium truncate">
                                  {skill.name}
                                </CardTitle>
                                <Button
                                  size="sm"
                                  className="shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRunClick({
                                      type: 'skill',
                                      item: skill,
                                    });
                                  }}
                                >
                                  <Play className="h-3.5 w-3.5 mr-1" />
                                  Run
                                </Button>
                              </div>
                              <CardDescription className="text-xs font-mono">
                                v{skill.version}
                                {skill.registry_slug && ` · ${skill.registry_slug}`}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Execution console */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                Execution console
              </CardTitle>
              <CardDescription>
                Active runs and streamed output. Select a run in the sidebar to
                view full output and submit feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeRuns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Active runs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeRuns.map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-mono">{run.id.slice(0, 8)}</span>
                        <Badge variant={runStatusVariants[run.status]}>
                          {run.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abortRun.mutate(run.id)}
                          disabled={abortRun.isPending}
                        >
                          Abort
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedRunId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Output stream
                    {selectedRun && (
                      <span className="ml-2 text-muted-foreground font-normal">
                        · {selectedRun.status} · started{' '}
                        {formatDistanceToNow(new Date(selectedRun.started_at), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </p>
                  <div className="min-h-[160px] max-h-[320px] overflow-auto rounded-lg border border-border bg-[rgb(var(--background))] p-3 font-mono text-sm">
                    {runLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading run…
                      </div>
                    ) : outputs.length === 0 ? (
                      <p className="text-muted-foreground">
                        No output yet. Output streams here as the run executes.
                      </p>
                    ) : (
                      outputs.map((out) => (
                        <div
                          key={out.id}
                          className="border-b border-border/50 py-1 last:border-0"
                        >
                          <span className="text-muted-foreground text-xs">
                            {new Date(out.emitted_at).toISOString()}
                          </span>
                          <pre className="mt-0.5 whitespace-pre-wrap break-all text-foreground">
                            {out.output_format === 'json'
                              ? JSON.stringify(out.output_data, null, 2)
                              : String(
                                  (out.output_data as Record<string, unknown>)?.[
                                    'text'
                                  ] ?? out.output_data
                                )}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {!selectedRunId && activeRuns.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center">
                  <Terminal className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    No run selected
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a run from the panel above or select a run from the
                    history in the sidebar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: history, policy, feedback */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Run history
              </CardTitle>
              <CardDescription>
                Recent runs. Click to view output and submit feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : runs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No runs yet. Start a tool or skill run above.
                </p>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-auto">
                  {runs.slice(0, 20).map((run) => (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => setSelectedRunId(run.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/50',
                        selectedRunId === run.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          {run.id}
                        </p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-2 mt-0.5">
                          <Badge variant={runStatusVariants[run.status]} className="text-xs">
                            {run.status}
                          </Badge>
                          {run.policy_compliant && (
                            <ShieldCheck className="h-3.5 w-3.5 text-[rgb(var(--success))]" />
                          )}
                        </p>
                      </div>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(run.started_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedRunId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  Feedback
                </CardTitle>
                <CardDescription>
                  Rate this run and add optional comment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackForm
                  key={selectedRunId}
                  runId={selectedRunId}
                  existingFeedback={feedback ?? undefined}
                  onSubmit={handleSubmitFeedback}
                  onUpdate={handleUpdateFeedback}
                  isSubmitting={submitFeedback.isPending || updateFeedback.isPending}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <RunConfigurationModal
        open={runConfigOpen}
        onOpenChange={setRunConfigOpen}
        target={runTarget}
        policyResult={policyResult ?? null}
        onStart={handleStartRun}
        isStarting={startRun.isPending}
      />
    </div>
  );
}
