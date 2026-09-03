// src/features/services/api/restaurantApi.ts
import api, { cleanBody, cleanParams, servicesUrl } from "./http";
import type {
  ApiEnvelope,
  AvailableTablesQuery,
  CreateRestaurantBookingPayload,
  ListBookingsQuery,
  ListTablesQuery,
  Paginated,
  RestaurantRoom,
  RestaurantTable,
  ServiceBooking,
  ServiceBookingDetail,
} from "../types/service.types";

/* ------------------------------ Salles ----------------------------- */

/** GET /api/services/restaurant/rooms → data = RestaurantRoom[] (tableau nu). */
export async function listRooms(
  query: { includeInactive?: boolean } = {},
): Promise<RestaurantRoom[]> {
  const { data } = await api.get<ApiEnvelope<RestaurantRoom[]>>(
    servicesUrl("/restaurant/rooms"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}

/* ------------------------------ Tables ----------------------------- */

/** GET /api/services/restaurant/tables → data = RestaurantTable[] (tableau nu). */
export async function listTables(
  query: ListTablesQuery = {},
): Promise<RestaurantTable[]> {
  const { data } = await api.get<ApiEnvelope<RestaurantTable[]>>(
    servicesUrl("/restaurant/tables"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}

/**
 * GET /api/services/restaurant/tables/available → data = RestaurantTable[].
 * bookingDate doit etre en YYYY-MM-DD et startTime en HH:mm.
 * Renvoie une 400 si le restaurant est ferme sur ce creneau, avec les
 * horaires d'ouverture dans `errors.services`.
 */
export async function findAvailableTables(
  query: AvailableTablesQuery,
): Promise<RestaurantTable[]> {
  const { data } = await api.get<ApiEnvelope<RestaurantTable[]>>(
    servicesUrl("/restaurant/tables/available"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}

/* --------------------------- Reservations -------------------------- */

/** GET /api/services/restaurant/bookings → data = { items, meta }. */
export async function listBookings(
  query: ListBookingsQuery = {},
): Promise<Paginated<ServiceBooking>> {
  const { data } = await api.get<ApiEnvelope<Paginated<ServiceBooking>>>(
    servicesUrl("/restaurant/bookings"),
    { params: cleanParams({ ...query }) },
  );
  return data.data;
}

/** GET /api/services/restaurant/bookings/:id → reservation + events. */
export async function getBooking(id: number): Promise<ServiceBookingDetail> {
  const { data } = await api.get<ApiEnvelope<ServiceBookingDetail>>(
    servicesUrl(`/restaurant/bookings/${id}`),
  );
  return data.data;
}

/**
 * POST /api/services/restaurant/bookings
 * Sans tableId, le backend attribue automatiquement la plus petite table
 * capable d'accueillir partySize.
 */
export async function createBooking(
  payload: CreateRestaurantBookingPayload,
): Promise<ServiceBookingDetail> {
  const { data } = await api.post<ApiEnvelope<ServiceBookingDetail>>(
    servicesUrl("/restaurant/bookings"),
    cleanBody({ ...payload }),
  );
  return data.data;
}