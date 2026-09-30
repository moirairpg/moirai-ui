import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AssetMemberDraft, PermissionLevel } from '../types/permissions';

type AssetMemberRowProps = {
  member: AssetMemberDraft;
  isPublic: boolean;
  readOnly: boolean;
  onLevelChange: (level: PermissionLevel) => void;
  onRemove: () => void;
};

function AssetMemberRow({ member, isPublic, readOnly, onLevelChange, onRemove }: AssetMemberRowProps) {
  const { t } = useTranslation('common');
  const isOwnerRow = member.level === 'OWNER';
  const hasNoEffect = isPublic && member.level === 'READ';

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border px-3 py-2">
      <span className="flex-1 truncate text-sm text-foreground">
        {member.displayName}
        <span className="block truncate text-xs text-muted-foreground">@{member.username}</span>
      </span>

      {hasNoEffect && (
        <span className="text-xs text-muted-foreground">{t('access.readHasNoEffect')}</span>
      )}

      {readOnly || isOwnerRow ? (
        <span className="text-sm text-muted-foreground">{t(`access.levels.${member.level.toLowerCase()}`)}</span>
      ) : (
        <select
          value={member.level}
          onChange={(e) => onLevelChange(e.target.value as PermissionLevel)}
          className="rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
        >
          {!isPublic && <option value="READ">{t('access.levels.read')}</option>}
          <option value="WRITE">{t('access.levels.write')}</option>
        </select>
      )}

      {!readOnly && !isOwnerRow && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          {t('access.actions.remove')}
        </button>
      )}
    </div>
  );
}

type AssetMembersSectionProps = {
  members: AssetMemberDraft[];
  visibility: string;
  readOnly: boolean;
  isLoading: boolean;
  error: string;
  onAdd: (username: string, level: PermissionLevel) => void;
  onLevelChange: (username: string, level: PermissionLevel) => void;
  onRemove: (username: string) => void;
};

export function AssetMembersSection({
  members,
  visibility,
  readOnly,
  isLoading,
  error,
  onAdd,
  onLevelChange,
  onRemove,
}: AssetMembersSectionProps) {
  const { t } = useTranslation('common');

  const isPublic = visibility === 'PUBLIC';
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState<PermissionLevel>(isPublic ? 'WRITE' : 'READ');

  const handleAdd = () => {
    onAdd(username, level);
    setUsername('');
  };

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('access.title')}
      </span>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('access.usernamePlaceholder')}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as PermissionLevel)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            {!isPublic && <option value="READ">{t('access.levels.read')}</option>}
            <option value="WRITE">{t('access.levels.write')}</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!username.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {t('access.actions.add')}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading && members.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('access.loading')}</p>
      )}

      {!isLoading && members.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('access.empty')}</p>
      )}

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <AssetMemberRow
            key={member.username}
            member={member}
            isPublic={isPublic}
            readOnly={readOnly}
            onLevelChange={(next) => onLevelChange(member.username, next)}
            onRemove={() => onRemove(member.username)}
          />
        ))}
      </div>
    </div>
  );
}
