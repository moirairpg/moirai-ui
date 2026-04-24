import { PanelLeftClose } from 'lucide-react';
import type { TFunction } from 'i18next';
import { Link } from 'react-router-dom';
import { Button } from '../../../../shared/view/ui';
import { IS_PLATFORM } from '../../../../constants/config';
import { NotificationPanel } from '../../../../features/notifications';

type SidebarHeaderProps = {
  isPWA: boolean;
  isMobile: boolean;
  createAdventurePath: string;
  onCollapseSidebar: () => void;
  t: TFunction;
};

export default function SidebarHeader({
  isPWA,
  isMobile,
  createAdventurePath,
  onCollapseSidebar,
  t,
}: SidebarHeaderProps) {
  const LogoBlock = () => (
    <div className="flex min-w-0 items-center gap-2.5">
      <img src="/logo-64.png" alt="MoirAI" className="h-7 w-7 flex-shrink-0 rounded-lg object-cover" />
      <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">{t('app.title')}</h1>
    </div>
  );

  return (
    <div className="flex-shrink-0">
      <div
        className="hidden px-3 pb-2 pt-3 md:block"
        style={{}}
      >
        <div className="flex items-center justify-between gap-2">
          {IS_PLATFORM ? (
            <a
              href="https://cloudcli.ai/dashboard"
              className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
              title={t('tooltips.viewEnvironments')}
            >
              <LogoBlock />
            </a>
          ) : (
            <Link to="/" className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80">
              <LogoBlock />
            </Link>
          )}

          <div className="flex flex-shrink-0 items-center gap-0.5">
            <NotificationPanel />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 rounded-lg p-0 text-foreground hover:bg-accent/80"
              onClick={onCollapseSidebar}
              title={t('tooltips.hideSidebar')}
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="nav-divider hidden md:block" />

      <div
        className="p-3 pb-2 md:hidden"
        style={isPWA && isMobile ? { paddingTop: '16px' } : {}}
      >
        <div className="flex items-center justify-between">
          {IS_PLATFORM ? (
            <a
              href="https://cloudcli.ai/dashboard"
              className="flex min-w-0 items-center gap-2.5 transition-opacity active:opacity-70"
              title={t('tooltips.viewEnvironments')}
            >
              <LogoBlock />
            </a>
          ) : (
            <Link to="/" className="flex min-w-0 items-center gap-2.5 transition-opacity active:opacity-70">
              <LogoBlock />
            </Link>
          )}

          <div className="flex flex-shrink-0 gap-1.5" />
        </div>
      </div>

      <div className="nav-divider md:hidden" />
    </div>
  );
}
