import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type NavSectionProps = {
  label: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onCreateClick: () => void;
  onBrowseClick: () => void;
  recentItems?: { id: string; label: string; onClick: () => void }[];
  createLabel: string;
  browseLabel: string;
};

export function NavSection({
  label,
  icon,
  isExpanded,
  onToggle,
  onCreateClick,
  onBrowseClick,
  recentItems,
  createLabel,
  browseLabel,
}: NavSectionProps) {
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
          <button
            onClick={onCreateClick}
            className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            {createLabel}
          </button>

          <button
            onClick={onBrowseClick}
            className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            {browseLabel}
          </button>

          {recentItems && recentItems.length > 0 && (
            <>
              <div className="my-1 h-px bg-border/30" />
              {recentItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
