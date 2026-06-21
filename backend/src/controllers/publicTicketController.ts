import { NextFunction, Request, Response } from "express";

import { publicTicketService } from "../services/publicTicketService";
import { success } from "../utils/response";

const getSingleString = (value: string | string[] | undefined) => {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] : value;
};

export const publicTicketController = {
  async getQrInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const token = getSingleString(req.params.token);

      if (!token) {
        throw Object.assign(new Error("Token QR manquant"), {
          statusCode: 400,
        });
      }

      const data = await publicTicketService.getQrInfoByToken(token);

      return success(
        res,
        data,
        "Informations du QR code récupérées avec succès"
      );
    } catch (error) {
      next(error);
    }
  },

  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const userAgent = getSingleString(req.headers["user-agent"]);
      const files = (req.files as Express.Multer.File[]) || [];

      const ticket = await publicTicketService.createFromQr(
        {
          token: String(req.body.token),
          description: String(req.body.description),
          categoryId: Number(req.body.categoryId),
          priorityId: Number(req.body.priorityId),
          assetIds: req.body.assetIds ?? [],

          reporterType: String(req.body.reporterType),
          fullName: req.body.fullName,
          phone: req.body.phone,
          email: req.body.email,
          roomNumber: req.body.roomNumber,
          reservationCode: req.body.reservationCode,

          sourceIp: req.ip,
          userAgent,
        },
        files
      );

      return success(
        res,
        ticket,
        "Ticket créé avec succès depuis le QR code",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await publicTicketService.listPublicCategories();

      return success(res, categories);
    } catch (error) {
      next(error);
    }
  },

  async getPriorities(_req: Request, res: Response, next: NextFunction) {
    try {
      const priorities = await publicTicketService.listPublicPriorities();

      return success(res, priorities);
    } catch (error) {
      next(error);
    }
  },
};