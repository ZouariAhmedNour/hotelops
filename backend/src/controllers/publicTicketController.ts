import { Request, Response } from "express";
import { locationQrCodeService } from "../services/locationQrCodeService";
import { publicTicketService } from "../services/publicTicketService";
import { success, error } from "../utils/response";

const getSingleString = (value: string | string[] | undefined) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
};

export const publicTicketController = {
  async getQrInfo(req: Request, res: Response) {
    const token = getSingleString(req.params.token);

    if (!token) {
      return error(res, "Token QR manquant", 400);
    }

    const data = await locationQrCodeService.getPublicInfoByToken(token);

    return success(res, data, "Informations du QR code récupérées avec succès");
  },

  async createTicket(req: Request, res: Response) {
    const userAgent = getSingleString(req.headers["user-agent"]);

    const ticket = await publicTicketService.createFromQr({
      token: String(req.body.token),
      description: String(req.body.description),
      categoryId: Number(req.body.categoryId),
      priorityId: Number(req.body.priorityId),

      reporterType: String(req.body.reporterType),
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      roomNumber: req.body.roomNumber,
      reservationCode: req.body.reservationCode,

      sourceIp: req.ip,
      userAgent,
    });

    return success(
      res,
      ticket,
      "Ticket créé avec succès depuis le QR code",
      201
    );
  },
};