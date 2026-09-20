import { LogOut, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { notifySuccess } from '../../../../utils/api';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';
import { useDeleteUser, useGetUser, useUpdateUser } from '../../../../features/users';
import SettingsCard from '../SettingsCard';
import SettingsRow from '../SettingsRow';
import SettingsSection from '../SettingsSection';

const MAX_BIO_LENGTH = 2000;

export default function AccountSettingsTab() {
  const { t } = useTranslation('settings');
  const { user, logout } = useAuth();
  const { data: account } = useGetUser(user?.publicId);
  const { mutate: updateUser, isLoading: isSavingBio } = useUpdateUser();
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUser();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (account) setBio(account.bio ?? '');
  }, [account]);

  if (!account) return null;

  const handleBioSave = async () => {
    const updated = await updateUser(account.publicId, {
      role: account.role,
      isActive: account.isActive,
      bio,
    });

    if (updated) {
      notifySuccess(t('toast.saved', { ns: 'common' }));
      setIsEditingBio(false);
    }
  };

  const handleBioCancel = () => {
    setBio(account.bio ?? '');
    setIsEditingBio(false);
  };

  const handleDeleteConfirm = async () => {
    const deleted = await deleteUser(account.publicId);
    if (deleted) {
      await logout();
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
                {account.discordUsername}
                <span className="mt-0.5 block truncate text-xs">
                  {bio || t('accountSettings.bio.empty')}
                </span>
              </>
            }
            className={isEditingBio ? 'flex-col items-stretch gap-3' : undefined}
          >
            {isEditingBio ? (
              <>
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
                      onClick={handleBioCancel}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground"
                    >
                      {t('accountSettings.bio.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleBioSave}
                      disabled={isSavingBio}
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {t('accountSettings.bio.save')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {account.avatarUrl && (
                  <img src={account.avatarUrl} alt={account.username} className="h-8 w-8 rounded-full" />
                )}
                <span className="text-sm font-medium text-foreground">{account.username}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingBio(true)}
                  title={t('accountSettings.bio.edit')}
                  aria-label={t('accountSettings.bio.edit')}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </SettingsRow>

          <SettingsRow label={t('accountSettings.logout.label')} description={t('accountSettings.logout.description')}>
            <button
              onClick={logout}
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
