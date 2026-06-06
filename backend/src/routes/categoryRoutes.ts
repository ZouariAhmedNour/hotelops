import { Router } from 'express';

import * as categoryController
  from '../controllers/categoryController';

import { z } from 'zod';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Schemas

const categorySchema = z.object({
  name: z.string(),

  icon: z.string().optional(),

  isActive: z.boolean().optional(),
});

// 🔹 Swagger

registry.registerPath({
  method: 'post',

  path: '/api/categories',

  tags: ['Categories'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: categorySchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: 'Catégorie créée',
    },
  },
});

registry.registerPath({
  method: 'get',

  path: '/api/categories',

  tags: ['Categories'],

  responses: {
    200: {
      description: 'Liste des catégories',
    },
  },
});

registry.registerPath({
  method: 'get',

  path: '/api/categories/{id}',

  tags: ['Categories'],

  responses: {
    200: {
      description: 'Catégorie trouvée',
    },
  },
});

registry.registerPath({
  method: 'put',

  path: '/api/categories/{id}',

  tags: ['Categories'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: categorySchema.partial(),
        },
      },
    },
  },

  responses: {
    200: {
      description: 'Catégorie mise à jour',
    },
  },
});

registry.registerPath({
  method: 'delete',

  path: '/api/categories/{id}',

  tags: ['Categories'],

  responses: {
    200: {
      description: 'Catégorie supprimée',
    },
  },
});

// 🔹 Routes

router.post(
  '/',
  categoryController.create
);

router.get(
  '/',
  categoryController.list
);

router.get(
  '/:id',
  categoryController.getOne
);

router.put(
  '/:id',
  categoryController.update
);

router.delete(
  '/:id',
  categoryController.remove
);

export default router;