import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { safetyRuleService } from "../services/safetyRuleService";
import { success } from "../utils/response";

const skillRequirementSchema = z.object({
  skillId: z.coerce.number().int().positive(),
  minimumLevel: z.coerce.number().int().min(1).max(5),
});

const createSafetyRuleSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),

  categoryId: z.coerce.number().int().positive().nullable().optional(),

  triggerKeywords: z.array(z.string().min(1)).optional(),

  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  riskScore: z.coerce.number().int().min(0).max(100),

  requiresCertifiedAgent: z.boolean().optional(),

  minPriorityCode: z.string().optional(),
  minUrgencyLevel: z.coerce.number().int().min(1).max(5).optional(),

  skillRequirements: z.array(skillRequirementSchema).optional(),
  certificationIds: z.array(z.coerce.number().int().positive()).optional(),
});

const updateSafetyRuleSchema = createSafetyRuleSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export const safetyRuleController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rules = await safetyRuleService.list();
      return success(res, rules);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await safetyRuleService.getById(Number(req.params.id));
      return success(res, rule);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createSafetyRuleSchema.parse(req.body);

      const rule = await safetyRuleService.create(body);

      return success(
        res,
        rule,
        "Règle de sécurité créée avec succès.",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateSafetyRuleSchema.parse(req.body);

      const rule = await safetyRuleService.update(
        Number(req.params.id),
        body
      );

      return success(
        res,
        rule,
        "Règle de sécurité modifiée avec succès."
      );
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await safetyRuleService.remove(Number(req.params.id));

      return success(
        res,
        rule,
        "Règle de sécurité désactivée avec succès."
      );
    } catch (error) {
      next(error);
    }
  },
};