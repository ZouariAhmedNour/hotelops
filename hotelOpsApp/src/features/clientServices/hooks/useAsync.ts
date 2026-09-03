// src/features/services/hooks/useAsync.ts
import { useCallback, useEffect, useRef, useState } from "react";

import { getApiMessage } from "../utils/apiError";

type UseAsyncOptions = {
  /** Passe a false pour ne declencher qu'a la main via refetch(). */
  immediate?: boolean;
  /** Toute modification relance l'appel (equivalent d'une queryKey). */
  deps?: unknown[];
};

export type UseAsyncResult<T> = {
  data: T | null;
  loading: boolean;
  /** true seulement pendant un pull-to-refresh. */
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<T | null>;
  refresh: () => Promise<T | null>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
};

/**
 * Remplace React Query pour un appel unique.
 * Garde-fou important : un `requestId` empeche une reponse lente de
 * remplacer le resultat d'un appel plus recent (course de requetes).
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  options: UseAsyncOptions = {},
): UseAsyncResult<T> {
  const { immediate = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  const requestId = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (isRefresh: boolean): Promise<T | null> => {
    const currentId = ++requestId.current;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await fnRef.current();
      if (!mounted.current || currentId !== requestId.current) return null;
      setData(result);
      return result;
    } catch (err) {
      if (!mounted.current || currentId !== requestId.current) return null;
      setError(getApiMessage(err));
      return null;
    } finally {
      if (mounted.current && currentId === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const refetch = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);

  useEffect(() => {
    if (!immediate) return;
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, refreshing, error, refetch, refresh, setData };
}

type UseMutationResult<TArgs extends unknown[], TResult> = {
  mutate: (...args: TArgs) => Promise<TResult | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

/** Petit pendant de useAsync pour les POST (creation de commande/reservation). */
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  handlers: {
    onSuccess?: (result: TResult) => void;
    onError?: (err: unknown) => void;
  } = {},
): UseMutationResult<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      handlersRef.current.onSuccess?.(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(getApiMessage(err));
      handlersRef.current.onError?.(err);
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}