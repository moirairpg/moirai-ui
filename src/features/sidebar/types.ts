export type Permission = {
  userId: string;
  level: string;
};

export type ModelConfiguration = {
  aiModel: string;
  maxTokenLimit: number;
  temperature: number;
};

export type ContextAttributes = {
  nudge: string;
  bump: string;
  bumpFrequency: number;
};

export type AdventureLorebookEntry = {
  id: string;
  adventureId: string;
  name: string;
  description: string;
  playerId: string;
  isPlayerCharacter: boolean;
  creationDate: string;
  lastUpdateDate: string;
};

export type AdventureDetails = {
  id: string;
  name: string;
  description: string;
  adventureStart: string;
  worldId: string | null;
  narratorName: string | null;
  narratorPersonality: string | null;
  visibility: string;
  moderation: string;
  isMultiplayer: boolean;
  imageUrl: string | null;
  creationDate: string;
  lastUpdateDate: string;
  modelConfiguration: ModelConfiguration;
  contextAttributes: ContextAttributes;
  permissions: Permission[];
  lorebook: AdventureLorebookEntry[];
};

export type WorldLorebookEntry = {
  id: string;
  worldId: string;
  name: string;
  description: string;
  creationDate: string;
  lastUpdateDate: string;
};

export type WorldDetails = {
  id: string;
  name: string;
  description: string;
  adventureStart: string;
  narratorName: string | null;
  narratorPersonality: string | null;
  visibility: string;
  imageUrl: string | null;
  permissions: Permission[];
  lorebook: WorldLorebookEntry[];
  creationDate: string;
  lastUpdateDate: string;
};

