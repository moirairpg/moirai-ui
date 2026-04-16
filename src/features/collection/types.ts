export type AdventureSummary = {
  id: string;
  name: string;
  description: string;
  worldName: string;
  personaName: string;
  visibility: string;
  creationDate: string;
  imageUrl: string | null;
  canWrite: boolean;
};

export type WorldSummary = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  creationDate: string;
  imageUrl: string | null;
  canWrite: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  items: number;
  totalItems: number;
  page: number;
  totalPages: number;
};

export type CollectionView = 'MY_STUFF' | 'SHARED_WITH_ME' | 'EXPLORE';
export type CollectionTab = 'adventures' | 'worlds';
