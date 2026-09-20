import { useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type { UserDetails } from '../types';

type UseGetUserResult = {
  data: UserDetails | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function useGetUser(publicId: string | undefined): UseGetUserResult {
  const [data, setData] = useState<UserDetails | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!publicId) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    apiFetch(`/api/users/${publicId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load user');
        return res.json();
      })
      .then((json: UserDetails) => setData(json))
      .catch(() => {
        setData(undefined);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, [publicId]);

  return { data, isLoading, isError };
}
