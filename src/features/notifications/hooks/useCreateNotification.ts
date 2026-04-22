import { useCallback, useState } from 'react';
import { apiFetch, extractApiError } from '../../../utils/api';
import type { CreateNotificationInput, NotificationDetails } from '../types';

type CreateResult = {
  notifications: NotificationDetails[] | null;
  error: string | null;
};

type UseCreateNotificationResult = {
  mutate: (input: CreateNotificationInput) => Promise<CreateResult>;
  isLoading: boolean;
  isError: boolean;
};

export function useCreateNotification(): UseCreateNotificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = useCallback(async (input: CreateNotificationInput) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await apiFetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errorMessage = await extractApiError(res);
        setIsError(true);
        return { notifications: null, error: errorMessage };
      }
      const json: NotificationDetails[] = await res.json();
      window.dispatchEvent(new Event('notification-list-changed'));
      return { notifications: json, error: null };
    } catch {
      setIsError(true);
      return { notifications: null, error: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, isError };
}
