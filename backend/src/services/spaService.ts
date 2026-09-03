// src/services/spaService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { conflict, notFound, unprocessable } from '../utils/appError';
import { DEFAULT_BOOKING_DURATION_MINUTES, startOfUtcDay } from '../types/service.types';
import {
  assertSlotAvailability,
  bookingDetailSelect,
  createBooking,
  findOverlappingBooking,
  lockBookingResource,
} from './serviceBookingService';
import type {
  AssignTherapistInput,
  CreateSpaBookingInput,
  CreateTherapistInput,
  CreateTreatmentInput,
  ListTherapistsQuery,
  UpdateTherapistInput,
  UpdateTreatmentInput,
} from '../validators/serviceValidators';

const SPA_DOMAIN = 'SPA';
const NO_PREFERENCE = 'NO_PREFERENCE';

const therapistSelect = {
  id: true,
  firstName: true,
  lastName: true,
  gender: true,
  photo: true,
  isActive: true,
} satisfies Prisma.SpaTherapistSelect;

const treatmentSelect = {
  id: true,
  itemId: true,
  genderPreference: true,
  allowTherapistChoice: true,
  item: {
    select: {
      id: true,
      name: true,
      domain: true,
      price: true,
      durationMinutes: true,
      isActive: true,
      isAvailable: true,
      categoryId: true,
    },
  },
  therapists: { select: { therapistId: true, therapist: { select: therapistSelect } } },
} satisfies Prisma.SpaTreatmentSelect;

/* ------------------------------------------------------------------ *
 *  Thérapeutes
 * ------------------------------------------------------------------ */

export function listTherapists(query: ListTherapistsQuery) {
  return prisma.spaTherapist.findMany({
    where: {
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.gender ? { gender: query.gender } : {}),
      ...(query.treatmentId === undefined
        ? {}
        : { treatments: { some: { treatmentId: query.treatmentId } } }),
    },
    select: therapistSelect,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });
}

async function assertTherapist(
  id: number,
  db: Prisma.TransactionClient = prisma,
): Promise<{ id: number; firstName: string; lastName: string; gender: string; isActive: boolean }> {
  const therapist = await db.spaTherapist.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, gender: true, isActive: true },
  });
  if (!therapist) throw notFound(`Thérapeute ${id} introuvable`);
  return therapist;
}

export function createTherapist(data: CreateTherapistInput) {
  return prisma.spaTherapist.create({ data, select: therapistSelect });
}

export async function updateTherapist(id: number, data: UpdateTherapistInput) {
  await assertTherapist(id);
  return prisma.spaTherapist.update({ where: { id }, data, select: therapistSelect });
}

export async function deactivateTherapist(id: number) {
  await assertTherapist(id);
  return prisma.spaTherapist.update({
    where: { id },
    data: { isActive: false },
    select: therapistSelect,
  });
}

/* ------------------------------------------------------------------ *
 *  Fiches de soin
 * ------------------------------------------------------------------ */

export function listTreatments(includeInactive = false) {
  return prisma.spaTreatment.findMany({
    where: includeInactive ? {} : { item: { isActive: true } },
    select: treatmentSelect,
    orderBy: { id: 'asc' },
  });
}

export async function getTreatmentById(id: number) {
  const treatment = await prisma.spaTreatment.findUnique({
    where: { id },
    select: treatmentSelect,
  });
  if (!treatment) throw notFound('Fiche de soin introuvable');
  return treatment;
}

/** Un thérapeute ne peut être rattaché qu'à un soin dont il respecte la contrainte de genre. */
async function assertTherapistsCompatible(
  db: Prisma.TransactionClient,
  therapistIds: number[],
  genderPreference: string,
): Promise<void> {
  if (therapistIds.length === 0) return;

  const therapists = await db.spaTherapist.findMany({
    where: { id: { in: therapistIds } },
    select: { id: true, firstName: true, lastName: true, gender: true, isActive: true },
  });

  for (const id of therapistIds) {
    const therapist = therapists.find((candidate) => candidate.id === id);
    if (!therapist) throw unprocessable(`Thérapeute ${id} introuvable`);
    if (!therapist.isActive) {
      throw unprocessable(`Le thérapeute ${therapist.firstName} ${therapist.lastName} est inactif`);
    }
    if (genderPreference !== NO_PREFERENCE && therapist.gender !== genderPreference) {
      throw unprocessable(
        `Ce soin est réservé aux thérapeutes ${genderPreference} : ${therapist.firstName} ${therapist.lastName} ne correspond pas`,
      );
    }
  }
}

export async function createTreatment(input: CreateTreatmentInput) {
  const genderPreference = input.genderPreference ?? NO_PREFERENCE;
  const therapistIds = input.therapistIds ?? [];

  return prisma.$transaction(async (tx) => {
    const item = await tx.serviceItem.findUnique({
      where: { id: input.itemId },
      select: {
        id: true,
        name: true,
        domain: true,
        isActive: true,
        spaTreatment: { select: { id: true } },
      },
    });
    if (!item) throw unprocessable(`Article ${input.itemId} introuvable`);
    if (item.domain !== SPA_DOMAIN) {
      throw unprocessable(`L'article « ${item.name} » n'appartient pas au domaine SPA`);
    }
    if (!item.isActive) throw unprocessable(`L'article « ${item.name} » est désactivé`);
    if (item.spaTreatment) {
      throw conflict(`Une fiche de soin existe déjà pour « ${item.name} »`);
    }

    await assertTherapistsCompatible(tx, therapistIds, genderPreference);

    return tx.spaTreatment.create({
      data: {
        itemId: input.itemId,
        genderPreference,
        allowTherapistChoice: input.allowTherapistChoice,
        therapists: { create: therapistIds.map((therapistId) => ({ therapistId })) },
      },
      select: treatmentSelect,
    });
  });
}

export async function updateTreatment(id: number, input: UpdateTreatmentInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.spaTreatment.findUnique({
      where: { id },
      select: { id: true, genderPreference: true },
    });
    if (!current) throw notFound('Fiche de soin introuvable');

    const genderPreference = input.genderPreference ?? current.genderPreference;

    if (input.therapistIds !== undefined) {
      await assertTherapistsCompatible(tx, input.therapistIds, genderPreference);
      // Remplacement complet de la liste, dans la même transaction.
      await tx.spaTreatmentTherapist.deleteMany({ where: { treatmentId: id } });
      if (input.therapistIds.length > 0) {
        await tx.spaTreatmentTherapist.createMany({
          data: input.therapistIds.map((therapistId) => ({ treatmentId: id, therapistId })),
        });
      }
    } else if (input.genderPreference !== undefined) {
      // Changer la contrainte de genre ne doit pas laisser des liens incohérents.
      const links = await tx.spaTreatmentTherapist.findMany({
        where: { treatmentId: id },
        select: { therapistId: true },
      });
      await assertTherapistsCompatible(
        tx,
        links.map((link) => link.therapistId),
        genderPreference,
      );
    }

    return tx.spaTreatment.update({
      where: { id },
      data: {
        ...(input.genderPreference === undefined ? {} : { genderPreference: input.genderPreference }),
        ...(input.allowTherapistChoice === undefined
          ? {}
          : { allowTherapistChoice: input.allowTherapistChoice }),
      },
      select: treatmentSelect,
    });
  });
}

/* ------------------------------------------------------------------ *
 *  Réservations SPA
 * ------------------------------------------------------------------ */

/**
 * Règles vérifiées avant création :
 *  1. l'article est bien un soin SPA disponible et possède une fiche ;
 *  2. le choix du thérapeute n'est accepté que si la fiche l'autorise ;
 *  3. le thérapeute choisi pratique ce soin, est actif et respecte le genre demandé ;
 *  4. il n'est pas déjà occupé sur l'intervalle ;
 *  5. l'horaire tombe dans un créneau d'ouverture.
 * Sans thérapeute demandé, on tente une affectation automatique ; si aucun n'est
 * libre, la réservation reste en PENDING sans thérapeute (le SPA arbitrera).
 */
export async function createSpaBooking(input: CreateSpaBookingInput & { userId: number | null }) {
  const bookingDate = startOfUtcDay(input.bookingDate);

  return prisma.$transaction(async (tx) => {
    // Verrou à la journée : l'affectation automatique parcourt tous les
    // thérapeutes du soin, un verrou par thérapeute ne suffirait pas.
    await lockBookingResource(tx, `spa:${bookingDate.toISOString()}`);

    const treatment = await tx.spaTreatment.findUnique({
      where: { itemId: input.itemId },
      select: treatmentSelect,
    });
    if (!treatment) {
      throw unprocessable("Cet article n'a pas de fiche de soin SPA : réservation impossible");
    }
    if (!treatment.item.isActive || !treatment.item.isAvailable) {
      throw unprocessable(`Le soin « ${treatment.item.name} » n'est pas réservable actuellement`);
    }

    const durationMinutes = treatment.item.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;
    const requested = input.genderPreference ?? NO_PREFERENCE;

    if (
      treatment.genderPreference !== NO_PREFERENCE &&
      requested !== NO_PREFERENCE &&
      requested !== treatment.genderPreference
    ) {
      throw unprocessable(
        `Le soin « ${treatment.item.name} » est réservé aux thérapeutes ${treatment.genderPreference}`,
      );
    }
    const effectiveGender =
      treatment.genderPreference !== NO_PREFERENCE ? treatment.genderPreference : requested;

    let therapistId: number | undefined;

    if (input.therapistId !== undefined) {
      if (!treatment.allowTherapistChoice) {
        throw unprocessable("Le choix du thérapeute n'est pas autorisé pour ce soin");
      }
      const link = treatment.therapists.find(
        (candidate) => candidate.therapistId === input.therapistId,
      );
      if (!link) throw unprocessable('Ce thérapeute ne pratique pas ce soin');
      if (!link.therapist.isActive) throw unprocessable("Ce thérapeute n'est plus disponible");
      if (effectiveGender !== NO_PREFERENCE && link.therapist.gender !== effectiveGender) {
        throw unprocessable(
          `Le thérapeute choisi ne correspond pas à la préférence ${effectiveGender}`,
        );
      }

      const clash = await findOverlappingBooking(
        tx,
        { domain: SPA_DOMAIN, therapistId: input.therapistId, bookingDate },
        input.startTime,
        durationMinutes,
      );
      if (clash) {
        throw conflict(
          `${link.therapist.firstName} ${link.therapist.lastName} est déjà pris sur ce créneau (${clash.bookingNumber} à ${clash.startTime})`,
        );
      }

      therapistId = input.therapistId;
    } else {
      therapistId = await pickAvailableTherapist(tx, {
        candidates: treatment.therapists.map((link) => link.therapist),
        gender: effectiveGender,
        bookingDate,
        startTime: input.startTime,
        durationMinutes,
      });
    }

    await assertSlotAvailability(tx, {
      itemId: input.itemId,
      categoryId: treatment.item.categoryId,
      bookingDate,
      startTime: input.startTime,
      durationMinutes,
      partySize: 1,
    });

    return createBooking(
      {
        domain: SPA_DOMAIN,
        itemId: input.itemId,
        therapistId,
        userId: input.userId,
        roomNumber: input.roomNumber,
        bookingDate,
        startTime: input.startTime,
        durationMinutes,
        partySize: 1,
        genderPreference: effectiveGender,
        notes: input.notes,
      },
      tx,
    );
  });
}

async function pickAvailableTherapist(
  db: Prisma.TransactionClient,
  params: {
    candidates: ReadonlyArray<{ id: number; gender: string; isActive: boolean }>;
    gender: string;
    bookingDate: Date;
    startTime: string;
    durationMinutes: number;
  },
): Promise<number | undefined> {
  const eligible = params.candidates.filter(
    (therapist) =>
      therapist.isActive &&
      (params.gender === NO_PREFERENCE || therapist.gender === params.gender),
  );

  for (const therapist of eligible) {
    const clash = await findOverlappingBooking(
      db,
      { domain: SPA_DOMAIN, therapistId: therapist.id, bookingDate: params.bookingDate },
      params.startTime,
      params.durationMinutes,
    );
    if (!clash) return therapist.id;
  }
  return undefined;
}

/** Affectation manuelle d'un thérapeute depuis le back-office. */
export async function assignTherapist(
  bookingId: number,
  input: AssignTherapistInput,
  userId: number | null,
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.serviceBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        domain: true,
        status: true,
        itemId: true,
        bookingDate: true,
        startTime: true,
        durationMinutes: true,
        genderPreference: true,
      },
    });
    if (!booking || booking.domain !== SPA_DOMAIN) throw notFound('Réservation SPA introuvable');
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      throw unprocessable(`Impossible d'affecter un thérapeute sur une réservation ${booking.status}`);
    }

    const therapist = await assertTherapist(input.therapistId, tx);
    if (!therapist.isActive) throw unprocessable("Ce thérapeute n'est plus disponible");

    // La contrainte de genre vérifiée à la création doit aussi tenir ici.
    if (
      booking.genderPreference !== null &&
      booking.genderPreference !== NO_PREFERENCE &&
      therapist.gender !== booking.genderPreference
    ) {
      throw unprocessable(
        `Cette réservation exige un thérapeute ${booking.genderPreference} : ${therapist.firstName} ${therapist.lastName} ne correspond pas`,
      );
    }

    if (booking.itemId !== null) {
      const link = await tx.spaTreatmentTherapist.findFirst({
        where: { therapistId: input.therapistId, treatment: { itemId: booking.itemId } },
        select: { id: true },
      });
      if (!link) throw unprocessable('Ce thérapeute ne pratique pas ce soin');
    }

    const durationMinutes = booking.durationMinutes ?? DEFAULT_BOOKING_DURATION_MINUTES;
    const clash = await findOverlappingBooking(
      tx,
      {
        domain: SPA_DOMAIN,
        therapistId: input.therapistId,
        bookingDate: startOfUtcDay(booking.bookingDate),
      },
      booking.startTime,
      durationMinutes,
      booking.id,
    );
    if (clash) {
      throw conflict(
        `${therapist.firstName} ${therapist.lastName} est déjà pris sur ce créneau (${clash.bookingNumber} à ${clash.startTime})`,
      );
    }

    return tx.serviceBooking.update({
      where: { id: bookingId },
      data: {
        therapistId: input.therapistId,
        events: {
          create: {
            type: 'THERAPIST_ASSIGNED',
            message:
              input.message ?? `Thérapeute affecté : ${therapist.firstName} ${therapist.lastName}`,
            userId: userId ?? undefined,
          },
        },
      },
      select: bookingDetailSelect,
    });
  });
}