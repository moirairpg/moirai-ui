import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../sidebar/view/Sidebar';
import AdventurePage from '../../features/adventure/components/AdventurePage';
import { useDeviceSettings } from '../../hooks/useDeviceSettings';

type AppContentProps = {
  children?: ReactNode;
};

export default function AppContent({ children }: AppContentProps) {
  const navigate = useNavigate();
  const { adventureId } = useParams<{ adventureId?: string }>();
  const { isMobile } = useDeviceSettings({ trackPWA: false });
  const { t } = useTranslation('common');

  const navProps = {
    onMyStuffClick: () => navigate('/my-stuff'),
    onSharedWithMeClick: () => navigate('/shared-with-me'),
    onCreateAdventure: () => navigate('/adventure/new'),
    onBrowseAdventures: () => navigate('/explore?tab=adventures'),
    onAdventureClick: (id: string) => navigate(`/adventure/play/${id}`),
    onCreateWorld: () => navigate('/world/new'),
    onBrowseWorlds: () => navigate('/explore?tab=worlds'),
    onBrowse: () => navigate('/explore'),
  };

  const content = children ?? (adventureId
    ? <AdventurePage adventureId={adventureId} />
    : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          {t('selectAdventure')}
        </div>
      ));

  return (
    <div className="fixed inset-0 flex bg-background">
      <div className="h-full flex-shrink-0 border-r border-border/50">
        <Sidebar navProps={navProps} isMobile={isMobile} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {content}
      </div>
    </div>
  );
}
