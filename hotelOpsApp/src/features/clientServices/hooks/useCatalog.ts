// src/features/services/hooks/useCatalog.ts
import { useCallback, useMemo, useState } from "react";

import * as catalogApi from "../api/catalogApi";
import type {
  ServiceCategory,
  ServiceDomain,
  ServiceItem,
  ServiceItemDetail,
  ServiceSlot,
} from "../types/service.types";
import { dayOfWeek, pickSlotsForDay } from "../utils/datetime";
import { useAsync } from "./useAsync";
import { usePaginated } from "./usePaginated";

/** Categories actives d'un domaine (tableau nu cote backend). */
export function useCategories(domain?: ServiceDomain) {
  const fetcher = useCallback(
    () => catalogApi.listCategories(domain ? { domain } : {}),
    [domain],
  );
  return useAsync<ServiceCategory[]>(fetcher, { deps: [domain] });
}

/**
 * Catalogue d'un domaine avec filtre par categorie et recherche.
 * `isAvailable: true` n'est PAS force : on veut afficher les articles
 * epuises en grise plutot que de les faire disparaitre.
 */
export function useCatalogItems(params: {
  domain?: ServiceDomain;
  categoryId?: number;
  search?: string;
  limit?: number;
}) {
  const { domain, categoryId, search, limit = 20 } = params;

  const fetcher = useCallback(
    (page: number) =>
      catalogApi.listItems({
        page,
        limit,
        domain,
        categoryId,
        search: search && search.trim().length > 0 ? search.trim() : undefined,
      }),
    [categoryId, domain, limit, search],
  );

  return usePaginated<ServiceItem>(fetcher, {
    deps: [domain, categoryId, search],
  });
}

/** Detail d'un article, avec ses options, supplements, creneaux et soin spa. */
export function useServiceItem(itemId: number) {
  const fetcher = useCallback(() => catalogApi.getItem(itemId), [itemId]);
  return useAsync<ServiceItemDetail>(fetcher, { deps: [itemId] });
}

/**
 * Creneaux applicables a une date : on interroge l'article s'il en a,
 * sinon la categorie. Meme cascade que le backend.
 */
export function useSlots(params: {
  itemId?: number;
  categoryId?: number;
  date?: Date;
  enabled?: boolean;
}) {
  const { itemId, categoryId, date, enabled = true } = params;
  const weekday = date ? dayOfWeek(date) : undefined;

  const fetcher = useCallback(async (): Promise<ServiceSlot[]> => {
    if (!enabled || (!itemId && !categoryId)) return [];

    if (itemId) {
      const itemSlots = await catalogApi.listSlots({ itemId, dayOfWeek: weekday });
      if (itemSlots.length > 0) return itemSlots;
    }
    if (categoryId) {
      return catalogApi.listSlots({ categoryId, dayOfWeek: weekday });
    }
    return [];
  }, [categoryId, enabled, itemId, weekday]);

  const state = useAsync<ServiceSlot[]>(fetcher, {
    immediate: enabled,
    deps: [itemId, categoryId, weekday, enabled],
  });

  const slots = useMemo(() => {
    const raw = state.data ?? [];
    return weekday === undefined ? raw : pickSlotsForDay(raw, weekday);
  }, [state.data, weekday]);

  return { ...state, slots };
}

/**
 * Etat local d'un ecran de catalogue : categorie selectionnee + recherche.
 * Extrait ici pour que l'ecran reste lisible.
 */
export function useCatalogFilters(initialCategoryId?: number) {
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialCategoryId,
  );
  const [search, setSearch] = useState("");

  const toggleCategory = useCallback((id: number) => {
    setCategoryId((prev) => (prev === id ? undefined : id));
  }, []);

  const reset = useCallback(() => {
    setCategoryId(undefined);
    setSearch("");
  }, []);

  return { categoryId, setCategoryId, toggleCategory, search, setSearch, reset };
}