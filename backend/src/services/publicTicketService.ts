import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";
import { validateAssetsForLocation } from "./assetService";
import {
  assessTicketSafety,
  persistTicketRiskAssessment,
} from "./safetyAssessmentService";

type CreatePublicTicketInput = {
  token: string;
  description: string;
  categoryId: number;
  priorityId: number;
  assetIds?: number[];

  reporterType: string;
  fullName?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  reservationCode?: string;

  sourceIp?: string;
  userAgent?: string;
};

const generateTicketNumber = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const date = new Date();

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    const ticketNumber = `QR-${y}${m}${d}-${random}`;

    const alreadyExists = await prisma.maintenanceTicket.findUnique({
      where: {
        ticketNumber,
      },
      select: {
        id: true,
      },
    });

    if (!alreadyExists) {
      return ticketNumber;
    }
  }

  throw Object.assign(
    new Error("Impossible de générer une référence ticket unique."),
    {
      statusCode: 500,
    }
  );
};

const publicTicketInclude = {
  location: true,
  category: true,
  priority: true,
  status: true,
  publicReporter: true,
  qrCode: true,
  riskAssessment: true,
  ticketAssets: {
    include: {
      asset: true,
    },
  },
  attachments: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.MaintenanceTicketInclude;

const getActiveQrCode = async (token: string) => {
  const qrCode = await prisma.locationQrCode.findUnique({
    where: {
      token,
    },
    include: {
      location: true,
    },
  });

  if (!qrCode || !qrCode.isActive || !qrCode.location.isActive) {
    throw Object.assign(new Error("Code QR invalide ou désactivé"), {
      statusCode: 404,
    });
  }

  return qrCode;
};

export const publicTicketService = {
  async getQrInfoByToken(token: string) {
    const qrCode = await prisma.locationQrCode.findUnique({
      where: {
        token,
      },
      include: {
        location: {
          include: {
            locationAssets: {
              where: {
                isActive: true,
                asset: {
                  isActive: true,
                },
              },
              include: {
                asset: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!qrCode || !qrCode.isActive || !qrCode.location.isActive) {
      throw Object.assign(new Error("Code QR invalide ou désactivé"), {
        statusCode: 404,
      });
    }

    await prisma.locationQrCode.update({
      where: {
        id: qrCode.id,
      },
      data: {
        scanCount: {
          increment: 1,
        },
        lastScannedAt: new Date(),
      },
    });

    return {
      token: qrCode.token,
      label: qrCode.label,
      location: {
        id: qrCode.location.id,
        name: qrCode.location.name,
        code: qrCode.location.code,
        type: qrCode.location.type,
        zone: qrCode.location.zone,
        floor: qrCode.location.floor,
        roomNumber: qrCode.location.roomNumber,
        description: qrCode.location.description,
        isActive: qrCode.location.isActive,
        assets: qrCode.location.locationAssets.map((locationAsset) => ({
          id: locationAsset.asset.id,
          name: locationAsset.label || locationAsset.asset.name,
          code: locationAsset.asset.code,
          icon: locationAsset.asset.icon,
          category: locationAsset.asset.category,
          quantity: locationAsset.quantity,
          notes: locationAsset.notes,
        })),
      },
    };
  },

  async createFromQr(
    data: CreatePublicTicketInput,
    files: Express.Multer.File[] = []
  ) {
    const qrCode = await getActiveQrCode(data.token);

    const [status, category, priority, ticketNumber] = await Promise.all([
      prisma.maintenanceStatus.findFirst({
        where: {
          code: {
            in: ["OPEN", "NEW"],
          },
        },
        orderBy: {
          id: "asc",
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

      generateTicketNumber(),
    ]);

    if (!status) {
      throw Object.assign(
        new Error("Aucun statut initial trouvé. Ajoute OPEN ou NEW."),
        {
          statusCode: 500,
        }
      );
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

    const selectedAssetIds = await validateAssetsForLocation(
      qrCode.locationId,
      data.assetIds ?? []
    );

    const safetyAssessment = await assessTicketSafety({
      title: `${category.name} - ${qrCode.location.name}`,
      description: data.description,
      urgencyLevel: priority.sortOrder,
      category,
      priority,
      location: qrCode.location,
    });

    const dueAt = priority.slaHours
      ? new Date(Date.now() + priority.slaHours * 3600000)
      : null;

    return prisma.$transaction(async (tx) => {
      const reporter = await tx.publicTicketReporter.create({
        data: {
          reporterType: data.reporterType,
          fullName: data.fullName?.trim() || null,
          phone: data.phone?.trim() || null,
          email: data.email?.trim() || null,
          roomNumber: data.roomNumber?.trim() || null,
          reservationCode: data.reservationCode?.trim() || null,
          sourceIp: data.sourceIp,
          userAgent: data.userAgent,
          metadata: {
            source: "QR_CODE",
            qrCodeId: qrCode.id,
            locationId: qrCode.locationId,
          },
        },
      });

      const ticket = await tx.maintenanceTicket.create({
        data: {
          ticketNumber,
          title: `${category.name} - ${qrCode.location.name}`,
          description: data.description.trim(),

          locationId: qrCode.locationId,
          categoryId: data.categoryId,
          priorityId: data.priorityId,
          statusId: status.id,

          publicReporterId: reporter.id,
          qrCodeId: qrCode.id,

          reportedFrom: "qr_public",
          urgencyLevel: priority.sortOrder,
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
            uploadedByUserId: null,
            photoType: "BEFORE",
          })),
        });
      }

      await tx.maintenanceTicketEvent.create({
        data: {
          ticketId: ticket.id,
          userId: null,
          type: "CREATED_FROM_QR",
          toStatusId: status.id,
          message: "Ticket créé depuis un QR code public.",
          metadata: {
            qrCodeId: qrCode.id,
            locationId: qrCode.locationId,
            reporterType: data.reporterType,
            assetIds: selectedAssetIds,
            riskLevel: safetyAssessment.riskLevel,
            riskScore: safetyAssessment.riskScore,
          },
        },
      });

      const createdTicket = await tx.maintenanceTicket.findUnique({
        where: {
          id: ticket.id,
        },
        include: publicTicketInclude,
      });

      if (!createdTicket) {
        throw Object.assign(
          new Error("Ticket introuvable après création depuis QR."),
          {
            statusCode: 500,
          }
        );
      }

      return createdTicket;
    });
  },

  async listPublicCategories() {
    return prisma.maintenanceCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async listPublicPriorities() {
    return prisma.maintenancePriority.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    });
  },
};