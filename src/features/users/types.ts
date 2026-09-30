export type UserRole = 'PLAYER' | 'ADMIN';

export type PaginatedResult<T> = {
  data: T[];
  items: number;
  totalItems: number;
  page: number;
  totalPages: number;
};

export type UserSummary = {
  publicId: string;
  username: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  creationDate: string;
};

export type SearchUsersParams = {
  username?: string;
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
  registeredFrom?: string;
  registeredTo?: string;
  page?: number;
  size?: number;
};

export type UpdateUserInput = {
  role: UserRole;
  isActive: boolean;
  bio: string | null;
  displayName: string;
};

export type UpdateUserDetailsInput = {
  displayName: string;
  bio: string | null;
};

export type UpdateUsernameInput = {
  username: string;
};

export type CreateUserInput = {
  username: string;
  displayName: string;
};

export type UpdateUsersActiveStateInput = {
  usernames: string[];
  isActive: boolean;
};

export type DeleteUsersResult = {
  failedUsernames: string[];
};

export type UserDetails = {
  publicId: string;
  id: number;
  discordUsername: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  isActive: boolean;
  bio: string | null;
  creationDate: string;
};
