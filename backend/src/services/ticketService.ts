import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateTicketInput = {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom?: string;
  urgencyLevel?: number;
};

export type ListTicketsQuery = {
  page?: string;
  limit?: string;
  statusId?: string;
  priorityId?: string;
  assignedToUserId?: string;
  locationId?: string;
  categoryId?: string;
  search?: string;
};

const ticketInclude: Prisma.MaintenanceTicketInclude = {
  location: true,
  category: true,
  priority: true,
  status: true,
  reportedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  assignedTo: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  _count: { select: { comments: true, attachments: true } },
};

const ticketIncludeWithAttachments: Prisma.MaintenanceTicketInclude = {
  ...ticketInclude,
  attachments: {
    include: {
      uploadedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
};

const generateTicketNumber = async (): Promise<string> => {
  const count = await prisma.maintenanceTicket.count();
  return `TKT-${String(count + 1).padStart(6, '0')}`;
};

export const createTicket = async (
  data: CreateTicketInput,
  userId: number,
  files: Express.Multer.File[] = []
) => {
  const ticketNumber = await generateTicketNumber();

  const priority = await prisma.maintenancePriority.findUnique({
    where: { id: data.priorityId },
  });

  let dueAt: Date | null = null;
  if (priority?.slaHours) {
    dueAt = new Date(Date.now() + priority.slaHours * 3600000);
  }

  const initialStatus = await prisma.maintenanceStatus.findFirst({
    where: { code: 'open' },
  });

  if (!initialStatus) {
    throw Object.assign(new Error('Statut initial introuvable'), {
      statusCode: 500,
    });
  }
const locationExists = await prisma.location.findUnique({
  where: { id: data.locationId },
});

const categoryExists =
  await prisma.maintenanceCategory.findUnique({
    where: { id: data.categoryId },
  });

const priorityExists =
  await prisma.maintenancePriority.findUnique({
    where: { id: data.priorityId },
  });

const userExists = await prisma.user.findUnique({
  where: { id: userId },
});

console.log("locationExists =", locationExists);
console.log("categoryExists =", categoryExists);
console.log("priorityExists =", priorityExists);
console.log("userExists =", userExists);
console.log("initialStatus =", initialStatus);
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.maintenanceTicket.create({
      data: {
        title: data.title,
        description: data.description,
        locationId: data.locationId,
        categoryId: data.categoryId,
        priorityId: data.priorityId,
        reportedFrom: data.reportedFrom,
        urgencyLevel: data.urgencyLevel,
        ticketNumber,
        reportedByUserId: userId,
        statusId: initialStatus.id,
        dueAt,
      },
    });

    if (files.length > 0) {
      await tx.maintenanceAttachment.createMany({
        data: files.map((file) => ({
          ticketId: ticket.id,
          filePath: file.path,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          uploadedByUserId: userId,
        })),
      });
    }

    const created = await tx.maintenanceTicket.findUnique({
      where: { id: ticket.id },
      include: ticketIncludeWithAttachments,
    });

    if (!created) {
      throw Object.assign(new Error('Ticket introuvable après création'), {
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

  const where: Prisma.MaintenanceTicketWhereInput = {};

  if (query.statusId) where.statusId = Number(query.statusId);
  if (query.priorityId) where.priorityId = Number(query.priorityId);
  if (query.assignedToUserId) where.assignedToUserId = Number(query.assignedToUserId);
  if (query.locationId) where.locationId = Number(query.locationId);
  if (query.categoryId) where.categoryId = Number(query.categoryId);

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { ticketNumber: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where,
      skip,
      take: limit,
      include: ticketInclude,
      orderBy: { createdAt: 'desc' },
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
    include: {
      ...ticketInclude,
      comments: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      assignments: {
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
          assignedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { assignedAt: 'desc' },
      },
    },
  });

  if (!ticket) {
    throw Object.assign(new Error('Ticket introuvable'), {
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
  await prisma.maintenanceAssignment.updateMany({
    where: { ticketId, unassignedAt: null },
    data: { unassignedAt: new Date() },
  });

  await prisma.maintenanceAssignment.create({
    data: { ticketId, assignedToUserId, assignedByUserId, note },
  });

  return prisma.maintenanceTicket.update({
    where: { id: ticketId },
    data: { assignedToUserId },
    include: ticketInclude,
  });
};

export const changeStatus = async (
  ticketId: number,
  statusCode: string,
  userId: number
) => {
  const status = await prisma.maintenanceStatus.findUnique({
    where: { code: statusCode },
  });

  if (!status) {
    throw Object.assign(new Error('Statut invalide'), {
      statusCode: 400,
    });
  }

  const updateData: Prisma.MaintenanceTicketUncheckedUpdateInput = {
    statusId: status.id,
  };

  if (statusCode === 'resolved') updateData.resolvedAt = new Date();
  if (statusCode === 'closed' || statusCode === 'cancelled') {
    updateData.closedAt = new Date();
  }

  return prisma.maintenanceTicket.update({
    where: { id: ticketId },
    data: updateData,
    include: ticketInclude,
  });
};