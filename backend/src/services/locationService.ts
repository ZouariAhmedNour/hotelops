import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";

export type LocationAssetInput = {
  assetId: number;
  quantity?: number;
  label?: string;
  notes?: string;
  isActive?: boolean;
};

export type CreateLocationInput = {
  name: string;
  code: string;
  type: string;
  zone?: string;
  floor?: string;
  roomNumber?: string;
  description?: string;
  isActive?: boolean;
  assets?: LocationAssetInput[];
};

export type UpdateLocationInput = Partial<CreateLocationInput>;

const locationSummaryInclude = {
  qrCodes: {
    where: {
      isActive: true,
    },
    select: {
      id: true,
      token: true,
      label: true,
      isActive: true,
      scanCount: true,
      createdAt: true,
    },
  },
  locationAssets: {
    where: {
      isActive: true,
      asset: {
        isActive: true,
      },
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  _count: {
    select: {
      tickets: true,
      qrCodes: true,
      locationAssets: true,
    },
  },
} satisfies Prisma.LocationInclude;

const locationDetailInclude = {
  qrCodes: {
    orderBy: {
      createdAt: "desc",
    },
  },
  locationAssets: {
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "asc",
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
      ticketAssets: {
        include: {
          asset: true,
        },
      },
    },
  },
  _count: {
    select: {
      tickets: true,
      qrCodes: true,
      locationAssets: true,
    },
  },
} satisfies Prisma.LocationInclude;

const optionalText = (value?: string) => {
  const normalized = value?.trim();

  return normalized ? normalized : null;
};

const normalizeLocationAssets = async (
  assets: LocationAssetInput[] = []
) => {
  const assetIds = assets.map((item) => item.assetId);

  const uniqueAssetIds = [...new Set(assetIds)];

  if (uniqueAssetIds.length !== assetIds.length) {
    throw Object.assign(
      new Error("Un même équipement ne peut être ajouté qu’une seule fois."),
      {
        statusCode: 400,
      }
    );
  }

  if (uniqueAssetIds.length === 0) {
    return [];
  }

  const activeAssets = await prisma.maintenanceAsset.findMany({
    where: {
      id: {
        in: uniqueAssetIds,
      },
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (activeAssets.length !== uniqueAssetIds.length) {
    throw Object.assign(
      new Error(
        "Un ou plusieurs équipements sont introuvables ou désactivés."
      ),
      {
        statusCode: 400,
      }
    );
  }

  return assets.map((item) => ({
    assetId: item.assetId,
    quantity: item.quantity ?? 1,
    label: optionalText(item.label),
    notes: optionalText(item.notes),
    isActive: item.isActive ?? true,
  }));
};

export const createLocation = async (data: CreateLocationInput) => {
  const normalizedAssets = await normalizeLocationAssets(data.assets ?? []);

  return prisma.location.create({
    data: {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      type: data.type,
      zone: optionalText(data.zone),
      floor: optionalText(data.floor),
      roomNumber: optionalText(data.roomNumber),
      description: optionalText(data.description),
      isActive: data.isActive ?? true,
      locationAssets: {
        create: normalizedAssets,
      },
    },
    include: locationSummaryInclude,
  });
};

export const listLocations = async () => {
  return prisma.location.findMany({
    orderBy: [{ floor: "asc" }, { type: "asc" }, { name: "asc" }],
    include: locationSummaryInclude,
  });
};

export const getLocationById = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: locationDetailInclude,
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

  const normalizedAssets =
    data.assets === undefined
      ? undefined
      : await normalizeLocationAssets(data.assets);

  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.LocationUncheckedUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.code !== undefined) {
      updateData.code = data.code.trim().toUpperCase();
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.zone !== undefined) {
      updateData.zone = optionalText(data.zone);
    }

    if (data.floor !== undefined) {
      updateData.floor = optionalText(data.floor);
    }

    if (data.roomNumber !== undefined) {
      updateData.roomNumber = optionalText(data.roomNumber);
    }

    if (data.description !== undefined) {
      updateData.description = optionalText(data.description);
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    await tx.location.update({
      where: { id },
      data: updateData,
    });

    if (normalizedAssets !== undefined) {
      await tx.locationAsset.deleteMany({
        where: {
          locationId: id,
        },
      });

      if (normalizedAssets.length > 0) {
        await tx.locationAsset.createMany({
          data: normalizedAssets.map((item) => ({
            locationId: id,
            assetId: item.assetId,
            quantity: item.quantity,
            label: item.label,
            notes: item.notes,
            isActive: item.isActive,
          })),
        });
      }
    }

    const updatedLocation = await tx.location.findUnique({
      where: { id },
      include: locationSummaryInclude,
    });

    if (!updatedLocation) {
      throw Object.assign(new Error("Endroit introuvable après mise à jour"), {
        statusCode: 404,
      });
    }

    return updatedLocation;
  });
};

export const deleteLocation = async (id: number) => {
  const location = await getLocationById(id);

  if (location._count.tickets > 0) {
    throw Object.assign(
      new Error(
        "Impossible de supprimer cet endroit car il possède des tickets."
      ),
      {
        statusCode: 400,
      }
    );
  }

  if (location._count.qrCodes > 0) {
    throw Object.assign(
      new Error(
        "Impossible de supprimer cet endroit car il possède des codes QR."
      ),
      {
        statusCode: 400,
      }
    );
  }

  return prisma.location.delete({
    where: { id },
  });
};