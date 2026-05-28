import { Router } from 'express';
import * as ticketController from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/multer';
import { z } from 'zod';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Schema
const createTicketSchema = z.object({
  title: z.string(),
  description: z.string(),

  locationId: z.coerce.number(),
  categoryId: z.coerce.number(),
  priorityId: z.coerce.number(),

  reportedFrom: z.string().optional(),

  urgencyLevel: z.coerce.number().optional(),
});

// 🔹 Swagger
registry.registerPath({
  method: 'post',
  path: '/api/tickets',
  tags: ['Tickets'],

  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',

            properties: {
              title: {
                type: 'string',
              },

              description: {
                type: 'string',
              },

              locationId: {
                type: 'number',
              },

              categoryId: {
                type: 'number',
              },

              priorityId: {
                type: 'number',
              },

              reportedFrom: {
                type: 'string',
              },

              urgencyLevel: {
                type: 'number',
              },

              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
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
      description: 'Ticket créé',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tickets',
  tags: ['Tickets'],
  responses: {
    200: {
      description: 'Liste des tickets',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tickets/{id}',
  tags: ['Tickets'],
  responses: {
    200: {
      description: 'Détail ticket',
    },
  },
});

// 🔹 Middleware
router.use(authenticate);

// 🔹 Routes

router.post(
  '/',
  upload.array('files', 10),
  ticketController.create
);

router.get('/', ticketController.list);

router.get('/:id', ticketController.getOne);

router.post('/:id/assign', ticketController.assign);

router.patch('/:id/status', ticketController.changeStatus);

export default router;