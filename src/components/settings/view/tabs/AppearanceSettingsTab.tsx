import { useTranslation } from 'react-i18next';
import { DarkModeToggle } from '../../../../shared/view/ui';
import LanguageSelector from '../../../../shared/view/ui/LanguageSelector';
import SettingsCard from '../SettingsCard';
import SettingsRow from '../SettingsRow';
import SettingsSection from '../SettingsSection';

type AppearanceSettingsTabProps = {
  fontSize: string;
  onFontSizeChange: (value: string) => void;
  scrollSpeed: number;
  onScrollSpeedChange: (value: number) => void;
};

export default function AppearanceSettingsTab({
  fontSize,
  onFontSizeChange,
  scrollSpeed,
  onScrollSpeedChange,
}: AppearanceSettingsTabProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-8">
      <SettingsSection title={t('appearanceSettings.darkMode.label')}>
        <SettingsCard>
          <SettingsRow
            label={t('appearanceSettings.darkMode.label')}
            description={t('appearanceSettings.darkMode.description')}
          >
            <DarkModeToggle ariaLabel={t('appearanceSettings.darkMode.label')} />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t('mainTabs.appearance')}>
        <SettingsCard>
          <LanguageSelector />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title={t('appearanceSettings.text.title')}>
        <SettingsCard divided>
          <SettingsRow
            label={t('appearanceSettings.text.fontSize.label')}
            description={t('appearanceSettings.text.fontSize.description')}
          >
            <select
              value={fontSize}
              onChange={(e) => onFontSizeChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-card p-2.5 text-sm text-foreground touch-manipulation focus:border-primary focus:ring-1 focus:ring-primary sm:w-28"
            >
              <option value="12">12px</option>
              <option value="13">13px</option>
              <option value="14">14px</option>
              <option value="15">15px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </SettingsRow>

          <SettingsRow
            label={t('appearanceSettings.text.scrollSpeed.label')}
            description={t('appearanceSettings.text.scrollSpeed.description')}
          >
            <select
              value={scrollSpeed}
              onChange={(e) => onScrollSpeedChange(Number(e.target.value))}
              className="w-full rounded-lg border border-input bg-card p-2.5 text-sm text-foreground touch-manipulation focus:border-primary focus:ring-1 focus:ring-primary sm:w-28"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
}
