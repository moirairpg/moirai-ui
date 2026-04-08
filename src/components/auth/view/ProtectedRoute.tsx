import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthLoadingScreen from './AuthLoadingScreen';
import DiscordLoginScreen from './DiscordLoginScreen';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;
  if (!user) return <DiscordLoginScreen />;

  return <>{children}</>;
}
