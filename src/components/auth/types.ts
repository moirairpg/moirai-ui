import type { ReactNode } from 'react';

export type AuthUser = {
  publicId: string;
  discordUsername: string;
  username: string;
  displayName: string;
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
  signInWithDiscord: () => Promise<void>;
  signUpWithDiscord: () => Promise<void>;
  logout: (redirectPath?: string) => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
};
