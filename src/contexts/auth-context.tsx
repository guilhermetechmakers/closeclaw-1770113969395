/**
 * Auth context: provides current user, session, loading state, and signOut.
 * Subscribes to Supabase onAuthStateChange so UI stays in sync.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signOut as authSignOut } from '@/api/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    getSession().then(({ user, session }) => {
      if (!cancelled) {
        setState({ user, session, isLoading: false });
      }
    });

    const unsubscribe = onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isLoading: false,
        }));
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setState({ user: null, session: null, isLoading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signOut,
    }),
    [state.user, state.session, state.isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
