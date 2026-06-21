import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { agentController } from "../controllers/agentController";
import { registry } from "../config/swagger";

const router = Router();

const agentSkillSchema = z.object({
  skillId: z.number().int().positive(),
  level: z.number().int().min(1).max(5),
});

const agentCertificationSchema = z.object({
  certificationId: z.number().int().positive(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  provider: z.string().optional(),
  certificateNumber: z.string().optional(),
  status: z.enum(["VALID", "EXPIRED", "PENDING", "REVOKED"]).optional(),
});

const createAgentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),

  teamId: z.number().int().positive().optional(),
  employeeCode: z.string().optional(),

  level: z.enum(["JUNIOR", "CONFIRMED", "SENIOR", "EXPERT"]),
  shift: z.enum(["DAY", "NIGHT", "MORNING", "AFTERNOON", "ON_CALL"]),

  availabilityStatus: z.string().optional(),
  mainSpecialty: z.string().optional(),

  canHandleCritical: z.boolean().optional(),
  maxActiveTickets: z.number().int().min(1).optional(),

  skills: z.array(agentSkillSchema).optional(),
  skillIds: z.array(z.number().int().positive()).optional(),

  certifications: z.array(agentCertificationSchema).optional(),
});

const updateAgentSchema = createAgentSchema
  .omit({
    email: true,
    password: true,
  })
  .partial()
  .extend({
    isActive: z.boolean().optional(),
    teamId: z.number().int().positive().nullable().optional(),
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
      description:
        "Agents éligibles, agents bloqués et analyse de sécurité du ticket.",
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

router.get(
  "/recommendations",
  authorize("ADMIN", "CHEF_MAINT"),
  agentController.recommendations
);

router.get("/", authorize("ADMIN", "CHEF_MAINT"), agentController.list);

router.get(
  "/:id",
  authorize("ADMIN", "CHEF_MAINT"),
  agentController.getById
);

router.post("/", authorize("ADMIN"), agentController.create);

router.put("/:id", authorize("ADMIN"), agentController.update);

router.delete("/:id", authorize("ADMIN"), agentController.remove);

export default router;