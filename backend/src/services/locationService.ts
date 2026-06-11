import { prisma } from "../config/prisma";

export type CreateLocationInput = {
  name: string;
  code: string;
  type: string;
  zone?: string;
  floor?: string;
  roomNumber?: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateLocationInput = Partial<CreateLocationInput>;

export const createLocation = async (data: CreateLocationInput) => {
  return prisma.location.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type,
      zone: data.zone,
      floor: data.floor,
      roomNumber: data.roomNumber,
      description: data.description,
      isActive: data.isActive ?? true,
    },
    include: {
      qrCodes: true,
      _count: {
        select: {
          tickets: true,
          qrCodes: true,
        },
      },
    },
  });
};

export const listLocations = async () => {
  return prisma.location.findMany({
    orderBy: [
      { floor: "asc" },
      { type: "asc" },
      { name: "asc" },
    ],
    include: {
      qrCodes: {
        where: {
          isActive: true,
        },
      },
      _count: {
        select: {
          tickets: true,
          qrCodes: true,
        },
      },
    },
  });
};

export const getLocationById = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      qrCodes: {
        orderBy: {
          createdAt: "desc",
        },
      },
      tickets: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          priority: true,
          status: true,
          publicReporter: true,
        },
      },
      _count: {
        select: {
          tickets: true,
          qrCodes: true,
        },
      },
    },
  });

  if (!location) {
    throw Object.assign(new Error("Endroit introuvable"), {
      statusCode: 404,
    });
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
      code: data.code,
      type: data.type,
      zone: data.zone,
      floor: data.floor,
      roomNumber: data.roomNumber,
      description: data.description,
      isActive: data.isActive,
    },
    include: {
      qrCodes: true,
      _count: {
        select: {
          tickets: true,
          qrCodes: true,
        },
      },
    },
  });
};

export const deleteLocation = async (id: number) => {
  const location = await getLocationById(id);

  if (location._count.tickets > 0) {
    throw Object.assign(
      new Error("Impossible de supprimer cet endroit car il possède des tickets."),
      { statusCode: 400 }
    );
  }

  if (location._count.qrCodes > 0) {
    throw Object.assign(
      new Error("Impossible de supprimer cet endroit car il possède des codes QR."),
      { statusCode: 400 }
    );
  }

  return prisma.location.delete({
    where: { id },
  });
};