import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { maintenanceTeamService } from "../services/maintenanceTeamService";
import { success } from "../utils/response";

const createTeamSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

const updateTeamSchema = createTeamSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const maintenanceTeamController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const teams = await maintenanceTeamService.list();
      return success(res, teams);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const team = await maintenanceTeamService.getById(Number(req.params.id));
      return success(res, team);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createTeamSchema.parse(req.body);
      const team = await maintenanceTeamService.create(body);
      return success(res, team, "Équipe créée avec succès", 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateTeamSchema.parse(req.body);
      const team = await maintenanceTeamService.update(Number(req.params.id), body);
      return success(res, team, "Équipe modifiée avec succès");
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const team = await maintenanceTeamService.remove(Number(req.params.id));
      return success(res, team, "Équipe supprimée avec succès");
    } catch (err) {
      next(err);
    }
  },
};