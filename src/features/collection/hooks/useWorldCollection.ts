import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../utils/api';
import type { WorldSummary, PaginatedResult, CollectionView } from '../types';

type UseWorldCollectionResult = {
  items: WorldSummary[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  removeItem: (id: string) => void;
};

export function useWorldCollection(view: CollectionView): UseWorldCollectionResult {
  const [items, setItems] = useState<WorldSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    setIsLoading(true);

    apiFetch(`/api/world?view=${view}&page=1&size=20`)
      .then((res) => res.json())
      .then((json: PaginatedResult<WorldSummary>) => {
        setItems(json.data);
        setHasMore(json.page < json.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [view]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    apiFetch(`/api/world?view=${view}&page=${nextPage}&size=20`)
      .then((res) => res.json())
      .then((json: PaginatedResult<WorldSummary>) => {
        setItems((prev) => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(json.page < json.totalPages);
      })
      .catch(() => {});
  }, [view, page]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { items, isLoading, hasMore, loadMore, removeItem };
}
