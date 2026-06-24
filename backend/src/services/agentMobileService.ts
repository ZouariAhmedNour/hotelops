import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";
import {
  assessTicketSafety,
  persistTicketRiskAssessment,
} from "./safetyAssessmentService";

type PartialResolveTaskInput = {
  temporaryFixNote: string;
  followUpTitle?: string;
  followUpDescription: string;
  followUpPriorityId?: number;
  followUpCategoryId?: number;
  requiresExpertIntervention?: boolean;
  expertReason: string;
  recommendedSpecialty?: string;
  timeSpentMinutes?: number;
  materialsUsed?: {
    name: string;
    quantity: number;
    unit?: string;
  }[];
};

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
};

const linkedTicketSelect = {
  id: true,
  ticketNumber: true,
  title: true,
  parentTicketId: true,
  reportedFrom: true,
  progress: true,
  temporaryFixNote: true,
  followUpReason: true,
  recommendedSpecialty: true,
  requiresExpertIntervention: true,
  createdAt: true,

  status: {
    select: {
      id: true,
      name: true,
      code: true,
      color: true,
      isFinal: true,
    },
  },

  priority: {
    select: {
      id: true,
      name: true,
      code: true,
      sortOrder: true,
    },
  },

  category: {
    select: {
      id: true,
      name: true,
      icon: true,
    },
  },

  location: {
    select: {
      id: true,
      name: true,
      code: true,
      floor: true,
      zone: true,
      roomNumber: true,
    },
  },
} satisfies Prisma.MaintenanceTicketSelect;

const ticketInclude: Prisma.MaintenanceTicketInclude = {
  location: true,
  category: true,
  priority: true,
  status: true,

  reportedBy: {
    select: userSelect,
  },

  assignedTo: {
    select: userSelect,
  },

  parentTicket: {
    select: linkedTicketSelect,
  },

  followUpTickets: {
    select: linkedTicketSelect,
    orderBy: {
      createdAt: "desc",
    },
  },

  ticketAssets: {
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "asc",
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
  include: {
    uploadedBy: {
      select: userSelect,
    },
  },
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

  _count: {
    select: {
      comments: true,
      attachments: true,
      events: true,
      materials: true,
      ticketAssets: true,
      followUpTickets: true,
    },
  },
};

const createHttpError = (message: string, statusCode: number) => {
  const err = new Error(message) as Error & {
    statusCode?: number;
  };

  err.statusCode = statusCode;

  return err;
};

const normalizeStatusCode = (value?: string | null) => {
  return (value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

const getStatusCodeVariants = (codes: string[]) => {
  return [
    ...new Set(
      codes.flatMap((rawCode) => {
        const normalized = normalizeStatusCode(rawCode);

        return [
          rawCode.trim(),
          normalized,
          normalized.toLowerCase(),
          normalized.replace(/_/g, "-"),
          normalized.replace(/_/g, " "),
        ];
      })
    ),
  ].filter(Boolean);
};

const findStatusByCodes = async (codes: string[]) => {
  const variants = getStatusCodeVariants(codes);

  if (variants.length === 0) {
    return null;
  }

  return prisma.maintenanceStatus.findFirst({
    where: {
      OR: variants.map((code) => ({
        code: {
          equals: code,
          mode: "insensitive",
        },
      })),
    },
    orderBy: {
      id: "asc",
    },
  });
};

const isFinalStatus = (status: {
  code?: string | null;
  isFinal?: boolean | null;
}) => {
  const code = normalizeStatusCode(status.code);

  return (
    status.isFinal === true ||
    code === "RESOLVED" ||
    code === "CLOSED" ||
    code === "CANCELLED" ||
    code === "CANCELED"
  );
};

const isPartiallyResolvedStatus = (status: {
  code?: string | null;
}) => {
  const code = normalizeStatusCode(status.code);

  return (
    code === "PARTIALLY_RESOLVED" ||
    code === "PARTIAL_RESOLVED"
  );
};

const assertTicketOwner = async (ticketId: number, userId: number) => {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: {
      id: ticketId,
    },
    select: {
      id: true,
      ticketNumber: true,
      assignedToUserId: true,
      statusId: true,
      acceptedAt: true,
      startedAt: true,
      resolvedAt: true,
      status: {
        select: {
          id: true,
          code: true,
          name: true,
          isFinal: true,
        },
      },
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

const assertTaskCanBeWorked = async (
  ticketId: number,
  userId: number
) => {
  const ticket = await assertTicketOwner(ticketId, userId);

  if (isFinalStatus(ticket.status)) {
    throw createHttpError(
      "Ce ticket est finalisé et ne peut plus être modifié.",
      409
    );
  }

  if (isPartiallyResolvedStatus(ticket.status)) {
    throw createHttpError(
      "Ce ticket est déjà partiellement résolu et possède déjà une suite.",
      409
    );
  }

  return ticket;
};

const generateTicketNumber = async (
  tx: Prisma.TransactionClient
): Promise<string> => {
  const count = await tx.maintenanceTicket.count();

  return `TKT-${String(count + 1).padStart(6, "0")}`;
};

const optionalText = (value?: string) => {
  const normalized = value?.trim();

  return normalized ? normalized : null;
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

    const inProgressStatus = await findStatusByCodes([
      "IN_PROGRESS",
      "in_progress",
    ]);

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
            statusId: inProgressStatus?.id ?? -1,
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
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));

    const where: Prisma.MaintenanceTicketWhereInput = {
      assignedToUserId: userId,
    };

    if (query.statusCode?.trim()) {
      const requestedStatus = await findStatusByCodes([
        query.statusCode,
      ]);

      if (!requestedStatus) {
        return {
          tasks: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      where.statusId = requestedStatus.id;
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
    const ownedTicket = await assertTaskCanBeWorked(ticketId, userId);

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
          fromStatusId: ownedTicket.statusId,
          toStatusId: assignedStatus.id,
          message: "Intervention acceptée par l’agent",
        },
      }),
    ]);

    return ticket;
  },

  startTask: async (userId: number, ticketId: number) => {
    const ownedTicket = await assertTaskCanBeWorked(ticketId, userId);

    const inProgressStatus = await findStatusByCodes([
      "IN_PROGRESS",
      "in_progress",
    ]);

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
          startedAt: ownedTicket.startedAt ?? new Date(),
          progress: Math.max(10, 0),
        },
        include: ticketInclude,
      }),

      prisma.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "STARTED",
          fromStatusId: ownedTicket.statusId,
          toStatusId: inProgressStatus.id,
          message: "Intervention démarrée par l’agent",
        },
      }),
    ]);

    return ticket;
  },

  pauseTask: async (
    userId: number,
    ticketId: number,
    reason?: string
  ) => {
    const ownedTicket = await assertTaskCanBeWorked(ticketId, userId);

    const pendingStatus = await findStatusByCodes(["PENDING"]);

    if (!pendingStatus) {
      throw createHttpError("Statut PENDING introuvable", 500);
    }

    const message = reason?.trim() || "Intervention mise en pause";

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
          fromStatusId: ownedTicket.statusId,
          toStatusId: pendingStatus.id,
          message,
        },
      }),
    ]);

    return ticket;
  },

  pendingParts: async (
    userId: number,
    ticketId: number,
    reason?: string
  ) => {
    const ownedTicket = await assertTaskCanBeWorked(ticketId, userId);

    const pendingStatus = await findStatusByCodes(["PENDING"]);

    if (!pendingStatus) {
      throw createHttpError("Statut PENDING introuvable", 500);
    }

    const message = reason?.trim() || "En attente de pièces";

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
          fromStatusId: ownedTicket.statusId,
          toStatusId: pendingStatus.id,
          message,
        },
      }),
    ]);

    return ticket;
  },

  needHelp: async (
    userId: number,
    ticketId: number,
    reason?: string
  ) => {
    await assertTaskCanBeWorked(ticketId, userId);

    const message = reason?.trim() || "Besoin d’aide";

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
    await assertTaskCanBeWorked(ticketId, userId);

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
          message:
            note?.trim() ||
            `Progression mise à jour : ${safeProgress}%`,
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
    const ownedTicket = await assertTaskCanBeWorked(ticketId, userId);

    const resolvedStatus = await findStatusByCodes([
      "RESOLVED",
      "resolved",
    ]);

    if (!resolvedStatus) {
      throw createHttpError("Statut RESOLVED introuvable", 500);
    }

    const resolvedAt = new Date();

    const calculatedTimeSpentMinutes = ownedTicket.startedAt
      ? Math.max(
          1,
          Math.round(
            (resolvedAt.getTime() -
              ownedTicket.startedAt.getTime()) /
              60000
          )
        )
      : undefined;

    return prisma.$transaction(async (tx) => {
      await tx.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          statusId: resolvedStatus.id,
          resolvedAt,
          progress: 100,
          resolutionNote: body.resolutionNote.trim(),
          timeSpentMinutes:
            body.timeSpentMinutes ?? calculatedTimeSpentMinutes,
        },
      });

      await tx.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "RESOLVED",
          fromStatusId: ownedTicket.statusId,
          toStatusId: resolvedStatus.id,
          message: body.resolutionNote.trim(),
        },
      });

      if (body.materialsUsed?.length) {
        await tx.maintenanceInterventionMaterial.createMany({
          data: body.materialsUsed.map((material) => ({
            ticketId,
            name: material.name.trim(),
            quantity: material.quantity,
            unit: optionalText(material.unit),
          })),
        });
      }

      const resolvedTicket = await tx.maintenanceTicket.findUnique({
        where: {
          id: ticketId,
        },
        include: ticketInclude,
      });

      if (!resolvedTicket) {
        throw createHttpError("Ticket introuvable après résolution", 500);
      }

      return resolvedTicket;
    });
  },

  partialResolveTask: async (
    userId: number,
    ticketId: number,
    body: PartialResolveTaskInput
  ) => {
    await assertTaskCanBeWorked(ticketId, userId);

    const originalTicket = await prisma.maintenanceTicket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        location: true,
        category: true,
        priority: true,
        status: true,
        ticketAssets: {
          select: {
            assetId: true,
          },
        },
      },
    });

    if (!originalTicket) {
      throw createHttpError("Ticket introuvable", 404);
    }

    if (originalTicket.assignedToUserId !== userId) {
      throw createHttpError("Accès interdit à ce ticket", 403);
    }

    if (
      isFinalStatus(originalTicket.status) ||
      isPartiallyResolvedStatus(originalTicket.status)
    ) {
      throw createHttpError(
        "Ce ticket ne peut plus être partiellement résolu.",
        409
      );
    }

    const followUpCategoryId =
      body.followUpCategoryId ?? originalTicket.categoryId;

    const followUpPriorityId =
      body.followUpPriorityId ?? originalTicket.priorityId;

    const [
      followUpCategory,
      followUpPriority,
      initialStatus,
      partialResolvedStatus,
    ] = await Promise.all([
      prisma.maintenanceCategory.findUnique({
        where: {
          id: followUpCategoryId,
        },
      }),

      prisma.maintenancePriority.findUnique({
        where: {
          id: followUpPriorityId,
        },
      }),

      findStatusByCodes(["NEW", "OPEN", "new", "open"]),

      findStatusByCodes([
        "PARTIALLY_RESOLVED",
        "PARTIAL_RESOLVED",
        "partially_resolved",
        "partial_resolved",
      ]),
    ]);

    if (!followUpCategory || !followUpCategory.isActive) {
      throw createHttpError(
        "La catégorie du ticket de suivi est introuvable ou inactive.",
        400
      );
    }

    if (!followUpPriority) {
      throw createHttpError(
        "La priorité du ticket de suivi est introuvable.",
        400
      );
    }

    if (!initialStatus) {
      throw createHttpError(
        "Statut initial NEW ou OPEN introuvable.",
        500
      );
    }

    if (!partialResolvedStatus) {
      throw createHttpError(
        "Statut PARTIALLY_RESOLVED introuvable. Exécutez le seed des statuts.",
        500
      );
    }

    const existingActiveFollowUp =
      await prisma.maintenanceTicket.findFirst({
        where: {
          parentTicketId: ticketId,
          status: {
            isFinal: false,
          },
        },
        select: {
          id: true,
          ticketNumber: true,
        },
      });

    if (existingActiveFollowUp) {
      throw createHttpError(
        `Un ticket de suivi actif existe déjà : ${existingActiveFollowUp.ticketNumber}.`,
        409
      );
    }

    const temporaryFixNote = body.temporaryFixNote.trim();
    const expertReason = body.expertReason.trim();
    const followUpTitle =
      body.followUpTitle?.trim() ||
      `Suite intervention - ${originalTicket.ticketNumber}`;

    const followUpDescription = [
      `Ticket de suivi créé depuis ${originalTicket.ticketNumber}.`,
      "",
      body.followUpDescription.trim(),
      "",
      "Solution temporaire appliquée sur le ticket original :",
      temporaryFixNote,
      "",
      "Pourquoi une intervention lourde est nécessaire :",
      expertReason,
      body.recommendedSpecialty?.trim()
        ? `Spécialité recommandée : ${body.recommendedSpecialty.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const safetyAssessment = await assessTicketSafety({
      title: followUpTitle,
      description: followUpDescription,
      urgencyLevel: originalTicket.urgencyLevel,
      category: followUpCategory,
      priority: followUpPriority,
      location: originalTicket.location,
    });

    const partialResolvedAt = new Date();

    const calculatedTimeSpentMinutes = originalTicket.startedAt
      ? Math.max(
          1,
          Math.round(
            (partialResolvedAt.getTime() -
              originalTicket.startedAt.getTime()) /
              60000
          )
        )
      : undefined;

    return prisma.$transaction(async (tx) => {
     const currentOriginal = await tx.maintenanceTicket.findUnique({
  where: {
    id: ticketId,
  },
  include: {
    status: true,

    ticketAssets: {
      select: {
        assetId: true,
      },
    },
  },
});

      if (!currentOriginal) {
        throw createHttpError("Ticket original introuvable", 404);
      }

      if (currentOriginal.assignedToUserId !== userId) {
        throw createHttpError("Accès interdit à ce ticket", 403);
      }

      if (
        isFinalStatus(currentOriginal.status) ||
        isPartiallyResolvedStatus(currentOriginal.status)
      ) {
        throw createHttpError(
          "Le ticket a déjà été finalisé ou partiellement résolu.",
          409
        );
      }

      const duplicateFollowUp =
        await tx.maintenanceTicket.findFirst({
          where: {
            parentTicketId: ticketId,
            status: {
              isFinal: false,
            },
          },
          select: {
            id: true,
            ticketNumber: true,
          },
        });

      if (duplicateFollowUp) {
        throw createHttpError(
          `Un ticket de suivi existe déjà : ${duplicateFollowUp.ticketNumber}.`,
          409
        );
      }

      let dueAt: Date | null = null;

      if (followUpPriority.slaHours) {
        dueAt = new Date(
          Date.now() + followUpPriority.slaHours * 60 * 60 * 1000
        );
      }

      const followUpTicketNumber = await generateTicketNumber(tx);

      const followUpTicket = await tx.maintenanceTicket.create({
        data: {
          ticketNumber: followUpTicketNumber,
          title: followUpTitle,
          description: followUpDescription,

          locationId: originalTicket.locationId,
          categoryId: followUpCategory.id,
          priorityId: followUpPriority.id,
          statusId: initialStatus.id,

          reportedByUserId: userId,
          reportedFrom: "agent_follow_up",
          urgencyLevel: originalTicket.urgencyLevel,
          dueAt,

          parentTicketId: ticketId,
        },
      });

      const sourceAgentAttachments = await tx.maintenanceAttachment.findMany({
  where: {
    ticketId,
    uploadedByUserId: userId,
  },
  select: {
    filePath: true,
    fileName: true,
    mimeType: true,
    fileSize: true,
    uploadedByUserId: true,
    photoType: true,
    caption: true,
  },
});

let copiedAttachmentCount = 0;

if (sourceAgentAttachments.length > 0) {
  const copiedAttachments = await tx.maintenanceAttachment.createMany({
    data: sourceAgentAttachments.map((attachment) => ({
      ticketId: followUpTicket.id,

      // Le ticket de suivi pointe vers le même fichier physique.
      filePath: attachment.filePath,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,

      // L’agent qui a pris la photo reste l’auteur.
      uploadedByUserId: attachment.uploadedByUserId,

      photoType: attachment.photoType,

      // Rend visible l’origine de la photo dans le dashboard.
      caption: attachment.caption
        ? `${attachment.caption} — Copiée depuis ${originalTicket.ticketNumber}`
        : `Photo agent copiée depuis ${originalTicket.ticketNumber}`,
    })),
  });

  copiedAttachmentCount = copiedAttachments.count;
}

      if (currentOriginal.ticketAssets.length > 0) {
        await tx.maintenanceTicketAsset.createMany({
          data: currentOriginal.ticketAssets.map((item) => ({
            ticketId: followUpTicket.id,
            assetId: item.assetId,
          })),
          skipDuplicates: true,
        });
      }

    

      await persistTicketRiskAssessment(
        tx,
        followUpTicket.id,
        safetyAssessment
      );

      if (body.materialsUsed?.length) {
        await tx.maintenanceInterventionMaterial.createMany({
          data: body.materialsUsed.map((material) => ({
            ticketId,
            name: material.name.trim(),
            quantity: material.quantity,
            unit: optionalText(material.unit),
          })),
        });
      }

      await tx.maintenanceTicketEvent.create({
        data: {
          ticketId: followUpTicket.id,
          userId,
          type: "CREATED_FROM_PARTIAL_RESOLUTION",
          toStatusId: initialStatus.id,
          message: `Ticket de suivi créé depuis ${originalTicket.ticketNumber}`,
          metadata: {
            parentTicketId: ticketId,
            parentTicketNumber: originalTicket.ticketNumber,
            copiedAgentAttachmentCount: copiedAttachmentCount,
            requiresExpertIntervention:
              body.requiresExpertIntervention ?? false,
            recommendedSpecialty:
              optionalText(body.recommendedSpecialty),
          },
        },
      });

      await tx.maintenanceTicketEvent.create({
  data: {
    ticketId: followUpTicket.id,
    userId,
    type: "AGENT_ATTACHMENTS_COPIED",
    message:
      copiedAttachmentCount > 0
        ? `${copiedAttachmentCount} photo(s) ou pièce(s) jointe(s) récupérée(s) depuis ${originalTicket.ticketNumber}.`
        : "Aucune photo agent à récupérer depuis le ticket original.",
    metadata: {
      parentTicketId: ticketId,
      parentTicketNumber: originalTicket.ticketNumber,
      copiedAttachmentCount,
    },
  },
});

      await tx.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId,
          type: "PARTIALLY_RESOLVED",
          fromStatusId: currentOriginal.statusId,
          toStatusId: partialResolvedStatus.id,
          message: temporaryFixNote,
        metadata: {
  followUpTicketId: followUpTicket.id,
  followUpTicketNumber,
  requiresExpertIntervention:
    body.requiresExpertIntervention ?? false,
  recommendedSpecialty: optionalText(body.recommendedSpecialty),
  expertReason,
  copiedAgentAttachmentCount: copiedAttachmentCount,
},
        },
      });

      const updatedOriginalTicket = await tx.maintenanceTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          statusId: partialResolvedStatus.id,
          progress: 85,

          resolutionNote: temporaryFixNote,
          temporaryFixNote,
          followUpReason: expertReason,
          recommendedSpecialty:
            optionalText(body.recommendedSpecialty),

          requiresExpertIntervention:
            body.requiresExpertIntervention ?? false,

          followUpCreatedAt: partialResolvedAt,

          timeSpentMinutes:
            body.timeSpentMinutes ?? calculatedTimeSpentMinutes,
        },
        include: ticketInclude,
      });

      const hydratedFollowUpTicket =
        await tx.maintenanceTicket.findUnique({
          where: {
            id: followUpTicket.id,
          },
          include: ticketInclude,
        });

      if (!hydratedFollowUpTicket) {
        throw createHttpError(
          "Ticket de suivi introuvable après création.",
          500
        );
      }

      return {
        originalTicket: updatedOriginalTicket,
        followUpTicket: hydratedFollowUpTicket,
      };
    });
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
        comment: body.comment.trim(),
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
        message: body.comment.trim(),
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
        caption: optionalText(body.caption),
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

  updateAvailability: async (
    userId: number,
    availabilityStatus: string
  ) => {
    return prisma.maintenanceAgentProfile.update({
      where: {
        userId,
      },
      data: {
        availabilityStatus: availabilityStatus.trim().toUpperCase(),
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