// src/services/serviceCategoryService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { notFound, unprocessable } from '../utils/appError';
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from '../validators/serviceValidators';

const categorySelect = {
  id: true,
  name: true,
  code: true,
  domain: true,
  icon: true,
  description: true,
  sortOrder: true,
  isActive: true,
} satisfies Prisma.ServiceCategorySelect;

/** Vérifie l'existence d'une catégorie et renvoie son domaine (source de vérité). */
export async function assertCategory(
  id: number,
  db: Prisma.TransactionClient = prisma,
): Promise<{ id: number; domain: string; isActive: boolean }> {
  const category = await db.serviceCategory.findUnique({
    where: { id },
    select: { id: true, domain: true, isActive: true },
  });
  if (!category) throw notFound(`Catégorie ${id} introuvable`);
  return category;
}

export function listCategories(query: ListCategoriesQuery) {
  return prisma.serviceCategory.findMany({
    where: {
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.domain ? { domain: query.domain } : {}),
    },
    select: {
      ...categorySelect,
      _count: { select: { items: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function getCategoryById(id: number, staffView = false) {
  const category = await prisma.serviceCategory.findFirst({
    where: { id, ...(staffView ? {} : { isActive: true }) },
    select: {
      ...categorySelect,
      items: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          priceMin: true,
          priceMax: true,
          durationMinutes: true,
          isAvailable: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      },
      slots: {
        where: { isActive: true },
        select: { id: true, dayOfWeek: true, startTime: true, endTime: true, capacity: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  });
  if (!category) throw notFound('Catégorie introuvable');
  return category;
}

export function createCategory(data: CreateCategoryInput) {
  return prisma.serviceCategory.create({ data, select: categorySelect });
}

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  await assertCategory(id);
  return prisma.serviceCategory.update({ where: { id }, data, select: categorySelect });
}

/**
 * Désactivation logique : on ne supprime jamais une catégorie référencée
 * par des articles, eux-mêmes référencés par des commandes.
 */
export async function deactivateCategory(id: number) {
  const category = await assertCategory(id);
  if (!category.isActive) {
    throw unprocessable('Cette catégorie est déjà désactivée');
  }
  return prisma.serviceCategory.update({
    where: { id },
    data: { isActive: false },
    select: categorySelect,
  });
}

export async function reactivateCategory(id: number) {
  await assertCategory(id);
  return prisma.serviceCategory.update({
    where: { id },
    data: { isActive: true },
    select: categorySelect,
  });
}