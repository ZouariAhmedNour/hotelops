import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { success } from "../utils/response";
import { agentMobileService } from "../services/agentMobileService";

type AuthRequest = Request & {
  user?: {
    userId: number;
    email: string;
    roleCode: string;
  };
};

const getUserId = (req: AuthRequest) => {
  if (!req.user?.userId) {
    const err = new Error("Non authentifié") as Error & {
      statusCode?: number;
    };

    err.statusCode = 401;
    throw err;
  }

  return req.user.userId;
};

const resolveSchema = z.object({
  resolutionNote: z.string().trim().min(1),
  timeSpentMinutes: z.coerce.number().int().nonnegative().optional(),
  materialsUsed: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1),
        unit: z.string().trim().optional(),
      })
    )
    .optional(),
});

const partialResolveSchema = z.object({
  temporaryFixNote: z.string().trim().min(3),
  followUpTitle: z.string().trim().min(3).max(200).optional(),
  followUpDescription: z.string().trim().min(5).max(5000),

  followUpPriorityId: z.coerce.number().int().positive().optional(),
  followUpCategoryId: z.coerce.number().int().positive().optional(),

  requiresExpertIntervention: z.boolean().optional(),

  expertReason: z.string().trim().min(3).max(2000),

  recommendedSpecialty: z
    .string()
    .trim()
    .max(150)
    .optional(),

  timeSpentMinutes: z.coerce.number().int().nonnegative().optional(),

  materialsUsed: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1),
        unit: z.string().trim().optional(),
      })
    )
    .optional(),
});

export const agentMobileController = {
  getMe: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await agentMobileService.getMe(getUserId(req));
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  getTodayStats: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.getTodayStats(
        getUserId(req)
      );

      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  getTasks: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.getTasks(
        getUserId(req),
        {
          page: Number(req.query.page || 1),
          limit: Number(req.query.limit || 20),
          statusCode: req.query.statusCode
            ? String(req.query.statusCode)
            : undefined,
        }
      );

      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  getTaskById: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.getTaskById(
        getUserId(req),
        Number(req.params.id)
      );

      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  acceptTask: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.acceptTask(
        getUserId(req),
        Number(req.params.id)
      );

      return success(res, data, "Intervention acceptée");
    } catch (err) {
      next(err);
    }
  },

  startTask: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.startTask(
        getUserId(req),
        Number(req.params.id)
      );

      return success(res, data, "Intervention démarrée");
    } catch (err) {
      next(err);
    }
  },

  pauseTask: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.pauseTask(
        getUserId(req),
        Number(req.params.id),
        req.body.reason
      );

      return success(res, data, "Intervention mise en pause");
    } catch (err) {
      next(err);
    }
  },

  pendingParts: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.pendingParts(
        getUserId(req),
        Number(req.params.id),
        req.body.reason
      );

      return success(res, data, "Ticket mis en attente de pièces");
    } catch (err) {
      next(err);
    }
  },

  needHelp: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.needHelp(
        getUserId(req),
        Number(req.params.id),
        req.body.reason
      );

      return success(res, data, "Demande d’aide envoyée");
    } catch (err) {
      next(err);
    }
  },

  updateProgress: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.updateProgress(
        getUserId(req),
        Number(req.params.id),
        Number(req.body.progress),
        req.body.note
      );

      return success(res, data, "Progression mise à jour");
    } catch (err) {
      next(err);
    }
  },

  resolveTask: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = resolveSchema.parse(req.body);

      const data = await agentMobileService.resolveTask(
        getUserId(req),
        Number(req.params.id),
        body
      );

      return success(res, data, "Ticket résolu");
    } catch (err) {
      next(err);
    }
  },

  partialResolveTask: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = partialResolveSchema.parse(req.body);

      const data = await agentMobileService.partialResolveTask(
        getUserId(req),
        Number(req.params.id),
        body
      );

      return success(
        res,
        data,
        "Ticket partiellement résolu et ticket de suivi créé."
      );
    } catch (err) {
      next(err);
    }
  },

  addNote: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await agentMobileService.addNote(
        getUserId(req),
        Number(req.params.id),
        {
          comment: req.body.comment,
          isInternal: req.body.isInternal,
        }
      );

      return success(res, data, "Note ajoutée", 201);
    } catch (err) {
      next(err);
    }
  },

  addPhoto: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file) {
        const err = new Error("Fichier obligatoire") as Error & {
          statusCode?: number;
        };

        err.statusCode = 400;
        throw err;
      }

      const data = await agentMobileService.addPhoto(
        getUserId(req),
        Number(req.params.id),
        req.file,
        {
          photoType: req.body.photoType,
          caption: req.body.caption,
        }
      );

      return success(res, data, "Photo ajoutée", 201);
    } catch (err) {
      next(err);
    }
  },

  updateAvailability: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const availabilityStatus = String(
        req.body.availabilityStatus || ""
      );

      const data = await agentMobileService.updateAvailability(
        getUserId(req),
        availabilityStatus
      );

      return success(res, data, "Disponibilité mise à jour");
    } catch (err) {
      next(err);
    }
  },
};