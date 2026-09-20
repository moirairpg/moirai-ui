import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notifyError, notifySuccess } from '../../../utils/api';
import { useDeleteUsers } from '../hooks/useDeleteUsers';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { useUpdateUsersActiveState } from '../hooks/useUpdateUsersActiveState';
import type { SearchUsersParams } from '../types';
import { UserRow } from './UserRow';
import { UsersBulkActionBar } from './UsersBulkActionBar';
import { UsersFilterBar } from './UsersFilterBar';

const DEFAULT_PAGE_SIZE = 10;
const NAMED_FAILURE_LIMIT = 3;

export function UsersPage() {
  const { t } = useTranslation('users');
  const [filters, setFilters] = useState<SearchUsersParams>({});
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, isError } = useSearchUsers({ ...filters, page, size: DEFAULT_PAGE_SIZE });
  const { mutate: updateUsersActiveState, isLoading: isSavingSelection } = useUpdateUsersActiveState();
  const { mutate: deleteUsers, isLoading: isDeletingSelection } = useDeleteUsers();

  useEffect(() => {
    setSelectedIds([]);
  }, [page, filters]);

  useEffect(() => {
    if (!data) return;

    const visibleIds = new Set(data.data.map((user) => user.publicId));
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [data]);

  const totalPages = data?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handleFilterChange = <K extends keyof SearchUsersParams>(
    key: K,
    value: SearchUsersParams[K] | '',
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

  const handleToggleSelected = (publicId: string) => {
    setSelectedIds((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId],
    );
  };

  const handleApplyActiveState = async (isActive: boolean) => {
    const updated = await updateUsersActiveState({ userIds: selectedIds, isActive });
    if (updated) {
      notifySuccess(t('toast.saved', { ns: 'common' }));
      setSelectedIds([]);
    }
  };

  const describeFailures = (failedUserIds: string[]) => {
    const names = failedUserIds
      .map((id) => data?.data.find((user) => user.publicId === id)?.username)
      .filter((username): username is string => Boolean(username));

    if (names.length === 0) {
      return t('bulk.deletePartialCount', { count: failedUserIds.length });
    }

    if (names.length <= NAMED_FAILURE_LIMIT) {
      return t('bulk.deletePartial', { names: names.join(', ') });
    }

    return t('bulk.deletePartialOverflow', {
      names: names.slice(0, NAMED_FAILURE_LIMIT).join(', '),
      count: names.length - NAMED_FAILURE_LIMIT,
    });
  };

  const handleDeleteSelection = async () => {
    const result = await deleteUsers(selectedIds);
    if (!result) return;

    if (result.failedUserIds.length > 0) {
      notifyError(describeFailures(result.failedUserIds));
      setSelectedIds(result.failedUserIds);

      return;
    }

    notifySuccess(t('toast.deleted', { ns: 'common' }));
    setSelectedIds([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{t('title')}</h1>

      <UsersFilterBar filters={filters} onChange={handleFilterChange} />

      <UsersBulkActionBar
        selectedCount={selectedIds.length}
        isSaving={isSavingSelection || isDeletingSelection}
        onApply={handleApplyActiveState}
        onDelete={handleDeleteSelection}
        onClear={() => setSelectedIds([])}
      />

      <section>
        {isLoading && <p className="text-sm text-muted-foreground">{t('table.loading')}</p>}
        {isError && <p className="text-sm text-red-500">{t('table.error')}</p>}
        {!isLoading && !isError && (data?.data.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">{t('table.empty')}</p>
        )}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="py-2 pr-3" />
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.username')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.role')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.status')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.registered')}</th>
                  <th className="py-2 font-medium text-muted-foreground">{t('table.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <UserRow
                    key={user.publicId}
                    user={user}
                    isSelected={selectedIds.includes(user.publicId)}
                    onToggleSelected={handleToggleSelected}
                  />
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
                className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
              >
                {t('pagination.previous')}
              </button>
              <span className="text-sm text-muted-foreground">
                {t('pagination.pageOf', { page, totalPages })}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
              >
                {t('pagination.next')}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
