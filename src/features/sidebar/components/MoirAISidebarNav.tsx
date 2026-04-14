import { BookOpen, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NavSection } from './NavSection';
import { useMoirAISidebar } from '../hooks/useMoirAISidebar';
import { useRecentAdventures } from '../hooks/useRecentAdventures';

export type MoirAISidebarNavProps = {
  myStuffPath: string;
  sharedWithMePath: string;
  explorePath: string;
  createAdventurePath: string;
  browseAdventuresPath: string;
  adventureBasePath: string;
  createWorldPath: string;
  browseWorldsPath: string;
};

export function MoirAISidebarNav({
  myStuffPath,
  sharedWithMePath,
  explorePath,
  createAdventurePath,
  browseAdventuresPath,
  adventureBasePath,
  createWorldPath,
  browseWorldsPath,
}: MoirAISidebarNavProps) {
  const { t } = useTranslation('sidebar');
  const { expanded, toggle } = useMoirAISidebar();
  const { data: recentAdventures } = useRecentAdventures();

  const recentAdventureItems = (recentAdventures ?? []).map((a) => ({
    id: a.id,
    label: a.name,
    href: `${adventureBasePath}/${a.id}`,
  }));

  const linkClass =
    'flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50';

  return (
    <div className="space-y-0.5 px-1.5 py-2">
      <Link to={myStuffPath} className={linkClass}>
        {t('nav.myStuff')}
      </Link>

      <Link to={sharedWithMePath} className={linkClass}>
        {t('nav.sharedWithMe')}
      </Link>

      <Link to={explorePath} className={linkClass}>
        {t('nav.explore')}
      </Link>

      <div className="my-1.5 h-px bg-border/40" />

      <NavSection
        label={t('nav.adventures')}
        icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('adventures')}
        onToggle={() => toggle('adventures')}
        createPath={createAdventurePath}
        browsePath={browseAdventuresPath}
        recentItems={recentAdventureItems}
        createLabel={t('nav.createAdventure')}
        browseLabel={t('nav.explore')}
      />

      <NavSection
        label={t('nav.worlds')}
        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        isExpanded={expanded.has('worlds')}
        onToggle={() => toggle('worlds')}
        createPath={createWorldPath}
        browsePath={browseWorldsPath}
        createLabel={t('nav.createWorld')}
        browseLabel={t('nav.explore')}
      />
    </div>
  );
}
