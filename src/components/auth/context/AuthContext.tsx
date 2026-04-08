import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../../../utils/api';
import { AUTH_ERROR_MESSAGES } from '../constants';
import type { AuthContextValue, AuthProviderProps, AuthUser } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.auth.user()
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setUser(data ?? null))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithDiscord = useCallback(async () => {
    try {
      setError(null);
      const res = await api.auth.discordAuthorizeUrl();
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(AUTH_ERROR_MESSAGES.oauthFailed);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(AUTH_ERROR_MESSAGES.networkError);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, error, loginWithDiscord, logout }),
    [error, isLoading, loginWithDiscord, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
