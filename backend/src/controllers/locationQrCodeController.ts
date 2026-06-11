import { Request, Response } from "express";
import { locationQrCodeService } from "../services/locationQrCodeService";
import { success } from "../utils/response";

export const locationQrCodeController = {
  async getAll(req: Request, res: Response) {
    const qrCodes = await locationQrCodeService.getAll();
    return success(res, qrCodes);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const qrCode = await locationQrCodeService.getById(id);
    return success(res, qrCode);
  },

  async getByLocation(req: Request, res: Response) {
    const locationId = Number(req.params.locationId);
    const qrCodes = await locationQrCodeService.getByLocation(locationId);
    return success(res, qrCodes);
  },

  async create(req: Request, res: Response) {
    const user = (req as any).user;

    const qrCode = await locationQrCodeService.create({
      locationId: Number(req.body.locationId),
      label: req.body.label,
      createdByUserId: user?.id,
    });

    return success(res, qrCode, "Code QR créé avec succès");
  },

  async regenerate(req: Request, res: Response) {
    const user = (req as any).user;
    const id = Number(req.params.id);

    const qrCode = await locationQrCodeService.regenerate(id, user?.id);

    return success(res, qrCode, "Code QR régénéré avec succès");
  },

  async toggleStatus(req: Request, res: Response) {
    const id = Number(req.params.id);

    const qrCode = await locationQrCodeService.toggleStatus(id);

    return success(res, qrCode, "Statut du code QR modifié");
  },
};