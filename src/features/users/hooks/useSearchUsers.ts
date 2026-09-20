import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { PaginatedResult, SearchUsersParams, UserSummary } from '../types';

type UseSearchUsersResult = {
  data: PaginatedResult<UserSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
};

const buildQueryString = (params: SearchUsersParams): string => {
  const search = new URLSearchParams();
  if (params.username) search.append('username', params.username);
  if (params.role) search.append('role', params.role);
  if (params.isActive !== undefined) search.append('is_active', String(params.isActive));
  if (params.registeredFrom) search.append('registered_from', params.registeredFrom);
  if (params.registeredTo) search.append('registered_to', params.registeredTo);
  if (params.page !== undefined) search.append('page', String(params.page));
  if (params.size !== undefined) search.append('size', String(params.size));
  const query = search.toString();

  return query ? `?${query}` : '';
};

export function useSearchUsers(params: SearchUsersParams): UseSearchUsersResult {
  const [data, setData] = useState<PaginatedResult<UserSummary> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const queryString = useMemo(() => buildQueryString(params), [params]);

  useEffect(() => {
    const load = () => {
      setIsLoading(true);
      setIsError(false);
      apiFetch(`/api/users${queryString}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to search users');
          return res.json();
        })
        .then((json: PaginatedResult<UserSummary>) => setData(json))
        .catch(() => {
          setData(undefined);
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    };

    load();
    const onChanged = () => load();
    window.addEventListener('user-list-changed', onChanged);

    return () => window.removeEventListener('user-list-changed', onChanged);
  }, [queryString]);

  return { data, isLoading, isError };
}
