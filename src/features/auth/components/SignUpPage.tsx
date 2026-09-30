import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLoadingScreen from '../../../components/auth/view/AuthLoadingScreen';
import AuthScreenLayout from '../../../components/auth/view/AuthScreenLayout';
import { useSignUp } from '../hooks/useSignUp';
import { useSignUpDetails } from '../hooks/useSignUpDetails';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const CONSECUTIVE_PERIODS = '..';
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 32;
const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_MAX_LENGTH = 32;
const ACCOUNT_CREATED_PATH = '/?notice=account-created';

function resolveUsernameError(username: string, t: TFunction) {

  if (username.length === 0) return null;

  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return t('signup.username.length');
  }

  if (!USERNAME_PATTERN.test(username)) return t('signup.username.invalid');

  if (username.includes(CONSECUTIVE_PERIODS)) return t('signup.username.periods');

  return null;
}

function resolveDisplayNameError(displayName: string, t: TFunction) {

  if (displayName.length === 0) {
    return null;
  }

  if (displayName.trim().length < DISPLAY_NAME_MIN_LENGTH) {
    return t('signup.displayName.length');
  }

  return null;
}

export default function SignUpPage() {
  const { t } = useTranslation('auth');
  const { discordUsername, isLoading } = useSignUpDetails();
  const { signUp, isSubmitting } = useSignUp();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!discordUsername) return;

    setUsername(discordUsername);
    setDisplayName(discordUsername);
  }, [discordUsername]);

  if (isLoading) return <AuthLoadingScreen />;

  const usernameError = resolveUsernameError(username, t);
  const displayNameError = resolveDisplayNameError(displayName, t);

  const canSubmit =
    username.length > 0
    && displayName.length > 0
    && !usernameError
    && !displayNameError
    && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const created = await signUp({ username, displayName });
    if (created) window.location.href = ACCOUNT_CREATED_PATH;
  };

  return (
    <AuthScreenLayout
      title={t('signup.title')}
      description={t('signup.description')}
      footerText={t('signup.footer')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">{t('signup.username.label')}</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={USERNAME_MAX_LENGTH}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="block text-xs text-muted-foreground">{t('signup.username.hint')}</span>
          {usernameError && <span className="block text-xs text-destructive">{usernameError}</span>}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">{t('signup.displayName.label')}</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="block text-xs text-muted-foreground">{t('signup.displayName.hint')}</span>
          {displayNameError && <span className="block text-xs text-destructive">{displayNameError}</span>}
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-60"
        >
          {t('signup.button')}
        </button>
      </form>
    </AuthScreenLayout>
  );
}
