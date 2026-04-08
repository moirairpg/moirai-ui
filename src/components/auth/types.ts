import type { ReactNode } from 'react';

export type AuthUser = {
  publicId: string;
  discordId: string;
  username: string;
  nickname: string;
  avatarUrl: string;
  role: string;
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
