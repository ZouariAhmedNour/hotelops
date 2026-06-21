import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { certificationService } from "../services/certificationService";
import { success } from "../utils/response";

const createCertificationSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  requiresExpiry: z.boolean().optional(),
  validityMonths: z.coerce.number().int().positive().nullable().optional(),
  skillIds: z.array(z.coerce.number().int().positive()).optional(),
});

const updateCertificationSchema = createCertificationSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export const certificationController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const certifications = await certificationService.list();
      return success(res, certifications);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certification = await certificationService.getById(
        Number(req.params.id)
      );

      return success(res, certification);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createCertificationSchema.parse(req.body);

      const certification = await certificationService.create(body);

      return success(
        res,
        certification,
        "Certification créée avec succès.",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateCertificationSchema.parse(req.body);

      const certification = await certificationService.update(
        Number(req.params.id),
        body
      );

      return success(
        res,
        certification,
        "Certification modifiée avec succès."
      );
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certification = await certificationService.remove(
        Number(req.params.id)
      );

      return success(
        res,
        certification,
        "Certification désactivée avec succès."
      );
    } catch (error) {
      next(error);
    }
  },
};