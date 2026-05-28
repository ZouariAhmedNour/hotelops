import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type CreatePriorityInput = {
  name: string;
  code: string;
  sortOrder?: number;
  slaHours?: number;
};

export type UpdatePriorityInput =
  Partial<CreatePriorityInput>;

export const createPriority = async (
  data: CreatePriorityInput
) => {
  return prisma.maintenancePriority.create({
    data: {
      name: data.name,
      code: data.code,
      sortOrder: data.sortOrder ?? 0,
      slaHours: data.slaHours,
    },
  });
};

export const listPriorities = async () => {
  return prisma.maintenancePriority.findMany({
    include: {
      tickets: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });
};

export const getPriorityById = async (
  id: number
) => {
  const priority =
    await prisma.maintenancePriority.findUnique({
      where: { id },

      include: {
        tickets: true,
      },
    });

  if (!priority) {
    throw Object.assign(
      new Error('Priorité introuvable'),
      { statusCode: 404 }
    );
  }

  return priority;
};

export const updatePriority = async (
  id: number,
  data: UpdatePriorityInput
) => {
  await getPriorityById(id);

  return prisma.maintenancePriority.update({
    where: { id },

    data: {
      name: data.name,
      code: data.code,
      sortOrder: data.sortOrder,
      slaHours: data.slaHours,
    },
  });
};

export const deletePriority = async (
  id: number
) => {
  await getPriorityById(id);

  return prisma.maintenancePriority.delete({
    where: { id },
  });
};