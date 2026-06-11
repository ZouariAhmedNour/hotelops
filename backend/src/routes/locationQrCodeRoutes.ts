import { Router } from "express";
import { z } from "zod";
import { locationQrCodeController } from "../controllers/locationQrCodeController";
import { authenticate, authorize } from "../middleware/auth";
import { registry } from "../config/swagger";

const router = Router();

const createQrSchema = z.object({
  locationId: z.coerce.number(),
  label: z.string().optional(),
});

const validate =
  (schema: z.ZodSchema) =>
  (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: result.error.flatten(),
      });
    }

    req.body = result.data;
    next();
  };

/**
 * Swagger - Location QR Codes
 */

registry.registerPath({
  method: "get",
  path: "/api/location-qr-codes",
  tags: ["Location QR Codes"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des codes QR de localisation",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/location-qr-codes/{id}",
  tags: ["Location QR Codes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Détail d’un code QR",
    },
    404: {
      description: "Code QR introuvable",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/location-qr-codes/location/{locationId}",
  tags: ["Location QR Codes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      locationId: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Codes QR liés à une localisation",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/location-qr-codes",
  tags: ["Location QR Codes"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createQrSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Code QR créé avec succès",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/location-qr-codes/{id}/regenerate",
  tags: ["Location QR Codes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Code QR régénéré avec succès",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/location-qr-codes/{id}/toggle-status",
  tags: ["Location QR Codes"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: "Statut du code QR modifié avec succès",
    },
  },
});

/**
 * Routes protégées
 */

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION"),
  locationQrCodeController.getAll
);

router.get(
  "/location/:locationId",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION"),
  locationQrCodeController.getByLocation
);

router.get(
  "/:id",
  authorize("ADMIN", "CHEF_MAINT", "RECEPTION"),
  locationQrCodeController.getById
);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createQrSchema),
  locationQrCodeController.create
);

router.patch(
  "/:id/regenerate",
  authorize("ADMIN"),
  locationQrCodeController.regenerate
);

router.patch(
  "/:id/toggle-status",
  authorize("ADMIN"),
  locationQrCodeController.toggleStatus
);

export default router;