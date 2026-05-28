import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateLocationInput = {
  name: string;
  type: string;
  parentId?: number;
  hotelId?: number;
  code?: string;
  isActive?: boolean;
};

export type UpdateLocationInput = Partial<CreateLocationInput>;

export const createLocation = async (
  data: CreateLocationInput
) => {
  return prisma.location.create({
    data: {
      name: data.name,
      type: data.type,
      parentId: data.parentId,
      hotelId: data.hotelId,
      code: data.code,
      isActive: data.isActive ?? true,
    },
    include: {
      parent: true,
      children: true,
    },
  });
};

export const listLocations = async () => {
  return prisma.location.findMany({
    include: {
      parent: true,
      children: true,
    },
    orderBy: {
      id: 'desc',
    },
  });
};

export const getLocationById = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      tickets: true,
    },
  });

  if (!location) {
    throw Object.assign(
      new Error('Location introuvable'),
      { statusCode: 404 }
    );
  }

  return location;
};

export const updateLocation = async (
  id: number,
  data: UpdateLocationInput
) => {
  await getLocationById(id);

  return prisma.location.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      parentId: data.parentId,
      hotelId: data.hotelId,
      code: data.code,
      isActive: data.isActive,
    },
    include: {
      parent: true,
      children: true,
    },
  });
};

export const deleteLocation = async (id: number) => {
  await getLocationById(id);

  return prisma.location.delete({
    where: { id },
  });
};