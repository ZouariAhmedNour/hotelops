// src/features/services/types/service.types.ts
// Miroir cote mobile du backend (src/types/service.types.ts + prisma/schema.prisma).
// Regle d'or : tous les champs Decimal (@db.Decimal(10,2)) arrivent en JSON
// sous forme de CHAINE ("24.50"), jamais de number. D'ou le type `Money`.

/* ------------------------------------------------------------------ *
 *  Constantes
 * ------------------------------------------------------------------ */

export const SERVICE_DOMAINS = [
  "ROOM_SERVICE",
  "RESTAURANT",
  "SPA",
  "PLAYROOM",
  "POOL",
  "FITNESS",
  "ACTIVITY",
  "CONCIERGERIE",
] as const;

export type ServiceDomain = (typeof SERVICE_DOMAINS)[number];

/** Domaines reservables via l'endpoint generique /api/services/bookings. */
export const GENERIC_BOOKING_DOMAINS = [
  "PLAYROOM",
  "POOL",
  "FITNESS",
  "ACTIVITY",
  "CONCIERGERIE",
] as const;

export type GenericBookingDomain = (typeof GENERIC_BOOKING_DOMAINS)[number];

/** Tous les domaines qui produisent une ServiceBooking. */
export const BOOKING_DOMAINS = [
  "RESTAURANT",
  "SPA",
  ...GENERIC_BOOKING_DOMAINS,
] as const;

export type BookingDomain = (typeof BOOKING_DOMAINS)[number];

/** Seul domaine qui produit une ServiceOrder. */
export const ORDER_DOMAIN = "ROOM_SERVICE";

export const SERVICE_ORDER_STATUSES = [
  "NEW",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
  "CANCELLED",
] as const;

export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export type ServiceBookingStatus = (typeof SERVICE_BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = ["ROOM_CHARGE", "CASH", "CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const GENDER_PREFERENCES = ["NO_PREFERENCE", "MALE", "FEMALE"] as const;
export type GenderPreference = (typeof GENDER_PREFERENCES)[number];

export const THERAPIST_GENDERS = ["MALE", "FEMALE"] as const;
export type TherapistGender = (typeof THERAPIST_GENDERS)[number];

/** Doit rester aligne sur le backend : utilise quand l'article n'impose pas de duree. */
export const DEFAULT_BOOKING_DURATION_MINUTES = 90;

/* ------------------------------------------------------------------ *
 *  Enveloppe de reponse (src/utils/response.ts cote backend)
 * ------------------------------------------------------------------ */

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

/** Forme produite par parseBody/parseQuery sur une 422. */
export type ApiFieldError = {
  field: string;
  message: string;
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Forme exacte des listes paginees : { items, meta } dans `data`. */
export type Paginated<T> = {
  items: T[];
  meta: PageMeta;
};

/**
 * Prisma serialise les Decimal en chaine. Ne jamais faire d'arithmetique
 * directement dessus : passer par toNumber() de utils/money.ts.
 */
export type Money = string | number | null;

/* ------------------------------------------------------------------ *
 *  Entites du catalogue
 * ------------------------------------------------------------------ */

export interface UserBrief {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  code: string;
  domain: ServiceDomain;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  /** Present uniquement sur GET /categories (pas sur le detail). */
  _count?: { items: number };
}

export interface CategoryItemBrief {
  id: number;
  name: string;
  price: Money;
  priceMin: Money;
  priceMax: Money;
  durationMinutes: number | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ServiceSlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number | null;
  /** Presents sur GET /items/slots, absents des selects imbriques. */
  itemId?: number | null;
  categoryId?: number | null;
  isActive?: boolean;
}

export interface ServiceCategoryDetail extends ServiceCategory {
  items: CategoryItemBrief[];
  slots: ServiceSlot[];
}

export interface ServiceItemOption {
  id: number;
  name: string;
  /** Peut etre negatif (remise). */
  priceDelta: Money;
}

export interface ServiceItemSupplement {
  id: number;
  name: string;
  price: Money;
}

export interface ServiceItem {
  id: number;
  categoryId: number;
  domain: ServiceDomain;
  name: string;
  description: string | null;
  photos: string[];
  price: Money;
  priceMin: Money;
  priceMax: Money;
  durationMinutes: number | null;
  prepTimeMinutes: number | null;
  allergens: string[];
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  category: {
    id: number;
    name: string;
    code: string;
    domain: ServiceDomain;
  };
  options: ServiceItemOption[];
  supplements: ServiceItemSupplement[];
}

export interface SpaTherapist {
  id: number;
  firstName: string;
  lastName: string;
  gender: TherapistGender;
  photo: string | null;
  isActive?: boolean;
}

export interface ServiceItemDetail extends ServiceItem {
  slots: ServiceSlot[];
  spaTreatment: {
    id: number;
    genderPreference: GenderPreference;
    allowTherapistChoice: boolean;
    therapists: { therapist: SpaTherapist }[];
  } | null;
  restaurantTable: {
    id: number;
    name: string;
    code: string;
    seats: number;
    room: { id: number; name: string; code: string };
  } | null;
}

/* ------------------------------------------------------------------ *
 *  Commandes (room service)
 * ------------------------------------------------------------------ */

export interface ServiceEvent {
  id: number;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  message: string | null;
  createdAt: string;
  user: UserBrief | null;
}

export interface ServiceOrderLine {
  id: number;
  itemId: number;
  quantity: number;
  /** Prix unitaire fige a la commande, options et supplements inclus. */
  unitPrice: Money;
  optionIds: number[];
  supplementIds: number[];
  comment: string | null;
  item: {
    id: number;
    name: string;
    prepTimeMinutes: number | null;
  };
}

export interface ServiceOrder {
  id: number;
  orderNumber: string;
  domain: string;
  status: ServiceOrderStatus;
  roomNumber: string | null;
  totalAmount: Money;
  paymentMethod: PaymentMethod | null;
  isPaid: boolean;
  comment: string | null;
  cancelReason: string | null;
  createdAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
  user: UserBrief | null;
  lines: ServiceOrderLine[];
}

export interface ServiceOrderDetail extends ServiceOrder {
  updatedAt: string;
  events: ServiceEvent[];
}

/* ------------------------------------------------------------------ *
 *  Reservations
 * ------------------------------------------------------------------ */

export interface ServiceBooking {
  id: number;
  bookingNumber: string;
  domain: BookingDomain;
  status: ServiceBookingStatus;
  itemId: number | null;
  tableId: number | null;
  therapistId: number | null;
  userId: number | null;
  roomNumber: string | null;
  /** DateTime ISO, normalise a minuit UTC par le backend. */
  bookingDate: string;
  startTime: string;
  durationMinutes: number | null;
  partySize: number | null;
  genderPreference: string | null;
  occasion: string | null;
  preferences: string | null;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  item: {
    id: number;
    name: string;
    domain: ServiceDomain;
    durationMinutes: number | null;
  } | null;
  table: {
    id: number;
    name: string;
    code: string;
    seats: number;
    room: { id: number; name: string; code: string };
  } | null;
  therapist: SpaTherapist | null;
  user: UserBrief | null;
}

export interface ServiceBookingDetail extends ServiceBooking {
  updatedAt: string;
  events: ServiceEvent[];
}

/* ------------------------------------------------------------------ *
 *  Restaurant
 * ------------------------------------------------------------------ */

export interface RestaurantRoom {
  id: number;
  name: string;
  code: string;
  type: string;
  capacity: number | null;
  isActive: boolean;
  _count?: { tables: number };
}

export interface RestaurantTable {
  id: number;
  roomId: number;
  itemId: number | null;
  name: string;
  code: string;
  seats: number;
  isActive: boolean;
  room: { id: number; name: string; code: string; isActive: boolean };
  item: { id: number; name: string; price: Money } | null;
}

/* ------------------------------------------------------------------ *
 *  SPA
 * ------------------------------------------------------------------ */

export interface SpaTreatment {
  id: number;
  itemId: number;
  genderPreference: GenderPreference;
  allowTherapistChoice: boolean;
  item: {
    id: number;
    name: string;
    domain: ServiceDomain;
    price: Money;
    durationMinutes: number | null;
    isActive: boolean;
    isAvailable: boolean;
    categoryId: number;
  };
  therapists: { therapistId: number; therapist: SpaTherapist }[];
}

/* ------------------------------------------------------------------ *
 *  Payloads d'ecriture
 * ------------------------------------------------------------------ */

export interface OrderLinePayload {
  itemId: number;
  quantity: number;
  optionIds?: number[];
  supplementIds?: number[];
  comment?: string;
}

export interface CreateOrderPayload {
  /** Requis cote backend (string 1-20). */
  roomNumber: string;
  paymentMethod?: PaymentMethod;
  comment?: string;
  /** Attention : le backend attend `lines`, pas `items`. */
  lines: OrderLinePayload[];
}

interface BookingBasePayload {
  roomNumber?: string;
  /** Format YYYY-MM-DD : evite tout decalage de jour avec startOfUtcDay(). */
  bookingDate: string;
  /** Format HH:mm. */
  startTime: string;
  notes?: string;
}

export interface CreateRestaurantBookingPayload extends BookingBasePayload {
  tableId?: number;
  partySize: number;
  durationMinutes?: number;
  occasion?: string;
  preferences?: string;
}

export interface CreateSpaBookingPayload extends BookingBasePayload {
  itemId: number;
  therapistId?: number;
  genderPreference?: GenderPreference;
}

export interface CreateGenericBookingPayload extends BookingBasePayload {
  domain: GenericBookingDomain;
  itemId?: number;
  partySize?: number;
  durationMinutes?: number;
}

/* ------------------------------------------------------------------ *
 *  Query params
 * ------------------------------------------------------------------ */

export interface ListCategoriesQuery {
  domain?: ServiceDomain;
  includeInactive?: boolean;
}

export interface ListItemsQuery {
  page?: number;
  limit?: number;
  domain?: ServiceDomain;
  categoryId?: number;
  isAvailable?: boolean;
  includeInactive?: boolean;
  search?: string;
}

export interface ListSlotsQuery {
  itemId?: number;
  categoryId?: number;
  dayOfWeek?: number;
  includeInactive?: boolean;
}

export interface ListOrdersQuery {
  page?: number;
  limit?: number;
  status?: ServiceOrderStatus;
  roomNumber?: string;
  from?: string;
  to?: string;
  mine?: boolean;
}

export interface ListBookingsQuery {
  page?: number;
  limit?: number;
  status?: ServiceBookingStatus;
  date?: string;
  from?: string;
  to?: string;
  mine?: boolean;
}

export interface ListGenericBookingsQuery extends ListBookingsQuery {
  domain?: GenericBookingDomain;
}

export interface AvailableTablesQuery {
  bookingDate: string;
  startTime: string;
  partySize: number;
  durationMinutes?: number;
  roomId?: number;
}

export interface ListTablesQuery {
  roomId?: number;
  minSeats?: number;
  includeInactive?: boolean;
}

export interface ListTherapistsQuery {
  gender?: TherapistGender;
  treatmentId?: number;
  includeInactive?: boolean;
}

/* ------------------------------------------------------------------ *
 *  Panier local (n'existe pas cote backend)
 * ------------------------------------------------------------------ */

export interface CartLine {
  /** Cle locale : meme article + memes options + meme commentaire = meme ligne. */
  key: string;
  item: ServiceItem;
  quantity: number;
  optionIds: number[];
  supplementIds: number[];
  comment?: string;
}