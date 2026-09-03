// src/features/services/types/navigation.types.ts
// Declare a part pour eviter un cycle d'import avec navigation/AppNavigator.tsx :
// c'est AppNavigator qui importe ce type, jamais l'inverse.

import type {
  BookingDomain,
  GenericBookingDomain,
  ServiceDomain,
} from "./service.types";

export type ServicesStackParamList = {
  ServicesHome: undefined;

  /** Catalogue d'un domaine : chips de categories + liste d'articles. */
  ServiceCatalog: {
    domain: ServiceDomain;
    categoryId?: number;
  };

  ServiceItemDetail: {
    itemId: number;
  };

  RoomServiceCart: undefined;

  RestaurantBooking:
    | {
        tableId?: number;
      }
    | undefined;

  SpaBooking:
    | {
        itemId?: number;
      }
    | undefined;

  GenericBooking: {
    domain: GenericBookingDomain;
    itemId?: number;
  };

  MyRequests:
    | {
        tab?: "orders" | "bookings";
      }
    | undefined;

  OrderDetail: {
    orderId: number;
  };

  /**
   * Le domaine est obligatoire : chaque domaine a son propre endpoint de detail
   * (/restaurant/bookings/:id, /spa/bookings/:id, /bookings/:id) et le backend
   * renvoie 404 si on interroge le mauvais.
   */
  BookingDetail: {
    bookingId: number;
    domain: BookingDomain;
  };
};