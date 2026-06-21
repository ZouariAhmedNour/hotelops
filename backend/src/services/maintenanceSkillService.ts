import { prisma } from "../config/prisma";

export const maintenanceSkillService = {
  list: async () => {
    return prisma.maintenanceSkill.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            agents: true,
            certificationLinks: true,
            safetyRuleRequirements: true,
          },
        },
      },
    });
  },

  getById: async (id: number) => {
    const skill = await prisma.maintenanceSkill.findUnique({
      where: {
        id,
      },
    });

    if (!skill) {
      const err = new Error("Compétence introuvable") as Error & {
        statusCode?: number;
      };

      err.statusCode = 404;
      throw err;
    }

    return skill;
  },

  create: async (body: { name: string; code: string }) => {
    const existing = await prisma.maintenanceSkill.findFirst({
      where: {
        OR: [
          {
            name: body.name,
          },
          {
            code: body.code.toUpperCase(),
          },
        ],
      },
    });

    if (existing) {
      const err = new Error(
        "Une compétence avec ce nom ou ce code existe déjà."
      ) as Error & {
        statusCode?: number;
      };

      err.statusCode = 409;
      throw err;
    }

    return prisma.maintenanceSkill.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
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
      where: {
        id,
      },
      data: {
        name: body.name?.trim(),
        code: body.code?.trim().toUpperCase(),
        isActive: body.isActive,
      },
    });
  },

  remove: async (id: number) => {
    await maintenanceSkillService.getById(id);

    return prisma.$transaction(async (tx) => {
      await tx.maintenanceSafetyRuleSkillRequirement.deleteMany({
        where: {
          skillId: id,
        },
      });

      await tx.maintenanceCertificationSkill.deleteMany({
        where: {
          skillId: id,
        },
      });

      await tx.maintenanceAgentSkill.deleteMany({
        where: {
          skillId: id,
        },
      });

      return tx.maintenanceSkill.delete({
        where: {
          id,
        },
      });
    });
  },
};