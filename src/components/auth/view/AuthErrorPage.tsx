import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthScreenLayout from './AuthScreenLayout';

function ErrorIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-destructive shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-destructive-foreground">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
  );
}

export default function AuthErrorPage() {
  const { loginWithDiscord } = useAuth();
  const { t } = useTranslation('auth');

  return (
    <AuthScreenLayout
      title={t('error.title')}
      description={t('error.description')}
      footerText={t('error.footer')}
      logo={<ErrorIcon />}
    >
      <button
        onClick={loginWithDiscord}
        className="flex w-full items-center justify-center gap-3 rounded-md px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#5865F2' }}
      >
        {t('error.retry')}
      </button>
    </AuthScreenLayout>
  );
}
