import { prisma } from "../config/prisma";

export const maintenanceTeamService = {
  list: async () => {
    return prisma.maintenanceTeam.findMany({
      orderBy: { createdAt: "desc" },
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
    const team = await prisma.maintenanceTeam.findUnique({
      where: { id },
      include: {
        agents: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      const err = new Error("Équipe introuvable") as any;
      err.statusCode = 404;
      throw err;
    }

    return team;
  },

  create: async (body: {
    name: string;
    code: string;
    description?: string;
    color?: string;
  }) => {
    const existing = await prisma.maintenanceTeam.findFirst({
      where: {
        OR: [{ name: body.name }, { code: body.code }],
      },
    });

    if (existing) {
      const err = new Error("Une équipe avec ce nom ou ce code existe déjà") as any;
      err.statusCode = 409;
      throw err;
    }

    return prisma.maintenanceTeam.create({
      data: {
        name: body.name,
        code: body.code.toUpperCase(),
        description: body.description,
        color: body.color,
      },
    });
  },

  update: async (
    id: number,
    body: {
      name?: string;
      code?: string;
      description?: string;
      color?: string;
      isActive?: boolean;
    }
  ) => {
    await maintenanceTeamService.getById(id);

    return prisma.maintenanceTeam.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code?.toUpperCase(),
        description: body.description,
        color: body.color,
        isActive: body.isActive,
      },
    });
  },

  remove: async (id: number) => {
    const team = await maintenanceTeamService.getById(id);

    if (team.agents.length > 0) {
      const err = new Error(
        "Impossible de supprimer cette équipe car elle contient des agents"
      ) as any;
      err.statusCode = 400;
      throw err;
    }

    return prisma.maintenanceTeam.delete({
      where: { id },
    });
  },
};