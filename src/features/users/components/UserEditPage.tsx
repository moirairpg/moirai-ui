import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../components/auth';
import { notifySuccess } from '../../../utils/api';
import { useGetUser } from '../hooks/useGetUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import type { UserRole } from '../types';

const MAX_BIO_LENGTH = 2000;

const FIELD_CLASS = 'rounded border border-border bg-background px-3 py-2 text-sm';

export function UserEditPage() {
  const { t } = useTranslation('users');
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError } = useGetUser(userId);
  const { mutate: updateUser, isLoading: isSaving } = useUpdateUser();

  const [role, setRole] = useState<UserRole>('PLAYER');
  const [isActive, setIsActive] = useState(true);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!data) return;

    setRole(data.role);
    setIsActive(data.isActive);
    setBio(data.bio ?? '');
  }, [data]);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">{t('edit.loading')}</p>;
  if (isError || !data) return <p className="p-6 text-sm text-red-500">{t('edit.error')}</p>;

  const isOwnAccount = data.publicId === currentUser?.publicId;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updated = await updateUser(data.publicId, { role, isActive, bio });
    if (updated) {
      notifySuccess(t('toast.saved', { ns: 'common' }));
      navigate('/admin/users');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">
        {t('edit.title', { username: data.username })}
      </h1>

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('edit.moiraiUsername')}</span>
          <span className="text-sm font-medium text-foreground">{data.username}</span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('edit.discordUsername')}</span>
          <span className="text-sm font-medium text-foreground">{data.discordUsername}</span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('edit.role')}</span>
          <select
            className={FIELD_CLASS}
            value={role}
            disabled={isOwnAccount}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="PLAYER">{t('roles.PLAYER')}</option>
            <option value="ADMIN">{t('roles.ADMIN')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('edit.status')}</span>
          <select
            className={FIELD_CLASS}
            value={String(isActive)}
            disabled={isOwnAccount}
            onChange={(e) => setIsActive(e.target.value === 'true')}
          >
            <option value="true">{t('status.active')}</option>
            <option value="false">{t('status.inactive')}</option>
          </select>
        </label>

        {isOwnAccount && (
          <p className="text-xs text-muted-foreground">{t('edit.ownAccountNotice')}</p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('edit.bio')}</span>
          <textarea
            className={`${FIELD_CLASS} w-full`}
            rows={5}
            maxLength={MAX_BIO_LENGTH}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">
            {t('edit.bioCounter', { count: bio.length, max: MAX_BIO_LENGTH })}
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {t('edit.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
          >
            {t('edit.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
