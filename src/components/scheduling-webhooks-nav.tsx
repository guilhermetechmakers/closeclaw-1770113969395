import { NavLink } from 'react-router-dom';
import { Calendar, Webhook } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/cron', label: 'Scheduling', icon: Calendar },
  { to: '/webhooks', label: 'Webhooks & Hooks', icon: Webhook },
];

export function SchedulingWebhooksNav() {
  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4"
      aria-label="Scheduling and Webhooks sections"
    >
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to !== '/webhooks'}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              'hover:bg-secondary/50 hover:scale-[1.02] active:scale-[0.98]',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
