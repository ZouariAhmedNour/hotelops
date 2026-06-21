import { Router } from "express";
import { z } from "zod";

import * as ticketController from "../controllers/ticketController";
import {
  authenticate,
  requireMaintenance,
  requireManager,
} from "../middleware/auth";
import { upload } from "../config/multer";
import { registry } from "../config/swagger";

const router = Router();

const assignSchema = z.object({
  assignedToUserId: z.coerce.number(),
  note: z.string().optional(),
});

const changeStatusSchema = z.object({
  statusCode: z.string(),
  message: z.string().optional(),
});

const commentSchema = z.object({
  comment: z.string(),
  isInternal: z.boolean().optional(),
});

const materialSchema = z.object({
  name: z.string(),
  quantity: z.coerce.number().optional(),
  unit: z.string().optional(),
});

registry.registerPath({
  method: "get",
  path: "/api/tickets/stats/overview",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Statistiques globales des tickets",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tickets/stats/charts",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Données graphiques des tickets",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tickets/kanban",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Kanban des tickets par statut",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tickets",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              locationId: { type: "number" },
              categoryId: { type: "number" },
              priorityId: { type: "number" },
              reportedFrom: { type: "string" },
              urgencyLevel: { type: "number" },
              assetIds: {
                type: "string",
                example: "[1,2,3]",
              },
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
      description: "Ticket créé",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tickets",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste des tickets",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tickets/{id}",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Détail ticket",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tickets/{id}/assign",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: assignSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Ticket assigné",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/tickets/{id}/status",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: changeStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Statut mis à jour",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tickets/{id}/comments",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: commentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Commentaire ajouté",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tickets/{id}/attachments",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              file: {
                type: "string",
                format: "binary",
              },
              photoType: {
                type: "string",
              },
              caption: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Pièce jointe ajoutée",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tickets/{id}/materials",
  tags: ["Tickets"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: materialSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Matériel ajouté",
    },
  },
});

router.use(authenticate);

router.get("/stats/overview", requireManager, ticketController.statsOverview);
router.get("/stats/charts", requireManager, ticketController.statsCharts);
router.get("/kanban", requireManager, ticketController.kanban);

router.post("/", upload.array("files", 10), ticketController.create);

router.get("/", requireManager, ticketController.list);
router.get("/:id", ticketController.getOne);

router.post("/:id/assign", requireManager, ticketController.assign);

router.patch(
  "/:id/status",
  requireMaintenance,
  ticketController.changeStatus
);

router.post("/:id/comments", ticketController.addComment);

router.post(
  "/:id/attachments",
  upload.single("file"),
  ticketController.addAttachment
);

router.post("/:id/materials", requireMaintenance, ticketController.addMaterial);

export default router;