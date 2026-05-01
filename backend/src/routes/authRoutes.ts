import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Schemas
const registerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  roleId: z.number(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// 🔹 Swagger
registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'Compte créé' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Connexion réussie' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Auth'],
  responses: {
    200: { description: 'Utilisateur connecté' },
  },
});

// 🔹 Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;