import { useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { NotificationDetails } from '../types';

type UseGetNotificationResult = {
  data: NotificationDetails | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function useGetNotification(publicId: string | undefined): UseGetNotificationResult {
  const [data, setData] = useState<NotificationDetails | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(publicId));
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!publicId) {
      setData(undefined);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetch = () => {
      setIsLoading(true);
      setIsError(false);
      apiFetch(`/api/notifications/${publicId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load notification');
          return res.json();
        })
        .then((json: NotificationDetails) => setData(json))
        .catch(() => {
          setData(undefined);
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    };

    fetch();
    const onChanged = () => fetch();
    window.addEventListener('notification-details-changed', onChanged);
    return () => window.removeEventListener('notification-details-changed', onChanged);
  }, [publicId]);

  return { data, isLoading, isError };
}
