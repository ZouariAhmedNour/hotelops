import { Router } from "express";
import { z } from "zod";

import * as assetController from "../controllers/assetController";
import { registry } from "../config/swagger";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

const assetSchema = z.object({
  name: z.string(),
  code: z.string(),
  category: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/assets",
  tags: ["Assets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des équipements",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/assets/{id}",
  tags: ["Assets"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Détail d’un équipement",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/assets",
  tags: ["Assets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: assetSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Équipement créé",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/assets/{id}",
  tags: ["Assets"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: assetSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Équipement mis à jour",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/assets/{id}",
  tags: ["Assets"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Équipement désactivé",
    },
  },
});

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION", "MAINTENANCE_AGENT"),
  assetController.list
);

router.get(
  "/:id",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION", "MAINTENANCE_AGENT"),
  assetController.getOne
);

router.post("/", authorize("ADMIN"), assetController.create);

router.put("/:id", authorize("ADMIN"), assetController.update);

router.delete("/:id", authorize("ADMIN"), assetController.remove);

export default router;