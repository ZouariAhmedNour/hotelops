import { Router } from 'express';

import * as priorityController
  from '../controllers/priorityController';

import { z } from 'zod';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Schemas

const prioritySchema = z.object({
  name: z.string(),

  code: z.string(),

  sortOrder: z.number().optional(),

  slaHours: z.number().optional(),
});

// 🔹 Swagger

registry.registerPath({
  method: 'post',

  path: '/api/priorities',

  tags: ['Priorities'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: prioritySchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: 'Priorité créée',
    },
  },
});

registry.registerPath({
  method: 'get',

  path: '/api/priorities',

  tags: ['Priorities'],

  responses: {
    200: {
      description: 'Liste des priorités',
    },
  },
});

registry.registerPath({
  method: 'get',

  path: '/api/priorities/{id}',

  tags: ['Priorities'],

  responses: {
    200: {
      description: 'Priorité trouvée',
    },
  },
});

registry.registerPath({
  method: 'put',

  path: '/api/priorities/{id}',

  tags: ['Priorities'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: prioritySchema.partial(),
        },
      },
    },
  },

  responses: {
    200: {
      description: 'Priorité mise à jour',
    },
  },
});

registry.registerPath({
  method: 'delete',

  path: '/api/priorities/{id}',

  tags: ['Priorities'],

  responses: {
    200: {
      description: 'Priorité supprimée',
    },
  },
});

// 🔹 Routes

router.post('/', priorityController.create);

router.get('/', priorityController.list);

router.get('/:id', priorityController.getOne);

router.put('/:id', priorityController.update);

router.delete('/:id', priorityController.remove);

export default router;