import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  assessTicketSafety,
  evaluateAgentSafetyEligibility,
  persistTicketRiskAssessment,
} from "./safetyAssessmentService";

type AgentSkillPayload = {
  skillId: number;
  level: number;
};

type AgentCertificationPayload = {
  certificationId: number;
  issuedAt?: Date;
  expiresAt?: Date;
  provider?: string;
  certificateNumber?: string;
  status?: "VALID" | "EXPIRED" | "PENDING" | "REVOKED";
};

type CreateAgentBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;

  teamId?: number;
  employeeCode?: string;

  level: string;
  shift: string;
  availabilityStatus?: string;

  mainSpecialty?: string;
  canHandleCritical?: boolean;
  maxActiveTickets?: number;

  skills?: AgentSkillPayload[];
  skillIds?: number[];

  certifications?: AgentCertificationPayload[];
};

type UpdateAgentBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;

  teamId?: number | null;
  employeeCode?: string;

  level?: string;
  shift?: string;
  availabilityStatus?: string;

  mainSpecialty?: string;
  canHandleCritical?: boolean;
  maxActiveTickets?: number;

  skills?: AgentSkillPayload[];
  skillIds?: number[];

  certifications?: AgentCertificationPayload[];
};

const createHttpError = (message: string, statusCode: number) => {
  return Object.assign(new Error(message), {
    statusCode,
  });
};

const sanitizeUser = <T extends { passwordHash: string }>(user: T) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const normalizeText = (value?: string | null) => {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const agentRelations = {
  user: {
    include: {
      role: true,
    },
  },

  team: true,

  skills: {
    include: {
      skill: true,
    },
  },

  certifications: {
    include: {
      certification: {
        include: {
          skillLinks: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} as const;

const normalizeSkillsPayload = (
  body: Pick<CreateAgentBody, "skills" | "skillIds">
): AgentSkillPayload[] => {
  const source: AgentSkillPayload[] =
    body.skills !== undefined
      ? body.skills
      : (body.skillIds ?? []).map((skillId) => ({
          skillId,
          level: 1,
        }));

  const ids = source.map((item) => item.skillId);

  if (new Set(ids).size !== ids.length) {
    throw createHttpError(
      "Une compétence ne peut être ajoutée qu’une seule fois.",
      400
    );
  }

  return source.map((item) => ({
    skillId: item.skillId,
    level: item.level,
  }));
};

const normalizeCertificationsPayload = (
  certifications: AgentCertificationPayload[] = []
) => {
  const ids = certifications.map((item) => item.certificationId);

  if (new Set(ids).size !== ids.length) {
    throw createHttpError(
      "Une certification ne peut être ajoutée qu’une seule fois.",
      400
    );
  }

  return certifications;
};

const ensureTeamExists = async (teamId?: number | null) => {
  if (!teamId) return;

  const team = await prisma.maintenanceTeam.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    throw createHttpError("Équipe introuvable.", 404);
  }
};

const ensureSkillsExist = async (skills: AgentSkillPayload[]) => {
  if (skills.length === 0) return;

  const skillIds = skills.map((item) => item.skillId);

  const existingSkills = await prisma.maintenanceSkill.findMany({
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

  if (existingSkills.length !== skillIds.length) {
    throw createHttpError(
      "Une ou plusieurs compétences sont introuvables ou inactives.",
      400
    );
  }
};

const ensureCertificationsExistAndMatchSkills = async (
  certifications: AgentCertificationPayload[],
  selectedSkillIds: number[]
) => {
  if (certifications.length === 0) return;

  const certificationIds = certifications.map(
    (item) => item.certificationId
  );

  const catalog = await prisma.maintenanceCertification.findMany({
    where: {
      id: {
        in: certificationIds,
      },
      isActive: true,
    },
    include: {
      skillLinks: true,
    },
  });

  if (catalog.length !== certificationIds.length) {
    throw createHttpError(
      "Une ou plusieurs certifications sont introuvables ou inactives.",
      400
    );
  }

  for (const certification of catalog) {
    if (certification.skillLinks.length === 0) {
      continue;
    }

    const linkedToSelectedSkill = certification.skillLinks.some((link) =>
      selectedSkillIds.includes(link.skillId)
    );

    if (!linkedToSelectedSkill) {
      throw createHttpError(
        `La certification "${certification.name}" doit être associée à une compétence de l’agent.`,
        400
      );
    }
  }
};

const calculateCurrentShift = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 14) return "MORNING";
  if (hour >= 14 && hour < 22) return "AFTERNOON";

  return "NIGHT";
};

export const agentService = {
  list: async () => {
    const agents = await prisma.maintenanceAgentProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: agentRelations,
    });

    return agents.map((agent) => ({
      ...agent,
      user: sanitizeUser(agent.user),
    }));
  },

  getById: async (id: number) => {
    const agent = await prisma.maintenanceAgentProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            role: true,
            assignedTickets: {
              orderBy: {
                createdAt: "desc",
              },
              include: {
                location: true,
                category: true,
                priority: true,
                status: true,
                reportedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                assignedTo: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },

        team: true,

        skills: {
          include: {
            skill: true,
          },
        },

        certifications: {
          include: {
            certification: {
              include: {
                skillLinks: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!agent) {
      throw createHttpError("Agent introuvable.", 404);
    }

    const activeTicketsCount = agent.user.assignedTickets.filter(
      (ticket) => !ticket.status.isFinal
    ).length;

    const resolvedTicketsCount = agent.user.assignedTickets.filter((ticket) =>
      ["RESOLVED", "CLOSED"].includes(ticket.status.code)
    ).length;

    const { passwordHash, assignedTickets, ...safeUser } = agent.user;

    return {
      ...agent,
      user: safeUser,
      assignedTickets,
      activeTicketsCount,
      resolvedTicketsCount,
    };
  },

  create: async (body: CreateAgentBody) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUser) {
      throw createHttpError("Cet email est déjà utilisé.", 409);
    }

    const agentRole = await prisma.role.findUnique({
      where: {
        code: "MAINTENANCE_AGENT",
      },
    });

    if (!agentRole) {
      throw createHttpError(
        "Rôle MAINTENANCE_AGENT introuvable. Vérifiez votre seed.",
        500
      );
    }

    const skills = normalizeSkillsPayload(body);
    const certifications = normalizeCertificationsPayload(
      body.certifications ?? []
    );

    await ensureTeamExists(body.teamId);
    await ensureSkillsExist(skills);

    await ensureCertificationsExistAndMatchSkills(
      certifications,
      skills.map((item) => item.skillId)
    );

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        passwordHash,
        roleId: agentRole.id,

        agentProfile: {
          create: {
            teamId: body.teamId,
            employeeCode: body.employeeCode?.trim() || null,

            level: body.level,
            shift: body.shift,
            availabilityStatus: body.availabilityStatus ?? "AVAILABLE",

            mainSpecialty: body.mainSpecialty?.trim() || null,
            canHandleCritical: body.canHandleCritical ?? false,
            maxActiveTickets: body.maxActiveTickets ?? 5,

            skills: {
              create: skills.map((item) => ({
                skillId: item.skillId,
                level: item.level,
              })),
            },

            certifications: {
              create: certifications.map((item) => ({
                certificationId: item.certificationId,
                issuedAt: item.issuedAt,
                expiresAt: item.expiresAt,
                provider: item.provider?.trim() || null,
                certificateNumber: item.certificateNumber?.trim() || null,
                status: item.status ?? "PENDING",
              })),
            },
          },
        },
      },

      include: {
        role: true,
        agentProfile: {
          include: {
            team: true,
            skills: {
              include: {
                skill: true,
              },
            },
            certifications: {
              include: {
                certification: {
                  include: {
                    skillLinks: {
                      include: {
                        skill: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return sanitizeUser(user);
  },

  update: async (id: number, body: UpdateAgentBody) => {
    const currentAgent = await prisma.maintenanceAgentProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        skills: true,
        certifications: true,
      },
    });

    if (!currentAgent) {
      throw createHttpError("Agent introuvable.", 404);
    }

    if (body.teamId !== undefined) {
      await ensureTeamExists(body.teamId);
    }

    const hasSkillsUpdate =
      body.skills !== undefined || body.skillIds !== undefined;

    const hasCertificationsUpdate = body.certifications !== undefined;

    const nextSkills = hasSkillsUpdate
      ? normalizeSkillsPayload({
          skills: body.skills,
          skillIds: body.skillIds,
        })
      : currentAgent.skills.map((item) => ({
          skillId: item.skillId,
          level: item.level,
        }));

    const nextCertifications: AgentCertificationPayload[] =
  hasCertificationsUpdate
    ? normalizeCertificationsPayload(body.certifications ?? [])
    : currentAgent.certifications.map((item) => ({
        certificationId: item.certificationId,
      }));

    if (hasSkillsUpdate) {
      await ensureSkillsExist(nextSkills);
    }

    if (hasSkillsUpdate || hasCertificationsUpdate) {
      await ensureCertificationsExistAndMatchSkills(
        nextCertifications,
        nextSkills.map((item) => item.skillId)
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: currentAgent.userId,
        },
        data: {
          firstName: body.firstName?.trim(),
          lastName: body.lastName?.trim(),
          phone:
            body.phone !== undefined ? body.phone.trim() || null : undefined,
          isActive: body.isActive,
        },
      });

      if (hasSkillsUpdate) {
        await tx.maintenanceAgentSkill.deleteMany({
          where: {
            agentProfileId: id,
          },
        });

        if (nextSkills.length > 0) {
          await tx.maintenanceAgentSkill.createMany({
            data: nextSkills.map((item) => ({
              agentProfileId: id,
              skillId: item.skillId,
              level: item.level,
            })),
          });
        }
      }

      if (hasCertificationsUpdate) {
        await tx.maintenanceAgentCertification.deleteMany({
          where: {
            agentProfileId: id,
          },
        });

        if (nextCertifications.length > 0) {
          await tx.maintenanceAgentCertification.createMany({
            data: nextCertifications.map((item) => ({
              agentProfileId: id,
              certificationId: item.certificationId,
              issuedAt: item.issuedAt,
              expiresAt: item.expiresAt,
              provider: item.provider?.trim() || null,
              certificateNumber: item.certificateNumber?.trim() || null,
              status: item.status ?? "PENDING",
            })),
          });
        }
      }

      const updatedAgent = await tx.maintenanceAgentProfile.update({
        where: {
          id,
        },
        data: {
          teamId: body.teamId,
          employeeCode:
            body.employeeCode !== undefined
              ? body.employeeCode.trim() || null
              : undefined,

          level: body.level,
          shift: body.shift,
          availabilityStatus: body.availabilityStatus,

          mainSpecialty:
            body.mainSpecialty !== undefined
              ? body.mainSpecialty.trim() || null
              : undefined,

          canHandleCritical: body.canHandleCritical,
          maxActiveTickets: body.maxActiveTickets,
        },
        include: agentRelations,
      });

      return {
        ...updatedAgent,
        user: sanitizeUser(updatedAgent.user),
      };
    });
  },

  remove: async (id: number) => {
    const agent = await prisma.maintenanceAgentProfile.findUnique({
      where: {
        id,
      },
    });

    if (!agent) {
      throw createHttpError("Agent introuvable.", 404);
    }

    return prisma.$transaction(async (tx) => {
      await tx.maintenanceAgentCertification.deleteMany({
        where: {
          agentProfileId: id,
        },
      });

      await tx.maintenanceAgentSkill.deleteMany({
        where: {
          agentProfileId: id,
        },
      });

      await tx.maintenanceAgentProfile.delete({
        where: {
          id,
        },
      });

      return tx.user.update({
        where: {
          id: agent.userId,
        },
        data: {
          isActive: false,
        },
        include: {
          role: true,
        },
      });
    });
  },

  getRecommendations: async (params: {
    ticketId?: number;
    categoryId?: number;
    priorityId?: number;
  }) => {
    const ticket = params.ticketId
      ? await prisma.maintenanceTicket.findUnique({
          where: {
            id: params.ticketId,
          },
          include: {
            category: true,
            priority: true,
            location: true,
          },
        })
      : null;

    if (params.ticketId && !ticket) {
      throw createHttpError("Ticket introuvable.", 404);
    }

    const effectiveCategoryId = params.categoryId ?? ticket?.categoryId;
    const effectivePriorityId = params.priorityId ?? ticket?.priorityId;

    const [category, priority] = await Promise.all([
      effectiveCategoryId
        ? prisma.maintenanceCategory.findUnique({
            where: {
              id: effectiveCategoryId,
            },
          })
        : null,

      effectivePriorityId
        ? prisma.maintenancePriority.findUnique({
            where: {
              id: effectivePriorityId,
            },
          })
        : null,
    ]);

    const safetyAssessment = await assessTicketSafety({
      title: ticket?.title ?? "",
      description: ticket?.description ?? "",
      urgencyLevel: ticket?.urgencyLevel,
      category,
      priority,
      location: ticket?.location,
    });

    if (ticket) {
      await persistTicketRiskAssessment(
        prisma,
        ticket.id,
        safetyAssessment
      );
    }

    const agents = await prisma.maintenanceAgentProfile.findMany({
      where: {
        user: {
          isActive: true,
        },
        availabilityStatus: {
          in: ["AVAILABLE", "BUSY"],
        },
      },
      include: agentRelations,
    });

    const currentShift = calculateCurrentShift();
    const categoryName = normalizeText(category?.name);

    const eligibleAgents: any[] = [];
    const blockedAgents: any[] = [];

    for (const agent of agents) {
      const safety = evaluateAgentSafetyEligibility(
        agent,
        safetyAssessment
      );

      const activeTickets = await prisma.maintenanceTicket.count({
        where: {
          assignedToUserId: agent.userId,
          status: {
            isFinal: false,
          },
        },
      });

      const loadPct =
        agent.maxActiveTickets > 0
          ? (activeTickets / agent.maxActiveTickets) * 100
          : 100;

      const safeAgent = {
        ...agent,
        user: sanitizeUser(agent.user),
      };

      if (!safety.safetyEligible) {
        blockedAgents.push({
          agent: safeAgent,
          score: 0,
          reasons: [
            "Agent bloqué par les exigences de sécurité.",
            ...safety.safetyReasons,
          ],
          safetyEligible: false,
          missingSkills: safety.missingSkills,
          missingCertifications: safety.missingCertifications,
          expiredCertifications: safety.expiredCertifications,
          criticalAuthorizationMissing: safety.criticalAuthorizationMissing,
          safetyReasons: safety.safetyReasons,
          activeTicketsCount: activeTickets,
          loadPct,
        });

        continue;
      }

      let score = 0;
      const reasons: string[] = [];

      if (agent.availabilityStatus === "AVAILABLE") {
        score += 30;
        reasons.push("Disponible");
      }

      const mainSpecialty = normalizeText(agent.mainSpecialty);

      const hasMatchingMainSpecialty =
        Boolean(categoryName) &&
        Boolean(mainSpecialty) &&
        mainSpecialty.includes(categoryName);

      const hasMatchingSkill =
        Boolean(categoryName) &&
        agent.skills.some((item) =>
          normalizeText(item.skill.name).includes(categoryName)
        );

      const hasMatchingTeam =
        Boolean(categoryName) &&
        Boolean(agent.team) &&
        normalizeText(agent.team?.name).includes(categoryName);

      if (
        hasMatchingMainSpecialty ||
        hasMatchingSkill ||
        hasMatchingTeam
      ) {
        score += 60;
        reasons.push("Spécialité compatible");
      } else if (categoryName) {
        score -= 25;
        reasons.push("Spécialité différente");
      }

      if (loadPct < 50) {
        score += 20;
        reasons.push("Charge faible");
      } else if (loadPct > 80) {
        score -= 20;
        reasons.push("Charge élevée");
      }

      if (agent.shift === currentShift || agent.shift === "DAY") {
        score += 15;
        reasons.push("Shift actuel");
      }

      if (safetyAssessment.requiresCertifiedAgent) {
        score += 20;
        reasons.push("Certifications sécurité valides");
      }

      if (
        safetyAssessment.riskLevel === "CRITICAL" &&
        agent.canHandleCritical
      ) {
        score += 10;
        reasons.push("Autorisé pour intervention critique");
      }

      const levelBonus = {
        EXPERT: 5,
        SENIOR: 3,
        CONFIRMED: 1,
        JUNIOR: 0,
      };

      score += levelBonus[agent.level as keyof typeof levelBonus] ?? 0;

      eligibleAgents.push({
        agent: safeAgent,
        score: Math.max(0, score),
        reasons: [...reasons, ...safety.safetyReasons],
        safetyEligible: true,
        missingSkills: [],
        missingCertifications: [],
        expiredCertifications: [],
        criticalAuthorizationMissing: false,
        safetyReasons: safety.safetyReasons,
        activeTicketsCount: activeTickets,
        loadPct,
      });
    }

    eligibleAgents.sort((a, b) => b.score - a.score);

    return {
      safetyAssessment,

      // Compatibilité avec les anciennes intégrations possibles
      recommendations: eligibleAgents,

      eligibleAgents,
      blockedAgents,
    };
  },
};