import { prisma } from "../config/prisma";

type SkillRequirementPayload = {
  skillId: number;
  minimumLevel: number;
};

type CreateSafetyRulePayload = {
  name: string;
  code: string;
  description?: string;
  categoryId?: number | null;
  triggerKeywords?: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskScore: number;
  requiresCertifiedAgent?: boolean;
  minPriorityCode?: string;
  minUrgencyLevel?: number;
  skillRequirements?: SkillRequirementPayload[];
  certificationIds?: number[];
};

type UpdateSafetyRulePayload = Partial<CreateSafetyRulePayload> & {
  isActive?: boolean;
};

const safetyRuleInclude = {
  category: true,
  skillRequirements: {
    include: {
      skill: true,
    },
  },
  certificationRequirements: {
    include: {
      certification: true,
    },
  },
} as const;

const createHttpError = (message: string, statusCode: number) => {
  return Object.assign(new Error(message), {
    statusCode,
  });
};

const normalizeKeywords = (keywords: string[] = []) => {
  return [...new Set(keywords.map((item) => item.trim()).filter(Boolean))];
};

const ensureUniqueIds = (ids: number[], label: string) => {
  if (new Set(ids).size !== ids.length) {
    throw createHttpError(
      `La liste ${label} contient des identifiants dupliqués.`,
      400
    );
  }
};

const ensureCategoryExists = async (categoryId?: number | null) => {
  if (!categoryId) return;

  const category = await prisma.maintenanceCategory.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw createHttpError("Catégorie introuvable.", 404);
  }
};

const ensureRequirementsExist = async (
  skillRequirements: SkillRequirementPayload[] = [],
  certificationIds: number[] = []
) => {
  const skillIds = skillRequirements.map((item) => item.skillId);

  ensureUniqueIds(skillIds, "des compétences");
  ensureUniqueIds(certificationIds, "des certifications");

  if (skillIds.length > 0) {
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
  }

  if (certificationIds.length > 0) {
    const certifications = await prisma.maintenanceCertification.findMany({
      where: {
        id: {
          in: certificationIds,
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (certifications.length !== certificationIds.length) {
      throw createHttpError(
        "Une ou plusieurs certifications sont introuvables ou inactives.",
        400
      );
    }
  }
};

export const safetyRuleService = {
  list: async () => {
    return prisma.maintenanceSafetyRule.findMany({
      include: safetyRuleInclude,
      orderBy: [
        {
          riskScore: "desc",
        },
        {
          name: "asc",
        },
      ],
    });
  },

  getById: async (id: number) => {
    const rule = await prisma.maintenanceSafetyRule.findUnique({
      where: {
        id,
      },
      include: safetyRuleInclude,
    });

    if (!rule) {
      throw createHttpError("Règle de sécurité introuvable.", 404);
    }

    return rule;
  },

  create: async (body: CreateSafetyRulePayload) => {
    const skillRequirements = body.skillRequirements ?? [];
    const certificationIds = body.certificationIds ?? [];

    await ensureCategoryExists(body.categoryId);

    await ensureRequirementsExist(skillRequirements, certificationIds);

    const existing = await prisma.maintenanceSafetyRule.findUnique({
      where: {
        code: body.code.toUpperCase(),
      },
    });

    if (existing) {
      throw createHttpError(
        "Une règle de sécurité avec ce code existe déjà.",
        409
      );
    }

    return prisma.maintenanceSafetyRule.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        description: body.description?.trim() || null,
        categoryId: body.categoryId ?? null,
        triggerKeywords: normalizeKeywords(body.triggerKeywords),
        riskLevel: body.riskLevel,
        riskScore: body.riskScore,
        requiresCertifiedAgent: body.requiresCertifiedAgent ?? false,
        minPriorityCode: body.minPriorityCode?.trim().toUpperCase() || null,
        minUrgencyLevel: body.minUrgencyLevel ?? null,

        skillRequirements: {
          create: skillRequirements.map((item) => ({
            skillId: item.skillId,
            minimumLevel: item.minimumLevel,
          })),
        },

        certificationRequirements: {
          create: certificationIds.map((certificationId) => ({
            certificationId,
          })),
        },
      },
      include: safetyRuleInclude,
    });
  },

  update: async (id: number, body: UpdateSafetyRulePayload) => {
    await safetyRuleService.getById(id);

    if (body.categoryId !== undefined) {
      await ensureCategoryExists(body.categoryId);
    }

    const skillRequirements = body.skillRequirements;
    const certificationIds = body.certificationIds;

    if (
      skillRequirements !== undefined ||
      certificationIds !== undefined
    ) {
      await ensureRequirementsExist(
        skillRequirements ?? [],
        certificationIds ?? []
      );
    }

    if (body.code) {
      const existing = await prisma.maintenanceSafetyRule.findFirst({
        where: {
          code: body.code.toUpperCase(),
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw createHttpError(
          "Une règle de sécurité avec ce code existe déjà.",
          409
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      if (skillRequirements !== undefined) {
        await tx.maintenanceSafetyRuleSkillRequirement.deleteMany({
          where: {
            safetyRuleId: id,
          },
        });

        if (skillRequirements.length > 0) {
          await tx.maintenanceSafetyRuleSkillRequirement.createMany({
            data: skillRequirements.map((item) => ({
              safetyRuleId: id,
              skillId: item.skillId,
              minimumLevel: item.minimumLevel,
            })),
          });
        }
      }

      if (certificationIds !== undefined) {
        await tx.maintenanceSafetyRuleCertificationRequirement.deleteMany({
          where: {
            safetyRuleId: id,
          },
        });

        if (certificationIds.length > 0) {
          await tx.maintenanceSafetyRuleCertificationRequirement.createMany({
            data: certificationIds.map((certificationId) => ({
              safetyRuleId: id,
              certificationId,
            })),
          });
        }
      }

      return tx.maintenanceSafetyRule.update({
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
          categoryId: body.categoryId,
          triggerKeywords:
            body.triggerKeywords !== undefined
              ? normalizeKeywords(body.triggerKeywords)
              : undefined,
          riskLevel: body.riskLevel,
          riskScore: body.riskScore,
          requiresCertifiedAgent: body.requiresCertifiedAgent,
          minPriorityCode:
            body.minPriorityCode !== undefined
              ? body.minPriorityCode.trim().toUpperCase() || null
              : undefined,
          minUrgencyLevel: body.minUrgencyLevel,
          isActive: body.isActive,
        },
        include: safetyRuleInclude,
      });
    });
  },

  remove: async (id: number) => {
    await safetyRuleService.getById(id);

    return prisma.maintenanceSafetyRule.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      include: safetyRuleInclude,
    });
  },
};