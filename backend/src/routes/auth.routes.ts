import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = Router();

const loginSchema = z.object({
  credential: z.string().min(1, 'Credencial Google obrigatória'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

router.post('/google', validateRequest({ body: loginSchema }), AuthController.googleLogin);
router.get('/me', authMiddleware, AuthController.getProfile);
router.put('/me', authMiddleware, validateRequest({ body: updateProfileSchema }), AuthController.updateProfile);

export default router;
