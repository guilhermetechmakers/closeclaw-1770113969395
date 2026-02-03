import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, RotateCcw, Square } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import {
  useChatSessions,
  useChatSession,
  useChatMessages,
  useToolInvocations,
  useCreateChatSession,
  useUpdateChatSession,
  useSendMessage,
  useApproveToolInvocation,
  useDenyToolInvocation,
} from '@/hooks/useChat';
import { MessageThread } from '@/components/chat/message-thread';
import { Composer } from '@/components/chat/composer';
import { ToolInvocationCard } from '@/components/chat/tool-invocation-card';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { RunTracePanel } from '@/components/chat/run-trace-panel';
import { AttachmentModal } from '@/components/chat/attachment-modal';
import { SessionManagementDialog } from '@/components/chat/session-management-dialog';
import type { SessionAction } from '@/components/chat/session-management-dialog';
import type { TraceEntry } from '@/components/chat/run-trace-panel';

const AVAILABLE_TOOLS = [
  { id: 'browser', name: 'Browser', description: 'Fetch and summarize URLs' },
  { id: 'search', name: 'Search', description: 'Web search' },
  { id: 'code', name: 'Code', description: 'Run code snippets' },
];

export function Chat() {
  const { data: profile } = useProfile();
  const currentUserId = profile?.user_id ?? null;

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionAction, setSessionAction] = useState<SessionAction | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<{ url: string; name?: string }[]>([]);
  const [traceEntries, setTraceEntries] = useState<TraceEntry[]>([]);

  const { data: sessions = [], isLoading: sessionsLoading } = useChatSessions();
  const { data: session } = useChatSession(selectedSessionId);
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(
    selectedSessionId,
    200
  );
  const { data: toolInvocations = [] } = useToolInvocations(selectedSessionId, { limit: 20 });

  const createSessionMutation = useCreateChatSession();
  const updateSessionMutation = useUpdateChatSession();
  const sendMessageMutation = useSendMessage();
  const approveToolMutation = useApproveToolInvocation();
  const denyToolMutation = useDenyToolInvocation();

  // Auto-select first session when list loads; create one when none
  useEffect(() => {
    if (sessionsLoading) return;
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
      return;
    }
    if (sessions.length === 0) {
      createSessionMutation.mutate(
        { title: 'New session' },
        {
          onSuccess: (newSession) => setSelectedSessionId(newSession.id),
        }
      );
    }
  }, [sessionsLoading, sessions.length, sessions, selectedSessionId, createSessionMutation]);

  const handleSendMessage = useCallback(
    (
      text: string,
      options?: { toolName?: string; attachmentUrls?: { url: string; name?: string }[] }
    ) => {
      if (!selectedSessionId) return;
      sendMessageMutation.mutate(
        {
          session_id: selectedSessionId,
          sender_id: currentUserId ?? undefined,
          role: 'user',
          text,
          attachment_links: options?.attachmentUrls ?? pendingAttachments,
        },
        {
          onSuccess: () => setPendingAttachments([]),
        }
      );
    },
    [selectedSessionId, currentUserId, pendingAttachments, sendMessageMutation]
  );

  const handleSessionAction = useCallback(
    (action: SessionAction) => {
      if (action === 'new') {
        createSessionMutation.mutate(
          { title: `Session ${new Date().toLocaleTimeString()}` },
          {
            onSuccess: (newSession) => {
              setSelectedSessionId(newSession.id);
              setSessionDialogOpen(false);
              setSessionAction(null);
            },
          }
        );
      } else if (action === 'reset' && selectedSessionId) {
        createSessionMutation.mutate(
          { title: `Session ${new Date().toLocaleTimeString()}` },
          {
            onSuccess: (newSession) => {
              setSelectedSessionId(newSession.id);
              setSessionDialogOpen(false);
              setSessionAction(null);
            },
          }
        );
      } else if (action === 'stop' && selectedSessionId) {
        updateSessionMutation.mutate(
          { id: selectedSessionId, data: { status: 'paused' } },
          {
            onSuccess: () => {
              setSessionDialogOpen(false);
              setSessionAction(null);
            },
          }
        );
      }
    },
    [
      selectedSessionId,
      createSessionMutation,
      updateSessionMutation,
    ]
  );

  const handleApproveTool = useCallback(
    (id: string) => {
      if (selectedSessionId)
        approveToolMutation.mutate({ id, sessionId: selectedSessionId });
    },
    [selectedSessionId, approveToolMutation]
  );

  const handleDenyTool = useCallback(
    (id: string) => {
      if (selectedSessionId)
        denyToolMutation.mutate({ id, sessionId: selectedSessionId });
    },
    [selectedSessionId, denyToolMutation]
  );

  const openSessionDialog = (action: SessionAction) => {
    setSessionAction(action);
    setSessionDialogOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 animate-fade-in-up">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Chat Session</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSessionDialog('new')}
            className="gap-1.5 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            /new
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSessionDialog('reset')}
            disabled={!selectedSessionId}
            className="gap-1.5 transition-transform hover:scale-105 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            /reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSessionDialog('stop')}
            disabled={!selectedSessionId}
            className="gap-1.5 transition-transform hover:scale-105 active:scale-95"
          >
            <Square className="h-4 w-4" />
            /stop
          </Button>
        </div>
      </header>

      <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-3">
        <div className="flex min-h-0 flex-col lg:col-span-2">
          <Card className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card">
            <MessageThread
              messages={messages}
              isLoading={messagesLoading}
              currentUserId={currentUserId}
              className="min-h-0"
            />
            <Composer
              sessionId={selectedSessionId}
              onSend={handleSendMessage}
              onAttachClick={() => setAttachmentModalOpen(true)}
              disabled={!selectedSessionId}
              isSending={sendMessageMutation.isPending}
              availableTools={AVAILABLE_TOOLS}
            />
          </Card>
          {toolInvocations.length > 0 && (
            <ScrollArea className="mt-4 max-h-64 rounded-lg border border-border bg-card p-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Tool invocations</p>
                {toolInvocations.map((inv) => (
                  <ToolInvocationCard
                    key={inv.id}
                    invocation={inv}
                    onApprove={handleApproveTool}
                    onDeny={handleDenyTool}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-auto">
          <ChatSidebar
            session={session ?? null}
            sessions={sessions}
            onSelectSession={setSelectedSessionId}
            currentSessionId={selectedSessionId}
            routingTargets={[]}
          />
          <RunTracePanel
            traces={traceEntries}
            onExport={() => setTraceEntries([])}
          />
        </div>
      </div>

      <AttachmentModal
        open={attachmentModalOpen}
        onOpenChange={setAttachmentModalOpen}
        attachments={pendingAttachments}
        onAdd={(url, name) =>
          setPendingAttachments((prev) => [...prev, { url, name }])
        }
        onRemove={(i) =>
          setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
        }
        onConfirm={() => {}}
        maxAttachments={5}
      />

      <SessionManagementDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        action={sessionAction}
        onConfirm={handleSessionAction}
        isLoading={
          createSessionMutation.isPending || updateSessionMutation.isPending
        }
      />
    </div>
  );
}
