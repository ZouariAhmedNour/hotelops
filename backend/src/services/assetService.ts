import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type CreateAssetInput = {
  name: string;
  code: string;
  category?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateAssetInput = Partial<CreateAssetInput>;

export type ListAssetsQuery = {
  search?: string;
  isActive?: boolean;
};

const assetSummaryInclude = {
  _count: {
    select: {
      locationAssets: true,
      ticketAssets: true,
    },
  },
} satisfies Prisma.MaintenanceAssetInclude;

const normalizeCode = (value: string) => value.trim().toUpperCase();

const optionalText = (value?: string) => {
  const normalized = value?.trim();

  return normalized ? normalized : null;
};

export const listAssets = async (query: ListAssetsQuery = {}) => {
  const where: Prisma.MaintenanceAssetWhereInput = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search?.trim()) {
    where.OR = [
      {
        name: {
          contains: query.search.trim(),
          mode: "insensitive",
        },
      },
      {
        code: {
          contains: query.search.trim(),
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: query.search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  return prisma.maintenanceAsset.findMany({
    where,
    include: assetSummaryInclude,
    orderBy: [{ isActive: "desc" }, { category: "asc" }, { name: "asc" }],
  });
};

export const getAssetById = async (id: number) => {
  const asset = await prisma.maintenanceAsset.findUnique({
    where: { id },
    include: {
      locationAssets: {
        include: {
          location: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              floor: true,
              zone: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      ticketAssets: {
        include: {
          ticket: {
            select: {
              id: true,
              ticketNumber: true,
              title: true,
              createdAt: true,
              status: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      },
      _count: {
        select: {
          locationAssets: true,
          ticketAssets: true,
        },
      },
    },
  });

  if (!asset) {
    throw Object.assign(new Error("Équipement introuvable"), {
      statusCode: 404,
    });
  }

  return asset;
};

export const createAsset = async (data: CreateAssetInput) => {
  return prisma.maintenanceAsset.create({
    data: {
      name: data.name.trim(),
      code: normalizeCode(data.code),
      category: optionalText(data.category),
      icon: optionalText(data.icon),
      description: optionalText(data.description),
      isActive: data.isActive ?? true,
    },
    include: assetSummaryInclude,
  });
};

export const updateAsset = async (
  id: number,
  data: UpdateAssetInput
) => {
  await getAssetById(id);

  const updateData: Prisma.MaintenanceAssetUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }

  if (data.code !== undefined) {
    updateData.code = normalizeCode(data.code);
  }

  if (data.category !== undefined) {
    updateData.category = optionalText(data.category);
  }

  if (data.icon !== undefined) {
    updateData.icon = optionalText(data.icon);
  }

  if (data.description !== undefined) {
    updateData.description = optionalText(data.description);
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  return prisma.maintenanceAsset.update({
    where: { id },
    data: updateData,
    include: assetSummaryInclude,
  });
};

export const deactivateAsset = async (id: number) => {
  await getAssetById(id);

  return prisma.maintenanceAsset.update({
    where: { id },
    data: {
      isActive: false,
    },
    include: assetSummaryInclude,
  });
};

export const validateAssetsForLocation = async (
  locationId: number,
  rawAssetIds: number[] = []
) => {
  const assetIds = [...new Set(rawAssetIds)];

  if (assetIds.length === 0) {
    return [];
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!location) {
    throw Object.assign(new Error("Localisation introuvable"), {
      statusCode: 404,
    });
  }

  const availableAssets = await prisma.locationAsset.findMany({
    where: {
      locationId,
      assetId: {
        in: assetIds,
      },
      isActive: true,
      asset: {
        isActive: true,
      },
    },
    select: {
      assetId: true,
    },
  });

  const availableAssetIds = new Set(
    availableAssets.map((item) => item.assetId)
  );

  const invalidAssetIds = assetIds.filter(
    (assetId) => !availableAssetIds.has(assetId)
  );

  if (invalidAssetIds.length > 0) {
    throw Object.assign(
      new Error(
        "Un ou plusieurs équipements sélectionnés ne sont pas disponibles dans cette localisation."
      ),
      {
        statusCode: 400,
        code: "INVALID_LOCATION_ASSETS",
        details: {
          locationId,
          invalidAssetIds,
        },
      }
    );
  }

  return assetIds;
};