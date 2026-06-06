import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";

const sanitizeUser = (user: any) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const agentService = {
  list: async () => {
    const agents = await prisma.maintenanceAgentProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
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
      },
    });

    return agents.map((agent) => ({
      ...agent,
      user: sanitizeUser(agent.user),
    }));
  },

  getById: async (id: number) => {
  const agent = await prisma.maintenanceAgentProfile.findUnique({
    where: { id },
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
    },
  });

  if (!agent) {
    const err = new Error("Agent introuvable") as any;
    err.statusCode = 404;
    throw err;
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

  create: async (body: {
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
    skillIds?: number[];
  }) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      const err = new Error("Cet email est déjà utilisé") as any;
      err.statusCode = 409;
      throw err;
    }

    const agentRole = await prisma.role.findUnique({
      where: { code: "MAINTENANCE_AGENT" },
    });

    if (!agentRole) {
      const err = new Error(
        "Rôle MAINTENANCE_AGENT introuvable. Vérifiez votre seed."
      ) as any;
      err.statusCode = 500;
      throw err;
    }

    if (body.teamId) {
      const team = await prisma.maintenanceTeam.findUnique({
        where: { id: body.teamId },
      });

      if (!team) {
        const err = new Error("Équipe introuvable") as any;
        err.statusCode = 404;
        throw err;
      }
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        passwordHash,
        roleId: agentRole.id,
        agentProfile: {
          create: {
            teamId: body.teamId,
            employeeCode: body.employeeCode,
            level: body.level,
            shift: body.shift,
            availabilityStatus: body.availabilityStatus ?? "AVAILABLE",
            mainSpecialty: body.mainSpecialty,
            canHandleCritical: body.canHandleCritical ?? false,
            maxActiveTickets: body.maxActiveTickets ?? 5,
            skills: {
              create: (body.skillIds ?? []).map((skillId) => ({
                skillId,
                level: 1,
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
          },
        },
      },
    });

    return sanitizeUser(user);
  },

  update: async (
    id: number,
    body: {
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
      skillIds?: number[];
    }
  ) => {
    const currentAgent = await prisma.maintenanceAgentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentAgent) {
      const err = new Error("Agent introuvable") as any;
      err.statusCode = 404;
      throw err;
    }

    const updatedAgent = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: currentAgent.userId },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          isActive: body.isActive,
        },
      });

      if (body.skillIds) {
        await tx.maintenanceAgentSkill.deleteMany({
          where: { agentProfileId: id },
        });

        await tx.maintenanceAgentSkill.createMany({
          data: body.skillIds.map((skillId) => ({
            agentProfileId: id,
            skillId,
            level: 1,
          })),
        });
      }

      return tx.maintenanceAgentProfile.update({
        where: { id },
        data: {
          teamId: body.teamId,
          employeeCode: body.employeeCode,
          level: body.level,
          shift: body.shift,
          availabilityStatus: body.availabilityStatus,
          mainSpecialty: body.mainSpecialty,
          canHandleCritical: body.canHandleCritical,
          maxActiveTickets: body.maxActiveTickets,
        },
        include: {
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
        },
      });
    });

    return {
      ...updatedAgent,
      user: sanitizeUser(updatedAgent.user),
    };
  },

  remove: async (id: number) => {
    const agent = await prisma.maintenanceAgentProfile.findUnique({
      where: { id },
    });

    if (!agent) {
      const err = new Error("Agent introuvable") as any;
      err.statusCode = 404;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      await tx.maintenanceAgentSkill.deleteMany({
        where: { agentProfileId: id },
      });

      await tx.maintenanceAgentProfile.delete({
        where: { id },
      });

      return tx.user.update({
        where: { id: agent.userId },
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
    let ticket = null;

    if (params.ticketId) {
      ticket = await prisma.maintenanceTicket.findUnique({
        where: { id: params.ticketId },
        include: {
          category: true,
          priority: true,
        },
      });
    }

    const effectiveCategoryId = params.categoryId ?? ticket?.categoryId;
    const effectivePriorityId = params.priorityId ?? ticket?.priorityId;

    const priority = effectivePriorityId
      ? await prisma.maintenancePriority.findUnique({
          where: { id: effectivePriorityId },
        })
      : null;

    const isCritical = priority?.code === "CRITICAL";

    const category = effectiveCategoryId
      ? await prisma.maintenanceCategory.findUnique({
          where: { id: effectiveCategoryId },
        })
      : null;

    const agents = await prisma.maintenanceAgentProfile.findMany({
      where: {
        user: {
          isActive: true,
        },
        availabilityStatus: {
          in: ["AVAILABLE", "BUSY"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const hour = new Date().getHours();

    const currentShift =
      hour >= 6 && hour < 14
        ? "MORNING"
        : hour >= 14 && hour < 22
          ? "AFTERNOON"
          : "NIGHT";

    const scored = await Promise.all(
      agents.map(async (agent) => {
        let score = 0;
        const reasons: string[] = [];

        const activeTickets = await prisma.maintenanceTicket.count({
          where: {
            assignedToUserId: agent.userId,
            status: {
              isFinal: false,
            },
          },
        });

        if (agent.availabilityStatus === "AVAILABLE") {
          score += 30;
          reasons.push("Disponible");
        }

        const normalizeText = (value?: string | null) => {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const categoryName = normalizeText(category?.name);
const mainSpecialty = normalizeText(agent.mainSpecialty);

const hasMatchingMainSpecialty =
  Boolean(categoryName) && Boolean(mainSpecialty) && mainSpecialty.includes(categoryName);

const hasMatchingSkill =
  Boolean(categoryName) &&
  agent.skills.some((item) =>
    normalizeText(item.skill.name).includes(categoryName)
  );

const hasMatchingTeam =
  Boolean(categoryName) &&
  agent.team &&
  normalizeText(agent.team.name).includes(categoryName);

if (hasMatchingMainSpecialty || hasMatchingSkill || hasMatchingTeam) {
  score += 60;
  reasons.push("Spécialité compatible");
} else if (categoryName) {
  score -= 25;
  reasons.push("Spécialité différente");
}

        const loadPct =
          agent.maxActiveTickets > 0
            ? (activeTickets / agent.maxActiveTickets) * 100
            : 100;

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

        if (isCritical) {
          if (agent.canHandleCritical) {
            score += 10;
            reasons.push("Peut gérer les critiques");
          } else {
            score -= 15;
          }
        }

        const levelBonus = {
          EXPERT: 5,
          SENIOR: 3,
          CONFIRMED: 1,
          JUNIOR: 0,
        };

        score += levelBonus[agent.level as keyof typeof levelBonus] ?? 0;

        return {
          agent,
          score: Math.max(0, score),
          reasons,
          activeTicketsCount: activeTickets,
          loadPct,
        };
      })
    );

    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  },
};