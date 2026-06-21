import { Router } from "express";
import { z } from "zod";

import * as locationController from "../controllers/locationController";
import { registry } from "../config/swagger";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

const locationAssetSchema = z.object({
  assetId: z.coerce.number(),
  quantity: z.coerce.number().optional(),
  label: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const locationSchema = z.object({
  name: z.string(),
  code: z.string(),
  type: z.enum([
    "ROOM",
    "FLOOR",
    "COMMON_AREA",
    "SERVICE_AREA",
    "OUTDOOR",
    "PARKING",
    "OTHER",
  ]),
  zone: z.string().optional(),
  floor: z.string().optional(),
  roomNumber: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  assets: z.array(locationAssetSchema).optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/locations",
  tags: ["Locations"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des endroits avec équipements",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/locations",
  tags: ["Locations"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: locationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Endroit créé",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/locations/{id}",
  tags: ["Locations"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Détail d’un endroit",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/locations/{id}",
  tags: ["Locations"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: locationSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Endroit mis à jour",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/locations/{id}",
  tags: ["Locations"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Endroit supprimé",
    },
  },
});

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION", "MAINTENANCE_AGENT"),
  locationController.list
);

router.get(
  "/:id",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION", "MAINTENANCE_AGENT"),
  locationController.getOne
);

router.post("/", authorize("ADMIN"), locationController.create);

router.put("/:id", authorize("ADMIN"), locationController.update);

router.delete("/:id", authorize("ADMIN"), locationController.remove);

export default router;