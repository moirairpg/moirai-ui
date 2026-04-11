import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../shared/view/ui';
import SettingsSidebar from '../view/SettingsSidebar';
import AccountSettingsTab from '../view/tabs/AccountSettingsTab';
import AppearanceSettingsTab from '../view/tabs/AppearanceSettingsTab';
import GameplaySettingsTab from '../view/tabs/GameplaySettingsTab';
import { useSettingsController } from '../hooks/useSettingsController';
import type { SettingsProps } from '../types/types';

function Settings({ isOpen, onClose }: SettingsProps) {
  const { t } = useTranslation('settings');
  const {
    activeTab,
    setActiveTab,
    saveStatus,
    fontSize,
    setFontSize,
    scrollSpeed,
    setScrollSpeed,
    spinnerPhrasesEnabled,
    setSpinnerPhrasesEnabled,
  } = useSettingsController({ isOpen });

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm md:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden border border-border bg-background shadow-2xl md:h-[90vh] md:max-w-4xl md:rounded-xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-5">
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <span className="text-xs text-muted-foreground animate-in fade-in">{t('saveStatus.success')}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 touch-manipulation p-0 text-muted-foreground hover:text-foreground active:bg-accent/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <SettingsSidebar activeTab={activeTab} onChange={setActiveTab} />

          <main className="flex-1 overflow-y-auto">
            <div key={activeTab} className="settings-content-enter space-y-6 p-4 pb-safe-area-inset-bottom md:space-y-8 md:p-6">
              {activeTab === 'account' && <AccountSettingsTab />}
              {activeTab === 'appearance' && (
                <AppearanceSettingsTab
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                  scrollSpeed={scrollSpeed}
                  onScrollSpeedChange={setScrollSpeed}
                />
              )}
              {activeTab === 'gameplay' && (
                <GameplaySettingsTab
                  spinnerPhrasesEnabled={spinnerPhrasesEnabled}
                  onSpinnerPhrasesChange={setSpinnerPhrasesEnabled}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Settings;
