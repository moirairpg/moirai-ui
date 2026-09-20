import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';

type UsersBulkActionBarProps = {
  selectedCount: number;
  isSaving: boolean;
  onApply: (isActive: boolean) => void;
  onDelete: () => void;
  onClear: () => void;
};

export function UsersBulkActionBar({
  selectedCount,
  isSaving,
  onApply,
  onDelete,
  onClear,
}: UsersBulkActionBarProps) {
  const { t } = useTranslation('users');
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-accent/30 px-3 py-2">
      <span className="text-sm text-foreground">{t('bulk.selected', { count: selectedCount })}</span>

      <button
        type="button"
        onClick={() => setPendingState(false)}
        disabled={isSaving}
        className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
      >
        {t('bulk.deactivate')}
      </button>

      <button
        type="button"
        onClick={() => setPendingState(true)}
        disabled={isSaving}
        className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
      >
        {t('bulk.activate')}
      </button>

      <button
        type="button"
        onClick={() => setIsConfirmingDelete(true)}
        disabled={isSaving}
        className="rounded border border-destructive/30 px-3 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      >
        {t('bulk.delete')}
      </button>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {t('bulk.clear')}
      </button>

      {pendingState !== null && (
        <ConfirmDialog
          message={t(pendingState ? 'bulk.activateConfirm' : 'bulk.deactivateConfirm', { count: selectedCount })}
          confirmLabel={t(pendingState ? 'bulk.activate' : 'bulk.deactivate')}
          onConfirm={() => {
            onApply(pendingState);
            setPendingState(null);
          }}
          onClose={() => setPendingState(null)}
        />
      )}

      {isConfirmingDelete && (
        <ConfirmDialog
          message={t('bulk.deleteConfirm', { count: selectedCount })}
          confirmLabel={t('bulk.delete')}
          onConfirm={() => {
            onDelete();
            setIsConfirmingDelete(false);
          }}
          onClose={() => setIsConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
