import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { optionalAuthenticate } from '../middleware/optionalAuth';
import { STAFF_ROLES, TIME_PATTERN } from '../types/service.types';
import { ah } from '../utils/asyncHandler';
import * as serviceItemController from '../controllers/serviceItemController';
import { registry } from '../config/swagger';
import { upload } from '../config/multer';

const router = Router();

const serviceItemSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  durationMinutes: z.number().int().positive().optional(),
});

const slotSchema = z.object({
  itemId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(TIME_PATTERN),
  endTime: z.string().regex(TIME_PATTERN),
  capacity: z.number().int().positive().optional(),
});

const optionSchema = z.object({
  itemId: z.number().int().positive(),
  name: z.string().min(1),
  extraPrice: z.number().nonnegative().optional(),
});

const supplementSchema = z.object({
  itemId: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

/* Créneaux */
registry.registerPath({
  method: 'get',
  path: '/api/services/items/slots',
  tags: ['Service Items'],
  request: {
    query: z.object({ itemId: z.coerce.number().optional() }),
  },
  responses: { 200: { description: 'Liste des créneaux.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/items/slots',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: slotSchema } } },
  },
  responses: { 201: { description: 'Créneau créé.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/items/slots/{slotId}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ slotId: z.coerce.number() }),
    body: { content: { 'application/json': { schema: slotSchema.partial() } } },
  },
  responses: { 200: { description: 'Créneau modifié.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/items/slots/{slotId}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ slotId: z.coerce.number() }) },
  responses: { 200: { description: 'Créneau supprimé.' } },
});

/* Options */
registry.registerPath({
  method: 'post',
  path: '/api/services/items/options',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: optionSchema } } } },
  responses: { 201: { description: 'Option créée.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/items/options/{optionId}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ optionId: z.coerce.number() }),
    body: { content: { 'application/json': { schema: optionSchema.partial() } } },
  },
  responses: { 200: { description: 'Option modifiée.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/items/options/{optionId}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ optionId: z.coerce.number() }) },
  responses: { 200: { description: 'Option supprimée.' } },
});

/* Suppléments */
registry.registerPath({
  method: 'post',
  path: '/api/services/items/supplements',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: supplementSchema } } } },
  responses: { 201: { description: 'Supplément créé.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/items/supplements/{supplementId}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ supplementId: z.coerce.number() }),
    body: { content: { 'application/json': { schema: supplementSchema.partial() } } },
  },
  responses: { 200: { description: 'Supplément modifié.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/items/supplements/{supplementId}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ supplementId: z.coerce.number() }) },
  responses: { 200: { description: 'Supplément supprimé.' } },
});

/* Articles */
registry.registerPath({
  method: 'get',
  path: '/api/services/items',
  tags: ['Service Items'],
  request: { query: z.object({ categoryId: z.coerce.number().optional() }) },
  responses: { 200: { description: 'Liste des articles.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/items/{id}',
  tags: ['Service Items'],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Détail d\'un article.' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/items',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: serviceItemSchema } } } },
  responses: { 201: { description: 'Article créé.' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/items/{id}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: { content: { 'application/json': { schema: serviceItemSchema.partial() } } },
  },
  responses: { 200: { description: 'Article modifié.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/items/{id}',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.coerce.number() }) },
  responses: { 200: { description: 'Article supprimé.' } },
});

/* Photos */
registry.registerPath({
  method: 'post',
  path: '/api/services/items/{id}/photos',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: { 'multipart/form-data': { schema: z.object({ photo: z.any() }) } },
    },
  },
  responses: { 201: { description: 'Photo ajoutée.' } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/items/{id}/photos',
  tags: ['Service Items'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: { content: { 'application/json': { schema: z.object({ url: z.string() }) } } },
  },
  responses: { 200: { description: 'Photo supprimée.' } },
});

/* Créneaux — déclarés avant '/:id' pour ne pas être capturés par le paramètre. */
router.get('/slots', optionalAuthenticate, ah(serviceItemController.listSlots));
router.post('/slots', authenticate, authorize(...STAFF_ROLES), ah(serviceItemController.addSlot));
router.put(
  '/slots/:slotId',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.updateSlot),
);
router.delete(
  '/slots/:slotId',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.removeSlot),
);

/* Options */
router.post('/options', authenticate, authorize(...STAFF_ROLES), ah(serviceItemController.addOption));
router.put(
  '/options/:optionId',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.updateOption),
);
router.delete(
  '/options/:optionId',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.removeOption),
);

/* Suppléments */
router.post(
  '/supplements',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.addSupplement),
);
router.put(
  '/supplements/:supplementId',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.updateSupplement),
);
router.delete(
  '/supplements/:supplementId',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.removeSupplement),
);

/* Articles */
router.get('/', optionalAuthenticate, ah(serviceItemController.list));
router.get('/:id', optionalAuthenticate, ah(serviceItemController.getById));
router.post('/', authenticate, authorize(...STAFF_ROLES), ah(serviceItemController.create));
router.put('/:id', authenticate, authorize(...STAFF_ROLES), ah(serviceItemController.update));
router.delete('/:id', authenticate, authorize(...STAFF_ROLES), ah(serviceItemController.remove));

/* Photos — sous /:id, donc après les routes fixes mais ça reste sans ambiguïté */
router.post(
  '/:id/photos',
  authenticate,
  authorize(...STAFF_ROLES),
  upload.single('photo'),
  ah(serviceItemController.addPhoto),
);
router.delete(
  '/:id/photos',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceItemController.removePhoto),
);

export default router;