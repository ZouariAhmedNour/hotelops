import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { safetyRuleController } from "../controllers/safetyRuleController";
import { registry } from "../config/swagger";

const router = Router();

const safetyRuleSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  triggerKeywords: z.array(z.string()).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  riskScore: z.number().int().min(0).max(100),
  requiresCertifiedAgent: z.boolean().optional(),
  minPriorityCode: z.string().optional(),
  minUrgencyLevel: z.number().int().min(1).max(5).optional(),
  skillRequirements: z
    .array(
      z.object({
        skillId: z.number().int().positive(),
        minimumLevel: z.number().int().min(1).max(5),
      })
    )
    .optional(),
  certificationIds: z.array(z.number().int().positive()).optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/safety-rules",
  tags: ["Maintenance Safety Rules"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des règles de sécurité.",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/safety-rules",
  tags: ["Maintenance Safety Rules"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: safetyRuleSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Règle de sécurité créée.",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/safety-rules/{id}",
  tags: ["Maintenance Safety Rules"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: safetyRuleSchema.partial().extend({
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Règle de sécurité modifiée.",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/safety-rules/{id}",
  tags: ["Maintenance Safety Rules"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Règle de sécurité désactivée.",
    },
  },
});

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", safetyRuleController.list);
router.get("/:id", safetyRuleController.getById);
router.post("/", safetyRuleController.create);
router.put("/:id", safetyRuleController.update);
router.delete("/:id", safetyRuleController.remove);

export default router;