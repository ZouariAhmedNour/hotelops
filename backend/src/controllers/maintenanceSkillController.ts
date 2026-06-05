import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { maintenanceSkillService } from "../services/maintenanceSkillService";
import { success } from "../utils/response";

const createSkillSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

const updateSkillSchema = createSkillSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const maintenanceSkillController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const skills = await maintenanceSkillService.list();
      return success(res, skills);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createSkillSchema.parse(req.body);
      const skill = await maintenanceSkillService.create(body);
      return success(res, skill, "Compétence créée avec succès", 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateSkillSchema.parse(req.body);
      const skill = await maintenanceSkillService.update(Number(req.params.id), body);
      return success(res, skill, "Compétence modifiée avec succès");
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skill = await maintenanceSkillService.remove(Number(req.params.id));
      return success(res, skill, "Compétence supprimée avec succès");
    } catch (err) {
      next(err);
    }
  },
};