import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller.js';

const router = Router();

// Public tracking endpoint by bag / user tag (e.g. 48237 or #48237)
router.get('/:tag', TrackingController.trackByIdentifier);

export default router;
