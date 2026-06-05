import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { agentService } from "../services/agentService";
import { success } from "../utils/response";

const createAgentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),

  teamId: z.coerce.number().optional(),
  employeeCode: z.string().optional(),
  level: z.enum(["JUNIOR", "CONFIRMED", "SENIOR", "EXPERT"]),
  shift: z.enum(["DAY", "NIGHT", "MORNING", "AFTERNOON", "ON_CALL"]),
  availabilityStatus: z.string().optional(),
  mainSpecialty: z.string().optional(),
  canHandleCritical: z.boolean().optional(),
  maxActiveTickets: z.coerce.number().optional(),
  skillIds: z.array(z.coerce.number()).optional(),
});

const updateAgentSchema = createAgentSchema
  .omit({
    email: true,
    password: true,
  })
  .partial()
  .extend({
    isActive: z.boolean().optional(),
    teamId: z.coerce.number().nullable().optional(),
  });

const recommendationSchema = z.object({
  ticketId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  priorityId: z.coerce.number().optional(),
});

export const agentController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const agents = await agentService.list();
      return success(res, agents);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agent = await agentService.getById(Number(req.params.id));
      return success(res, agent);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createAgentSchema.parse(req.body);
      const agent = await agentService.create(body);
      return success(res, agent, "Agent créé avec succès", 201);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateAgentSchema.parse(req.body);
      const agent = await agentService.update(Number(req.params.id), body);
      return success(res, agent, "Agent modifié avec succès");
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agent = await agentService.remove(Number(req.params.id));
      return success(res, agent, "Agent désactivé avec succès");
    } catch (err) {
      next(err);
    }
  },

  recommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = recommendationSchema.parse(req.query);
      const recommendations = await agentService.getRecommendations(params);
      return success(res, recommendations);
    } catch (err) {
      next(err);
    }
  },
};