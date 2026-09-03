// src/features/services/api/catalogApi.ts
import api, { cleanParams, servicesUrl } from "./http";
import type {
  ApiEnvelope,
  ListCategoriesQuery,
  ListItemsQuery,
  ListSlotsQuery,
  Paginated,
  ServiceCategory,
  ServiceCategoryDetail,
  ServiceItem,
  ServiceItemDetail,
  ServiceSlot,
} from "../types/service.types";

/* --------------------------- Categories --------------------------- */

/** GET /api/services/categories → data = ServiceCategory[] (tableau nu). */
export async function listCategories(
  query: ListCategoriesQuery = {},
): Promise<ServiceCategory[]> {
  const { data } = await api.get<ApiEnvelope<ServiceCategory[]>>(
    servicesUrl("/categories"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}

/** GET /api/services/categories/:id → categorie + items + slots. */
export async function getCategory(id: number): Promise<ServiceCategoryDetail> {
  const { data } = await api.get<ApiEnvelope<ServiceCategoryDetail>>(
    servicesUrl(`/categories/${id}`),
  );
  return data.data;
}

/* ----------------------------- Articles ---------------------------- */

/** GET /api/services/items → data = { items, meta }. */
export async function listItems(
  query: ListItemsQuery = {},
): Promise<Paginated<ServiceItem>> {
  const { data } = await api.get<ApiEnvelope<Paginated<ServiceItem>>>(
    servicesUrl("/items"),
    { params: cleanParams({ ...query }) },
  );
  return data.data;
}

/** GET /api/services/items/:id → article + slots + spaTreatment + restaurantTable. */
export async function getItem(id: number): Promise<ServiceItemDetail> {
  const { data } = await api.get<ApiEnvelope<ServiceItemDetail>>(
    servicesUrl(`/items/${id}`),
  );
  return data.data;
}

/**
 * GET /api/services/items/slots → data = ServiceSlot[] (tableau nu).
 * Sert a construire la grille horaire : passer itemId OU categoryId.
 */
export async function listSlots(
  query: ListSlotsQuery = {},
): Promise<ServiceSlot[]> {
  const { data } = await api.get<ApiEnvelope<ServiceSlot[]>>(
    servicesUrl("/items/slots"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}