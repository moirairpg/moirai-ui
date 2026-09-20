import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchUsers } from '../hooks/useSearchUsers';
import type { SearchUsersParams } from '../types';
import { UserRow } from './UserRow';
import { UsersFilterBar } from './UsersFilterBar';

const DEFAULT_PAGE_SIZE = 10;

export function UsersPage() {
  const { t } = useTranslation('users');
  const [filters, setFilters] = useState<SearchUsersParams>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useSearchUsers({ ...filters, page, size: DEFAULT_PAGE_SIZE });

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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">{t('title')}</h1>

      <UsersFilterBar filters={filters} onChange={handleFilterChange} />

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
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.username')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.role')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.status')}</th>
                  <th className="py-2 pr-3 font-medium text-muted-foreground">{t('table.columns.registered')}</th>
                  <th className="py-2 font-medium text-muted-foreground">{t('table.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <UserRow key={user.publicId} user={user} />
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
