import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { STAFF_ROLES, SERVICE_ORDER_STATUSES } from '../types/service.types';
import { ah } from '../utils/asyncHandler';
import * as roomServiceController from '../controllers/roomServiceController';
import { registry } from '../config/swagger';

const router = Router();

const roomServiceOrderSchema = z.object({
  roomNumber: z.string().min(1),
  items: z.array(
    z.object({
      itemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      optionIds: z.array(z.number().int().positive()).optional(),
      supplementIds: z.array(z.number().int().positive()).optional(),
    }),
  ),
  notes: z.string().optional(),
});

registry.registerPath({
  method: 'post',
  path: '/api/services/room-service/orders',
  tags: ['Room Service'],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: roomServiceOrderSchema } } },
  },
  responses: { 201: { description: 'Commande room service créée.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/room-service/orders',
  tags: ['Room Service'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({ mine: z.coerce.boolean().optional() }),
  },
  responses: { 200: { description: 'Liste des commandes room service.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/room-service/orders/{id}',
  tags: ['Room Service'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'une commande.' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/services/room-service/orders/{id}/status',
  tags: ['Room Service'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({ status: z.enum(SERVICE_ORDER_STATUSES) }),
        },
      },
    },
  },
  responses: { 200: { description: 'Statut de la commande mis à jour.' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/services/room-service/orders/{id}/paid',
  tags: ['Room Service'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Commande marquée comme payée.' } },
});

// Le client commande depuis l'app mobile
router.post('/orders', authenticate, ah(roomServiceController.create));

// Back-office + suivi client (filtre ?mine=true)
router.get('/orders', authenticate, ah(roomServiceController.list));
router.get('/orders/:id', authenticate, ah(roomServiceController.getById));

router.patch(
  '/orders/:id/status',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(roomServiceController.updateStatus),
);
router.patch(
  '/orders/:id/paid',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(roomServiceController.markPaid),
);

export default router;