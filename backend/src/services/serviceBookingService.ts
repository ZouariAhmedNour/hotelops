// src/services/serviceBookingService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { conflict, notFound, unprocessable } from '../utils/appError';
import {
  ACTIVE_BOOKING_STATUSES,
  DEFAULT_BOOKING_DURATION_MINUTES,
  MINUTES_PER_DAY,
  SERVICE_BOOKING_TRANSITIONS,
  allowedTransitions,
  buildPageMeta,
  canTransition,
  endOfUtcDayExclusive,
  generateReference,
  intervalsOverlap,
  startOfUtcDay,
  timeToMinutes,
  toSkipTake,
  utcDayOfWeek,
  type ServiceBookingStatus,
} from '../types/service.types';
import { assertItem } from './serviceItemService';
import type { CreateGenericBookingInput } from '../validators/serviceValidators';

/* ------------------------------------------------------------------ *
 *  Projections
 * ------------------------------------------------------------------ */

export const bookingSelect = {
  id: true,
  bookingNumber: true,
  domain: true,
  status: true,
  itemId: true,
  tableId: true,
  therapistId: true,
  userId: true,
  roomNumber: true,
  bookingDate: true,
  startTime: true,
  durationMinutes: true,
  partySize: true,
  genderPreference: true,
  occasion: true,
  preferences: true,
  notes: true,
  cancelReason: true,
  createdAt: true,
  confirmedAt: true,
  completedAt: true,
  cancelledAt: true,
  item: { select: { id: true, name: true, domain: true, durationMinutes: true } },
  table: {
    select: {
      id: true,
      name: true,
      code: true,
      seats: true,
      room: { select: { id: true, name: true, code: true } },
    },
  },
  therapist: { select: { id: true, firstName: true, lastName: true, gender: true, photo: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.ServiceBookingSelect;

export const bookingDetailSelect = {
  ...bookingSelect,
  updatedAt: true,
  events: {
    select: {
      id: true,
      type: true,
      fromStatus: true,
      toStatus: true,
      message: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.ServiceBookingSelect;

/* ------------------------------------------------------------------ *
 *  Entrées
 * ------------------------------------------------------------------ */

export interface CreateBookingData {
  domain: string;
  bookingDate: Date;
  startTime: string;
  itemId?: number;
  tableId?: number;
  therapistId?: number;
  userId?: number | null;
  roomNumber?: string;
  durationMinutes?: number;
  partySize?: number;
  genderPreference?: string;
  occasion?: string;
  preferences?: string;
  notes?: string;
}

export interface ListBookingsParams {
  domains: readonly string[];
  page: number;
  limit: number;
  status?: ServiceBookingStatus;
  date?: Date;
  from?: Date;
  to?: Date;
  /**
   * Renseigné uniquement si le client demande « mes réservations ».
   * Jamais `null` : un filtre demandé sans utilisateur doit être refusé par le
   * contrôleur, pas transformé en « toutes les réservations ».
   */
  userId?: number;
}

/* ------------------------------------------------------------------ *
 *  Lecture
 * ------------------------------------------------------------------ */

function buildDateFilter(params: {
  date?: Date;
  from?: Date;
  to?: Date;
}): Prisma.DateTimeFilter | undefined {
  if (params.date) {
    return { gte: startOfUtcDay(params.date), lt: endOfUtcDayExclusive(params.date) };
  }
  if (params.from || params.to) {
    return {
      ...(params.from ? { gte: startOfUtcDay(params.from) } : {}),
      ...(params.to ? { lt: endOfUtcDayExclusive(params.to) } : {}),
    };
  }
  return undefined;
}

export async function listBookings(params: ListBookingsParams) {
  const { skip, take } = toSkipTake(params.page, params.limit);
  const bookingDate = buildDateFilter(params);

  const where: Prisma.ServiceBookingWhereInput = {
    domain: { in: [...params.domains] },
    ...(params.status ? { status: params.status } : {}),
    ...(bookingDate ? { bookingDate } : {}),
    ...(params.userId === undefined ? {} : { userId: params.userId }),
  };

  const [total, items] = await prisma.$transaction([
    prisma.serviceBooking.count({ where }),
    prisma.serviceBooking.findMany({
      where,
      select: bookingSelect,
      orderBy: [{ bookingDate: 'desc' }, { startTime: 'asc' }],
      skip,
      take,
    }),
  ]);

  return { items, meta: buildPageMeta(params.page, params.limit, total) };
}

/**
 * `allowedDomains` empêche le routeur SPA de lire une réservation restaurant
 * en changeant simplement l'id dans l'URL.
 */
export async function getBookingById(id: number, allowedDomains?: readonly string[]) {
  const booking = await prisma.serviceBooking.findUnique({
    where: { id },
    select: bookingDetailSelect,
  });
  if (!booking) throw notFound('Réservation introuvable');
  if (allowedDomains && !allowedDomains.includes(booking.domain)) {
    throw notFound('Réservation introuvable');
  }
  return booking;
}

/* ------------------------------------------------------------------ *
 *  Règles de disponibilité (réutilisées par restaurant / spa / générique)
 * ------------------------------------------------------------------ */

/**
 * Toute l'arithmétique de chevauchement se fait en minutes depuis minuit : une
 * réservation qui déborde sur le lendemain rendrait les comparaisons fausses
 * (23:00 + 120 min donnerait [1380, 1500[ face à [30, 150[ le lendemain).
 * On refuse donc explicitement ce cas plutôt que de le calculer à moitié.
 */
export function assertWithinSameDay(startTime: string, durationMinutes: number): number {
  const end = timeToMinutes(startTime) + durationMinutes;
  if (end > MINUTES_PER_DAY) {
    throw unprocessable(
      `Une réservation ne peut pas franchir minuit : ${startTime} + ${durationMinutes} min`,
    );
  }
  return end;
}

/**
 * Verrou consultatif Postgres, relâché à la fin de la transaction.
 * Sans lui, deux requêtes simultanées lisent toutes les deux « créneau libre »
 * puis insèrent toutes les deux : le contrôle de chevauchement ne suffit pas en
 * READ COMMITTED.
 */
export function lockBookingResource(
  db: Prisma.TransactionClient,
  resource: string,
): Promise<number> {
  return db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${resource}))`;
}

/** Renvoie la première réservation active qui chevauche l'intervalle demandé. */
export async function findOverlappingBooking(
  db: Prisma.TransactionClient,
  where: Prisma.ServiceBookingWhereInput,
  startTime: string,
  durationMinutes: number,
  excludeBookingId?: number,
): Promise<{ id: number; bookingNumber: string; startTime: string } | undefined> {
  const start = timeToMinutes(startTime);
  const end = assertWithinSameDay(startTime, durationMinutes);

  const candidates = await db.serviceBooking.findMany({
    where: {
      ...where,
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
      ...(excludeBookingId === undefined ? {} : { id: { not: excludeBookingId } }),
    },
    select: { id: true, bookingNumber: true, startTime: true, durationMinutes: true },
  });

  return candidates.find((candidate) => {
    const candidateStart = timeToMinutes(candidate.startTime);
    const candidateEnd =
      candidateStart + (candidate.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES);
    return intervalsOverlap(start, end, candidateStart, candidateEnd);
  });
}

/**
 * Vérifie que l'horaire demandé tombe dans un créneau d'ouverture et que la
 * capacité de ce créneau n'est pas dépassée.
 * Aucun créneau configuré = aucune contrainte (comportement permissif assumé).
 */
export async function assertSlotAvailability(
  db: Prisma.TransactionClient,
  params: {
    itemId?: number;
    categoryId?: number;
    bookingDate: Date;
    startTime: string;
    durationMinutes: number;
    partySize?: number;
    excludeBookingId?: number;
  },
): Promise<void> {
  const day = utcDayOfWeek(params.bookingDate);
  const slotSelect = {
    id: true,
    startTime: true,
    endTime: true,
    capacity: true,
  } satisfies Prisma.ServiceSlotSelect;

  // Priorité stricte : dès qu'un article a ses propres créneaux, ceux de sa
  // catégorie ne s'appliquent plus (sinon un horaire refusé par l'article
  // passerait par la porte de la catégorie).
  let slots: Array<{ id: number; startTime: string; endTime: string; capacity: number | null }> = [];
  let scope: { itemId?: number; categoryId?: number } = {};

  if (params.itemId !== undefined) {
    slots = await db.serviceSlot.findMany({
      where: { isActive: true, dayOfWeek: day, itemId: params.itemId },
      select: slotSelect,
      orderBy: { startTime: 'asc' },
    });
    if (slots.length > 0) scope = { itemId: params.itemId };
  }
  if (slots.length === 0 && params.categoryId !== undefined) {
    slots = await db.serviceSlot.findMany({
      where: { isActive: true, dayOfWeek: day, categoryId: params.categoryId },
      select: slotSelect,
      orderBy: { startTime: 'asc' },
    });
    if (slots.length > 0) scope = { categoryId: params.categoryId };
  }
  if (slots.length === 0) return;

  const start = timeToMinutes(params.startTime);
  const end = assertWithinSameDay(params.startTime, params.durationMinutes);

  const slot = slots.find(
    (candidate) =>
      start >= timeToMinutes(candidate.startTime) && end <= timeToMinutes(candidate.endTime),
  );
  if (!slot) {
    throw unprocessable(
      `Aucun créneau d'ouverture ne couvre ${params.startTime} pour cette durée`,
      { creneaux: slots.map((item) => `${item.startTime}-${item.endTime}`) },
    );
  }

  if (slot.capacity === null) return;

  // La capacité se compte sur le périmètre du créneau retenu : un créneau de
  // catégorie partagé par plusieurs articles se consomme globalement.
  const sameDay = await db.serviceBooking.findMany({
    where: {
      ...(scope.itemId !== undefined
        ? { itemId: scope.itemId }
        : { item: { categoryId: scope.categoryId } }),
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
      bookingDate: {
        gte: startOfUtcDay(params.bookingDate),
        lt: endOfUtcDayExclusive(params.bookingDate),
      },
      ...(params.excludeBookingId === undefined ? {} : { id: { not: params.excludeBookingId } }),
    },
    select: { startTime: true, durationMinutes: true, partySize: true },
  });

  const used = sameDay
    .filter((booking) => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd =
        bookingStart + (booking.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES);
      return intervalsOverlap(start, end, bookingStart, bookingEnd);
    })
    .reduce((sum, booking) => sum + (booking.partySize ?? 1), 0);

  const requested = params.partySize ?? 1;
  if (used + requested > slot.capacity) {
    throw conflict(
      `Capacité atteinte sur ce créneau : ${used}/${slot.capacity} places déjà réservées`,
    );
  }
}

/* ------------------------------------------------------------------ *
 *  Écriture
 * ------------------------------------------------------------------ */

/**
 * Création « bas niveau » : les règles propres à chaque domaine ont déjà été
 * vérifiées par restaurantService / spaService / createGenericBooking.
 * `db` permet de participer à une transaction existante.
 */
export function createBooking(data: CreateBookingData, db: Prisma.TransactionClient = prisma) {
  return db.serviceBooking.create({
    data: {
      bookingNumber: generateReference('BK'),
      domain: data.domain,
      status: 'PENDING',
      bookingDate: startOfUtcDay(data.bookingDate),
      startTime: data.startTime,
      itemId: data.itemId,
      tableId: data.tableId,
      therapistId: data.therapistId,
      userId: data.userId ?? undefined,
      roomNumber: data.roomNumber,
      durationMinutes: data.durationMinutes,
      partySize: data.partySize,
      genderPreference: data.genderPreference,
      occasion: data.occasion,
      preferences: data.preferences,
      notes: data.notes,
      events: {
        create: {
          type: 'CREATED',
          toStatus: 'PENDING',
          message: 'Réservation créée',
          userId: data.userId ?? undefined,
        },
      },
    },
    select: bookingDetailSelect,
  });
}

function bookingStatusTimestamps(status: ServiceBookingStatus): Prisma.ServiceBookingUpdateInput {
  const now = new Date();
  switch (status) {
    case 'CONFIRMED':
      return { confirmedAt: now };
    case 'COMPLETED':
      return { completedAt: now };
    case 'CANCELLED':
      return { cancelledAt: now };
    default:
      return {};
  }
}

export async function updateBookingStatus(params: {
  id: number;
  status: ServiceBookingStatus;
  userId?: number | null;
  message?: string;
  cancelReason?: string;
  allowedDomains?: readonly string[];
}) {
  const booking = await prisma.serviceBooking.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, domain: true },
  });
  if (!booking) throw notFound('Réservation introuvable');
  if (params.allowedDomains && !params.allowedDomains.includes(booking.domain)) {
    throw notFound('Réservation introuvable');
  }

  const current = booking.status;
  if (current === params.status) {
    throw unprocessable(`La réservation est déjà au statut ${params.status}`);
  }
  if (!canTransition(SERVICE_BOOKING_TRANSITIONS, current, params.status)) {
    throw unprocessable(`Transition ${current} → ${params.status} non autorisée`, {
      statutsPossibles: allowedTransitions(SERVICE_BOOKING_TRANSITIONS, current),
    });
  }

  try {
    // `status: current` rend la transition atomique : deux réceptionnistes qui
    // cliquent en même temps ne peuvent pas appliquer deux fois la transition.
    return await prisma.serviceBooking.update({
      where: { id: params.id, status: current },
      data: {
        status: params.status,
        ...bookingStatusTimestamps(params.status),
        ...(params.status === 'CANCELLED' && params.cancelReason
          ? { cancelReason: params.cancelReason }
          : {}),
        events: {
          create: {
            type: 'STATUS_CHANGED',
            fromStatus: current,
            toStatus: params.status,
            message: params.message ?? params.cancelReason,
            userId: params.userId ?? undefined,
          },
        },
      },
      select: bookingDetailSelect,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw conflict('La réservation vient d\'être modifiée par quelqu\'un d\'autre, recharge-la');
    }
    throw err;
  }
}

/* ------------------------------------------------------------------ *
 *  Domaines génériques (PLAYROOM, POOL, FITNESS, ACTIVITY, CONCIERGERIE)
 * ------------------------------------------------------------------ */

/**
 * Ces domaines n'ont pas d'extension dédiée : la seule règle est la cohérence
 * article/domaine puis la disponibilité du créneau.
 */
export async function createGenericBooking(
  input: CreateGenericBookingInput & { userId: number | null },
) {
  const bookingDate = startOfUtcDay(input.bookingDate);

  return prisma.$transaction(async (tx) => {
    let durationMinutes = input.durationMinutes;
    let categoryId: number | undefined;

    if (input.itemId !== undefined) {
      const item = await assertItem(input.itemId, tx);
      if (item.domain !== input.domain) {
        throw unprocessable(
          `L'article « ${item.name} » appartient au domaine ${item.domain}, pas ${input.domain}`,
        );
      }
      if (!item.isActive || !item.isAvailable || !item.categoryIsActive) {
        throw unprocessable(`L'article « ${item.name} » n'est pas réservable actuellement`);
      }
      durationMinutes = durationMinutes ?? item.durationMinutes ?? undefined;
      categoryId = item.categoryId;
    }

    const effectiveDuration = durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;

    await assertSlotAvailability(tx, {
      itemId: input.itemId,
      categoryId,
      bookingDate,
      startTime: input.startTime,
      durationMinutes: effectiveDuration,
      partySize: input.partySize,
    });

    return createBooking(
      {
        domain: input.domain,
        itemId: input.itemId,
        userId: input.userId,
        roomNumber: input.roomNumber,
        bookingDate,
        startTime: input.startTime,
        durationMinutes: effectiveDuration,
        partySize: input.partySize,
        notes: input.notes,
      },
      tx,
    );
  });
}