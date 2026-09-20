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
  role: UserRole;
  isActive: boolean;
  creationDate: string;
};

export type SearchUsersParams = {
  username?: string;
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
};

export type UpdateUsersActiveStateInput = {
  userIds: string[];
  isActive: boolean;
};

export type DeleteUsersResult = {
  failedUserIds: string[];
};

export type UserDetails = {
  publicId: string;
  id: number;
  discordId: string;
  discordUsername: string;
  username: string;
  avatarUrl: string;
  role: UserRole;
  isActive: boolean;
  bio: string | null;
  creationDate: string;
};
