import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { agentController } from "../controllers/agentController";
import { registry } from "../config/swagger";

const router = Router();

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

const recommendationQuerySchema = z.object({
  ticketId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  priorityId: z.coerce.number().optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/agents",
  tags: ["Maintenance Agents"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des agents de maintenance",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/agents",
  tags: ["Maintenance Agents"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAgentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Agent créé avec succès",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/agents/recommendations",
  tags: ["Maintenance Agents"],
  security: [{ bearerAuth: [] }],
  request: {
    query: recommendationQuerySchema,
  },
  responses: {
    200: {
      description: "Liste des agents recommandés selon le ticket ou les critères",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/agents/{id}",
  tags: ["Maintenance Agents"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Détail d’un agent maintenance",
    },
    404: {
      description: "Agent introuvable",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/agents/{id}",
  tags: ["Maintenance Agents"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateAgentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Agent modifié avec succès",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/agents/{id}",
  tags: ["Maintenance Agents"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Agent désactivé avec succès",
    },
  },
});

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/recommendations", agentController.recommendations);
router.get("/", agentController.list);
router.get("/:id", agentController.getById);
router.post("/", agentController.create);
router.put("/:id", agentController.update);
router.delete("/:id", agentController.remove);

export default router;