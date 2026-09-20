import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { DeleteUsersResult } from '../types';

type UseDeleteUsersResult = {
  mutate: (userIds: string[]) => Promise<DeleteUsersResult | null>;
  isLoading: boolean;
};

export function useDeleteUsers(): UseDeleteUsersResult {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/users/deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) return null;
      window.dispatchEvent(new Event('user-list-changed'));

      return (await res.json()) as DeleteUsersResult;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading };
}
