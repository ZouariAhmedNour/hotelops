import crypto from "crypto";
import QRCode from "qrcode";
import { prisma } from "../config/prisma";

const getBaseUrl = () => {
  return process.env.PUBLIC_QR_BASE_URL || "hotelops://scan";
};

export const locationQrCodeService = {
  async getAll() {
    return prisma.locationQrCode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });
  },

  async getById(id: number) {
    const qrCode = await prisma.locationQrCode.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
          include: {
            category: true,
            priority: true,
            status: true,
            publicReporter: true,
          },
        },
      },
    });

    if (!qrCode) {
      throw new Error("Code QR introuvable");
    }

    const qrImageDataUrl = await QRCode.toDataURL(qrCode.url, {
      width: 900,
      margin: 2,
    });

    return {
      ...qrCode,
      qrImageDataUrl,
    };
  },

  async getByLocation(locationId: number) {
    return prisma.locationQrCode.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
      include: {
        location: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });
  },

  async create(data: {
    locationId: number;
    label?: string;
    createdByUserId?: number;
  }) {
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });

    if (!location) {
      throw new Error("Endroit introuvable");
    }

    const existing = await prisma.locationQrCode.findFirst({
      where: {
        locationId: data.locationId,
        isActive: true,
      },
      include: {
        location: true,
      },
    });

    if (existing) {
      const qrImageDataUrl = await QRCode.toDataURL(existing.url, {
        width: 900,
        margin: 2,
      });

      return {
        ...existing,
        qrImageDataUrl,
        alreadyExists: true,
      };
    }

    const token = crypto.randomBytes(24).toString("hex");
    const url = `${getBaseUrl()}/${token}`;

    const qrCode = await prisma.locationQrCode.create({
      data: {
        locationId: data.locationId,
        label: data.label || `QR - ${location.name}`,
        token,
        url,
        createdByUserId: data.createdByUserId,
      },
      include: {
        location: true,
      },
    });

    const qrImageDataUrl = await QRCode.toDataURL(qrCode.url, {
      width: 900,
      margin: 2,
    });

    return {
      ...qrCode,
      qrImageDataUrl,
      alreadyExists: false,
    };
  },

  async regenerate(id: number, userId?: number) {
    const oldQrCode = await prisma.locationQrCode.findUnique({
      where: { id },
    });

    if (!oldQrCode) {
      throw new Error("Code QR introuvable");
    }

    const token = crypto.randomBytes(24).toString("hex");
    const url = `${getBaseUrl()}/${token}`;

    const qrCode = await prisma.locationQrCode.update({
      where: { id },
      data: {
        token,
        url,
        createdByUserId: userId,
      },
      include: {
        location: true,
      },
    });

    const qrImageDataUrl = await QRCode.toDataURL(qrCode.url, {
      width: 900,
      margin: 2,
    });

    return {
      ...qrCode,
      qrImageDataUrl,
    };
  },

  async toggleStatus(id: number) {
    const qrCode = await prisma.locationQrCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      throw new Error("Code QR introuvable");
    }

    return prisma.locationQrCode.update({
      where: { id },
      data: {
        isActive: !qrCode.isActive,
      },
      include: {
        location: true,
      },
    });
  },

  async getPublicInfoByToken(token: string) {
    const qrCode = await prisma.locationQrCode.findUnique({
      where: { token },
      include: {
        location: true,
      },
    });

    if (!qrCode || !qrCode.isActive) {
      throw new Error("Code QR invalide ou désactivé");
    }

    await prisma.locationQrCode.update({
      where: { id: qrCode.id },
      data: {
        scanCount: {
          increment: 1,
        },
        lastScannedAt: new Date(),
      },
    });

    return {
      token: qrCode.token,
      location: qrCode.location,
      label: qrCode.label,
    };
  },
};