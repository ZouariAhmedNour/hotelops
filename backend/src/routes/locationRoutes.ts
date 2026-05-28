import { Router } from 'express';
import * as locationController from '../controllers/locationController';

import { z } from 'zod';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Schemas
const locationSchema = z.object({
  name: z.string(),

  type: z.string(),

  parentId: z.number().optional(),

  hotelId: z.number().optional(),

  code: z.string().optional(),

  isActive: z.boolean().optional(),
});

// 🔹 Swagger

registry.registerPath({
  method: 'post',

  path: '/api/locations',

  tags: ['Locations'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: locationSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: 'Location créée',
    },
  },
});

registry.registerPath({
  method: 'get',

  path: '/api/locations',

  tags: ['Locations'],

  responses: {
    200: {
      description: 'Liste des locations',
    },
  },
});

registry.registerPath({
  method: 'get',

  path: '/api/locations/{id}',

  tags: ['Locations'],

  responses: {
    200: {
      description: 'Location trouvée',
    },
  },
});

registry.registerPath({
  method: 'put',

  path: '/api/locations/{id}',

  tags: ['Locations'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: locationSchema.partial(),
        },
      },
    },
  },

  responses: {
    200: {
      description: 'Location mise à jour',
    },
  },
});

registry.registerPath({
  method: 'delete',

  path: '/api/locations/{id}',

  tags: ['Locations'],

  responses: {
    200: {
      description: 'Location supprimée',
    },
  },
});

// 🔹 Routes

router.post('/', locationController.create);

router.get('/', locationController.list);

router.get('/:id', locationController.getOne);

router.put('/:id', locationController.update);

router.delete('/:id', locationController.remove);

export default router;