import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { optionalAuthenticate } from '../middleware/optionalAuth';
import { STAFF_ROLES, SERVICE_DOMAINS } from '../types/service.types';
import { ah } from '../utils/asyncHandler';
import * as serviceCategoryController from '../controllers/serviceCategoryController';
import { registry } from '../config/swagger';

const router = Router();

const serviceCategorySchema = z.object({
  name: z.string().min(2),
  domain: z.enum(SERVICE_DOMAINS),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

registry.registerPath({
  method: 'get',
  path: '/api/services/categories',
  tags: ['Service Categories'],
  request: {
    query: z.object({
      includeInactive: z.coerce.boolean().optional(),
    }),
  },
  responses: {
    200: { description: 'Liste des catégories de service.' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/services/categories/{id}',
  tags: ['Service Categories'],
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: { description: 'Détail d\'une catégorie.' },
    404: { description: 'Catégorie introuvable.' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/services/categories',
  tags: ['Service Categories'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: serviceCategorySchema } },
    },
  },
  responses: {
    201: { description: 'Catégorie créée.' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/services/categories/{id}',
  tags: ['Service Categories'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: { 'application/json': { schema: serviceCategorySchema.partial() } },
    },
  },
  responses: {
    200: { description: 'Catégorie modifiée.' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/services/categories/{id}',
  tags: ['Service Categories'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: { description: 'Catégorie désactivée.' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/services/categories/{id}/restore',
  tags: ['Service Categories'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: { description: 'Catégorie restaurée.' },
  },
});

// Lecture publique : la carte des services est consultable sans compte.
router.get('/', optionalAuthenticate, ah(serviceCategoryController.list));
router.get('/:id', optionalAuthenticate, ah(serviceCategoryController.getById));

router.post('/', authenticate, authorize(...STAFF_ROLES), ah(serviceCategoryController.create));
router.put('/:id', authenticate, authorize(...STAFF_ROLES), ah(serviceCategoryController.update));
router.delete('/:id', authenticate, authorize(...STAFF_ROLES), ah(serviceCategoryController.remove));
router.patch(
  '/:id/restore',
  authenticate,
  authorize(...STAFF_ROLES),
  ah(serviceCategoryController.restore),
);

export default router;