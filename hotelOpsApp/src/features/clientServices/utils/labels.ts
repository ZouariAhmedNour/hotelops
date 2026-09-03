// src/features/services/utils/labels.ts
import type {
  BookingDomain,
  GenderPreference,
  PaymentMethod,
  ServiceBookingStatus,
  ServiceDomain,
  ServiceOrderStatus,
  TherapistGender,
} from "../types/service.types";

/** Noms d'icones @expo/vector-icons — famille Ionicons. */
export type IoniconName = string;

export const DOMAIN_LABELS: Record<ServiceDomain, string> = {
  ROOM_SERVICE: "Room service",
  RESTAURANT: "Restaurant",
  SPA: "Spa & bien-etre",
  PLAYROOM: "Salle de jeux",
  POOL: "Piscine",
  FITNESS: "Fitness",
  ACTIVITY: "Activites",
  CONCIERGERIE: "Conciergerie",
};

export const DOMAIN_DESCRIPTIONS: Record<ServiceDomain, string> = {
  ROOM_SERVICE: "Commandez, on livre en chambre",
  RESTAURANT: "Reservez votre table",
  SPA: "Massages et soins",
  PLAYROOM: "Espace jeux et detente",
  POOL: "Transat et acces piscine",
  FITNESS: "Salle de sport et coaching",
  ACTIVITY: "Excursions et animations",
  CONCIERGERIE: "Transferts, demandes speciales",
};

export const DOMAIN_ICONS: Record<ServiceDomain, IoniconName> = {
  ROOM_SERVICE: "restaurant-outline",
  RESTAURANT: "wine-outline",
  SPA: "flower-outline",
  PLAYROOM: "game-controller-outline",
  POOL: "water-outline",
  FITNESS: "barbell-outline",
  ACTIVITY: "compass-outline",
  CONCIERGERIE: "briefcase-outline",
};

export function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain as ServiceDomain] ?? domain;
}

export function domainIcon(domain: string): IoniconName {
  return DOMAIN_ICONS[domain as ServiceDomain] ?? "ellipse-outline";
}

/* ----------------------------- Statuts ----------------------------- */

export const ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  NEW: "Recue",
  PREPARING: "En preparation",
  READY: "Prete",
  DELIVERING: "En livraison",
  DELIVERED: "Livree",
  CANCELLED: "Annulee",
};

export const BOOKING_STATUS_LABELS: Record<ServiceBookingStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmee",
  COMPLETED: "Terminee",
  CANCELLED: "Annulee",
  NO_SHOW: "Non honoree",
};

export type StatusTone = "info" | "progress" | "success" | "danger" | "neutral";

const ORDER_STATUS_TONES: Record<ServiceOrderStatus, StatusTone> = {
  NEW: "info",
  PREPARING: "progress",
  READY: "progress",
  DELIVERING: "progress",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const BOOKING_STATUS_TONES: Record<ServiceBookingStatus, StatusTone> = {
  PENDING: "info",
  CONFIRMED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

/** Palette locale : n'utilise aucune cle inconnue de ton theme. */
export const STATUS_COLORS: Record<StatusTone, { bg: string; fg: string }> = {
  info: { bg: "#E8F0FE", fg: "#1A56DB" },
  progress: { bg: "#FFF3E0", fg: "#B45309" },
  success: { bg: "#E7F7EE", fg: "#0F7B4F" },
  danger: { bg: "#FDECEC", fg: "#E5484D" },
  neutral: { bg: "#EEF1F7", fg: "#5B6478" },
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as ServiceOrderStatus] ?? status;
}

export function orderStatusTone(status: string): StatusTone {
  return ORDER_STATUS_TONES[status as ServiceOrderStatus] ?? "neutral";
}

export function bookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status as ServiceBookingStatus] ?? status;
}

export function bookingStatusTone(status: string): StatusTone {
  return BOOKING_STATUS_TONES[status as ServiceBookingStatus] ?? "neutral";
}

/** Etapes affichees dans la timeline d'une commande. */
export const ORDER_TIMELINE: ServiceOrderStatus[] = [
  "NEW",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
];

/* ----------------------------- Divers ------------------------------ */

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ROOM_CHARGE: "Sur la note de la chambre",
  CASH: "Especes a la livraison",
  CARD: "Carte bancaire",
};

export function paymentLabel(method: string | null): string {
  if (!method) return "Non precise";
  return PAYMENT_LABELS[method as PaymentMethod] ?? method;
}

export const GENDER_PREFERENCE_LABELS: Record<GenderPreference, string> = {
  NO_PREFERENCE: "Peu importe",
  MALE: "Homme",
  FEMALE: "Femme",
};

export const THERAPIST_GENDER_LABELS: Record<TherapistGender, string> = {
  MALE: "Homme",
  FEMALE: "Femme",
};

export function therapistName(therapist: {
  firstName: string;
  lastName: string;
}): string {
  return `${therapist.firstName} ${therapist.lastName}`.trim();
}

/** Route de detail a ouvrir selon le domaine de la reservation. */
export function bookingDomainLabel(domain: BookingDomain): string {
  return DOMAIN_LABELS[domain] ?? domain;
}

/** Traduit les evenements de la timeline (ServiceEvent.type). */
export function eventLabel(type: string): string {
  const map: Record<string, string> = {
    CREATED: "Demande creee",
    STATUS_CHANGED: "Statut modifie",
    PAID: "Paiement enregistre",
    THERAPIST_ASSIGNED: "Therapeute assigne",
    TABLE_ASSIGNED: "Table attribuee",
    CANCELLED: "Annulation",
    UPDATED: "Mise a jour",
  };
  return map[type] ?? type;
}