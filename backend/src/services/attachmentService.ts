import { MaintenanceAttachment } from "@prisma/client";
import fs from 'fs';

const prisma = new PrismaClient();

// ================= ADD ATTACHMENT =================
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

// ================= DELETE ATTACHMENT =================
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

  // 🔹 Suppression fichier physique
  if (fs.existsSync(attachment.filePath)) {
    fs.unlinkSync(attachment.filePath);
  }

  return prisma.maintenanceAttachment.delete({
    where: { id },
  });
};