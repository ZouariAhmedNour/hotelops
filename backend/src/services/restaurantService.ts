// src/services/restaurantService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { conflict, notFound, unprocessable } from '../utils/appError';
import {
  ACTIVE_BOOKING_STATUSES,
  DEFAULT_BOOKING_DURATION_MINUTES,
  intervalsOverlap,
  startOfUtcDay,
  timeToMinutes,
  utcDayOfWeek,
} from '../types/service.types';
import {
  assertSlotAvailability,
  assertWithinSameDay,
  createBooking,
  findOverlappingBooking,
  lockBookingResource,
} from './serviceBookingService';
import type {
  CreateRestaurantBookingInput,
  CreateRoomInput,
  CreateTableInput,
  ListTablesQuery,
  UpdateRoomInput,
  UpdateTableInput,
} from '../validators/serviceValidators';

const RESTAURANT_DOMAIN = 'RESTAURANT';

const roomSelect = {
  id: true,
  name: true,
  code: true,
  type: true,
  capacity: true,
  isActive: true,
} satisfies Prisma.RestaurantRoomSelect;

const tableSelect = {
  id: true,
  roomId: true,
  itemId: true,
  name: true,
  code: true,
  seats: true,
  isActive: true,
  room: { select: { id: true, name: true, code: true, isActive: true } },
  item: { select: { id: true, name: true, price: true } },
} satisfies Prisma.RestaurantTableSelect;

/* ------------------------------------------------------------------ *
 *  Salles
 * ------------------------------------------------------------------ */

export function listRooms(includeInactive = false) {
  return prisma.restaurantRoom.findMany({
    where: includeInactive ? {} : { isActive: true },
    select: { ...roomSelect, _count: { select: { tables: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getRoomById(id: number) {
  const room = await prisma.restaurantRoom.findUnique({
    where: { id },
    select: {
      ...roomSelect,
      tables: {
        where: { isActive: true },
        select: { id: true, name: true, code: true, seats: true, itemId: true },
        orderBy: { name: 'asc' },
      },
    },
  });
  if (!room) throw notFound('Salle introuvable');
  return room;
}

export function createRoom(data: CreateRoomInput) {
  return prisma.restaurantRoom.create({ data, select: roomSelect });
}

export async function updateRoom(id: number, data: UpdateRoomInput) {
  await assertRoom(id);
  return prisma.restaurantRoom.update({ where: { id }, data, select: roomSelect });
}

export async function deactivateRoom(id: number) {
  const room = await assertRoom(id);
  if (!room.isActive) throw unprocessable('Cette salle est déjà désactivée');
  // Une salle fermée entraîne ses tables : sinon on peut encore réserver dedans.
  return prisma.$transaction(async (tx) => {
    await tx.restaurantTable.updateMany({ where: { roomId: id }, data: { isActive: false } });
    return tx.restaurantRoom.update({ where: { id }, data: { isActive: false }, select: roomSelect });
  });
}

async function assertRoom(
  id: number,
  db: Prisma.TransactionClient = prisma,
): Promise<{ id: number; name: string; isActive: boolean }> {
  const room = await db.restaurantRoom.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true },
  });
  if (!room) throw notFound(`Salle ${id} introuvable`);
  return room;
}

/* ------------------------------------------------------------------ *
 *  Tables
 * ------------------------------------------------------------------ */

export function listTables(query: ListTablesQuery) {
  return prisma.restaurantTable.findMany({
    where: {
      ...(query.includeInactive ? {} : { isActive: true, room: { isActive: true } }),
      ...(query.roomId === undefined ? {} : { roomId: query.roomId }),
      ...(query.minSeats === undefined ? {} : { seats: { gte: query.minSeats } }),
    },
    select: tableSelect,
    orderBy: [{ roomId: 'asc' }, { name: 'asc' }],
  });
}

/** Le lien table ↔ article est 1-1 (itemId @unique) : on vérifie les deux bouts. */
async function assertLinkableItem(itemId: number, db: Prisma.TransactionClient): Promise<void> {
  const item = await db.serviceItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, domain: true, restaurantTable: { select: { id: true } } },
  });
  if (!item) throw unprocessable(`Article ${itemId} introuvable`);
  if (item.domain !== RESTAURANT_DOMAIN) {
    throw unprocessable(`L'article « ${item.name} » n'appartient pas au domaine RESTAURANT`);
  }
  if (item.restaurantTable) {
    throw conflict(`L'article « ${item.name} » est déjà rattaché à une autre table`);
  }
}

export async function createTable(input: CreateTableInput) {
  return prisma.$transaction(async (tx) => {
    const room = await assertRoom(input.roomId, tx);
    if (!room.isActive) throw unprocessable(`La salle « ${room.name} » est désactivée`);
    if (input.itemId !== undefined) await assertLinkableItem(input.itemId, tx);
    return tx.restaurantTable.create({ data: input, select: tableSelect });
  });
}

export async function updateTable(id: number, input: UpdateTableInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.restaurantTable.findUnique({
      where: { id },
      select: { id: true, itemId: true, roomId: true },
    });
    if (!current) throw notFound('Table introuvable');

    if (input.roomId !== undefined && input.roomId !== current.roomId) {
      const room = await assertRoom(input.roomId, tx);
      if (!room.isActive) throw unprocessable(`La salle « ${room.name} » est désactivée`);
    }
    // `null` = détacher la table de son article : rien à vérifier.
    if (input.itemId != null && input.itemId !== current.itemId) {
      await assertLinkableItem(input.itemId, tx);
    }

    return tx.restaurantTable.update({ where: { id }, data: input, select: tableSelect });
  });
}

export async function deactivateTable(id: number) {
  const table = await prisma.restaurantTable.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });
  if (!table) throw notFound('Table introuvable');
  if (!table.isActive) throw unprocessable('Cette table est déjà désactivée');
  return prisma.restaurantTable.update({
    where: { id },
    data: { isActive: false },
    select: tableSelect,
  });
}

/* ------------------------------------------------------------------ *
 *  Réservations restaurant
 * ------------------------------------------------------------------ */

/**
 * Les horaires d'ouverture du restaurant sont portés par les créneaux des
 * catégories du domaine RESTAURANT. Le rattachement table ↔ article étant
 * facultatif, on ne peut pas s'appuyer sur lui pour vérifier l'ouverture :
 * sinon une réservation à 04:00 sur une table sans article passerait.
 * Aucun créneau configuré = aucune contrainte (permissif assumé).
 */
async function assertRestaurantOpen(
  db: Prisma.TransactionClient,
  bookingDate: Date,
  startTime: string,
  durationMinutes: number,
): Promise<void> {
  const slots = await db.serviceSlot.findMany({
    where: {
      isActive: true,
      dayOfWeek: utcDayOfWeek(bookingDate),
      category: { domain: RESTAURANT_DOMAIN, isActive: true },
    },
    select: { startTime: true, endTime: true },
    orderBy: { startTime: 'asc' },
  });
  if (slots.length === 0) return;

  const start = timeToMinutes(startTime);
  const end = assertWithinSameDay(startTime, durationMinutes);
  const isOpen = slots.some(
    (slot) => start >= timeToMinutes(slot.startTime) && end <= timeToMinutes(slot.endTime),
  );
  if (!isOpen) {
    throw unprocessable(`Le restaurant n'est pas ouvert à ${startTime} sur cette durée`, {
      services: slots.map((slot) => `${slot.startTime}-${slot.endTime}`),
    });
  }
}

/**
 * Règles vérifiées avant création :
 *  1. la table existe, est active, dans une salle active ;
 *  2. elle a assez de couverts pour le nombre de convives ;
 *  3. aucune réservation active ne chevauche l'intervalle demandé ;
 *  4. l'horaire tombe dans les horaires d'ouverture du restaurant ;
 *  5. si la table est rattachée à un article, ses créneaux et sa capacité.
 */
export async function createRestaurantBooking(
  input: CreateRestaurantBookingInput & { userId: number | null },
) {
  const bookingDate = startOfUtcDay(input.bookingDate);
  const durationMinutes = input.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;

  return prisma.$transaction(async (tx) => {
    let itemId: number | undefined;
    let categoryId: number | undefined;

    if (input.tableId !== undefined) {
      // Verrou d'abord : sans lui, deux demandes simultanées sur la même table
      // passeraient toutes les deux le contrôle de chevauchement ci-dessous.
      await lockBookingResource(
        tx,
        `restaurant:table:${input.tableId}:${bookingDate.toISOString()}`,
      );

      const table = await tx.restaurantTable.findUnique({
        where: { id: input.tableId },
        select: {
          id: true,
          name: true,
          seats: true,
          isActive: true,
          itemId: true,
          item: { select: { id: true, categoryId: true } },
          room: { select: { name: true, isActive: true } },
        },
      });
      if (!table) throw unprocessable(`Table ${input.tableId} introuvable`);
      if (!table.isActive || !table.room.isActive) {
        throw unprocessable(`La table « ${table.name} » n'est pas disponible`);
      }
      if (table.seats < input.partySize) {
        throw unprocessable(
          `La table « ${table.name} » n'accueille que ${table.seats} couverts pour ${input.partySize} convives`,
        );
      }

      const clash = await findOverlappingBooking(
        tx,
        { domain: RESTAURANT_DOMAIN, tableId: input.tableId, bookingDate },
        input.startTime,
        durationMinutes,
      );
      if (clash) {
        throw conflict(
          `La table « ${table.name} » est déjà réservée sur ce créneau (${clash.bookingNumber} à ${clash.startTime})`,
        );
      }

      itemId = table.itemId ?? undefined;
      categoryId = table.item?.categoryId;
    }

    await assertRestaurantOpen(tx, bookingDate, input.startTime, durationMinutes);

    if (itemId !== undefined) {
      await assertSlotAvailability(tx, {
        itemId,
        categoryId,
        bookingDate,
        startTime: input.startTime,
        durationMinutes,
        partySize: input.partySize,
      });
    }

    return createBooking(
      {
        domain: RESTAURANT_DOMAIN,
        itemId,
        tableId: input.tableId,
        userId: input.userId,
        roomNumber: input.roomNumber,
        bookingDate,
        startTime: input.startTime,
        durationMinutes,
        partySize: input.partySize,
        occasion: input.occasion,
        preferences: input.preferences,
        notes: input.notes,
      },
      tx,
    );
  });
}

/** Tables libres pour un créneau donné : utile à l'écran de réservation du back-office. */
export async function findAvailableTables(params: {
  bookingDate: Date;
  startTime: string;
  partySize: number;
  durationMinutes?: number;
  roomId?: number;
}) {
  const bookingDate = startOfUtcDay(params.bookingDate);
  const durationMinutes = params.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;
  const start = timeToMinutes(params.startTime);
  const end = assertWithinSameDay(params.startTime, durationMinutes);

  // Même contrôle qu'à la création : sinon l'écran proposerait des tables
  // « libres » sur un horaire que la création refusera ensuite.
  await assertRestaurantOpen(prisma, bookingDate, params.startTime, durationMinutes);

  const tables = await prisma.restaurantTable.findMany({
    where: {
      isActive: true,
      room: { isActive: true },
      seats: { gte: params.partySize },
      ...(params.roomId === undefined ? {} : { roomId: params.roomId }),
    },
    select: tableSelect,
    orderBy: [{ seats: 'asc' }, { name: 'asc' }],
  });
  if (tables.length === 0) return tables;

  // Une seule requête pour toutes les tables (au lieu d'une par table).
  const clashes = await prisma.serviceBooking.findMany({
    where: {
      domain: RESTAURANT_DOMAIN,
      bookingDate,
      tableId: { in: tables.map((table) => table.id) },
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
    select: { tableId: true, startTime: true, durationMinutes: true },
  });

  const busy = new Set<number>();
  for (const booking of clashes) {
    if (booking.tableId === null) continue;
    const bookingStart = timeToMinutes(booking.startTime);
    const bookingEnd =
      bookingStart + (booking.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES);
    if (intervalsOverlap(start, end, bookingStart, bookingEnd)) busy.add(booking.tableId);
  }

  return tables.filter((table) => !busy.has(table.id));
}