import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { maintenanceTeamController } from "../controllers/maintenanceTeamController";
import { registry } from "../config/swagger";

const router = Router();

const maintenanceTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createTeamSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

const updateTeamSchema = createTeamSchema.partial().extend({
  isActive: z.boolean().optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/maintenance-teams",
  tags: ["Maintenance Teams"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des équipes maintenance",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(maintenanceTeamSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/maintenance-teams",
  tags: ["Maintenance Teams"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTeamSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Équipe créée avec succès",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/maintenance-teams/{id}",
  tags: ["Maintenance Teams"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Détail d’une équipe maintenance",
    },
    404: {
      description: "Équipe introuvable",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/maintenance-teams/{id}",
  tags: ["Maintenance Teams"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateTeamSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Équipe modifiée avec succès",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/maintenance-teams/{id}",
  tags: ["Maintenance Teams"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Équipe supprimée avec succès",
    },
  },
});

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", maintenanceTeamController.list);
router.get("/:id", maintenanceTeamController.getById);
router.post("/", maintenanceTeamController.create);
router.put("/:id", maintenanceTeamController.update);
router.delete("/:id", maintenanceTeamController.remove);

export default router;