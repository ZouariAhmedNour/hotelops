import { prisma } from "../config/prisma";

export const maintenanceSkillService = {
  list: async () => {
    return prisma.maintenanceSkill.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            agents: true,
          },
        },
      },
    });
  },

  getById: async (id: number) => {
    const skill = await prisma.maintenanceSkill.findUnique({
      where: { id },
    });

    if (!skill) {
      const err = new Error("Compétence introuvable") as any;
      err.statusCode = 404;
      throw err;
    }

    return skill;
  },

  create: async (body: { name: string; code: string }) => {
    const existing = await prisma.maintenanceSkill.findFirst({
      where: {
        OR: [{ name: body.name }, { code: body.code }],
      },
    });

    if (existing) {
      const err = new Error("Une compétence avec ce nom ou ce code existe déjà") as any;
      err.statusCode = 409;
      throw err;
    }

    return prisma.maintenanceSkill.create({
      data: {
        name: body.name,
        code: body.code.toUpperCase(),
      },
    });
  },

  update: async (
    id: number,
    body: {
      name?: string;
      code?: string;
      isActive?: boolean;
    }
  ) => {
    await maintenanceSkillService.getById(id);

    return prisma.maintenanceSkill.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code?.toUpperCase(),
        isActive: body.isActive,
      },
    });
  },

  remove: async (id: number) => {
    await maintenanceSkillService.getById(id);

    await prisma.maintenanceAgentSkill.deleteMany({
      where: { skillId: id },
    });

    return prisma.maintenanceSkill.delete({
      where: { id },
    });
  },
};