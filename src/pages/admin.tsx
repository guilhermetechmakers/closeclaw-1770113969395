import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Building2,
  KeyRound,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Filter,
  UserPlus,
  MoreHorizontal,
  Search,
  Eye,
  FileText,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useAdminWorkspaces,
  useAdminAllMembers,
  useAdminLicenses,
  useAdminAnalytics,
  useCreateAdminWorkspace,
  useUpdateAdminWorkspace,
  useDeleteAdminWorkspace,
  useAddAdminWorkspaceMember,
  useUpdateAdminWorkspaceMember,
  useRemoveAdminWorkspaceMember,
  useCreateAdminLicense,
  useUpdateAdminLicense,
  useDeleteAdminLicense,
} from '@/hooks/useAdmin';
import type {
  AdminWorkspace,
  AdminWorkspaceMember,
  AdminLicense,
  AdminAnalyticsMetric,
  AdminWorkspaceInsert,
  AdminWorkspaceUpdate,
  AdminWorkspaceMemberInsert,
  AdminWorkspaceMemberUpdate,
  AdminLicenseInsert,
  AdminLicenseUpdate,
} from '@/types/database';
import { WorkspaceConfigModal } from '@/components/admin/workspace-config-modal';
import { UserManagementFormDialog } from '@/components/admin/user-management-form-dialog';
import { LicenseAllocationDialog } from '@/components/admin/license-allocation-dialog';
import {
  AnalyticsFilterDialog,
  type AnalyticsFilterValues,
} from '@/components/admin/analytics-filter-dialog';
import { AdminUserDetailModal } from '@/components/admin/admin-user-detail-modal';
import { WorkspaceSettingsPanel } from '@/components/admin/workspace-settings-panel';
import { InvoiceDetailsDialog } from '@/components/admin/invoice-details-dialog';
import { ReportDownloadDialog } from '@/components/admin/report-download-dialog';
import { Input } from '@/components/ui/input';

const workspaceStatusVariants: Record<
  AdminWorkspace['status'],
  'default' | 'secondary' | 'destructive'
> = {
  active: 'default',
  archived: 'secondary',
  suspended: 'destructive',
};

const memberRoleVariants: Record<
  AdminWorkspaceMember['role'],
  'default' | 'secondary' | 'outline'
> = {
  admin: 'default',
  member: 'secondary',
  viewer: 'outline',
};

const licenseTypeLabels: Record<string, string> = {
  seat: 'Seat',
  pro: 'Pro',
  enterprise: 'Enterprise',
  trial: 'Trial',
};

export function Admin() {
  const [activeTab, setActiveTab] = useState('workspaces');
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<AdminWorkspace | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminWorkspaceMember | null>(null);
  const [selectedWorkspaceForUser, setSelectedWorkspaceForUser] = useState<AdminWorkspace | null>(null);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<AdminLicense | null>(null);
  const [analyticsFilterOpen, setAnalyticsFilterOpen] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState<AnalyticsFilterValues | null>(null);
  const [userDetailMember, setUserDetailMember] = useState<AdminWorkspaceMember | null>(null);
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
  const [selectedWorkspaceForSettings, setSelectedWorkspaceForSettings] =
    useState<AdminWorkspace | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedLicenseForInvoice, setSelectedLicenseForInvoice] = useState<AdminLicense | null>(null);
  const [reportDownloadOpen, setReportDownloadOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const { data: workspaces = [], isLoading: workspacesLoading } = useAdminWorkspaces();
  const { data: members = [], isLoading: membersLoading } = useAdminAllMembers();

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceForSettings) {
      setSelectedWorkspaceForSettings(workspaces[0]);
    }
  }, [workspaces, selectedWorkspaceForSettings]);
  const { data: licenses = [], isLoading: licensesLoading } = useAdminLicenses();
  const { data: metrics = [], isLoading: metricsLoading } = useAdminAnalytics({
    workspace_id: analyticsFilter?.workspace_id || undefined,
    metric_type: analyticsFilter?.metric_type || undefined,
    from: analyticsFilter?.from || undefined,
    to: analyticsFilter?.to || undefined,
    limit: analyticsFilter?.limit ?? 100,
  });

  const createWorkspaceMutation = useCreateAdminWorkspace();
  const updateWorkspaceMutation = useUpdateAdminWorkspace();
  const deleteWorkspaceMutation = useDeleteAdminWorkspace();
  const addMemberMutation = useAddAdminWorkspaceMember();
  const updateMemberMutation = useUpdateAdminWorkspaceMember();
  const removeMemberMutation = useRemoveAdminWorkspaceMember();
  const createLicenseMutation = useCreateAdminLicense();
  const updateLicenseMutation = useUpdateAdminLicense();
  const deleteLicenseMutation = useDeleteAdminLicense();

  const chartData = useMemo(() => {
    const byDate: Record<string, { date: string; value: number; sessions?: number; runs?: number }> = {};
    const start = analyticsFilter?.from
      ? parseISO(analyticsFilter.from)
      : subDays(new Date(), 30);
    const end = analyticsFilter?.to ? parseISO(analyticsFilter.to) : new Date();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = format(d, 'yyyy-MM-dd');
      byDate[key] = { date: key, value: 0, sessions: 0, runs: 0 };
    }
    metrics.forEach((m: AdminAnalyticsMetric) => {
      const key = m.bucket_time.slice(0, 10);
      if (!byDate[key]) byDate[key] = { date: key, value: 0, sessions: 0, runs: 0 };
      byDate[key].value += Number(m.value);
      if (m.metric_type === 'active_sessions') byDate[key].sessions = Number(m.value);
      if (m.metric_type === 'run_success_rate' || m.metric_type === 'run_failure_count')
        byDate[key].runs = Number(m.value);
    });
    return Object.values(byDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [metrics, analyticsFilter]);

  const workspaceByName = useMemo(() => {
    const map: Record<string, AdminWorkspace> = {};
    workspaces.forEach((w) => {
      map[w.id] = w;
    });
    return map;
  }, [workspaces]);

  const filteredMembers = useMemo(() => {
    if (!userSearch.trim()) return members;
    const q = userSearch.trim().toLowerCase();
    return members.filter(
      (m) =>
        m.user_id.toLowerCase().includes(q) ||
        (workspaceByName[m.workspace_id]?.name ?? '').toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [members, userSearch, workspaceByName]);

  const licenseSummary = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let active = 0;
    let expiringSoon = 0;
    licenses.forEach((lic) => {
      if (!lic.expiry_date || new Date(lic.expiry_date) >= now) active++;
      if (lic.expiry_date && new Date(lic.expiry_date) <= in30Days && new Date(lic.expiry_date) >= now)
        expiringSoon++;
    });
    return { total: licenses.length, active, expiringSoon };
  }, [licenses]);

  const handleWorkspaceSubmit = (data: AdminWorkspaceInsert | AdminWorkspaceUpdate) => {
    if (editingWorkspace) {
      updateWorkspaceMutation.mutate({ id: editingWorkspace.id, data });
      setEditingWorkspace(null);
    } else {
      createWorkspaceMutation.mutate(data as AdminWorkspaceInsert);
    }
    setWorkspaceModalOpen(false);
  };

  const handleUserSubmit = (data: AdminWorkspaceMemberInsert | AdminWorkspaceMemberUpdate) => {
    if (editingMember) {
      updateMemberMutation.mutate({
        id: editingMember.id,
        data,
        workspaceId: editingMember.workspace_id,
      });
      setEditingMember(null);
    } else if (selectedWorkspaceForUser && 'workspace_id' in data) {
      addMemberMutation.mutate(data as AdminWorkspaceMemberInsert);
      setSelectedWorkspaceForUser(null);
    }
    setUserFormOpen(false);
  };

  const handleLicenseSubmit = (data: AdminLicenseInsert | AdminLicenseUpdate) => {
    if (editingLicense) {
      updateLicenseMutation.mutate({ id: editingLicense.id, data });
      setEditingLicense(null);
    } else {
      createLicenseMutation.mutate(data as AdminLicenseInsert);
    }
    setLicenseDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Workspace management, user provisioning, license controls, and analytics. Cloud-only.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-card border border-border p-1 gap-1">
          <TabsTrigger
            value="workspaces"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Workspace Management
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="licenses"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            License Management
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Workspaces</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingWorkspace(null);
                    setWorkspaceModalOpen(true);
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add workspace
                </Button>
              </CardHeader>
              <CardContent>
                {workspacesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm mb-4">
                      No workspaces yet. Add one to manage users and licenses.
                    </p>
                    <Button onClick={() => setWorkspaceModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add workspace
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[320px] pr-4">
                    <ul className="space-y-2">
                      {workspaces.map((ws) => (
                        <li
                          key={ws.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/50 hover:shadow-md',
                            selectedWorkspaceForSettings?.id === ws.id && 'ring-2 ring-primary/50'
                          )}
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => setSelectedWorkspaceForSettings(ws)}
                          >
                            <p className="font-medium truncate">{ws.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ws.active_users_count} active users
                            </p>
                          </button>
                          <Badge variant={workspaceStatusVariants[ws.status]} className="shrink-0 ml-2">
                            {ws.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 ml-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingWorkspace(ws);
                                  setWorkspaceModalOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Delete this workspace? This will remove members and licenses.')) {
                                    deleteWorkspaceMutation.mutate(ws.id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
            <WorkspaceSettingsPanel
              workspace={selectedWorkspaceForSettings ?? workspaces[0] ?? null}
              onUpdate={(id, data) => updateWorkspaceMutation.mutate({ id, data })}
              isSubmitting={updateWorkspaceMutation.isPending}
            />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-4">
          <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 sm:p-4">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">User Management</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    placeholder="Search by user ID, workspace, role…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 w-full sm:w-[240px] h-9 rounded-md border border-input bg-background text-sm focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                    aria-label="Search users"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingMember(null);
                    setSelectedWorkspaceForUser(workspaces[0] ?? null);
                    setUserFormOpen(true);
                  }}
                  disabled={workspaces.length === 0}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  Add user
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm mb-4">
                    No users assigned to workspaces. Add a workspace first, then add users.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedWorkspaceForUser(workspaces[0] ?? null);
                      setUserFormOpen(true);
                    }}
                    disabled={workspaces.length === 0}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add user
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-4">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm" role="grid" aria-label="User management table">
                      <thead className="sticky top-0 z-10 bg-card border-b border-border">
                        <tr>
                          <th className="text-left font-medium text-muted-foreground px-3 py-3 h-12">
                            User ID
                          </th>
                          <th className="text-left font-medium text-muted-foreground px-3 py-3 h-12 hidden sm:table-cell">
                            Workspace
                          </th>
                          <th className="text-left font-medium text-muted-foreground px-3 py-3 h-12">
                            Role
                          </th>
                          <th className="text-left font-medium text-muted-foreground px-3 py-3 h-12 hidden md:table-cell">
                            Last login
                          </th>
                          <th className="text-right font-medium text-muted-foreground px-3 py-3 h-12 w-[100px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                              No users match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredMembers.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-border last:border-0 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                            >
                              <td className="px-3 py-3 font-mono text-xs truncate max-w-[140px]">
                                {m.user_id.slice(0, 8)}…
                              </td>
                              <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[120px]">
                                {workspaceByName[m.workspace_id]?.name ?? m.workspace_id.slice(0, 8)}
                              </td>
                              <td className="px-3 py-3">
                                <Badge variant={memberRoleVariants[m.role]} className="capitalize">
                                  {m.role}
                                </Badge>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">
                                —
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setUserDetailMember(m);
                                      setUserDetailModalOpen(true);
                                    }}
                                    aria-label="View user details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingMember(m);
                                          setSelectedWorkspaceForUser(null);
                                          setUserFormOpen(true);
                                        }}
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit role
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => {
                                          if (window.confirm('Remove this user from the workspace?')) {
                                            removeMemberMutation.mutate({
                                              id: m.id,
                                              workspaceId: m.workspace_id,
                                            });
                                          }
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total licenses</CardTitle>
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenseSummary.total}</div>
              </CardContent>
            </Card>
            <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                <KeyRound className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenseSummary.active}</div>
              </CardContent>
            </Card>
            <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expiring soon</CardTitle>
                <KeyRound className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenseSummary.expiringSoon}</div>
              </CardContent>
            </Card>
            <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Billing</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full transition-transform hover:scale-[1.02]"
                  onClick={() => {
                    setSelectedLicenseForInvoice(null);
                    setInvoiceDialogOpen(true);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View billing & invoices
                </Button>
              </CardContent>
            </Card>
          </div>
          <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">License Management</CardTitle>
              <Button size="sm" onClick={() => { setEditingLicense(null); setLicenseDialogOpen(true); }} className="transition-transform hover:scale-[1.02]">
                <Plus className="mr-1 h-4 w-4" />
                Allocate license
              </Button>
            </CardHeader>
            <CardContent>
              {licensesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : licenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <KeyRound className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm mb-4">
                    No licenses allocated. Allocate a license to a workspace or user.
                  </p>
                  <Button onClick={() => setLicenseDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Allocate license
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[320px] pr-4">
                  <ul className="space-y-2">
                    {licenses.map((lic) => (
                      <li
                        key={lic.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/50 hover:shadow-md'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {licenseTypeLabels[lic.license_type] ?? lic.license_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {workspaceByName[lic.workspace_id]?.name ?? lic.workspace_id}
                            {lic.user_id ? ` · ${lic.user_id.slice(0, 8)}…` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lic.expiry_date && (
                            <span className="text-xs text-muted-foreground">
                              Expires {format(parseISO(lic.expiry_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLicenseForInvoice(lic);
                                  setInvoiceDialogOpen(true);
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View billing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingLicense(lic);
                                  setLicenseDialogOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (window.confirm('Delete this license allocation?')) {
                                    deleteLicenseMutation.mutate(lic.id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Sessions, run success rates, skill installs. Filter by workspace and date range.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAnalyticsFilterOpen(true)} className="transition-transform hover:scale-[1.02]">
                <Filter className="mr-1 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setReportDownloadOpen(true)} className="transition-transform hover:scale-[1.02]">
                <Download className="mr-1 h-4 w-4" />
                Download report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Active sessions',
                value: metrics
                  .filter((m) => m.metric_type === 'active_sessions')
                  .reduce((s, m) => s + Number(m.value), 0),
                icon: Users,
              },
              {
                title: 'Run success rate',
                value: metrics
                  .filter((m) => m.metric_type === 'run_success_rate')
                  .reduce((s, m) => s + Number(m.value), 0) || '—',
                icon: BarChart3,
              },
              {
                title: 'Skill installs',
                value: metrics
                  .filter((m) => m.metric_type === 'skill_installs')
                  .reduce((s, m) => s + Number(m.value), 0),
                icon: Building2,
              },
              {
                title: 'Data points',
                value: metrics.length,
                icon: BarChart3,
              },
            ].map(({ title, value, icon: Icon }) => (
              <Card
                key={title}
                className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
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
            ))}
          </div>

          <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 sm:p-4">
            <CardHeader>
              <CardTitle>Metrics over time</CardTitle>
              <CardDescription>
                Aggregated metrics by date. Use Filter to change workspace or date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-[280px] w-full rounded-lg" />
              ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm mb-4">
                    No metrics in this period. Data is populated when runs and sessions are recorded.
                  </p>
                  <Button variant="outline" onClick={() => setAnalyticsFilterOpen(true)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Change filter
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'rgb(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'rgb(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      labelStyle={{ color: 'rgb(var(--foreground))' }}
                      formatter={(value: number) => [value, 'Value']}
                      labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="rgb(var(--primary))"
                      fill="rgb(var(--primary))"
                      fillOpacity={0.2}
                      name="Value"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {chartData.length > 0 && (
            <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] p-3 sm:p-4">
              <CardHeader>
                <CardTitle>Metric breakdown (bar)</CardTitle>
                <CardDescription>Daily values for the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'rgb(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'rgb(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(var(--card))',
                        border: '1px solid rgb(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                    />
                    <Bar
                      dataKey="value"
                      fill="rgb(var(--accent))"
                      radius={[4, 4, 0, 0]}
                      name="Value"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <WorkspaceConfigModal
        open={workspaceModalOpen}
        onOpenChange={setWorkspaceModalOpen}
        onSubmit={handleWorkspaceSubmit}
        isSubmitting={
          createWorkspaceMutation.isPending || updateWorkspaceMutation.isPending
        }
        workspace={editingWorkspace}
      />
      <UserManagementFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        onSubmit={handleUserSubmit}
        isSubmitting={addMemberMutation.isPending || updateMemberMutation.isPending}
        workspace={editingMember ? workspaceByName[editingMember.workspace_id] ?? null : selectedWorkspaceForUser}
        member={editingMember}
      />
      <LicenseAllocationDialog
        open={licenseDialogOpen}
        onOpenChange={setLicenseDialogOpen}
        onSubmit={handleLicenseSubmit}
        isSubmitting={
          createLicenseMutation.isPending || updateLicenseMutation.isPending
        }
        workspaces={workspaces}
        license={editingLicense}
      />
      <AnalyticsFilterDialog
        open={analyticsFilterOpen}
        onOpenChange={setAnalyticsFilterOpen}
        onApply={setAnalyticsFilter}
        workspaces={workspaces}
        currentValues={analyticsFilter}
      />
      <AdminUserDetailModal
        open={userDetailModalOpen}
        onOpenChange={setUserDetailModalOpen}
        member={userDetailMember}
        workspace={userDetailMember ? workspaceByName[userDetailMember.workspace_id] ?? null : null}
        onEdit={() => {
          if (userDetailMember) {
            setUserDetailModalOpen(false);
            setEditingMember(userDetailMember);
            setSelectedWorkspaceForUser(null);
            setUserFormOpen(true);
          }
        }}
        onRevoke={() => {
          if (userDetailMember) {
            removeMemberMutation.mutate({
              id: userDetailMember.id,
              workspaceId: userDetailMember.workspace_id,
            });
            setUserDetailMember(null);
            setUserDetailModalOpen(false);
          }
        }}
        isRevoking={removeMemberMutation.isPending}
      />
      <InvoiceDetailsDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        license={selectedLicenseForInvoice}
        workspaceName={
          selectedLicenseForInvoice
            ? workspaceByName[selectedLicenseForInvoice.workspace_id]?.name ?? '—'
            : undefined
        }
      />
      <ReportDownloadDialog
        open={reportDownloadOpen}
        onOpenChange={setReportDownloadOpen}
        workspaces={workspaces}
      />
    </div>
  );
}
