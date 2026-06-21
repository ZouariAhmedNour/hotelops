import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";
import {
  assessTicketSafety,
  evaluateAgentSafetyEligibility,
  persistTicketRiskAssessment,
} from "./safetyAssessmentService";
import { validateAssetsForLocation } from "./assetService";

export type CreateTicketInput = {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom?: string;
  urgencyLevel?: number;
  assetIds?: number[];
};

export type ListTicketsQuery = {
  page?: string;
  limit?: string;

  statusId?: string;
  priorityId?: string;
  assignedToUserId?: string;
  locationId?: string;
  categoryId?: string;

  statusCode?: string;
  priorityCode?: string;
  search?: string;

  unassignedOnly?: string;
  overdueOnly?: string;
  reportedFrom?: string;

  dateFrom?: string;
  dateTo?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
};

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

  validatedBy: {
    select: userSelect,
  },

  riskAssessment: true,

  ticketAssets: {
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },

  _count: {
    select: {
      comments: true,
      attachments: true,
      events: true,
      materials: true,
      ticketAssets: true,
    },
  },
};

const ticketDetailInclude: Prisma.MaintenanceTicketInclude = {
  ...ticketInclude,

  comments: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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

  assignments: {
    include: {
      assignedTo: {
        select: userSelect,
      },
      assignedBy: {
        select: userSelect,
      },
    },
    orderBy: {
      assignedAt: "desc",
    },
  },

  events: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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

const normalizeStatusCode = (code: string) => code.trim().toUpperCase();

const generateTicketNumber = async (): Promise<string> => {
  const count = await prisma.maintenanceTicket.count();

  return `TKT-${String(count + 1).padStart(6, "0")}`;
};

const findStatusByCodes = async (codes: string[]) => {
  return prisma.maintenanceStatus.findFirst({
    where: {
      code: {
        in: codes,
      },
    },
  });
};

export const createTicket = async (
  data: CreateTicketInput,
  userId: number,
  files: Express.Multer.File[] = []
) => {
  const ticketNumber = await generateTicketNumber();

  const [location, category, priority, user] = await Promise.all([
    prisma.location.findUnique({
      where: {
        id: data.locationId,
      },
    }),

    prisma.maintenanceCategory.findUnique({
      where: {
        id: data.categoryId,
      },
    }),

    prisma.maintenancePriority.findUnique({
      where: {
        id: data.priorityId,
      },
    }),

    prisma.user.findUnique({
      where: {
        id: userId,
      },
    }),
  ]);

  if (!location) {
    throw Object.assign(new Error("Localisation introuvable"), {
      statusCode: 404,
    });
  }

  if (!category) {
    throw Object.assign(new Error("Catégorie introuvable"), {
      statusCode: 404,
    });
  }

  if (!priority) {
    throw Object.assign(new Error("Priorité introuvable"), {
      statusCode: 404,
    });
  }

  if (!user) {
    throw Object.assign(new Error("Utilisateur introuvable"), {
      statusCode: 404,
    });
  }

  const selectedAssetIds = await validateAssetsForLocation(
    data.locationId,
    data.assetIds ?? []
  );

  const safetyAssessment = await assessTicketSafety({
    title: data.title,
    description: data.description,
    urgencyLevel: data.urgencyLevel,
    category,
    priority,
    location,
  });

  let dueAt: Date | null = null;

  if (priority.slaHours) {
    dueAt = new Date(Date.now() + priority.slaHours * 3600000);
  }

  const initialStatus = await findStatusByCodes(["NEW", "OPEN"]);

  if (!initialStatus) {
    throw Object.assign(
      new Error("Statut initial introuvable. Créez NEW ou OPEN dans la base."),
      {
        statusCode: 500,
      }
    );
  }

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.maintenanceTicket.create({
      data: {
        ticketNumber,
        title: data.title.trim(),
        description: data.description.trim(),

        locationId: data.locationId,
        categoryId: data.categoryId,
        priorityId: data.priorityId,
        statusId: initialStatus.id,

        reportedByUserId: userId,
        reportedFrom: data.reportedFrom,
        urgencyLevel: data.urgencyLevel,
        dueAt,
      },
    });

    if (selectedAssetIds.length > 0) {
      await tx.maintenanceTicketAsset.createMany({
        data: selectedAssetIds.map((assetId) => ({
          ticketId: ticket.id,
          assetId,
        })),
      });
    }

    await persistTicketRiskAssessment(tx, ticket.id, safetyAssessment);

    if (files.length > 0) {
      await tx.maintenanceAttachment.createMany({
        data: files.map((file) => ({
          ticketId: ticket.id,
          filePath: `/uploads/${file.filename}`,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          uploadedByUserId: userId,
          photoType: "BEFORE",
        })),
      });
    }

    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId: ticket.id,
        userId,
        type: "CREATED",
        toStatusId: initialStatus.id,
        message: "Ticket créé",
        metadata: {
          ticketNumber,
          reportedFrom: data.reportedFrom ?? null,
          assetIds: selectedAssetIds,
          riskLevel: safetyAssessment.riskLevel,
          riskScore: safetyAssessment.riskScore,
          requiresCertifiedAgent:
            safetyAssessment.requiresCertifiedAgent,
        },
      },
    });

    const created = await tx.maintenanceTicket.findUnique({
      where: {
        id: ticket.id,
      },
      include: ticketDetailInclude,
    });

    if (!created) {
      throw Object.assign(new Error("Ticket introuvable après création"), {
        statusCode: 500,
      });
    }

    return created;
  });
};

export const listTickets = async (query: ListTicketsQuery) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const where: Prisma.MaintenanceTicketWhereInput = {};

  if (query.statusId) where.statusId = Number(query.statusId);
  if (query.priorityId) where.priorityId = Number(query.priorityId);

  if (query.assignedToUserId) {
    where.assignedToUserId = Number(query.assignedToUserId);
  }

  if (query.locationId) where.locationId = Number(query.locationId);
  if (query.categoryId) where.categoryId = Number(query.categoryId);

  if (query.statusCode) {
    where.status = {
      code: normalizeStatusCode(query.statusCode),
    };
  }

  if (query.priorityCode) {
    where.priority = {
      code: normalizeStatusCode(query.priorityCode),
    };
  }

  if (query.unassignedOnly === "true") {
    where.assignedToUserId = null;
  }

  if (query.reportedFrom) {
    where.reportedFrom = query.reportedFrom;
  }

  if (query.overdueOnly === "true") {
    where.dueAt = {
      lt: new Date(),
    };

    where.status = {
      isFinal: false,
    };
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};

    if (query.dateFrom) {
      where.createdAt.gte = new Date(query.dateFrom);
    }

    if (query.dateTo) {
      where.createdAt.lte = new Date(query.dateTo);
    }
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        ticketNumber: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where,
      skip,
      take: limit,
      include: ticketInclude,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.maintenanceTicket.count({ where }),
  ]);

  return {
    data: tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTicketById = async (id: number) => {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id },
    include: ticketDetailInclude,
  });

  if (!ticket) {
    throw Object.assign(new Error("Ticket introuvable"), {
      statusCode: 404,
    });
  }

  return ticket;
};

export const assignTicket = async (
  ticketId: number,
  assignedToUserId: number,
  assignedByUserId: number,
  note?: string
) => {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      status: true,
      category: true,
      priority: true,
      location: true,
    },
  });

  if (!ticket) {
    throw Object.assign(new Error("Ticket introuvable"), {
      statusCode: 404,
    });
  }

  const assignedUser = await prisma.user.findUnique({
    where: {
      id: assignedToUserId,
    },
    include: {
      role: true,

      agentProfile: {
        include: {
          skills: {
            include: {
              skill: true,
            },
          },

          certifications: {
            include: {
              certification: true,
            },
          },
        },
      },
    },
  });

  if (!assignedUser || !assignedUser.isActive) {
    throw Object.assign(new Error("Agent introuvable ou inactif"), {
      statusCode: 404,
    });
  }

  if (assignedUser.role.code !== "MAINTENANCE_AGENT") {
    throw Object.assign(
      new Error(
        "L'utilisateur sélectionné n'est pas un agent de maintenance."
      ),
      {
        statusCode: 400,
      }
    );
  }

  if (!assignedUser.agentProfile) {
    throw Object.assign(
      new Error("Le profil technique de cet agent est introuvable."),
      {
        statusCode: 400,
      }
    );
  }

  const safetyAssessment = await assessTicketSafety({
    title: ticket.title,
    description: ticket.description,
    urgencyLevel: ticket.urgencyLevel,
    category: ticket.category,
    priority: ticket.priority,
    location: ticket.location,
  });

  const safetyEligibility = evaluateAgentSafetyEligibility(
    assignedUser.agentProfile,
    safetyAssessment
  );

  if (!safetyEligibility.safetyEligible) {
    await prisma.$transaction(async (tx) => {
      await persistTicketRiskAssessment(tx, ticketId, safetyAssessment);

      await tx.maintenanceTicketEvent.create({
        data: {
          ticketId,
          userId: assignedByUserId,
          type: "ASSIGNMENT_BLOCKED_SAFETY",
          fromStatusId: ticket.statusId,
          toStatusId: ticket.statusId,
          message:
            "Assignation refusée : exigences de sécurité non respectées.",
          metadata: {
            assignedToUserId,
            riskLevel: safetyAssessment.riskLevel,
            riskScore: safetyAssessment.riskScore,

            missingSkillCodes: safetyEligibility.missingSkills.map(
              (item) => item.code
            ),

            missingCertificationCodes:
              safetyEligibility.missingCertifications.map(
                (item) => item.code
              ),

            expiredCertificationCodes:
              safetyEligibility.expiredCertifications.map(
                (item) => item.code
              ),

            criticalAuthorizationMissing:
              safetyEligibility.criticalAuthorizationMissing,
          },
        },
      });
    });

    throw Object.assign(
      new Error(
        "Assignation refusée : l’agent ne possède pas les certifications obligatoires pour cette intervention."
      ),
      {
        statusCode: 422,
        code: "SAFETY_ASSIGNMENT_BLOCKED",
        details: safetyEligibility,
      }
    );
  }

  const assignedStatus = await findStatusByCodes([
    "ASSIGNED",
    "OPEN",
    "NEW",
  ]);

  if (!assignedStatus) {
    throw Object.assign(
      new Error("Statut ASSIGNED introuvable. Créez ASSIGNED dans la base."),
      {
        statusCode: 500,
      }
    );
  }

  return prisma.$transaction(async (tx) => {
    await persistTicketRiskAssessment(tx, ticketId, safetyAssessment);

    await tx.maintenanceAssignment.updateMany({
      where: {
        ticketId,
        unassignedAt: null,
      },
      data: {
        unassignedAt: new Date(),
      },
    });

    await tx.maintenanceAssignment.create({
      data: {
        ticketId,
        assignedToUserId,
        assignedByUserId,
        note,
      },
    });

    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId: assignedByUserId,
        type: "ASSIGNED",
        fromStatusId: ticket.statusId,
        toStatusId: assignedStatus.id,
        message: note || "Ticket assigné",
        metadata: {
          assignedToUserId,
          riskLevel: safetyAssessment.riskLevel,
          riskScore: safetyAssessment.riskScore,
          requiresCertifiedAgent:
            safetyAssessment.requiresCertifiedAgent,
        },
      },
    });

    return tx.maintenanceTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        assignedToUserId,
        statusId: assignedStatus.id,
      },
      include: ticketDetailInclude,
    });
  });
};

export const changeStatus = async (
  ticketId: number,
  statusCode: string,
  userId: number,
  message?: string
) => {
  const normalizedStatusCode = normalizeStatusCode(statusCode);

  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: ticketId },
    include: {
      status: true,
    },
  });

  if (!ticket) {
    throw Object.assign(new Error("Ticket introuvable"), {
      statusCode: 404,
    });
  }

  const status = await prisma.maintenanceStatus.findUnique({
    where: {
      code: normalizedStatusCode,
    },
  });

  if (!status) {
    throw Object.assign(new Error("Statut invalide"), {
      statusCode: 400,
    });
  }

  const updateData: Prisma.MaintenanceTicketUncheckedUpdateInput = {
    statusId: status.id,
  };

  if (normalizedStatusCode === "IN_PROGRESS" && !ticket.startedAt) {
    updateData.startedAt = new Date();
  }

  if (normalizedStatusCode === "RESOLVED") {
    updateData.resolvedAt = new Date();
    updateData.progress = 100;
  }

  if (
    normalizedStatusCode === "CLOSED" ||
    normalizedStatusCode === "CANCELLED"
  ) {
    updateData.closedAt = new Date();
  }

  return prisma.$transaction(async (tx) => {
    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "STATUS_CHANGED",
        fromStatusId: ticket.statusId,
        toStatusId: status.id,
        message: message || `Statut changé vers ${normalizedStatusCode}`,
        metadata: {
          from: ticket.status.code,
          to: normalizedStatusCode,
        },
      },
    });

    return tx.maintenanceTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: ticketDetailInclude,
    });
  });
};

export const addComment = async (
  ticketId: number,
  userId: number,
  comment: string,
  isInternal = false
) => {
  await getTicketById(ticketId);

  return prisma.$transaction(async (tx) => {
    const createdComment = await tx.maintenanceComment.create({
      data: {
        ticketId,
        userId,
        comment,
        isInternal,
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
      },
    });

    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "COMMENT_ADDED",
        message: isInternal ? "Commentaire interne ajouté" : "Commentaire ajouté",
      },
    });

    return createdComment;
  });
};

export const addAttachment = async (
  ticketId: number,
  userId: number,
  file: Express.Multer.File,
  photoType?: string,
  caption?: string
) => {
  await getTicketById(ticketId);

  return prisma.$transaction(async (tx) => {
    const attachment = await tx.maintenanceAttachment.create({
      data: {
        ticketId,
        uploadedByUserId: userId,
        filePath: `/uploads/${file.filename}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        photoType,
        caption,
      },
      include: {
        uploadedBy: {
          select: userSelect,
        },
      },
    });

    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "ATTACHMENT_ADDED",
        message: "Pièce jointe ajoutée",
        metadata: {
          fileName: file.originalname,
          photoType: photoType ?? null,
        },
      },
    });

    return attachment;
  });
};

export const addMaterial = async (
  ticketId: number,
  userId: number,
  body: {
    name: string;
    quantity?: number;
    unit?: string;
  }
) => {
  await getTicketById(ticketId);

  return prisma.$transaction(async (tx) => {
    const material = await tx.maintenanceInterventionMaterial.create({
      data: {
        ticketId,
        name: body.name,
        quantity: body.quantity ?? 1,
        unit: body.unit,
      },
    });

    await tx.maintenanceTicketEvent.create({
      data: {
        ticketId,
        userId,
        type: "MATERIAL_ADDED",
        message: `Matériel ajouté : ${body.name}`,
        metadata: {
          name: body.name,
          quantity: body.quantity ?? 1,
          unit: body.unit ?? null,
        },
      },
    });

    return material;
  });
};

export const getStatsOverview = async () => {
  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const [
    total,
    newCount,
    assigned,
    inProgress,
    critical,
    resolvedToday,
    overdue,
    resolutionData,
  ] = await Promise.all([
    prisma.maintenanceTicket.count(),

    prisma.maintenanceTicket.count({
      where: {
        status: {
          code: {
            in: ["NEW", "OPEN"],
          },
        },
      },
    }),

    prisma.maintenanceTicket.count({
      where: {
        status: {
          code: "ASSIGNED",
        },
      },
    }),

    prisma.maintenanceTicket.count({
      where: {
        status: {
          code: "IN_PROGRESS",
        },
      },
    }),

    prisma.maintenanceTicket.count({
      where: {
        priority: {
          code: "CRITICAL",
        },
      },
    }),

    prisma.maintenanceTicket.count({
      where: {
        status: {
          code: "RESOLVED",
        },
        resolvedAt: {
          gte: todayStart,
        },
      },
    }),

    prisma.maintenanceTicket.count({
      where: {
        dueAt: {
          lt: now,
        },
        status: {
          isFinal: false,
        },
      },
    }),

    prisma.maintenanceTicket.findMany({
      where: {
        resolvedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    }),
  ]);

  let averageResolutionHours = 0;

  if (resolutionData.length > 0) {
    const totalHours = resolutionData.reduce((acc, ticket) => {
      if (!ticket.resolvedAt) {
        return acc;
      }

      return (
        acc +
        (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 3600000
      );
    }, 0);

    averageResolutionHours = Math.round(totalHours / resolutionData.length);
  }

  return {
    total,
    new: newCount,
    assigned,
    inProgress,
    critical,
    overdue,
    resolvedToday,
    averageResolutionHours,
  };
};

export const getStatsCharts = async () => {
  const byStatus = await prisma.maintenanceStatus.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      color: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const byPriority = await prisma.maintenancePriority.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  const byCategory = await prisma.maintenanceCategory.findMany({
    select: {
      id: true,
      name: true,
      icon: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    byStatus: byStatus.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      color: item.color,
      count: item._count.tickets,
    })),

    byPriority: byPriority.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      count: item._count.tickets,
    })),

    byCategory: byCategory.map((item) => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      count: item._count.tickets,
    })),
  };
};

export const getKanban = async () => {
  const statuses = await prisma.maintenanceStatus.findMany({
    orderBy: {
      id: "asc",
    },
    include: {
      tickets: {
        include: ticketInclude,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return statuses.map((status) => ({
    id: status.id,
    name: status.name,
    code: status.code,
    color: status.color,
    isFinal: status.isFinal,
    tickets: status.tickets,
  }));
};