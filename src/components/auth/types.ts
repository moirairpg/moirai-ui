import type { ReactNode } from 'react';

export type AuthUser = {
  publicId: string;
  discordId: string;
  discordUsername: string;
  username: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  bio: string | null;
  creationDate: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
};
