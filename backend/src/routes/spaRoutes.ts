import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { optionalAuthenticate } from '../middleware/optionalAuth';
import {
  STAFF_ROLES,
  THERAPIST_GENDERS,
  GENDER_PREFERENCES,
  SERVICE_BOOKING_STATUSES,
} from '../types/service.types';
import { ah } from '../utils/asyncHandler';
import * as spaController from '../controllers/spaController';
import { registry } from '../config/swagger';

const router = Router();

const therapistSchema = z.object({
  name: z.string().min(2),
  gender: z.enum(THERAPIST_GENDERS),
});

const treatmentSchema = z.object({
  name: z.string().min(2),
  durationMinutes: z.number().int().positive(),
  price: z.number().nonnegative(),
  genderPreference: z.enum(GENDER_PREFERENCES).optional(),
});

const bookingSchema = z.object({
  treatmentId: z.number().int().positive(),
  therapistId: z.number().int().positive().optional(),
  date: z.coerce.date(),
  startTime: z.string(),
  genderPreference: z.enum(GENDER_PREFERENCES).optional(),
});

/* Thérapeutes */
registry.registerPath({
  method: 'get',
  path: '/api/services/spa/therapists',
  tags: ['Spa'],
  responses: { 200: { description: 'Liste des thérapeutes.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/spa/therapists',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: therapistSchema } } } },
  responses: { 201: { description: 'Thérapeute créé.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/spa/therapists/{id}',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: { content: { 'application/json': { schema: therapistSchema.partial() } } },
  },
  responses: { 200: { description: 'Thérapeute modifié.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/spa/therapists/{id}',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Thérapeute supprimé.' } },
});

/* Fiches de soin */
registry.registerPath({
  method: 'get',
  path: '/api/services/spa/treatments',
  tags: ['Spa'],
  responses: { 200: { description: 'Liste des soins.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/spa/treatments/{id}',
  tags: ['Spa'],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'un soin.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/spa/treatments',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: treatmentSchema } } } },
  responses: { 201: { description: 'Soin créé.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/spa/treatments/{id}',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: { content: { 'application/json': { schema: treatmentSchema.partial() } } },
  },
  responses: { 200: { description: 'Soin modifié.' } },
});

/* Réservations */
registry.registerPath({
  method: 'get',
  path: '/api/services/spa/bookings',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Liste des réservations spa.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/spa/bookings/{id}',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'une réservation spa.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/spa/bookings',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: bookingSchema } } } },
  responses: { 201: { description: 'Réservation spa créée.' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/services/spa/bookings/{id}/status',
  tags: ['Spa'],
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

registry.registerPath({
  method: 'patch',
  path: '/api/services/spa/bookings/{id}/therapist',
  tags: ['Spa'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: {
        'application/json': { schema: z.object({ therapistId: z.number().int().positive() }) },
      },
    },
  },
  responses: { 200: { description: 'Thérapeute assigné.' } },
});

/* Thérapeutes */
router.get('/therapists', optionalAuthenticate, ah(spaController.listTherapists));
router.post(
  '/therapists',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.createTherapist),
);
router.put(
  '/therapists/:id',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.updateTherapist),
);
router.delete(
  '/therapists/:id',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.removeTherapist),
);

/* Fiches de soin */
router.get('/treatments', optionalAuthenticate, ah(spaController.listTreatments));
router.get('/treatments/:id', ah(spaController.getTreatmentById));
router.post(
  '/treatments',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.createTreatment),
);
router.put(
  '/treatments/:id',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.updateTreatment),
);

/* Réservations */
router.get('/bookings', authenticate, ah(spaController.listBookings));
router.get('/bookings/:id', authenticate, ah(spaController.getBookingById));
router.post('/bookings', authenticate, ah(spaController.createBooking));
router.patch(
  '/bookings/:id/status',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.updateBookingStatus),
);
router.patch(
  '/bookings/:id/therapist',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(spaController.assignTherapist),
);

export default router;