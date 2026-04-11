import { BookOpen, Globe, User } from 'lucide-react';
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
  onCreatePersona: () => void;
  onBrowsePersonas: () => void;
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
  onCreatePersona,
  onBrowsePersonas,
}: MoirAISidebarNavProps) {
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
        My stuff
      </button>

      <button
        onClick={onSharedWithMeClick}
        className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        Shared with me
      </button>

      <button
        onClick={onBrowse}
        className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        Explore
      </button>

      <div className="my-1.5 h-px bg-border/40" />

      <NavSection
        label="Adventures"
        icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('adventures')}
        onToggle={() => toggle('adventures')}
        onCreateClick={onCreateAdventure}
        onBrowseClick={onBrowseAdventures}
        recentItems={recentAdventureItems}
        createLabel="Create adventure"
        browseLabel="Explore"
      />

      <NavSection
        label="Worlds"
        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('worlds')}
        onToggle={() => toggle('worlds')}
        onCreateClick={onCreateWorld}
        onBrowseClick={onBrowseWorlds}
        createLabel="Create world"
        browseLabel="Explore"
      />

      <NavSection
        label="Personas"
        icon={<User className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('personas')}
        onToggle={() => toggle('personas')}
        onCreateClick={onCreatePersona}
        onBrowseClick={onBrowsePersonas}
        createLabel="Create persona"
        browseLabel="Explore"
      />
    </div>
  );
}
