import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { certificationController } from "../controllers/certificationController";
import { registry } from "../config/swagger";

const router = Router();

const certificationSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  requiresExpiry: z.boolean().optional(),
  validityMonths: z.number().int().positive().nullable().optional(),
  skillIds: z.array(z.number().int().positive()).optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/certifications",
  tags: ["Maintenance Certifications"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des certifications.",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/certifications",
  tags: ["Maintenance Certifications"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: certificationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Certification créée.",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/certifications/{id}",
  tags: ["Maintenance Certifications"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: certificationSchema.partial().extend({
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Certification mise à jour.",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/certifications/{id}",
  tags: ["Maintenance Certifications"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Certification désactivée.",
    },
  },
});

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", certificationController.list);
router.get("/:id", certificationController.getById);
router.post("/", certificationController.create);
router.put("/:id", certificationController.update);
router.delete("/:id", certificationController.remove);

export default router;