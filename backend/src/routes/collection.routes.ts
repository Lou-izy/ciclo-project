import { Router } from 'express';
import { z } from 'zod';
import { CollectionController } from '../controllers/collection.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { MATERIAL_TYPES } from '../models/types.js';

const router = Router();

const createCollectionSchema = z.object({
  material: z.enum(MATERIAL_TYPES, {
    errorMap: () => ({ message: 'Material deve ser MET, PAP ou PLS' }),
  }),
  weightKg: z.number().positive('Informe o peso verificado do depósito'),
  pointId: z.string().optional(),
});

router.use(authMiddleware);

router.get('/', CollectionController.list);
router.get('/:id', CollectionController.getById);
router.post('/', validateRequest({ body: createCollectionSchema }), CollectionController.create);

export default router;
