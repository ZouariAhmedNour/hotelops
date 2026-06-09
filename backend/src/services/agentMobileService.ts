import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const ticketInclude: Prisma.MaintenanceTicketInclude = {
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
      phone: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  comments: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  attachments: {
    orderBy: {
      createdAt: "desc",
    },
  },
  events: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  materials: {
    orderBy: {
      createdAt: "desc",
    },
  },
};

const createHttpError = (message: string, statusCode: number) => {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = statusCode;
  return err;
};

const findStatusByCodes = async (codes: string[]) => {
  const variants = codes.flatMap((code) => [
    code,
    code.toLowerCase(),
    code.toUpperCase(),
  ]);

  return prisma.maintenanceStatus.findFirst({
    where: {
      code: {
        in: variants,
      },
    },
  });
};

const assertTicketOwner = async (ticketId: number, userId: number) => {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: {
      id: ticketId,
    },
    select: {
      id: true,
      assignedToUserId: true,
    },
  });

  if (!ticket) {
    throw createHttpError("Ticket introuvable", 404);
  }

  if (ticket.assignedToUserId !== userId) {
    throw createHttpError("Accès interdit à ce ticket", 403);
  }

  return ticket;
};

export const agentMobileService = {
  getMe: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

    if (!user) {
      throw createHttpError("Utilisateur introuvable", 404);
    }

    const { passwordHash, ...safeUser } = user;

    const todayStats = await agentMobileService.getTodayStats(userId);

    return {
      user: safeUser,
      agentProfile: safeUser.agentProfile,
      todayStats,
    };
  },

  getTodayStats: async (userId: number) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [assignedToday, inProgress, urgent, completedToday] =
      await Promise.all([
        prisma.maintenanceTicket.count({
          where: {
            assignedToUserId: userId,
            createdAt: {
              gte: todayStart,
            },
          },
        }),

        prisma.maintenanceTicket.count({
          where: {
            assignedToUserId: userId,
            status: {
              code: "IN_PROGRESS",
            },
          },
        }),

        prisma.maintenanceTicket.count({
          where: {
            assignedToUserId: userId,
            priority: {
              code: "CRITICAL",
            },
            status: {
              isFinal: false,
            },
          },
        }),

        prisma.maintenanceTicket.count({
          where: {
            assignedToUserId: userId,
            resolvedAt: {
              gte: todayStart,
            },
          },
        }),
      ]);

    return {
      assignedToday,
      inProgress,
      urgent,
      completedToday,
    };
  },

  getTasks: async (
    userId: number,
    query: {
      page?: number;
      limit?: number;
      statusCode?: string;
    }
  ) => {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);

    const where: Prisma.MaintenanceTicketWhereInput = {
      assignedToUserId: userId,
    };

    if (query.statusCode) {
      where.status = {
        code: query.statusCode,
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where,
        include: ticketInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          {
            priority: {
              sortOrder: "asc",
            },
          },
          {
            dueAt: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),

      prisma.maintenanceTicket.count({
        where,
      }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getTaskById: async (userId: number, ticketId: number) => {
    await assertTicketOwner(ticketId, userId);

    return prisma.maintenanceTicket.findUnique({
      where: {
        id: ticketId,
      },
      include: ticketInclude,
    });
  },

  acceptTask: async (userId: number, ticketId: number) => {
    await assertTicketOwner(ticketId, userId);

    const assignedStatus = await findStatusByCodes(["ASSIGNED"]);

    if (!assignedStatus) {
      throw createHttpError("Statut ASSIGNED introuvable", 500);
    }

    const [ticket] = await prisma.$transaction([
      prisma.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          statusId: assignedStatus.id,
          acceptedAt: new Date(),
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "ACCEPTED",
          message: "Intervention acceptée par l’agent",
        },
      }),
    ]);

    return ticket;
  },

  startTask: async (userId: number, ticketId: number) => {
    await assertTicketOwner(ticketId, userId);

    const inProgressStatus = await findStatusByCodes(["IN_PROGRESS", "in_progress"]);

    if (!inProgressStatus) {
      throw createHttpError("Statut IN_PROGRESS introuvable", 500);
    }

    const [ticket] = await prisma.$transaction([
      prisma.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          statusId: inProgressStatus.id,
          startedAt: new Date(),
          progress: 10,
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "STARTED",
          message: "Intervention démarrée par l’agent",
        },
      }),
    ]);

    return ticket;
  },

  pauseTask: async (userId: number, ticketId: number, reason?: string) => {
    await assertTicketOwner(ticketId, userId);

    const pendingStatus = await findStatusByCodes(["PENDING"]);

    if (!pendingStatus) {
      throw createHttpError("Statut PENDING introuvable", 500);
    }

    const message = reason || "Intervention mise en pause";

    const [ticket] = await prisma.$transaction([
      prisma.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          statusId: pendingStatus.id,
          pausedAt: new Date(),
          pendingReason: message,
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "PAUSED",
          message,
        },
      }),
    ]);

    return ticket;
  },

  pendingParts: async (userId: number, ticketId: number, reason?: string) => {
    await assertTicketOwner(ticketId, userId);

    const pendingStatus = await findStatusByCodes(["PENDING"]);

    if (!pendingStatus) {
      throw createHttpError("Statut PENDING introuvable", 500);
    }

    const message = reason || "En attente de pièces";

    const [ticket] = await prisma.$transaction([
      prisma.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          statusId: pendingStatus.id,
          pendingReason: message,
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "PENDING_PARTS",
          message,
        },
      }),
    ]);

    return ticket;
  },

  needHelp: async (userId: number, ticketId: number, reason?: string) => {
    await assertTicketOwner(ticketId, userId);

    const message = reason || "Besoin d’aide";

    const [ticket] = await prisma.$transaction([
      prisma.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          needHelpReason: message,
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "NEED_HELP",
          message,
        },
      }),
    ]);

    return ticket;
  },

  updateProgress: async (
    userId: number,
    ticketId: number,
    progress: number,
    note?: string
  ) => {
    await assertTicketOwner(ticketId, userId);

    const safeProgress = Math.max(0, Math.min(100, progress));

    const [ticket] = await prisma.$transaction([
      prisma.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          progress: safeProgress,
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "PROGRESS_UPDATED",
          message: note || `Progression mise à jour : ${safeProgress}%`,
          metadata: {
            progress: safeProgress,
          },
        },
      }),
    ]);

    return ticket;
  },

 resolveTask: async (
  userId: number,
  ticketId: number,
  body: {
    resolutionNote: string;
    timeSpentMinutes?: number;
    materialsUsed?: {
      name: string;
      quantity: number;
      unit?: string;
    }[];
  }
) => {
  await assertTicketOwner(ticketId, userId);

  const currentTicket = await prisma.maintenanceTicket.findUnique({
    where: {
      id: ticketId,
    },
    select: {
      startedAt: true,
    },
  });

  if (!currentTicket) {
    throw createHttpError("Ticket introuvable", 404);
  }

  const resolvedStatus = await findStatusByCodes(["RESOLVED", "resolved"]);

  if (!resolvedStatus) {
    throw createHttpError("Statut RESOLVED introuvable", 500);
  }

  const resolvedAt = new Date();

  const calculatedTimeSpentMinutes = currentTicket.startedAt
    ? Math.max(
        1,
        Math.round(
          (resolvedAt.getTime() - currentTicket.startedAt.getTime()) / 60000
        )
      )
    : undefined;

  const result = await prisma.$transaction(async (tx) => {
    const ticket = await tx.maintenanceTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        statusId: resolvedStatus.id,
        resolvedAt,
        progress: 100,
        resolutionNote: body.resolutionNote,
        timeSpentMinutes:
          body.timeSpentMinutes ?? calculatedTimeSpentMinutes,
      },
      include: ticketInclude,
    });

    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "RESOLVED",
        message: body.resolutionNote,
      },
    });

    if (body.materialsUsed?.length) {
      await tx.maintenanceInterventionMaterial.createMany({
        data: body.materialsUsed.map((material) => ({
          ticketId,
          name: material.name,
          quantity: material.quantity,
          unit: material.unit,
        })),
      });
    }

    return ticket;
  });

  return result;
},
  addNote: async (
    userId: number,
    ticketId: number,
    body: {
      comment: string;
      isInternal?: boolean;
    }
  ) => {
    await assertTicketOwner(ticketId, userId);

    const note = await prisma.maintenanceComment.create({
      data: {
        ticketId,
        userId,
        comment: body.comment,
        isInternal: body.isInternal ?? true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "NOTE_ADDED",
        message: body.comment,
      },
    });

    return note;
  },

  addPhoto: async (
    userId: number,
    ticketId: number,
    file: Express.Multer.File,
    body: {
      photoType?: string;
      caption?: string;
    }
  ) => {
    await assertTicketOwner(ticketId, userId);

    const attachment = await prisma.maintenanceAttachment.create({
      data: {
        ticketId,
        filePath: `/uploads/${file.filename}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedByUserId: userId,
        photoType: body.photoType || "AFTER",
        caption: body.caption,
      },
    });

    await prisma.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "PHOTO_ADDED",
        message: "Photo ajoutée par l’agent",
        metadata: {
          attachmentId: attachment.id,
        },
      },
    });

    return attachment;
  },

  updateAvailability: async (userId: number, availabilityStatus: string) => {
    return prisma.maintenanceAgentProfile.update({
      where: {
        userId,
      },
      data: {
        availabilityStatus,
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
  },
};