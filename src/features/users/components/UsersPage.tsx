import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../components/auth';
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
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<SearchUsersParams>({});
  const [page, setPage] = useState(1);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);

  const { data, isLoading, isError } = useSearchUsers({ ...filters, page, size: DEFAULT_PAGE_SIZE });
  const { mutate: updateUsersActiveState, isLoading: isSavingSelection } = useUpdateUsersActiveState();
  const { mutate: deleteUsers, isLoading: isDeletingSelection } = useDeleteUsers();

  useEffect(() => {
    setSelectedUsernames([]);
  }, [page, filters]);

  useEffect(() => {
    if (!data) return;

    const visibleUsernames = new Set(data.data.map((user) => user.username));
    setSelectedUsernames((prev) => prev.filter((username) => visibleUsernames.has(username)));
  }, [data]);

  const selectableUsernames = (data?.data ?? [])
    .filter((user) => user.publicId !== currentUser?.publicId)
    .map((user) => user.username);

  const isAllSelected =
    selectableUsernames.length > 0
    && selectableUsernames.every((username) => selectedUsernames.includes(username));

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

  const handleToggleSelected = (username: string) => {
    setSelectedUsernames((prev) =>
      prev.includes(username) ? prev.filter((selected) => selected !== username) : [...prev, username],
    );
  };

  const handleToggleAll = () => {
    setSelectedUsernames(isAllSelected ? [] : selectableUsernames);
  };

  const handleApplyActiveState = async (isActive: boolean) => {
    const updated = await updateUsersActiveState({ usernames: selectedUsernames, isActive });
    if (updated) {
      notifySuccess(t('toast.saved', { ns: 'common' }));
      setSelectedUsernames([]);
    }
  };

  const describeFailures = (failedUsernames: string[]) => {
    const names = failedUsernames.filter((username) =>
      data?.data.some((user) => user.username === username),
    );

    if (names.length === 0) {
      return t('bulk.deletePartialCount', { count: failedUsernames.length });
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
    const result = await deleteUsers(selectedUsernames);
    if (!result) return;

    if (result.failedUsernames.length > 0) {
      notifyError(describeFailures(result.failedUsernames));
      setSelectedUsernames(result.failedUsernames);

      return;
    }

    notifySuccess(t('toast.deleted', { ns: 'common' }));
    setSelectedUsernames([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{t('title')}</h1>

      <UsersFilterBar filters={filters} onChange={handleFilterChange} />

      <UsersBulkActionBar
        selectedCount={selectedUsernames.length}
        isSaving={isSavingSelection || isDeletingSelection}
        onApply={handleApplyActiveState}
        onDelete={handleDeleteSelection}
        onClear={() => setSelectedUsernames([])}
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
                  <th className="py-2 pr-3">
                    {selectableUsernames.length > 0 && (
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleAll}
                        aria-label={t('table.selectAll')}
                        className="h-4 w-4 rounded border-border"
                      />
                    )}
                  </th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.username')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.displayName')}</th>
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
                    isSelected={selectedUsernames.includes(user.username)}
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
