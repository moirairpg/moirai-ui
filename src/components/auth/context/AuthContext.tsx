import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, SESSION_ENDED_EVENT } from '../../../utils/api';
import type { AuthContextValue, AuthProviderProps, AuthUser } from '../types';

const SIGN_IN_AUTHORIZE_PATH = '/api/auth/signin/authorize';
const SIGN_UP_AUTHORIZE_PATH = '/api/auth/signup/authorize';

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.auth.user()
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setUser(data ?? null))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleSessionEnded = () => setUser(null);

    window.addEventListener(SESSION_ENDED_EVENT, handleSessionEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, handleSessionEnded);
  }, []);

  const signInWithDiscord = useCallback(async () => {
    window.location.href = SIGN_IN_AUTHORIZE_PATH;
  }, []);

  const signUpWithDiscord = useCallback(async () => {
    window.location.href = SIGN_UP_AUTHORIZE_PATH;
  }, []);

  const logout = useCallback(async (redirectPath: string = '/') => {
    await api.auth.logout().catch(() => {});
    window.location.href = redirectPath;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, signInWithDiscord, signUpWithDiscord, logout }),
    [isLoading, signInWithDiscord, signUpWithDiscord, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
