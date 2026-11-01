import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller.js';

const router = Router();

router.get('/', MaterialController.list);
router.get('/:label', MaterialController.getByLabel);

export default router;
