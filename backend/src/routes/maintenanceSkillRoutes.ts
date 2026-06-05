import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { maintenanceSkillController } from "../controllers/maintenanceSkillController";
import { registry } from "../config/swagger";

const router = Router();

const maintenanceSkillSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  isActive: z.boolean(),
});

const createSkillSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

const updateSkillSchema = createSkillSchema.partial().extend({
  isActive: z.boolean().optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/maintenance-skills",
  tags: ["Maintenance Skills"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des compétences maintenance",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(maintenanceSkillSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/maintenance-skills",
  tags: ["Maintenance Skills"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createSkillSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Compétence créée avec succès",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/maintenance-skills/{id}",
  tags: ["Maintenance Skills"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateSkillSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Compétence modifiée avec succès",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/maintenance-skills/{id}",
  tags: ["Maintenance Skills"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Compétence supprimée avec succès",
    },
  },
});

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", maintenanceSkillController.list);
router.post("/", maintenanceSkillController.create);
router.put("/:id", maintenanceSkillController.update);
router.delete("/:id", maintenanceSkillController.remove);

export default router;