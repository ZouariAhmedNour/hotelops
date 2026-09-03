// src/features/services/api/spaApi.ts
import api, { cleanBody, cleanParams, servicesUrl } from "./http";
import type {
  ApiEnvelope,
  CreateSpaBookingPayload,
  ListBookingsQuery,
  ListTherapistsQuery,
  Paginated,
  ServiceBooking,
  ServiceBookingDetail,
  SpaTherapist,
  SpaTreatment,
} from "../types/service.types";

/* ---------------------------- Therapeutes -------------------------- */

/**
 * GET /api/services/spa/therapists → data = SpaTherapist[] (tableau nu).
 * `treatmentId` filtre sur les therapeutes habilites pour ce soin.
 */
export async function listTherapists(
  query: ListTherapistsQuery = {},
): Promise<SpaTherapist[]> {
  const { data } = await api.get<ApiEnvelope<SpaTherapist[]>>(
    servicesUrl("/spa/therapists"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}

/* ------------------------------- Soins ----------------------------- */

/** GET /api/services/spa/treatments → data = SpaTreatment[] (tableau nu). */
export async function listTreatments(
  query: { includeInactive?: boolean } = {},
): Promise<SpaTreatment[]> {
  const { data } = await api.get<ApiEnvelope<SpaTreatment[]>>(
    servicesUrl("/spa/treatments"),
    { params: cleanParams({ ...query }) },
  );
  return data.data ?? [];
}

/* --------------------------- Reservations -------------------------- */

/** GET /api/services/spa/bookings → data = { items, meta }. */
export async function listBookings(
  query: ListBookingsQuery = {},
): Promise<Paginated<ServiceBooking>> {
  const { data } = await api.get<ApiEnvelope<Paginated<ServiceBooking>>>(
    servicesUrl("/spa/bookings"),
    { params: cleanParams({ ...query }) },
  );
  return data.data;
}

/** GET /api/services/spa/bookings/:id → reservation + events. */
export async function getBooking(id: number): Promise<ServiceBookingDetail> {
  const { data } = await api.get<ApiEnvelope<ServiceBookingDetail>>(
    servicesUrl(`/spa/bookings/${id}`),
  );
  return data.data;
}

/**
 * POST /api/services/spa/bookings
 * Sans therapistId, le backend en assigne un disponible en respectant
 * genderPreference. Une 409 signale un conflit d'agenda.
 */
export async function createBooking(
  payload: CreateSpaBookingPayload,
): Promise<ServiceBookingDetail> {
  const { data } = await api.post<ApiEnvelope<ServiceBookingDetail>>(
    servicesUrl("/spa/bookings"),
    cleanBody({ ...payload }),
  );
  return data.data;
}