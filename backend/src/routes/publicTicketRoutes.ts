import { Router } from "express";
import { z } from "zod";
import { publicTicketController } from "../controllers/publicTicketController";
import { registry } from "../config/swagger";

const router = Router();

const createPublicTicketSchema = z.object({
  token: z.string().min(10),
  description: z.string().min(5),
  categoryId: z.coerce.number(),
  priorityId: z.coerce.number(),

  reporterType: z.enum(["CLIENT", "STAFF", "VISITOR", "OTHER", "ANONYMOUS"]),

  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  roomNumber: z.string().optional(),
  reservationCode: z.string().optional(),
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
      description: "Informations publiques du QR code",
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
        "application/json": {
          schema: createPublicTicketSchema,
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
  validate(createPublicTicketSchema),
  publicTicketController.createTicket
);

router.get("/categories", publicTicketController.getCategories);
router.get("/priorities", publicTicketController.getPriorities);

export default router;