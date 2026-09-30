import { useEffect, useState } from 'react';
import { api } from '../../../utils/api';

type UseSignUpDetailsResult = {
  discordUsername: string | null;
  isLoading: boolean;
};

export function useSignUpDetails(): UseSignUpDetailsResult {
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.auth.signUpDetails()
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDiscordUsername(data?.discordUsername ?? null))
      .catch(() => setDiscordUsername(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { discordUsername, isLoading };
}
