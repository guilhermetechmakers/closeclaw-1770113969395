import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Save } from 'lucide-react';
import type { AdminWorkspace, AdminWorkspaceUpdate } from '@/types/database';
import { SettingsConfirmationDialog } from './settings-confirmation-dialog';

export interface WorkspaceSettingsPanelProps {
  workspace: AdminWorkspace | null;
  onUpdate: (id: string, data: AdminWorkspaceUpdate) => void;
  isSubmitting?: boolean;
}

const defaultConfig = {
  allow_user_registration: false,
  data_retention_days: 90,
  registry_enabled: true,
};

export function WorkspaceSettingsPanel({
  workspace,
  onUpdate,
  isSubmitting = false,
}: WorkspaceSettingsPanelProps) {
  const [allowRegistration, setAllowRegistration] = useState(
    (workspace?.configuration_details as Record<string, unknown>)?.allow_user_registration === true
  );
  const [retentionDays, setRetentionDays] = useState(
    Number((workspace?.configuration_details as Record<string, unknown>)?.data_retention_days) || 90
  );
  const [registryEnabled, setRegistryEnabled] = useState(
    (workspace?.configuration_details as Record<string, unknown>)?.registry_enabled !== false
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const cfg = workspace?.configuration_details as Record<string, unknown> | undefined;
    setAllowRegistration(cfg?.allow_user_registration === true);
    setRetentionDays(Number(cfg?.data_retention_days) || 90);
    setRegistryEnabled(cfg?.registry_enabled !== false);
    setDirty(false);
  }, [workspace?.id, workspace?.configuration_details]);

  const handleToggle = (key: string, value: boolean | number) => {
    if (key === 'allow_user_registration') setAllowRegistration(!!value);
    if (key === 'data_retention_days') setRetentionDays(Number(value) || 90);
    if (key === 'registry_enabled') setRegistryEnabled(!!value);
    setDirty(true);
  };

  const handleSaveClick = () => {
    if (!dirty || !workspace) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!workspace) return;
    onUpdate(workspace.id, {
      configuration_details: {
        ...defaultConfig,
        ...(workspace.configuration_details || {}),
        allow_user_registration: allowRegistration,
        data_retention_days: retentionDays,
        registry_enabled: registryEnabled,
      },
    });
    setDirty(false);
  };

  if (!workspace) {
    return (
      <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Workspace settings
          </CardTitle>
          <CardDescription>
            Select a workspace above or create one to configure policies and registry controls.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-[10px] border-border shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Workspace settings
          </CardTitle>
          <CardDescription>
            Default policies and registry controls for {workspace.name}. Changes require confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-3">
            <Label htmlFor="ws-allow-registration" className="cursor-pointer flex-1">
              Allow user registration
            </Label>
            <Switch
              id="ws-allow-registration"
              checked={allowRegistration}
              onCheckedChange={(v) => handleToggle('allow_user_registration', v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-3">
            <Label htmlFor="ws-registry" className="cursor-pointer flex-1">
              Registry enabled
            </Label>
            <Switch
              id="ws-registry"
              checked={registryEnabled}
              onCheckedChange={(v) => handleToggle('registry_enabled', v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-retention">Data retention (days)</Label>
            <Select
              value={String(retentionDays)}
              onValueChange={(v) => handleToggle('data_retention_days', Number(v))}
            >
              <SelectTrigger
                id="ws-retention"
                className="focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[30, 60, 90, 180, 365].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSaveClick}
            disabled={!dirty || isSubmitting}
            className="w-full transition-transform hover:scale-[1.02]"
          >
            <Save className="mr-2 h-4 w-4" />
            {dirty ? 'Save changes' : 'No changes'}
          </Button>
        </CardContent>
      </Card>
      <SettingsConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm workspace settings"
        description="Saving will update default policies and registry controls for this workspace. Continue?"
        confirmLabel="Save changes"
        onConfirm={handleConfirmSave}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
