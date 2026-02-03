import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Plug,
  BookOpen,
  Cpu,
  Calendar,
  Webhook,
  Bot,
  Monitor,
  Mic,
  Key,
  Settings,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/chat', label: 'Chat Session', icon: MessageSquare },
  { to: '/channels', label: 'Channels & Adapters', icon: Plug },
  { to: '/skills', label: 'Skills Library', icon: BookOpen },
  { to: '/skill-editor', label: 'Skill Editor', icon: FileText },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/nodes', label: 'Nodes', icon: Cpu },
  { to: '/cron', label: 'Cron Jobs', icon: Calendar },
  { to: '/webhooks', label: 'Webhooks & Hooks', icon: Webhook },
  { to: '/model-providers', label: 'Model Providers', icon: Bot },
  { to: '/browser', label: 'Browser Automation', icon: Monitor },
  { to: '/voice', label: 'Voice & Media', icon: Mic },
  { to: '/secrets', label: 'Secrets & Keychain', icon: Key },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/security', label: 'Security Audit', icon: Shield },
  { to: '/logs', label: 'Logs & Tracing', icon: FileText },
  { to: '/admin', label: 'Admin', icon: Shield },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-56'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <span className="truncate text-sm font-semibold">Clawgate</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
    </aside>
  );
}
