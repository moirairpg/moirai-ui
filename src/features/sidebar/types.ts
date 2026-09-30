export type ModelConfiguration = {
  aiModel: string;
  maxTokenLimit: number;
  temperature: number;
};

export type ContextAttributes = {
  nudge: string;
  authorsNote: string;
  scene: string;
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
  rpgMechanicsEnabled: boolean;
  imageUrl: string | null;
  creationDate: string;
  lastUpdateDate: string;
  modelConfiguration: ModelConfiguration;
  contextAttributes: ContextAttributes;
  canManage: boolean;
  isOwner: boolean;
  lorebook: AdventureLorebookEntry[];
  roster: AdventureMembershipSummary[];
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
};

export type AdventureMembershipSummary = {
  playerCharacterId: string;
  playerId: string;
  playerUsername: string;
  playerDisplayName: string;
  name: string;
  characterClass: string | null;
  imageUrl: string | null;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
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
  canManage: boolean;
  isOwner: boolean;
  lorebook: WorldLorebookEntry[];
  creationDate: string;
  lastUpdateDate: string;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
};

