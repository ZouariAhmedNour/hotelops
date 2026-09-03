// src/types/service.types.ts
import { randomBytes } from 'crypto';

/* ------------------------------------------------------------------ *
 *  Domaines
 * ------------------------------------------------------------------ */

export const SERVICE_DOMAINS = [
  'ROOM_SERVICE',
  'RESTAURANT',
  'SPA',
  'PLAYROOM',
  'POOL',
  'FITNESS',
  'ACTIVITY',
  'CONCIERGERIE',
] as const;
export type ServiceDomain = (typeof SERVICE_DOMAINS)[number];

/** Domaines qui n'ont aucune extension dedie : le catalogue generique suffit. */
export const GENERIC_BOOKING_DOMAINS = [
  'PLAYROOM',
  'POOL',
  'FITNESS',
  'ACTIVITY',
  'CONCIERGERIE',
] as const;
export type GenericBookingDomain = (typeof GENERIC_BOOKING_DOMAINS)[number];

/** Domaines qui passent par ServiceBooking (par opposition a ServiceOrder). */
export const BOOKING_DOMAINS = ['RESTAURANT', 'SPA', ...GENERIC_BOOKING_DOMAINS] as const;
export type BookingDomain = (typeof BOOKING_DOMAINS)[number];

/** Seul domaine qui passe par ServiceOrder. */
export const ORDER_DOMAIN = 'ROOM_SERVICE';

export function isGenericBookingDomain(value: string): value is GenericBookingDomain {
  return (GENERIC_BOOKING_DOMAINS as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ *
 *  Statuts + machines a etats
 * ------------------------------------------------------------------ */

/**
 * Table de transitions d'une machine a etats.
 * Alias volontaire : evite d'ecrire `Readonly<` en fin de ligne, ce qui rend
 * le fichier robuste au copier-coller.
 */
export type TransitionTable<S extends string> = Readonly<Record<S, readonly S[]>>;

export const SERVICE_ORDER_STATUSES = [
  'NEW',
  'PREPARING',
  'READY',
  'DELIVERING',
  'DELIVERED',
  'CANCELLED',
] as const;
export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_ORDER_TRANSITIONS: TransitionTable<ServiceOrderStatus> = {
  NEW: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERING', 'CANCELLED'],
  DELIVERING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const SERVICE_BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;
export type ServiceBookingStatus = (typeof SERVICE_BOOKING_STATUSES)[number];

export const SERVICE_BOOKING_TRANSITIONS: TransitionTable<ServiceBookingStatus> = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

/** Statuts qui occupent physiquement une table / un therapeute / une place. */
export const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED'] as const;

/** Verification generique d'une transition, sans cast hasardeux. */
export function canTransition<S extends string>(
  transitions: TransitionTable<S>,
  from: string,
  to: S,
): boolean {
  // `as unknown as` : un mapped type generique ne peut pas etre converti
  // directement vers un type a index signature (TS2352).
  const table = transitions as unknown as Record<string, readonly S[] | undefined>;
  const allowed = table[from];
  return allowed !== undefined && allowed.includes(to);
}

export function allowedTransitions<S extends string>(
  transitions: TransitionTable<S>,
  from: string,
): readonly S[] {
  return (transitions as unknown as Record<string, readonly S[] | undefined>)[from] ?? [];
}

/* ------------------------------------------------------------------ *
 *  SPA
 * ------------------------------------------------------------------ */

export const GENDER_PREFERENCES = ['NO_PREFERENCE', 'MALE', 'FEMALE'] as const;
export type GenderPreference = (typeof GENDER_PREFERENCES)[number];

export const THERAPIST_GENDERS = ['MALE', 'FEMALE'] as const;
export type TherapistGender = (typeof THERAPIST_GENDERS)[number];

/* ------------------------------------------------------------------ *
 *  Roles + pagination
 * ------------------------------------------------------------------ */

/** Roles autorises a piloter les services. `as const` = tuple, indispensable pour authorize(...). */
export const STAFF_ROLES = ['ADMIN', 'RECEPTION'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_BOOKING_DURATION_MINUTES = 90;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function buildPageMeta(page: number, limit: number, total: number): PageMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

export function toSkipTake(page: number, limit: number): { skip: number; take: number } {
  return { skip: (page - 1) * limit, take: limit };
}

/* ------------------------------------------------------------------ *
 *  References fonctionnelles
 * ------------------------------------------------------------------ */

/** SO-LX3F9K-A1B2C3 : trie-able dans le temps et sans collision pratique. */
export function generateReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

/* ------------------------------------------------------------------ *
 *  Temps et dates (tout est manipule en UTC)
 * ------------------------------------------------------------------ */

/** HH:mm strict, de 00:00 a 23:59. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const MINUTES_PER_DAY = 1440;

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function minutesToTime(totalMinutes: number): string {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Chevauchement de deux intervalles [start, end[ exprimes en minutes. */
export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

/** Normalise une date a minuit UTC : indispensable pour comparer un champ @db.Date. */
export function startOfUtcDay(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Date invalide : ${String(value)}`);
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Borne haute exclusive du jour (pour un filtre { gte, lt }). */
export function endOfUtcDayExclusive(value: Date | string): Date {
  return new Date(startOfUtcDay(value).getTime() + 24 * 60 * 60 * 1000);
}

/** 0 = dimanche ... 6 = samedi, coherent avec ServiceSlot.dayOfWeek. */
export function utcDayOfWeek(value: Date | string): number {
  return startOfUtcDay(value).getUTCDay();
}