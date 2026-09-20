import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../components/auth';
import { notifySuccess } from '../../../utils/api';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useDeleteUser } from '../hooks/useDeleteUser';
import type { UserSummary } from '../types';

type UserRowProps = {
  user: UserSummary;
};

export function UserRow({ user }: UserRowProps) {
  const { t } = useTranslation('users');
  const { user: currentUser } = useAuth();
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUser();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isOwnAccount = user.publicId === currentUser?.publicId;

  const handleDeleteConfirm = async () => {
    const deleted = await deleteUser(user.publicId);
    if (deleted) notifySuccess(t('toast.deleted', { ns: 'common' }));

    setIsConfirmingDelete(false);
  };

  return (
    <tr className="border-b border-border/30 align-top">
      <td className="py-2 pr-3">{user.username}</td>
      <td className="py-2 pr-3">{t(`roles.${user.role}`)}</td>
      <td className="py-2 pr-3">{user.isActive ? t('status.active') : t('status.inactive')}</td>
      <td className="py-2 pr-3">{new Date(user.creationDate).toLocaleDateString()}</td>
      <td className="flex gap-1 py-2">
        <Link
          to={`/admin/users/${user.publicId}`}
          title={t('actions.edit')}
          aria-label={t('actions.edit')}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        {!isOwnAccount && (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            disabled={isDeleting}
            title={t('actions.delete')}
            aria-label={t('actions.delete')}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        {isConfirmingDelete && (
          <ConfirmDialog
            message={t('actions.deleteConfirm', { username: user.username })}
            confirmLabel={t('actions.delete')}
            onConfirm={handleDeleteConfirm}
            onClose={() => setIsConfirmingDelete(false)}
          />
        )}
      </td>
    </tr>
  );
}
