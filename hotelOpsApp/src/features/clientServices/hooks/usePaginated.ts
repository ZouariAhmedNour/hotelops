// src/features/services/hooks/usePaginated.ts
import { useCallback, useEffect, useRef, useState } from "react";

import type { PageMeta, Paginated } from "../types/service.types";
import { getApiMessage } from "../utils/apiError";

type Fetcher<T> = (page: number) => Promise<Paginated<T>>;

export type UsePaginatedResult<T> = {
  items: T[];
  meta: PageMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
};

/**
 * Liste infinie sur les endpoints qui renvoient { items, meta }.
 * Le fetcher recoit la page a charger ; il doit rester stable
 * (useCallback) sinon on relance en boucle.
 */
export function usePaginated<T>(
  fetcher: Fetcher<T>,
  options: { deps?: unknown[]; enabled?: boolean } = {},
): UsePaginatedResult<T> {
  const { deps = [], enabled = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(
    async (page: number, mode: "initial" | "refresh" | "more") => {
      const currentId = ++requestId.current;

      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      if (mode === "more") setLoadingMore(true);
      setError(null);

      try {
        const result = await fetcherRef.current(page);
        if (!mounted.current || currentId !== requestId.current) return;

        const nextItems = result?.items ?? [];
        setMeta(result?.meta ?? null);
        setItems((prev) => (mode === "more" ? [...prev, ...nextItems] : nextItems));
      } catch (err) {
        if (!mounted.current || currentId !== requestId.current) return;
        setError(getApiMessage(err));
        if (mode !== "more") setItems([]);
      } finally {
        if (mounted.current && currentId === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void load(1, "initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const hasMore = meta ? meta.page < meta.totalPages : false;

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || loadingMore || refreshing || !meta) return;
    await load(meta.page + 1, "more");
  }, [hasMore, load, loading, loadingMore, meta, refreshing]);

  const refresh = useCallback(async () => {
    await load(1, "refresh");
  }, [load]);

  const reload = useCallback(async () => {
    await load(1, "initial");
  }, [load]);

  return {
    items,
    meta,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
    reload,
  };
}