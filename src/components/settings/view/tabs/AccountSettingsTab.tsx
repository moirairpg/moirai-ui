import { LogOut, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { notifySuccess } from '../../../../utils/api';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';
import { useDeleteUser, useGetUser, useUpdateUserDetails } from '../../../../features/users';
import SettingsCard from '../SettingsCard';
import SettingsRow from '../SettingsRow';
import SettingsSection from '../SettingsSection';

const MAX_BIO_LENGTH = 2000;
const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 32;
const ACCOUNT_DELETED_PATH = '/?notice=account-deleted';

export default function AccountSettingsTab() {
  const { t } = useTranslation('settings');
  const { user, logout } = useAuth();
  const { data: account } = useGetUser(user?.username);
  const { mutate: updateUserDetails, isLoading: isSaving } = useUpdateUserDetails();
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUser();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [savedProfile, setSavedProfile] = useState({ displayName: '', bio: '' });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!account) return;

    const loaded = { displayName: account.displayName, bio: account.bio ?? '' };

    setSavedProfile(loaded);
    setDisplayName(loaded.displayName);
    setBio(loaded.bio);
  }, [account]);

  if (!account) return null;

  const displayNameError =
    displayName.trim().length < MIN_DISPLAY_NAME_LENGTH ? t('accountSettings.displayName.length') : null;

  const canSave = !displayNameError && !isSaving;

  const handleSave = async () => {
    const updated = await updateUserDetails(account.username, { displayName, bio });

    if (updated) {
      setSavedProfile({ displayName, bio });
      notifySuccess(t('toast.saved', { ns: 'common' }));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(savedProfile.displayName);
    setBio(savedProfile.bio);
    setIsEditing(false);
  };

  const handleDeleteConfirm = async () => {
    const deleted = await deleteUser(account.username);
    if (deleted) {
      await logout(ACCOUNT_DELETED_PATH);
      return;
    }

    setIsConfirmingDelete(false);
  };

  return (
    <div className="space-y-8">
      <SettingsSection title={t('accountSettings.title')}>
        <SettingsCard divided>
          <SettingsRow
            label={t('accountSettings.username.label')}
            description={
              <>
                @{account.username}
                <span className="mt-0.5 block truncate text-xs">
                  {bio || t('accountSettings.bio.empty')}
                </span>
              </>
            }
            className={isEditing ? 'flex-col items-stretch gap-3' : undefined}
          >
            {isEditing ? (
              <>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-foreground">
                    {t('accountSettings.displayName.label')}
                  </span>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    maxLength={MAX_DISPLAY_NAME_LENGTH}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('accountSettings.displayName.placeholder')}
                  />
                  <span className="block text-xs text-muted-foreground">
                    {t('accountSettings.displayName.hint')}
                  </span>
                  {displayNameError && (
                    <span className="block text-xs text-destructive">{displayNameError}</span>
                  )}
                </label>
                <textarea
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  rows={4}
                  maxLength={MAX_BIO_LENGTH}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('accountSettings.bio.placeholder')}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t('accountSettings.bio.counter', { count: bio.length, max: MAX_BIO_LENGTH })}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground"
                    >
                      {t('accountSettings.profile.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSave}
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {t('accountSettings.profile.save')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {account.avatarUrl && (
                  <img src={account.avatarUrl} alt={displayName} className="h-8 w-8 rounded-full" />
                )}
                <span className="text-sm font-medium text-foreground">{displayName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title={t('accountSettings.profile.edit')}
                  aria-label={t('accountSettings.profile.edit')}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </SettingsRow>

          <SettingsRow label={t('accountSettings.logout.label')} description={t('accountSettings.logout.description')}>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t('accountSettings.logout.button')}
            </button>
          </SettingsRow>

          <SettingsRow
            label={t('accountSettings.deleteAccount.label')}
            description={t('accountSettings.deleteAccount.description')}
          >
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {t('accountSettings.deleteAccount.button')}
            </button>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      {isConfirmingDelete && (
        <ConfirmDialog
          message={t('accountSettings.deleteAccount.confirm')}
          confirmLabel={t('accountSettings.deleteAccount.button')}
          onConfirm={handleDeleteConfirm}
          onClose={() => setIsConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
