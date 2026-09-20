import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { UpdateUserInput } from '../types';

type UseUpdateUserResult = {
  mutate: (publicId: string, input: UpdateUserInput) => Promise<boolean>;
  isLoading: boolean;
};

export function useUpdateUser(): UseUpdateUserResult {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (publicId: string, input: UpdateUserInput) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/users/${publicId}`, {
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
