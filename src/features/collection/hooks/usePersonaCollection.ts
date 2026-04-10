import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../utils/api';
import type { PersonaSummary, PaginatedResult, CollectionView } from '../types';

type UsePersonaCollectionResult = {
  items: PersonaSummary[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  removeItem: (id: string) => void;
};

export function usePersonaCollection(view: CollectionView): UsePersonaCollectionResult {
  const [items, setItems] = useState<PersonaSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    setIsLoading(true);

    apiFetch(`/api/persona?view=${view}&page=1&size=20`)
      .then((res) => res.json())
      .then((json: PaginatedResult<PersonaSummary>) => {
        setItems(json.data);
        setHasMore(json.page < json.totalPages);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [view]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    apiFetch(`/api/persona?view=${view}&page=${nextPage}&size=20`)
      .then((res) => res.json())
      .then((json: PaginatedResult<PersonaSummary>) => {
        setItems((prev) => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(json.page < json.totalPages);
      })
      .catch(() => {});
  }, [view, page]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { items, isLoading, hasMore, loadMore, removeItem };
}
