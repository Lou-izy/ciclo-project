import { Router } from 'express';
import { ImpactController } from '../controllers/impact.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ImpactController.getMyImpact);

export default router;
