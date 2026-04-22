import { BookOpen, ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../components/auth';
import { useMoirAISidebar } from '../hooks/useMoirAISidebar';
import { useRecentAdventures } from '../hooks/useRecentAdventures';
import { NavSection } from './NavSection';

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
  const { user } = useAuth();
  const { expanded, toggle } = useMoirAISidebar();
  const { data: recentAdventures } = useRecentAdventures();

  const isAdmin = user?.role === 'ADMIN';
  const isAdminExpanded = expanded.has('admin');

  const recentAdventureItems = (recentAdventures ?? []).map((a) => ({
    id: a.id,
    label: a.name,
    href: `${adventureBasePath}/${a.id}`,
  }));

  const linkClass =
    'flex w-full items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50';

  const subItemClass =
    'flex w-full items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground';

  return (
    <div className="space-y-0.5 px-1.5 py-2">
      {isAdmin && (
        <div>
          <div className="flex w-full items-center rounded-lg pr-1 text-sm font-medium text-foreground transition-colors hover:bg-accent/50">
            <Link to="/admin" className="flex flex-1 items-center px-2.5 py-1.5">
              <span>{t('nav.adminBackoffice')}</span>
            </Link>
            <button
              type="button"
              onClick={() => toggle('admin')}
              className="flex items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={t('nav.adminBackoffice')}
            >
              {isAdminExpanded
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>

          {isAdminExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
              <Link to="/admin/notifications" className={subItemClass}>
                {t('nav.adminNotifications')}
              </Link>
            </div>
          )}
        </div>
      )}

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
