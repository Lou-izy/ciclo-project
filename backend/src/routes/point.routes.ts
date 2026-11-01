import { Router } from 'express';
import { PointController } from '../controllers/point.controller.js';

const router = Router();

router.get('/', PointController.list);
router.get('/:id', PointController.getById);

export default router;
