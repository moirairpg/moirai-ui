import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLoadingScreen from './AuthLoadingScreen';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <>{children}</>;
}
