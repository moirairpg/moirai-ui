import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, SESSION_ENDED_EVENT } from '../../../utils/api';
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

  useEffect(() => {
    const handleSessionEnded = () => setUser(null);

    window.addEventListener(SESSION_ENDED_EVENT, handleSessionEnded);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, handleSessionEnded);
  }, []);

  const authorizeWithDiscord = useCallback((redirectUri?: string) => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    if (!clientId || !redirectUri) {
      setError(AUTH_ERROR_MESSAGES.oauthFailed);
      return;
    }
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify`;
    window.location.href = url;
  }, []);

  const signInWithDiscord = useCallback(async () => {
    authorizeWithDiscord(import.meta.env.VITE_DISCORD_SIGNIN_REDIRECT_URI);
  }, [authorizeWithDiscord]);

  const signUpWithDiscord = useCallback(async () => {
    authorizeWithDiscord(import.meta.env.VITE_DISCORD_SIGNUP_REDIRECT_URI);
  }, [authorizeWithDiscord]);

  const logout = useCallback(async (redirectPath: string = '/') => {
    await api.auth.logout().catch(() => {});
    window.location.href = redirectPath;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, error, signInWithDiscord, signUpWithDiscord, logout }),
    [error, isLoading, signInWithDiscord, signUpWithDiscord, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
