import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { NotificationDetails, UpdateNotificationInput } from '../types';

type UpdateNotificationArgs = UpdateNotificationInput & { publicId: string };

type UseUpdateNotificationResult = {
  mutate: (args: UpdateNotificationArgs) => Promise<NotificationDetails | null>;
  isLoading: boolean;
  isError: boolean;
};

export function useUpdateNotification(): UseUpdateNotificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutate = useCallback(async ({ publicId, ...body }: UpdateNotificationArgs) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await apiFetch(`/api/notification/${publicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update notification');
      const json: NotificationDetails = await res.json();
      window.dispatchEvent(new Event('notification-list-changed'));
      window.dispatchEvent(new Event('notification-details-changed'));
      return json;
    } catch {
      setIsError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, isError };
}
