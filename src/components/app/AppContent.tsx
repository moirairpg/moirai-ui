import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../sidebar/view/Sidebar';
import AdventurePage from '../../features/adventure/components/AdventurePage';
import { useDeviceSettings } from '../../hooks/useDeviceSettings';
import type { MoirAISidebarNavProps } from '../../features/sidebar/components/MoirAISidebarNav';
import { BroadcastRibbon } from '../../features/notifications';

type AppContentProps = {
  children?: ReactNode;
};

export default function AppContent({ children }: AppContentProps) {
  const { adventureId } = useParams<{ adventureId?: string }>();
  const { isMobile } = useDeviceSettings({ trackPWA: false });
  const { t } = useTranslation('common');

  const navProps: MoirAISidebarNavProps = {
    myStuffPath: '/my-stuff',
    sharedWithMePath: '/shared-with-me',
    explorePath: '/explore',
    createAdventurePath: '/adventure/new',
    browseAdventuresPath: '/explore?tab=adventures',
    adventureBasePath: '/adventure/play',
    createWorldPath: '/world/new',
    browseWorldsPath: '/explore?tab=worlds',
  };

  const content = children ?? (adventureId
    ? <AdventurePage adventureId={adventureId} />
    : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          {t('selectAdventure')}
        </div>
      ));

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <BroadcastRibbon />
      <div className="flex flex-1 min-h-0">
        <div className="h-full flex-shrink-0 border-r border-border/50">
          <Sidebar navProps={navProps} isMobile={isMobile} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {content}
        </div>
      </div>
    </div>
  );
}
