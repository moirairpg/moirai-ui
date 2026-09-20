import { useCallback, useState } from 'react';
import { apiFetch } from '../../../utils/api';

type UseDeleteUserResult = {
  mutate: (publicId: string) => Promise<boolean>;
  isLoading: boolean;
};

export function useDeleteUser(): UseDeleteUserResult {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (publicId: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/users/${publicId}`, { method: 'DELETE' });
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
