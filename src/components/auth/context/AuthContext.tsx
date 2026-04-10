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
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      setError(AUTH_ERROR_MESSAGES.oauthFailed);
      return;
    }
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify`;
    window.location.href = url;
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
