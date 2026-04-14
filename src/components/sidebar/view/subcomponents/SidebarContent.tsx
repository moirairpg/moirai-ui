import type { TFunction } from 'i18next';
import { ScrollArea } from '../../../../shared/view/ui';
import { MoirAISidebarNav, type MoirAISidebarNavProps } from '../../../../features/sidebar/components/MoirAISidebarNav';
import SidebarFooter from './SidebarFooter';
import SidebarHeader from './SidebarHeader';

type SidebarContentProps = {
  isPWA: boolean;
  isMobile: boolean;
  onCollapseSidebar: () => void;
  onShowSettings: () => void;
  navProps: MoirAISidebarNavProps;
  t: TFunction;
};

export default function SidebarContent({
  isPWA,
  isMobile,
  onCollapseSidebar,
  onShowSettings,
  navProps,
  t,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-background/80 backdrop-blur-sm md:w-72 md:select-none">
      <SidebarHeader
        isPWA={isPWA}
        isMobile={isMobile}
        createAdventurePath={navProps.createAdventurePath}
        onCollapseSidebar={onCollapseSidebar}
        t={t}
      />

      <ScrollArea className="flex-1 overflow-y-auto overscroll-contain md:px-1.5 md:py-2">
        <MoirAISidebarNav {...navProps} />
      </ScrollArea>

      <SidebarFooter onShowSettings={onShowSettings} t={t} />
    </div>
  );
}
