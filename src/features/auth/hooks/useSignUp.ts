import { useCallback, useState } from 'react';
import { api } from '../../../utils/api';
import type { CreateUserInput } from '../../users/types';

type UseSignUpResult = {
  signUp: (input: CreateUserInput) => Promise<boolean>;
  isSubmitting: boolean;
};

export function useSignUp(): UseSignUpResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUp = useCallback(async (input: CreateUserInput) => {
    setIsSubmitting(true);

    try {
      const res = await api.auth.signUp(input);

      return res.ok;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { signUp, isSubmitting };
}
