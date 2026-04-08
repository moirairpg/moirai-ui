import type { TFunction } from 'i18next';
import { ScrollArea } from '../../../../shared/view/ui';
import type { ReleaseInfo } from '../../../../types/sharedTypes';
import { MoirAISidebarNav, type MoirAISidebarNavProps } from '../../../../features/sidebar/components/MoirAISidebarNav';
import SidebarFooter from './SidebarFooter';
import SidebarHeader from './SidebarHeader';

type SidebarContentProps = {
  isPWA: boolean;
  isMobile: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCollapseSidebar: () => void;
  updateAvailable: boolean;
  releaseInfo: ReleaseInfo | null;
  latestVersion: string | null;
  onShowVersionModal: () => void;
  onShowSettings: () => void;
  navProps: MoirAISidebarNavProps;
  t: TFunction;
};

export default function SidebarContent({
  isPWA,
  isMobile,
  isRefreshing,
  onRefresh,
  onCollapseSidebar,
  updateAvailable,
  releaseInfo,
  latestVersion,
  onShowVersionModal,
  onShowSettings,
  navProps,
  t,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-background/80 backdrop-blur-sm md:w-72 md:select-none">
      <SidebarHeader
        isPWA={isPWA}
        isMobile={isMobile}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onCreateAdventure={navProps.onCreateAdventure}
        onCollapseSidebar={onCollapseSidebar}
        t={t}
      />

      <ScrollArea className="flex-1 overflow-y-auto overscroll-contain md:px-1.5 md:py-2">
        <MoirAISidebarNav {...navProps} />
      </ScrollArea>

      <SidebarFooter
        updateAvailable={updateAvailable}
        releaseInfo={releaseInfo}
        latestVersion={latestVersion}
        onShowVersionModal={onShowVersionModal}
        onShowSettings={onShowSettings}
        t={t}
      />
    </div>
  );
}
