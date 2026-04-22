import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { NotificationSummary, SearchNotificationsParams } from '../types';

type PaginatedResult<T> = {
  data: T[];
  items: number;
  page: number;
  totalItems: number;
  totalPages: number;
};

type UseSearchNotificationsResult = {
  data: PaginatedResult<NotificationSummary> | undefined;
  isLoading: boolean;
  isError: boolean;
};

const buildQueryString = (params: SearchNotificationsParams): string => {
  const search = new URLSearchParams();
  if (params.type) search.append('type', params.type);
  if (params.level) search.append('level', params.level);
  if (params.status) search.append('status', params.status);
  if (params.receiverId) search.append('receiverId', params.receiverId);
  if (params.page !== undefined) search.append('page', String(params.page));
  if (params.size !== undefined) search.append('size', String(params.size));
  const str = search.toString();
  return str ? `?${str}` : '';
};

export function useSearchNotifications(params: SearchNotificationsParams): UseSearchNotificationsResult {
  const [data, setData] = useState<PaginatedResult<NotificationSummary> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const queryString = useMemo(() => buildQueryString(params), [params]);

  useEffect(() => {
    const fetch = () => {
      setIsLoading(true);
      setIsError(false);
      apiFetch(`/api/notification${queryString}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to search notifications');
          return res.json();
        })
        .then((json: PaginatedResult<NotificationSummary>) => setData(json))
        .catch(() => {
          setData(undefined);
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    };

    fetch();
    const onChanged = () => fetch();
    window.addEventListener('notification-list-changed', onChanged);
    return () => window.removeEventListener('notification-list-changed', onChanged);
  }, [queryString]);

  return { data, isLoading, isError };
}
