import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav />
        <main
          className={cn(
            'flex-1 overflow-auto p-4 md:p-6',
            'max-w-content mx-auto w-full'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
