import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  QrCode,
  Plus,
  Cpu,
  Settings,
  Trash2,
  MoreHorizontal,
  Wifi,
  ShieldCheck,
  Mic,
  Terminal,
  Monitor,
  Camera,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useNodes,
  useNode,
  useNodeCapabilities,
  useNodeApprovals,
  useStartPairing,
  useUpdateNode,
  useDeleteNode,
  useUpsertNodeCapability,
  useUpdateNodeApproval,
} from '@/hooks/useNodes';
import { nodesApi } from '@/api/nodes';
import type { Node, NodeCapability, PairingRequest } from '@/types/database';
import { PairingModal } from '@/components/nodes/pairing-modal';
import { ApprovalRequestModal } from '@/components/nodes/approval-request-modal';
import { CapabilityConfigForm } from '@/components/nodes/capability-config-form';
import { NodeHealthDialog } from '@/components/dashboard/node-health-dialog';
import { UnpairConfirmDialog } from '@/components/nodes/unpair-confirm-dialog';
import { NodeDetailsCard } from '@/components/nodes/node-details-card';

const statusVariants: Record<Node['status'], 'success' | 'warning' | 'destructive' | 'secondary'> = {
  paired: 'success',
  offline: 'destructive',
  error: 'warning',
};

const healthVariants: Record<Node['connection_health'], 'success' | 'warning' | 'secondary' | 'destructive'> = {
  healthy: 'success',
  degraded: 'warning',
  unknown: 'secondary',
  offline: 'destructive',
};

const capabilityIcons: Record<string, typeof Cpu> = {
  voice_wake: Mic,
  talk_mode: Mic,
  remote_exec: Terminal,
  browser_proxy: Monitor,
  camera_capture: Camera,
};

const capabilityBadgeLabels: Record<string, string> = {
  voice_wake: 'Voice',
  talk_mode: 'Talk',
  remote_exec: 'Exec',
  browser_proxy: 'Browser',
  camera_capture: 'Camera',
};

export function Nodes() {
  const [pairingOpen, setPairingOpen] = useState(false);
  const [pairingRequest, setPairingRequest] = useState<PairingRequest | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [capabilityFormOpen, setCapabilityFormOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<NodeCapability | null>(null);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [unpairDialogOpen, setUnpairDialogOpen] = useState(false);
  const [nodeToUnpair, setNodeToUnpair] = useState<Node | null>(null);

  const { data: nodes = [], isLoading: nodesLoading } = useNodes();
  const { data: selectedNode } = useNode(selectedNodeId);
  const { data: capabilities = [] } = useNodeCapabilities(selectedNodeId);
  const { data: approvals = [] } = useNodeApprovals({ limit: 20 });

  const startPairing = useStartPairing();
  const updateNode = useUpdateNode();
  const deleteNode = useDeleteNode();
  const upsertCapability = useUpsertNodeCapability();
  const updateApproval = useUpdateNodeApproval();

  const selectedApproval = approvals.find((a) => a.id === selectedApprovalId);

  const handleStartPairing = async () => {
    try {
      const req = await startPairing.mutateAsync();
      setPairingRequest(req);
    } catch {
      // toast from hook
    }
  };

  const handleCapabilitySubmit = (values: { status: string; description?: string }) => {
    if (!selectedNodeId || !selectedCapability) return;
    upsertCapability.mutate({
      node_id: selectedNodeId,
      capability_key: selectedCapability.capability_key,
      status: values.status as NodeCapability['status'],
      description: values.description ?? null,
    });
    setCapabilityFormOpen(false);
    setSelectedCapability(null);
  };

  const handleApprove = (id: string) => {
    updateApproval.mutate({ id, data: { status: 'approved' } });
    setApprovalModalOpen(false);
    setSelectedApprovalId(null);
  };

  const handleDeny = (id: string) => {
    updateApproval.mutate({ id, data: { status: 'denied' } });
    setApprovalModalOpen(false);
    setSelectedApprovalId(null);
  };

  const handleUpdateHealth = (id: string, connection_health: Node['connection_health']) => {
    updateNode.mutate({ id, data: { connection_health } });
  };

  const handleUnpairClick = (node: Node) => {
    setNodeToUnpair(node);
    setUnpairDialogOpen(true);
  };

  const handleUnpairConfirm = () => {
    if (!nodeToUnpair) return;
    deleteNode.mutate(nodeToUnpair.id);
    if (selectedNodeId === nodeToUnpair.id) setSelectedNodeId(null);
    setNodeToUnpair(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="space-y-2">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground font-medium">Nodes (Paired Devices)</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Nodes (Paired Devices)</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage paired devices, capabilities, and approval policies.
            </p>
          </div>
          <Button onClick={() => { setPairingRequest(null); setPairingOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Pair New Device
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Nodes list</CardTitle>
              <CardDescription>
                Paired devices with capability badges. Select a node to manage capabilities and exec allowlist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nodesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <Cpu className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No paired nodes. Use Pair New Device to add a device via QR or code.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setPairingOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Pair New Device
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-2">
                    {nodes.map((node) => (
                      <div
                        key={node.id}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg border p-4 transition-colors',
                          selectedNodeId === node.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-card'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(node.id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{node.name ?? `Node ${node.id.slice(0, 8)}`}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              ID: {node.id.slice(0, 8)}
                              {node.id.length > 8 ? '…' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last seen:{' '}
                              {node.last_active_at
                                ? formatDistanceToNow(new Date(node.last_active_at), { addSuffix: true })
                                : 'Never'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {(node.capabilities ?? []).slice(0, 4).map((key) => (
                              <Badge key={key} variant="secondary" className="text-[10px] font-normal">
                                {capabilityBadgeLabels[key] ?? key}
                              </Badge>
                            ))}
                            <Badge variant={statusVariants[node.status]} className="shrink-0">
                              {node.status}
                            </Badge>
                            <Badge variant={healthVariants[node.connection_health]} className="shrink-0">
                              {node.connection_health}
                            </Badge>
                          </div>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedNodeId(node.id); setHealthDialogOpen(true); }}>
                              <Wifi className="mr-2 h-4 w-4" />
                              Connection health
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleUnpairClick(node)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Revoke / Unpair
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Pair node</CardTitle>
              <CardDescription>
                QR on left, code and instructions on right, expiry countdown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start pairing to show QR and code.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setPairingOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Start pairing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <NodeDetailsCard
            node={selectedNode ?? null}
            capabilities={capabilities}
          />
          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Capabilities</CardTitle>
              <CardDescription>
                Enable or disable capabilities for the selected node.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedNodeId ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Select a node to manage capabilities.</p>
                </div>
              ) : capabilities.length === 0 ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {capabilities.map((cap) => {
                    const Icon = capabilityIcons[cap.capability_key] ?? Cpu;
                    return (
                      <div
                        key={cap.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {cap.capability_key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {nodesApi.getCapabilityDescription(cap.capability_key)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              cap.status === 'enabled'
                                ? 'success'
                                : cap.status === 'pending_approval'
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {cap.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedCapability(cap);
                              setCapabilityFormOpen(true);
                            }}
                            aria-label="Edit capability"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Approval history</CardTitle>
              <CardDescription>
                Exec approvals, denied runs, and pending capability or execution requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                  <ShieldCheck className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No approvals yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-[240px] pr-2">
                  <div className="space-y-2">
                    {approvals.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setSelectedApprovalId(a.id);
                          setApprovalModalOpen(true);
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-card"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium capitalize">
                            {a.action_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="secondary">{a.status}</Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PairingModal
        open={pairingOpen}
        onOpenChange={setPairingOpen}
        pairingRequest={pairingRequest}
        onStartPairing={handleStartPairing}
        isStartingPairing={startPairing.isPending}
        onPaired={() => {
          setPairingRequest(null);
          setPairingOpen(false);
        }}
      />

      <ApprovalRequestModal
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        approval={selectedApproval ?? null}
        node={selectedApproval ? nodes.find((n) => n.id === selectedApproval.node_id) ?? null : null}
        onApprove={handleApprove}
        onDeny={handleDeny}
        isUpdating={updateApproval.isPending}
      />

      <CapabilityConfigForm
        open={capabilityFormOpen}
        onOpenChange={setCapabilityFormOpen}
        node={selectedNode ?? null}
        capability={selectedCapability}
        onSubmit={handleCapabilitySubmit}
        isSubmitting={upsertCapability.isPending}
      />

      <NodeHealthDialog
        node={selectedNode ?? null}
        open={healthDialogOpen}
        onOpenChange={setHealthDialogOpen}
        onUpdateHealth={handleUpdateHealth}
        isUpdating={updateNode.isPending}
      />

      <UnpairConfirmDialog
        open={unpairDialogOpen}
        onOpenChange={setUnpairDialogOpen}
        node={nodeToUnpair}
        onConfirm={handleUnpairConfirm}
        isUnpairing={deleteNode.isPending}
      />
    </div>
  );
}
