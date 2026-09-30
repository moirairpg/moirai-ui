import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { UpdateUserDetailsInput } from '../types';

type UseUpdateUserDetailsResult = {
  mutate: (username: string, input: UpdateUserDetailsInput) => Promise<boolean>;
  isLoading: boolean;
};

export function useUpdateUserDetails(): UseUpdateUserDetailsResult {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (username: string, input: UpdateUserDetailsInput) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/users/${username}/user-details`, {
        method: 'PUT',
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
