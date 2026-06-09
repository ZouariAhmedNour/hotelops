import { Router } from "express";
import { z } from "zod";

import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../config/multer";
import { agentMobileController } from "../controllers/agentMobileController";
import { registry } from "../config/swagger";

const router = Router();

const ticketIdParamSchema = z.object({
  id: z.coerce.number(),
});

const taskListQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  statusCode: z.string().optional(),
});

const reasonBodySchema = z.object({
  reason: z.string().optional(),
});

const progressBodySchema = z.object({
  progress: z.coerce.number().min(0).max(100),
  note: z.string().optional(),
});

const resolveBodySchema = z.object({
  resolutionNote: z.string().min(1),
  timeSpentMinutes: z.coerce.number().optional(),
  materialsUsed: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.coerce.number().min(1),
        unit: z.string().optional(),
      })
    )
    .optional(),
});

const noteBodySchema = z.object({
  comment: z.string().min(1),
  isInternal: z.boolean().optional(),
});

const availabilityBodySchema = z.object({
  availabilityStatus: z.string().min(1),
});

registry.registerPath({
  method: "get",
  path: "/api/agent/me",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Profil de l’agent connecté",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/agent/stats/today",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Statistiques du jour de l’agent connecté",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/agent/tasks",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    query: taskListQuerySchema,
  },
  responses: {
    200: {
      description: "Liste des tickets assignés à l’agent connecté",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/agent/tasks/{id}",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
  },
  responses: {
    200: {
      description: "Détail d’un ticket assigné à l’agent connecté",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/accept",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
  },
  responses: {
    200: {
      description: "Accepter une intervention",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/start",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
  },
  responses: {
    200: {
      description: "Démarrer une intervention",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/pause",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: reasonBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mettre une intervention en pause",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/pending-parts",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: reasonBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mettre un ticket en attente de pièces",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/need-help",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: reasonBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Signaler un besoin d’aide",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/progress",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: progressBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mettre à jour la progression",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/tasks/{id}/resolve",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: resolveBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Résoudre une intervention",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/agent/tasks/{id}/notes",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: noteBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ajouter une note au ticket",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/agent/tasks/{id}/photos",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    params: ticketIdParamSchema,
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
            required: ["file"],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ajouter une photo au ticket",
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/agent/availability",
  tags: ["Agent Mobile"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: availabilityBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mettre à jour la disponibilité de l’agent",
    },
  },
});

router.use(authenticate);
router.use(authorize("MAINTENANCE_AGENT", "MAINTENANCE"));

router.get("/me", agentMobileController.getMe);
router.get("/stats/today", agentMobileController.getTodayStats);

router.get("/tasks", agentMobileController.getTasks);
router.get("/tasks/:id", agentMobileController.getTaskById);

router.patch("/tasks/:id/accept", agentMobileController.acceptTask);
router.patch("/tasks/:id/start", agentMobileController.startTask);
router.patch("/tasks/:id/pause", agentMobileController.pauseTask);
router.patch("/tasks/:id/pending-parts", agentMobileController.pendingParts);
router.patch("/tasks/:id/need-help", agentMobileController.needHelp);
router.patch("/tasks/:id/progress", agentMobileController.updateProgress);
router.patch("/tasks/:id/resolve", agentMobileController.resolveTask);

router.post("/tasks/:id/notes", agentMobileController.addNote);

router.post(
  "/tasks/:id/photos",
  upload.single("file"),
  agentMobileController.addPhoto
);

router.patch("/availability", agentMobileController.updateAvailability);

export default router;