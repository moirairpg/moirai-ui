import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceSettings } from '../../../hooks/useDeviceSettings';
import { useVersionCheck } from '../../../hooks/useVersionCheck';
import { useUiPreferences } from '../../../hooks/useUiPreferences';
import type { SidebarProps } from '../types/types';
import type { MoirAISidebarNavProps } from '../../../features/sidebar/components/MoirAISidebarNav';
import SidebarCollapsed from './subcomponents/SidebarCollapsed';
import SidebarContent from './subcomponents/SidebarContent';
import SidebarModals from './subcomponents/SidebarModals';

function Sidebar({ onShowSettings, showSettings, settingsInitialTab, onCloseSettings, isMobile }: SidebarProps) {
  const { t } = useTranslation(['sidebar', 'common']);
  const { isPWA } = useDeviceSettings({ trackMobile: false });
  const { updateAvailable, latestVersion, currentVersion, releaseInfo, installMode } = useVersionCheck('siteboon', 'claudecodeui');
  useUiPreferences();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const navProps: MoirAISidebarNavProps = {
    onMyStuffClick: () => {},
    onSharedWithMeClick: () => {},
    onCreateAdventure: () => {},
    onBrowseAdventures: () => {},
    onAdventureClick: (_id) => {},
    onCreateWorld: () => {},
    onBrowseWorlds: () => {},
    onCreatePersona: () => {},
    onBrowsePersonas: () => {},
  };

  return (
    <>
      <SidebarModals
        showSettings={showSettings}
        settingsInitialTab={settingsInitialTab ?? 'agents'}
        onCloseSettings={onCloseSettings}
        showVersionModal={showVersionModal}
        onCloseVersionModal={() => setShowVersionModal(false)}
        releaseInfo={releaseInfo}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
        installMode={installMode}
        t={t}
      />

      {isSidebarCollapsed ? (
        <SidebarCollapsed
          onExpand={() => setIsSidebarCollapsed(false)}
          onShowSettings={onShowSettings}
          updateAvailable={updateAvailable}
          onShowVersionModal={() => setShowVersionModal(true)}
          t={t}
        />
      ) : (
        <SidebarContent
          isPWA={isPWA}
          isMobile={isMobile}
          isRefreshing={false}
          onRefresh={() => {}}
          onCollapseSidebar={() => setIsSidebarCollapsed(true)}
          updateAvailable={updateAvailable}
          releaseInfo={releaseInfo}
          latestVersion={latestVersion}
          onShowVersionModal={() => setShowVersionModal(true)}
          onShowSettings={onShowSettings}
          navProps={navProps}
          t={t}
        />
      )}
    </>
  );
}

export default Sidebar;
