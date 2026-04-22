import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';

type UseReadNotificationResult = {
  mutate: (publicId: string) => Promise<void>;
  isLoading: boolean;
  isError: boolean;
};

export function useReadNotification(): UseReadNotificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = useCallback(async (publicId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await apiFetch(`/api/notification/${publicId}/read`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      window.dispatchEvent(new Event('notification-list-changed'));
      window.dispatchEvent(new Event('notification-details-changed'));
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, isError };
}
