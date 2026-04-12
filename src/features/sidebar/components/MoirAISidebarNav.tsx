import { BookOpen, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavSection } from './NavSection';
import { useMoirAISidebar } from '../hooks/useMoirAISidebar';
import { useRecentAdventures } from '../hooks/useRecentAdventures';

export type MoirAISidebarNavProps = {
  onMyStuffClick: () => void;
  onSharedWithMeClick: () => void;
  onBrowse: () => void;
  onCreateAdventure: () => void;
  onBrowseAdventures: () => void;
  onAdventureClick: (id: string) => void;
  onCreateWorld: () => void;
  onBrowseWorlds: () => void;
};

export function MoirAISidebarNav({
  onMyStuffClick,
  onSharedWithMeClick,
  onBrowse,
  onCreateAdventure,
  onBrowseAdventures,
  onAdventureClick,
  onCreateWorld,
  onBrowseWorlds,
}: MoirAISidebarNavProps) {
  const { t } = useTranslation('sidebar');
  const { expanded, toggle } = useMoirAISidebar();
  const { data: recentAdventures } = useRecentAdventures();

  const recentAdventureItems = (recentAdventures ?? []).map((a) => ({
    id: a.id,
    label: a.name,
    onClick: () => onAdventureClick(a.id),
  }));

  return (
    <div className="space-y-0.5 px-1.5 py-2">
      <button
        onClick={onMyStuffClick}
        className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        {t('nav.myStuff')}
      </button>

      <button
        onClick={onSharedWithMeClick}
        className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        {t('nav.sharedWithMe')}
      </button>

      <button
        onClick={onBrowse}
        className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        {t('nav.explore')}
      </button>

      <div className="my-1.5 h-px bg-border/40" />

      <NavSection
        label={t('nav.adventures')}
        icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('adventures')}
        onToggle={() => toggle('adventures')}
        onCreateClick={onCreateAdventure}
        onBrowseClick={onBrowseAdventures}
        recentItems={recentAdventureItems}
        createLabel={t('nav.createAdventure')}
        browseLabel={t('nav.explore')}
      />

      <NavSection
        label={t('nav.worlds')}
        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('worlds')}
        onToggle={() => toggle('worlds')}
        onCreateClick={onCreateWorld}
        onBrowseClick={onBrowseWorlds}
        createLabel={t('nav.createWorld')}
        browseLabel={t('nav.explore')}
      />

    </div>
  );
}
