import { prisma } from "../config/prisma";

export type CreateCategoryInput = {
  name: string;
  icon?: string;
  isActive?: boolean;
};

export type UpdateCategoryInput =
  Partial<CreateCategoryInput>;

export const createCategory = async (
  data: CreateCategoryInput
) => {
  return prisma.maintenanceCategory.create({
    data: {
      name: data.name,
      icon: data.icon,
      isActive: data.isActive ?? true,
    },
  });
};

export const listCategories = async () => {
  return prisma.maintenanceCategory.findMany({
    include: {
      tickets: true,
    },

    orderBy: {
      id: 'desc',
    },
  });
};

export const getCategoryById = async (
  id: number
) => {
  const category =
    await prisma.maintenanceCategory.findUnique({
      where: { id },

      include: {
        tickets: true,
      },
    });

  if (!category) {
    throw Object.assign(
      new Error('Catégorie introuvable'),
      { statusCode: 404 }
    );
  }

  return category;
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryInput
) => {
  await getCategoryById(id);

  return prisma.maintenanceCategory.update({
    where: { id },

    data: {
      name: data.name,
      icon: data.icon,
      isActive: data.isActive,
    },
  });
};

export const deleteCategory = async (
  id: number
) => {
  await getCategoryById(id);

  return prisma.maintenanceCategory.delete({
    where: { id },
  });
};