import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchNotifications } from '../hooks/useSearchNotifications';
import { useCreateNotification } from '../hooks/useCreateNotification';
import { useUpdateNotification } from '../hooks/useUpdateNotification';
import { useDeleteNotification } from '../hooks/useDeleteNotification';
import { UsernameChipInput } from './UsernameChipInput';
import type {
  NotificationLevel,
  NotificationSummary,
  NotificationType,
  SearchNotificationsParams,
} from '../types';

type CreateFormState = {
  type: 'BROADCAST' | 'SYSTEM';
  level: NotificationLevel;
  message: string;
  targetUsernames: string[];
  targetUsernameText: string;
};

type EditState = {
  publicId: string;
  message: string;
  level: NotificationLevel;
};

const EMPTY_CREATE_STATE: CreateFormState = {
  type: 'BROADCAST',
  level: 'INFO',
  message: '',
  targetUsernames: [],
  targetUsernameText: '',
};

const DEFAULT_PAGE_SIZE = 10;

export function AdminNotificationPage() {
  const { t } = useTranslation('notifications');
  const [filters, setFilters] = useState<SearchNotificationsParams>({});
  const [page, setPage] = useState(1);
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE_STATE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [messageInvalid, setMessageInvalid] = useState(false);
  const [usernamesInvalid, setUsernamesInvalid] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const searchParams: SearchNotificationsParams = { ...filters, page, size: DEFAULT_PAGE_SIZE };
  const { data, isLoading, isError } = useSearchNotifications(searchParams);
  const { mutate: create, isLoading: isCreating } = useCreateNotification();
  const { mutate: update, isLoading: isUpdating } = useUpdateNotification();
  const { mutate: remove } = useDeleteNotification();

  const totalPages = data?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handleFilterChange = <K extends keyof SearchNotificationsParams>(
    key: K,
    value: SearchNotificationsParams[K] | '',
  ) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === '' || value === undefined) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setPage(1);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);

    const trimmedMessage = createForm.message.trim();
    const pendingText = createForm.targetUsernameText.trim();
    const finalUsernames =
      pendingText && !createForm.targetUsernames.includes(pendingText)
        ? [...createForm.targetUsernames, pendingText]
        : createForm.targetUsernames;

    const hasMessageError = !trimmedMessage;
    const hasUsernamesError = createForm.type === 'SYSTEM' && finalUsernames.length === 0;

    setMessageInvalid(hasMessageError);
    setUsernamesInvalid(hasUsernamesError);

    if (hasMessageError || hasUsernamesError) {
      return;
    }

    const result = await create({
      type: createForm.type,
      level: createForm.level,
      message: trimmedMessage,
      targetUsernames: createForm.type === 'SYSTEM' ? finalUsernames : [],
      isInteractable: false,
    });

    if (result.notification) {
      setCreateForm(EMPTY_CREATE_STATE);
      setMessageInvalid(false);
      setUsernamesInvalid(false);
      return;
    }

    const beMessage = result.error ?? '';
    if (beMessage.toLowerCase().includes('unknown username')) {
      setUsernamesInvalid(true);
      setCreateError(beMessage);
    } else {
      setCreateError(beMessage || t('admin.form.errors.createFailed'));
    }
  };

  const handleEditStart = (n: NotificationSummary) => {
    setEditError(null);
    setEditState({
      publicId: n.publicId,
      message: n.message,
      level: n.level ?? 'INFO',
    });
  };

  const handleEditSave = async () => {
    if (!editState) return;
    setEditError(null);
    const result = await update({
      publicId: editState.publicId,
      message: editState.message,
      level: editState.level,
    });
    if (result) {
      setEditState(null);
    } else {
      setEditError(t('admin.table.errors.updateFailed'));
    }
  };

  const handleEditCancel = () => {
    setEditState(null);
    setEditError(null);
  };

  const handleDeleteRequest = (publicId: string) => {
    setDeleteError(null);
    setPendingDeleteId(publicId);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async (publicId: string) => {
    setDeleteError(null);
    const result = await remove(publicId);
    if (result) {
      setPendingDeleteId(null);
    } else {
      setDeleteError(t('admin.table.errors.deleteFailed'));
    }
  };

  const handlePrevPage = () => {
    if (hasPrev) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (hasNext) setPage((p) => p + 1);
  };

  const inputClass = 'rounded border border-border bg-background px-3 py-2 text-sm';
  const messageInputClass = `rounded border bg-background px-3 py-2 text-sm ${
    messageInvalid ? 'border-red-500' : 'border-border'
  }`;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{t('admin.title')}</h1>

      <section className="mb-8 rounded border border-border/50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t('admin.form.heading')}</h2>
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{t('admin.form.fields.type')}</span>
            <select
              className={inputClass}
              value={createForm.type}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, type: e.target.value as CreateFormState['type'] }))
              }
            >
              <option value="BROADCAST">{t('admin.form.types.BROADCAST')}</option>
              <option value="SYSTEM">{t('admin.form.types.SYSTEM')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{t('admin.form.fields.level')}</span>
            <select
              className={inputClass}
              value={createForm.level}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, level: e.target.value as NotificationLevel }))
              }
            >
              <option value="INFO">{t('admin.form.levels.INFO')}</option>
              <option value="URGENT">{t('admin.form.levels.URGENT')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{t('admin.form.fields.message')}</span>
            <textarea
              className={messageInputClass}
              rows={3}
              value={createForm.message}
              onChange={(e) => {
                setCreateForm((prev) => ({ ...prev, message: e.target.value }));
                if (e.target.value.trim()) setMessageInvalid(false);
              }}
              placeholder={t('admin.form.placeholders.message')}
            />
            {messageInvalid && (
              <span className="text-xs text-red-500">{t('admin.form.errors.messageRequired')}</span>
            )}
          </label>

          {createForm.type === 'SYSTEM' && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t('admin.form.fields.targetUsernames')}</span>
              <UsernameChipInput
                chips={createForm.targetUsernames}
                text={createForm.targetUsernameText}
                onChipsChange={(chips) => {
                  setCreateForm((prev) => ({ ...prev, targetUsernames: chips }));
                  if (chips.length > 0) setUsernamesInvalid(false);
                }}
                onTextChange={(text) =>
                  setCreateForm((prev) => ({ ...prev, targetUsernameText: text }))
                }
                invalid={usernamesInvalid}
                placeholder={t('admin.form.placeholders.targetUsernames')}
              />
              {usernamesInvalid && !createError && (
                <span className="text-xs text-red-500">
                  {t('admin.form.errors.targetUsernamesRequired')}
                </span>
              )}
            </label>
          )}

          {createError && <p className="text-sm text-red-500">{createError}</p>}

          <button
            type="submit"
            disabled={isCreating}
            className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isCreating ? t('admin.form.submitting') : t('admin.form.submit')}
          </button>
        </form>
      </section>

      <section className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('admin.filters.type')}</span>
          <select
            className={inputClass}
            value={filters.type ?? ''}
            onChange={(e) => handleFilterChange('type', (e.target.value as NotificationType) || '')}
          >
            <option value="">{t('admin.filters.any')}</option>
            <option value="BROADCAST">{t('admin.form.types.BROADCAST')}</option>
            <option value="SYSTEM">{t('admin.form.types.SYSTEM')}</option>
            <option value="GAME">{t('admin.form.types.GAME')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('admin.filters.level')}</span>
          <select
            className={inputClass}
            value={filters.level ?? ''}
            onChange={(e) => handleFilterChange('level', (e.target.value as NotificationLevel) || '')}
          >
            <option value="">{t('admin.filters.any')}</option>
            <option value="INFO">{t('admin.form.levels.INFO')}</option>
            <option value="URGENT">{t('admin.form.levels.URGENT')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">{t('admin.filters.receiverId')}</span>
          <input
            className={inputClass}
            type="text"
            value={filters.receiverId ?? ''}
            onChange={(e) => handleFilterChange('receiverId', e.target.value)}
            placeholder={t('admin.filters.receiverIdPlaceholder')}
          />
        </label>
      </section>

      <section>
        {isLoading && <p className="text-sm text-muted-foreground">{t('admin.table.loading')}</p>}
        {isError && <p className="text-sm text-red-500">{t('admin.table.error')}</p>}
        {deleteError && <p className="mb-2 text-sm text-red-500">{deleteError}</p>}
        {editError && <p className="mb-2 text-sm text-red-500">{editError}</p>}
        {!isLoading && !isError && (data?.data.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">{t('admin.table.empty')}</p>
        )}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="py-2 pr-3 font-medium text-muted-foreground">
                    {t('admin.table.columns.message')}
                  </th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">
                    {t('admin.table.columns.type')}
                  </th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">
                    {t('admin.table.columns.level')}
                  </th>
                  <th className="py-2 font-medium text-muted-foreground">
                    {t('admin.table.columns.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((n) => {
                  const isEditing = editState?.publicId === n.publicId;
                  const isPendingDelete = pendingDeleteId === n.publicId;
                  return (
                    <tr key={n.publicId} className="border-b border-border/30 align-top">
                      <td className="py-2 pr-3">
                        {isEditing ? (
                          <textarea
                            className={`${inputClass} w-full`}
                            rows={2}
                            value={editState.message}
                            onChange={(e) =>
                              setEditState((prev) => (prev ? { ...prev, message: e.target.value } : prev))
                            }
                          />
                        ) : (
                          n.message
                        )}
                      </td>
                      <td className="py-2 pr-3">{n.type}</td>
                      <td className="py-2 pr-3">
                        {isEditing ? (
                          <select
                            className={inputClass}
                            value={editState.level}
                            onChange={(e) =>
                              setEditState((prev) =>
                                prev ? { ...prev, level: e.target.value as NotificationLevel } : prev,
                              )
                            }
                          >
                            <option value="INFO">{t('admin.form.levels.INFO')}</option>
                            <option value="URGENT">{t('admin.form.levels.URGENT')}</option>
                          </select>
                        ) : (
                          n.level ?? '—'
                        )}
                      </td>
                      <td className="flex gap-2 py-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={handleEditSave}
                              disabled={isUpdating}
                              className="text-blue-600 underline disabled:opacity-50"
                            >
                              {t('admin.table.actions.save')}
                            </button>
                            <button
                              type="button"
                              onClick={handleEditCancel}
                              className="text-muted-foreground underline"
                            >
                              {t('admin.table.actions.cancel')}
                            </button>
                          </>
                        ) : isPendingDelete ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(n.publicId)}
                              className="text-red-600 underline"
                            >
                              {t('admin.table.actions.confirmDelete')}
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteCancel}
                              className="text-muted-foreground underline"
                            >
                              {t('admin.table.actions.cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditStart(n)}
                              className="text-blue-600 underline"
                            >
                              {t('admin.table.actions.edit')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(n.publicId)}
                              className="text-red-600 underline"
                            >
                              {t('admin.table.actions.delete')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!hasPrev}
                className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
              >
                {t('admin.pagination.previous')}
              </button>
              <span className="text-sm text-muted-foreground">
                {t('admin.pagination.pageOf', { page, totalPages })}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasNext}
                className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
              >
                {t('admin.pagination.next')}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
