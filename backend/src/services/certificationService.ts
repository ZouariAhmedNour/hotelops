import { prisma } from "../config/prisma";

type CertificationPayload = {
  name: string;
  code: string;
  description?: string;
  requiresExpiry?: boolean;
  validityMonths?: number | null;
  skillIds?: number[];
};

type UpdateCertificationPayload = Partial<CertificationPayload> & {
  isActive?: boolean;
};

const certificationInclude = {
  skillLinks: {
    include: {
      skill: true,
    },
  },
  _count: {
    select: {
      agentCertifications: true,
      safetyRuleRequirements: true,
    },
  },
} as const;

const createHttpError = (message: string, statusCode: number) => {
  return Object.assign(new Error(message), {
    statusCode,
  });
};

const uniqueIds = (ids: number[] = []) => {
  const values = [...new Set(ids)];

  if (values.length !== ids.length) {
    throw createHttpError("Liste contenant des identifiants dupliqués.", 400);
  }

  return values;
};

const ensureSkillsExist = async (skillIds: number[]) => {
  if (skillIds.length === 0) return;

  const skills = await prisma.maintenanceSkill.findMany({
    where: {
      id: {
        in: skillIds,
      },
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (skills.length !== skillIds.length) {
    throw createHttpError(
      "Une ou plusieurs compétences sont introuvables ou inactives.",
      400
    );
  }
};

export const certificationService = {
  list: async () => {
    return prisma.maintenanceCertification.findMany({
      include: certificationInclude,
      orderBy: {
        name: "asc",
      },
    });
  },

  getById: async (id: number) => {
    const certification = await prisma.maintenanceCertification.findUnique({
      where: {
        id,
      },
      include: certificationInclude,
    });

    if (!certification) {
      throw createHttpError("Certification introuvable.", 404);
    }

    return certification;
  },

  create: async (body: CertificationPayload) => {
    const skillIds = uniqueIds(body.skillIds ?? []);

    await ensureSkillsExist(skillIds);

    const existing = await prisma.maintenanceCertification.findFirst({
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
      throw createHttpError(
        "Une certification avec ce nom ou ce code existe déjà.",
        409
      );
    }

    return prisma.maintenanceCertification.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        description: body.description?.trim() || null,
        requiresExpiry: body.requiresExpiry ?? false,
        validityMonths: body.validityMonths ?? null,

        skillLinks: {
          create: skillIds.map((skillId) => ({
            skillId,
          })),
        },
      },
      include: certificationInclude,
    });
  },

  update: async (id: number, body: UpdateCertificationPayload) => {
    await certificationService.getById(id);

    const skillIds =
      body.skillIds !== undefined ? uniqueIds(body.skillIds) : undefined;

    if (skillIds !== undefined) {
      await ensureSkillsExist(skillIds);
    }

    if (body.code) {
      const existingWithSameCode =
        await prisma.maintenanceCertification.findFirst({
          where: {
            code: body.code.toUpperCase(),
            NOT: {
              id,
            },
          },
        });

      if (existingWithSameCode) {
        throw createHttpError(
          "Une certification avec ce code existe déjà.",
          409
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      if (skillIds !== undefined) {
        await tx.maintenanceCertificationSkill.deleteMany({
          where: {
            certificationId: id,
          },
        });

        if (skillIds.length > 0) {
          await tx.maintenanceCertificationSkill.createMany({
            data: skillIds.map((skillId) => ({
              certificationId: id,
              skillId,
            })),
          });
        }
      }

      return tx.maintenanceCertification.update({
        where: {
          id,
        },
        data: {
          name: body.name?.trim(),
          code: body.code?.trim().toUpperCase(),
          description:
            body.description !== undefined
              ? body.description.trim() || null
              : undefined,
          requiresExpiry: body.requiresExpiry,
          validityMonths: body.validityMonths,
          isActive: body.isActive,
        },
        include: certificationInclude,
      });
    });
  },

  remove: async (id: number) => {
    await certificationService.getById(id);

    return prisma.maintenanceCertification.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      include: certificationInclude,
    });
  },
};