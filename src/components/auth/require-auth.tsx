/**
 * RequireAuth: redirects to /login?returnTo=... when user is not signed in.
 * Use for routes that require a cloud account (e.g. profile, security).
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
