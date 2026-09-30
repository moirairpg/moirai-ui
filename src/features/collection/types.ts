export type AdventureSummary = {
  id: string;
  name: string;
  description: string;
  worldName: string | null;
  narratorName: string | null;
  visibility: string;
  creationDate: string;
  imageUrl: string | null;
  canWrite: boolean;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
};

export type WorldSummary = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  creationDate: string;
  imageUrl: string | null;
  canWrite: boolean;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
};

export type PlayerCharacterSummary = {
  id: string;
  ownerUsername: string;
  ownerDisplayName: string;
  name: string;
  characterClass: string | null;
  background: string;
  imageUrl: string | null;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
};

export type PaginatedResult<T> = {
  data: T[];
  items: number;
  totalItems: number;
  page: number;
  totalPages: number;
};

export type CollectionView = 'MY_STUFF' | 'SHARED_WITH_ME' | 'EXPLORE';
export type CollectionTab = 'adventures' | 'worlds' | 'characters';
