// src/routes/serviceBookingRoutes.ts
// Réservations génériques : PLAYROOM | POOL | FITNESS | ACTIVITY | CONCIERGERIE
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { STAFF_ROLES, SERVICE_BOOKING_STATUSES } from '../types/service.types';
import { ah } from '../utils/asyncHandler';
import * as serviceBookingController from '../controllers/serviceBookingController';
import { registry } from '../config/swagger';

const router = Router();

const genericBookingSchema = z.object({
  itemId: z.number().int().positive(),
  date: z.coerce.date(),
  startTime: z.string(),
  notes: z.string().optional(),
});

registry.registerPath({
  method: 'get',
  path: '/api/services/bookings',
  tags: ['Service Bookings'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Liste des réservations génériques.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/bookings/{id}',
  tags: ['Service Bookings'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'une réservation.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/bookings',
  tags: ['Service Bookings'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: genericBookingSchema } } } },
  responses: { 201: { description: 'Réservation créée.' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/services/bookings/{id}/status',
  tags: ['Service Bookings'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: {
        'application/json': { schema: z.object({ status: z.enum(SERVICE_BOOKING_STATUSES) }) },
      },
    },
  },
  responses: { 200: { description: 'Statut mis à jour.' } },
});

router.get('/', authenticate, ah(serviceBookingController.list));
router.get('/:id', authenticate, ah(serviceBookingController.getById));
router.post('/', authenticate, ah(serviceBookingController.create));
router.patch(
  '/:id/status',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceBookingController.updateStatus),
);

export default router;