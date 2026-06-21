import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import * as ticketService from "../services/ticketService";
import { success } from "../utils/response";
import type { AuthRequest } from "../middleware/auth";

const parseAssetIds = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return trimmed.split(",").map((item) => item.trim());
    }
  }

  return value;
};

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  locationId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  priorityId: z.coerce.number().int().positive(),
  reportedFrom: z.string().optional(),
  urgencyLevel: z.coerce.number().int().min(1).max(5).optional(),
  assetIds: z.preprocess(
    parseAssetIds,
    z.array(z.coerce.number().int().positive()).max(30)
  ),
});

const assignSchema = z.object({
  assignedToUserId: z.coerce.number().int().positive(),
  note: z.string().optional(),
});

const changeStatusSchema = z.object({
  statusCode: z.string().min(1),
  message: z.string().optional(),
});

const commentSchema = z.object({
  comment: z.string().min(1),
  isInternal: z.coerce.boolean().optional(),
});

const materialSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().int().positive().optional(),
  unit: z.string().optional(),
});

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error("Non authentifié"), {
        statusCode: 401,
      });
    }

    const data = createSchema.parse(req.body);
    const files = (req.files as Express.Multer.File[]) || [];

    const ticket = await ticketService.createTicket(
      data,
      req.user.userId,
      files
    );

    return success(res, ticket, "Ticket créé", 201);
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ticketService.listTickets(req.query as any);

    return success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ticket = await ticketService.getTicketById(Number(req.params.id));

    return success(res, ticket);
  } catch (error) {
    next(error);
  }
};

export const assign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error("Non authentifié"), {
        statusCode: 401,
      });
    }

    const body = assignSchema.parse(req.body);

    const ticket = await ticketService.assignTicket(
      Number(req.params.id),
      body.assignedToUserId,
      req.user.userId,
      body.note
    );

    return success(res, ticket, "Ticket assigné");
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error("Non authentifié"), {
        statusCode: 401,
      });
    }

    const body = changeStatusSchema.parse(req.body);

    const ticket = await ticketService.changeStatus(
      Number(req.params.id),
      body.statusCode,
      req.user.userId,
      body.message
    );

    return success(res, ticket, "Statut mis à jour");
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error("Non authentifié"), {
        statusCode: 401,
      });
    }

    const body = commentSchema.parse(req.body);

    const comment = await ticketService.addComment(
      Number(req.params.id),
      req.user.userId,
      body.comment,
      body.isInternal ?? false
    );

    return success(res, comment, "Commentaire ajouté", 201);
  } catch (error) {
    next(error);
  }
};

export const addAttachment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error("Non authentifié"), {
        statusCode: 401,
      });
    }

    if (!req.file) {
      throw Object.assign(new Error("Fichier manquant"), {
        statusCode: 400,
      });
    }

    const attachment = await ticketService.addAttachment(
      Number(req.params.id),
      req.user.userId,
      req.file,
      req.body.photoType,
      req.body.caption
    );

    return success(res, attachment, "Pièce jointe ajoutée", 201);
  } catch (error) {
    next(error);
  }
};

export const addMaterial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw Object.assign(new Error("Non authentifié"), {
        statusCode: 401,
      });
    }

    const body = materialSchema.parse(req.body);

    const material = await ticketService.addMaterial(
      Number(req.params.id),
      req.user.userId,
      body
    );

    return success(res, material, "Matériel ajouté", 201);
  } catch (error) {
    next(error);
  }
};

export const statsOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await ticketService.getStatsOverview();

    return success(res, stats);
  } catch (error) {
    next(error);
  }
};

export const statsCharts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const charts = await ticketService.getStatsCharts();

    return success(res, charts);
  } catch (error) {
    next(error);
  }
};

export const kanban = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const kanbanData = await ticketService.getKanban();

    return success(res, kanbanData);
  } catch (error) {
    next(error);
  }
};