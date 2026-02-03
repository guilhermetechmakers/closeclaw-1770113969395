import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Calendar,
  Cpu,
  Shield,
  Play,
  Activity,
  ChevronDown,
  ChevronRight,
  StopCircle,
  Plus,
  Wifi,
  WifiOff,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useActivities,
  useRuns,
  useCronJobs,
  useNodes,
  useAlerts,
  useQuickRun,
  useAbortRun,
  useCreateCronJob,
  useDeleteActivity,
  useUpdateAlert,
  useUpdateNode,
} from '@/hooks/useDashboard';
import { useProfile } from '@/hooks/useProfile';
import type { Activity as ActivityType, Run, Node, Alert } from '@/types/database';
import { ActivityDetailModal } from '@/components/dashboard/activity-detail-modal';
import { RunAbortDialog } from '@/components/dashboard/run-abort-dialog';
import { CronJobFormModal } from '@/components/dashboard/cron-job-form-modal';
import { NodeHealthDialog } from '@/components/dashboard/node-health-dialog';
import { AlertResolutionDialog } from '@/components/dashboard/alert-resolution-dialog';

const activityTypeLabels: Record<string, string> = {
  message: 'Message',
  tool_run: 'Tool run',
  cron_run: 'Cron run',
  node_event: 'Node event',
  alert: 'Alert',
};

const runStatusVariants: Record<Run['status'], 'default' | 'secondary' | 'destructive' | 'warning'> = {
  running: 'default',
  completed: 'secondary',
  failed: 'destructive',
  aborted: 'warning',
};

const nodeHealthVariants: Record<Node['connection_health'], 'success' | 'warning' | 'secondary' | 'destructive'> = {
  healthy: 'success',
  degraded: 'warning',
  unknown: 'secondary',
  offline: 'destructive',
};

export function Dashboard() {
  const [quickRunMessage, setQuickRunMessage] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [runToAbort, setRunToAbort] = useState<Run | null>(null);
  const [cronFormOpen, setCronFormOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data: profile } = useProfile();
  const userId = profile?.user_id ?? '';

  const { data: activities = [], isLoading: activitiesLoading } = useActivities({
    limit: 20,
    type: activityFilter || undefined,
  });
  const { data: runs = [], isLoading: runsLoading } = useRuns({
    status: 'running',
    limit: 10,
  });
  const { data: cronJobs = [], isLoading: cronLoading } = useCronJobs();
  const { data: nodes = [], isLoading: nodesLoading } = useNodes();
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts({
    resolution_status: 'open',
  });

  const quickRunMutation = useQuickRun();
  const abortRunMutation = useAbortRun();
  const createCronJobMutation = useCreateCronJob();
  const deleteActivityMutation = useDeleteActivity();
  const updateAlertMutation = useUpdateAlert();
  const updateNodeMutation = useUpdateNode();

  const handleQuickRun = () => {
    const message = quickRunMessage.trim();
    if (!message) return;
    quickRunMutation.mutate(
      { message },
      {
        onSuccess: () => setQuickRunMessage(''),
      }
    );
  };

  const filteredActivities = activityFilter
    ? activities.filter((a) => a.activity_type === activityFilter)
    : activities;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active runs', value: runs.length, icon: Play, href: '/chat' },
          { title: 'Cron jobs', value: cronJobs.length, icon: Calendar, href: '/cron' },
          { title: 'Nodes', value: nodes.length, icon: Cpu, href: '/nodes' },
          { title: 'Alerts', value: alerts.length, icon: Shield, href: '/security' },
        ].map(({ title, value, icon: Icon, href }) => (
          <Link key={title} to={href}>
            <Card className="transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent activity
            </CardTitle>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filter activity type"
            >
              <option value="">All</option>
              {Object.entries(activityTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[280px] pr-4">
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : filteredActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                <ul className="space-y-2">
                  {filteredActivities.map((activity) => (
                    <li key={activity.id}>
                      <div
                        className={cn(
                          'rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50',
                          expandedActivityId === activity.id && 'ring-2 ring-ring'
                        )}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left"
                          onClick={() =>
                            setExpandedActivityId(
                              expandedActivityId === activity.id ? null : activity.id
                            )
                          }
                          aria-expanded={expandedActivityId === activity.id}
                        >
                          {expandedActivityId === activity.id ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {activityTypeLabels[activity.activity_type] ?? activity.activity_type}
                          </Badge>
                          <span className="flex-1 truncate text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </button>
                        {expandedActivityId === activity.id && (
                          <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              View details
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Run Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quick Run
            </CardTitle>
            <CardDescription>
              Send a message to the default session or channel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a command or message..."
                className="flex-1"
                value={quickRunMessage}
                onChange={(e) => setQuickRunMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickRun()}
                aria-label="Quick run message"
              />
              <Button
                onClick={handleQuickRun}
                disabled={!quickRunMessage.trim() || quickRunMutation.isPending}
              >
                {quickRunMutation.isPending ? (
                  <span className="animate-pulse">Sending…</span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Runs Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Active runs</CardTitle>
          <CardDescription>Stream and abort running jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active runs.</p>
          ) : (
            <ul className="space-y-2">
              {runs.map((run) => (
                <li
                  key={run.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={runStatusVariants[run.status]}>{run.status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Started {formatDistanceToNow(new Date(run.start_time), { addSuffix: true })}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRunToAbort(run)}
                    disabled={run.status !== 'running'}
                  >
                    <StopCircle className="mr-1 h-4 w-4" />
                    Abort
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Cron Jobs Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Cron overview</CardTitle>
            <Button size="sm" onClick={() => setCronFormOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Create job
            </Button>
          </CardHeader>
          <CardContent>
            {cronLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : cronJobs.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">No cron jobs.</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/cron">Manage cron</Link>
                </Button>
              </>
            ) : (
              <ul className="space-y-2">
                {cronJobs.slice(0, 5).map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {job.description || job.schedule}
                      </p>
                      <p className="text-xs text-muted-foreground">{job.schedule}</p>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </li>
                ))}
                {cronJobs.length > 5 && (
                  <li>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/cron">View all ({cronJobs.length})</Link>
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Nodes Status Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Nodes status</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/nodes">Pair node</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {nodesLoading ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            ) : nodes.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">No paired nodes.</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/nodes">Pair node</Link>
                </Button>
              </>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
                    onClick={() => setSelectedNode(node)}
                  >
                    <Cpu className="h-8 w-8 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {node.name ?? 'Node'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge variant={nodeHealthVariants[node.connection_health]} className="text-xs">
                          {node.connection_health === 'healthy' && <Wifi className="mr-0.5 h-3 w-3" />}
                          {node.connection_health === 'offline' && <WifiOff className="mr-0.5 h-3 w-3" />}
                          {node.connection_health}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Alerts / Audit Findings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Skill alerts / audit findings
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/security">Run audit</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : alerts.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">No alerts.</p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link to="/security">Run audit</Link>
              </Button>
            </>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{alert.type}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === 'critical'
                        ? 'destructive'
                        : alert.severity === 'high'
                          ? 'warning'
                          : 'secondary'
                    }
                    className="shrink-0"
                  >
                    {alert.severity}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    Fix
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modals / Dialogs */}
      <ActivityDetailModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
        onDelete={(id) => {
          deleteActivityMutation.mutate(id);
          setSelectedActivity(null);
        }}
      />
      <RunAbortDialog
        run={runToAbort}
        open={!!runToAbort}
        onOpenChange={(open) => !open && setRunToAbort(null)}
        onConfirm={(id) => {
          abortRunMutation.mutate(id);
          setRunToAbort(null);
        }}
        isAborting={abortRunMutation.isPending}
      />
      <CronJobFormModal
        open={cronFormOpen}
        onOpenChange={setCronFormOpen}
        onSubmit={(data) => createCronJobMutation.mutate(data)}
        isSubmitting={createCronJobMutation.isPending}
        userId={userId}
      />
      <NodeHealthDialog
        node={selectedNode}
        open={!!selectedNode}
        onOpenChange={(open) => !open && setSelectedNode(null)}
        onUpdateHealth={(id, connection_health) =>
          updateNodeMutation.mutate({ id, data: { connection_health } })
        }
        isUpdating={updateNodeMutation.isPending}
      />
      <AlertResolutionDialog
        alert={selectedAlert}
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        onResolve={(id, resolution_status) =>
          updateAlertMutation.mutate({ id, data: { resolution_status } })
        }
        isUpdating={updateAlertMutation.isPending}
      />
    </div>
  );
}
