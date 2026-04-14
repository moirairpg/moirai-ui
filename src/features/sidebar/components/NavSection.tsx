import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type NavSectionProps = {
  label: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  createPath: string;
  browsePath: string;
  recentItems?: { id: string; label: string; href: string }[];
  createLabel: string;
  browseLabel: string;
};

export function NavSection({
  label,
  icon,
  isExpanded,
  onToggle,
  createPath,
  browsePath,
  recentItems,
  createLabel,
  browseLabel,
}: NavSectionProps) {
  const itemClass =
    'flex w-full items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground';

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        {isExpanded
          ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {isExpanded && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
          <Link to={createPath} className={itemClass}>
            {createLabel}
          </Link>

          <Link to={browsePath} className={itemClass}>
            {browseLabel}
          </Link>

          {recentItems && recentItems.length > 0 && (
            <>
              <div className="my-1 h-px bg-border/30" />
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`${itemClass} text-left`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
