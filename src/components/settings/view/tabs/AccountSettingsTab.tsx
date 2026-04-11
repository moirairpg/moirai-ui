import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import SettingsCard from '../SettingsCard';
import SettingsRow from '../SettingsRow';
import SettingsSection from '../SettingsSection';

export default function AccountSettingsTab() {
  const { t } = useTranslation('settings');
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <SettingsSection title={t('accountSettings.title')}>
        <SettingsCard divided>
          <SettingsRow label={t('accountSettings.username.label')} description={user.nickname || user.username}>
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt={user.username} className="h-8 w-8 rounded-full" />
              )}
              <span className="text-sm font-medium text-foreground">{user.username}</span>
            </div>
          </SettingsRow>

          <SettingsRow label={t('accountSettings.logout.label')} description={t('accountSettings.logout.description')}>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t('accountSettings.logout.button')}
            </button>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
}
