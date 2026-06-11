import { prisma } from "../config/prisma";

const generateTicketNumber = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `QR-${y}${m}${d}-${random}`;
};

export const publicTicketService = {
  async createFromQr(data: {
    token: string;
    description: string;
    categoryId: number;
    priorityId: number;

    reporterType: string;
    fullName?: string;
    phone?: string;
    email?: string;
    roomNumber?: string;
    reservationCode?: string;

    sourceIp?: string;
    userAgent?: string;
  }) {
    const qrCode = await prisma.locationQrCode.findUnique({
      where: { token: data.token },
      include: {
        location: true,
      },
    });

    if (!qrCode || !qrCode.isActive) {
      throw new Error("Code QR invalide ou désactivé");
    }

    const status = await prisma.maintenanceStatus.findFirst({
      where: {
        code: {
          in: ["OPEN", "NEW"],
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    if (!status) {
      throw new Error("Aucun statut initial trouvé. Ajoute un statut OPEN ou NEW.");
    }

    const category = await prisma.maintenanceCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Catégorie introuvable");
    }

    const priority = await prisma.maintenancePriority.findUnique({
      where: { id: data.priorityId },
    });

    if (!priority) {
      throw new Error("Priorité introuvable");
    }

    const reporter = await prisma.publicTicketReporter.create({
      data: {
        reporterType: data.reporterType,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        roomNumber: data.roomNumber,
        reservationCode: data.reservationCode,
        sourceIp: data.sourceIp,
        userAgent: data.userAgent,
        metadata: {
          source: "QR_CODE",
          qrCodeId: qrCode.id,
          locationId: qrCode.locationId,
        },
      },
    });

    const ticketNumber = generateTicketNumber();

    const title = `${category.name} - ${qrCode.location.name}`;

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        title,
        description: data.description,
        locationId: qrCode.locationId,
        categoryId: data.categoryId,
        priorityId: data.priorityId,
        statusId: status.id,
        publicReporterId: reporter.id,
        qrCodeId: qrCode.id,
        reportedFrom: "qr_public",
        urgencyLevel: priority.sortOrder,
      },
      include: {
        location: true,
        category: true,
        priority: true,
        status: true,
        publicReporter: true,
        qrCode: true,
      },
    });

    await prisma.maintenanceTicketEvent.create({
      data: {
        ticketId: ticket.id,
        userId: null,
        type: "CREATED_FROM_QR",
        toStatusId: status.id,
        message: "Ticket créé depuis un QR code public sans authentification.",
        metadata: {
          qrCodeId: qrCode.id,
          locationId: qrCode.locationId,
          reporterType: data.reporterType,
        },
      },
    });

    return ticket;
  },
};