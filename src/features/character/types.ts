export type CharacterAttributes = Record<string, number>;
export type CharacterSkills = Record<string, number>;
export type CharacterSignatures = Record<string, number>;

export type AttributeOption = { name: string; label: string };
export type SkillOption = { name: string; label: string; attribute: string };
export type SignatureOption = { name: string; label: string; attribute: string };

export type AttributeVocabulary = {
  attributes: AttributeOption[];
  maxLevel: number;
  creation: { points: number; levelCap: number };
};

export type SkillVocabulary = {
  skills: SkillOption[];
  maxLevel: number;
  creation: {
    points: number;
    levelCap: number;
    favoredCost: number;
    offClassCost: number;
    signatureStartingLevel: number;
  };
};

export type CharacterClassOption = {
  name: string;
  label: string;
  signatureSkill: SignatureOption;
  favoredSkills: string[];
};

export type PlayerCharacterDetails = {
  id: string;
  ownerUsername: string;
  ownerDisplayName: string;
  name: string;
  characterClass: string | null;
  personality: string;
  physicalDescription: string;
  background: string;
  attributes: CharacterAttributes;
  skills: CharacterSkills;
  signatureSkill: CharacterSignatures;
  xp: number;
  level: number;
  unspentAttributePoints: number;
  unspentSkillPoints: number;
  levelUpXpTarget: number;
  imageUrl: string | null;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
  canManage: boolean;
  isOwner: boolean;
  creationDate: string;
  lastUpdateDate: string;
};

export type CharacterFormInput = {
  name: string;
  characterClass: string;
  personality: string;
  physicalDescription: string;
  background: string;
};

export type CharacterAdventureSummary = {
  publicId: string;
  name: string;
  imageUrl: string | null;
  uiImagePositionX: number | null;
  uiImagePositionY: number | null;
};
