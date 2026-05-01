import { Router } from 'express';
import * as ticketController from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Schema
const createTicketSchema = z.object({
  title: z.string(),
  description: z.string(),
  locationId: z.number(),
  categoryId: z.number(),
  priorityId: z.number(),
  reportedFrom: z.string().optional(),
  urgencyLevel: z.number().optional(),
});

// 🔹 Swagger
registry.registerPath({
  method: 'post',
  path: '/api/tickets',
  tags: ['Tickets'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createTicketSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'Ticket créé' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tickets',
  tags: ['Tickets'],
  responses: {
    200: { description: 'Liste des tickets' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tickets/{id}',
  tags: ['Tickets'],
  responses: {
    200: { description: 'Détail ticket' },
  },
});

// 🔹 Middleware
router.use(authenticate);

// 🔹 Routes
router.post('/', ticketController.create);
router.get('/', ticketController.list);
router.get('/:id', ticketController.getOne);
router.post('/:id/assign', ticketController.assign);
router.patch('/:id/status', ticketController.changeStatus);

export default router;