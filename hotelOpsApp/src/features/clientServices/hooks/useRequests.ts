// src/features/services/hooks/useRequests.ts
import { useCallback, useMemo } from "react";

import * as bookingApi from "../api/bookingApi";
import * as restaurantApi from "../api/restaurantApi";
import * as roomServiceApi from "../api/roomServiceApi";
import * as spaApi from "../api/spaApi";
import type {
  BookingDomain,
  ServiceBooking,
  ServiceBookingDetail,
  ServiceOrder,
  ServiceOrderDetail,
} from "../types/service.types";
import { useAsync } from "./useAsync";
import { usePaginated } from "./usePaginated";

/* ---------------------------- Commandes ---------------------------- */

/** Mes commandes room service — pagination native du backend. */
export function useMyOrders(limit = 20) {
  const fetcher = useCallback(
    (page: number) => roomServiceApi.listOrders({ page, limit, mine: true }),
    [limit],
  );
  return usePaginated<ServiceOrder>(fetcher);
}

export function useOrderDetail(orderId: number) {
  const fetcher = useCallback(
    () => roomServiceApi.getOrder(orderId),
    [orderId],
  );
  return useAsync<ServiceOrderDetail>(fetcher, { deps: [orderId] });
}

/* --------------------------- Reservations -------------------------- */

/**
 * LIMITE ASSUMEE : le backend n'expose aucun endpoint qui agrege
 * restaurant + spa + generique. On interroge donc les trois en parallele
 * et on fusionne cote client. Consequence : pas de pagination reelle,
 * on plafonne a `limit` par source (50 par defaut, soit 150 max).
 * Si tu ajoutes un jour GET /api/services/bookings/all, ce hook se simplifie.
 */
export function useMyBookings(limit = 50) {
  const fetcher = useCallback(async (): Promise<ServiceBooking[]> => {
    const query = { page: 1, limit, mine: true } as const;

    const results = await Promise.allSettled([
      restaurantApi.listBookings({ ...query }),
      spaApi.listBookings({ ...query }),
      bookingApi.listBookings({ ...query }),
    ]);

    const merged: ServiceBooking[] = [];
    for (const result of results) {
      // Un domaine en echec ne doit pas vider toute la liste.
      if (result.status === "fulfilled") {
        merged.push(...(result.value?.items ?? []));
      }
    }

    return merged.sort((a, b) => {
      const dateDiff =
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.startTime.localeCompare(a.startTime);
    });
  }, [limit]);

  const state = useAsync<ServiceBooking[]>(fetcher, { deps: [limit] });

  const bookings = useMemo(() => state.data ?? [], [state.data]);

  return { ...state, bookings };
}

/** Detail d'une reservation : l'endpoint depend du domaine. */
export function useBookingDetail(bookingId: number, domain: BookingDomain) {
  const fetcher = useCallback(() => {
    if (domain === "RESTAURANT") return restaurantApi.getBooking(bookingId);
    if (domain === "SPA") return spaApi.getBooking(bookingId);
    return bookingApi.getBooking(bookingId);
  }, [bookingId, domain]);

  return useAsync<ServiceBookingDetail>(fetcher, { deps: [bookingId, domain] });
}

/* ------------------------------ Divers ----------------------------- */

const ACTIVE_ORDER_STATUSES = ["NEW", "PREPARING", "READY", "DELIVERING"];
const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED"];

export function isOrderActive(order: ServiceOrder): boolean {
  return ACTIVE_ORDER_STATUSES.includes(order.status);
}

export function isBookingActive(booking: ServiceBooking): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(booking.status);
}