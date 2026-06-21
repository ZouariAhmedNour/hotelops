import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";

import { publicTicketController } from "../controllers/publicTicketController";
import { upload } from "../config/multer";
import { registry } from "../config/swagger";

const router = Router();

const parseAssetIds = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return trimmed.split(",").map((item) => item.trim());
    }
  }

  return value;
};

const createPublicTicketSchema = z.object({
  token: z.string().min(10),
  description: z.string().min(5),
  categoryId: z.coerce.number().int().positive(),
  priorityId: z.coerce.number().int().positive(),

  assetIds: z.preprocess(
    parseAssetIds,
    z.array(z.coerce.number().int().positive()).max(30)
  ),

  reporterType: z.enum([
    "CLIENT",
    "STAFF",
    "VISITOR",
    "OTHER",
    "ANONYMOUS",
  ]),

  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  roomNumber: z.string().optional(),
  reservationCode: z.string().optional(),
});

const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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

registry.registerPath({
  method: "get",
  path: "/api/public/qr/{token}",
  tags: ["Public QR Tickets"],
  request: {
    params: z.object({
      token: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Informations publiques du QR code et équipements",
    },
    404: {
      description: "QR code invalide ou désactivé",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/public/tickets",
  tags: ["Public QR Tickets"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              token: { type: "string" },
              description: { type: "string" },
              categoryId: { type: "number" },
              priorityId: { type: "number" },
              reporterType: { type: "string" },
              assetIds: {
                type: "string",
                example: "[1,2]",
              },
              fullName: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              roomNumber: { type: "string" },
              reservationCode: { type: "string" },
              files: {
                type: "array",
                items: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ticket créé depuis un QR code public",
    },
    400: {
      description: "Données invalides",
    },
  },
});

router.get("/qr/:token", publicTicketController.getQrInfo);

router.post(
  "/tickets",
  upload.array("files", 10),
  validate(createPublicTicketSchema),
  publicTicketController.createTicket
);

router.get("/categories", publicTicketController.getCategories);

router.get("/priorities", publicTicketController.getPriorities);

export default router;