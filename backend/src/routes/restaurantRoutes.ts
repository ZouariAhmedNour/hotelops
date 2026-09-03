// src/routes/restaurantRoutes.ts
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { optionalAuthenticate } from '../middleware/optionalAuth';
import { STAFF_ROLES, SERVICE_BOOKING_STATUSES } from '../types/service.types';
import { ah } from '../utils/asyncHandler';
import * as restaurantController from '../controllers/restaurantController';
import { registry } from '../config/swagger';

const router = Router();

const roomSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const tableSchema = z.object({
  roomId: z.number().int().positive(),
  number: z.string().min(1),
  capacity: z.number().int().positive(),
});

const bookingSchema = z.object({
  tableId: z.number().int().positive(),
  date: z.coerce.date(),
  startTime: z.string(),
  partySize: z.number().int().positive(),
  notes: z.string().optional(),
});

/* Salles */
registry.registerPath({
  method: 'get',
  path: '/api/services/restaurant/rooms',
  tags: ['Restaurant'],
  responses: { 200: { description: 'Liste des salles.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/restaurant/rooms/{id}',
  tags: ['Restaurant'],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'une salle.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/restaurant/rooms',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: roomSchema } } } },
  responses: { 201: { description: 'Salle créée.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/restaurant/rooms/{id}',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: { content: { 'application/json': { schema: roomSchema.partial() } } },
  },
  responses: { 200: { description: 'Salle modifiée.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/restaurant/rooms/{id}',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Salle supprimée.' } },
});

/* Tables */
registry.registerPath({
  method: 'get',
  path: '/api/services/restaurant/tables/available',
  tags: ['Restaurant'],
  request: {
    query: z.object({
      date: z.string(),
      startTime: z.string(),
      partySize: z.coerce.number().optional(),
    }),
  },
  responses: { 200: { description: 'Tables disponibles.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/restaurant/tables',
  tags: ['Restaurant'],
  request: { query: z.object({ roomId: z.coerce.number().optional() }) },
  responses: { 200: { description: 'Liste des tables.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/restaurant/tables',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: tableSchema } } } },
  responses: { 201: { description: 'Table créée.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/restaurant/tables/{id}',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: { content: { 'application/json': { schema: tableSchema.partial() } } },
  },
  responses: { 200: { description: 'Table modifiée.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/restaurant/tables/{id}',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Table supprimée.' } },
});

/* Réservations */
registry.registerPath({
  method: 'get',
  path: '/api/services/restaurant/bookings',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Liste des réservations.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/restaurant/bookings/{id}',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'une réservation.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/restaurant/bookings',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: bookingSchema } } } },
  responses: { 201: { description: 'Réservation créée.' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/services/restaurant/bookings/{id}/status',
  tags: ['Restaurant'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: {
        'application/json': { schema: z.object({ status: z.enum(SERVICE_BOOKING_STATUSES) }) },
      },
    },
  },
  responses: { 200: { description: 'Statut de la réservation mis à jour.' } },
});

/* Salles */
router.get('/rooms', optionalAuthenticate, ah(restaurantController.listRooms));
router.get('/rooms/:id', ah(restaurantController.getRoomById));
router.post('/rooms', authenticate, authorize(...STAFF_ROLES), ah(restaurantController.createRoom));
router.put('/rooms/:id', authenticate, authorize(...STAFF_ROLES), ah(restaurantController.updateRoom));
router.delete(
  '/rooms/:id',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(restaurantController.removeRoom),
);

/* Tables — '/tables/available' avant '/tables/:id' */
router.get('/tables/available', ah(restaurantController.availableTables));
router.get('/tables', optionalAuthenticate, ah(restaurantController.listTables));
router.post(
  '/tables',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(restaurantController.createTable),
);
router.put(
  '/tables/:id',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(restaurantController.updateTable),
);
router.delete(
  '/tables/:id',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(restaurantController.removeTable),
);

/* Réservations */
router.get('/bookings', authenticate, ah(restaurantController.listBookings));
router.get('/bookings/:id', authenticate, ah(restaurantController.getBookingById));
router.post('/bookings', authenticate, ah(restaurantController.createBooking));
router.patch(
  '/bookings/:id/status',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(restaurantController.updateBookingStatus),
);

export default router;