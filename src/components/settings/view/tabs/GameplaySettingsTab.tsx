import { useTranslation } from 'react-i18next';
import SettingsCard from '../SettingsCard';
import SettingsRow from '../SettingsRow';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';

type GameplaySettingsTabProps = {
  spinnerPhrasesEnabled: boolean;
  onSpinnerPhrasesChange: (value: boolean) => void;
};

export default function GameplaySettingsTab({
  spinnerPhrasesEnabled,
  onSpinnerPhrasesChange,
}: GameplaySettingsTabProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-8">
      <SettingsSection title={t('gameplaySettings.title')}>
        <SettingsCard>
          <SettingsRow
            label={t('gameplaySettings.spinnerPhrases.label')}
            description={t('gameplaySettings.spinnerPhrases.description')}
          >
            <SettingsToggle
              checked={spinnerPhrasesEnabled}
              onChange={onSpinnerPhrasesChange}
              ariaLabel={t('gameplaySettings.spinnerPhrases.label')}
            />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
}
