import ReactDOM from 'react-dom';
import type { TFunction } from 'i18next';
import Settings from '../../../settings/view/Settings';
import VersionUpgradeModal from '../../../version-upgrade/view';
import type { ReleaseInfo } from '../../../../types/sharedTypes';
import type { InstallMode } from '../../../../hooks/useVersionCheck';

type SidebarModalsProps = {
  showSettings: boolean;
  settingsInitialTab: string;
  onCloseSettings: () => void;
  showVersionModal: boolean;
  onCloseVersionModal: () => void;
  releaseInfo: ReleaseInfo | null;
  currentVersion: string;
  latestVersion: string | null;
  installMode: InstallMode;
  t: TFunction;
};

export default function SidebarModals({
  showSettings,
  settingsInitialTab,
  onCloseSettings,
  showVersionModal,
  onCloseVersionModal,
  releaseInfo,
  currentVersion,
  latestVersion,
  installMode,
}: SidebarModalsProps) {
  return (
    <>
      {showSettings &&
        ReactDOM.createPortal(
          <Settings
            isOpen={showSettings}
            onClose={onCloseSettings}
            projects={[]}
            initialTab={settingsInitialTab}
          />,
          document.body,
        )}

      <VersionUpgradeModal
        isOpen={showVersionModal}
        onClose={onCloseVersionModal}
        releaseInfo={releaseInfo}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
        installMode={installMode}
      />
    </>
  );
}
