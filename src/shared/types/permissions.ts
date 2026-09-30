export type PermissionLevel = 'READ' | 'WRITE' | 'OWNER';

export type ManagedAssetKind = 'worlds' | 'adventures';

export type AssetMember = {
  userId: string;
  username: string;
  displayName: string;
  level: PermissionLevel;
};

export type AssetMemberDraft = {
  userId: string | null;
  username: string;
  displayName?: string;
  level: PermissionLevel;
};
