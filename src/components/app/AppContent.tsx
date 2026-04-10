import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../sidebar/view/Sidebar';
import AdventurePage from '../../features/adventure/components/AdventurePage';
import { useDeviceSettings } from '../../hooks/useDeviceSettings';

export default function AppContent() {
  const navigate = useNavigate();
  const { adventureId } = useParams<{ adventureId?: string }>();
  const { isMobile } = useDeviceSettings({ trackPWA: false });

  const navProps = {
    onMyStuffClick: () => {},
    onSharedWithMeClick: () => {},
    onCreateAdventure: () => navigate('/adventure/new'),
    onBrowseAdventures: () => {},
    onAdventureClick: (id: string) => navigate(`/adventure/play/${id}`),
    onCreateWorld: () => {},
    onBrowseWorlds: () => {},
    onCreatePersona: () => {},
    onBrowsePersonas: () => {},
  };

  return (
    <div className="fixed inset-0 flex bg-background">
      <div className="h-full flex-shrink-0 border-r border-border/50">
        <Sidebar navProps={navProps} isMobile={isMobile} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {adventureId ? (
          <AdventurePage adventureId={adventureId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Select an adventure to begin.
          </div>
        )}
      </div>
    </div>
  );
}
