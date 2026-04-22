import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';

type UseDeleteNotificationResult = {
  mutate: (publicId: string) => Promise<boolean>;
  isLoading: boolean;
  isError: boolean;
};

export function useDeleteNotification(): UseDeleteNotificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = useCallback(async (publicId: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await apiFetch(`/api/notification/${publicId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete notification');
      window.dispatchEvent(new Event('notification-list-changed'));
      window.dispatchEvent(new CustomEvent('notification-deleted', { detail: { publicId } }));
      return true;
    } catch {
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, isError };
}
