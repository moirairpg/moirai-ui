import React, { type ReactNode } from 'react';

type CardGridProps = {
  children: ReactNode;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export function CardGrid({ children, isLoading, hasMore, onLoadMore }: CardGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (React.Children.count(children) === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Nothing here yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
