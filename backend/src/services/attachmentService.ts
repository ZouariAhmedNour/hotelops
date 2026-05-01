import { PrismaClient, MaintenanceAttachment } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// ================= ADD =================
export const addAttachment = async (
  ticketId: number,
  file: Express.Multer.File,
  userId: number
): Promise<MaintenanceAttachment> => {
  return prisma.maintenanceAttachment.create({
    data: {
      ticketId,
      filePath: file.path,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedByUserId: userId,
    },
  });
};

// ================= DELETE =================
export const deleteAttachment = async (
  id: number,
  userId: number
): Promise<MaintenanceAttachment> => {
  const attachment = await prisma.maintenanceAttachment.findUnique({
    where: { id },
  });

  if (!attachment) {
    throw Object.assign(new Error('Pièce jointe introuvable'), {
      statusCode: 404,
    });
  }

  // 🔹 (Optionnel) sécurité basique :
  // empêcher suppression si ce n’est pas le propriétaire
  // 👉 décommente si tu veux activer
  /*
  if (attachment.uploadedByUserId !== userId) {
    throw Object.assign(new Error('Non autorisé'), {
      statusCode: 403,
    });
  }
  */

  // 🔹 Suppression fichier disque
  if (fs.existsSync(attachment.filePath)) {
    fs.unlinkSync(attachment.filePath);
  }

  return prisma.maintenanceAttachment.delete({
    where: { id },
  });
};