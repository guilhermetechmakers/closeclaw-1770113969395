import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Trash2,
  Play,
  MoreHorizontal,
  Calendar,
  Clock,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useProfile } from '@/hooks/useProfile';
import {
  useCronJobs,
  useCronRunHistory,
  useCreateCronJob,
  useUpdateCronJob,
  useDeleteCronJob,
  useRunCronJobNow,
} from '@/hooks/useDashboard';
import type { CronJob } from '@/types/database';
import { CronJobFormModal } from '@/components/dashboard/cron-job-form-modal';
import { CronJobDeleteDialog } from '@/components/dashboard/cron-job-delete-dialog';
import { CronRunHistoryViewer } from '@/components/dashboard/cron-run-history-viewer';
import type { CronJobInsert, CronJobUpdate } from '@/types/database';

export function Cron() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<CronJob | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const { data: profile } = useProfile();
  const userId = profile?.user_id ?? '';
  const { data: jobs = [], isLoading: jobsLoading } = useCronJobs();
  const { data: runHistory = [], isLoading: historyLoading } = useCronRunHistory(
    selectedJobId ?? runningJobId,
    { limit: 20 }
  );

  const createJob = useCreateCronJob();
  const updateJob = useUpdateCronJob();
  const deleteJob = useDeleteCronJob();
  const runNow = useRunCronJobNow();

  const handleCreate = () => {
    setEditingJob(null);
    setFormModalOpen(true);
  };

  const handleEdit = (job: CronJob) => {
    setEditingJob(job);
    setFormModalOpen(true);
  };

  const handleFormSubmit = (data: CronJobInsert | CronJobUpdate) => {
    if (editingJob) {
      updateJob.mutate(
        { id: editingJob.id, data: data as CronJobUpdate },
        {
          onSuccess: () => {
            setFormModalOpen(false);
            setEditingJob(null);
          },
        }
      );
    } else {
      createJob.mutate(data as CronJobInsert, {
        onSuccess: () => setFormModalOpen(false),
      });
    }
  };

  const handleDeleteClick = (job: CronJob) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteJob.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setJobToDelete(null);
        if (selectedJobId === id) setSelectedJobId(null);
      },
    });
  };

  const handleRunNow = (job: CronJob) => {
    setRunningJobId(job.id);
    runNow.mutate(job.id, {
      onSuccess: () => {
        setSelectedJobId(job.id);
        setRunningJobId(null);
      },
      onError: () => setRunningJobId(null),
    });
  };

  const displayJobName = (job: CronJob) => job.name || job.description || 'Unnamed job';
  const statusVariant = (status: CronJob['status']) =>
    status === 'active' ? 'default' : status === 'paused' ? 'secondary' : 'destructive';

  return (
    <div className="mx-auto max-w-content space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Cron Jobs & Scheduler</h1>
        <Button
          onClick={handleCreate}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create job
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[10px] border border-border bg-card shadow-card">
        <CardHeader>
          <CardTitle>Cron list</CardTitle>
          <CardDescription>
            Scheduled jobs with run now, edit, and delete. Select a job to view run history below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {jobsLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !jobs.length ? (
            <div className="flex flex-col items-center justify-center border-t border-border py-16 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium">No cron jobs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a job to run skills on a schedule. Use the cron builder, payload, and session target.
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create job
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="sticky top-0 z-10 bg-secondary/50 px-6 py-4 font-medium">
                        Name
                      </th>
                      <th className="px-6 py-4 font-medium">Schedule</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Next run</th>
                      <th className="px-6 py-4 font-medium">Session target</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className={cn(
                          'border-b border-border transition-colors hover:bg-secondary/30',
                          selectedJobId === job.id && 'bg-primary/5'
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{displayJobName(job)}</span>
                            {job.isolation_setting && (
                              <span title="Isolated">
                                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{job.schedule}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {job.next_run_time
                            ? formatDistanceToNow(new Date(job.next_run_time), { addSuffix: true })
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {job.session_target || '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRunNow(job)}
                              disabled={runNow.isPending && runningJobId === job.id}
                              className="transition-transform hover:scale-[1.02]"
                            >
                              {runNow.isPending && runningJobId === job.id ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="ml-1 hidden sm:inline">
                                {runNow.isPending && runningJobId === job.id ? 'Running…' : 'Run now'}
                              </span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(job)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedJobId(job.id);
                                  }}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  View history
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteClick(job)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className={cn(
                      'rounded-lg border border-border bg-card shadow-card transition-all hover:shadow-card-hover',
                      selectedJobId === job.id && 'ring-2 ring-primary'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{displayJobName(job)}</span>
                            {job.isolation_setting && (
                              <span title="Isolated">
                                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {job.schedule}
                          </p>
                          <Badge variant={statusVariant(job.status)} className="mt-2">
                            {job.status}
                          </Badge>
                          {job.next_run_time && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Next: {formatDistanceToNow(new Date(job.next_run_time), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRunNow(job)}>
                              <Play className="mr-2 h-4 w-4" />
                              Run now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(job)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedJobId(job.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              View history
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(job)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRunNow(job)}
                          disabled={runNow.isPending && runningJobId === job.id}
                        >
                          {runNow.isPending && runningJobId === job.id ? (
                            <Clock className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-1 h-4 w-4" />
                          )}
                          Run now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(job)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CronRunHistoryViewer
        jobId={selectedJobId ?? runningJobId}
        runs={runHistory}
        isLoading={historyLoading}
      />

      <CronJobFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={createJob.isPending || updateJob.isPending}
        userId={userId}
        job={editingJob}
      />

      <CronJobDeleteDialog
        job={jobToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteJob.isPending}
      />
    </div>
  );
}
