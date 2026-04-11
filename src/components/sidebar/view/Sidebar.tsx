import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceSettings } from '../../../hooks/useDeviceSettings';
import { useUiPreferences } from '../../../hooks/useUiPreferences';
import type { SidebarProps } from '../types/types';
import SidebarCollapsed from './subcomponents/SidebarCollapsed';
import SidebarContent from './subcomponents/SidebarContent';
import SidebarModals from './subcomponents/SidebarModals';

function Sidebar({ navProps, isMobile }: SidebarProps) {
  const { t } = useTranslation(['sidebar', 'common']);
  const { isPWA } = useDeviceSettings({ trackMobile: false });
  useUiPreferences();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <SidebarModals
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
      />

      {isSidebarCollapsed ? (
        <SidebarCollapsed
          onExpand={() => setIsSidebarCollapsed(false)}
          onShowSettings={() => setShowSettings(true)}
          t={t}
        />
      ) : (
        <SidebarContent
          isPWA={isPWA}
          isMobile={isMobile}
          onCollapseSidebar={() => setIsSidebarCollapsed(true)}
          onShowSettings={() => setShowSettings(true)}
          navProps={navProps}
          t={t}
        />
      )}
    </>
  );
}

export default Sidebar;
