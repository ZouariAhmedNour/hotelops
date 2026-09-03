// src/features/services/api/bookingApi.ts
import api, { cleanBody, cleanParams, servicesUrl } from "./http";
import type {
  ApiEnvelope,
  CreateGenericBookingPayload,
  ListGenericBookingsQuery,
  Paginated,
  ServiceBooking,
  ServiceBookingDetail,
} from "../types/service.types";

/**
 * Reservations generiques : PLAYROOM, POOL, FITNESS, ACTIVITY, CONCIERGERIE.
 * Le domaine RESTAURANT et le domaine SPA ont leurs propres endpoints,
 * ce controleur les refuse explicitement.
 */

/** GET /api/services/bookings → data = { items, meta }. */
export async function listBookings(
  query: ListGenericBookingsQuery = {},
): Promise<Paginated<ServiceBooking>> {
  const { data } = await api.get<ApiEnvelope<Paginated<ServiceBooking>>>(
    servicesUrl("/bookings"),
    { params: cleanParams({ ...query }) },
  );
  return data.data;
}

/** GET /api/services/bookings/:id → reservation + events. */
export async function getBooking(id: number): Promise<ServiceBookingDetail> {
  const { data } = await api.get<ApiEnvelope<ServiceBookingDetail>>(
    servicesUrl(`/bookings/${id}`),
  );
  return data.data;
}

/** POST /api/services/bookings — `domain` est obligatoire dans le body. */
export async function createBooking(
  payload: CreateGenericBookingPayload,
): Promise<ServiceBookingDetail> {
  const { data } = await api.post<ApiEnvelope<ServiceBookingDetail>>(
    servicesUrl("/bookings"),
    cleanBody({ ...payload }),
  );
  return data.data;
}