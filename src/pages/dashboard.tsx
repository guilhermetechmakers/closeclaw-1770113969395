import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calendar,
  Cpu,
  Shield,
  Play,
  Activity,
} from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active runs', value: '0', icon: Play, href: '/chat' },
          { title: 'Cron jobs', value: '0', icon: Calendar, href: '/cron' },
          { title: 'Nodes', value: '0', icon: Cpu, href: '/nodes' },
          { title: 'Alerts', value: '0', icon: Shield, href: '/security' },
        ].map(({ title, value, icon: Icon, href }) => (
          <Link key={title} to={href}>
            <Card className="transition-shadow hover:shadow-card-hover">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent activity
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quick Run
            </CardTitle>
            <CardDescription>Run a quick command from here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a command..."
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button>
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active runs</CardTitle>
          <CardDescription>Stream and abort running jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active runs.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cron overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No cron jobs.</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/cron">Manage cron</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nodes status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No paired nodes.</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/nodes">Pair node</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill alerts / audit findings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No alerts.</p>
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link to="/security">Run audit</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
