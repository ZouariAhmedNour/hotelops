// src/services/serviceItemService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { conflict, notFound, unprocessable } from '../utils/appError';
import {
  buildPageMeta,
  intervalsOverlap,
  timeToMinutes,
  toSkipTake,
} from '../types/service.types';
import type {
  CreateItemInput,
  CreateOptionInput,
  CreateSlotInput,
  CreateSupplementInput,
  ListItemsQuery,
  ListSlotsQuery,
  UpdateItemInput,
  UpdateOptionInput,
  UpdateSlotInput,
  UpdateSupplementInput,
} from '../validators/serviceValidators';

const itemSelect = {
  id: true,
  categoryId: true,
  domain: true,
  name: true,
  description: true,
  photos: true,
  price: true,
  priceMin: true,
  priceMax: true,
  durationMinutes: true,
  prepTimeMinutes: true,
  allergens: true,
  isAvailable: true,
  isActive: true,
  sortOrder: true,
  category: { select: { id: true, name: true, code: true, domain: true } },
  options: {
    where: { isActive: true },
    select: { id: true, name: true, priceDelta: true },
    orderBy: { name: 'asc' },
  },
  supplements: {
    where: { isActive: true },
    select: { id: true, name: true, price: true },
    orderBy: { name: 'asc' },
  },
} satisfies Prisma.ServiceItemSelect;

/** Vérifie l'existence d'un article et renvoie ce qui sert aux règles métier. */
export async function assertItem(
  id: number,
  db: Prisma.TransactionClient = prisma,
): Promise<{
  id: number;
  name: string;
  domain: string;
  categoryId: number;
  isActive: boolean;
  isAvailable: boolean;
  durationMinutes: number | null;
  categoryIsActive: boolean;
}> {
  const item = await db.serviceItem.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      domain: true,
      categoryId: true,
      isActive: true,
      isAvailable: true,
      durationMinutes: true,
      category: { select: { isActive: true } },
    },
  });
  if (!item) throw notFound(`Article ${id} introuvable`);
  const { category, ...rest } = item;
  return { ...rest, categoryIsActive: category.isActive };
}

export async function listItems(query: ListItemsQuery) {
  const { skip, take } = toSkipTake(query.page, query.limit);

  const where: Prisma.ServiceItemWhereInput = {
    // Un article actif dans une catégorie désactivée ne doit pas remonter côté client.
    ...(query.includeInactive ? {} : { isActive: true, category: { isActive: true } }),
    ...(query.domain ? { domain: query.domain } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isAvailable === undefined ? {} : { isAvailable: query.isAvailable }),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.serviceItem.count({ where }),
    prisma.serviceItem.findMany({
      where,
      select: itemSelect,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take,
    }),
  ]);

  return { items, meta: buildPageMeta(query.page, query.limit, total) };
}

export async function getItemById(id: number, staffView = false) {
  const item = await prisma.serviceItem.findFirst({
    where: { id, ...(staffView ? {} : { isActive: true, category: { isActive: true } }) },
    select: {
      ...itemSelect,
      slots: {
        where: { isActive: true },
        select: { id: true, dayOfWeek: true, startTime: true, endTime: true, capacity: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
      spaTreatment: {
        select: {
          id: true,
          genderPreference: true,
          allowTherapistChoice: true,
          therapists: {
            select: {
              therapist: {
                select: { id: true, firstName: true, lastName: true, gender: true, photo: true },
              },
            },
          },
        },
      },
      restaurantTable: {
        select: {
          id: true,
          name: true,
          code: true,
          seats: true,
          room: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
  if (!item) throw notFound('Article introuvable');
  return item;
}

export async function createItem(input: CreateItemInput) {
  // `domain` n'est jamais fourni par le client : il est dérivé de la catégorie.
  const category = await prisma.serviceCategory.findUnique({
    where: { id: input.categoryId },
    select: { id: true, domain: true, isActive: true },
  });
  if (!category) throw unprocessable(`Catégorie ${input.categoryId} introuvable`);
  if (!category.isActive) throw unprocessable('Cette catégorie est désactivée');

  return prisma.serviceItem.create({
    data: { ...input, domain: category.domain },
    select: itemSelect,
  });
}

export async function updateItem(id: number, input: UpdateItemInput) {
  const current = await assertItem(id);

  let domain: string | undefined;
  if (input.categoryId !== undefined && input.categoryId !== current.categoryId) {
    const category = await prisma.serviceCategory.findUnique({
      where: { id: input.categoryId },
      select: { id: true, domain: true, isActive: true },
    });
    if (!category) throw unprocessable(`Catégorie ${input.categoryId} introuvable`);
    if (!category.isActive) throw unprocessable('Cette catégorie est désactivée');

    // Changer de domaine sous une extension existante casserait les invariants
    // vérifiés à la création de la fiche de soin / de la table.
    if (category.domain !== current.domain) {
      const extensions = await prisma.serviceItem.findUnique({
        where: { id },
        select: {
          spaTreatment: { select: { id: true } },
          restaurantTable: { select: { id: true } },
        },
      });
      if (extensions?.spaTreatment || extensions?.restaurantTable) {
        throw conflict(
          "Cet article porte une extension SPA ou restaurant : son domaine ne peut plus changer",
        );
      }
    }

    domain = category.domain;
  }

  return prisma.serviceItem.update({
    where: { id },
    data: { ...input, ...(domain === undefined ? {} : { domain }) },
    select: itemSelect,
  });
}

export async function deactivateItem(id: number) {
  const item = await assertItem(id);
  if (!item.isActive) throw unprocessable('Cet article est déjà désactivé');
  return prisma.serviceItem.update({
    where: { id },
    data: { isActive: false },
    select: itemSelect,
  });
}

/* ------------------------------------------------------------------ *
 *  Options
 * ------------------------------------------------------------------ */

export async function addOption(input: CreateOptionInput) {
  const item = await assertItem(input.itemId);
  if (!item.isActive) throw unprocessable(`L'article « ${item.name} » est désactivé`);
  return prisma.serviceItemOption.create({ data: input });
}

export async function updateOption(id: number, data: UpdateOptionInput) {
  const option = await prisma.serviceItemOption.findUnique({ where: { id }, select: { id: true } });
  if (!option) throw notFound('Option introuvable');
  return prisma.serviceItemOption.update({ where: { id }, data });
}

export async function removeOption(id: number) {
  const option = await prisma.serviceItemOption.findUnique({ where: { id }, select: { id: true } });
  if (!option) throw notFound('Option introuvable');
  // Désactivation : les lignes de commande déjà passées gardent la référence.
  return prisma.serviceItemOption.update({ where: { id }, data: { isActive: false } });
}

/* ------------------------------------------------------------------ *
 *  Suppléments
 * ------------------------------------------------------------------ */

export async function addSupplement(input: CreateSupplementInput) {
  const item = await assertItem(input.itemId);
  if (!item.isActive) throw unprocessable(`L'article « ${item.name} » est désactivé`);
  return prisma.serviceItemSupplement.create({ data: input });
}

export async function updateSupplement(id: number, data: UpdateSupplementInput) {
  const supplement = await prisma.serviceItemSupplement.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!supplement) throw notFound('Supplément introuvable');
  return prisma.serviceItemSupplement.update({ where: { id }, data });
}

export async function removeSupplement(id: number) {
  const supplement = await prisma.serviceItemSupplement.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!supplement) throw notFound('Supplément introuvable');
  return prisma.serviceItemSupplement.update({ where: { id }, data: { isActive: false } });
}

/* ------------------------------------------------------------------ *
 *  Créneaux
 * ------------------------------------------------------------------ */

function slotTargetWhere(itemId?: number, categoryId?: number): Prisma.ServiceSlotWhereInput {
  if (itemId !== undefined) return { itemId };
  if (categoryId !== undefined) return { categoryId };
  throw unprocessable('Un créneau doit cibler soit un article, soit une catégorie');
}

/** Deux créneaux du même jour, sur la même cible, ne doivent pas se chevaucher. */
async function assertNoSlotOverlap(params: {
  itemId?: number;
  categoryId?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  excludeId?: number;
}): Promise<void> {
  const siblings = await prisma.serviceSlot.findMany({
    where: {
      ...slotTargetWhere(params.itemId, params.categoryId),
      dayOfWeek: params.dayOfWeek,
      isActive: true,
      ...(params.excludeId === undefined ? {} : { id: { not: params.excludeId } }),
    },
    select: { startTime: true, endTime: true },
  });

  const start = timeToMinutes(params.startTime);
  const end = timeToMinutes(params.endTime);
  const clash = siblings.find((slot) =>
    intervalsOverlap(start, end, timeToMinutes(slot.startTime), timeToMinutes(slot.endTime)),
  );
  if (clash) {
    throw conflict(
      `Un créneau existe déjà ce jour-là de ${clash.startTime} à ${clash.endTime}`,
    );
  }
}

export function listSlots(query: ListSlotsQuery) {
  return prisma.serviceSlot.findMany({
    where: {
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.itemId === undefined ? {} : { itemId: query.itemId }),
      ...(query.categoryId === undefined ? {} : { categoryId: query.categoryId }),
      ...(query.dayOfWeek === undefined ? {} : { dayOfWeek: query.dayOfWeek }),
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

export async function addSlot(input: CreateSlotInput) {
  if (input.itemId !== undefined) {
    await assertItem(input.itemId);
  } else if (input.categoryId !== undefined) {
    const category = await prisma.serviceCategory.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) throw unprocessable(`Catégorie ${input.categoryId} introuvable`);
  }

  await assertNoSlotOverlap({
    itemId: input.itemId,
    categoryId: input.categoryId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  return prisma.serviceSlot.create({ data: input });
}

export async function updateSlot(id: number, input: UpdateSlotInput) {
  const current = await prisma.serviceSlot.findUnique({ where: { id } });
  if (!current) throw notFound('Créneau introuvable');

  // On revalide sur les valeurs fusionnées : une mise à jour partielle
  // ne peut pas être vérifiée sur le seul payload.
  const dayOfWeek = input.dayOfWeek ?? current.dayOfWeek;
  const startTime = input.startTime ?? current.startTime;
  const endTime = input.endTime ?? current.endTime;
  if (startTime >= endTime) {
    throw unprocessable('endTime doit être postérieur à startTime');
  }

  if (input.isActive !== false) {
    await assertNoSlotOverlap({
      itemId: current.itemId ?? undefined,
      categoryId: current.categoryId ?? undefined,
      dayOfWeek,
      startTime,
      endTime,
      excludeId: id,
    });
  }

  return prisma.serviceSlot.update({ where: { id }, data: input });
}

export async function removeSlot(id: number) {
  const slot = await prisma.serviceSlot.findUnique({ where: { id }, select: { id: true } });
  if (!slot) throw notFound('Créneau introuvable');
  return prisma.serviceSlot.delete({ where: { id } });
}

export async function addPhoto(id: number, url: string) {
  const item = await prisma.serviceItem.findUnique({ where: { id }, select: { id: true } });
  if (!item) throw notFound('Article introuvable');

  return prisma.serviceItem.update({
    where: { id },
    data: { photos: { push: url } },
    select: { id: true, name: true, photos: true },
  });
}

export async function removePhoto(id: number, url: string) {
  const item = await prisma.serviceItem.findUnique({
    where: { id },
    select: { photos: true },
  });
  if (!item) throw notFound('Article introuvable');

  return prisma.serviceItem.update({
    where: { id },
    data: { photos: item.photos.filter((p) => p !== url) },
    select: { id: true, name: true, photos: true },
  });
}