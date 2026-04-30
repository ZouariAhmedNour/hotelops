import { Router } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un nouveau compte
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, roleId]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               roleId: { type: integer }
 *     responses:
 *       201: { description: Compte créé }
 *       409: { description: Email déjà utilisé }
 */
router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authenticate, authController.getMe);

export default router;