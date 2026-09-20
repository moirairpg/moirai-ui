import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { UpdateUsersActiveStateInput } from '../types';

type UseUpdateUsersActiveStateResult = {
  mutate: (input: UpdateUsersActiveStateInput) => Promise<boolean>;
  isLoading: boolean;
};

export function useUpdateUsersActiveState(): UseUpdateUsersActiveStateResult {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (input: UpdateUsersActiveStateInput) => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/users/active-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) return false;
      window.dispatchEvent(new Event('user-list-changed'));

      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading };
}
